# Autognosia Command Deck

A beautiful, production-ready homelab dashboard with real-time monitoring, task management, and AI agent control.

![Dashboard Preview](screenshot.png)

## Features

- **Real-time System Metrics** — CPU, RAM, Disk, Network, Agents, Uptime
- **Task Management** — Create, track, and manage tasks with priorities
- **Calendar & Scheduling** — Day/week/month views with event filtering
- **Email Triage** — Monitor and manage incoming emails
- **Prospective Intentions** — IF/THEN rules for automated reminders
- **Knowledge Vault** — Search across Active Wiki and Oracle Brain
- **Bot Management** — Grokbot-style interface for AI agents
- **Service Monitoring** — Track Jellyfin, Plex, Sonarr, Radarr, and more
- **Dark Mode** — Automatic via `prefers-color-scheme`
- **Mobile Responsive** — Sidebar collapses, touch-friendly
- **Accessibility** — WCAG 2.1 AA compliant, keyboard navigable

## Quick Start

```bash
git clone https://github.com/TheHappyHermit/autognosia.git
cd autognosia
docker compose up -d
```

Open http://localhost:8088 in your browser.

## Configuration

Copy `config/services.example.yaml` to `config/services.yaml` and customize for your homelab:

```bash
cp config/services.example.yaml config/services.yaml
```

Environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTOGNOSIA_HOME` | `/data` | Data directory |
| `DASHBOARD_PORT` | `8088` | Dashboard HTTP port |
| `WS_PORT` | `8089` | WebSocket port |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker socket path |
| `CONFIG_PATH` | `/config/services.yaml` | Service config file |

## Demo Mode

The dashboard works out of the box with sample data. No configuration required — just run `docker compose up` and see the full UI with mock tasks, projects, and services.

## Architecture

```
┌────────┬─────────────────────────────────────────┐
│  Nav   │  Header (search, status, notifications) │
│  Bar   ├─────────────────────────────────────────┤
│  64px  │  Hero Stats (CPU/RAM/Disk/Net/Agents)  │
│        ├─────────────────────────────────────────┤
│  🏠    │  Panels Grid                            │
│  📊    │  Calendar | Tasks | Telemetry           │
│  🤖    │  Email | Intentions | Knowledge         │
│  🎬    │  Agent Intelligence                     │
│  📥    │  Hermes | Cron | Graphify               │
│  ⚙️    │                                         │
└────────┴─────────────────────────────────────────┘
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Healthcheck |
| GET | `/api/system` | System metrics |
| GET | `/api/overview` | Aggregated stats |
| GET | `/api/briefing` | Daily executive briefing |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/projects` | List projects |
| GET | `/api/calendar` | Calendar events |
| GET | `/api/emails` | Email triage |
| GET | `/api/intentions` | Prospective intentions |
| GET | `/api/reminders` | Reminders |
| GET | `/api/telemetry` | System telemetry |
| GET | `/api/services` | Homelab services |
| GET | `/api/bots` | AI agent bots |
| POST | `/api/bots/{id}/message` | Send message to bot |
| POST | `/api/chat` | Hermes copilot chat |

## Development

```bash
# Build and run locally
docker compose up --build

# Run with custom config
CONFIG_PATH=/path/to/services.yaml docker compose up

# View logs
docker compose logs -f dashboard
```

## License

MIT
