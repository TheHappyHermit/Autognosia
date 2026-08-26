# Personal Organizer API Documentation

The Personal Organizer API provides a deterministic REST interface to `organizer.db` for task, project, and subscription state.

**Base URL:** `http://127.0.0.1:8001`  
**Authentication:** None (Localhost only)

---

## Endpoints

### System
- `GET /health` — Check service and database connectivity.

### Tasks
- `GET /tasks` — List tasks. Optional query params: `status` (`active`, `completed`, `cancelled`, `blocked`), `project_id`.
- `GET /tasks/due` — List active tasks due on or before a given threshold. Optional query param: `days_ahead` (default: 0).
- `POST /tasks` — Create a task.
  ```json
  {
    "title": "Deploy Autognosia Docker stack",
    "description": "Run SearXNG, Honcho, GBrain, and Personal Organizer",
    "status": "active",
    "priority": "high",
    "due_at": "2026-08-15",
    "project_id": 1,
    "dependency_id": null
  }
  ```
- `PUT /tasks/{task_id}` — Update task fields.
- `DELETE /tasks/{task_id}` — Delete a task.

### Projects
- `GET /projects` — List projects. Optional query param: `status` (`active`, `completed`, `archived`).
- `POST /projects` — Create a project.
  ```json
  {
    "name": "Autognosia Infrastructure",
    "description": "Cognitive architecture deployment and evaluation",
    "status": "active"
  }
  ```
- `PUT /projects/{project_id}` — Update project fields.
- `DELETE /projects/{project_id}` — Delete a project.

### Subscriptions
- `GET /subscriptions` — List active subscriptions. Optional query param: `status` (`active`, `cancelled`, `paused`).
- `POST /subscriptions` — Create a subscription.
  ```json
  {
    "name": "Cloud GPU Instance",
    "amount": 48.00,
    "currency": "USD",
    "billing_cycle": "monthly",
    "next_billing_date": "2026-09-01",
    "status": "active"
  }
  ```
- `PUT /subscriptions/{sub_id}` — Update subscription fields.
- `DELETE /subscriptions/{sub_id}` — Delete a subscription.
