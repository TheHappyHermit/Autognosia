#!/usr/bin/env python3
"""
Autognosia Command Deck — Executive Dashboard Backend Server.
Lightweight FastAPI application serving REST endpoints and static UI assets.
Default Port: 8088
"""

import os
import sys
import json
import sqlite3
import subprocess
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional
import requests

def _ensure_web_deps() -> None:
    """Ensure fastapi/uvicorn are importable in the current interpreter.

    Prefers the dedicated dashboard venv (${HOME}/.autognosia/dashboard-venv) and
    re-execs into it. On PEP 668 "externally-managed-environment" systems
    (Homebrew, most distro Pythons) `pip install` into the system interpreter
    is blocked, so bootstrapping always happens inside an isolated venv.
    """
    try:
        import fastapi  # noqa: F401
        import uvicorn  # noqa: F401
        return
    except ImportError:
        pass

    venv_dir = Path.home() / ".autognosia" / "dashboard-venv"
    venv_python = venv_dir / "bin" / "python"

    # Already running under the dashboard venv but deps went missing? Repair in place.
    if venv_python.exists():
        if Path(sys.executable).resolve() != venv_python.resolve():
            os.execv(str(venv_python), [str(venv_python), *sys.argv])
    else:
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)

    subprocess.run(
        [str(venv_python), "-m", "pip", "install", "--quiet", "fastapi", "uvicorn"],
        check=True,
    )
    if Path(sys.executable).resolve() != venv_python.resolve():
        os.execv(str(venv_python), [str(venv_python), *sys.argv])


_ensure_web_deps()

from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import uvicorn

# Resolve root directories
REPO_ROOT = Path(__file__).resolve().parent.parent
DASHBOARD_DIR = REPO_ROOT / "dashboard"
AUTOGNOSIA_HOME = Path(os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia")))
ORGANIZER_DB = Path(os.environ.get("ORGANIZER_DB_PATH", str(AUTOGNOSIA_HOME / "personal-organizer" / "data" / "organizer.db")))
AUTOGNOSIA_DB = AUTOGNOSIA_HOME / "autognosia.db"
ACTIVE_WIKI = AUTOGNOSIA_HOME / "active-wiki"
ORACLE_BRAIN = AUTOGNOSIA_HOME / "oracle" / "brain"
DOCKER_SOCKET = os.environ.get("DOCKER_SOCKET", "/var/run/docker.sock")
CONFIG_PATH = Path(os.environ.get("CONFIG_PATH", "/config/services.yaml"))

# Import local helper bridges
sys.path.insert(0, str(REPO_ROOT / "scripts"))
import calendar_sync
import email_sync
import check_reminders
from notify_dispatcher import dispatcher

import asyncio

app = FastAPI(title="Autognosia Command Deck API", version="2.6.0")

# CORS: explicit origins required when credentials are enabled.
# Override via CORS_ORIGINS env var (comma-separated) — defaults to same-origin only.
_cors_origins_env = os.environ.get("CORS_ORIGINS", "")
if _cors_origins_env.strip():
    _cors_origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
else:
    _cors_origins = []  # same-origin only (no cross-origin credentialed requests)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=bool(_cors_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Background reminder dispatcher task
@app.on_event("startup")
async def start_reminder_background_worker():
    async def reminder_loop():
        while True:
            try:
                check_reminders.check_timed_reminders()
            except Exception as e:
                print(f"[ERROR] Background reminder worker error: {e}")
            await asyncio.sleep(15)

    asyncio.create_task(reminder_loop())

def _initialize_demo_databases():
    """Legacy no-op: demo data removed. Real databases only."""
    pass


def get_organizer_conn() -> sqlite3.Connection:
    """Connect to the real organizer database."""
    db_path = ORGANIZER_DB
    if not db_path.exists():
        # Try alternative paths
        alternatives = [
            Path.home() / ".autognosia" / "personal-organizer" / "data" / "organizer.db",
            Path.home() / ".autognosia" / "organizer.db",
        ]
        for alt in alternatives:
            if alt.exists():
                db_path = alt
                break
    if not db_path.parent.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    # Enable foreign keys
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def get_autognosia_conn() -> sqlite3.Connection:
    if not AUTOGNOSIA_DB.exists():
        import init_autognosia_db
        init_autognosia_db.init_autognosia_db()
    conn = sqlite3.connect(str(AUTOGNOSIA_DB))
    conn.row_factory = sqlite3.Row
    return conn

# ── API Endpoints ─────────────────────────────────────────────────────────────

@app.get("/api/system")
def get_system_stats():
    """System-level metrics for hero stats row: CPU, RAM, Disk, Network, Agents, Uptime."""
    import psutil
    import time

    # Get boot time for uptime calculation
    boot_time = time.time() - psutil.boot_time()
    uptime_days = int(boot_time) // 86400

    # Simple network estimation from counters (not perfect but gives a number)
    net_io = psutil.net_io_counters()
    network_gb = round(net_io.bytes_recv / (1024 * 1024 * 1024), 2)  # cumulative GB received

    # Active agents — check Hermes gateway
    active_agents = 1  # Hermes agent itself is always "active"

    return {
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "ram_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "network_gb": network_gb,
        "active_agents": active_agents,
        "uptime_days": uptime_days,
    }


@app.get("/api/health")
def healthcheck():
    """Healthcheck endpoint for Docker and monitoring. Verifies DB is actually usable."""
    docker_ok = Path(DOCKER_SOCKET).exists() if DOCKER_SOCKET else False
    db_ok = False
    if ORGANIZER_DB.exists():
        try:
            conn = sqlite3.connect(str(ORGANIZER_DB))
            conn.execute("SELECT 1 FROM tasks LIMIT 1")
            conn.close()
            db_ok = True
        except Exception:
            db_ok = False
    status = "ok" if db_ok else "degraded"
    return JSONResponse({
        "status": status,
        "docker": docker_ok,
        "database": db_ok,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


@app.get("/api/overview")
def get_overview():
    """Aggregated real-time metrics for top executive status bar."""
    conn = get_organizer_conn()
    cur = conn.cursor()

    # Task metrics
    total_tasks = cur.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
    active_tasks = cur.execute("SELECT COUNT(*) FROM tasks WHERE status != 'completed'").fetchone()[0]
    critical_tasks = cur.execute("SELECT COUNT(*) FROM tasks WHERE priority = 'critical' AND status != 'completed'").fetchone()[0]
    completed_tasks = cur.execute("SELECT COUNT(*) FROM tasks WHERE status = 'completed'").fetchone()[0]

    # Intentions
    active_intentions = cur.execute("SELECT COUNT(*) FROM intentions WHERE status IN ('dormant', 'active', 'pending')").fetchone()[0]

    # Reminders
    pending_reminders = cur.execute("SELECT COUNT(*) FROM reminders WHERE status IN ('pending', 'snoozed')").fetchone()[0]

    # Active projects
    active_projects = cur.execute("SELECT COUNT(*) FROM projects WHERE status = 'active'").fetchone()[0]

    conn.close()

    # Emails
    emails = email_sync.get_triaged_emails()
    unread_emails = sum(1 for e in emails if not e.get("read", False))
    critical_emails = sum(1 for e in emails if e.get("priority") == "critical")

    # Calendar items today
    today_str = datetime.now().strftime("%Y-%m-%d")
    events = calendar_sync.get_all_schedule_events()
    today_events = [e for e in events if str(e.get("start", "")).startswith(today_str)]

    # Experience Index metrics
    c_conn = get_autognosia_conn()
    c_cur = c_conn.cursor()
    operations_count = c_cur.execute("SELECT COUNT(*) FROM operations").fetchone()[0]
    verifications_count = c_cur.execute("SELECT COUNT(*) FROM verification_checks").fetchone()[0]
    c_conn.close()

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "active_tasks": active_tasks,
            "critical_tasks": critical_tasks,
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks,
            "active_intentions": active_intentions,
            "pending_reminders": pending_reminders,
            "active_projects": active_projects,
            "unread_emails": unread_emails,
            "critical_emails": critical_emails,
            "today_events_count": len(today_events),
            "operations_count": operations_count,
            "verifications_count": verifications_count
        }
    }

@app.get("/api/briefing")
def get_daily_briefing():
    """Returns today's executive briefing synthesis and prompt-me reflection."""
    now = datetime.now()
    date_str = now.strftime("%A, %B %d, %Y")
    today_str = now.strftime("%Y-%m-%d")

    conn = get_organizer_conn()
    cur = conn.cursor()

    active_tasks = cur.execute(
        "SELECT COUNT(*) FROM tasks WHERE status != 'completed'"
    ).fetchone()[0]
    due_today = cur.execute(
        "SELECT COUNT(*) FROM tasks WHERE status != 'completed' AND date(due_at) = ?",
        (today_str,)
    ).fetchone()[0]
    overdue = cur.execute(
        "SELECT COUNT(*) FROM tasks WHERE status != 'completed' AND date(due_at) < ?",
        (today_str,)
    ).fetchone()[0]
    active_projects = cur.execute(
        "SELECT COUNT(*) FROM projects WHERE status = 'active'"
    ).fetchone()[0]

    top_priorities = [
        dict(r) for r in cur.execute(
            """
            SELECT id, title, priority, status, due_at
            FROM tasks
            WHERE status != 'completed'
            ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, due_at ASC
            LIMIT 3
            """
        ).fetchall()
    ]

    conn.close()

    if active_tasks == 0 and active_projects == 0:
        summary = "Nothing is scheduled today: no open tasks and no active projects."
    else:
        task_word = "task" if active_tasks == 1 else "tasks"
        project_word = "project" if active_projects == 1 else "projects"
        summary = (
            f"{active_tasks} open {task_word}, {due_today} due today, "
            f"{overdue} overdue, across {active_projects} active {project_word}."
        )

    return {
        "date": date_str,
        "summary": summary,
        "top_priorities": top_priorities,
        "prompt_me": "What single unblocked operational task would yield the greatest leverage for your goals today?",
        "counts": {
            "active_tasks": active_tasks,
            "due_today": due_today,
            "overdue": overdue,
            "active_projects": active_projects,
        }
    }

@app.get("/api/tasks")
def get_tasks(status: Optional[str] = None, priority: Optional[str] = None):
    conn = get_organizer_conn()
    cur = conn.cursor()
    
    query = "SELECT t.*, p.name as project_name FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE 1=1"
    params = []
    
    if status:
        query += " AND t.status = ?"
        params.append(status)
    if priority:
        query += " AND t.priority = ?"
        params.append(priority)
        
    query += " ORDER BY CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, t.due_at ASC"
    
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@app.post("/api/tasks")
def create_task(payload: Dict[str, Any] = Body(...)):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
        
    status = payload.get("status", "active")
    if status not in ["active", "next", "in_progress", "waiting", "completed", "cancelled", "blocked"]:
        status = "active"
        
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO tasks (title, description, status, priority, due_at, project_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    """, (
        title,
        payload.get("description", ""),
        status,
        payload.get("priority", "medium"),
        payload.get("due_at"),
        payload.get("project_id")
    ))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, "status": "created"}

@app.patch("/api/tasks/{task_id}")
def update_task(task_id: int, payload: Dict[str, Any] = Body(...)):
    conn = get_organizer_conn()
    cur = conn.cursor()
    
    allowed = ["title", "description", "status", "priority", "due_at", "completed_at", "project_id"]
    updates = []
    params = []
    
    # Validate status if provided
    status_val = payload.get("status")
    if status_val is not None and status_val not in ["active", "next", "in_progress", "waiting", "completed", "cancelled", "blocked"]:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Invalid status: {status_val}. Must be one of: active, next, in_progress, waiting, completed, cancelled, blocked")
    
    # Validate priority if provided
    priority_val = payload.get("priority")
    if priority_val is not None and priority_val not in ["low", "medium", "high", "critical"]:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Invalid priority: {priority_val}. Must be one of: low, medium, high, critical")
    
    # Verify task exists
    existing = cur.execute("SELECT id, status FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    for k, v in payload.items():
        if k in allowed:
            updates.append(f"{k} = ?")
            params.append(v)
        
    if status_val == "completed" and "completed_at" not in payload:
        updates.append("completed_at = ?")
        params.append(datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    elif status_val and status_val != "completed":
        # Clear completed_at if task is being moved back from completed
        if existing["status"] == "completed":
            updates.append("completed_at = ?")
            params.append(None)
        
    if not updates:
        conn.close()
        return {"status": "no_change"}
        
    params.append(task_id)
    cur.execute(f"UPDATE tasks SET {', '.join(updates)}, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = ?", params)
    conn.commit()
    conn.close()
    return {"id": task_id, "status": "updated"}

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"id": task_id, "status": "deleted"}

@app.get("/api/projects")
def get_projects():
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.*, 
               COUNT(t.id) as total_tasks,
               SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
        FROM projects p
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id
        ORDER BY p.name ASC
    """)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@app.get("/api/calendar")
def get_calendar():
    return calendar_sync.get_all_schedule_events()

@app.get("/api/emails")
def get_emails():
    return email_sync.get_triaged_emails()

@app.patch("/api/emails/{email_id}/toggle-read")
def toggle_email_read(email_id: str):
    emails = email_sync.get_triaged_emails()
    for em in emails:
        if em["id"] == email_id:
            em["read"] = not em.get("read", False)
            break
    email_sync.save_triaged_emails(emails)
    return {"status": "ok"}

@app.get("/api/intentions")
def get_intentions():
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM intentions ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@app.post("/api/intentions")
def create_intention(payload: Dict[str, Any] = Body(...)):
    cue = payload.get("cue")
    action = payload.get("action")
    if not cue or not action:
        raise HTTPException(status_code=400, detail="Both cue and action are required")
        
    title = payload.get("title") or f"IF {cue[:25]}... THEN {action[:25]}..."
    status = payload.get("status", "dormant")
    if status not in ["dormant", "active", "expired", "completed"]:
        status = "dormant"

    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO intentions (title, cue, action, status, created_at)
        VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    """, (title, cue, action, status))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, "status": "created"}

# ── Reminders Endpoints ───────────────────────────────────────────────────────

@app.get("/api/reminders")
def get_reminders(status: Optional[str] = None):
    conn = get_organizer_conn()
    cur = conn.cursor()
    query = "SELECT * FROM reminders WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'snoozed' THEN 2 ELSE 3 END, remind_at ASC"
    cur.execute(query, params)
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows

@app.post("/api/reminders")
def create_reminder(payload: Dict[str, Any] = Body(...)):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    remind_at = payload.get("remind_at")
    offset_min = payload.get("offset_minutes")

    if not remind_at and offset_min is not None:
        target_dt = datetime.now(timezone.utc) + timedelta(minutes=float(offset_min))
        remind_at = target_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    elif not remind_at:
        # Default to 15 minutes from now
        target_dt = datetime.now(timezone.utc) + timedelta(minutes=15)
        remind_at = target_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    channel = payload.get("channel", "all")
    notes = payload.get("notes", "")

    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO reminders (title, remind_at, channel, notes, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    """, (title, remind_at, channel, notes))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, "remind_at": remind_at, "status": "created"}

@app.patch("/api/reminders/{rem_id}")
def update_reminder(rem_id: int, payload: Dict[str, Any] = Body(...)):
    conn = get_organizer_conn()
    cur = conn.cursor()
    
    # Handle quick snooze
    if payload.get("action") == "snooze" or payload.get("snooze_minutes"):
        mins = float(payload.get("snooze_minutes", 10))
        target_dt = datetime.now(timezone.utc) + timedelta(minutes=mins)
        new_remind_at = target_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        cur.execute("UPDATE reminders SET remind_at = ?, status = 'snoozed' WHERE id = ?", (new_remind_at, rem_id))
        conn.commit()
        conn.close()
        return {"id": rem_id, "status": "snoozed", "remind_at": new_remind_at}

    allowed = ["title", "remind_at", "channel", "status", "notes"]
    updates = []
    params = []
    for k, v in payload.items():
        if k in allowed:
            updates.append(f"{k} = ?")
            params.append(v)

    if not updates:
        conn.close()
        return {"status": "no_change"}

    params.append(rem_id)
    cur.execute(f"UPDATE reminders SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()
    return {"id": rem_id, "status": "updated"}

@app.delete("/api/reminders/{rem_id}")
def delete_reminder(rem_id: int):
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM reminders WHERE id = ?", (rem_id,))
    conn.commit()
    conn.close()
    return {"id": rem_id, "status": "deleted"}

@app.get("/api/wiki/search")
def search_wiki(q: str = Query("", min_length=1)):
    """Fast search across Active Wiki and Oracle Brain markdown files."""
    results = []
    targets = [
        ("Active Wiki", ACTIVE_WIKI),
        ("Oracle Brain", ORACLE_BRAIN)
    ]
    
    for label, base_dir in targets:
        if not base_dir.exists():
            continue
        for file in base_dir.rglob("*.md"):
            try:
                content = file.read_text(encoding="utf-8", errors="ignore")
                if q.lower() in content.lower():
                    # Extract snippet around first match
                    idx = content.lower().find(q.lower())
                    start = max(0, idx - 60)
                    end = min(len(content), idx + 120)
                    snippet = "..." + content[start:end].replace("\n", " ") + "..."
                    
                    rel_path = file.relative_to(AUTOGNOSIA_HOME)
                    results.append({
                        "tier": label,
                        "title": file.stem.replace("-", " ").title(),
                        "path": str(rel_path),
                        # SECURITY: do NOT expose absolute server paths to clients
                        "snippet": snippet
                    })
            except Exception:
                continue
                
    return results[:15]

@app.get("/api/wiki/page")
def get_wiki_page(path: str = Query(...)):
    target = (AUTOGNOSIA_HOME / path).resolve()
    # Path traversal guard: resolved path must stay within AUTOGNOSIA_HOME
    if not target.is_relative_to(AUTOGNOSIA_HOME.resolve()):
        raise HTTPException(status_code=403, detail="Access denied")
    if not target.exists() or not target.is_file():
        raise HTTPException(status_code=404, detail="Page not found")
    return {
        "path": path,
        "title": target.stem.replace("-", " ").title(),
        "content": target.read_text(encoding="utf-8", errors="ignore")
    }

@app.get("/api/telemetry")
def get_telemetry():
    """Real-time infrastructure health and Docker telemetry."""
    # Docker containers
    containers = []
    docker_available = False
    try:
        r = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}\t{{.Status}}\t{{.Ports}}"],
            capture_output=True, text=True, timeout=5
        )
        if r.returncode == 0:
            docker_available = True
            for line in r.stdout.strip().split("\n"):
                if line.strip():
                    parts = line.split("\t")
                    containers.append({
                        "name": parts[0],
                        "status": parts[1] if len(parts) > 1 else "running",
                        "ports": parts[2] if len(parts) > 2 else ""
                    })
    except Exception:
        pass

    # Profile configs — check both repo root and ${HOME}/.hermes for profile configs
    profiles = ["default", "oracle", "researcher", "planner", "auditor", "personal-organizer"]
    profile_status = {}
    for p in profiles:
        # Check repo root first (for dev setups), then ${HOME}/.hermes (for production)
        prof_dir = REPO_ROOT / "profiles" / p
        hermes_dir = Path(os.environ.get("HERMES_HOME", str(Path.home() / ".hermes"))) / "profiles" / p
        profile_status[p] = "configured" if prof_dir.exists() or hermes_dir.exists() else "missing"

    # Database sizes
    db_stats = {}
    if ORGANIZER_DB.exists():
        db_stats["organizer.db"] = f"{ORGANIZER_DB.stat().st_size / 1024:.1f} KB"
    if AUTOGNOSIA_DB.exists():
        db_stats["autognosia.db"] = f"{AUTOGNOSIA_DB.stat().st_size / 1024:.1f} KB"

    # Brain CLI (legacy — no longer used)

    return {
        "docker_available": docker_available,
        "containers": containers,
        "profiles": profile_status,
        "databases": db_stats,
        "gbrain_cli": False,  # legacy — no longer used
        "server_time": datetime.now(timezone.utc).isoformat()
    }

# ── Hermes AI Copilot & Chatbot Endpoint ──────────────────────────────────────

@app.post("/api/chat")
def chat_with_hermes(payload: Dict[str, Any] = Body(...)):
    """
    Direct conversational interface with Hermes Agent.
    Accepts user instructions, executes Autognosia actions (tasks, calendar, wiki search, intentions),
    and returns a structured assistant response.
    """
    message = (payload.get("message") or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    msg_lower = message.lower()
    actions_taken = []
    refresh_needed = False
    response_text = ""

    # 1. Action: Add Task
    if msg_lower.startswith(("add task", "create task", "new task", "todo:", "task:")):
        # Extract title and optional priority
        raw_task = message
        for prefix in ["add task:", "create task:", "new task:", "add task", "create task", "new task", "todo:", "task:"]:
            if raw_task.lower().startswith(prefix):
                raw_task = raw_task[len(prefix):].strip()
                break

        priority = "medium"
        if "critical" in raw_task.lower():
            priority = "critical"
            raw_task = raw_task.replace("critical", "").replace("CRITICAL", "").strip()
        elif "high" in raw_task.lower():
            priority = "high"
            raw_task = raw_task.replace("high", "").replace("HIGH", "").strip()
        elif "low" in raw_task.lower():
            priority = "low"
            raw_task = raw_task.replace("low", "").replace("LOW", "").strip()

        # Save task
        conn = get_organizer_conn()
        cur = conn.cursor()
        cur.execute("INSERT INTO tasks (title, priority, status, created_at, updated_at) VALUES (?, ?, 'active', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'))", (raw_task, priority))
        conn.commit()
        task_id = cur.lastrowid
        conn.close()

        actions_taken.append(f"Created task #{task_id}: '{raw_task}' (Priority: {priority})")
        refresh_needed = True
        response_text = f"✓ **Task Created:** Added **{raw_task}** to your Action Pipeline with **{priority.upper()}** priority."

    # 2. Action: Check / List Tasks
    elif any(k in msg_lower for k in ["what are my tasks", "show tasks", "list tasks", "my tasks", "what do i have to do"]):
        conn = get_organizer_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, title, priority, status, due_at FROM tasks WHERE status != 'completed' ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END LIMIT 5")
        tasks = cur.fetchall()
        conn.close()

        if tasks:
            items = "\n".join([f"- **#{t['id']}** [{t['priority'].upper()}] {t['title']} (Status: {t['status']})" for t in tasks])
            response_text = f"Here are your top active tasks:\n\n{items}\n\n*View and manage all items in the Personal Organizer panel.*"
        else:
            response_text = "🎉 You have no pending tasks in your Action Pipeline!"

    # 3. Action: Check Schedule / Calendar
    elif any(k in msg_lower for k in ["schedule", "calendar", "what's on today", "meetings today", "agenda"]):
        events = calendar_sync.get_all_schedule_events()
        today_str = datetime.now().strftime("%Y-%m-%d")
        today_evs = [e for e in events if str(e.get("start", "")).startswith(today_str)]
        
        if today_evs:
            ev_list = "\n".join([f"- **{e.get('title')}** ({e.get('start', '').replace(today_str, '').strip('T') or 'All Day'})" for e in today_evs])
            response_text = f"📅 **Today's Schedule ({today_str}):**\n\n{ev_list}"
        else:
            response_text = f"📅 Your schedule is clear for today ({today_str}). No urgent meetings or deadlines scheduled."

    # 4. Action: Timed Reminder
    elif msg_lower.startswith(("remind me in", "remind me to", "remind me on", "remind me at", "set reminder", "reminder:")):
        import re
        offset_min = 15.0  # default
        rem_title = message
        
        # Match "remind me in (\d+) (minutes?|mins?|hours?|hrs?|days?) (to|about|that)? (.*)"
        m = re.search(r"remind me in\s+(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|days?)\s*(?:to|about|that)?\s*(.*)", message, re.IGNORECASE)
        if m:
            val = float(m.group(1))
            unit = m.group(2).lower()
            rem_title = m.group(3).strip() or "Reminder"
            if "hour" in unit or "hr" in unit:
                offset_min = val * 60
            elif "day" in unit:
                offset_min = val * 1440
            else:
                offset_min = val
        else:
            # Strip prefix
            for pfx in ["remind me to", "remind me on", "remind me at", "remind me", "set reminder to", "set reminder", "reminder:"]:
                if rem_title.lower().startswith(pfx):
                    rem_title = rem_title[len(pfx):].strip()
                    break

        target_dt = datetime.now(timezone.utc) + timedelta(minutes=offset_min)
        remind_at = target_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        conn = get_organizer_conn()
        cur = conn.cursor()
        cur.execute("INSERT INTO reminders (title, remind_at, channel, status, created_at) VALUES (?, ?, 'all', 'pending', strftime('%Y-%m-%dT%H:%M:%SZ','now'))", (rem_title, remind_at))
        conn.commit()
        rem_id = cur.lastrowid
        conn.close()

        actions_taken.append(f"Scheduled reminder #{rem_id}: '{rem_title}' for {remind_at}")
        refresh_needed = True
        local_time_str = (datetime.now() + timedelta(minutes=offset_min)).strftime("%I:%M %p")
        response_text = f"⏰ **Reminder Scheduled!**\n- **Item:** {rem_title}\n- **Trigger Time:** in {offset_min:.0f} minutes (~{local_time_str})\n- **Channel:** All (Telegram, Discord, Email, SMS, Desktop)\n\nI will notify you across your configured channels when the time arrives."

    # 5. Action: Prospective Intention
    elif msg_lower.startswith(("remember when", "if ", "remind me when", "intention:")):
        # Create intention
        cue = message
        action = "Notify and surface relevant context"
        if " then " in message:
            parts = message.split(" then ", 1)
            cue = parts[0].replace("if ", "").replace("IF ", "").replace("remember when ", "").strip()
            action = parts[1].strip()

        conn = get_organizer_conn()
        cur = conn.cursor()
        cur.execute("INSERT INTO intentions (title, cue, action, status) VALUES (?, ?, ?, 'dormant')", (
            f"IF {cue[:20]}...", cue, action
        ))
        conn.commit()
        conn.close()

        actions_taken.append(f"Registered prospective intention for cue: '{cue}'")
        refresh_needed = True
        response_text = f"🔮 **Prospective Intention Logged:**\n- **IF:** {cue}\n- **THEN:** {action}\n\nHermes will watch for this cue during operations."

    # 5. Action: Search Second Brain / Knowledge Vault
    elif msg_lower.startswith(("search ", "lookup ", "find in wiki", "ask oracle")):
        query = message.replace("search", "").replace("lookup", "").replace("find in wiki", "").replace("ask oracle", "").strip()
        results = search_wiki(query)
        if results:
            res_items = "\n".join([f"- **{r['title']}** ({r['tier']}): {r['snippet']}" for r in results[:3]])
            response_text = f"🧠 **Knowledge Vault Search Results for '{query}':**\n\n{res_items}"
        else:
            response_text = f"No documents found matching '{query}' in Active Wiki or Oracle Vault."

    # 6. General Assistant Chat
    else:
        # Provide helpful cognitive executive response
        response_text = (
            f"**Autognosia Executive Copilot:** I received your instruction:\n\n"
            f"> *\"{message}\"*\n\n"
            f"You can command me to:\n"
            f"- **Add Tasks:** `Add task Review draft Friday high`\n"
            f"- **Schedule:** `What is on my calendar today?`\n"
            f"- **Search Vault:** `Search vector database architectures`\n"
            f"- **Set Intentions:** `IF discussing GPUs THEN remind to check memory bandwidth`\n"
            f"- **System Telemetry:** `Show system status`"
        )

    return {
        "reply": response_text,
        "actions_taken": actions_taken,
        "refresh_needed": refresh_needed,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }



# ── Bot Management Endpoints ───────────────────────────────────────────────────

@app.get("/api/bots")
def get_bots():
    """List all configured bots/agents from Hermes profiles."""
    import psutil
    hermes_home = Path(os.environ.get("HERMES_HOME", str(Path.home() / ".hermes")))
    profiles_dir = hermes_home / "profiles"
    bots = []

    if profiles_dir.exists():
        for profile_dir in sorted(profiles_dir.iterdir()):
            if not profile_dir.is_dir():
                continue
            profile_name = profile_dir.name
            config_file = profile_dir / "config.yaml"
            agent_name = profile_name.replace("-", " ").title()
            model = "unknown"
            provider = "unknown"
            if config_file.exists():
                try:
                    import yaml
                    with open(config_file) as f:
                        cfg = yaml.safe_load(f) or {}
                    model_cfg = cfg.get("model", {})
                    if isinstance(model_cfg, dict):
                        model = model_cfg.get("default", model_cfg.get("provider", "unknown"))
                    else:
                        model = str(model_cfg)
                    provider_cfg = cfg.get("providers", {})
                    if isinstance(provider_cfg, dict) and provider_cfg:
                        provider = list(provider_cfg.keys())[0]
                except Exception:
                    pass

            status = "idle"
            for proc in psutil.process_iter(['pid', 'cmdline']):
                try:
                    cmdline = ' '.join(proc.info['cmdline'] or [])
                    if profile_name in cmdline and 'hermes' in cmdline.lower():
                        status = "online"
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            avatar_map = {
                "default": "🤖",
                "auditor": "🔍",
                "oracle": "🧠",
                "coder": "💻",
                "planner": "📋",
                "researcher": "🔬",
                "desktop-researcher": "🖥️",
                "desktop-worker": "⚙️",
                "personal-organizer": "📅",
            }

            bots.append({
                "id": profile_name,
                "name": agent_name,
                "role": f"{profile_name.replace('-', ' ')} agent",
                "model": model,
                "provider": provider.capitalize(),
                "status": status,
                "current_task": None,
                "last_activity": datetime.now(timezone.utc).isoformat(),
                "avatar": avatar_map.get(profile_name, "🤖"),
            })

    return {"bots": bots}


@app.get("/api/bots/{bot_id}/history")
def get_bot_history(bot_id: str):
    """Get conversation history for a bot."""
    return {"messages": []}


@app.post("/api/bots/{bot_id}/message")
def send_bot_message(bot_id: str, payload: Dict[str, Any] = Body(...)):
    """Send a message to a specific bot."""
    message = (payload.get("message") or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message required")
    return {
        "reply": f"Echo from {bot_id}: {message}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ── Phase 2: Service Integration Endpoints ──────────────────────────────────────

SERVICE_DEFINITIONS = {
    "jellyfin": {"name": "Jellyfin", "port": 8096, "icon": "🎬", "category": "media"},
    "plex": {"name": "Plex", "port": 32400, "icon": "🎥", "category": "media"},
    "sonarr": {"name": "Sonarr", "port": 8989, "icon": "📺", "category": "automation"},
    "radarr": {"name": "Radarr", "port": 7878, "icon": "🎞️", "category": "automation"},
    "qbittorrent": {"name": "qBittorrent", "port": 8080, "icon": "⬇️", "category": "downloads"},
    "traefik_dashboard": {"name": "Traefik Dashboard", "port": 8080, "icon": "🚦", "category": "infra"},
    "uptimekuma": {"name": "Uptime Kuma", "port": 3001, "icon": "📊", "category": "monitoring"},
    "grafana": {"name": "Grafana", "port": 3000, "icon": "📈", "category": "monitoring"},
    "prometheus": {"name": "Prometheus", "port": 9090, "icon": "⚡", "category": "monitoring"},
    "freshrss": {"name": "FreshRSS", "port": 8081, "icon": "📰", "category": "feed"},
    "homeassistant": {"name": "Home Assistant", "port": 8123, "icon": "🏠", "category": "smart-home"},
}

# Map ports to service names (for health checks)
# Note: multiple services may share a port (e.g. 8080); store as list
PORT_TO_SERVICE = {}
for svc_key, svc_info in SERVICE_DEFINITIONS.items():
    port = svc_info["port"]
    if port not in PORT_TO_SERVICE:
        PORT_TO_SERVICE[port] = []
    PORT_TO_SERVICE[port].append(svc_key)

# Jellyfin auth token - set via env var or leave None for public endpoints
JELLYFIN_TOKEN = os.environ.get("JELLYFIN_TOKEN", "")
SONARR_API_KEY = os.environ.get("SONARR_API_KEY", "")
RADARR_API_KEY = os.environ.get("RADARR_API_KEY", "")


def _check_service_health(port: int, timeout: float = 2.0) -> str:
    """Check if a service is reachable via HTTP."""
    try:
        r = requests.get(f"http://localhost:{port}", timeout=timeout)
        return "healthy" if r.status_code < 500 else "degraded"
    except Exception:
        return "unhealthy"


def _get_jellyfin_sessions() -> list:
    """Get active Jellyfin sessions."""
    sessions = []
    try:
        headers = {}
        if JELLYFIN_TOKEN:
            headers["X-Emby-Token"] = JELLYFIN_TOKEN
        r = requests.get("http://localhost:8096/Sessions", timeout=2, headers=headers)
        if r.ok:
            for session in r.json():
                play_state = session.get("PlayState", {})
                if not play_state.get("IsPaused", True):
                    now_playing = session.get("NowPlayingItem", {}) or {}
                    sessions.append({
                        "service": "Jellyfin",
                        "title": now_playing.get("Name", "Unknown"),
                        "type": now_playing.get("Type", ""),
                        "user": session.get("UserName", ""),
                        "device": session.get("DeviceName", ""),
                        "progress": play_state.get("PositionTicks", 0),
                        "total": now_playing.get("RunTimeTicks", 0),
                    })
    except Exception:
        pass
    return sessions


def _get_plex_sessions() -> list:
    """Get active Plex sessions."""
    sessions = []
    try:
        r = requests.get("http://localhost:32400/status/sessions", timeout=2)
        if r.ok:
            data = r.json()
            for session in data.get("MediaSession", []):
                media = session.get("Media", {}) or {}
                part = media.get("Part", {}) or {}
                streams = [part] if isinstance(part, dict) else part
                for p in (streams if isinstance(streams, list) else [streams]):
                    if isinstance(p, dict):
                        title = p.get("videoTitle") or session.get("title", "Unknown")
                        sessions.append({
                            "service": "Plex",
                            "title": title,
                            "type": session.get("type", ""),
                            "user": session.get("user", {}).get("title", ""),
                            "device": session.get("device", {}).get("title", ""),
                            "progress": session.get("viewOffset", 0),
                            "total": session.get("duration", 0),
                        })
    except Exception:
        pass
    return sessions


def _get_sonarr_queue(page_size: int = 10) -> list:
    """Get upcoming Sonarr queue items."""
    queue = []
    try:
        params = {"pagesize": page_size}
        headers = {}
        if SONARR_API_KEY:
            headers["X-Api-Key"] = SONARR_API_KEY
        r = requests.get("http://localhost:8989/api/v3/queue", params=params, timeout=2, headers=headers)
        if r.ok:
            for item in r.json():
                series = item.get("series", {}) or {}
                queue.append({
                    "service": "Sonarr",
                    "type": "Episode",
                    "title": f"{series.get('title', 'Unknown')} - S{item.get('seasonNumber', '')}E{item.get('episodeNumber', '')}",
                    "size": item.get("size", 0),
                    "timeleft": item.get("timeleft", "00:00:00"),
                    "quality": item.get("quality", {}).get("quality", {}).get("name", "") if isinstance(item.get("quality"), dict) else "",
                })
    except Exception:
        pass
    return queue


def _get_radarr_queue(page_size: int = 10) -> list:
    """Get upcoming Radarr queue items."""
    queue = []
    try:
        params = {"pagesize": page_size}
        headers = {}
        if RADARR_API_KEY:
            headers["X-Api-Key"] = RADARR_API_KEY
        r = requests.get("http://localhost:7878/api/v3/queue", params=params, timeout=2, headers=headers)
        if r.ok:
            for item in r.json():
                movie = item.get("movie", {}) or {}
                queue.append({
                    "service": "Radarr",
                    "type": "Movie",
                    "title": movie.get("title", "Unknown"),
                    "size": item.get("size", 0),
                    "timeleft": item.get("timeleft", "00:00:00"),
                    "quality": item.get("quality", {}).get("quality", {}).get("name", "") if isinstance(item.get("quality"), dict) else "",
                })
    except Exception:
        pass
    return queue


@app.get("/api/services")
def get_all_services():
    """Return status of all tracked homelab services."""
    services = {}
    for key, info in SERVICE_DEFINITIONS.items():
        health = _check_service_health(info["port"])
        details = {}

        # Get specific details based on service type
        if key == "jellyfin" and health == "healthy":
            sessions = _get_jellyfin_sessions()
            details["sessions"] = len(sessions)

        elif key == "plex" and health == "healthy":
            sessions = _get_plex_sessions()
            details["sessions"] = len(sessions)

        elif key == "sonarr" and health == "healthy":
            queue = _get_sonarr_queue(5)
            details["queue_count"] = len(queue)

        elif key == "radarr" and health == "healthy":
            queue = _get_radarr_queue(5)
            details["queue_count"] = len(queue)

        services[key] = {
            "name": info["name"],
            "port": info["port"],
            "icon": info["icon"],
            "category": info["category"],
            "health": health,
            "details": details,
        }
    return services


@app.get("/api/services/{service_name}")
def get_service_details(service_name: str):
    """Get detailed status for a specific service."""
    services = get_all_services()
    if service_name not in services:
        raise HTTPException(status_code=404, detail=f"Service '{service_name}' not found")
    return services[service_name]


@app.get("/api/media/active")
def get_active_media():
    """Get all active media streams across services."""
    streams = []
    streams.extend(_get_jellyfin_sessions())
    streams.extend(_get_plex_sessions())

    # Sort by most recently active (placeholder - real implementation would track timestamps)
    return streams


@app.get("/api/queue")
def get_download_queue():
    """Get combined download queue from Sonarr/Radarr."""
    queue = []
    queue.extend(_get_sonarr_queue(10))
    queue.extend(_get_radarr_queue(10))

# ── # ── Home Lab Monitoring Endpoints ───────────────────────────────────────────

HOME_LAB_SERVERS = {
    "main": {
        "ip": "127.0.0.1",
        "name": "Main",
        "role": "LLM inference, graph processing",
        "services": {
            "llama-server": {"port": 8080, "path": "/health"},
            "ollama": {"port": 11434, "path": "/api/tags"},
            "graphify": {"port": 8081, "path": "/health"},
        },
        "gpu": {"name": "V100", "memory_mb": 32768, "type": "nvidia"},
    },
    "agent": {
        "ip": "<AGENT_SERVER_IP>",
        "name": "Agent",
        "role": "Hermes gateway, paperclip, memory systems",
        "services": {
            "hermes-gateway": {"port": 8642, "path": "/health"},
            "paperclip": {"port": 3000, "path": "/"},
            "honcho": {"port": 3100, "path": "/health"},
            "meilisearch": {"port": 7700, "path": "/health"},
            "qdrant": {"port": 6333, "path": "/collections"},
            "redis": {"port": 6379, "path": None},
            "postgres": {"port": 5432, "path": None},
        },
    },
    "agent_zero": {
        "ip": "<AGENT_ZERO_IP>",
        "name": "Agent Zero",
        "role": "Autonomous agent, data brokering",
        "services": {
            "agent-zero": {"port": 80, "path": "/"},
            "shadowbroker": {"port": 9000, "path": "/health"},
            "mariadb": {"port": 3306, "path": None},
        },
    },
}


def _check_remote_service(host: str, port: int, path: str = None, timeout: float = 2.0) -> dict:
    """Check health of a remote service on the home lab network."""
    url = f"http://{host}:{port}"
    if path:
        url += path
    try:
        r = requests.get(url, timeout=timeout)
        return {
            "healthy": r.status_code < 500,
            "status_code": r.status_code,
            "response_ms": round((r.elapsed.total_seconds() * 1000), 1) if hasattr(r, 'elapsed') else None,
        }
    except requests.exceptions.Timeout:
        return {"healthy": False, "status_code": 0, "response_ms": None, "error": "timeout"}
    except Exception as e:
        return {"healthy": False, "status_code": 0, "response_ms": None, "error": str(e)}


def _get_nvidia_smi(host: str = "localhost") -> dict:
    """Get GPU metrics via nvidia-smi (local only; remote needs ssh)."""
    result = {"available": False, "gpus": []}
    try:
        if host not in ("localhost", "127.0.0.1"):
            # Remote GPU check would require SSH — skip for now
            return result
        r = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,utilization.gpu,memory.used,memory.total", "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=5
        )
        if r.returncode == 0:
            result["available"] = True
            for line in r.stdout.strip().split("\n"):
                if line.strip():
                    parts = [p.strip() for p in line.split(",")]
                    if len(parts) >= 4:
                        result["gpus"].append({
                            "name": parts[0],
                            "utilization": int(parts[1]),
                            "memory_used_mb": int(parts[2]),
                            "memory_total_mb": int(parts[3]),
                        })
    except Exception:
        pass
    return result


@app.get("/api/homelab")
def get_homelab_status():
    """Return full home lab status: servers, services, GPU."""
    import psutil
    
    # Local GPU
    gpu_info = _get_nvidia_smi("localhost")
    
    result = {
        "servers": {},
        "gpu": gpu_info,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    
    # Add Docker containers as local services
    docker_containers = []
    try:
        r = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}\t{{.Status}}\t{{.Ports}}"],
            capture_output=True, text=True, timeout=5
        )
        if r.returncode == 0:
            for line in r.stdout.strip().split("\n"):
                if line.strip():
                    parts = line.split("\t")
                    docker_containers.append({
                        "name": parts[0],
                        "status": parts[1] if len(parts) > 1 else "running",
                        "ports": parts[2] if len(parts) > 2 else "",
                    })
    except Exception:
        pass
    
    # Local server entry
    local_server = {
        "ip": "127.0.0.1",
        "name": "Local",
        "role": "Dashboard host, Docker services",
        "online": True,
        "services": {},
    }
    
    for c in docker_containers:
        svc_name = c["name"]
        # Extract port from ports string if available
        port = None
        if "->" in c.get("ports", ""):
            port_part = c["ports"].split("->")[0].split(":")[-1].split("/")[0]
            try:
                port = int(port_part)
            except:
                pass
        local_server["services"][svc_name] = {
            "port": port,
            "healthy": "Up" in c["status"],
            "status_code": 200,
            "response_ms": None,
        }
    
    result["servers"]["local"] = local_server
    
    # Remote servers
    for key, server in HOME_LAB_SERVERS.items():
        server_result = {
            "ip": server["ip"],
            "name": server["name"],
            "role": server["role"],
            "online": True,
            "services": {},
        }
        
        for svc_name, svc_info in server.get("services", {}).items():
            health = _check_remote_service(server["ip"], svc_info["port"], svc_info.get("path"))
            server_result["services"][svc_name] = {
                "port": svc_info["port"],
                **health,
            }
            if not health.get("healthy"):
                server_result["online"] = False
        
        # Add GPU info for main server
        if key == "main" and gpu_info["available"]:
            server_result["gpu"] = gpu_info["gpus"][0] if gpu_info["gpus"] else None
        
        result["servers"][key] = server_result
    
    return result

@app.get("/api/agent")
def get_agent_status():
    """Hermes agent status, active sessions, cron jobs, memory state."""
    import psutil
    import time
    
    # Check Hermes gateway process
    gateway_running = False
    gateway_pid = None
    agent_running = False
    agent_pid = None
    
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline'] or [])
            if 'hermes' in cmdline.lower():
                if 'gateway' in cmdline.lower():
                    gateway_running = True
                    gateway_pid = proc.info['pid']
                if 'agent' in cmdline.lower():
                    agent_running = True
                    agent_pid = proc.info['pid']
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    # Count cron jobs
    cron_dir = Path.home() / ".hermes" / "cron"
    cron_count = 0
    if cron_dir.exists():
        cron_count = len([f for f in cron_dir.iterdir() if f.suffix in ['.yaml', '.yml']])
    
    # Memory stats
    memory_dir = Path.home() / ".hermes" / "memory"
    memory_files = 0
    if memory_dir.exists():
        memory_files = len([f for f in memory_dir.iterdir() if f.suffix == '.md'])
    
    return {
        "gateway_running": gateway_running,
        "gateway_pid": gateway_pid,
        "agent_running": agent_running,
        "agent_pid": agent_pid,
        "cron_jobs": cron_count,
        "memory_files": memory_files,
        "python_version": sys.version.split()[0],
        "uptime_days": int((time.time() - psutil.boot_time()) // 86400),
    }

@app.get("/api/cron")
def get_cron_jobs():
    """List all configured cron jobs from jobs.json."""
    jobs_file = Path.home() / ".hermes" / "cron" / "jobs.json"
    cron_jobs = []
    
    if jobs_file.exists():
        try:
            with open(jobs_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            for job in data.get("jobs", []):
                schedule = job.get("schedule", {})
                if isinstance(schedule, dict):
                    schedule_str = schedule.get("display", schedule.get("expr", "Unknown"))
                else:
                    schedule_str = str(schedule)
                cron_jobs.append({
                    "name": job.get("name", "Untitled"),
                    "schedule": schedule_str,
                    "enabled": job.get("enabled", True),
                    "file": job.get("id", ""),
                })
        except Exception as e:
            cron_jobs.append({
                "name": "Error loading jobs",
                "schedule": str(e),
                "enabled": False,
            })
    
    return {
        "jobs": cron_jobs,
        "total": len(cron_jobs),
    }

@app.get("/api/graphify")
def get_graphify_status():
    """Graphify ingestion status, queue, nodes."""
    nodes = 0
    edges = 0
    
    # Check oracle brain graphify (in-place within oracle/brain)
    brain_dir = AUTOGNOSIA_HOME / "oracle" / "brain" / "graphify-out"
    if brain_dir.exists():
        for out_file in brain_dir.glob("*.json"):
            try:
                data = json.loads(out_file.read_text(encoding="utf-8"))
                nodes += len(data.get("nodes", []))
                edges += len(data.get("edges", []))
            except:
                pass
    
    # Check active wiki graphify
    active_wiki_dir = AUTOGNOSIA_HOME / "active-wiki" / "graphify-out"
    if active_wiki_dir.exists():
        for out_file in active_wiki_dir.glob("*.json"):
            try:
                data = json.loads(out_file.read_text(encoding="utf-8"))
                nodes += len(data.get("nodes", []))
                edges += len(data.get("edges", []))
            except:
                pass
    
    # Check graphify-main-out (legacy location)
    main_dir = AUTOGNOSIA_HOME / "graphify-main-out"
    if main_dir.exists():
        for out_file in main_dir.glob("*.json"):
            try:
                data = json.loads(out_file.read_text(encoding="utf-8"))
                nodes += len(data.get("nodes", []))
                edges += len(data.get("edges", []))
            except:
                pass
    
    return {
        "nodes": nodes,
        "edges": edges,
        "brain_dir": str(brain_dir),
        "active_wiki_dir": str(active_wiki_dir),
        "main_dir": str(main_dir),
    }

@app.get("/api/hermes")
def get_hermes_status():
    """Overall Hermes system health and configuration."""
    import psutil
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = ' '.join(proc.info['cmdline'] or [])
            if 'hermes' in cmdline.lower():
                processes.append({
                    "pid": proc.info['pid'],
                    "name": proc.info['name'],
                    "cpu_percent": proc.cpu_percent(),
                    "memory_mb": round(proc.memory_info().rss / 1024 / 1024, 1),
                })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    skills_dir = Path.home() / ".hermes" / "skills"
    skills_count = 0
    if skills_dir.exists():
        skills_count = len([f for f in skills_dir.iterdir() if f.is_dir() and (f / "SKILL.md").exists()])
    
    plugins_dir = Path.home() / ".hermes" / "plugins"
    plugins_count = 0
    if plugins_dir.exists():
        plugins_count = len([f for f in plugins_dir.iterdir() if f.is_dir() and (f / "plugin.yaml").exists() or (f / "plugin.yml").exists()])
    
    return {
        "processes": processes,
        "skills_count": skills_count,
        "plugins_count": plugins_count,
        "python_version": sys.version.split()[0],
    }



# ── Static File Serving ────────────────────────────────────────────────────────

DASHBOARD_DIR = Path(__file__).resolve().parent

@app.get("/")
def serve_dashboard():
    """Serve the main dashboard HTML."""
    return FileResponse(str(DASHBOARD_DIR / "index.html"))

@app.get("/sidebar.css")
def serve_sidebar():
    return FileResponse(str(DASHBOARD_DIR / "sidebar.css"), media_type="text/css")

@app.get("/header.css")
def serve_header():
    return FileResponse(str(DASHBOARD_DIR / "header.css"), media_type="text/css")

@app.get("/layout.css")
def serve_layout():
    return FileResponse(str(DASHBOARD_DIR / "layout.css"), media_type="text/css")

@app.get("/briefing.css")
def serve_briefing():
    return FileResponse(str(DASHBOARD_DIR / "briefing.css"), media_type="text/css")

@app.get("/calendar.css")
def serve_calendar():
    return FileResponse(str(DASHBOARD_DIR / "calendar.css"), media_type="text/css")

@app.get("/tasks.css")
def serve_tasks():
    return FileResponse(str(DASHBOARD_DIR / "tasks.css"), media_type="text/css")

@app.get("/comms.css")
def serve_comms():
    return FileResponse(str(DASHBOARD_DIR / "comms.css"), media_type="text/css")

@app.get("/drawers.css")
def serve_drawers():
    return FileResponse(str(DASHBOARD_DIR / "drawers.css"), media_type="text/css")

@app.get("/services.css")
def serve_services_css():
    return FileResponse(str(DASHBOARD_DIR / "services.css"), media_type="text/css")

@app.get("/agent.css")
def serve_agent_css():
    return FileResponse(str(DASHBOARD_DIR / "agent.css"), media_type="text/css")

@app.get("/bots.css")
def serve_bots_css():
    return FileResponse(str(DASHBOARD_DIR / "bots.css"), media_type="text/css")

@app.get("/tokens.css")
def serve_tokens():
    return FileResponse(str(DASHBOARD_DIR / "tokens.css"), media_type="text/css")

@app.get("/home-lab.css")
def serve_home_lab_css():
    return FileResponse(str(DASHBOARD_DIR / "home-lab.css"), media_type="text/css")

@app.get("/app-core.js")
def serve_app_core():
    return FileResponse(str(DASHBOARD_DIR / "app-core.js"), media_type="application/javascript")

@app.get("/app.js")
def serve_app():
    return FileResponse(str(DASHBOARD_DIR / "app.js"), media_type="application/javascript")

@app.get("/app-bots.js")
def serve_app_bots():
    return FileResponse(str(DASHBOARD_DIR / "app-bots.js"), media_type="application/javascript")

@app.get("/app-calendar.js")
def serve_app_calendar():
    return FileResponse(str(DASHBOARD_DIR / "app-calendar.js"), media_type="application/javascript")

@app.get("/app-comms.js")
def serve_app_comms():
    return FileResponse(str(DASHBOARD_DIR / "app-comms.js"), media_type="application/javascript")

@app.get("/app-data-fetch.js")
def serve_app_data_fetch():
    return FileResponse(str(DASHBOARD_DIR / "app-data-fetch.js"), media_type="application/javascript")

@app.get("/app-crud.js")
def serve_app_crud():
    return FileResponse(str(DASHBOARD_DIR / "app-crud.js"), media_type="application/javascript")

@app.get("/app-services.js")
def serve_app_services():
    return FileResponse(str(DASHBOARD_DIR / "app-services.js"), media_type="application/javascript")

@app.get("/app-tasks.js")
def serve_app_tasks():
    return FileResponse(str(DASHBOARD_DIR / "app-tasks.js"), media_type="application/javascript")

@app.get("/app-agent.js")
def serve_app_agent():
    return FileResponse(str(DASHBOARD_DIR / "app-agent.js"), media_type="application/javascript")

@app.get("/ws-client.js")
def serve_ws_client():
    return FileResponse(str(DASHBOARD_DIR / "ws-client.js"), media_type="application/javascript")

@app.get("/enhance.js")
def serve_enhance():
    return FileResponse(str(DASHBOARD_DIR / "enhance.js"), media_type="application/javascript")


def run(host: str = "0.0.0.0", port: int = 8088):
    """Start the dashboard server."""
    print("=" * 60)
    print("  Autognosia COMMAND DECK — EXECUTIVE DASHBOARD")
    print(f"  Live UI available at: http://{host}:{port}")
    print(f"  API Docs available at: http://{host}:{port}/docs")
    print("=" * 60)
    uvicorn.run(app, host=host, port=port, log_level="warning")


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8088
    # Parse --port and --host arguments
    for i, arg in enumerate(sys.argv):
        if arg == "--port" and i + 1 < len(sys.argv):
            port = int(sys.argv[i + 1])
            break
        elif arg.isdigit():
            port = int(arg)
            break
        if arg == "--host" and i + 1 < len(sys.argv):
            host = sys.argv[i + 1]
            break
    run(host=host, port=port)
