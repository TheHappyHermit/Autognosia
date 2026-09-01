# Phase 3: Agent Intelligence — Implementation Reference

## What It Is

Agent Intelligence panels display real-time status of:
- Hermes gateway/agent processes
- Graphify knowledge graph health
- Scheduled cron jobs

## HTML Structure

Each panel follows this pattern:

```html
<section class="panel" style="grid-column: span 4;">
  <header class="panel-header">
    <div class="panel-title-group">
      <svg><!-- 16px icon --></svg>
      <h2 id="heading">Panel Title</h2>
    </div>
    <div class="panel-status" id="panel-status" aria-live="polite">
      <span class="panel-status__dot"></span>
      <span>Status text</span>
    </div>
  </header>
  <div class="panel-body panel-grid" id="panel-grid" role="list">
    <!-- Dynamic content -->
  </div>
  <footer class="panel-footer">
    <div class="panel-freshness">
      <span class="panel-status__dot"></span>
      <span id="panel-freshness-text">updated just now</span>
    </div>
  </footer>
</section>
```

Grid placement: `span 4` on 12-col grid = 3 panels per row.

## Backend Endpoints (FastAPI)

### /api/agent
Returns: `{gateway_running: bool, agent_running: bool, cron_jobs: int, memory_files: int, ...}`

Use `psutil.process_iter()` to find processes with 'hermes' in cmdline.

### /api/graphify
Returns: `{nodes: int, edges: int, brain_dir: str, active_wiki_dir: str}`

Walk `graphify-out/*.json` and `graphify-main-out/*.json` files, count nodes/edges.

### /api/cron
Returns: `{jobs: [{name, schedule, enabled, file}], total: int}`

Walk `~/.hermes/cron/*.yaml`, parse YAML text for `schedule:` and `enabled:` lines.

## CSS Classes

| Class | Purpose |
|-------|---------|
| `.agent-grid` | 2x2 grid for agent stats |
| `.agent-stat` | Individual stat card |
| `.agent-stat__label` | Stat label |
| `.agent-stat__value` | Stat value (use `ok`/`warn`/`danger` modifier classes) |
| `.graphify-grid` | Flex column for graph stats |
| `.graphify-stat` | Individual graph stat |
| `.cron-list` | Scrollable list for cron items |
| `.cron-item` | Individual cron job row |

## JavaScript Pattern

```javascript
// 1. Fetch
async fetchAgentStatus() {
  const res = await fetch(`${this.apiBase}/api/agent`);
  if (res.ok) {
    this.state.agentStatus = await res.json();
    this.renderAgentStatus();
  }
}

// 2. Render
renderAgentStatus() {
  const data = this.state.agentStatus || {};
  const grid = document.getElementById('agent-grid');
  if (!grid) return;
  
  const statusEl = document.getElementById('agent-status');
  statusEl.innerHTML = `
    <span class="panel-status__dot panel-status__dot--${data.gateway_running ? 'ok' : 'warn'}"></span>
    <span>${data.gateway_running ? 'Running' : 'Offline'}</span>
  `;
  
  grid.innerHTML = `
    <div class="agent-stat">
      <span class="agent-stat__label">Gateway</span>
      <span class="agent-stat__value ${data.gateway_running ? 'ok' : 'danger'}">
        ${escapeHtml(data.gateway_running ? '✓ Active' : '✗ Offline')}
      </span>
    </div>
    <!-- more stats -->
  `;
}

// 3. Wire into refreshAllData()
await Promise.all([
  // ... existing fetches ...
  this.fetchAgentStatus(),
  this.fetchCronJobs(),
  this.fetchGraphifyStatus(),
]);
```

## Status Dot Colors

| Class | Color | Use When |
|-------|-------|----------|
| `panel-status__dot--ok` | Emerald/green | Running, healthy |
| `panel-status__dot--warn` | Amber/yellow | Warning, no data |
| `panel-status__dot--info` | Cyan/blue | Info-only count |
| `panel-status__dot--danger` | Rose/red | Offline, error |
| `panel-status__dot--neutral` | Gray | Default |

## Common Pitfalls

1. **Missing `escapeHtml()`** — If your render functions inject raw API data into `innerHTML`, add the escape utility or risk XSS.
2. **FileResponse not imported** — If you added `FileResponse` routes, you MUST import it from `fastapi.responses`.
3. **`--port` arg ignored** — The parsing loop breaks on the first digit arg. Always kill old processes before starting.
4. **`0.0.0.0` vs `127.0.0.1`** — Bind to `0.0.0.0` for LAN access.
5. **Skeleton placeholders** — Always include skeleton loading states in the HTML so panels look correct before data arrives.
