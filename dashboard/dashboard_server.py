#!/usr/bin/env python3
"""
Autognosia Command Deck — Executive Dashboard Backend Server.
Modular FastAPI application serving REST endpoints and static UI assets.
Default Port: 8088
"""

import os
import sys
import subprocess
import asyncio
from pathlib import Path


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
    venv_python = (venv_dir / "Scripts" / "python.exe") if os.name == "nt" else (venv_dir / "bin" / "python")

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

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Re-export shared config and connection helpers for backward compatibility
from dashboard.backend.config import (
    REPO_ROOT, DASHBOARD_DIR, AUTOGNOSIA_HOME, ORGANIZER_DB, AUTOGNOSIA_DB,
    ACTIVE_WIKI, ORACLE_BRAIN, DOCKER_SOCKET, CONFIG_PATH,
    calendar_sync, email_sync, check_reminders, dispatcher,
    hermes_interface, integrations_backend,
    get_organizer_conn, get_autognosia_conn, _initialize_demo_databases
)

# Import route modules
from dashboard.backend.routes.system import router as system_router
from dashboard.backend.routes.organizer import router as organizer_router
from dashboard.backend.routes.agent_bots import router as agent_bots_router
from dashboard.backend.routes.knowledge_memory import router as knowledge_memory_router
from dashboard.backend.routes.integrations import router as integrations_router
from dashboard.backend.routes.markets_voice import router as markets_voice_router
from dashboard.backend.routes.static import router as static_router

app = FastAPI(title="Autognosia Command Deck API", version="2.6.0")

# CORS setup
_cors_origins_env = os.environ.get("CORS_ORIGINS", "")
if _cors_origins_env.strip():
    _cors_origins = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
else:
    _cors_origins = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=bool(_cors_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


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


# Register modular routers
app.include_router(system_router)
app.include_router(organizer_router)
app.include_router(agent_bots_router)
app.include_router(knowledge_memory_router)
app.include_router(integrations_router)
app.include_router(markets_voice_router)
app.include_router(static_router)


def run(host: str = "0.0.0.0", port: int = 8088):
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run()
