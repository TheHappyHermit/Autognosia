# Phase 3: Bot Management Page (Grokbot-style)

## Goal
Add a full Grokbot-inspired bot management interface to the dashboard.

## Context
- Working directory: `~/oc-work/dashboard-docker/`
- New page: "Bots" section in sidebar nav
- Shows configured agents as cards with status indicators
- Click a bot → expands to chat interface

## Tasks

### 1. Backend: Bot API Endpoints (`dashboard_server.py`)

Add these endpoints:

**`GET /api/bots`** — List all configured bots:
```json
{
  "bots": [
    {
      "id": "default",
      "name": "Hermes",
      "role": "Executive assistant and AI copilot",
      "model": "qwen3.8-27b",
      "provider": "Nous Research",
      "status": "online",
      "current_task": null,
      "last_activity": "2026-08-29T07:00:00Z",
      "avatar": "🤖"
    }
  ]
}
```

- Read profiles from `~/.hermes/profiles/` or use mock data if unavailable
- If no profiles found, show one demo bot
- Status: online/idle/thinking based on process detection

**`POST /api/bots/{id}/message`** — Send message to a bot:
- Accept `{"message": "..."}` body
- Return `{"reply": "...", "timestamp": "..."}`
- For now, echo back with a simple response (full integration deferred)

**`GET /api/bots/{id}/history`** — Get conversation history:
- Return `{"messages": [...]}`
- Empty array for now (or mock 2-3 messages)

**WebSocket: `ws://host:8089/ws/bots/{id}`** — Live streaming:
- Echo messages back with typing indicator
- Broadcast `{"type": "typing", "bot_id": "..."}` events

### 2. Frontend: Bot Page CSS (`bots.css`)

Create `bots.css` with:
- Bot card grid (responsive, auto-fit columns)
- Each card: avatar circle, name, role, status dot, model badge, last activity
- Status dot colors: green (online), amber (thinking), gray (idle)
- Thinking animation: pulsing dot
- Cards have hover lift effect
- Modal/drawer for chat interface
- Message bubbles: cyan for bot, amber for user
- Input bar at bottom of chat
- Token counter badge
- Quick prompt suggestion chips
- "Add your first bot" empty state

### 3. Frontend: Bot Page JS (`app-bots.js`)

Create `app-bots.js` with:
- `BotsPage` class with render methods
- `renderBotGrid()` — fetch /api/bots, render cards
- `openChat(botId)` — open modal/drawer with chat interface
- `sendMessage()` — POST to /api/bots/{id}/message, render response
- `connectWebSocket(botId)` — connect to ws:// for streaming
- Handle typing indicators
- Handle quick prompt chips

### 4. Frontend: Update `index.html`

Add to sidebar nav:
```html
<a href="#" class="sidebar-link" data-view="bots" aria-label="Bots" title="Bots">🤖</a>
```

Add main content section (hidden by default):
```html
<section id="view-bots" class="view-section" hidden>
  <!-- Bot grid container -->
</section>
```

### 5. Frontend: Update `app.js`

Add:
- View routing: show/hide sections based on `data-view`
- Bots page initialization
- Sidebar link click handlers
- Toast notifications for bot events

## Constraints
- NEVER touch live files
- Feature branch: `feature/bot-management`
- Conventional commits
- PII scrub before push
- Mobile responsive
- prefers-reduced-motion
- WCAG 2.1 AA

## Verification
1. Dashboard loads, Bots nav item visible
2. Click Bots → shows bot cards or empty state
3. Bot cards show avatar, name, role, status dot, model badge
4. Click bot → opens chat interface
5. Send message → response appears in bubble
6. WebSocket connects for streaming
7. Mobile responsive
