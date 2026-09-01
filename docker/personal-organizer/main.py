#!/usr/bin/env python3
"""
Personal Organizer API
FastAPI wrapper around organizer.db for deterministic state management.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
import sqlite3
import os
from datetime import datetime, timezone

app = FastAPI(
    title="Personal Organizer API",
    version="1.1.0",
    description="Deterministic task, project, and subscription state management for Autognosia."
)

DB_PATH = os.environ.get("DATABASE_URL", "/app/data/organizer.db")
if DB_PATH.startswith("sqlite:///"):
    DB_PATH = DB_PATH.replace("sqlite:///", "")


def get_db_connection():
    if not os.path.exists(DB_PATH):
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def utcnow_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---- PYDANTIC SCHEMAS ----

class TaskCreate(BaseModel):
    title: str = Field(..., description="Task title")
    description: Optional[str] = None
    status: Optional[str] = "active"
    priority: Optional[str] = "medium"
    due_at: Optional[str] = Field(None, description="ISO date or datetime string (YYYY-MM-DD)")
    project_id: Optional[int] = None
    dependency_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_at: Optional[str] = None
    completed_at: Optional[str] = None
    project_id: Optional[int] = None
    dependency_id: Optional[int] = None


class ProjectCreate(BaseModel):
    name: str = Field(..., description="Project name")
    description: Optional[str] = None
    status: Optional[str] = "active"


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class SubscriptionCreate(BaseModel):
    name: str = Field(..., description="Subscription name")
    amount: float = Field(..., description="Cost per billing cycle")
    currency: Optional[str] = "USD"
    billing_cycle: Optional[str] = "monthly"
    next_billing_date: Optional[str] = Field(None, description="ISO date (YYYY-MM-DD)")
    status: Optional[str] = "active"


class SubscriptionUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    billing_cycle: Optional[str] = None
    next_billing_date: Optional[str] = None
    status: Optional[str] = None


class ImportantDateCreate(BaseModel):
    title: str = Field(..., description="Important date title")
    date: str = Field(..., description="Date string (YYYY-MM-DD)")
    description: Optional[str] = None


class ImportantDateUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None


class IntentionCreate(BaseModel):
    title: str = Field(..., description="Intention title")
    cue: Optional[str] = None
    action: str = Field(..., description="Action to take when cue triggers")
    status: Optional[str] = "dormant"


class IntentionUpdate(BaseModel):
    title: Optional[str] = None
    cue: Optional[str] = None
    action: Optional[str] = None
    status: Optional[str] = None


class WaitingStateCreate(BaseModel):
    title: str = Field(..., description="Waiting state title")
    waiting_for: Optional[str] = None
    follow_up_date: Optional[str] = None
    status: Optional[str] = "waiting"


class WaitingStateUpdate(BaseModel):
    title: Optional[str] = None
    waiting_for: Optional[str] = None
    follow_up_date: Optional[str] = None
    status: Optional[str] = None


class ReminderCreate(BaseModel):
    title: str = Field(..., description="Reminder title")
    remind_at: str = Field(..., description="ISO datetime string to trigger reminder")
    channel: Optional[str] = "all"
    notes: Optional[str] = ""
    status: Optional[str] = "pending"


class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    remind_at: Optional[str] = None
    channel: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class DeleteResponse(BaseModel):
    success: bool
    message: str


# ---- SYSTEM & HEALTH ENDPOINTS ----

@app.get("/health")
async def health():
    db_exists = os.path.exists(DB_PATH)
    return {
        "status": "healthy",
        "database": "connected" if db_exists else "database_file_missing",
        "db_path": DB_PATH
    }


# ---- TASK ENDPOINTS ----

@app.get("/tasks")
def list_tasks(status: Optional[str] = None, project_id: Optional[int] = None):
    with get_db_connection() as conn:
        query = "SELECT * FROM tasks WHERE 1=1"
        params = []
        if status:
            query += " AND status = ?"
            params.append(status)
        if project_id is not None:
            query += " AND project_id = ?"
            params.append(project_id)
        query += " ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END, due_at ASC"
        
        cursor = conn.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@app.get("/tasks/due")
def list_due_tasks(days_ahead: int = 0):
    with get_db_connection() as conn:
        target_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        cursor = conn.execute(
            """
            SELECT * FROM tasks 
            WHERE status = 'active' AND due_at IS NOT NULL AND date(due_at) <= date(?, '+' || ? || ' days')
            ORDER BY due_at ASC
            """,
            (target_date, days_ahead)
        )
        return [dict(row) for row in cursor.fetchall()]


@app.post("/tasks", status_code=201)
def create_task(task: TaskCreate):
    with get_db_connection() as conn:
        now = utcnow_str()
        cursor = conn.execute(
            """
            INSERT INTO tasks (title, description, status, priority, due_at, project_id, dependency_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (task.title, task.description, task.status, task.priority, task.due_at, task.project_id, task.dependency_id, now, now)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "title": task.title, "message": "Task created successfully"}


@app.put("/tasks/{task_id}")
def update_task(task_id: int, task: TaskUpdate):
    with get_db_connection() as conn:
        updates = []
        params = []
        for field, value in task.model_dump(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update")

        updates.append("updated_at = ?")
        params.append(utcnow_str())
        params.append(task_id)

        query = f"UPDATE tasks SET {', '.join(updates)} WHERE id = ?"
        cursor = conn.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

        return {"id": task_id, "message": "Task updated successfully"}


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
        return DeleteResponse(success=True, message=f"Task {task_id} deleted")


# ---- PROJECT ENDPOINTS ----

@app.get("/projects")
def list_projects(status: Optional[str] = None):
    with get_db_connection() as conn:
        query = "SELECT * FROM projects"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY created_at DESC"
        cursor = conn.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@app.post("/projects", status_code=201)
def create_project(project: ProjectCreate):
    with get_db_connection() as conn:
        now = utcnow_str()
        cursor = conn.execute(
            """
            INSERT INTO projects (name, description, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (project.name, project.description, project.status, now, now)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "name": project.name, "message": "Project created successfully"}


@app.put("/projects/{project_id}")
def update_project(project_id: int, project: ProjectUpdate):
    with get_db_connection() as conn:
        updates = []
        params = []
        for field, value in project.model_dump(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update")

        updates.append("updated_at = ?")
        params.append(utcnow_str())
        params.append(project_id)

        query = f"UPDATE projects SET {', '.join(updates)} WHERE id = ?"
        cursor = conn.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

        return {"id": project_id, "message": "Project updated successfully"}


@app.delete("/projects/{project_id}")
def delete_project(project_id: int):
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
        return DeleteResponse(success=True, message=f"Project {project_id} deleted")


# ---- SUBSCRIPTION ENDPOINTS ----

@app.get("/subscriptions")
def list_subscriptions(status: Optional[str] = None):
    with get_db_connection() as conn:
        query = "SELECT * FROM subscriptions"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY next_billing_date ASC"
        cursor = conn.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@app.post("/subscriptions", status_code=201)
def create_subscription(sub: SubscriptionCreate):
    with get_db_connection() as conn:
        now = utcnow_str()
        cursor = conn.execute(
            """
            INSERT INTO subscriptions (name, amount, currency, billing_cycle, next_billing_date, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (sub.name, sub.amount, sub.currency, sub.billing_cycle, sub.next_billing_date, sub.status, now, now)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "name": sub.name, "message": "Subscription created successfully"}


@app.put("/subscriptions/{sub_id}")
def update_subscription(sub_id: int, sub: SubscriptionUpdate):
    with get_db_connection() as conn:
        updates = []
        params = []
        for field, value in sub.model_dump(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update")

        updates.append("updated_at = ?")
        params.append(utcnow_str())
        params.append(sub_id)

        query = f"UPDATE subscriptions SET {', '.join(updates)} WHERE id = ?"
        cursor = conn.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Subscription {sub_id} not found")

        return {"id": sub_id, "message": "Subscription updated successfully"}


@app.delete("/subscriptions/{sub_id}")
def delete_subscription(sub_id: int):
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM subscriptions WHERE id = ?", (sub_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Subscription {sub_id} not found")
        return DeleteResponse(success=True, message=f"Subscription {sub_id} deleted")


# ---- IMPORTANT DATES ENDPOINTS ----

@app.get("/important_dates")
def list_important_dates(date_after: Optional[str] = None):
    with get_db_connection() as conn:
        query = "SELECT * FROM important_dates WHERE 1=1"
        params = []
        if date_after:
            query += " AND date > ?"
            params.append(date_after)
        query += " ORDER BY date ASC"
        cursor = conn.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@app.post("/important_dates", status_code=201)
def create_important_date(data: ImportantDateCreate):
    with get_db_connection() as conn:
        now = utcnow_str()
        cursor = conn.execute(
            """
            INSERT INTO important_dates (title, date, description, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (data.title, data.date, data.description, now)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "title": data.title, "message": "Important date created successfully"}


@app.put("/important_dates/{date_id}")
def update_important_date(date_id: int, data: ImportantDateUpdate):
    with get_db_connection() as conn:
        updates = []
        params = []
        for field, value in data.model_dump(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update")

        params.append(date_id)
        query = f"UPDATE important_dates SET {', '.join(updates)} WHERE id = ?"
        cursor = conn.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Important date {date_id} not found")
        return {"id": date_id, "message": "Important date updated successfully"}


@app.delete("/important_dates/{date_id}")
def delete_important_date(date_id: int):
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM important_dates WHERE id = ?", (date_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Important date {date_id} not found")
        return DeleteResponse(success=True, message=f"Important date {date_id} deleted")


# ---- INTENTIONS ENDPOINTS ----

@app.get("/intentions")
def list_intentions(status: Optional[str] = None):
    with get_db_connection() as conn:
        query = "SELECT * FROM intentions"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY created_at DESC"
        cursor = conn.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@app.post("/intentions", status_code=201)
def create_intention(data: IntentionCreate):
    with get_db_connection() as conn:
        now = utcnow_str()
        cursor = conn.execute(
            """
            INSERT INTO intentions (title, cue, action, status, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (data.title, data.cue, data.action, data.status, now)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "title": data.title, "message": "Intention created successfully"}


@app.put("/intentions/{int_id}")
def update_intention(int_id: int, data: IntentionUpdate):
    with get_db_connection() as conn:
        updates = []
        params = []
        for field, value in data.model_dump(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update")

        params.append(int_id)
        query = f"UPDATE intentions SET {', '.join(updates)} WHERE id = ?"
        cursor = conn.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Intention {int_id} not found")
        return {"id": int_id, "message": "Intention updated successfully"}


@app.delete("/intentions/{int_id}")
def delete_intention(int_id: int):
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM intentions WHERE id = ?", (int_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Intention {int_id} not found")
        return DeleteResponse(success=True, message=f"Intention {int_id} deleted")


# ---- WAITING STATES ENDPOINTS ----

@app.get("/waiting_states")
def list_waiting_states(status: Optional[str] = None):
    with get_db_connection() as conn:
        query = "SELECT * FROM waiting_states"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY follow_up_date ASC"
        cursor = conn.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@app.post("/waiting_states", status_code=201)
def create_waiting_state(data: WaitingStateCreate):
    with get_db_connection() as conn:
        now = utcnow_str()
        cursor = conn.execute(
            """
            INSERT INTO waiting_states (title, waiting_for, follow_up_date, status, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (data.title, data.waiting_for, data.follow_up_date, data.status, now)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "title": data.title, "message": "Waiting state created successfully"}


@app.put("/waiting_states/{ws_id}")
def update_waiting_state(ws_id: int, data: WaitingStateUpdate):
    with get_db_connection() as conn:
        updates = []
        params = []
        for field, value in data.model_dump(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update")

        params.append(ws_id)
        query = f"UPDATE waiting_states SET {', '.join(updates)} WHERE id = ?"
        cursor = conn.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Waiting state {ws_id} not found")
        return {"id": ws_id, "message": "Waiting state updated successfully"}


@app.delete("/waiting_states/{ws_id}")
def delete_waiting_state(ws_id: int):
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM waiting_states WHERE id = ?", (ws_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Waiting state {ws_id} not found")
        return DeleteResponse(success=True, message=f"Waiting state {ws_id} deleted")


# ---- REMINDERS ENDPOINTS ----

@app.get("/reminders")
def list_reminders(status: Optional[str] = None):
    with get_db_connection() as conn:
        query = "SELECT * FROM reminders"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY remind_at ASC"
        cursor = conn.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


@app.post("/reminders", status_code=201)
def create_reminder(data: ReminderCreate):
    with get_db_connection() as conn:
        now = utcnow_str()
        cursor = conn.execute(
            """
            INSERT INTO reminders (title, remind_at, channel, notes, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (data.title, data.remind_at, data.channel, data.notes, data.status, now)
        )
        conn.commit()
        return {"id": cursor.lastrowid, "title": data.title, "message": "Reminder created successfully"}


@app.put("/reminders/{rem_id}")
def update_reminder(rem_id: int, data: ReminderUpdate):
    with get_db_connection() as conn:
        updates = []
        params = []
        for field, value in data.model_dump(exclude_unset=True).items():
            updates.append(f"{field} = ?")
            params.append(value)

        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided to update")

        params.append(rem_id)
        query = f"UPDATE reminders SET {', '.join(updates)} WHERE id = ?"
        cursor = conn.execute(query, params)
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Reminder {rem_id} not found")
        return {"id": rem_id, "message": "Reminder updated successfully"}


@app.delete("/reminders/{rem_id}")
def delete_reminder(rem_id: int):
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM reminders WHERE id = ?", (rem_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Reminder {rem_id} not found")
        return DeleteResponse(success=True, message=f"Reminder {rem_id} deleted")
