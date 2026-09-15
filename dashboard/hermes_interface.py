#!/usr/bin/env python3
"""
Autognosia Command Deck — Hermes Agent Interface Bridge.
Natively interfaces with NousResearch/hermes-agent via OpenAI-compatible Gateway
HTTP/SSE API (default port 8642) with graceful fallback to CLI subprocess execution.
Handles cron schedules, skills catalog, memory facts, sessions, and platform status.
"""

import os
import sys
import json
import shutil
import sqlite3
import subprocess
import asyncio
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, List, Optional, AsyncGenerator

import requests

# ── Cross-Platform Path & Binary Resolution ───────────────────────────────────

def get_hermes_home() -> Path:
    """Resolve the Hermes root directory across Windows, Linux, and Docker."""
    if os.environ.get("HERMES_HOME"):
        return Path(os.environ["HERMES_HOME"]).resolve()

    # Native Windows path
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        win_path = Path(local_app_data) / "hermes"
        if win_path.exists():
            return win_path

    # Standard POSIX / WSL home
    user_home = Path.home() / ".hermes"
    if user_home.exists():
        return user_home

    # Linux VM standard path
    vm_path = Path("/home/home_user/.hermes")
    if vm_path.exists():
        return vm_path

    # Autognosia workspace embedded fallback
    repo_hermes = Path(__file__).resolve().parent.parent / ".hermes"
    if repo_hermes.exists():
        return repo_hermes

    # Default to user home
    return Path.home() / ".hermes"


def get_hermes_binary() -> Optional[str]:
    """Resolve the hermes executable binary path."""
    bin_on_path = shutil.which("hermes")
    if bin_on_path:
        return bin_on_path

    # Common Windows paths
    local_app_data = os.environ.get("LOCALAPPDATA")
    if local_app_data:
        win_bin = Path(local_app_data) / "hermes" / "bin" / "hermes.exe"
        if win_bin.exists():
            return str(win_bin)
        win_cmd = Path(local_app_data) / "hermes" / "bin" / "hermes.cmd"
        if win_cmd.exists():
            return str(win_cmd)

    # Common Linux / macOS paths
    linux_candidates = [
        Path.home() / ".local" / "bin" / "hermes",
        Path("/usr/local/bin/hermes"),
        Path.home() / ".hermes" / "bin" / "hermes",
        Path.home() / ".cargo" / "bin" / "hermes",
        Path("/home/home_user/.local/bin/hermes"),
    ]
    for c in linux_candidates:
        if c.exists():
            return str(c)

    return None


# ── Hermes Gateway API Client (Port 8642) ──────────────────────────────────────

GATEWAY_DEFAULT_URL = os.environ.get("HERMES_GATEWAY_URL", "http://127.0.0.1:8642")
GATEWAY_API_KEY = os.environ.get("API_SERVER_KEY", os.environ.get("HERMES_API_KEY", ""))

def is_gateway_active() -> bool:
    """Check if the Hermes OpenAI-compatible Gateway API server is running on port 8642."""
    try:
        url = f"{GATEWAY_DEFAULT_URL}/health"
        headers = {}
        if GATEWAY_API_KEY:
            headers["Authorization"] = f"Bearer {GATEWAY_API_KEY}"
        resp = requests.get(url, headers=headers, timeout=1.5)
        if resp.status_code == 200:
            return True
    except Exception:
        pass

    # Fallback check on /v1/models
    try:
        url = f"{GATEWAY_DEFAULT_URL}/v1/models"
        headers = {}
        if GATEWAY_API_KEY:
            headers["Authorization"] = f"Bearer {GATEWAY_API_KEY}"
        resp = requests.get(url, headers=headers, timeout=1.5)
        return resp.status_code == 200
    except Exception:
        return False


def get_gateway_info() -> Dict[str, Any]:
    """Retrieve runtime information from the Hermes Gateway if available."""
    active = is_gateway_active()
    models = []
    if active:
        try:
            url = f"{GATEWAY_DEFAULT_URL}/v1/models"
            headers = {"Authorization": f"Bearer {GATEWAY_API_KEY}"} if GATEWAY_API_KEY else {}
            resp = requests.get(url, headers=headers, timeout=2.0)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("id") for m in data.get("data", [])]
        except Exception:
            pass

    return {
        "active": active,
        "url": GATEWAY_DEFAULT_URL,
        "port": 8642,
        "models": models,
        "mode": "gateway" if active else "cli_fallback",
    }


# ── Dual-Mode Message Dispatcher ──────────────────────────────────────────────

async def stream_agent_response(
    bot_id: str,
    message: str,
    session_id: str,
    organizer_db_path: Path
) -> AsyncGenerator[str, None]:
    """
    Stream response from Hermes Agent via Gateway HTTP API (if active)
    or CLI subprocess fallback, yielding properly framed SSE events:
      event: token\ndata: {"content": "..."}\n\n
      event: tool\ndata: {"tool": "...", "content": "..."}\n\n
      event: done\ndata: {"timestamp": "..."}\n\n
    """
    gateway_up = is_gateway_active()

    if gateway_up:
        # Use native Gateway HTTP/SSE streaming
        async for chunk in _stream_from_gateway(bot_id, message, session_id, organizer_db_path):
            yield chunk
    else:
        # Use CLI subprocess fallback
        async for chunk in _stream_from_cli(bot_id, message, session_id, organizer_db_path):
            yield chunk


async def _stream_from_gateway(
    bot_id: str,
    message: str,
    session_id: str,
    organizer_db_path: Path
) -> AsyncGenerator[str, None]:
    """Stream from Hermes OpenAI-compatible API endpoint /v1/chat/completions."""
    url = f"{GATEWAY_DEFAULT_URL}/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
    }
    if GATEWAY_API_KEY:
        headers["Authorization"] = f"Bearer {GATEWAY_API_KEY}"

    history_messages = _get_recent_history(organizer_db_path, bot_id, session_id, limit=8)
    history_messages.append({"role": "user", "content": message})

    payload = {
        "model": bot_id,
        "messages": history_messages,
        "stream": True,
    }

    full_reply = []
    try:
        loop = asyncio.get_event_loop()
        resp = await loop.run_in_executor(
            None,
            lambda: requests.post(url, json=payload, headers=headers, stream=True, timeout=120)
        )

        if resp.status_code != 200:
            err_text = resp.text[:300]
            yield f"event: error\ndata: {json.dumps({'error': f'Gateway HTTP {resp.status_code}: {err_text}'})}\n\n"
            return

        for line_bytes in resp.iter_lines():
            if not line_bytes:
                continue
            line = line_bytes.decode("utf-8", errors="replace").strip()
            if line.startswith("data: "):
                raw_data = line[6:].strip()
                if raw_data == "[DONE]":
                    break
                try:
                    chunk = json.loads(raw_data)
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    
                    # Tool call event
                    if "tool_calls" in delta:
                        tc = delta["tool_calls"]
                        tool_info = json.dumps(tc)
                        yield f"event: tool\ndata: {json.dumps({'tool': 'Agent Tool Call', 'content': tool_info})}\n\n"

                    # Token event
                    content = delta.get("content")
                    if content:
                        full_reply.append(content)
                        yield f"event: token\ndata: {json.dumps({'type': 'token', 'content': content})}\n\n"
                except Exception:
                    continue

        reply_text = "".join(full_reply).strip()
        if reply_text:
            _save_message_to_db(organizer_db_path, session_id, bot_id, "bot", reply_text)

        yield f"event: done\ndata: {json.dumps({'type': 'done', 'reply': reply_text, 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"

    except Exception as e:
        yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"


async def _stream_from_cli(
    bot_id: str,
    message: str,
    session_id: str,
    organizer_db_path: Path
) -> AsyncGenerator[str, None]:
    """Stream from hermes chat CLI with robust ANSI and box-drawing handling."""
    hermes_bin = get_hermes_binary()

    if not hermes_bin:
        msg = (
            "Hermes Agent binary not detected in PATH, %LOCALAPPDATA%\\hermes, or ~/.hermes/bin.\n"
            "Please ensure Hermes Agent is installed (`curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash` "
            "or native Windows install) or launch the Hermes Gateway."
        )
        yield f"event: token\ndata: {json.dumps({'type': 'token', 'content': msg})}\n\n"
        yield f"event: done\ndata: {json.dumps({'type': 'done', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
        return

    cmd = [
        hermes_bin, "chat", "-q", message,
        "--profile", bot_id,
        "-c", session_id,
        "--create-if-missing",
    ]

    env = {**os.environ}
    hermes_home = get_hermes_home()
    if (hermes_home / "bin").exists():
        env["PATH"] = f"{hermes_home / 'bin'}:{env.get('PATH', '')}"

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            env=env
        )

        full_reply = []
        past_header = False

        while True:
            line_bytes = await process.stdout.readline()
            if not line_bytes:
                break
            line = line_bytes.decode("utf-8", errors="replace").rstrip("\r\n")

            # Check header separation
            if not past_header:
                if "Hermes" in line and ("─" in line or "-" in line):
                    past_header = True
                    continue
                elif line.strip().startswith(("Query:", "Initializing agent", "Session", "───")):
                    continue
                elif line.strip():
                    if not any(k in line for k in ["Initializing", "Session"]):
                        past_header = True

            if not past_header:
                continue

            # Bottom separator
            if "─" * 8 in line or ("=" * 8 in line and past_header):
                break

            # Tool traces
            if line.strip().startswith("┊") or "Tool" in line or "tool_call" in line or "Calling" in line:
                clean_tool = line.strip().lstrip("┊").strip()
                if clean_tool:
                    yield f"event: tool\ndata: {json.dumps({'type': 'tool', 'tool': 'Execution Trace', 'content': clean_tool})}\n\n"
            elif line.strip():
                full_reply.append(line)
                chunk_text = line + "\n"
                yield f"event: token\ndata: {json.dumps({'type': 'token', 'content': chunk_text})}\n\n"

        await process.wait()

        reply_text = "\n".join(full_reply).strip()
        if reply_text:
            _save_message_to_db(organizer_db_path, session_id, bot_id, "bot", reply_text)

        yield f"event: done\ndata: {json.dumps({'type': 'done', 'reply': reply_text, 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"

    except Exception as err:
        yield f"event: error\ndata: {json.dumps({'error': str(err)})}\n\n"
        yield f"event: done\ndata: {json.dumps({'type': 'done', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"


def _get_recent_history(db_path: Path, bot_id: str, session_id: str, limit: int = 8) -> List[Dict[str, str]]:
    """Retrieve recent conversation history from SQLite for API context."""
    if not db_path.exists():
        return []
    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(
            "SELECT sender, message FROM chat_messages WHERE bot_id = ? AND session_id = ? ORDER BY id DESC LIMIT ?",
            (bot_id, session_id, limit)
        )
        rows = cur.fetchall()
        conn.close()
        msgs = []
        for r in reversed(rows):
            role = "assistant" if r["sender"] == "bot" else "user"
            msgs.append({"role": role, "content": r["message"]})
        return msgs
    except Exception:
        return []


def _save_message_to_db(db_path: Path, session_id: str, bot_id: str, sender: str, message: str) -> None:
    """Save user/bot message to SQLite chat_messages table."""
    try:
        conn = sqlite3.connect(str(db_path), timeout=5.0)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO chat_messages (session_id, bot_id, sender, message, created_at) VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'))",
            (session_id, bot_id, sender, message)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


# ── Cron Jobs Engine (jobs.json Synchronization) ───────────────────────────────

def get_cron_jobs_rich() -> Dict[str, Any]:
    """
    Parse ~/.hermes/cron/jobs.json and return rich job data:
    name, id, schedule expr, human display, enabled, target platform, prompt, next run estimate.
    """
    hermes_home = get_hermes_home()
    jobs_file = hermes_home / "cron" / "jobs.json"
    
    if not jobs_file.exists():
        alt_paths = [
            Path.home() / ".hermes" / "cron" / "jobs.json",
            Path(__file__).resolve().parent.parent / "cron" / "jobs.json",
        ]
        for p in alt_paths:
            if p.exists():
                jobs_file = p
                break

    jobs = []
    if jobs_file.exists():
        try:
            with open(jobs_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            raw_jobs = data.get("jobs", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
            for j in raw_jobs:
                schedule = j.get("schedule", {})
                if isinstance(schedule, dict):
                    expr = schedule.get("expr", "")
                    display = schedule.get("display", expr or "Scheduled")
                else:
                    expr = str(schedule)
                    display = expr

                platform = "local"
                prompt_lower = (j.get("prompt") or "").lower()
                cmd_lower = (j.get("command") or j.get("cmd") or "").lower()
                if "telegram" in prompt_lower or "telegram" in cmd_lower:
                    platform = "telegram"
                elif "discord" in prompt_lower or "discord" in cmd_lower:
                    platform = "discord"
                elif "email" in prompt_lower:
                    platform = "email"

                jobs.append({
                    "id": j.get("id") or j.get("name", "untitled"),
                    "name": j.get("name") or j.get("id", "Untitled Job"),
                    "schedule_expr": expr,
                    "schedule_display": display,
                    "enabled": j.get("enabled", True),
                    "platform": platform,
                    "target": j.get("target") or j.get("channel") or platform,
                    "prompt": (j.get("prompt") or "")[:150] + ("..." if len(j.get("prompt") or "") > 150 else ""),
                    "workdir": j.get("workdir", ""),
                    "last_run": j.get("last_run"),
                    "next_run_estimate": _estimate_next_run(expr, display),
                })
        except Exception as e:
            return {"jobs": [], "total": 0, "error": str(e), "file": str(jobs_file)}

    return {"jobs": jobs, "total": len(jobs), "file": str(jobs_file)}


def _estimate_next_run(expr: str, display: str) -> str:
    """Provide a human-readable estimate of the next run time."""
    if not expr and not display:
        return "Not scheduled"
    text = (display or expr).lower()
    if "every" in text or "daily" in text or "hour" in text or "minute" in text:
        return display or expr
    return "Next scheduled cycle"


def toggle_cron_job_state(job_id: str, enable: Optional[bool] = None) -> Dict[str, Any]:
    """Toggle a cron job enabled/disabled in jobs.json."""
    hermes_home = get_hermes_home()
    jobs_file = hermes_home / "cron" / "jobs.json"
    if not jobs_file.exists():
        return {"status": "error", "message": "jobs.json not found"}

    try:
        with open(jobs_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        found = False
        new_state = True
        for j in data.get("jobs", []):
            if j.get("id") == job_id or j.get("name") == job_id:
                if enable is None:
                    j["enabled"] = not j.get("enabled", True)
                else:
                    j["enabled"] = enable
                new_state = j["enabled"]
                found = True
                break

        if found:
            with open(jobs_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return {"status": "ok", "job_id": job_id, "enabled": new_state}
        else:
            return {"status": "error", "message": f"Job {job_id} not found in jobs.json"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Skills Catalog Explorer (agentskills.io) ───────────────────────────────────

def get_skills_catalog() -> Dict[str, Any]:
    """Scan ~/.hermes/skills/ and repo skills/ to parse agentskills.io metadata."""
    skills_dirs = [
        get_hermes_home() / "skills",
        Path.home() / ".hermes" / "skills",
        Path(__file__).resolve().parent.parent / "skills",
    ]

    seen = set()
    catalog = []

    for sdir in skills_dirs:
        if not sdir.exists():
            continue
        for item in sdir.iterdir():
            if not item.is_dir() or item.name in seen:
                continue
            skill_md = item / "SKILL.md"
            if not skill_md.exists():
                continue

            seen.add(item.name)
            name = item.name
            description = ""

            try:
                content = skill_md.read_text(encoding="utf-8", errors="ignore")
                lines = content.splitlines()
                in_frontmatter = False
                for line in lines:
                    if line.strip() == "---":
                        if not in_frontmatter:
                            in_frontmatter = True
                            continue
                        else:
                            in_frontmatter = False
                            continue
                    if in_frontmatter:
                        if line.startswith("name:"):
                            name = line.replace("name:", "").strip().strip('"\'')
                        elif line.startswith("description:"):
                            description = line.replace("description:", "").strip().strip('"\'')

                if not description:
                    for line in lines:
                        if line.strip() and not line.startswith("#") and not line.startswith("---"):
                            description = line.strip()
                            break

            except Exception:
                pass

            catalog.append({
                "id": item.name,
                "name": name,
                "description": description or f"Skill package for {item.name}",
                "path": str(skill_md),
                "is_active": True,
            })

    return {"skills": sorted(catalog, key=lambda s: s["name"]), "total": len(catalog)}


# ── Hot Memory Facts Management (MEMORY.md) ────────────────────────────────────

def get_hot_memory_details() -> Dict[str, Any]:
    """Read MEMORY.md, parse individual bulleted facts, calculate character budget."""
    candidates = [
        get_hermes_home() / "MEMORY.md",
        Path.home() / ".hermes" / "MEMORY.md",
        Path(__file__).resolve().parent.parent / "MEMORY.md",
    ]
    memory_file = None
    for c in candidates:
        if c.exists() and c.is_file():
            memory_file = c
            break

    content = ""
    if memory_file:
        try:
            content = memory_file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            pass

    chars_used = len(content)
    char_limit = 2200
    threshold = 1760  # 80% threshold
    percent_used = round((chars_used / char_limit) * 100, 1) if char_limit > 0 else 0

    facts = []
    lines = content.splitlines()
    for l in lines:
        s = l.strip()
        if s.startswith(("-", "*", "•")):
            fact_text = s.lstrip("-*• ").strip()
            if fact_text:
                category = "general"
                if ":" in fact_text:
                    prefix, _ = fact_text.split(":", 1)
                    if len(prefix) <= 20:
                        category = prefix.lower().strip()
                facts.append({
                    "text": fact_text,
                    "category": category,
                    "epistemic": "fact"
                })

    return {
        "file_exists": memory_file is not None,
        "file_path": str(memory_file) if memory_file else None,
        "chars_used": chars_used,
        "char_limit": char_limit,
        "threshold": threshold,
        "percent_used": percent_used,
        "needs_consolidation": chars_used >= threshold,
        "facts": facts,
        "raw_content": content,
    }


def add_or_update_memory_fact(fact_text: str) -> Dict[str, Any]:
    """Append or update a fact in MEMORY.md."""
    details = get_hot_memory_details()
    target_path = details["file_path"]
    if not target_path:
        target_path = str(get_hermes_home() / "MEMORY.md")
        Path(target_path).parent.mkdir(parents=True, exist_ok=True)

    fact_clean = fact_text.strip().lstrip("-*• ")
    new_entry = f"- {fact_clean}\n"

    try:
        with open(target_path, "a", encoding="utf-8") as f:
            f.write(new_entry)
        return {"status": "ok", "message": "Fact added to MEMORY.md", "entry": fact_clean}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Messaging Gateway Platform Status ──────────────────────────────────────────

def get_platform_channels_status() -> Dict[str, Any]:
    """Inspect configured messaging platforms (Telegram, Discord, Slack, etc.)."""
    hermes_home = get_hermes_home()
    config_file = hermes_home / "config.yaml"
    
    platforms = {
        "telegram": {"name": "Telegram", "icon": "✈️", "configured": False, "status": "offline"},
        "discord": {"name": "Discord", "icon": "👾", "configured": False, "status": "offline"},
        "slack": {"name": "Slack", "icon": "💬", "configured": False, "status": "offline"},
        "whatsapp": {"name": "WhatsApp", "icon": "📱", "configured": False, "status": "offline"},
        "signal": {"name": "Signal", "icon": "🔒", "configured": False, "status": "offline"},
    }

    if os.environ.get("TELEGRAM_BOT_TOKEN"):
        platforms["telegram"]["configured"] = True
        platforms["telegram"]["status"] = "configured"
    if os.environ.get("DISCORD_BOT_TOKEN"):
        platforms["discord"]["configured"] = True
        platforms["discord"]["status"] = "configured"
    if os.environ.get("SLACK_BOT_TOKEN"):
        platforms["slack"]["configured"] = True
        platforms["slack"]["status"] = "configured"

    if config_file.exists():
        try:
            import yaml
            with open(config_file, "r", encoding="utf-8") as f:
                cfg = yaml.safe_load(f) or {}
            gateway_cfg = cfg.get("gateway", {})
            for p in platforms:
                if p in gateway_cfg and gateway_cfg[p].get("enabled", False):
                    platforms[p]["configured"] = True
                    platforms[p]["status"] = "active"
        except Exception:
            pass

    gateway_running = is_gateway_active()
    for p in platforms:
        if platforms[p]["configured"] and gateway_running:
            platforms[p]["status"] = "online"

    return {
        "gateway_active": gateway_running,
        "platforms": platforms,
    }
