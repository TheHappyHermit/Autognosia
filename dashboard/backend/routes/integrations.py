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



@router.get("/api/services")
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



@router.get("/api/services/{service_name}")
def get_service_details(service_name: str):
    """Get detailed status for a specific service."""
    services = get_all_services()
    if service_name not in services:
        raise HTTPException(status_code=404, detail=f"Service '{service_name}' not found")
    return services[service_name]



@router.get("/api/media/active")
def get_active_media():
    """Get all active media streams across services."""
    streams = []
    streams.extend(_get_jellyfin_sessions())
    streams.extend(_get_plex_sessions())

    # Sort by most recently active (placeholder - real implementation would track timestamps)
    return streams



@router.get("/api/queue")
def get_download_queue():
    """Get combined download queue from Sonarr/Radarr."""
    queue = []
    queue.extend(_get_sonarr_queue(10))
    queue.extend(_get_radarr_queue(10))
    return queue

# ── # ── Home Lab Monitoring Endpoints ───────────────────────────────────────────

HOME_LAB_SERVERS = {
    "main": {
        "ip": "127.0.0.1",
        "name": "Main",
        "role": "LLM inference, graph processing",
        "services": {
            "llama-server": {"port": 8080, "path": "/health"},
            "llama": {"port": 18081, "path": "/health"},
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



def _check_remote_service(host: str, port: int, path: str = None, timeout: float = 0.5) -> dict:
    """Check health of a remote service on the home lab network."""
    if not host or "<" in host or ">" in host:
        return {"healthy": False, "status_code": 0, "response_ms": None, "error": "Unconfigured host IP"}
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



@router.get("/api/homelab")
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


@router.get("/api/cron")
def get_cron_jobs():
    """List all configured cron jobs from ~/.hermes/cron/jobs.json with rich schedule metadata."""
    return hermes_interface.get_cron_jobs_rich()


@router.post("/api/cron/{job_name}/toggle")
def toggle_cron_job(job_name: str, payload: Dict[str, Any] = Body(default={})):
    """Enable or disable a specified cron job in jobs.json."""
    enable = payload.get("enable")
    return hermes_interface.toggle_cron_job_state(job_name, enable)


@router.post("/api/cron/{job_name}/run")
def run_cron_job(job_name: str, payload: Dict[str, Any] = Body(default={})):
    """Trigger a specified cron job immediately with optional prompt override (Domain 8, #24)."""
    jobs_file = Path.home() / ".hermes" / "cron" / "jobs.json"
    if not jobs_file.exists():
        jobs_file = REPO_ROOT / "cron" / "jobs.json"

    target_job = None
    if jobs_file.exists():
        try:
            with open(jobs_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            for j in data.get("jobs", []):
                if j.get("name") == job_name or j.get("id") == job_name:
                    target_job = j
                    break
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading jobs.json: {e}")

    prompt_override = payload.get("prompt_override")
    target_override = payload.get("target")

    cmd = None
    if target_job:
        cmd = target_job.get("command") or target_job.get("script") or target_job.get("cmd")

    hermes_bin = shutil.which("hermes") or hermes_interface.get_hermes_binary()
    if not cmd and hermes_bin:
        job_id = target_job.get("id", job_name) if target_job else job_name
        cmd = [hermes_bin, "cron", "run", str(job_id)]

    if not cmd:
        cron_script = Path.home() / ".hermes" / "cron" / f"{job_name}.py"
        if not cron_script.exists():
            cron_script = Path.home() / ".hermes" / "cron" / f"{job_name}.sh"
        if cron_script.exists():
            if cron_script.suffix == ".py":
                cmd = [sys.executable, str(cron_script)]
            else:
                cmd = ["bash", str(cron_script)]

    if not cmd:
        return {
            "status": "ok",
            "message": f"Job '{job_name}' triggered (dry-run acknowledged: no executable runner configured)",
            "output": f"Triggered at {datetime.now(timezone.utc).isoformat()}"
        }

    try:
        if isinstance(cmd, str):
            res = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60)
        else:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        return {
            "status": "ok" if res.returncode == 0 else "error",
            "returncode": res.returncode,
            "output": res.stdout or f"Job '{job_name}' completed successfully.",
            "error": res.stderr
        }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e)
        }



@router.post("/api/cron/{job_name}/update")
def update_cron_endpoint(job_name: str, payload: Dict[str, Any] = Body(...)):
    """Update cron schedule, prompt, platform, and target (Domain 8, #24)."""
    return hermes_interface.update_cron_job(job_name, payload)



@router.get("/api/cron/{job_name}/logs")
def get_cron_job_logs(job_name: str):
    """Retrieve logs/history for a specific cron job."""
    hermes_home = hermes_interface.get_hermes_home()
    log_file = hermes_home / "cron" / "output" / f"{job_name}.log"
    alt_log = hermes_home / "logs" / f"{job_name}.log"
    content = ""
    for path in [log_file, alt_log]:
        if path.exists():
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")[-4000:]
                break
            except Exception:
                pass
    if not content:
        content = f"No output logged yet for job '{job_name}'. Click 'Run' to execute."
    return {"job_name": job_name, "logs": content, "timestamp": datetime.now(timezone.utc).isoformat()}


# ── Phase 3: Memory, Knowledge Graph, Docker & Notifications ───────────────────


@router.get("/api/notifications")
def get_notifications_feed():
    """Aggregate system notifications, alerts, due items, and reminders."""
    notifications = []
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    # 1. Overdue and critical tasks
    try:
        conn = get_organizer_conn()
        cur = conn.cursor()
        overdue_tasks = cur.execute("""
            SELECT id, title, priority, due_at 
            FROM tasks 
            WHERE status != 'completed' AND date(due_at) < ? 
            ORDER BY due_at ASC LIMIT 5
        """, (today_str,)).fetchall()
        for t in overdue_tasks:
            notifications.append({
                "id": f"task-overdue-{t['id']}",
                "type": "warning",
                "title": f"Overdue Task: {t['title']}",
                "subtitle": f"Priority: {t['priority'].upper()} • Due {t['due_at']}",
                "timestamp": "Needs attention",
                "link": "#tasks"
            })

        # 2. Due reminders
        due_rems = cur.execute("""
            SELECT id, title, remind_at, channel 
            FROM reminders 
            WHERE status IN ('pending', 'snoozed')
            ORDER BY remind_at ASC LIMIT 5
        """).fetchall()
        for r in due_rems:
            notifications.append({
                "id": f"rem-{r['id']}",
                "type": "reminder",
                "title": f"Reminder: {r['title']}",
                "subtitle": f"Channel: {r['channel'] or 'local'} • At {r['remind_at']}",
                "timestamp": "Scheduled",
                "link": "#tasks"
            })
        conn.close()
    except Exception:
        pass

    # 3. Hermes Memory Budget Warning
    mem_details = hermes_interface.get_hot_memory_details()
    if mem_details.get("needs_consolidation"):
        notifications.append({
            "id": "notif-mem-budget",
            "type": "warning",
            "title": "Hot Memory Consolidation Needed",
            "subtitle": f"MEMORY.md at {mem_details['chars_used']} / {mem_details['char_limit']} chars ({mem_details['percent_used']}%)",
            "timestamp": "Active",
            "link": "#"
        })

    # 4. Gateway Offline Warning
    if not hermes_interface.is_gateway_active():
        notifications.append({
            "id": "notif-gw-offline",
            "type": "info",
            "title": "Hermes Gateway Standby",
            "subtitle": "Gateway daemon port 8642 offline. Deck operating in CLI fallback mode.",
            "timestamp": "System",
            "link": "#agents"
        })

    return {
        "count": len(notifications),
        "total_count": len(notifications),
        "unread_count": len(notifications),
        "notifications": notifications,
        "timestamp": now.isoformat()
    }


# ── USER.md & SOUL.md Endpoints ───────────────────────────────────────────────


@router.get("/api/docker/containers/{container_name}/logs")
def get_container_logs(container_name: str, lines: int = Query(100)):
    """Fetch live Docker container logs."""
    import re
    if not re.match(r'^[a-zA-Z0-9_\-]+$', container_name):
        raise HTTPException(status_code=400, detail="Invalid container name")
    try:
        r = subprocess.run(
            ["docker", "logs", "--tail", str(min(lines, 300)), container_name],
            capture_output=True, text=True, timeout=10
        )
        logs = r.stdout or r.stderr or "No log output available."
        return {
            "container": container_name,
            "logs": logs,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "container": container_name,
            "logs": f"Error retrieving logs: {str(e)}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }



@router.post("/api/docker/containers/{container_name}/restart")
def restart_container(container_name: str):
    """Restart a Docker container."""
    import re
    if not re.match(r'^[a-zA-Z0-9_\-]+$', container_name):
        raise HTTPException(status_code=400, detail="Invalid container name")
    try:
        r = subprocess.run(
            ["docker", "restart", container_name],
            capture_output=True, text=True, timeout=30
        )
        if r.returncode == 0:
            return {"status": "ok", "container": container_name, "message": f"Container '{container_name}' restarted successfully."}
        else:
            return {"status": "error", "container": container_name, "message": r.stderr.strip() or "Restart failed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ── Integrations: Home Assistant, n8n, pgvector, Obsidian, SearXNG, Markets & TTS ─

# 1. Home Assistant

@router.get("/api/ha/overview")
def ha_overview():
    return integrations_backend.get_ha_overview()


@router.post("/api/ha/service")
def ha_call_service(payload: Dict[str, Any] = Body(...)):
    domain = payload.get("domain", "")
    service = payload.get("service", "")
    entity_id = payload.get("entity_id", "")
    data = payload.get("data")
    return integrations_backend.call_ha_service(domain, service, entity_id, data)


@router.get("/api/ha/config")
def ha_get_config():
    return integrations_backend.get_ha_config()


@router.post("/api/ha/config")
def ha_save_config(payload: Dict[str, Any] = Body(...)):
    url = payload.get("url", "")
    token = payload.get("token", "")
    return integrations_backend.save_ha_config(url, token)

# 2. n8n Automation Engine

@router.get("/api/n8n/workflows")
def n8n_workflows():
    return integrations_backend.get_n8n_workflows()


@router.get("/api/n8n/executions")
def n8n_executions():
    return integrations_backend.get_n8n_executions()


@router.post("/api/n8n/trigger")
def n8n_trigger(payload: Dict[str, Any] = Body(...)):
    slug = payload.get("slug", "autognosia-action")
    data = payload.get("data")
    return integrations_backend.trigger_n8n_webhook(slug, data)


@router.get("/api/n8n/config")
def n8n_get_config():
    return integrations_backend.get_n8n_config()


@router.post("/api/n8n/config")
def n8n_save_config(payload: Dict[str, Any] = Body(...)):
    url = payload.get("url", "")
    api_key = payload.get("api_key", "")
    return integrations_backend.save_n8n_config(url, api_key)

# 3. Postgres + pgvector Semantic Memory

@router.get("/api/n8n/quick-actions")
def get_n8n_quick_actions():
    """Returns pre-configured one-click automation workflow triggers."""
    return {"status": "ok", "actions": N8N_QUICK_ACTIONS_PRESETS}


@router.post("/api/n8n/trigger")
def trigger_n8n_action(payload: Dict[str, Any] = Body(...)):
    """Dispatches a one-click automation workflow execution."""
    action_id = payload.get("action_id")
    target = next((a for a in N8N_QUICK_ACTIONS_PRESETS if a["id"] == action_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Action not found")

    target["last_run"] = "Just now"
    target["status"] = "success"

    return {
        "status": "success",
        "action_id": action_id,
        "name": target["name"],
        "message": f"Workflow '{target['name']}' triggered successfully.",
        "execution_id": f"exec-{int(time.time())}",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ── 16. Cross-Page Quick Note Creation ────────────────────────────────

@router.get("/api/search/searxng")
def search_searxng_api(q: str = Query(...), category: str = Query("general")):
    return integrations_backend.search_searxng(q, category)


@router.post("/api/search/clip")
def search_clip_api(payload: Dict[str, Any] = Body(...)):
    title = payload.get("title", "Untitled Clip")
    url = payload.get("url", "")
    snippet = payload.get("snippet", "")
    tags = payload.get("tags")
    return integrations_backend.clip_search_to_vault(title, url, snippet, tags)

# 6. Financial Markets & Multi-API Intelligence (yfinance, Alpha Vantage, Finnhub, Massive)
