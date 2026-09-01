# Command Deck Dashboard — Full Development Plan

> **For Hermes:** This plan guides the full 8-phase lifecycle. Execute via Coder + OpenCode.

**Goal:** Transform the existing 2-view dashboard into a complete, premium Dark Executive Command Center with all sections wired up — live data, Apple/Grokbot-quality aesthetic, and full navigation.

**Architecture:** Single-page FastAPI app. `app-core.js` is the router/state manager. Each section (dashboard, bots, calendar, tasks, services, home lab) is a view rendered by its own JS module. CSS is modular per-section. Server exposes REST APIs for all data.

**Tech Stack:** Python 3.11 + FastAPI, vanilla JS (ES modules), CSS custom properties, no build step.

---

## Current State Audit

### File Inventory (34 files, 9,992 LOC)

| Category | Files | LOC |
|----------|-------|-----|
| Python backend | 10 | ~2,800 |
| JS frontend | 10 | ~3,100 |
| CSS stylesheets | 13 | ~3,700 |
| HTML | 1 | 432 |

### Views Exist But NOT Wired to Sidebar
- ✅ `view-dashboard` — main stats/overview (sidebar link exists)
- ✅ `view-bots` — bot management (sidebar link exists)
- ❌ `view-calendar` — CSS + JS exist, NO sidebar link
- ❌ `view-tasks` — CSS + JS exist, NO sidebar link  
- ❌ `view-services` — CSS + JS exist, NO sidebar link
- ❌ `view-home-lab` — CSS + JS exist, NO sidebar link

### API Endpoints (27 total, all functional)
- `/api/system` ✅ — CPU, RAM, disk, network
- `/api/overview` ✅ — aggregated stats
- `/api/briefing` ✅ — daily briefing
- `/api/tasks`, `/api/projects`, `/api/calendar`, `/api/emails` ✅
- `/api/intentions`, `/api/reminders` ✅
- `/api/telemetry`, `/api/health` ✅
- `/api/bots`, `/api/bots/{id}/history`, `/api/bots/{id}/message` ✅
- `/api/services`, `/api/services/{name}`, `/api/media/active`, `/api/queue` ✅
- `/api/homelab` ✅ — servers, services, GPU
- `/api/agent`, `/api/cron`, `/api/graphify` ✅

### Issues Found
1. **Only 2 of 6 views accessible** from sidebar nav
2. **Graphify graph has 0 edges** (broken, needs rebuild)
3. **Cron API returns 0 jobs** (monitor issue)
4. **Home lab servers 10.1.1.37 and 10.1.1.18 offline** (network unreachable from this host)
5. **Most services report unhealthy** (monitoring only, not a code issue)
6. **Aesthetic is "kinda sick"** (Josh's words) — needs Apple/Grokbot premium treatment

---

## Development Plan

### Phase 1: Wire All Views (Priority: CRITICAL)

**Goal:** Make all 6 sections accessible from sidebar nav.

#### Task 1.1: Add Sidebar Links for Missing Views

**File:** `index.html` (lines 31-33)

Add sidebar links for calendar, tasks, services, and home lab:

```html
<a href="#" class="sidebar-link" data-view="calendar" aria-label="Calendar" title="Calendar">📅<span class="sidebar-label">Calendar</span></a>
<a href="#" class="sidebar-link" data-view="tasks" aria-label="Tasks" title="Tasks">✅<span class="sidebar-label">Tasks</span></a>
<a href="#" class="sidebar-link" data-view="services" aria-label="Services" title="Services">⚙️<span class="sidebar-label">Services</span></a>
<a href="#" class="sidebar-link" data-view="homelab" aria-label="Home Lab" title="Home Lab">🖥️<span class="sidebar-label">Home Lab</span></a>
```

#### Task 1.2: Add View Section Containers

**File:** `index.html` (after existing `view-bots` section, line ~371)

```html
<section id="view-calendar" class="view-section" role="region" aria-label="Calendar" hidden></section>
<section id="view-tasks" class="view-section" role="region" aria-label="Tasks" hidden></section>
<section id="view-services" class="view-section" role="region" aria-label="Services" hidden></section>
<section id="view-homelab" class="view-section" role="region" aria-label="Home Lab" hidden></section>
```

#### Task 1.3: Wire View Rendering in app-core.js

**File:** `app-core.js`

Update `showView()` to handle all 6 views:

```javascript
showView(view) {
  document.querySelectorAll('.view-section').forEach(s => s.hidden = true);
  const target = document.getElementById(`view-${view}`);
  if (target) {
    target.hidden = false;
    this.renderView(view);
  }
}

renderView(view) {
  switch(view) {
    case 'dashboard': this.renderOverview(); this.renderBriefing(); break;
    case 'bots': /* rendered by app-bots.js */ break;
    case 'calendar': this.renderCalendar(); break;
    case 'tasks': this.renderTasks(); break;
    case 'services': this.renderServices(); break;
    case 'homelab': this.renderHomeLab(); break;
  }
}
```

#### Task 1.4: Load All JS Modules in index.html

**File:** `index.html` (before closing `</body>`)

```html
<script type="module" src="/app-core.js"></script>
<script type="module" src="/app-bots.js"></script>
<script type="module" src="/app-calendar.js"></script>
<script type="module" src="/app-tasks.js"></script>
<script type="module" src="/app-services.js"></script>
<script type="module" src="/app-data-fetch.js"></script>
<script src="/enhance.js"></script>
```

#### Task 1.5: Update app.js to Remove Duplicate Rendering

**File:** `app.js`

Remove any functions that duplicate what app-core.js now handles. Keep only utility functions (`showToast`, `escapeHtml`, `formatTime`, etc.).

---

### Phase 2: Premium Aesthetic Overhaul

**Goal:** Apple/Grokbot-quality dark glassmorphism. Every panel, card, and interaction feels premium.

#### Task 2.1: Enhanced Design Tokens

**File:** `tokens.css`

Add premium tokens:
- Glass panel gradients
- Glow shadows (accent, success, warning, danger)
- Refined typography scale (JetBrains Mono for data, Inter for UI)
- Smooth transitions and micro-interactions

#### Task 2.2: Sidebar Glass Morphism

**File:** `sidebar.css`

- Glass backdrop blur
- Thin border with subtle glow
- Active link: left accent bar + background tint
- Hover lift on links

#### Task 2.3: Header Premium Treatment

**File:** `header.css`

- Thin minimal header
- Large monospace clock with colon blink
- Live status pill (green dot + "LIVE")
- Search bar with glass styling

#### Task 2.4: Panel & Card Components

**File:** `layout.css`

- `.panel` class: glass background, rounded corners, subtle border
- `.panel__header`: flex with title + optional action
- `.panel__body`: padded content area
- `.stat-card`: large monospace number + label + optional delta
- Hover: subtle glow intensifies

#### Task 2.5: Status Badges & Indicators

**File:** `tokens.css`

- `.badge` variants: success (green glow), warning (amber glow), danger (red glow), info (cyan glow)
- `.status-dot`: 8px circle with colored glow
- `.live-dot`: animated pulsing green dot

---

### Phase 3: Data & API Improvements

**Goal:** Make all data live, functional, and reliable.

#### Task 3.1: Fix Cron API

**File:** `dashboard_server.py`

The `/api/cron` endpoint returns `{"jobs":[],"total":0}`. Fix by querying Hermes cron jobs:

```python
@app.get("/api/cron")
def get_cron_jobs():
    """Return Hermes cron job status."""
    try:
        import subprocess
        result = subprocess.run(
            ["hermes", "cron", "list", "--json"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
    except Exception as e:
        pass
    return {"jobs": [], "total": 0, "error": "Could not fetch cron jobs"}
```

#### Task 3.2: Fix Graphify Edge Count

**Not a code fix** — requires running `graphify extract` on the corpus. This is a separate operational task (V100, ~30min). Skip for now but note as follow-up.

#### Task 3.3: Home Lab GPU Display

**File:** `dashboard_server.py`

The homelab endpoint shows GPU for 10.1.1.10 (local) but not for other servers. Add GPU detection for all servers that have NVIDIA GPUs.

#### Task 3.4: Services Status Caching

**File:** `dashboard_server.py`

Services health checks are slow (sequential, 2s timeout each). Add:
- 30-second in-memory cache for service health
- Parallel health checks using `asyncio.gather`

---

### Phase 4: View Implementations

**Goal:** Each view is fully functional with live data.

#### Task 4.1: Dashboard View Enhancement

**Files:** `app-data-fetch.js`, `index.html`

- Hero stats row with 6 key metrics in glass cards
- Briefing panel with today's priorities
- Telemetry mini-panels (cron, agent, gateway)
- Auto-refresh every 60s

#### Task 4.2: Calendar View

**Files:** `app-calendar.js`, `calendar.css`

- Day/week/month toggle
- Timeline with hour slots
- Event cards with category color coding
- Today highlight
- Empty state when no events

#### Task 4.3: Tasks View

**Files:** `app-tasks.js`, `tasks.css`

- Kanban board (todo, in-progress, done)
- Task cards with priority, due date, project
- Quick add input
- Filter by status/project
- Checkbox to complete

#### Task 4.4: Services View

**Files:** `app-services.js`, `services.css`

- Service cards in grid
- Status indicator per service
- Port + health status
- Category grouping (media, automation, monitoring, etc.)
- Click for detail drawer

#### Task 4.5: Home Lab View

**Files:** `home-lab.css`

- Server cards (Main, Agent, Agent Zero)
- Per-server service status
- GPU info with utilization bar
- Network topology hint
- Live status indicator per server

---

### Phase 5: Final Polish

**Goal:** Production-ready, verified, and pushed.

#### Task 5.1: PII Scrub

Scrub all files for:
- Real IPs → `<MAIN_HOST>`, `<AGENT_HOST>`, `<AGENT_ZERO_HOST>`
- Real paths → `$HOME`, `$AUTOGNOSIA`
- Hostnames → placeholders

#### Task 5.2: Accessibility Audit

- All interactive elements have `aria-label`
- Color contrast ≥ 4.5:1 for text
- Keyboard navigation works
- `prefers-reduced-motion` respected

#### Task 5.3: Browser Verification

- Screenshot every view
- Click every sidebar link
- Verify no JS errors in console
- Test on mobile viewport (responsive)

#### Task 5.4: Push to GitHub

- Feature branch: `feature/full-dashboard-v2`
- Conventional commits
- All changes pushed

---

## Execution Order

1. Phase 1 (wire views) — MUST GO FIRST, unblocks everything
2. Phase 2 (aesthetic) — CSS overhaul across all views
3. Phase 3 (data/API) — backend reliability
4. Phase 4 (view implementations) — per-section functionality
5. Phase 5 (polish) — verification + ship

## Risks

| Risk | Mitigation |
|------|------------|
| OpenCode produces broken CSS | Verify in browser after each task |
| View routing conflicts | Test each view independently before combining |
| Server port conflict | Use fresh port (8092) for verification |
| Large file size | app.js is already 1,566 lines; split if >2000 |
