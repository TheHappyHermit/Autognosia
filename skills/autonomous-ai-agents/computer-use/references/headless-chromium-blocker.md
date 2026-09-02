# Stale Headless Chromium Blocking Visible Browser Launches

## Problem

On a Linux VM where you need a visible Chromium/Brave browser to verify a web
dashboard, launching fails silently or crashes because:

- A previous browser-use or playwright session left a Chromium running in headless
  mode (`--ozone-platform=headless`) on a stale port (e.g. 35123)
- Port 9222 (the common DevTools port) is already bound by an old process
- GPU acceleration crashes on the headless X server (`--disable-gpu-compositing`
  alone is insufficient)

## Diagnosis

```bash
# Check for stale Chromium processes
ps aux | grep chromium | grep -v grep
ps aux | grep chrome-headless | grep -v grep

# Check which ports are bound
ss -tlnp | grep -E '9222|9223|35123'

# Check X display
echo $DISPLAY
xdpyinfo 2>&1 | head -5
```

Symptoms in process output:
- `--ozone-platform=headless` → running headless, no visible window
- `ERROR:ui/gl/init/gl_factory.cc` / `Requested GL implementation not found` →
  GPU not available on the headless display
- `Exiting GPU process due to errors during initialization` → browser will crash

## Fix

```bash
# 1. Kill all stale Chromium processes
pkill -f chromium-browser
pkill -f chrome-headless

# Wait for ports to free
sleep 2

# 2. Launch visible Chromium with correct flags
chromium-browser \
  --no-first-run \
  --no-default-browser-check \
  --no-sandbox \
  --disable-dev-shm-usage \
  --remote-debugging-port=9223 \
  --remote-debugging-address=127.0.0.1 \
  --disable-gpu \
  --start-maximized \
  --user-data-dir=/tmp/chromium-fresh \
  http://<AGENT_SERVER_IP>:8088/
```

Key flags:
- `--disable-gpu` (NOT just `--disable-gpu-compositing`) — required when no GPU
  is available on the X display
- `--user-data-dir=/tmp/...` — fresh profile avoids conflicts with stale sessions
- `--remote-debugging-port=9223` — avoid port 9222 which may be held by old
- `--start-maximized` — ensure visible window

## Why This Happens

browser-use and playwright both launch Chromium instances that stay alive between
sessions. When the Hermes session ends, these processes are not cleaned up. A
subsequent session trying to launch a *visible* browser collides with the stale
headless process.

## Prevention

- Always kill stale Chromium processes before launching a visible one on a VM
- Use `--user-data-dir=/tmp/<unique>` for disposable profiles
- Monitor `ss -tlnp` for unexpected Chrome/Chromium listeners
- Check for `--ozone-platform=headless` in `ps aux` output before launching
