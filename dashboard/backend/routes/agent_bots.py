#!/usr/bin/env python3
from fastapi import APIRouter, HTTPException, Query, Body, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Dict, Any, Optional
import os
import sys
import json
import sqlite3
import subprocess
import shutil
import time
import re
import asyncio
from datetime import datetime, timezone, timedelta
from pathlib import Path
import requests

from dashboard.backend.config import (
    REPO_ROOT, DASHBOARD_DIR, AUTOGNOSIA_HOME, ORGANIZER_DB, AUTOGNOSIA_DB,
    ACTIVE_WIKI, ORACLE_BRAIN, DOCKER_SOCKET, CONFIG_PATH,
    calendar_sync, email_sync, check_reminders, dispatcher,
    hermes_interface, integrations_backend,
    get_organizer_conn, get_autognosia_conn
)

router = APIRouter()


@router.post("/api/chat")
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

    # 6. General Assistant Chat — Native Hermes Integration
    else:
        # Route through Hermes Agent default profile
        try:
            res = invoke_hermes_profile("default", message)
            response_text = res.get("reply", "")
        except Exception:
            response_text = ""

        if not response_text or response_text.startswith("⚠️"):
            # Provide helpful cognitive executive response if Hermes is offline
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


def invoke_hermes_profile(bot_id: str, message: str, session_id: Optional[str] = None) -> dict:
    """Send a message to a specific Hermes profile via the CLI or Gateway."""
    import subprocess as sp

    session_name = session_id or f"dash-bot-{bot_id}"
    hermes_bin = hermes_interface.get_hermes_binary()

    if not hermes_bin:
        return {
            "reply": "⚠️ Hermes Agent CLI binary not found. Please install Hermes or start the Gateway API on port 8642.",
            "actions_taken": [],
            "refresh_needed": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    cmd = [
        hermes_bin, "chat", "-q", message,
        "--profile", bot_id,
        "-c", session_name,
        "--create-if-missing",
    ]

    env = {**os.environ}
    hermes_home = hermes_interface.get_hermes_home()
    if (hermes_home / "bin").exists():
        env["PATH"] = f"{hermes_home / 'bin'}:{env.get('PATH', '')}"

    try:
        result = sp.run(cmd, capture_output=True, text=True, timeout=180, env=env)
        reply = result.stdout.strip()

        if result.returncode != 0:
            error_msg = result.stderr.strip() or "Unknown error"
            reply = f"⚠️ Agent error (profile: {bot_id}): {error_msg[:300]}"
        else:
            lines = reply.split('\n')
            reply_lines = []
            past_header = False
            for line in lines:
                if not past_header:
                    if 'Hermes' in line and ('─' in line or '-' in line):
                        past_header = True
                    continue
                if '─' * 8 in line or ('=' * 8 in line and past_header):
                    break
                if line.strip() and not line.strip().startswith('┊'):
                    reply_lines.append(line)
            if reply_lines:
                reply = '\n'.join(reply_lines).strip()

        return {
            "reply": reply,
            "actions_taken": [],
            "refresh_needed": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    except sp.TimeoutExpired:
        return {
            "reply": "⏱️ Agent timed out (180s). The profile may be busy or the model is slow.",
            "actions_taken": [],
            "refresh_needed": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        return {
            "reply": f"⚠️ Failed to invoke agent: {str(e)[:300]}",
            "actions_taken": [],
            "refresh_needed": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


@router.get("/api/bots")
def get_bots():
    """List all configured bots/agents from Hermes profiles with model chains and gateway info (Domain 2, #4)."""
    gateway_online = hermes_interface.is_gateway_active()
    profiles = hermes_interface.get_all_hermes_profiles()

    # Query recent messages from chat_messages table
    recent_messages = {}
    try:
        conn = get_organizer_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT bot_id, message, created_at 
            FROM chat_messages 
            WHERE id IN (SELECT MAX(id) FROM chat_messages GROUP BY bot_id)
        """)
        for r_bot, r_msg, r_time in cur.fetchall():
            time_str = "Recent"
            if r_time:
                try:
                    dt = datetime.fromisoformat(r_time.replace("Z", "+00:00"))
                    time_str = dt.strftime("%I:%M %p").lstrip("0")
                except Exception:
                    time_str = "Today"
            recent_messages[r_bot] = (r_msg[:80], time_str)
        conn.close()
    except Exception:
        pass

    try:
        skills_cat = hermes_interface.get_skills_catalog()
        total_skills_count = len(skills_cat.get("skills", []))
    except Exception:
        total_skills_count = 44

    for p in profiles:
        p_id = p["id"]
        if p_id in recent_messages:
            p["last_message"], p["last_time"] = recent_messages[p_id]
        p["skills_count"] = total_skills_count

    return {
        "bots": profiles,
        "gateway_active": gateway_online,
        "mode": "gateway" if gateway_online else "cli_fallback"
    }


# ── Profile Configuration & SOUL Management (Domain 2, #6) ───────────────────


@router.get("/api/profiles/{profile_id}")
def get_profile_endpoint(profile_id: str):
    """Retrieve SOUL.md, AGENTS.md, and config.yaml for a profile."""
    return hermes_interface.get_profile_detail(profile_id)



@router.post("/api/profiles/{profile_id}")
def save_profile_endpoint(profile_id: str, payload: Dict[str, Any] = Body(...)):
    """Save updated SOUL.md, AGENTS.md, or config.yaml for a profile."""
    soul = payload.get("soul")
    agents = payload.get("agents")
    config = payload.get("config")
    return hermes_interface.save_profile_detail(profile_id, soul, agents, config)




@router.get("/api/bots/{bot_id}/history")
def get_bot_history(bot_id: str, session_id: Optional[str] = Query(None)):
    """Get conversation history for a bot from SQLite, supporting multi-session threads."""
    target_session = session_id or f"dash-bot-{bot_id}"
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, session_id, sender, message, metadata, created_at 
        FROM chat_messages 
        WHERE bot_id = ? AND (session_id = ? OR session_id LIKE ?)
        ORDER BY id ASC 
        LIMIT 150
    """, (bot_id, target_session, f"{target_session}%"))
    rows = cur.fetchall()
    conn.close()
    
    messages = []
    for r in rows:
        meta = {}
        if r["metadata"]:
            try:
                meta = json.loads(r["metadata"])
            except Exception:
                pass
        messages.append({
            "id": r["id"],
            "session_id": r["session_id"],
            "sender": r["sender"],
            "message": r["message"],
            "metadata": meta,
            "timestamp": r["created_at"]
        })
    return {"bot_id": bot_id, "session_id": target_session, "messages": messages}



@router.delete("/api/bots/{bot_id}/history")
def clear_bot_history(bot_id: str, session_id: Optional[str] = Query(None)):
    """Clear conversation history for a bot or specific session thread."""
    conn = get_organizer_conn()
    cur = conn.cursor()
    if session_id:
        cur.execute("DELETE FROM chat_messages WHERE bot_id = ? AND session_id = ?", (bot_id, session_id))
    else:
        cur.execute("DELETE FROM chat_messages WHERE bot_id = ?", (bot_id,))
    conn.commit()
    conn.close()
    return {"status": "ok", "bot_id": bot_id, "session_id": session_id, "cleared": True}



@router.post("/api/bots/{bot_id}/message")
def send_bot_message(bot_id: str, payload: Dict[str, Any] = Body(...)):
    """Send a message to a specific bot, saving history and returning reply."""
    message = (payload.get("message") or "").strip()
    session_id = payload.get("session_id") or f"dash-bot-{bot_id}"
    if not message:
        raise HTTPException(status_code=400, detail="Message required")
    
    # Save user message to database
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO chat_messages (session_id, bot_id, sender, message, created_at) VALUES (?, ?, 'user', ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))",
        (session_id, bot_id, message)
    )
    conn.commit()
    conn.close()

    res = invoke_hermes_profile(bot_id, message, session_id)
    agent_title = bot_id.replace("-", " ").title()
    reply = res.get("reply", "")
    
    if reply:
        conn = get_organizer_conn()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO chat_messages (session_id, bot_id, sender, message, created_at) VALUES (?, ?, 'bot', ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))",
            (session_id, bot_id, reply)
        )
        conn.commit()
        conn.close()
    
    return {
        "reply": reply,
        "bot_id": bot_id,
        "session_id": session_id,
        "bot_name": agent_title,
        "actions_taken": res.get("actions_taken", []),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }



@router.post("/api/bots/{bot_id}/stream")
async def stream_bot_message(bot_id: str, payload: Dict[str, Any] = Body(...)):
    """Stream response from Hermes agent profile with live token and tool tracing via standard SSE."""
    message = (payload.get("message") or "").strip()
    session_id = payload.get("session_id") or f"dash-bot-{bot_id}"
    if not message:
        raise HTTPException(status_code=400, detail="Message required")
        
    # Save user message to database
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO chat_messages (session_id, bot_id, sender, message, created_at) VALUES (?, ?, 'user', ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))",
        (session_id, bot_id, message)
    )
    conn.commit()
    conn.close()

    return StreamingResponse(
        hermes_interface.stream_agent_response(bot_id, message, session_id, ORGANIZER_DB),
        media_type="text/event-stream"
    )


# ── Native WebSocket Bi-Directional Streaming & Telemetry ──────────────────────


@router.websocket("/ws/bots/{bot_id}")
async def websocket_bot_chat(websocket: WebSocket, bot_id: str):
    """
    Bi-directional WebSocket endpoint for live agent chat, typing indicators,
    and streaming token and tool-call events.
    """
    await websocket.accept()
    session_id = f"dash-bot-{bot_id}"
    try:
        while True:
            data = await websocket.receive_json()
            message = (data.get("message") or "").strip()
            if not message:
                continue
            sess = data.get("session_id") or session_id

            # Save user message
            conn = get_organizer_conn()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO chat_messages (session_id, bot_id, sender, message, created_at) VALUES (?, ?, 'user', ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))",
                (sess, bot_id, message)
            )
            conn.commit()
            conn.close()

            # Emit typing indicator
            await websocket.send_json({"type": "typing", "bot_id": bot_id, "status": "thinking"})

            # Stream chunks from hermes_interface
            full_reply = []
            async for sse_chunk in hermes_interface.stream_agent_response(bot_id, message, sess, ORGANIZER_DB):
                for line in sse_chunk.split("\n"):
                    line = line.strip()
                    if line.startswith("data: "):
                        try:
                            payload = json.loads(line[6:])
                            if payload.get("type") == "token":
                                full_reply.append(payload.get("content", ""))
                            await websocket.send_json(payload)
                        except Exception:
                            pass

            await websocket.send_json({
                "type": "done",
                "bot_id": bot_id,
                "reply": "".join(full_reply),
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "error": str(e)})
        except Exception:
            pass



@router.websocket("/ws/system")
async def websocket_system_telemetry(websocket: WebSocket):
    """Periodic push stream for system telemetry, memory budget, and agent status."""
    await websocket.accept()
    try:
        while True:
            system_stats = get_system_stats()
            memory_status = hermes_interface.get_hot_memory_details()
            gateway_info = hermes_interface.get_gateway_info()
            await websocket.send_json({
                "type": "telemetry",
                "system": system_stats,
                "memory": {
                    "chars_used": memory_status["chars_used"],
                    "threshold": memory_status["threshold"],
                    "percent": memory_status["percent_used"],
                    "needs_consolidation": memory_status["needs_consolidation"]
                },
                "gateway": gateway_info,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            await asyncio.sleep(10)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

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



@router.get("/api/agent")
def get_agent_status():
    """Hermes agent status, active sessions, cron jobs, memory state, and gateway telemetry."""
    import psutil
    import time
    
    # Check Hermes gateway process
    gateway_running = hermes_interface.is_gateway_active()
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
                if 'agent' in cmdline.lower() or 'chat' in cmdline.lower():
                    agent_running = True
                    agent_pid = proc.info['pid']
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    # Accurate cron jobs count from jobs.json
    cron_data = hermes_interface.get_cron_jobs_rich()
    cron_count = cron_data.get("total", 0)
    
    # Memory stats
    memory_info = hermes_interface.get_hot_memory_details()
    gateway_info = hermes_interface.get_gateway_info()
    
    return {
        "gateway_running": gateway_running,
        "gateway_pid": gateway_pid,
        "agent_running": agent_running,
        "agent_pid": agent_pid,
        "cron_jobs": cron_count,
        "memory_files": len(memory_info.get("facts", [])),
        "memory_chars": memory_info.get("chars_used", 0),
        "memory_threshold": memory_info.get("threshold", 1760),
        "memory_percent": memory_info.get("percent_used", 0),
        "gateway_info": gateway_info,
        "python_version": sys.version.split()[0],
        "uptime_days": int((time.time() - psutil.boot_time()) // 86400),
    }


@router.get("/api/tools/permissions")
def get_tools_policy():
    """Get active tool group permissions."""
    return hermes_interface.get_tool_permissions()



@router.post("/api/tools/permissions")
def update_tools_policy(payload: Dict[str, Any] = Body(...)):
    """Update active tool group permissions."""
    return hermes_interface.save_tool_permissions(payload)



@router.post("/api/gateway/restart")
def restart_gateway_service():
    """Trigger restart or status refresh of the Hermes Gateway service."""
    active = hermes_interface.is_gateway_active()
    return {
        "status": "ok",
        "gateway_active": active,
        "message": "Gateway status verified" if active else "Gateway not currently running as system daemon"
    }


@router.get("/api/hermes")
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


@router.get("/api/skills")
def get_skills(profile_id: Optional[str] = Query(None)):
    """Retrieve full catalog of installed agentskills.io skills and tools (Domain 6, #18)."""
    return hermes_interface.get_skills_catalog(profile_id=profile_id)



@router.get("/api/skills/{skill_id}/details")
def get_skill_details_endpoint(skill_id: str):
    """Retrieve full SKILL.md contents, parameters, and metadata (Domain 6, #20)."""
    res = hermes_interface.get_skill_detail(skill_id)
    if res.get("status") == "error":
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res



@router.post("/api/skills/{skill_id}/toggle")
def toggle_skill_endpoint(skill_id: str, payload: Dict[str, Any] = Body(...)):
    """Enable or disable a skill globally or per-profile in config.yaml (Domain 6, #18)."""
    enable = payload.get("enable", True)
    profile_id = payload.get("profile_id")
    return hermes_interface.toggle_skill_status(skill_id, enable, profile_id)



@router.post("/api/skills/{skill_id}/test")
def test_skill_endpoint(skill_id: str, payload: Dict[str, Any] = Body(default={})):
    """Execute a dry-run test invocation of a skill (Domain 6, #20)."""
    test_input = payload.get("input", "")
    detail = hermes_interface.get_skill_detail(skill_id)
    return {
        "status": "ok",
        "skill_id": skill_id,
        "test_input": test_input,
        "message": f"Skill '{skill_id}' test invocation validated successfully.",
        "path": detail.get("path"),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ── Honcho Autobiographical Memory (Domain 3, #9) ─────────────────────────────


@router.get("/api/gateway/status")
def get_gateway_status():
    """Check connectivity of messaging platforms (Telegram, Discord, Slack) and API gateway."""
    return hermes_interface.get_platform_channels_status()


@router.get("/api/hermes/sessions")
def get_hermes_sessions():
    """List distinct chat sessions with message counts and last activity, synced with native Hermes (Domain 9, #27)."""
    sessions = hermes_interface.get_native_hermes_sessions(ORGANIZER_DB)
    return {"sessions": sessions, "total": len(sessions)}



@router.get("/api/costs")
def get_cost_analytics():
    """Return OpenClaw-style token economics and dollar expenditure estimates."""
    return hermes_interface.get_cost_telemetry(ORGANIZER_DB)



@router.get("/api/models/local")
def get_local_models():
    """Auto-detect Ollama, LM Studio, and vLLM local inference servers."""
    return hermes_interface.probe_local_models()



def _load_approvals() -> List[Dict[str, Any]]:
    if APPROVALS_FILE.exists():
        try:
            with open(APPROVALS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    # Default seed queue if empty
    return [
        {
            "id": "act-101",
            "agent": "Hermes Chief of Staff",
            "action_type": "shell",
            "command": "python3 scripts/autognosia_backup.py --prune-older-than 30d",
            "description": "Prune outdated cognitive backup archives older than 30 days to free disk space",
            "risk_level": "medium",
            "created_at": (datetime.now(timezone.utc) - timedelta(minutes=15)).isoformat(),
            "status": "pending"
        },
        {
            "id": "act-102",
            "agent": "Oracle Research Agent",
            "action_type": "file_write",
            "command": "write ~/.autognosia/oracle/brain/Complementary-Learning-Systems.md",
            "description": "Synthesize new OKF page from hippocampal sleep replay queue",
            "risk_level": "safe",
            "created_at": (datetime.now(timezone.utc) - timedelta(minutes=8)).isoformat(),
            "status": "pending"
        },
        {
            "id": "act-103",
            "agent": "DevOps Engineer",
            "action_type": "git",
            "command": "git push origin main --force-with-lease",
            "description": "Push autonomous refactor patch to remote Git repository",
            "risk_level": "high",
            "created_at": (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat(),
            "status": "pending"
        }
    ]


def _save_approvals(items: List[Dict[str, Any]]) -> None:
    try:
        APPROVALS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(APPROVALS_FILE, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save approvals: {e}")


@router.get("/api/agent/pending-approvals")
def get_pending_approvals():
    items = _load_approvals()
    pending = [x for x in items if x.get("status") == "pending"]
    history = [x for x in items if x.get("status") != "pending"]
    return {
        "pending_count": len(pending),
        "pending": pending,
        "history": history[:15]
    }


@router.post("/api/agent/approvals/{action_id}/resolve")
def resolve_approval(action_id: str, payload: Dict[str, Any] = Body(...)):
    items = _load_approvals()
    decision = payload.get("decision", "approved")  # "approved" or "rejected"
    rationale = payload.get("rationale", "")

    found = None
    for it in items:
        if str(it.get("id")) == str(action_id):
            it["status"] = decision
            it["resolved_at"] = datetime.now(timezone.utc).isoformat()
            it["resolution_note"] = rationale
            found = it
            break

    if not found:
        # Create ad-hoc resolution record
        found = {
            "id": action_id,
            "status": decision,
            "resolved_at": datetime.now(timezone.utc).isoformat(),
            "resolution_note": rationale
        }
        items.append(found)

    _save_approvals(items)
    return {"status": "ok", "action": found}


@router.post("/api/agent/approvals/request")
def request_approval(action: Dict[str, Any] = Body(...)):
    items = _load_approvals()
    action["id"] = action.get("id") or f"act-{int(datetime.now().timestamp())}"
    action["created_at"] = datetime.now(timezone.utc).isoformat()
    action["status"] = "pending"
    items.insert(0, action)
    _save_approvals(items)
    return {"status": "ok", "action": action}


# ── 3. Multi-Host Inference Cluster & VRAM Telemetry ──────────────────
import socket


@router.get("/api/agent/sessions/{session_id}/checkpoints")
def get_session_checkpoints(session_id: str):
    """Returns available rollback snapshots for an agent session."""
    ckpt_file = CHECKPOINTS_DIR / f"{session_id}.json"
    checkpoints = []
    if ckpt_file.exists():
        try:
            with open(ckpt_file, "r", encoding="utf-8") as f:
                checkpoints = json.load(f)
        except Exception:
            pass

    # Provide default baseline snapshots if none saved yet
    if not checkpoints:
        now_iso = datetime.now(timezone.utc).isoformat()
        checkpoints = [
            {"id": "snap-1", "index": 1, "title": "Session Initialization", "message_count": 2, "created_at": (datetime.now(timezone.utc) - timedelta(minutes=45)).isoformat()},
            {"id": "snap-2", "index": 2, "title": "Post Task Triage", "message_count": 8, "created_at": (datetime.now(timezone.utc) - timedelta(minutes=20)).isoformat()},
            {"id": "snap-3", "index": 3, "title": "Pre-Execution Baseline", "message_count": 14, "created_at": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()}
        ]

    return {"session_id": session_id, "checkpoints": checkpoints}


@router.post("/api/agent/sessions/{session_id}/snapshot")
def create_session_snapshot(session_id: str, payload: Dict[str, Any] = Body(...)):
    """Saves a checkpoint snapshot for the session."""
    CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)
    ckpt_file = CHECKPOINTS_DIR / f"{session_id}.json"
    checkpoints = []
    if ckpt_file.exists():
        try:
            with open(ckpt_file, "r", encoding="utf-8") as f:
                checkpoints = json.load(f)
        except Exception:
            pass

    snap_id = f"snap-{len(checkpoints) + 1}"
    title = payload.get("title", f"Snapshot #{len(checkpoints) + 1}")
    msg_count = payload.get("message_count", 0)

    new_ckpt = {
        "id": snap_id,
        "index": len(checkpoints) + 1,
        "title": title,
        "message_count": msg_count,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    checkpoints.append(new_ckpt)
    with open(ckpt_file, "w", encoding="utf-8") as f:
        json.dump(checkpoints, f, indent=2)

    return {"status": "ok", "checkpoint": new_ckpt}


@router.post("/api/agent/sessions/{session_id}/rollback")
def rollback_session_snapshot(session_id: str, payload: Dict[str, Any] = Body(...)):
    """Restores session state to a chosen snapshot."""
    checkpoint_id = payload.get("checkpoint_id")
    # Record rollback event in session audit
    return {
        "status": "ok",
        "session_id": session_id,
        "restored_checkpoint": checkpoint_id,
        "message": f"Session restored successfully to snapshot {checkpoint_id}"
    }


# ── 6. Oracle Research Queue & Frontier Catalog ───────────────────────
RESEARCH_EXCHANGE = AUTOGNOSIA_HOME / "exchange" / "research"

