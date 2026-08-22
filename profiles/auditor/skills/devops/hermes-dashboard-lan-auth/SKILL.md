---
name: hermes-dashboard-lan-auth
description: Expose and troubleshoot the Hermes Agent web dashboard (`hermes dashboard`) on a LAN (0.0.0.0) under the June 2026+ auth gate — basic-auth setup, the login-form (not HTTP-Basic) verification, and the password-hash shell-escaping pitfall that silently breaks logins.
category: devops
---

# Hermes Dashboard — LAN Auth & Login Fixes

Class-level companion to `find-hermes-gui-info` (that skill is manually
maintained and may lag; this captures the June 2026+ behaviors).

## The June 2026 auth gate (root cause of most "dashboard down" tickets)
Newer Hermes REFUSES to bind a non-loopback host (0.0.0.0) unless an auth
provider is registered. `--insecure` is now a documented NO-OP. Symptom:
`hermes-dashboard.service` crash-loops (`activating auto-restart`,
restart counter climbs fast) with
`Refusing to bind dashboard to 0.0.0.0 — the auth gate engages on non-loopback binds, but no auth providers are registered.`

### Fix (bind 0.0.0.0)
1. Set creds via the CLI — direct edits to `${HOME}/.hermes/config.yaml` are BLOCKED
   by a safety guard, so never `write_file`/`patch` it:
   ```bash
   cd ${HOME}/.hermes/hermes-agent
   venv/bin/python -m hermes_cli.main config set dashboard.basic_auth.username josh434
   venv/bin/python -m hermes_cli.main config set dashboard.basic_auth.password_hash "<scrypt-hash>"
   venv/bin/python -m hermes_cli.main plugins enable basic   # REQUIRED; not on by default
   ```
2. Drop `--insecure` from the systemd service (no-op now).
3. `systemctl --user daemon-reload && systemctl --user restart hermes-dashboard.service`

## CRITICAL pitfall: password-hash shell-escaping breaks login silently
Hashing a password with a shell metacharacter (esp. `$`) by interpolating it
into `python -c "hash_password('...')"` corrupts the value. `pw='J1234osh\$'`
in single quotes keeps the literal backslash → hash is for `J1234osh\$`, NOT
`J1234osh$` → login fails with NO error. ALWAYS pass via env var:
```bash
PW='J1234osh$' venv/bin/python -c "from plugins.dashboard_auth.basic import hash_password, os; print(hash_password(os.environ['PW']))"
```
Then verify the stored hash matches BEFORE declaring done (see `references/dashboard-password-hashing.md`).

## Verification (auth is a LOGIN FORM, not HTTP Basic)
- Do NOT use `curl -u user:pass` — the basic provider ignores the `Authorization`
  header, so `curl -u` returns 302/401 for correct AND wrong passwords (misleading).
- `GET /api/auth/providers` → `{"providers":[{"name":"basic",...}]}`
- `GET /api/auth/me` (no session) → `401` (gate live)
- Real test: GET `/auth/login` (CSRF cookie) then POST JSON to
  `/auth/password-login` `{"provider":"basic","username":..,"password":..,"next":""}`
  → expect `200 {"ok":true}` + `hermes_session_*` cookies; wrong pw → `401`.
- On a 0.0.0.0 bind the server accepts ANY Host header (proxy/Traefik-safe).

## See also
- `find-hermes-gui-info` (port map, systemd template, dashboard flags)
- `references/dashboard-password-hashing.md` (safe hash command + verify snippet)
