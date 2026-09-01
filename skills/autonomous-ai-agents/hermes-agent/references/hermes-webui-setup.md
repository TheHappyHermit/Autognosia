# Hermes WebUI Setup Guide

## Overview
Hermes WebUI (`https://github.com/nesquena/hermes-webui`) provides a Claude-style 3-panel dark web interface for the Hermes Agent. It is a lightweight project (no React/webpack, vanilla JS only, 424+ tests) with MIT license.

## Key Features
- Three-panel layout: Sessions (left), Chat (center), Workspace files (right)
- Full CLI parity: model switching, cron management, skills, memory, workspace ops
- SSE streaming with tool cards and syntax highlighting
- Mobile responsive with hamburger sidebar
- No extra dependencies beyond pyyaml

## Setup Steps

### 1. Clone the repo
```bash
cd ~/.hermes && git clone https://github.com/nesquena/hermes-webui.git hermes-webui
```

### 2. Create a .env file (optional)
```bash
cat > ~/.hermes/hermes-webui/.env << 'EOF'
HERMES_WEBUI_HOST=0.0.0.0
HERMES_WEBUI_PORT=8787
HERMES_WEBUI_PASSWORD=your_secure_password_here
EOF
```
- `HERMES_WEBUI_HOST` defaults to `127.0.0.1` — set to `0.0.0.0` for network access
- `HERMES_WEBUI_PORT` defaults to `8787`
- Password is optional but recommended when binding to `0.0.0.0`

### 3. Start the server
```bash
cd ~/.hermes/hermes-webui && bash start.sh
```

Or manually:
```bash
cd ~/.hermes/hermes-webui
HERMES_WEBUI_HOST=0.0.0.0 HERMES_WEBUI_PORT=8787 \
  HERMES_WEBUI_AGENT_DIR=$HOME/.hermes/hermes-agent \
  nohup $(hermes-agent-venv)/bin/python server.py > /tmp/hermes-webui.log 2>&1 &
```

### 4. Verify
```bash
curl http://localhost:8787/health
```

## Auto-start with systemd
Create `/etc/systemd/system/hermes-webui.service`:
```ini
[Unit]
Description=Hermes WebUI
After=network.target

[Service]
Type=simple
User=<USER>
WorkingDirectory=/home/<USER>/.hermes/hermes-webui
Environment=HERMES_WEBUI_HOST=0.0.0.0
Environment=HERMES_WEBUI_PORT=8787
Environment=HERMES_WEBUI_AGENT_DIR=/home/<USER>/.hermes/hermes-agent
ExecStart=/home/<USER>/.hermes/hermes-agent/venv/bin/python server.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable with `sudo systemctl enable --now hermes-webui`.

## Security Considerations
- Auth is OFF by default — set password when exposing beyond localhost
- For production: use behind reverse proxy (nginx/caddy) with TLS
- The code uses only stdlib + pyyaml (minimal attack surface)
- Auth uses PBKDF2-SHA256 with 600k iterations
- Uploads capped at 20MB with filename sanitization and path traversal protection

## Troubleshooting
- Check logs: `tail -f /tmp/hermes-webui-8787.log`
- Agent not found: `export HERMES_WEBUI_AGENT_DIR=/path/to/hermes-agent`
- Port in use: `kill $(lsof -ti tcp:8787)`
- Health endpoint: `curl http://localhost:8787/health`
