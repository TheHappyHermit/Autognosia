# Autognosia Command Deck — Docker Refactor & Premium UI Overhaul

You are refactoring the Autognosia Command Deck (currently a bare Python process) into a production-ready, Docker-native open-source product with a premium UI/UX.

CURRENT STATE (backed up at commit 4807559):
- FastAPI + vanilla CSS/JS dashboard for homelab monitoring
- WebSocket real-time updates, Docker integration, task management
- Split into ES6 modules (8 JS + 8 CSS files)
- Monolithic Python backend (~1200 lines) with hardcoded paths

YOUR MISSION: Make this a beautiful, open-source-ready product.

════════════════════════════════════════════════════════════════════════
PHASE 1 — Docker-Native Refactor
════════════════════════════════════════════════════════════════════════

Goal: Someone clones the repo, runs `docker compose up`, gets a working dashboard.

Work in ~/oc-work/dashboard-docker/ (NEVER touch live files directly).

1. Create `~/oc-work/dashboard-docker/` and copy the current dashboard/ contents there.

2. Backend refactor (dashboard_server.py → modular):
   - Extract hardcoded paths to environment variables:
     * `AUTOGNOSIA_HOME` (default: /data)
     * `ORGANIZER_DB_PATH` (default: $AUTOGNOSIA_HOME/organizer.db)
     * `DOCKER_SOCKET` (default: /var/run/docker.sock, optional)
   - Graceful degradation: if Docker socket missing, show "Docker monitoring disabled"
   - Config file (config.yaml or .env) for service definitions
   - Healthcheck endpoint at /api/health returning JSON status
   - Support `CONFIG_PATH` env var for custom config location

3. Dockerfile:
   - Base: python:3.11-slim
   - Install: fastapi, uvicorn, psutil, websockets, requests
   - Non-root user (uid 1000)
   - Healthcheck: curl -f http://localhost:8088/api/health || exit 1
   - Expose: 8088, 8089

4. docker-compose.yml:
   - Dashboard service
   - Volumes: ./data:/data, ./config:/config, /var/run/docker.sock:/var/run/docker.sock:ro
   - Restart: unless-stopped
   - Environment: AUTOGNOSIA_HOME=/data, CONFIG_PATH=/config/services.yaml
   - Resource limits: 512MB RAM, 1 CPU

5. Demo mode:
   - If no organizer.db exists, generate a demo one with sample tasks/projects
   - If Docker socket missing, show mock service data
   - This lets anyone see the full UI without any setup

════════════════════════════════════════════════════════════════════════
PHASE 2 — Premium UI/UX Redesign
════════════════════════════════════════════════════════════════════════

Design language: Apple/Microsoft Fluent hybrid — clean, spacious, whisper-quiet.

New color system (replace existing tokens.css entirely):

```css
:root {
  /* Surfaces — Apple-style neutral gray with subtle blue undertone */
  --bg-primary: light-dark(#f5f5f7, #0d0d0f);      /* Apple systemBackground */
  --bg-secondary: light-dark(#ffffff, #1c1c1e);     /* card/panel base */
  --bg-tertiary: light-dark(#f0f0f2, #2c2c2e);      /* raised surfaces */
  --bg-elevated: light-dark(#ffffff, #3a3a3c);      /* modals, popovers */

  /* Borders — whisper-thin */
  --border-subtle: light-dark(oklch(0 0 0 / 0.08), oklch(1 0 0 / 0.08));
  --border-active: light-dark(oklch(0.55 0.15 250 / 0.4), oklch(0.7 0.15 250 / 0.4));

  /* Text — Apple uses slightly softer than pure black/white */
  --text-1: light-dark(oklch(0.15 0.01 250), oklch(0.95 0.01 250));
  --text-2: light-dark(oklch(0.45 0.01 250), oklch(0.72 0.01 250));
  --text-3: light-dark(oklch(0.65 0.01 250), oklch(0.50 0.01 250));

  /* Accents — Apple blue, slightly deeper than current cyan */
  --accent: light-dark(#007aff, #0a84ff);
  --accent-soft: light-dark(oklch(0.55 0.15 250 / 0.1), oklch(0.7 0.15 250 / 0.15));

  /* Status — Apple System colors */
  --success: light-dark(#34c759, #30d158);
  --warning: light-dark(#ff9500, #ff9f0a);
  --danger: light-dark(#ff3b30, #ff453a);
  --info: light-dark(#5ac8fa, #64d2ff);

  /* Typography — Apple uses SF, we use system-ui */
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  --font-mono: 'SF Mono', ui-monospace, 'Cascadia Code', monospace;

  /* Spacing — Apple uses 4pt grid, generous */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Radius — Apple uses generous rounded corners */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows — subtle, Apple doesn't use heavy shadows */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.04);
  --shadow-md: 0 2px 8px oklch(0 0 0 / 0.06);
  --shadow-lg: 0 8px 24px oklch(0 0 0 / 0.08);
  --shadow-xl: 0 16px 48px oklch(0 0 0 / 0.12);

  /* Glassmorphism — iOS-style frosted glass */
  --glass-bg: light-dark(oklch(1 0 0 / 0.72), oklch(0.15 0.01 250 / 0.72));
  --glass-border: light-dark(oklch(1 0 0 / 0.2), oklch(1 0 0 / 0.1));
  --glass-blur: blur(20px) saturate(180%);

  /* Motion — Apple uses ease-in-out, quick */
  --motion-fast: 150ms cubic-bezier(0.25, 0.1, 0.25, 1);
  --motion-base: 250ms cubic-bezier(0.25, 0.1, 0.25, 1);
  --motion-slow: 350ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

Layout redesign (replaces current bento grid):

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER: ≡  Autognosia        [Search...]  🔔  ⚡  🟢 LIVE      │
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│  NAV   │  MAIN CONTENT AREA                                      │
│  BAR   │  (scrollable panels)                                    │
│        │                                                         │
│  🏠    │                                                         │
│  📊    │                                                         │
│  🤖    │                                                         │
│  🎬    │                                                         │
│  📥    │                                                         │
│  ⚙️    │                                                         │
│        │                                                         │
│ ──────│                                                         │
│  👤   │                                                         │
│  Admin │                                                         │
│        │                                                         │
└────────┴─────────────────────────────────────────────────────────┘
```

Nav bar (left, 64px wide, translucent glass):
- Icons only by default, expands to show labels on hover
- Sections: Dashboard, System, Bots, Media, Downloads, Settings
- User profile at bottom
- Active state: accent-colored left border + highlighted icon
- Smooth slide-in animation on load

Header (top, 56px, glass):
- Hamburger menu (mobile)
- Brand logo + title
- Search bar (⌘K to focus)
- Notification bell
- System status indicator (green/red/yellow dot)
- WebSocket connection status

Main content:
- Top: Hero stats row (CPU, RAM, Disk, Network, Agents, Uptime)
- Below: Tabbed panels OR scrollable sections
- Each panel: rounded card, subtle shadow, generous padding
- Empty states: centered icon + helpful text + action button

Key UX improvements:
- Sidebar navigation (always visible on desktop, hamburger on mobile)
- Tab header for panel groups (System, Services, Media, Downloads)
- Sticky section headers while scrolling
- Command palette (⌘K) with fuzzy search across all functions
- Toast notifications (bottom-right, auto-dismiss)
- Skeleton loading states (shimmer animation)
- Smooth page transitions
- Mobile-responsive (sidebar collapses < 768px)

════════════════════════════════════════════════════════════════════════
PHASE 3 — Bot Management Page (Grokbot-style)
════════════════════════════════════════════════════════════════════════

New page: "Bots" section in nav, full Grokbot-inspired interface.

Features:
- Grid of bot cards showing: avatar, name, status (online/thinking/idle), model, current task
- Click a bot card → expands to chat interface (right panel or modal)
- Each bot card has:
  * Status dot (green/thinking animation/gray)
  * Bot name + role description
  * Current model + provider
  * Last activity timestamp
  * Quick actions (send message, view history, configure)
- Chat interface:
  * Message bubbles (cyan for bot, amber for user)
  * Input bar with send button
  * Quick prompt suggestions
  * Streaming output display
  * Token counter

Backend:
- GET /api/bots — list all configured bots
- POST /api/bots/{id}/message — send message to specific bot
- GET /api/bots/{id}/history — conversation history
- WebSocket: ws://host:8089/ws/bots/{id} — live streaming

Connect to OpenClaw agents:
- Read profiles from ~/.hermes/profiles/ or config
- Show each profile as a bot card
- Send messages via Hermes API/gateway
- Display responses in real-time

If no agents configured:
- Show "Add your first bot" empty state
- Link to documentation
- Demo bot for testing UI

════════════════════════════════════════════════════════════════════════
PHASE 4 — OpenCode Workflow
════════════════════════════════════════════════════════════════════════

Use OpenCode (via the opencode skill) for all code changes.

Pattern:
1. You (Hermes) write a focused TASK.md (< 2KB, specific, references research)
2. OpenCode executes in ~/oc-work/dashboard-docker/
3. You review the diff: cat files, node --check, python3 -m py_compile
4. You verify in browser: chromium screenshot at 1920x1088 + 375x812
5. Approve or reject with specific feedback
6. Copy approved files to ~/autognosia-clean/dashboard/
7. Restart server, verify live

OpenCode config:
- Use --model openrouter/meituan/longcat-2.0:free
- Max 30KB context per task
- Workdir: ~/oc-work/dashboard-docker/
- After 2 failed OpenCode attempts, you patch directly

════════════════════════════════════════════════════════════════════════
PHASE 5 — Testing & Verification
════════════════════════════════════════════════════════════════════════

Before marking complete:
1. docker compose up builds without errors
2. Dashboard loads at http://localhost:8088
3. All panels render with real or demo data
4. WebSocket connects (● LIVE indicator)
5. Bot page shows agents or empty state
6. Mobile responsive (375px width)
7. No JS errors in console
8. CSS validates (no missing variables)
9. PII audit: no IPs, paths, hostnames in code
10. git push to main with descriptive commits

════════════════════════════════════════════════════════════════════════
PHASE 6 — GitHub Polish
════════════════════════════════════════════════════════════════════════

Create in repo root:
- README.md: What it is, screenshot, quick start (docker compose up), config reference
- LICENSE: MIT or Apache 2.0
- .github/workflows/docker.yml: Build + push to GHCR on release
- .dockerignore
- .env.example
- config/services.example.yaml

════════════════════════════════════════════════════════════════════════
CONSTRAINTS
════════════════════════════════════════════════════════════════════════

- OpenCode NEVER touches live files. Always works in ~/oc-work/dashboard-docker/
- You NEVER write code — you judge OpenCode output
- All changes go through feature branch, never main directly
- Commit messages follow conventional commits (feat:, fix:, refactor:)
- Each commit is small and reviewable
- PII scrub before any push (no IPs, paths, tokens, real names)
- Test at desktop (1920x1080) AND mobile (375x812) widths
- Respect prefers-reduced-motion
- WCAG 2.1 AA compliance (contrast, focus states, semantic HTML)
- All API endpoints get proper error handling (no unhandled 500s)

════════════════════════════════════════════════════════════════════════
YOUR FIRST ACTION
════════════════════════════════════════════════════════════════════════

1. Create ~/oc-work/dashboard-docker/ and copy dashboard/ into it
2. Create TASK.md for Phase 1 (Dockerfile + docker-compose.yml)
3. Launch OpenCode for Phase 1
4. Review output
5. Continue to Phase 2 (UI redesign)
6. Loop until all phases complete

Remember: "Working" = verified in browser via screenshot, not "process running."
