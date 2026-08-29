---
name: systematic-platform-audit
description: Programmatic end-to-end audit of every page, link, API endpoint, and workflow
category: software-development
---

# Systematic Platform Audit

When the user wants to verify "everything works" across a full web application, write a Python audit script that tests every surface area programmatically. Don't manually click through pages — automate it.

## Audit Script Pattern

```python
#!/usr/bin/env python3
"""Complete platform audit — every page, link, API endpoint."""
import requests, json, sys

BASE = "http://your-domain.com"
results = []

def test(name, url, method="GET", auth=None, body=None, expected_status=200, check_contains=None):
    """Test an endpoint and record pass/fail."""
    h = {}
    if auth:
        h["Authorization"] = f"Bearer {auth}"
    if body:
        h["Content-Type"] = "application/json"
    
    r = getattr(requests, method.lower())(url, headers=h, json=body, timeout=10)
    
    # Accept 200 or 201 for POST (creates return 201)
    if method == "POST" and expected_status == 200:
        ok = r.status_code in (200, 201)
    else:
        ok = r.status_code == expected_status
    
    if check_contains and ok:
        ok = check_contains in r.text
    
    results.append((name, ok, f"{r.status_code}"))
    return r
```

## Categories to Audit

1. **Public Pages** — every route that doesn't require auth
2. **Auth Flow** — login, me, refresh, wrong password rejection
3. **SPA Pages** — every React route (check returns HTML with root div)
4. **CRUD Endpoints** — list, create, get, update, delete for each entity
5. **Link Verification** — check that navigation links exist in page HTML
6. **Credential Security** — verify no demo credentials shown on login page
7. **Health Checks** — /health, /live, /ready
8. **AI Integration** — test AI endpoints with real data

## Key Pitfalls

- **201 vs 200**: POST endpoints that create resources return 201, not 200. The test function must accept both.
- **Token type mismatch**: `/auth/refresh` needs a refresh_token, not access_token. Get both from login response.
- **Shell escaping**: Don't put complex Python dict access in f-strings inside SSH heredocs. Write to a file and run it.
- **Duplicate data**: If seed scripts run multiple times, test data may have duplicates. Look up entities by name, not by index.

## Summary Output

Always print:
- Total passed / total checks
- List of every check with PASS/FAIL
- List of failures with detail
- Exit code 1 if any failures

Upload the audit script to the server at `/tmp/` and run it there for server-side testing.
