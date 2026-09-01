

# ===== autognosia.db (/home/<USER>/.autognosia/autognosia.db) =====
sqlite_version=3.53.1
journal_mode=delete
TABLES: ['key_decisions', 'operations', 'prospective_log', 'reflections', 'routing_events', 'skill_events', 'verification_checks']

## TABLE key_decisions
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 timestamp                    TEXT         notnull=0 default=datetime('now') pk=0
   2 session_id                   TEXT         notnull=0 default=None pk=0
   3 decision                     TEXT         notnull=1 default=None pk=0
   4 rationale                    TEXT         notnull=0 default=None pk=0
   5 alternatives_considered      TEXT         notnull=0 default=None pk=0
   6 outcome                      TEXT         notnull=0 default=None pk=0
   7 superseded_by                INTEGER      notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE key_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    session_id TEXT,
    decision TEXT NOT NULL,
    rationale TEXT,
    alternatives_considered TEXT,
    outcome TEXT,
    superseded_by INTEGER REFERENCES key_decisions(id)
)

-- indexes (1) --
  idx_decisions_timestamp unique=0 origin=c cols=['timestamp']
-- foreign keys --
  {'id': 0, 'seq': 0, 'table': 'key_decisions', 'from': 'superseded_by', 'to': 'id', 'on_update': 'NO ACTION', 'on_delete': 'NO ACTION', 'match': 'NONE'}

-- sample rows (up to 2) --
{"id": 1, "timestamp": "2026-08-17 01:05:24", "session_id": "setup-001", "decision": "Use SQLite for Personal State", "rationale": "Deterministic, no external deps", "alternatives_considered": null, "outcome": null, "superseded_by": null}

## TABLE operations
row_count=5595

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 timestamp                    TEXT         notnull=0 default=datetime('now') pk=0
   2 session_id                   TEXT         notnull=0 default=None pk=0
   3 profile                      TEXT         notnull=1 default=None pk=0
   4 action                       TEXT         notnull=1 default=None pk=0
   5 target                       TEXT         notnull=0 default=None pk=0
   6 result                       TEXT         notnull=0 default='success' pk=0
   7 duration_ms                  INTEGER      notnull=0 default=None pk=0
   8 tokens_used                  INTEGER      notnull=0 default=None pk=0
   9 error_message                TEXT         notnull=0 default=None pk=0
  10 metadata                     TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    session_id TEXT,
    profile TEXT NOT NULL,
    action TEXT NOT NULL,
    target TEXT,
    result TEXT CHECK(result IN ('success', 'failure', 'partial', 'aborted')) DEFAULT 'success',
    duration_ms INTEGER,
    tokens_used INTEGER,
    error_message TEXT,
    metadata TEXT
)

-- indexes (3) --
  idx_ops_result unique=0 origin=c cols=['result']
  idx_ops_profile unique=0 origin=c cols=['profile']
  idx_ops_timestamp unique=0 origin=c cols=['timestamp']

-- sample rows (up to 2) --
{"id": 6726, "timestamp": "2026-08-19 06:30:47", "session_id": "cron_97842ab6d078_20260818_231447", "profile": "default", "action": "tool_result:terminal", "target": "{\"output\": \"=== Personal Organizer Reminders & Schedule Check ===\\nChecked at: 2026-08-18T23:15:49.738672\\n\\nNo pending timed reminders due right now.\\n\\nNo overdue tasks.\\n\\nNo upcoming subscriptions in the next 7 days.\", \"exit_code\": 0, \"error\": null}", "result": "success", "duration_ms": null, "tokens_used": null, "error_message": null, "metadata": "{\"tool_name\": \"terminal\", \"tool_call_id\": \"\", \"inserted_at\": \"2026-08-18T23:30:47.501136\"}"}
{"id": 6725, "timestamp": "2026-08-19 06:30:47", "session_id": "cron_97842ab6d078_20260818_231447", "profile": "default", "action": "tool:unknown", "target": "{}", "result": "success", "duration_ms": null, "tokens_used": null, "error_message": null, "metadata": "{\"tool_name\": \"\", \"tool_call_id\": \"OqhzpFjllwQ16cH20Ed2iKmgqEnYlMOV\", \"inserted_at\": \"2026-08-18T23:30:47.501079\"}"}

## TABLE prospective_log
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 timestamp                    TEXT         notnull=0 default=datetime('now') pk=0
   2 session_id                   TEXT         notnull=0 default=None pk=0
   3 cue                          TEXT         notnull=1 default=None pk=0
   4 action_taken                 TEXT         notnull=0 default=None pk=0
   5 triggered                    BOOLEAN      notnull=0 default=FALSE pk=0
   6 triggered_at                 TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE prospective_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    session_id TEXT,
    cue TEXT NOT NULL,
    action_taken TEXT,
    triggered BOOLEAN DEFAULT FALSE,
    triggered_at TEXT
)

-- indexes (0) --

-- sample rows (up to 2) --
{"id": 1, "timestamp": "2026-08-17 01:05:24", "session_id": "setup-001", "cue": "monthly billing", "action_taken": "check dates", "triggered": 0, "triggered_at": null}

## TABLE reflections
row_count=348

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 timestamp                    TEXT         notnull=0 default=datetime('now') pk=0
   2 session_id                   TEXT         notnull=0 default=None pk=0
   3 reflection_type              TEXT         notnull=0 default=None pk=0
   4 content                      TEXT         notnull=1 default=None pk=0
   5 source_operation_id          INTEGER      notnull=0 default=None pk=0
   6 applied                      BOOLEAN      notnull=0 default=FALSE pk=0
   7 applied_at                   TEXT         notnull=0 default=None pk=0
   8 source_tool                  TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE reflections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    session_id TEXT,
    reflection_type TEXT CHECK(reflection_type IN ('pattern', 'lesson', 'warning', 'success', 'failure')),
    content TEXT NOT NULL,
    source_operation_id INTEGER,
    applied BOOLEAN DEFAULT FALSE,
    applied_at TEXT, source_tool TEXT,
    FOREIGN KEY (source_operation_id) REFERENCES operations(id) ON DELETE SET NULL
)

-- indexes (2) --
  idx_reflections_applied unique=0 origin=c cols=['applied']
  idx_reflections_type unique=0 origin=c cols=['reflection_type']
-- foreign keys --
  {'id': 0, 'seq': 0, 'table': 'operations', 'from': 'source_operation_id', 'to': 'id', 'on_update': 'NO ACTION', 'on_delete': 'SET NULL', 'match': 'NONE'}

-- sample rows (up to 2) --
{"id": 349, "timestamp": "2026-08-18 15:30:23", "session_id": "cron_924f52372fe0_20260818_080022", "reflection_type": "warning", "content": "The verification output is 1179 chars, but the checks for header strings (\"DB:\", \"Tables:\", etc.) failed because the new script has different print formatting. Let me fix the verification to match the actual output format.", "source_operation_id": null, "applied": 0, "applied_at": null, "source_tool": "unknown"}
{"id": 348, "timestamp": "2026-08-18 01:31:08", "session_id": "cron_bd9082814268_20260817_180002", "reflection_type": "pattern", "content": "Tool 'unknown' called 5 times — consider wrapping in a skill", "source_operation_id": null, "applied": 0, "applied_at": null, "source_tool": "unknown"}

## TABLE routing_events
row_count=663

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 timestamp                    TEXT         notnull=0 default=datetime('now') pk=0
   2 session_id                   TEXT         notnull=0 default=None pk=0
   3 input_summary                TEXT         notnull=1 default=None pk=0
   4 routed_to                    TEXT         notnull=1 default=None pk=0
   5 route_reason                 TEXT         notnull=0 default=None pk=0
   6 confidence                   REAL         notnull=0 default=None pk=0
   7 outcome                      TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE routing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    session_id TEXT,
    input_summary TEXT NOT NULL,
    routed_to TEXT NOT NULL,
    route_reason TEXT,
    confidence REAL CHECK(confidence >= 0 AND confidence <= 1),
    outcome TEXT
)

-- indexes (2) --
  idx_routing_to unique=0 origin=c cols=['routed_to']
  idx_routing_session unique=0 origin=c cols=['session_id']

-- sample rows (up to 2) --
{"id": 663, "timestamp": "2026-08-19 06:30:47", "session_id": "cron_97842ab6d078_20260818_231447", "input_summary": "Personal Ops Intention Check · Aug 18 23:15", "routed_to": "cron", "route_reason": "source=cron, model=Qwen3.6-35B-A3B-Q4_K_M.gguf", "confidence": null, "outcome": "cron_complete"}
{"id": 662, "timestamp": "2026-08-19 05:30:46", "session_id": "cron_97842ab6d078_20260818_220846", "input_summary": "Personal Ops Intention Check · Aug 18 22:14", "routed_to": "cron", "route_reason": "source=cron, model=Qwen3.6-35B-A3B-Q4_K_M.gguf", "confidence": null, "outcome": "cron_complete"}

## TABLE skill_events
row_count=139

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 timestamp                    TEXT         notnull=0 default=datetime('now') pk=0
   2 session_id                   TEXT         notnull=0 default=None pk=0
   3 skill_name                   TEXT         notnull=1 default=None pk=0
   4 trigger                      TEXT         notnull=0 default=None pk=0
   5 success                      BOOLEAN      notnull=0 default=TRUE pk=0
   6 duration_ms                  INTEGER      notnull=0 default=None pk=0
   7 error_message                TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE skill_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    session_id TEXT,
    skill_name TEXT NOT NULL,
    trigger TEXT,
    success BOOLEAN DEFAULT TRUE,
    duration_ms INTEGER,
    error_message TEXT
)

-- indexes (2) --
  idx_skill_session unique=0 origin=c cols=['session_id']
  idx_skill_name unique=0 origin=c cols=['skill_name']

-- sample rows (up to 2) --
{"id": 139, "timestamp": "2026-08-17 08:02:29", "session_id": "cron_4cf5692a359f_20260817_010024", "skill_name": "hermes-agent", "trigger": "loaded", "success": 1, "duration_ms": null, "error_message": null}
{"id": 138, "timestamp": "2026-08-17 08:02:29", "session_id": "cron_d77ba6619d4e_20260817_010024", "skill_name": "guidance", "trigger": "loaded", "success": 1, "duration_ms": null, "error_message": null}

## TABLE verification_checks
row_count=4

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 timestamp                    TEXT         notnull=0 default=datetime('now') pk=0
   2 operation_id                 INTEGER      notnull=0 default=None pk=0
   3 expected_result              TEXT         notnull=1 default=None pk=0
   4 actual_result                TEXT         notnull=1 default=None pk=0
   5 passed                       BOOLEAN      notnull=1 default=None pk=0
   6 notes                        TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE verification_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    operation_id INTEGER,
    expected_result TEXT NOT NULL,
    actual_result TEXT NOT NULL,
    passed BOOLEAN NOT NULL,
    notes TEXT,
    FOREIGN KEY (operation_id) REFERENCES operations(id) ON DELETE CASCADE
)

-- indexes (1) --
  idx_verif_operation unique=0 origin=c cols=['operation_id']
-- foreign keys --
  {'id': 0, 'seq': 0, 'table': 'operations', 'from': 'operation_id', 'to': 'id', 'on_update': 'NO ACTION', 'on_delete': 'CASCADE', 'match': 'NONE'}

-- sample rows (up to 2) --
{"id": 5, "timestamp": "2026-08-17 08:02:29", "operation_id": 37, "expected_result": "plan followed correctly", "actual_result": "verified", "passed": 1, "notes": "Session included verification between plan and execution"}
{"id": 4, "timestamp": "2026-08-17 08:02:29", "operation_id": 35, "expected_result": "plan followed correctly", "actual_result": "verified", "passed": 1, "notes": "Session included verification between plan and execution"}


# ===== organizer.db (/home/<USER>/.autognosia/personal-organizer/data/organizer.db) =====
sqlite_version=3.53.1
journal_mode=delete
TABLES: ['important_dates', 'intentions', 'projects', 'reminders', 'subscriptions', 'tasks', 'waiting_states']

## TABLE important_dates
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 title                        TEXT         notnull=1 default=None pk=0
   2 date                         TEXT         notnull=1 default=None pk=0
   3 description                  TEXT         notnull=0 default=None pk=0
   4 created_at                   TEXT         notnull=0 default=datetime('now') pk=0

-- CREATE statement --
CREATE TABLE important_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
)

-- indexes (1) --
  idx_dates unique=0 origin=c cols=['date']

-- sample rows (up to 2) --
{"id": 1, "title": "System Review", "date": "2026-08-24", "description": "Weekly system health check", "created_at": "2026-08-17 01:05:03"}

## TABLE intentions
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 title                        TEXT         notnull=1 default=None pk=0
   2 cue                          TEXT         notnull=0 default=None pk=0
   3 action                       TEXT         notnull=1 default=None pk=0
   4 status                       TEXT         notnull=0 default='dormant' pk=0
   5 created_at                   TEXT         notnull=0 default=datetime('now') pk=0
   6 triggered_at                 TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE intentions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    cue TEXT,
    action TEXT NOT NULL,
    status TEXT DEFAULT 'dormant' CHECK(status IN ('dormant', 'active', 'expired', 'completed')),
    created_at TEXT DEFAULT (datetime('now')),
    triggered_at TEXT
)

-- indexes (1) --
  idx_intentions_status unique=0 origin=c cols=['status']

-- sample rows (up to 2) --
{"id": 1, "title": "Review subscriptions", "cue": "monthly billing", "action": "Check billing dates", "status": "completed", "created_at": "2026-08-17 01:05:03", "triggered_at": "2026-08-21 22:58:26"}

## TABLE projects
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 name                         TEXT         notnull=1 default=None pk=0
   2 description                  TEXT         notnull=0 default=None pk=0
   3 status                       TEXT         notnull=0 default='active' pk=0
   4 created_at                   TEXT         notnull=0 default=datetime('now') pk=0
   5 updated_at                   TEXT         notnull=0 default=datetime('now') pk=0

-- CREATE statement --
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'archived')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
)

-- indexes (0) --

-- sample rows (up to 2) --
{"id": 1, "name": "Autognosia Setup", "description": "Initial setup and configuration of Autognosia", "status": "active", "created_at": "2026-08-17T01:05:03Z", "updated_at": "2026-08-30T17:54:23Z"}

## TABLE reminders
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 title                        TEXT         notnull=1 default=None pk=0
   2 remind_at                    TEXT         notnull=1 default=None pk=0
   3 channel                      TEXT         notnull=0 default='all' pk=0
   4 target_destination           TEXT         notnull=0 default=None pk=0
   5 status                       TEXT         notnull=0 default='pending' pk=0
   6 recurring_rule               TEXT         notnull=0 default=None pk=0
   7 notes                        TEXT         notnull=0 default=None pk=0
   8 created_at                   TEXT         notnull=0 default=datetime('now') pk=0
   9 sent_at                      TEXT         notnull=0 default=None pk=0

-- CREATE statement --
CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    remind_at TEXT NOT NULL,
    channel TEXT DEFAULT 'all' CHECK(channel IN ('all', 'telegram', 'discord', 'email', 'sms', 'desktop', 'gui')),
    target_destination TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'cancelled', 'snoozed')),
    recurring_rule TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    sent_at TEXT
)

-- indexes (1) --
  idx_reminders_status_time unique=0 origin=c cols=['status', 'remind_at']

-- sample rows (up to 2) --
{"id": 1, "title": "Test Reminder", "remind_at": "2026-08-19T10:00:00Z", "channel": "all", "target_destination": null, "status": "sent", "recurring_rule": null, "notes": "", "created_at": "2026-08-18T02:50:32Z", "sent_at": "2026-08-20T00:47:02.562660"}

## TABLE subscriptions
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 name                         TEXT         notnull=1 default=None pk=0
   2 amount                       REAL         notnull=1 default=None pk=0
   3 currency                     TEXT         notnull=0 default='USD' pk=0
   4 billing_cycle                TEXT         notnull=0 default='monthly' pk=0
   5 next_billing_date            TEXT         notnull=0 default=None pk=0
   6 status                       TEXT         notnull=0 default='active' pk=0
   7 created_at                   TEXT         notnull=0 default=datetime('now') pk=0
   8 updated_at                   TEXT         notnull=0 default=datetime('now') pk=0

-- CREATE statement --
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT DEFAULT 'monthly',
    next_billing_date TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'paused')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
)

-- indexes (1) --
  idx_subscriptions_next unique=0 origin=c cols=['next_billing_date']

-- sample rows (up to 2) --
{"id": 1, "name": "Example Subscription", "amount": 9.99, "currency": "USD", "billing_cycle": "monthly", "next_billing_date": "2026-09-16", "status": "active", "created_at": "2026-08-17 01:05:03", "updated_at": "2026-08-17 01:05:03"}

## TABLE tasks
row_count=3

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 title                        TEXT         notnull=1 default=None pk=0
   2 description                  TEXT         notnull=0 default=None pk=0
   3 status                       TEXT         notnull=0 default='active' pk=0
   4 priority                     TEXT         notnull=0 default='medium' pk=0
   5 due_at                       TEXT         notnull=0 default=None pk=0
   6 completed_at                 TEXT         notnull=0 default=None pk=0
   7 project_id                   INTEGER      notnull=0 default=None pk=0
   8 dependency_id                INTEGER      notnull=0 default=None pk=0
   9 created_at                   TEXT         notnull=0 default=datetime('now') pk=0
  10 updated_at                   TEXT         notnull=0 default=datetime('now') pk=0

-- CREATE statement --
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'cancelled', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
    due_at TEXT,
    completed_at TEXT,
    project_id INTEGER,
    dependency_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (dependency_id) REFERENCES tasks(id) ON DELETE SET NULL
)

-- indexes (3) --
  idx_tasks_project unique=0 origin=c cols=['project_id']
  idx_tasks_due unique=0 origin=c cols=['due_at']
  idx_tasks_status unique=0 origin=c cols=['status']
-- foreign keys --
  {'id': 0, 'seq': 0, 'table': 'tasks', 'from': 'dependency_id', 'to': 'id', 'on_update': 'NO ACTION', 'on_delete': 'SET NULL', 'match': 'NONE'}
  {'id': 1, 'seq': 0, 'table': 'projects', 'from': 'project_id', 'to': 'id', 'on_update': 'NO ACTION', 'on_delete': 'SET NULL', 'match': 'NONE'}

-- sample rows (up to 2) --
{"id": 3, "title": "Review subscription billing before 2026-09-16", "description": "Verify Example Subscription details, cancel if no longer needed before .99 charge on 2026-09-16.", "status": "active", "priority": "medium", "due_at": "2026-09-09", "completed_at": null, "project_id": null, "dependency_id": null, "created_at": "2026-08-21 22:58:26", "updated_at": "2026-08-22 05:58:26"}
{"id": 2, "title": "Research and select a project name", "description": "Compare Schemata, Dianoia, and Mnēmeia. Check GitHub availability, etymology, domain names, and branding fit. Decide on a final name and rename the repo if approved.", "status": "active", "priority": "medium", "due_at": "2026-09-01", "completed_at": null, "project_id": null, "dependency_id": null, "created_at": "2026-08-18T05:29:06Z", "updated_at": "2026-08-18T05:29:06Z"}

## TABLE waiting_states
row_count=1

-- PRAGMA table_info --
   0 id                           INTEGER      notnull=0 default=None pk=1
   1 title                        TEXT         notnull=1 default=None pk=0
   2 waiting_for                  TEXT         notnull=0 default=None pk=0
   3 follow_up_date               TEXT         notnull=0 default=None pk=0
   4 status                       TEXT         notnull=0 default='waiting' pk=0
   5 created_at                   TEXT         notnull=0 default=datetime('now') pk=0

-- CREATE statement --
CREATE TABLE waiting_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    waiting_for TEXT,
    follow_up_date TEXT,
    status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'resolved', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now'))
)

-- indexes (1) --
  idx_waiting_status unique=0 origin=c cols=['status']

-- sample rows (up to 2) --
{"id": 1, "title": "Awaiting feedback", "waiting_for": "User review on setup", "follow_up_date": "2026-08-20", "status": "resolved", "created_at": "2026-08-17 01:05:03"}