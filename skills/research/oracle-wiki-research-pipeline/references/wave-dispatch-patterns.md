# Wave Dispatch Patterns for Oracle Wiki Research

Validated during 2026-08-08 session: wave dispatching of 2-3 independent researchers works reliably on the RTX 3090.

## Why Waves Work

Each subagent gets its own isolated context window. The parent (main agent) only sees the delegation dispatch result, not the researcher's full context. So dispatching 3 researchers concurrently uses 3x the GPU memory but each stays within its own limit.

## Wave Sizing Rules

- **Wave of 2-3:** Safe for independent topics (no cross-dependencies)
- **Wave of 1:** Use when topics are interdependent or you need to review output before next dispatch
- **Never exceed 3:** The delegation pool has `max_concurrent_children=3` for this user

## Session Results (2026-08-08)

| Wave | Researchers | Outcome |
|------|------------|---------|
| Wave 1 | Perception, Motor Control, Evo Psych, Computation | ✅ All 4 landed |
| Wave 2 | Free Will, Speech/Audio | ✅ Both landed |
| Wave 3 | MoE, Control Theory, Ethics | ✅ All 3 landed |
| Wave 4 | Early Childhood (solo) | ✅ Landed |
| Wave 5 | Gut-Brain, Pain, Hormones | ✅ All 3 landed |
| Wave 6 | Causal Reasoning (sync), Foundation Models, Training Dynamics | ✅ All 3 landed |

Total: 18 researchers dispatched across 6 waves, 115 files on disk, zero failures.

## Key Findings

1. **write_file limit is NOT ~8K tokens for subagents** — Researchers successfully wrote 25-43KB files. The 8K limit applies to the *parent agent's* tool calls, not subagent tool calls which have separate limits.
2. **Context overflow only happens when the researcher's prompt is too large** — Keep each researcher's goal to 3-5 sub-topics max.
3. **Synchronous execution happens when pool is full** — If 3 researchers are already running, the 4th runs synchronously (blocks). This is fine — it still completes.
4. **Verification is still needed** — Always `ls -la` the target path after batch completion to confirm the file was written.

## Pitfalls

- **Don't dispatch researchers for topics that already have deep coverage** — Run a gap analysis first
- **Don't dispatch more than 3 at once** — Pool capacity limit
- **Don't skip verification** — A researcher can hit context overflow and return nothing
- **Don't make the goal too broad** — "Build a comprehensive wiki on X" overflows; "Cover these 5 specific subtopics of X" works
