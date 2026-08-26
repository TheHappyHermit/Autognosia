# DeerFlow v1.x → v2.0 Migration Notes

## Version Gap
- Local was at commit `6572fa5` (PR #1947, ~April 2026)
- Latest is `a181c339` (PR #4838, v2.0.0-rc1)
- ~2900 commits behind (4 months)

## Architecture Changes

| Feature | v1.x | v2.0 |
|---|---|---|
| LangGraph | Separate container | Integrated into gateway |
| Stream bridge | In-memory queue | Redis (cross-worker SSE) |
| Docker socket | Auto-mounted | Opt-in via overlay |
| CLI auth dirs | Auto-mounted | Opt-in via overlay |
| Health checks | None | Gateway health check required |
| Auth | None | `DEER_FLOW_INTERNAL_AUTH_TOKEN` + JWT session cookies |
| Config version | 4 | 34 |
| Persistence | In-memory JSON | SQLite (`deerflow.db`) |
| Compose location | Root `docker-compose.yml` | `docker/docker-compose.yaml` |

## Key Migration Steps

### 1. .env Scoping Fix
Compose file moved to `docker/` subdirectory — Docker Compose looks for `.env` relative to compose file location, not project root. Must copy `.env` to `docker/.env` or use `--env-file`.

### 2. Volume Mount Paths
New compose uses `${DEER_FLOW_CONFIG_PATH}`, `${DEER_FLOW_EXTENSIONS_CONFIG_PATH}`, `${DEER_FLOW_HOME}` for volume mounts — these MUST be absolute paths in `.env`, otherwise "empty section between colons" error.

### 3. Config Schema (v4 → v34)
Major changes:
- `models[].google_api_key` → still works, but new `timeout` field renamed to `request_timeout`
- `sandbox.allow_host_bash` added (default: false, must set true for local bash)
- `memory` section completely restructured — now has `manager_class`, `backend_config`, `mode`
- New sections: `skill_scan`, `title`, `summarization`, `max_recursion_limit`
- `tools` section largely compatible but some providers renamed

### 4. New Required Env Vars
```
DEER_FLOW_INTERNAL_AUTH_TOKEN=<generated-token>
BETTER_AUTH_SECRET=<existing-secret>
DEER_FLOW_CONFIG_PATH=<absolute-path>
DEER_FLOW_EXTENSIONS_CONFIG_PATH=<absolute-path>
DEER_FLOW_HOME=<absolute-path>
```

### 5. Divergent Git History Fix
Local repo was cloned from fork (`<email>/deerflow-config`) with unrelated history. `git pull` refused. Fix: orphan branch + hard reset to origin/main.

```bash
git branch -D main
git checkout --orphan temp-main
git rm -rf .
git commit --allow-empty -m "temp"
git checkout main --force
git reset --hard origin/main
```

### 6. Provisioner Container
New in v2.0 — Kubernetes sandbox provisioner. Restarts continuously if no `~/.kube/config` exists. This is expected and harmless for local-only deployments. Can be disabled by commenting out in compose file.

### 7. First-Boot Admin Account Setup

The `/api/v1/auth/initialize` endpoint creates the first admin account. Only callable when no admin exists (returns 409 if one does).

```bash
# Create first admin (email must be a valid EmailStr — .local TLD is rejected)
curl -X POST http://127.0.0.1:2026/api/v1/auth/initialize \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "YourPassword", "remember_me": true}'
```

**Auth API routes live at `/api/v1/auth/*`** (not `/api/*`). Non-auth routes (`/api/agents`, `/api/models`, `/api/threads`, etc.) are at `/api/*`.

**If you need to fix the admin email after creation:** The `change-password` API requires CSRF tokens that are hard to pass via curl. Instead, edit the SQLite database directly inside the gateway container:

```bash
docker exec deer-flow-gateway python3 -c "
import sqlite3
conn = sqlite3.connect('/app/backend/.deer-flow/data/deerflow.db')
cur = conn.cursor()
cur.execute(\"UPDATE users SET email = 'correct@email.com' WHERE email = 'wrong@email.com'\")
conn.commit()
cur.execute('SELECT id, email, system_role FROM users')
print(cur.fetchall())
conn.close()
"
```

**Login via API:**
```bash
# Login (sets session cookie in cookies file)
curl -c /tmp/cookies.txt -X POST "http://127.0.0.1:2026/api/v1/auth/login/local" \
  -d "username=user@example.com&password=YourPassword"

# Verify session
curl -b /tmp/cookies.txt "http://127.0.0.1:2026/api/v1/auth/me"
```
