---
name: prospective-memory
description: Prospective memory — IF-THEN intentions, trigger types, fire-once tracking.
---

# Prospective Memory

## Purpose
Remember dormant intentions and activate them when future cues occur.

## Intention Structure

```
title: What to do
action_type: how to do it (notify, execute, research, etc.)
action_payload: parameters for action
trigger_type: when to fire (time, task-state, conversation, external, webhook)
trigger_spec: JSON specifying the trigger conditions
fire_once: boolean (default true)
requires_confirmation: boolean (default false)
```

## Trigger Types

### Time Trigger
- `at` — specific date/time
- `before` — before a due date
- `recurring` — recurring pattern

### Task-State Trigger
- `when_task_completes` — task X finishes
- `when_project_activates` — project Y becomes active

### Conversation Trigger
- `when_keyword_mentioned` — user mentions specific terms
- `when_context_matches` — discussion about specific topics

### External-Condition Trigger
- `when_price_below` — price threshold
- `when_package_status` — package tracking
- `when_version_released` — software release

### Webhook Trigger
- `on_webhook_event` — external system push

## Firing Policy
- Check intentions every 15 minutes via cron
- Only surface matching candidates, not all pending
- Respecting `fire_once` prevents repeated firing
- `requires_confirmation` blocks execution until user approves
