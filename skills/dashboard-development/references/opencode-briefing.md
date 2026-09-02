# OpenCode Briefing Pattern

**When:** Briefing OpenCode (qwen3.8-27b via LM Studio on <DESKTOP_LMSTUDIO_IP>) for dashboard/code work.

## Rule: Never Exceed 30KB Combined

OpenCode chokes on massive combined briefings. 53KB caused a session that never returned. **30KB is the hard limit for combined file content in any single task brief.**

## Structure

### 1. Task Brief (concise, < 2KB)
Write a focused `TASK.md` in `$HOME/oc-work/dashboard-overhaul/`:

```markdown
# Phase X: [Topic]

## Context
You are improving the Autognosia Command Deck. Read these files:
- GAP_ANALYSIS.md (what to build)
- PHASEX_PROMPT.md (specific instructions)

## Files to Modify
- styles.css (add X, change Y)
- app.js (add fetchXxx, renderXxx)
- index.html (add hero-stats section)
- dashboard_server.py (add /api/xxx endpoint)

## Instructions
1. Read GAP_ANALYSIS.md and PHASEX_PROMPT.md first
2. Modify only the listed files
3. Preserve existing functionality
4. Use existing CSS token patterns
5. Return after completing all changes
```

### 2. Research Files (one per topic, 5-15KB each)
- `GAP_ANALYSIS.md` — Current state vs target state
- `PHASEX_PROMPT.md` — Phase-specific instructions
- `design-spec.md` — Visual design requirements from wiki research

### 3. Launch Command
```bash
cd $HOME/oc-work/dashboard-overhaul && \
opencode run 'You are improving the Autognosia Command Deck. Read these files first:
- TASK.md (instructions)
- GAP_ANALYSIS.md (what to build)
Then modify: styles.css, app.js, index.html, dashboard_server.py'
```

### 4. Monitoring
```bash
# Check if running
ps aux | grep opencode

# Check for output
ls -la $HOME/oc-work/dashboard-overhaul/

# Wait for completion
process(action='poll', session_id='proc_XXXXX')
```

## Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| Context too large (>30KB) | Split into separate research files |
| Terminal I/O hang | Kill process, restart with shorter prompt |
| Port conflict | `fuser -k 8088/tcp` before starting server |
| Changes not saving | Verify with `grep 'new-code' file.css` after run |
| Server ignoring --port | Check `run()` function in dashboard_server.py |
