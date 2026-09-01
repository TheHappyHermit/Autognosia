---
name: personal-cognitive-router
description: Metacognitive router — decides which specialist/handle each task, chooses reasoning mode.
---

# Personal Cognitive Router

## Purpose
Route incoming tasks to the right specialist and reasoning mode based on task class.

## Routing Rules

| Task Class | Specialist | Reasoning Mode |
|------------|------------|----------------|
| TASK / PROJECT / DATE / SUBSCRIPTION | Personal Ops | DIRECT_TOOL_QUERY |
| PROSPECTIVE INTENTION | Personal Ops intention | STRUCTURED_TOOL_QUERY |
| USER PREFERENCE / PERSONAL MODEL | Honcho | RETRIEVE |
| EXACT OLD CONVERSATION | Hermes session_search | RETRIEVE |
| CURRENT KNOWLEDGE | Active Wiki (LLM-Wiki) | NATIVE_SKILL |
| HISTORICAL KNOWLEDGE | Oracle | RETRIEVE |
| MISSING / STALE CURRENT KNOWLEDGE | Research | RESEARCH |
| COMPLEX / RISKY PLAN | Planner | PLAN_EXECUTE |
| AMBIGUOUS EVALUATION | Auditor | AUDIT |

## Reasoning Modes

- **DIRECT** — Simple factual question, answer directly
- **NATIVE_SKILL** — Use existing Hermes skill
- **STRUCTURED_TOOL_QUERY** — Call Personal Ops API
- **RETRIEVE** — Search knowledge stores
- **REACT/TOOL_LOOP** — Multi-step with tool calls
- **PLAN_EXECUTE** — Planner generates plan, then execute
- **DEEP_PLANNER** — Complex planning with pre-mortem
- **MOA** — Mixture of Agents deliberation
- **RESEARCH** — Fresh external research
- **AUDIT** — Ambiguous evaluation

## Satisficing Policy
Stop when sufficient evidence exists for a reliable decision. Don't fill context to ceiling.
