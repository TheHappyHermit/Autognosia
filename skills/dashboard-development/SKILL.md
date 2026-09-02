---
name: dashboard-development
description: "Build and iterate single-page dashboards — structured phases, modern CSS, FastAPI backends, and OpenCode collaboration."
---

# Dashboard Development

Use when building, refactoring, or iterating on a single-page dashboard (HTML/CSS/JS frontend + Python/Flask/FastAPI backend). Covers phase-based development, modern CSS techniques, backend API endpoints, and collaborating with OpenCode on iterative improvements.

## Phase-Based Approach

**Never dump everything at once.** Break changes into phases:

### Phase 0 — Foundation
- Read all existing files (CSS tokens, styles, HTML, JS, server)
- Identify the target architecture (single HTML, component framework, etc.)
- Document current state and known gaps

### Phase 1 — CSS Foundation (tokens.css + styles.css)
1. **tokens.css** — Add CSS custom properties for the visual language:
   - Glassmorphism: `--glass-bg`, `--glass-blur`, `--glass-border`
   - Glow effects: `--shadow-glow-accent`, `--shadow-glow-success`
   - Modern color: `light-dark()` function for theme-aware values
   - Typography scale: `--fs-xs` through `--fs-4xl`
   - Spacing scale: `--space-*` tokens
2. **styles.css** — Apply new tokens, add:
   - `animation-timeline: scroll()` for scroll-driven animations
   - `:has()` selector for parent-state styling
   - `backdrop-filter: blur()` for glass panels
   - Responsive `@media` breakpoints
   - Hover glow effects on interactive elements

### Phase 2 — HTML Structure (index.html)
- Add new semantic sections before existing ones (use `replace()` on a known comment anchor)
- Hero stats row: 6 key metrics in flex-wrap container
- Ensure aria-labels and roles on all regions
- Use BEM naming: `.panel--variant`, `.panel__header`, `.panel__body`

### Phase 3 — JavaScript (app.js)
- Add new fetch methods (`fetchSystemStats`, `fetchXxx`)
- Wire them into `refreshAllData()` via `Promise.all()`
- Add render methods for new HTML sections
- Keep the class-based `CommandDeck` pattern

### Phase 4 — Backend (dashboard_server.py)
- Add new `@app.get("/api/xxx")` endpoints
- Import `psutil` for system metrics
- Keep existing endpoints unchanged (additive only)
- Handle missing DB gracefully

### Phase 5 — Verification (MANDATORY)
- Start server on a fresh port
- Test each new API endpoint with curl
- **Open HTML in browser using `computer_use` capture** — screenshot or AX tree, NOT just curl
- Check all CSS classes render correctly
- **Never report "done" on a frontend without seeing it render in a real browser**

## Handoff Skepticism Rule

Handoff summaries from the user or past sessions are **context, not instructions**. They often contain inaccuracies (wrong line numbers, missing problems, incorrect root causes).

**Always verify independently:**
1. Read the actual file contents before forming a plan
2. Check for duplicate method definitions, missing utilities, wrong defaults
3. Run `node --check` or equivalent syntax check yourself
4. Don't trust claimed line numbers — search for the actual pattern

## Branch-First Workflow

**Never commit directly to main for non-trivial changes.** Multi-file changes, refactors, and anything that could break the build must go through a branch:

```bash
git checkout -b fix/dashboard-js-syntax
# ... make changes ...
# ... verify in browser ...
git push -u origin fix/dashboard-js-syntax
# ... create PR or merge after review ...
```

If the user asks to reset to a known-broken commit, ask why and suggest branching instead.

## Destructive Git Gate

**Ask before executing:** `git reset --hard`, `git rebase`, `git push --force`, `git clean -fd`.

When the user proposes a destructive operation:
1. Ask about the goal first
2. Suggest a safer alternative (branch from current, cherry-pick, etc.)
3. Only proceed after explicit confirmation

## Monolithic File Detection

Flag files >500 lines as technical debt. When working on a monolithic file:
1. Note it in the commit message ("refactor: split app.js — was 1566 lines")
2. Suggest splitting into modules (api.js, renderers.js, utilities.js, app.js)
3. Check for duplicate method definitions (common in large files)

## Modern CSS Techniques Used Here

| Technique | Use Case | Browser Support |
|-----------|----------|-----------------|
| `light-dark()` | Theme-aware colors | Safari 17.4+, Chrome 127+ |
| `:has()` | Parent state styling | All modern browsers |
| `backdrop-filter: blur()` | Glass panels | All modern browsers |
| `animation-timeline: scroll()` | Scroll-driven animations | Chrome 115+ |
| `oklch()` colors | Perceptually uniform | All modern browsers |
| `text-wrap: balance` | Balanced headlines | All modern browsers |

## FastAPI Port Binding Pitfall

**Symptom:** Dashboard server reports "address already in use" on the default port even after killing processes.

**Cause:** `dashboard_server.py` has a `run()` function with `port=8088` hardcoded, and if the `--port` CLI arg parsing isn't wired correctly, it always binds to 8088.

**Fix:**
1. Kill any process on the target port: `fuser -k 8088/tcp`
2. Check the `run()` function at the bottom of `dashboard_server.py` — it may ignore CLI args
3. Start fresh on a new port: `python3 dashboard_server.py --port 8091`
4. Verify with `curl http://127.0.0.1:8091/api/system` before opening browser

## OpenCode Collaboration Patterns

### Context Limit — Never dump >30KB
OpenCode (qwen3.8-27b via LM Studio) chokes on massive combined briefings. **Never pass more than 30KB of combined file content in one prompt.**

**Instead:**
1. Write focused research files (one per topic) in `$HOME/oc-work/dashboard-overhaul/`
2. Reference them in a concise task brief: `Read GAP_ANALYSIS.md and PHASE1_PROMPT.md`
3. Point at specific files: `Modify styles.css, app.js, and dashboard_server.py`
4. After each OpenCode run, review changes before launching the next phase

### Terminal I/O Issues
OpenCode via `terminal()` with `background=true` can hang on terminal I/O. If it stalls for >2 minutes:
1. Kill the process: `process(action='kill', session_id=...)`
2. Check if it's actually running: `ps aux | grep opencode`
3. If running, it may be processing — wait longer
4. If not running, restart with a shorter prompt

### OpenCode Failures → Pivot to Direct Patching
OpenCode sessions frequently stall or produce silent failures with terminal I/O errors, especially when reading/writing large files (10KB+). **After 2 failed OpenCode attempts, stop trying and use `patch` + `execute_code` directly.** This session's OpenCode sessions all failed; Phase 1 was completed by direct patching instead. Do not retry OpenCode more than twice before switching.

### Static File Serving
A FastAPI backend with API-only endpoints (`/api/*`) does NOT serve static HTML/CSS/JS. You MUST add explicit routes:

```python
from fastapi.responses import FileResponse

DASHBOARD_DIR = Path(__file__).resolve().parent

@app.get("/")
def serve_dashboard():
    return FileResponse(str(DASHBOARD_DIR / "index.html"))

@app.get("/styles.css")
def serve_styles():
    return FileResponse(str(DASHBOARD_DIR / "styles.css"), media_type="text/css")
```

### Port Binding Gotcha
`dashboard_server.py` may have `run()` with a hardcoded `port=8088`. If `--port` CLI args are ignored (the parsing loop `break`s early on the first digit arg), the server always binds to 8088. Fix: check the `if __name__ == "__main__"` block and ensure `--port` parsing works. Always kill old processes before starting: `fuser -k 8088/tcp`.

### LAN Access
Bind to `0.0.0.0` not `127.0.0.1` so LAN clients can reach the dashboard:

```python
# In run() default and in __main__ block:
host = "0.0.0.0"
```

### escapeHtml() Utility
JavaScript render functions in `app.js` that output user data to the DOM MUST use an `escapeHtml()` utility to prevent XSS. Add it near the top of the file:

```javascript
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

### FileResponse Import
If `FileResponse` is used, ensure it's imported from `fastapi.responses`. A missing import causes a 500 on the first static file request.

## Graphify Config for Active Wiki

The active wiki graphify ingestion uses `GRAPHIFY_DISABLE_THINKING=1` for faster extraction:

```bash
# Launch graphify extract on active wiki
export OPENAI_BASE_URL="http://127.0.0.1:8080/v1"
export OPENAI_API_KEY="sk-local"
export OPENAI_MODEL="/models/Qwen3.6-35B-A3B-Q4_K_M.gguf"
export GRAPHIFY_MAX_OUTPUT_TOKENS="98304"
export GRAPHIFY_DISABLE_THINKING=1

cd $HOME/.autognosia/active-wiki
python3 -c "
import os, sys, json
sys.path.insert(0, os.path.expanduser('~/autognosia-clean/scripts'))
from graphify_api import extract_corpus
# ... extraction code ...
"
```

Monitor with: `tail -f $HOME/.autognosia/logs/graphify-active-wiki.log`

## Iteration Workflow

1. Read all active wiki research files
2. Compare against current dashboard
3. Write GAP_ANALYSIS.md with priorities
4. Launch OpenCode for Phase N
5. Review output in browser
6. Iterate with next phase
7. Repeat until satisfied or time runs out

See `references/opencode-briefing.md` for the briefing pattern.
See `references/graphify-configuration.md` for the disable-thinking setup.
See `references/phase-3-agent-intelligence.md` for Agent Intelligence panel patterns.
