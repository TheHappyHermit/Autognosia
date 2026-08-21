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

try:
    from fastapi import FastAPI, HTTPException, Query, Body
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse, JSONResponse
    import uvicorn
except ImportError:
    print("FastAPI / uvicorn not installed. Installing lightweight web dependencies...")
    subprocess.run([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"], check=True)
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
    
    return {
        "date": date_str,
        "summary": "Cognitive systems nominal. 3 priority deadlines scheduled today. 2 research packages ingested into Oracle Vault overnight.",
        "top_priorities": [
            "Finalize Neuro-Symbolic memory latency benchmark revisions for Dr. Thorne review.",
            "Review pull request #14 for GBrain PGLite hybrid vector recall optimization.",
            "Decant completed active project documentation to Oracle Brain."
        ],
        "prompt_me": "What single unblocked operational task would yield the greatest leverage for your goals today?",
        "weather": {"condition": "Optimal Focus", "temp": "68°F / 20°C"}
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
        INSERT INTO tasks (title, description, status, priority, due_at, project_id)
        VALUES (?, ?, ?, ?, ?, ?)
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
    cur.execute(f"UPDATE tasks SET {', '.join(updates)}, updated_at = datetime('now') WHERE id = ?", params)
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
        INSERT INTO intentions (title, cue, action, status)
        VALUES (?, ?, ?, ?)
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
        INSERT INTO reminders (title, remind_at, channel, notes, status)
        VALUES (?, ?, ?, ?, 'pending')
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

    # Profile configs — check both repo root and ~/.hermes for profile configs
    profiles = ["default", "oracle", "researcher", "planner", "auditor", "personal-organizer"]
    profile_status = {}
    for p in profiles:
        # Check repo root first (for dev setups), then ~/.hermes (for production)
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
        cur.execute("INSERT INTO tasks (title, priority, status) VALUES (?, ?, 'active')", (raw_task, priority))
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
        cur.execute("INSERT INTO reminders (title, remind_at, channel, status) VALUES (?, ?, 'all', 'pending')", (rem_title, remind_at))
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

# Mount static frontend
if DASHBOARD_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DASHBOARD_DIR), html=True), name="dashboard")

def run(host: str = "127.0.0.1", port: int = 8088):
    print(f"============================================================")
    print(f"  Autognosia COMMAND DECK — EXECUTIVE DASHBOARD")
    print(f"  Live UI available at: http://{host}:{port}")
    print(f"  API Docs available at: http://{host}:{port}/docs")
    print(f"============================================================")
    uvicorn.run(app, host=host, port=port, log_level="warning")

if __name__ == "__main__":
    port = 8088
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run(port=port)
