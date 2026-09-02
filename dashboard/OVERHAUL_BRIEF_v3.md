# Command Deck v3 — Complete UI Overhaul Brief

**FROM:** Hermes (Orchestrator)
**TO:** Coder Agent (OpenCode)
**DATE:** 2026-09-01
**PRIORITY:** CRITICAL — Dashboard is embarrassing, needs premium high-end finish

---

## 1. Current State Audit (What's Wrong)

| Area | Current | Target |
|------|---------|--------|
| **Theme** | Dark mode hardcoded default, NO theme toggle | Light-mode-first, with dark toggle |
| **Sidebar** | Dark `rgba(15,16,17,0.95)` glass, only 2 nav items | Almost transparent glassmorphism, 6+ views, collapse/expand |
| **Icons** | Emoji everywhere (🏠🤖🔍🔔☰➤) | Clean SVG icons (Heroicons/Lucide style) |
| **Views** | Only 2: Dashboard + Bots | 6: Dashboard, Agents, Calendar, Tasks, Services, Home Lab |
| **Header** | Text "Autognosia" overlaps sidebar, no breathing room | Proper spacing, premium command-bar feel |
| **Sidebar collapse** | Static, no expand/contract | Animated slide in/out on toggle |
| **Mobile** | Broken — sidebar doesn't slide out properly | Smooth mobile slide-out drawer |
| **Empty panels** | `--` placeholders, skeleton cards never resolve | All panels show live data or elegant empty states |
| **Data** | `data-theme="dark"` hardcoded, no localStorage | Theme persists in localStorage |

---

## 2. Target Design System

### Light Mode (Default)
- **Sidebar:** `rgba(255,255,255,0.55)` + `backdrop-filter: blur(20px) saturate(180%)` — almost completely transparent glass, subtle border `rgba(0,0,0,0.06)`
- **Background:** `#f8f9fa` (off-white, warm)
- **Cards/Panels:** White with subtle shadow, `backdrop-filter: blur(12px)` for glass effect
- **Header:** Same glass treatment as sidebar, search bar with subtle background
- **Text:** Dark grays (`#1a1a1a`, `#4a4a4a`, `#8a8a8a`) — NO pure black/white
- **Accent:** Keep cyan `#22d3ee` but soften for light mode (use `#0891b2` for text, `#22d3ee` for glows)
- **Borders:** `rgba(0,0,0,0.06)` — barely visible

### Dark Mode (Toggle)
- **Sidebar:** `rgba(15,16,17,0.72)` + `backdrop-filter: blur(20px)` — current dark glass is good, just make it more transparent
- **Background:** `#08090a` (current is fine)
- **Cards:** `rgba(15,16,17,0.72)` glass
- **Text:** Current light grays are good

### Typography
- **Font:** Inter (already loaded) — ensure it's actually loading from Google Fonts or system
- **Monospace:** JetBrains Mono for data values
- **Scale:** Keep current scale but increase base to 13px (12px is too small)

---

## 3. Required Changes (Work Through IN ORDER)

### Phase 1: Theme System + Light Mode
1. Add Google Fonts link for Inter in `<head>`
2. Create `[data-theme="light"]` override block in `tokens.css` with all light-mode colors
3. Change default `data-theme` to `light` in HTML
4. Add theme toggle button to header (sun/moon SVG icon)
5. Theme toggle saves to `localStorage` and applies on load
6. Ensure ALL components have light-mode variants (sidebar, header, panels, cards, inputs, buttons)

### Phase 2: Sidebar Glassmorphism + Expand/Contract
1. Make sidebar background almost transparent glass in both themes
2. Add collapse/expand toggle button (hamburger or chevron SVG)
3. Collapsed state: ~56px wide, icons only, labels hidden
4. Expanded state: ~200px wide, icons + labels
5. Smooth CSS transition on width (300ms ease-out)
6. Mobile: sidebar slides out as overlay drawer (transform translateX)

### Phase 3: SVG Icons (Replace ALL Emoji)
Replace every emoji icon with inline SVG:
- 🏠 Dashboard → Home icon
- 🤖 Agents → Robot/CPU icon  
- 📅 Calendar → Calendar icon
- ✅ Tasks → Checkmark/clipboard icon
- 🔧 Services → Gear/server icon
- 🖥️ Home Lab → Monitor icon
- 🔍 Search → Magnifying glass
- 🔔 Notifications → Bell
- ☰ Hamburger → Menu bars
- ➤ Send → Paper plane
- 📁 Projects → Folder
- 🕸️ Graphify → Network/graph
- 📧 Email → Envelope
- 🎯 Intentions → Target
- 📊 Analytics → Chart

Use Heroicons or Lucide SVG paths (24x24 viewBox, stroke-based).

### Phase 4: Complete Navigation (6 Views)
Add to sidebar:
1. **Dashboard** (home icon) — already exists
2. **Agents** (CPU/robot icon) — already exists as "Bots"
3. **Calendar** (calendar icon) — NEW
4. **Tasks** (clipboard icon) — NEW  
5. **Services** (gear icon) — NEW
6. **Home Lab** (monitor icon) — NEW

Each nav item needs:
- `data-view="viewname"` attribute
- SVG icon
- Label text
- Active state styling

### Phase 5: View Sections
Create view sections for all 6 views:
1. `view-dashboard` — exists, keep
2. `view-bots` — exists, rename to `view-agents` (keep bots as label)
3. `view-calendar` — NEW (calendar grid + event list)
4. `view-tasks` — NEW (kanban board or list)
5. `view-services` — NEW (service status grid)
6. `view-homelab` — NEW (server cards)

Each view section:
- `class="view-section"` 
- Hidden by default, `.active` shows it
- Has its own header/title area
- Populated by corresponding JS module

### Phase 6: Header Fixes
1. Add proper left margin/padding so text doesn't overlap sidebar
2. Add theme toggle button (sun/moon)
3. Ensure search bar has proper glass background in light mode
4. Notification bell with badge
5. System status with LIVE indicator (keep current pulse animation)

### Phase 7: Show View Logic Fix
Fix `showView()` in app-core.js:
- Don't hide main-content for non-dashboard views
- Each view-section should be positioned correctly in the layout
- All views should be visible when active, not just dashboard

### Phase 8: Data Population
Ensure all panels show real data or elegant empty states:
- No `--` placeholders
- No skeleton cards that never resolve
- Graceful "No data" empty states with icon + message + action button
- All data fetched from `/api/*` endpoints

---

## 4. Files to Modify

```
dashboard/
├── index.html          (add views, SVG icons, theme toggle, nav items)
├── tokens.css          (add light mode overrides, update typography)
├── sidebar.css         (glassmorphism, collapse/expand, light mode)
├── header.css          (light mode, theme toggle button, spacing)
├── layout.css          (view-section handling, responsive)
├── app-core.js         (showView fix, theme toggle logic, view routing)
├── app-data-fetch.js   (ensure all endpoints populated)
├── app-calendar.js     (calendar view logic)
├── app-tasks.js        (tasks view logic)
├── app-services.js     (services view logic)
├── app-agent.js        (agents view logic)
├── app-bots.js         (keep, wire to agents view)
├── app-comms.js        (comms panel)
├── app-crud.js         (CRUD operations)
├── enhance.js          (theme toggle, UI enhancements)
├── calendar.css        (light mode)
├── tasks.css           (light mode)
├── services.css        (light mode)
├── home-lab.css        (light mode)
├── bots.css            (light mode)
├── agent.css           (light mode)
├── briefing.css        (light mode)
├── comms.css           (light mode)
├── drawers.css         (light mode)
└── dashboard_server.py (ensure all API endpoints return data)
```

---

## 5. Quality Standards

- **NO emoji icons** — every icon must be SVG
- **NO `--` placeholders** — show real data or elegant empty state
- **NO hardcoded dark mode** — default to light, toggle to dark
- **NO missing views** — all 6 views must render content
- **NO overlapping text** — header must respect sidebar width
- **NO broken mobile** — sidebar must slide out on mobile
- **NO static sidebar** — must collapse/expand with animation
- **NO pure black/white** — use warm grays in light mode

---

## 6. Verification Checklist

After ALL changes are made, verify in browser:

- [ ] Page loads in LIGHT mode by default
- [ ] Theme toggle switches to dark mode and back
- [ ] Theme persists on page reload (localStorage)
- [ ] Sidebar is almost transparent glass
- [ ] Sidebar collapses to icons-only when toggled
- [ ] Sidebar expands back with animation
- [ ] All 6 nav items visible with SVG icons (no emoji)
- [ ] Clicking each nav item shows the correct view
- [ ] Dashboard view shows live data (no `--`)
- [ ] Agents view shows agent list
- [ ] Calendar view shows calendar
- [ ] Tasks view shows task list
- [ ] Services view shows service grid
- [ ] Home Lab view shows server cards
- [ ] Header doesn't overlap sidebar
- [ ] Search bar visible and styled
- [ ] Theme toggle button visible in header
- [ ] Mobile: sidebar slides out as overlay
- [ ] No console errors
- [ ] All CSS validates
- [ ] All JS passes `node --check`

---

## 7. Reference

The user wants the dashboard to look like **Apple, Linear, Vercel, or Google** web apps — clean, open, high-end, premium. Light-mode-first with glassmorphism. The current dark "command center" look is NOT what they want.

**Key phrase from user:** "Glass morphism is good and dark mode is good, but it should start light mode high end colors with the left navibar almost completely transparent glass morphism that pops in and out."

---

## 8. Important Notes

- Work in `/home/josh434/dashboard/` directly (this is the live directory)
- Do NOT create a copy in `/tmp` — work on the actual files
- Test changes by running `python3 dashboard_server.py --port 8088` and opening in browser
- The dashboard is served at `http://10.1.1.37:8088`
- After all changes, commit to git with message: "feat: Command Deck v3 — light mode, glass nav, SVG icons, 6 views"
