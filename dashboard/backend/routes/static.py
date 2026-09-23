#!/usr/bin/env python3
"""
dashboard.backend.routes.static — Static file serving for Command Deck UI.
"""

from fastapi import APIRouter
from fastapi.responses import FileResponse, Response
from pathlib import Path

from dashboard.backend.config import DASHBOARD_DIR

router = APIRouter()


@router.get("/graph-visualizer.js")
def serve_graph_visualizer():
    return FileResponse(str(DASHBOARD_DIR / "graph-visualizer.js"), media_type="application/javascript")


@router.get("/")
def serve_dashboard():
    """Serve the main dashboard HTML."""
    return FileResponse(str(DASHBOARD_DIR / "index.html"))


@router.get("/sidebar.css")
def serve_sidebar():
    return FileResponse(str(DASHBOARD_DIR / "sidebar.css"), media_type="text/css")


@router.get("/header.css")
def serve_header():
    return FileResponse(str(DASHBOARD_DIR / "header.css"), media_type="text/css")


@router.get("/layout.css")
def serve_layout():
    return FileResponse(str(DASHBOARD_DIR / "layout.css"), media_type="text/css")


@router.get("/briefing.css")
def serve_briefing():
    return FileResponse(str(DASHBOARD_DIR / "briefing.css"), media_type="text/css")


@router.get("/calendar.css")
def serve_calendar():
    return FileResponse(str(DASHBOARD_DIR / "calendar.css"), media_type="text/css")


@router.get("/tasks.css")
def serve_tasks():
    return FileResponse(str(DASHBOARD_DIR / "tasks.css"), media_type="text/css")


@router.get("/comms.css")
def serve_comms():
    return FileResponse(str(DASHBOARD_DIR / "comms.css"), media_type="text/css")


@router.get("/drawers.css")
def serve_drawers():
    return FileResponse(str(DASHBOARD_DIR / "drawers.css"), media_type="text/css")


@router.get("/services.css")
def serve_services_css():
    return FileResponse(str(DASHBOARD_DIR / "services.css"), media_type="text/css")


@router.get("/agent.css")
def serve_agent_css():
    return FileResponse(str(DASHBOARD_DIR / "agent.css"), media_type="text/css")


@router.get("/bots.css")
def serve_bots_css():
    return FileResponse(str(DASHBOARD_DIR / "bots.css"), media_type="text/css")


@router.get("/tokens.css")
def serve_tokens():
    return FileResponse(str(DASHBOARD_DIR / "tokens.css"), media_type="text/css")


@router.get("/home-lab.css")
def serve_home_lab_css():
    return FileResponse(str(DASHBOARD_DIR / "home-lab.css"), media_type="text/css")


@router.get("/app-core.js")
def serve_app_core():
    return FileResponse(str(DASHBOARD_DIR / "app-core.js"), media_type="application/javascript")


@router.get("/app-bots.js")
def serve_app_bots():
    return FileResponse(str(DASHBOARD_DIR / "app-bots.js"), media_type="application/javascript")


@router.get("/app-calendar.js")
def serve_app_calendar():
    return FileResponse(str(DASHBOARD_DIR / "app-calendar.js"), media_type="application/javascript")


@router.get("/app-comms.js")
def serve_app_comms():
    return FileResponse(str(DASHBOARD_DIR / "app-comms.js"), media_type="application/javascript")


@router.get("/app-data-fetch.js")
def serve_app_data_fetch():
    return FileResponse(str(DASHBOARD_DIR / "app-data-fetch.js"), media_type="application/javascript")


@router.get("/app-crud.js")
def serve_app_crud():
    return FileResponse(str(DASHBOARD_DIR / "app-crud.js"), media_type="application/javascript")


@router.get("/app-services.js")
def serve_app_services():
    return FileResponse(str(DASHBOARD_DIR / "app-services.js"), media_type="application/javascript")


@router.get("/app-tasks.js")
def serve_app_tasks():
    return FileResponse(str(DASHBOARD_DIR / "app-tasks.js"), media_type="application/javascript")


@router.get("/app-agent.js")
def serve_app_agent():
    return FileResponse(str(DASHBOARD_DIR / "app-agent.js"), media_type="application/javascript")


@router.get("/ws-client.js")
def serve_ws_client():
    ws_file = DASHBOARD_DIR / "ws-client.js"
    if ws_file.exists():
        return FileResponse(str(ws_file), media_type="application/javascript")
    return Response(content="// ws-client stub", media_type="application/javascript")


@router.get("/enhance.js")
def serve_enhance():
    return FileResponse(str(DASHBOARD_DIR / "enhance.js"), media_type="application/javascript")


@router.get("/integrations.css")
def serve_integrations_css():
    return FileResponse(str(DASHBOARD_DIR / "integrations.css"), media_type="text/css")


@router.get("/app-integrations.js")
def serve_app_integrations():
    return FileResponse(str(DASHBOARD_DIR / "app-integrations.js"), media_type="application/javascript")
