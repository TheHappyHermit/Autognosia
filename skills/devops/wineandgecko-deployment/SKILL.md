---
name: wineandgecko-deployment
description: Full-stack WealthForge AI deployment on wineandgecko.com Oracle server
category: devops
---
# WineAndGecko / WealthForge AI Deployment

Full-stack deployment of WealthForge AI to wineandgecko.com Oracle Cloud server.

## Server
- Oracle Cloud ARM64 (aarch64), Ubuntu 24.04
- SSH user: `ubuntu` (NOT `<username>`)
- SSH key: existing oracle_cloud_key in ~/.ssh/
- Docker CE + Compose plugin installed
- Nginx as system service (not Dockerized)

## URL Structure
```
/                    → Wine & Gecko fun page (has "Enter the Vault" button linking to /dashboard/)
/dashboard/          → Login portal (advisor sign-in form, NO Basic Auth)
/app/                → WealthForge React SPA (full financial planning suite)
/api/                → FastAPI backend (proxied via Nginx)
/docs                → Swagger API documentation
```

## Dashboard Login Flow
1. Wine & Gecko page has button linking to `/dashboard/` (NOT alert popup)
2. `/dashboard/` shows professional login portal (NO HTTP Basic Auth)
3. Login form calls `/api/auth/login`, stores token in localStorage
4. Redirects to `/app/` (React SPA) after successful login
5. React SPA reads token from localStorage on load via `restoreSession()`

**Important**: The dashboard login stores token as `wf_token`/`wf_user`, while the React authStore uses `token`/`user`. The authStore's `restoreSession()` must check both keys for compatibility:
```javascript
const token = localStorage.getItem('token') || localStorage.getItem('wf_token')
```

**Nginx**: Remove `auth_basic` directives from `/dashboard/` location block. The login portal handles its own auth.

## Docker Services (in /opt/wealthforge-ai/)
```
wf-api           → FastAPI backend
wf-postgres      → PostgreSQL 16 + TimescaleDB
wf-redis         → Redis Stack
wf-qdrant        → Vector database
wf-meilisearch   → Full-text search
wf-minio         → S3 object storage
```

## Nginx Configuration
Config at `/etc/nginx/sites-enabled/wineandgecko` on server.
Local copy: `~/wealthforge-ai/nginx-wineandgecko.conf`

Key routing:
- `/` → `/var/www/wineandgecko/` (static front page)
- `/dashboard/` → `/var/www/wineandgecko/dashboard/` (basic auth)
- `/app/` → `/var/www/wealthforge-ai/frontend/` (React SPA)
- `/api/*` → proxy to FastAPI on port 8000

## Frontend Deploy Pattern
```bash
cd ~/wealthforge-ai/frontend
npm run build
# rsync dist/ to server /tmp/wf-frontend/
# On server: copy to /var/www/wealthforge-ai/frontend/
```

## Nightly Cron
- Job f5c859e2b0da runs 4:00 AM daily
- Script: ~/.hermes/scripts/wineandgecko-deploy.sh
- Only updates static dashboard files, not the full app

## Troubleshooting Deployment Issues
When the deployment script outputs "DEPLOY_WARNING" instead of "DEPLOY_SUCCESS":

1. Check the verification output:
   - Front page status should be 200
   - Dashboard status should be 200 (when authenticated)  
   - Auth check should be 401 (unauthorized access without credentials)

2. Common issue: Incorrect syntax in AUTH_BLOCKED variable assignment
   - Look for line like: `AUTH_BLOCKED=*** -s -o /dev/null -w "%{http_code}" http://.../dashboard/)`
   - Should be: `AUTH_BLOCKED=$(curl -s -o /dev/null -w "%{http_code}" http://.../dashboard/)`
   - The asterisks (***) should be replaced with `$(curl` and the trailing parenthesis removed

3. To fix:
   ```bash
   # Replace the entire problematic line
   sed -i '54s/.*/AUTH_BLOCKED=$(curl -s -o \\/dev\\/null -w "%{http_code}" http:\\/\\/161.153.112.27\\/dashboard\\/)/' ~/.hermes/scripts/wineandgecko-deploy.sh
   ```
   Or replace the entire script with a corrected version if multiple issues exist.

4. After fixing, re-run the deployment script to verify it now outputs "DEPLOY_SUCCESS".

## Nginx Configuration Issues

If the dashboard returns 200 for both authenticated and unauthenticated requests (indicating auth_basic is not being enforced), check that the nginx site configuration is enabled:

```bash
ls -la /etc/nginx/sites-enabled/
```

If you do not see a symlink for `wineandgecko`, create it:

```bash
sudo ln -s /etc/nginx/sites-available/wineandgecko /etc/nginx/sites-enabled/wineandgecko
sudo nginx -t && sudo systemctl reload nginx
```

Then re-run the deployment verification.

## GitHub
- Repo: https://github.com/<email>/wealthforge-ai (private)

## ARM64 Docker Pitfalls (CRITICAL)
- **No pinned versions** — Use `>=` not `==` for PyJWT, qdrant-client, scipy. ARM64 wheels may not exist for exact versions.
- **qdrant-client 2.7+ has no ARM64 wheel** — Removed from core requirements. Install separately if needed.
- **Docker builds are slow on ARM64** — numpy/scipy/pandas compile from source (~2-5 min per build). Use `--no-cache` sparingly.
- **apt lock conflicts** — Oracle's unattended-upgrades holds the lock. Kill PID from `/var/lib/apt/lists/lock` or wait.
- **SSH user is `ubuntu`** — NOT `<username>`. The user `<username>` does not exist on this server.
- **SSH key** — Use existing oracle_cloud_key. User-provided keys may be truncated.

## SQLAlchemy 2.0 Gotchas (CRITICAL)
```python
# WRONG — raises ArgumentError in SQLAlchemy 2.0+
result = db.execute("SELECT * FROM table WHERE id = :id", {"id": id})

# CORRECT — wrap in text()
from sqlalchemy import text
result = db.execute(text("SELECT * FROM table WHERE id = :id"), {"id": id})
```

## Async vs Sync Engine Mismatch (CRITICAL)
The project uses `asyncpg` in DATABASE_URL but FastAPI routes run synchronously.
```python
# WRONG — MissingGreenlet error
DATABASE_URL = "postgresql+asyncpg://..."
engine = create_engine(DATABASE_URL)

# CORRECT — use sync URL for FastAPI
DATABASE_URL = os.getenv("DATABASE_URL_SYNC", "...").replace("postgresql+asyncpg://", "postgresql://")
engine = create_engine(DATABASE_URL)  # uses psycopg2
```
Docker-compose must provide both:
```yaml
DATABASE_URL: postgresql+asyncpg://...      # for async operations
DATABASE_URL_SYNC: postgresql://...          # for sync FastAPI routes
```

## bcrypt/passlib Incompatibility (CRITICAL)
passlib's bcrypt wrapper fails with bcrypt 4.1+. Use bcrypt directly:
```python
# WRONG — ValueError with bcrypt >=4.1
from passlib.hash import bcrypt
hashed = bcrypt.hash(password)
bcrypt.verify(password, hashed)

# CORRECT — use bcrypt directly
import bcrypt
hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
bcrypt.checkpw(password.encode(), hashed.encode())
```

## PostgreSQL Init Script Won't Re-run
Docker PostgreSQL only runs init scripts on FIRST start. Adding tables to `init.sql` later won't apply.
```bash
# Fix: exec into postgres container and run SQL manually
docker exec wf-postgres psql -U wfadmin -d wealthforge -c "CREATE TABLE IF NOT EXISTS ..."
```

## Seed Script
```bash
docker exec wf-api python -m app.seed
```
Creates: admin@wealthforge.ai (Admin123!@#), demo@wealthforge.ai (Demo123!@#), 5 clients, 3 portfolios, 16 securities.

## Deploy Pattern
```bash
# 1. Build frontend LOCALLY (no npm on server)
cd ~/wealthforge-ai/frontend
npm install && npm run build

# 2. Upload built frontend via /tmp (permission workaround)
scp -i SSH_KEY -r dist/ user@server:/tmp/frontend_dist
ssh -i SSH_KEY user@server 'sudo cp -r /tmp/frontend_dist/* /var/www/wealthforge-ai/frontend/ && sudo chown -R www-data:www-data /var/www/wealthforge-ai/frontend/'

# 3. Sync backend code
scp -i SSH_KEY backend/app/api/crm_routes.py user@server:/opt/wealthforge-ai/backend/app/api/

# 4. Restart API (Docker auto-reloads with watchfiles)
ssh -i SSH_KEY user@server 'docker restart wf-api'
```

## Full Deploy Script Pattern
```bash
#!/bin/bash
# Build locally, upload to server, restart
SERVER="ubuntu@wineandgecko.com"
KEY="$HOME/.ssh/oracle_cloud_key"
SSH="ssh -i $KEY"

cd ~/wealthforge-ai/frontend && npm run build
scp -i $KEY -r dist/ $SERVER:/tmp/frontend_dist
$SSH "sudo cp -r /tmp/frontend_dist/* /var/www/wealthforge-ai/frontend/ && sudo chown -R www-data:www-data /var/www/wealthforge-ai/frontend/"
rsync -avz -e "ssh -i $KEY" --exclude='.git' --exclude='node_modules' ~/wealthforge-ai/backend/ $SERVER:/opt/wealthforge-ai/backend/
$SSH "docker restart wf-api && sleep 5 && curl -s http://localhost/health"
```

## Vite + React Router Subpath Deployment (CRITICAL)
When deploying a Vite React app under a subpath like `/app/`, you need **BOTH** settings.
Missing either one causes a blank white page — HTML loads, JS loads, but nothing renders.

```javascript
// vite.config.js — affects ASSET PATHS in built HTML
export default defineConfig({
  base: '/app/',  // ← Without this: HTML refs /assets/ instead of /app/assets/
  plugins: [react()],
  // ...
})
```

```jsx
// App.jsx — affects ROUTE MATCHING
<Router basename="/app">  // ← Without this: routes don't match under /app/
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/portfolios" element={<Portfolios />} />
  </Routes>
</Router>
```

**Symptom of missing `base`**: Browser console shows 404 for `/assets/index-xxx.js`.
**Symptom of missing `basename`**: Blank page, no errors, routes just don't match.
**Both missing**: Blank page, 404s in console.

After fixing, rebuild and redeploy the `dist/` folder. Hard refresh browser (Ctrl+Shift+R).

## Nginx SPA Routing (CRITICAL)
React sub-routes (e.g., `/app/portfolios`) must fall back to `index.html`:
```nginx
location /app {
    alias /var/www/wealthforge-ai/frontend;
    index index.html;
    try_files $uri $uri/ /app/index.html;
}
```

## SQLAlchemy order_by Before offset/limit (CRITICAL)
`.order_by()` MUST come before `.offset()` and `.limit()` in SQLAlchemy queries:
```python
# WRONG — InvalidRequestError
query.offset(skip).limit(limit).order_by(Client.full_name).all()

# CORRECT
query.order_by(Client.full_name).offset(skip).limit(limit).all()
```

## DB Schema vs ORM Model Mismatch (CRITICAL)
If the actual database tables were created by `init.sql` but SQLAlchemy models define different columns, you get `UndefinedColumn` errors on every query. The models MUST match the actual DB schema.

**Diagnosis**: Compare `\d tablename` in psql with the model's Column definitions.
**Fix**: Rewrite the model to match the actual DB, not the other way around (preserves existing data).

```bash
# Check actual schema
docker exec wf-postgres psql -U wfadmin -d wealthforge -c "\d clients"
```

## Project Structure
Consolidated at ~/wealthforge-ai/
- backend/ — FastAPI + wealthforge_core + tests
- frontend/ — React SPA (Vite + Tailwind)
- landing/ — Static marketing page
- docker-compose.yml — All services
- nginx-wineandgecko.conf — Production Nginx

## Deployed Services
- FastAPI backend with auth, portfolios, CRM, security master, analytics, compliance, billing routes (70+ endpoints)
- RBAC middleware (5 roles: advisor/principal/compliance/admin/readonly)
- Audit logging middleware (every request to agent_events table)
- Compliance rule engine (suitability, concentration, AML, Reg BI, wash sale)
- Billing engine (tiered AUM fee calculator)
- Agent infrastructure (base_agent, llm_client, orchestrator for 24 micro-agents)
- PostgreSQL 47 tables (33 original + 12 new + 2 TimescaleDB hypertables)
- Mistral AI integration with JSON mode (mistralai>=1.0.0,<2.0.0)
- React frontend with 17 pages, modern dark navy design system

## Login Credentials
- Username: `admin` (NOT an email — just the string "admin")
- Password: `evenskykatz$`
- NO credentials displayed on the login portal — user considers this a security issue
- Auth stores token as both `token` and `wf_token` in localStorage for compatibility

## Tax-Sensitive Rebalancing Engine
Built at `backend/app/services/engine/rebalancer.py`. Features:
- HIFO lot selection (minimize capital gains)
- Wash sale detection (30-day window)
- Band-based rebalancing (per-security configurable bands)
- Account-type awareness (taxable/tax-deferred/tax-free)
- Tax drag estimation in basis points
- Turnover constraints
- Full lifecycle: propose → approve → execute

## Demo Client
Margaret Chen pre-loaded with 4 accounts, 20 positions, 12 allocation targets, 10 tasks.
Created via `backend/app/demo_client.py`.

## User Expectations
User expects EVERYTHING delivered fully built and working - no TODOs, no placeholders, no "still needed". Comprehensive end-to-end testing of every link and workflow before declaring done. README should describe how things are set up, not what needs to be set up.

## Master Handoff Document
STATUS.md at the repo root is the authoritative status document. Contains:
- Complete list of what is built vs what is missing (organized by phase)
- Full todo list for remaining work
- Architecture diagrams and data flow explanations
- Database schema reference (all 47 tables)
- API route reference (all 70+ endpoints)
- Frontend page map (17 pages with routes)
- Agent system architecture (24 agents mapped to groups A-K)
- Deployment patterns (SSH, Docker, frontend build)
- Engineering spec section references (1890-line spec at ~/.hermes/website_instructions on server)
