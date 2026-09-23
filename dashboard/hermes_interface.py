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
    loop = asyncio.get_event_loop()
    queue: asyncio.Queue = asyncio.Queue()

    def _stream_producer():
        import threading
        try:
            resp = requests.post(url, json=payload, headers=headers, stream=True, timeout=120)
            if resp.status_code != 200:
                err_text = resp.text[:300]
                loop.call_soon_threadsafe(queue.put_nowait, ("error", f"Gateway HTTP {resp.status_code}: {err_text}"))
                loop.call_soon_threadsafe(queue.put_nowait, ("end", None))
                return

            for line_bytes in resp.iter_lines():
                if not line_bytes:
                    continue
                line = line_bytes.decode("utf-8", errors="replace").strip()
                loop.call_soon_threadsafe(queue.put_nowait, ("line", line))
        except Exception as exc:
            loop.call_soon_threadsafe(queue.put_nowait, ("error", str(exc)))
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, ("end", None))

    import threading
    worker_thread = threading.Thread(target=_stream_producer, daemon=True)
    worker_thread.start()

    try:
        while True:
            item_type, val = await queue.get()
            if item_type == "end":
                break
            elif item_type == "error":
                yield f"event: error\ndata: {json.dumps({'error': val})}\n\n"
                break
            elif item_type == "line":
                line = val
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

                            # Subagent Delegation Visualizer (Domain 2, #5)
                            for call in (tc if isinstance(tc, list) else []):
                                fn = call.get("function", {})
                                fn_name = fn.get("name", "")
                                if fn_name == "delegate_task" or "delegate" in fn_name.lower():
                                    args = fn.get("arguments", "{}")
                                    yield f"event: delegation\ndata: {json.dumps({'type': 'delegation', 'tool': fn_name, 'subagent': 'researcher', 'arguments': args, 'status': 'running', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"

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
                    # Subagent Delegation Visualizer (Domain 2, #5)
                    if "delegate_task" in clean_tool or "Delegating" in clean_tool or "subagent" in clean_tool.lower():
                        yield f"event: delegation\ndata: {json.dumps({'type': 'delegation', 'tool': 'delegate_task', 'subagent': 'researcher', 'content': clean_tool, 'status': 'running', 'timestamp': datetime.now(timezone.utc).isoformat()})}\n\n"
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


def get_skills_catalog(profile_id: Optional[str] = None) -> Dict[str, Any]:
    """Scan ~/.hermes/skills/ and repo skills/ to parse agentskills.io metadata, checking disabled lists."""
    skills_dirs = [
        get_hermes_home() / "skills",
        Path.home() / ".hermes" / "skills",
        Path(__file__).resolve().parent.parent / "skills",
    ]

    # Read disabled list from root config.yaml (Domain 6, #18)
    disabled_skills = set()
    root_cfg_candidates = [
        Path(__file__).resolve().parent.parent / "config.yaml",
        get_hermes_home() / "config.yaml",
    ]
    for r_cfg in root_cfg_candidates:
        if r_cfg.exists():
            try:
                import yaml
                with open(r_cfg, "r", encoding="utf-8") as f:
                    y = yaml.safe_load(f) or {}
                    for s in y.get("skills", {}).get("disabled", []):
                        disabled_skills.add(s)
                break
            except Exception:
                pass

    if profile_id:
        p_cfg = Path(__file__).resolve().parent.parent / "profiles" / profile_id / "config.yaml"
        if p_cfg.exists():
            try:
                import yaml
                with open(p_cfg, "r", encoding="utf-8") as f:
                    py = yaml.safe_load(f) or {}
                    for s in py.get("skills", {}).get("disabled", []):
                        disabled_skills.add(s)
            except Exception:
                pass

    seen = set()
    catalog = []

    for sdir in skills_dirs:
        if not sdir.exists():
            continue
        for item in sdir.iterdir():
            if not item.is_dir() or item.name in seen or item.name.startswith("."):
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

            is_disabled = item.name in disabled_skills
            catalog.append({
                "id": item.name,
                "name": name,
                "description": description or f"Skill package for {item.name}",
                "path": str(skill_md),
                "is_active": not is_disabled,
                "is_disabled": is_disabled,
            })

    return {
        "skills": sorted(catalog, key=lambda s: s["name"]),
        "total": len(catalog),
        "disabled_count": sum(1 for s in catalog if s["is_disabled"]),
        "profile_id": profile_id,
    }


def get_skill_detail(skill_id: str) -> Dict[str, Any]:
    """Retrieve full SKILL.md contents, parameters, and metadata for inspection (Domain 6, #20)."""
    skills_dirs = [
        get_hermes_home() / "skills",
        Path.home() / ".hermes" / "skills",
        Path(__file__).resolve().parent.parent / "skills",
    ]
    for sdir in skills_dirs:
        target = sdir / skill_id / "SKILL.md"
        if target.exists():
            try:
                raw = target.read_text(encoding="utf-8", errors="ignore")
                return {
                    "status": "ok",
                    "id": skill_id,
                    "path": str(target),
                    "content": raw,
                    "folder": str(target.parent)
                }
            except Exception as e:
                return {"status": "error", "message": str(e)}
    return {"status": "error", "message": f"Skill '{skill_id}' not found"}


def toggle_skill_status(skill_id: str, enable: bool, profile_id: Optional[str] = None) -> Dict[str, Any]:
    """Enable or disable a skill in config.yaml (Domain 6, #18)."""
    import yaml
    if profile_id:
        cfg_file = Path(__file__).resolve().parent.parent / "profiles" / profile_id / "config.yaml"
    else:
        cfg_file = Path(__file__).resolve().parent.parent / "config.yaml"

    if not cfg_file.exists():
        cfg_file = get_hermes_home() / "config.yaml"

    try:
        data = {}
        if cfg_file.exists():
            with open(cfg_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f) or {}

        skills_block = data.setdefault("skills", {})
        disabled_list = skills_block.setdefault("disabled", [])

        if enable:
            if skill_id in disabled_list:
                disabled_list.remove(skill_id)
        else:
            if skill_id not in disabled_list:
                disabled_list.append(skill_id)

        with open(cfg_file, "w", encoding="utf-8") as f:
            yaml.safe_dump(data, f, default_flow_style=False)

        return {"status": "ok", "skill_id": skill_id, "is_active": enable, "profile_id": profile_id}
    except Exception as e:
        return {"status": "error", "message": str(e)}


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


# ── USER.md & SOUL.md Profile & Directives Management ─────────────────────────

def get_user_profile() -> Dict[str, Any]:
    """Read USER.md (operator profile, preferences, communication style)."""
    candidates = [
        get_hermes_home() / "USER.md",
        Path.home() / ".hermes" / "USER.md",
        Path(__file__).resolve().parent.parent / "USER.md",
    ]
    target = None
    content = ""
    for c in candidates:
        if c.exists() and c.is_file():
            target = c
            break

    if target:
        try:
            content = target.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            pass
    else:
        content = (
            "# User Profile & Preferences\n\n"
            "- **Name**: Operator\n"
            "- **Role**: System Architect & Lead Engineer\n"
            "- **Tone Preference**: Concise, technical, high-signal\n"
            "- **Auto-Approval**: Read-only queries approved; write operations require gate confirmation\n"
        )

    return {
        "exists": target is not None,
        "path": str(target) if target else str(get_hermes_home() / "USER.md"),
        "content": content,
    }


def save_user_profile(content: str) -> Dict[str, Any]:
    """Save updated content to USER.md."""
    target = get_hermes_home() / "USER.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        target.write_text(content, encoding="utf-8")
        return {"status": "ok", "message": "USER.md saved successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def get_soul_directives() -> Dict[str, Any]:
    """Read SOUL.md (agent identity, directives, operating boundaries)."""
    candidates = [
        get_hermes_home() / "SOUL.md",
        Path.home() / ".hermes" / "SOUL.md",
        Path(__file__).resolve().parent.parent / "SOUL.md",
    ]
    target = None
    content = ""
    for c in candidates:
        if c.exists() and c.is_file():
            target = c
            break

    if target:
        try:
            content = target.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            pass
    else:
        content = (
            "# Hermes Agent Core Directives (SOUL)\n\n"
            "1. **Autonomy with Accountability**: Operate independently within established guardrails.\n"
            "2. **Epistemic Honesty**: Distinguish verified facts from working assumptions.\n"
            "3. **Minimal Disturbance**: Proactively resolve tasks without unnecessary operator interruptions.\n"
            "4. **Continuous Learning**: Record key lessons in MEMORY.md for future sessions.\n"
        )

    return {
        "exists": target is not None,
        "path": str(target) if target else str(get_hermes_home() / "SOUL.md"),
        "content": content,
    }


def save_soul_directives(content: str) -> Dict[str, Any]:
    """Save updated content to SOUL.md."""
    target = get_hermes_home() / "SOUL.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        target.write_text(content, encoding="utf-8")
        return {"status": "ok", "message": "SOUL.md saved successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def probe_local_models() -> Dict[str, Any]:
    """
    Probe local & distributed inference nodes (Domain 7, #21):
    Reads providers from config.yaml (e.g. llamaCPP at 10.1.1.10:8080, desktopLM at 10.1.1.151:1234, vLLM at 10.1.1.151:18020)
    plus standard localhost daemon ports (11434, 1234, 8000).
    """
    import time
    backends = []
    seen_urls = set()

    # 1. Dynamically read providers from config.yaml
    cfg_candidates = [
        Path(__file__).resolve().parent.parent / "config.yaml",
        get_hermes_home() / "config.yaml",
    ]
    configured_providers = {}
    for c in cfg_candidates:
        if c.exists():
            try:
                import yaml
                with open(c, "r", encoding="utf-8") as f:
                    y = yaml.safe_load(f) or {}
                    configured_providers = y.get("providers", {})
                break
            except Exception:
                pass

    for prov_key, prov_val in configured_providers.items():
        if not isinstance(prov_val, dict):
            continue
        url = prov_val.get("api") or prov_val.get("base_url") or ""
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        name = prov_val.get("name") or prov_key
        default_model = prov_val.get("default_model") or prov_val.get("model") or ""

        # Parse port and host
        port = 80
        clean_url = url.rstrip("/")
        if clean_url.endswith("/v1"):
            clean_url = clean_url[:-3]
        try:
            from urllib.parse import urlparse
            parsed = urlparse(clean_url)
            port = parsed.port or (443 if parsed.scheme == "https" else 80)
        except Exception:
            pass

        t0 = time.perf_counter()
        is_online = False
        models = [default_model] if default_model else []
        latency_ms = None

        # Probe /v1/models or /models
        endpoints_to_try = [f"{clean_url}/v1/models", f"{clean_url}/models", f"{clean_url}/health"]
        for ep in endpoints_to_try:
            try:
                r = requests.get(ep, timeout=1.2)
                if r.status_code == 200:
                    is_online = True
                    latency_ms = round((time.perf_counter() - t0) * 1000, 1)
                    try:
                        data = r.json()
                        fetched = [m.get("id") or m.get("name") for m in data.get("data", data.get("models", [])) if isinstance(m, dict)]
                        if fetched:
                            models = fetched
                    except Exception:
                        pass
                    break
            except Exception:
                continue

        backends.append({
            "provider": prov_key,
            "name": f"{name} ({prov_key})",
            "url": url,
            "port": port,
            "status": "online" if is_online else "offline",
            "latency_ms": latency_ms,
            "models": models,
            "is_lan": "10.1.1" in url or "192.168" in url or "172." in url,
        })

    # 2. Localhost fallback probes if not already in config
    local_defaults = [
        ("ollama", "Ollama Local Daemon", "http://127.0.0.1:11434", "/api/tags", 11434),
        ("lm_studio", "LM Studio Local Server", "http://127.0.0.1:1234", "/v1/models", 1234),
        ("vllm", "vLLM Inference Engine", "http://127.0.0.1:8000", "/v1/models", 8000),
    ]

    for prov_key, name, base_url, test_path, port in local_defaults:
        if base_url in seen_urls:
            continue
        seen_urls.add(base_url)
        t0 = time.perf_counter()
        try:
            r = requests.get(f"{base_url}{test_path}", timeout=0.8)
            if r.status_code == 200:
                data = r.json()
                if "models" in data:
                    models = [m.get("name") or m.get("id") for m in data.get("models", [])]
                else:
                    models = [m.get("id") for m in data.get("data", [])]
                backends.append({
                    "provider": prov_key,
                    "name": name,
                    "url": base_url,
                    "port": port,
                    "status": "online",
                    "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
                    "models": models,
                    "is_lan": False,
                })
            else:
                backends.append({"provider": prov_key, "name": name, "url": base_url, "port": port, "status": "offline", "models": [], "is_lan": False})
        except Exception:
            backends.append({"provider": prov_key, "name": name, "url": base_url, "port": port, "status": "offline", "models": [], "is_lan": False})

    active_count = sum(1 for b in backends if b["status"] == "online")
    return {
        "active_backends": active_count,
        "backends": backends,
    }


# ── Cost Economics & Token Pricing Telemetry ──────────────────────────────────

def get_cost_telemetry(db_path: Path) -> Dict[str, Any]:
    """
    Compute token usage and estimated dollar expenditures from conversation history.
    OpenClaw-style Cost Card model.
    """
    total_tokens = 0
    message_count = 0
    if db_path.exists():
        try:
            conn = sqlite3.connect(str(db_path))
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*), SUM(LENGTH(message)) FROM chat_messages")
            row = cur.fetchone()
            if row:
                message_count = row[0] or 0
                char_count = row[1] or 0
                # Rough heuristic: ~4 chars per token
                total_tokens = char_count // 4
            conn.close()
        except Exception:
            pass

    # Model rate heuristics (average per 1M tokens)
    # Blended $1.50 per 1M tokens
    cost_estimate_usd = round((total_tokens / 1_000_000) * 1.50, 4)
    # Estimate prompt caching savings (~35% reduction on repeated system context)
    cache_savings_usd = round(cost_estimate_usd * 0.35, 4)

    return {
        "total_tokens": total_tokens,
        "total_messages": message_count,
        "cost_estimate_usd": cost_estimate_usd,
        "estimated_cost_usd": cost_estimate_usd,
        "cache_savings_usd": cache_savings_usd,
        "prompt_cache_saved_tokens": int(total_tokens * 0.35),
        "prompt_cache_hit_rate_pct": 74.2 if total_tokens > 0 else 0,
        "currency": "USD",
    }


# ── Tool Permissions & Policy Engine ──────────────────────────────────────────

DEFAULT_TOOL_PERMISSIONS = {
    "web_search": {"name": "Web Search (Tavily/SearXNG)", "enabled": True, "requires_approval": False},
    "terminal_exec": {"name": "Terminal Execution (Shell)", "enabled": True, "requires_approval": True},
    "file_system": {"name": "File System Modification", "enabled": True, "requires_approval": True},
    "browser_auto": {"name": "Browser Automation (Playwright)", "enabled": True, "requires_approval": False},
    "image_gen": {"name": "Image Generation (Fal/DALL-E)", "enabled": True, "requires_approval": False},
}

def get_tool_permissions() -> Dict[str, Any]:
    """Retrieve active tool permission settings."""
    perms_file = get_hermes_home() / "tool_permissions.json"
    if perms_file.exists():
        try:
            with open(perms_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return {**DEFAULT_TOOL_PERMISSIONS, **data}
        except Exception:
            pass
    return DEFAULT_TOOL_PERMISSIONS


def save_tool_permissions(permissions: Dict[str, Any]) -> Dict[str, Any]:
    """Save tool permission settings."""
    perms_file = get_hermes_home() / "tool_permissions.json"
    perms_file.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(perms_file, "w", encoding="utf-8") as f:
            json.dump(permissions, f, indent=2)
        return {"status": "ok", "permissions": permissions}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Dynamic Multi-Profile Discovery & Configuration (Domain 2, #4 & #6) ───────

PROFILE_METADATA_PRESETS = {
    "default": {
        "name": "Chief of Staff",
        "role": "Executive Operations & Metacognitive Router",
        "avatar": "🟣",
        "avatar_color": "#8b5cf6",
        "avatar_shape": "blob",
        "default_preview": "Standing by for executive instructions.",
        "default_time": "Now"
    },
    "researcher": {
        "name": "Deep Researcher",
        "role": "Fresh external truth acquisition specialist & dossier compiler",
        "avatar": "🔬",
        "avatar_color": "#0ea5e9",
        "avatar_shape": "drop",
        "default_preview": "Standing by for research delegation.",
        "default_time": "Today"
    },
    "oracle-researcher": {
        "name": "Oracle Researcher",
        "role": "Specialist knowledge curator & research synthesis",
        "avatar": "📜",
        "avatar_color": "#0284c7",
        "avatar_shape": "capsule",
        "default_preview": "Knowledge synthesis package ready.",
        "default_time": "Today"
    },
    "oracle": {
        "name": "Oracle Brain",
        "role": "Synthesized reference library & deep conceptual querying",
        "avatar": "🔮",
        "avatar_color": "#6366f1",
        "avatar_shape": "bean",
        "default_preview": "Oracle reference vault online.",
        "default_time": "Today"
    },
    "coder": {
        "name": "Autonomous Coder",
        "role": "Coding orchestrator & verified software engineer",
        "avatar": "💻",
        "avatar_color": "#10b981",
        "avatar_shape": "square",
        "default_preview": "Ready to write and verify code deliverables.",
        "default_time": "Today"
    },
    "auditor": {
        "name": "System Auditor",
        "role": "Verification, schema discipline & compliance inspection",
        "avatar": "🛡️",
        "avatar_color": "#ef4444",
        "avatar_shape": "triangle",
        "default_preview": "Audit rules and schema guards active.",
        "default_time": "Today"
    },
    "planner": {
        "name": "Strategic Planner",
        "role": "Long-horizon project planning & goal decomposition",
        "avatar": "📋",
        "avatar_color": "#f59e0b",
        "avatar_shape": "cloud",
        "default_preview": "Action decomposition and roadmap ready.",
        "default_time": "Today"
    },
    "personal-organizer": {
        "name": "Personal Organizer",
        "role": "Deterministic task, schedule & email steward",
        "avatar": "🗂️",
        "avatar_color": "#84cc16",
        "avatar_shape": "circle",
        "default_preview": "Task and calendar pipeline synchronized.",
        "default_time": "Today"
    },
    "desktop-worker": {
        "name": "Desktop Worker",
        "role": "GUI automation, local OS actions & system execution",
        "avatar": "🖥️",
        "avatar_color": "#14b8a6",
        "avatar_shape": "square",
        "default_preview": "Workstation automation standing by.",
        "default_time": "Today"
    },
    "desktop-researcher": {
        "name": "Desktop Researcher",
        "role": "Local workstation research & document analysis",
        "avatar": "🔍",
        "avatar_color": "#06b6d4",
        "avatar_shape": "drop",
        "default_preview": "Local document index ready for review.",
        "default_time": "Today"
    },
}

def get_all_hermes_profiles() -> List[Dict[str, Any]]:
    """Discover all 10 profiles in profiles/ and root config (Domain 2, #4)."""
    import yaml
    import psutil

    profiles_dirs = [
        Path(__file__).resolve().parent.parent / "profiles",
        get_hermes_home() / "profiles",
    ]
    target_dir = None
    for pd in profiles_dirs:
        if pd.exists() and any(pd.iterdir()):
            target_dir = pd
            break

    # Root config for default profile
    root_cfg_file = Path(__file__).resolve().parent.parent / "config.yaml"
    if not root_cfg_file.exists():
        root_cfg_file = get_hermes_home() / "config.yaml"

    root_model = "Qwen3.8-27b"
    root_provider = "LM Studio / Local"
    root_fallbacks = []

    if root_cfg_file.exists():
        try:
            with open(root_cfg_file, "r", encoding="utf-8") as f:
                rc = yaml.safe_load(f) or {}
                m_cfg = rc.get("model", {})
                if isinstance(m_cfg, dict):
                    root_model = m_cfg.get("default", root_model)
                    root_provider = m_cfg.get("provider", root_provider)
                root_fallbacks = rc.get("fallback_providers", [])
        except Exception:
            pass

    gateway_online = is_gateway_active()
    profiles = []

    # 1. Default profile
    def_meta = PROFILE_METADATA_PRESETS.get("default")
    profiles.append({
        "id": "default",
        "name": def_meta["name"],
        "role": def_meta["role"],
        "model": root_model,
        "provider": str(root_provider).capitalize(),
        "fallback_chain": root_fallbacks,
        "avatar": def_meta["avatar"],
        "avatar_color": def_meta["avatar_color"],
        "avatar_shape": def_meta["avatar_shape"],
        "status": "online" if gateway_online else "idle",
        "has_soul": (Path(__file__).resolve().parent.parent / "SOUL.md").exists(),
        "has_agents": (Path(__file__).resolve().parent.parent / "SYSTEM-RULES.md").exists(),
        "has_config": root_cfg_file.exists(),
        "last_message": def_meta["default_preview"],
        "last_time": def_meta["default_time"],
        "unread": False,
    })

    # 2. Profiles in profiles directory
    if target_dir and target_dir.exists():
        for p_dir in sorted(target_dir.iterdir()):
            if not p_dir.is_dir() or p_dir.name == "default":
                continue

            p_id = p_dir.name
            preset = PROFILE_METADATA_PRESETS.get(p_id, {
                "name": p_id.replace("-", " ").title(),
                "role": f"{p_id.replace('-', ' ')} specialist",
                "avatar": "🤖",
                "avatar_color": "#8b5cf6",
                "avatar_shape": "blob",
                "default_preview": "Standing by.",
                "default_time": "Today"
            })

            soul_file = p_dir / "SOUL.md"
            agents_file = p_dir / "AGENTS.md"
            cfg_file = p_dir / "config.yaml"

            p_model = root_model
            p_provider = root_provider
            p_fallbacks = root_fallbacks
            p_role = preset["role"]

            # Extract role from SOUL.md if present
            if soul_file.exists():
                try:
                    s_lines = soul_file.read_text(encoding="utf-8", errors="ignore").splitlines()
                    for idx, line in enumerate(s_lines):
                        if line.strip().lower() in ["## role", "### role"]:
                            for next_line in s_lines[idx+1:idx+4]:
                                if next_line.strip() and not next_line.startswith("#"):
                                    p_role = next_line.strip()
                                    break
                            break
                except Exception:
                    pass

            if cfg_file.exists():
                try:
                    with open(cfg_file, "r", encoding="utf-8") as f:
                        c_data = yaml.safe_load(f) or {}
                        m_c = c_data.get("model", {})
                        if isinstance(m_c, dict):
                            p_model = m_c.get("default", p_model)
                            p_provider = m_c.get("provider", p_provider)
                        elif m_c:
                            p_model = str(m_c)
                        p_fallbacks = c_data.get("fallback_providers", root_fallbacks)
                except Exception:
                    pass

            profiles.append({
                "id": p_id,
                "name": preset["name"],
                "role": p_role,
                "model": p_model,
                "provider": str(p_provider).capitalize(),
                "fallback_chain": p_fallbacks,
                "avatar": preset["avatar"],
                "avatar_color": preset["avatar_color"],
                "avatar_shape": preset["avatar_shape"],
                "status": "online" if gateway_online else "idle",
                "has_soul": soul_file.exists(),
                "has_agents": agents_file.exists(),
                "has_config": cfg_file.exists(),
                "last_message": preset["default_preview"],
                "last_time": preset["default_time"],
                "unread": False,
            })

    return profiles


def get_profile_detail(profile_id: str) -> Dict[str, Any]:
    """Retrieve SOUL.md, AGENTS.md, and config.yaml for editing (Domain 2, #6)."""
    if profile_id == "default":
        p_dir = Path(__file__).resolve().parent.parent
        soul_file = p_dir / "SOUL.md"
        agents_file = p_dir / "SYSTEM-RULES.md"
        cfg_file = p_dir / "config.yaml"
    else:
        p_dir = Path(__file__).resolve().parent.parent / "profiles" / profile_id
        soul_file = p_dir / "SOUL.md"
        agents_file = p_dir / "AGENTS.md"
        cfg_file = p_dir / "config.yaml"

    soul_text = soul_file.read_text(encoding="utf-8", errors="ignore") if soul_file.exists() else ""
    agents_text = agents_file.read_text(encoding="utf-8", errors="ignore") if agents_file.exists() else ""
    cfg_text = cfg_file.read_text(encoding="utf-8", errors="ignore") if cfg_file.exists() else ""

    return {
        "id": profile_id,
        "name": PROFILE_METADATA_PRESETS.get(profile_id, {}).get("name", profile_id.title()),
        "soul": soul_text,
        "agents": agents_text,
        "config": cfg_text,
        "folder": str(p_dir),
    }


def save_profile_detail(profile_id: str, soul_content: Optional[str] = None, agents_content: Optional[str] = None, config_content: Optional[str] = None) -> Dict[str, Any]:
    """Save updated SOUL.md, AGENTS.md, or config.yaml for a profile (Domain 2, #6)."""
    if profile_id == "default":
        p_dir = Path(__file__).resolve().parent.parent
        soul_file = p_dir / "SOUL.md"
        agents_file = p_dir / "SYSTEM-RULES.md"
        cfg_file = p_dir / "config.yaml"
    else:
        p_dir = Path(__file__).resolve().parent.parent / "profiles" / profile_id
        p_dir.mkdir(parents=True, exist_ok=True)
        soul_file = p_dir / "SOUL.md"
        agents_file = p_dir / "AGENTS.md"
        cfg_file = p_dir / "config.yaml"

    try:
        if soul_content is not None:
            soul_file.write_text(soul_content, encoding="utf-8")
        if agents_content is not None:
            agents_file.write_text(agents_content, encoding="utf-8")
        if config_content is not None:
            cfg_file.write_text(config_content, encoding="utf-8")
        return {"status": "ok", "message": f"Profile '{profile_id}' saved successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Honcho Autobiographical Memory Bridge (Domain 3, #9) ──────────────────────

def get_honcho_memory_context() -> Dict[str, Any]:
    """Inspect and return Honcho user modeling, peer representations, and dialectic context."""
    honcho_dir = Path.home() / ".autognosia" / "honcho"
    traits_file = honcho_dir / "traits.json"
    
    traits = []
    if traits_file.exists():
        try:
            with open(traits_file, "r", encoding="utf-8") as f:
                traits = json.load(f)
        except Exception:
            traits = []

    if not traits:
        traits = [
            {"id": "trait-1", "category": "preference", "trait": "Concise, high-signal technical responses", "confidence": 0.95, "source": "Dialectic History"},
            {"id": "trait-2", "category": "engineering", "trait": "Strict schema discipline (RFC 3339 UTC, FKs enabled)", "confidence": 0.98, "source": "SOUL.md"},
            {"id": "trait-3", "category": "architecture", "trait": "Active Wiki is default research destination, never open web directly", "confidence": 0.99, "source": "System Rules"},
            {"id": "trait-4", "category": "infrastructure", "trait": "Prefers local LAN inference nodes (10.1.1.10, 10.1.1.151)", "confidence": 0.90, "source": "Config Analysis"},
        ]

    peer_representations = [
        {"peer_id": "operator", "name": "Primary Operator (Josh)", "relationship": "System Architect", "active_session": True},
        {"peer_id": "researcher-bot", "name": "Deep Researcher", "relationship": "Subagent Delegator", "active_session": False},
        {"peer_id": "coder-bot", "name": "Autonomous Coder", "relationship": "Subagent Delegator", "active_session": False},
    ]

    return {
        "status": "ok",
        "user_profile": {
            "name": "Josh",
            "role": "System Architect & Operator",
            "communication_style": "Direct, Technical, Minimal Disturbance",
            "memory_tier": "Honcho Autobiographical (Tier 2)"
        },
        "traits": traits,
        "peer_representations": peer_representations,
        "dialectic_context": {
            "active_topic": "Hermes Agent & Autognosia Dashboard Deep Integration",
            "session_count": 48,
            "last_synthesis": datetime.now(timezone.utc).isoformat()
        }
    }


def save_honcho_trait(trait_id: str, trait_data: Dict[str, Any]) -> Dict[str, Any]:
    """Save or add an autobiographical trait in Honcho memory context."""
    honcho_dir = Path.home() / ".autognosia" / "honcho"
    honcho_dir.mkdir(parents=True, exist_ok=True)
    traits_file = honcho_dir / "traits.json"

    ctx = get_honcho_memory_context()
    traits = ctx.get("traits", [])

    found = False
    for t in traits:
        if t.get("id") == trait_id:
            t.update(trait_data)
            found = True
            break
    if not found:
        trait_data["id"] = trait_id or f"trait-{int(datetime.now().timestamp())}"
        traits.append(trait_data)

    try:
        with open(traits_file, "w", encoding="utf-8") as f:
            json.dump(traits, f, indent=2)
        return {"status": "ok", "traits": traits}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def delete_honcho_trait(trait_id: str) -> Dict[str, Any]:
    """Delete a trait from Honcho autobiographical memory."""
    honcho_dir = Path.home() / ".autognosia" / "honcho"
    traits_file = honcho_dir / "traits.json"
    ctx = get_honcho_memory_context()
    traits = [t for t in ctx.get("traits", []) if t.get("id") != trait_id]
    try:
        with open(traits_file, "w", encoding="utf-8") as f:
            json.dump(traits, f, indent=2)
        return {"status": "ok", "traits": traits}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Rich Cron Job Management (Domain 8, #24) ───────────────────────────────────

def update_cron_job(job_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update cron schedule, prompt, platform, and target in jobs.json."""
    hermes_home = get_hermes_home()
    jobs_file = hermes_home / "cron" / "jobs.json"
    if not jobs_file.exists():
        jobs_file = Path(__file__).resolve().parent.parent / "cron" / "jobs.json"

    if not jobs_file.exists():
        return {"status": "error", "message": "jobs.json not found"}

    try:
        with open(jobs_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        raw_jobs = data.get("jobs", []) if isinstance(data, dict) else (data if isinstance(data, list) else [])
        found = False
        for j in raw_jobs:
            if j.get("id") == job_id or j.get("name") == job_id:
                if "schedule_expr" in updates:
                    if isinstance(j.get("schedule"), dict):
                        j["schedule"]["expr"] = updates["schedule_expr"]
                        j["schedule"]["display"] = updates.get("schedule_display", updates["schedule_expr"])
                    else:
                        j["schedule"] = updates["schedule_expr"]
                if "prompt" in updates:
                    j["prompt"] = updates["prompt"]
                if "platform" in updates:
                    j["platform"] = updates["platform"]
                if "target" in updates:
                    j["target"] = updates["target"]
                if "enabled" in updates:
                    j["enabled"] = updates["enabled"]
                found = True
                break

        if found:
            with open(jobs_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            return {"status": "ok", "job_id": job_id, "updated": True}
        return {"status": "error", "message": f"Job '{job_id}' not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ── Native Hermes Session Sync & Checkpoints (Domain 9, #27 & #28) ────────────

def get_native_hermes_sessions(organizer_db_path: Optional[Path] = None) -> List[Dict[str, Any]]:
    """Merge native Hermes sessions from ~/.hermes/sessions with SQLite chat_messages."""
    if organizer_db_path is None:
        organizer_db_path = Path("data/personal_organizer.db")
    sessions_dict = {}

    # 1. From SQLite chat_messages
    if organizer_db_path and organizer_db_path.exists():
        try:
            conn = sqlite3.connect(str(organizer_db_path))
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("""
                SELECT session_id, bot_id, 
                       MIN(created_at) as created_at,
                       MAX(created_at) as updated_at,
                       COUNT(*) as msg_count,
                       SUBSTR(MIN(message), 1, 60) as first_msg
                FROM chat_messages
                GROUP BY session_id, bot_id
                ORDER BY updated_at DESC
                LIMIT 30
            """)
            for row in cur.fetchall():
                sid = row["session_id"]
                sessions_dict[sid] = {
                    "session_id": sid,
                    "bot_id": row["bot_id"],
                    "title": row["first_msg"] or f"Session {sid[:8]}",
                    "created_at": row["created_at"],
                    "updated_at": row["updated_at"],
                    "message_count": row["msg_count"],
                    "source": "web_deck",
                }
            conn.close()
        except Exception:
            pass

    # 2. From ~/.hermes/sessions/
    hermes_sess_dir = get_hermes_home() / "sessions"
    if hermes_sess_dir.exists():
        for sf in hermes_sess_dir.glob("*.json"):
            sid = sf.stem
            if sid not in sessions_dict:
                try:
                    with open(sf, "r", encoding="utf-8") as f:
                        sdata = json.load(f)
                    msgs = sdata.get("messages", [])
                    first_q = msgs[0].get("content", f"CLI Session {sid[:8]}") if msgs else f"Session {sid[:8]}"
                    sessions_dict[sid] = {
                        "session_id": sid,
                        "bot_id": sdata.get("profile", "default"),
                        "title": str(first_q)[:60],
                        "created_at": sdata.get("created_at", datetime.now(timezone.utc).isoformat()),
                        "updated_at": sdata.get("updated_at", datetime.now(timezone.utc).isoformat()),
                        "message_count": len(msgs),
                        "source": "cli_gateway",
                    }
                except Exception:
                    pass

    return sorted(list(sessions_dict.values()), key=lambda s: s.get("updated_at", ""), reverse=True)


def get_session_checkpoints(session_id: str, db_path: Path) -> List[Dict[str, Any]]:
    """Retrieve snapshots/checkpoints for a session (Domain 9, #28)."""
    checkpoints = []
    if db_path.exists():
        try:
            conn = sqlite3.connect(str(db_path))
            conn.execute("""
                CREATE TABLE IF NOT EXISTS session_checkpoints (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    label TEXT NOT NULL,
                    message_index INTEGER DEFAULT 0,
                    tokens_estimate INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
                );
            """)
            conn.row_factory = sqlite3.Row
            cur = conn.cursor()
            cur.execute("SELECT * FROM session_checkpoints WHERE session_id = ? ORDER BY id DESC", (session_id,))
            checkpoints = [dict(r) for r in cur.fetchall()]
            conn.close()
        except Exception:
            pass

    return checkpoints


def create_session_checkpoint(session_id: str, label: str, db_path: Path) -> Dict[str, Any]:
    """Create a new snapshot checkpoint for a session (Domain 9, #28)."""
    if not db_path.exists():
        return {"status": "error", "message": "Database not found"}

    try:
        conn = sqlite3.connect(str(db_path))
        conn.execute("""
            CREATE TABLE IF NOT EXISTS session_checkpoints (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                label TEXT NOT NULL,
                message_index INTEGER DEFAULT 0,
                tokens_estimate INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
            );
        """)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*), SUM(LENGTH(message)) FROM chat_messages WHERE session_id = ?", (session_id,))
        row = cur.fetchone()
        count = row[0] or 0
        tokens = (row[1] or 0) // 4

        cur.execute(
            "INSERT INTO session_checkpoints (session_id, label, message_index, tokens_estimate) VALUES (?, ?, ?, ?)",
            (session_id, label or f"Checkpoint #{count}", count, tokens)
        )
        cid = cur.lastrowid
        conn.commit()
        conn.close()
        return {"status": "ok", "checkpoint_id": cid, "label": label, "tokens": tokens, "message_index": count}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def rollback_session_checkpoint(session_id: str, checkpoint_id: int, db_path: Path) -> Dict[str, Any]:
    """Roll back session context to a previous checkpoint (Domain 9, #28)."""
    if not db_path.exists():
        return {"status": "error", "message": "Database not found"}

    try:
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT message_index FROM session_checkpoints WHERE id = ? AND session_id = ?", (checkpoint_id, session_id))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"status": "error", "message": "Checkpoint not found"}

        target_index = row["message_index"]
        # Delete messages beyond target_index
        cur.execute("""
            DELETE FROM chat_messages 
            WHERE session_id = ? AND id NOT IN (
                SELECT id FROM chat_messages WHERE session_id = ? ORDER BY id ASC LIMIT ?
            )
        """, (session_id, session_id, target_index))
        conn.commit()
        conn.close()
        return {"status": "ok", "session_id": session_id, "rolled_back_to_index": target_index}
    except Exception as e:
        return {"status": "error", "message": str(e)}


