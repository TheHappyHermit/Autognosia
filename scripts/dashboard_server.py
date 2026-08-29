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
ORGANIZER_DB = Path(os.environ.get("ORGANIZER_DB", str(AUTOGNOSIA_HOME / "personal-organizer" / "data" / "organizer.db")))
AUTOGNOSIA_DB = AUTOGNOSIA_HOME / "autognosia.db"
ACTIVE_WIKI = AUTOGNOSIA_HOME / "active-wiki"
ORACLE_BRAIN = AUTOGNOSIA_HOME / "oracle" / "brain"

# Import local helper bridges
sys.path.insert(0, str(REPO_ROOT / "scripts"))
import calendar_sync
import email_sync
import check_reminders
from notify_dispatcher import dispatcher

import asyncio

app = FastAPI(title="Autognosia Command Deck API", version="2.6.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
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

def get_organizer_conn() -> sqlite3.Connection:
    if not ORGANIZER_DB.exists():
        ORGANIZER_DB.parent.mkdir(parents=True, exist_ok=True)
        # Initialize if missing
        import init_db
        init_db.ensure_directories()
        conn = sqlite3.connect(str(ORGANIZER_DB))
        conn.executescript(init_db.SCHEMA)
        conn.commit()
        return conn
    conn = sqlite3.connect(str(ORGANIZER_DB))
    conn.row_factory = sqlite3.Row
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
    network_mbps = round(net_io.bytes_recv / (1024 * 1024 * 1024), 2)  # cumulative GB

    # Active agents — check Hermes gateway
    active_agents = 1  # Hermes agent itself is always "active"

    return {
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "ram_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "network_mbps": network_mbps,
        "active_agents": active_agents,
        "uptime_days": uptime_days,
    }


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
    if status not in ["active", "completed", "cancelled", "blocked"]:
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
    
    for k, v in payload.items():
        if k in allowed:
            updates.append(f"{k} = ?")
            params.append(v)
            
    if payload.get("status") == "completed" and "completed_at" not in payload:
        updates.append("completed_at = ?")
        params.append(datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
        
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
                        "abs_path": str(file),
                        "snippet": snippet
                    })
            except Exception:
                continue
                
    return results[:15]

@app.get("/api/wiki/page")
def get_wiki_page(path: str = Query(...)):
    target = AUTOGNOSIA_HOME / path
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

    # GBrain CLI
    gbrain_installed = bool(shutil.which("gbrain") or shutil.which("gbrain.cmd"))

    return {
        "docker_available": docker_available,
        "containers": containers,
        "profiles": profile_status,
        "databases": db_stats,
        "gbrain_cli": gbrain_installed,
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

# ── Phase 2: Service Integration Endpoints ──────────────────────────────────────

SERVICE_DEFINITIONS = {
    "jellyfin": {"name": "Jellyfin", "port": 8096, "icon": "🎬", "category": "media"},
    "plex": {"name": "Plex", "port": 32400, "icon": "🎥", "category": "media"},
    "sonarr": {"name": "Sonarr", "port": 8989, "icon": "📺", "category": "automation"},
    "radarr": {"name": "Radarr", "port": 7878, "icon": "🎞️", "category": "automation"},
    "qbittorrent": {"name": "qBittorrent", "port": 8080, "icon": "⬇️", "category": "downloads"},
    "traefik": {"name": "Traefik", "port": 8080, "icon": "🚦", "category": "infra"},
    "uptimekuma": {"name": "Uptime Kuma", "port": 3001, "icon": "📊", "category": "monitoring"},
    "grafana": {"name": "Grafana", "port": 3000, "icon": "📈", "category": "monitoring"},
    "prometheus": {"name": "Prometheus", "port": 9090, "icon": "⚡", "category": "monitoring"},
    "freshrss": {"name": "FreshRSS", "port": 8081, "icon": "📰", "category": "feed"},
    "homeassistant": {"name": "Home Assistant", "port": 8123, "icon": "🏠", "category": "smart-home"},
}

# Map ports to service names (for health checks)
PORT_TO_SERVICE = {}
for svc_key, svc_info in SERVICE_DEFINITIONS.items():
    PORT_TO_SERVICE[svc_info["port"]] = svc_key

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
                    "timeleft": item.get("monitored", True),
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
                    "timeleft": item.get("monitored", True),
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

# ── # ── Agent Intelligence Endpoints (Phase 3) ───────────────────────────────────────

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
    """List all configured cron jobs with status."""
    cron_dir = Path.home() / ".hermes" / "cron"
    cron_jobs = []
    
    if cron_dir.exists():
        for job_file in cron_dir.glob("*.yaml"):
            try:
                content = job_file.read_text(encoding="utf-8", errors="ignore")
                name = job_file.stem.replace('_', ' ').title()
                schedule = "Unknown"
                enabled = True
                
                for line in content.split(chr(10)):
                    if 'schedule:' in line:
                        schedule = line.split(":", 1)[1].strip().strip(chr(34) + chr(39))
                    if 'enabled:' in line:
                        enabled = 'true' in line.lower()
                
                cron_jobs.append({
                    "name": name,
                    "schedule": schedule,
                    "enabled": enabled,
                    "file": job_file.name
                })
            except Exception as e:
                cron_jobs.append({
                    "name": job_file.stem,
                    "schedule": "Error",
                    "enabled": False,
                    "error": str(e)
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
    
    # Check oracle brain graphify
    brain_dir = AUTOGNOSIA_HOME / "graphify-main-out"
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
    
    return {
        "nodes": nodes,
        "edges": edges,
        "brain_dir": str(brain_dir),
        "active_wiki_dir": str(active_wiki_dir),
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
# DASHBOARD_DIR is already resolved at module level (line 62)

@app.get("/")
def serve_dashboard():
    """Serve the main dashboard HTML."""
    return FileResponse(str(DASHBOARD_DIR / "index.html"))

@app.get("/styles.css")
def serve_styles():
    return FileResponse(str(DASHBOARD_DIR / "styles.css"), media_type="text/css")

@app.get("/tokens.css")
def serve_tokens():
    return FileResponse(str(DASHBOARD_DIR / "tokens.css"), media_type="text/css")

@app.get("/app.js")
def serve_app():
    return FileResponse(str(DASHBOARD_DIR / "app.js"), media_type="application/javascript")

@app.get("/enhance.js")
def serve_enhance():
    return FileResponse(str(DASHBOARD_DIR / "enhance.js"), media_type="application/javascript")


# ── Module File Serving ───────────────────────────────────────────────────────
_MODULE_CSS = ["layout.css", "briefing.css", "calendar.css", "tasks.css",
               "comms.css", "drawers.css", "services.css", "agent.css"]
_MODULE_JS = ["app-core.js", "app-data-fetch.js", "app-calendar.js", "app-tasks.js",
              "app-comms.js", "app-services.js", "app-crud.js", "app-agent.js", "ws-client.js"]

for _css in _MODULE_CSS:
    @app.get(f"/{_css}")
    def serve_css(_f=_css):
        return FileResponse(str(DASHBOARD_DIR / _f), media_type="text/css")

for _js in _MODULE_JS:
    @app.get(f"/{_js}")
    def serve_js(_f=_js):
        return FileResponse(str(DASHBOARD_DIR / _f), media_type="application/javascript")


# ── WebSocket Real-Time Updates ──────────────────────────────────────────────
import websockets
import threading

WS_HOST = "0.0.0.0"
WS_PORT = 8089
connected_clients: set = set()


async def ws_handler(websocket):
    """Handle WebSocket connections."""
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            # Echo back for keepalive
            await websocket.send(json.dumps({"type": "pong"}))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        connected_clients.discard(websocket)


async def broadcast_update(data: dict):
    """Broadcast update to all connected clients."""
    if not connected_clients:
        return
    payload = json.dumps(data)
    disconnected = set()
    for client in connected_clients:
        try:
            await client.send(payload)
        except websockets.exceptions.ConnectionClosed:
            disconnected.add(client)
    connected_clients.difference_update(disconnected)


def start_websocket_server():
    """Start WebSocket server in a background thread."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def run_ws():
        server = await websockets.serve(ws_handler, WS_HOST, WS_PORT)
        print(f"  WebSocket server: ws://{WS_HOST}:{WS_PORT}")
        await server.wait_closed()

    loop.run_until_complete(run_ws())


def run(host: str = "0.0.0.0", port: int = 8088):
    """Start the dashboard server."""
    print("=" * 60)
    print("  Autognosia COMMAND DECK — EXECUTIVE DASHBOARD")
    print(f"  Live UI available at: http://{host}:{port}")
    print(f"  API Docs available at: http://{host}:{port}/docs")

    # Start WebSocket server in background thread
    ws_thread = threading.Thread(target=start_websocket_server, daemon=True)
    ws_thread.start()

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
