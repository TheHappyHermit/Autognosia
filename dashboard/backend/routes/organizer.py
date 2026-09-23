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


@router.get("/api/tasks")
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


@router.post("/api/tasks")
def create_task(payload: Dict[str, Any] = Body(...)):
    title = payload.get("title")
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")
        
    status = payload.get("status", "active")
    if status not in ["active", "next", "in_progress", "waiting", "completed", "cancelled", "blocked"]:
        status = "active"

    priority = payload.get("priority", "medium")
    if priority == "normal":
        priority = "medium"
    elif priority not in ["low", "medium", "high", "critical"]:
        priority = "medium"
        
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO tasks (title, description, status, priority, due_at, project_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'))
    """, (
        title,
        payload.get("description", ""),
        status,
        priority,
        payload.get("due_at"),
        payload.get("project_id")
    ))
    conn.commit()
    new_id = cur.lastrowid
    conn.close()
    return {"id": new_id, "status": "created"}


@router.patch("/api/tasks/{task_id}")
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


@router.delete("/api/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"id": task_id, "status": "deleted"}


@router.get("/api/projects")
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


@router.get("/api/calendar")
def get_calendar():
    return calendar_sync.get_all_schedule_events()


@router.get("/api/emails")
def get_emails():
    return email_sync.get_triaged_emails()


@router.patch("/api/emails/{email_id}/toggle-read")
def toggle_email_read(email_id: str):
    emails = email_sync.get_triaged_emails()
    for em in emails:
        if em["id"] == email_id:
            em["read"] = not em.get("read", False)
            break
    email_sync.save_triaged_emails(emails)
    return {"status": "ok"}


@router.get("/api/intentions")
def get_intentions():
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM intentions ORDER BY created_at DESC")
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@router.post("/api/intentions")
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


@router.get("/api/reminders")
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


@router.post("/api/reminders")
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


@router.patch("/api/reminders/{rem_id}")
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


@router.delete("/api/reminders/{rem_id}")
def delete_reminder(rem_id: int):
    conn = get_organizer_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM reminders WHERE id = ?", (rem_id,))
    conn.commit()
    conn.close()
    return {"id": rem_id, "status": "deleted"}

