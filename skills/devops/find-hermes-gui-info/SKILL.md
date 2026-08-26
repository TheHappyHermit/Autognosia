---
name: find-hermes-gui-info
description: Systematic approach to locate Hermes Agent web GUI (Open WebUI) address and verify setup
category: devops
version: 1.1
---

# Find Hermes GUI Information

## When to Use This Skill
When you need to locate the web GUI address for Hermes Agent, especially when:
- You're unsure if the GUI is running
- You need to verify the Open WebUI setup
- You're troubleshooting GUI access issues
- You want to confirm the correct port and URL

## Approach
Instead of guessing or assuming, systematically check:
1. Configuration files for GUI-related settings
2. Running services and open ports
3. Common Hermes service endpoints

## Step-by-Step Process

### 1. Check Configuration Files
Examine the Hermes YAML config for GUI/service hints — look for keys like `dashboard`, `port`, `host`.

### 2. Check Running Services
See what's actually running on common Hermes ports:
```bash
for port in 3000 8642 8644 9119 9377; do
  echo -n "Port $port: "
  if ss -tlnp | grep -q ":$port "; then echo "LISTENING"; else echo "not in use"; fi
done
```

### 3. Verify Open WebUI Setup (if applicable)
The standard Hermes GUI setup uses Open WebUI on port 3000:
- API Server: port 8642 (requires API_SERVER_ENABLED=true)
- Open WebUI: port 3000 (connects to API server)

## Hermes Built-in Dashboard (`hermes dashboard`)

Hermes has a built-in web dashboard (separate from Open WebUI) for managing config, API keys, and sessions. It is launched with the `hermes dashboard` subcommand.

### Default (localhost only)
```bash
cd ~/.hermes/hermes-agent && source venv/bin/activate
python -m hermes_cli.main dashboard --no-open
```

### Expose on LAN (0.0.0.0)
Requires the `--insecure` flag — without it, the server refuses to bind to non-localhost:
```bash
python -m hermes_cli.main dashboard --host 0.0.0.0 --port 9119 --no-open --insecure
```
Then access from any device on the LAN at `http://<server-ip>:9119`.

### Dashboard Flags
| Flag | Default | Purpose |
|------|---------|---------|
| `--port` | 9119 | Port to listen on |
| `--host` | 127.0.0.1 | Bind address |
| `--no-open` | off | Don't auto-open browser |
| `--insecure` | off | Required for non-localhost binding |

### Dependencies
Requires `fastapi` and `uvicorn` Python packages (`hermes-agent[web]` extra). The web UI is built into `hermes_cli/web_dist/` (NOT `web/dist/`).

### CRITICAL: June 2026 auth gate (this breaks the old --insecure approach)
Newer Hermes versions REFUSE to bind to a non-loopback host (0.0.0.0) unless an auth provider is registered. `--insecure` is now a documented NO-OP and does NOT bypass it. Symptom: service crash-loops with
`Refusing to bind dashboard to 0.0.0.0 — the auth gate engages on non-loopback binds, but no auth providers are registered.`
Plus restart-counter fires fast (`systemctl --user status` shows `activating auto-restart`).

**Fix (LAN/bind 0.0.0.0):**
1. Set credentials in config.yaml via the CLI (direct edits to config.yaml are BLOCKED by a safety guard):
   ```bash
   cd ~/.hermes/hermes-agent
   python -m hermes_cli.main config set dashboard.basic_auth.username admin
   python -m hermes_cli.main config set dashboard.basic_auth.password_hash "<scrypt-hash>"
   # hash a password:
   python -c "from plugins.dashboard_auth.basic import hash_password; print(hash_password('your-password'))"
   ```
2. Enable the bundled basic auth plugin (it is NOT enabled by default — without this the gate still won't enforce and /api/* returns 401 for everyone):
   ```bash
   python -m hermes_cli.main plugins enable basic
   ```
3. Remove the dead `--insecure` flag from the service file (`--insecure` is a no-op now).
4. Restart: `systemctl --user daemon-reload && systemctl --user restart hermes-dashboard.service`

**Auth model is a LOGIN FORM, NOT HTTP Basic Auth.** Do NOT test with `curl -u user:pass` — the provider ignores the Authorization header. Instead:
- Verify provider is registered: `curl http://127.0.0.1:9119/api/auth/providers` → expect `{"providers":[{"name":"basic",...}]}`
- Verify gate is live: `curl http://127.0.0.1:9119/api/auth/me` → expect `401` (no session)
- Unauthenticated `/` returns `302` (redirect to login) — that is HEALTHY, not broken.

**Host-header validation:** when bound to `0.0.0.0`, the server accepts ANY Host header (accepts `hermes.<oracle-server>` from a reverse proxy/Traefik). Only loopback binds restrict to loopback names. No Host-header rewrites needed in the proxy for a 0.0.0.0 bind.

**Verification**
```bash
ss -tlnp | grep 9119              # confirm listening on 0.0.0.0
curl -s http://127.0.0.1:9119/api/auth/providers   # expect basic provider listed
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9119/api/auth/me  # expect 401 (gate live)
```

## Common GUI Locations
- **Built-in Dashboard**: port 9119 (`hermes dashboard` command)
- **Open WebUI**: port 3000 (if configured separately)
- **API Server**: port 8642 (gateway backend)
- **Browser Backend**: port 9377 (Camofox, if configured)

## Troubleshooting
If GUI isn't accessible:
- Check port conflicts: `ss -tlnp | grep :<port>`
- Verify the process is running: `ps aux | grep dashboard`
- Check if build step completed — startup may take a few seconds
- For LAN access, confirm `--insecure` flag was used (required for non-localhost binding)

## Run as a Systemd Service (persistent across reboots)

If sudo is unavailable, use a **user-level** systemd service. If sudo works, a system-level service is also an option.

### User-level service (no sudo required)

```bash
mkdir -p ~/.config/systemd/user

cat > ~/.config/systemd/user/hermes-dashboard.service << 'EOF'
[Unit]
Description=Hermes Agent Web Dashboard
After=network.target

[Service]
Type=simple
WorkingDirectory=$HOME/.hermes/hermes-agent
ExecStart=$HOME/.hermes/hermes-agent/venv/bin/python -m hermes_cli.main dashboard --host 0.0.0.0 --port 9119 --no-open --insecure
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable hermes-dashboard.service
systemctl --user start hermes-dashboard.service
```

### Enable lingering (required for user services to survive logout)

```bash
loginctl enable-linger $(whoami)
```

Without lingering, user-level services die when the user session ends.

### Management commands

```bash
systemctl --user status hermes-dashboard
systemctl --user restart hermes-dashboard
systemctl --user stop hermes-dashboard
journalctl --user -u hermes-dashboard -f   # follow logs
```

## Key Insights from Experience
- Direct service checks (`ss`, `curl`) are the most reliable way to verify
- `hermes dashboard` defaults to localhost; use `--insecure --host 0.0.0.0` for LAN access
- The `--insecure` flag is mandatory for non-localhost binding (safety gate)
- Build step may take a few seconds before port binds — allow startup time
- `/etc/systemd/system/` requires sudo; use `~/.config/systemd/user/` as fallback
- `loginctl enable-linger` is essential for user services to persist across reboots/logouts
