# Traefik Routing Diagnostics for FreshRSS

When FreshRSS API returns 404 errors, use these steps to verify Traefik is routing the `freshrss.<oracle-server>` subdomain correctly.

## Diagnostic Commands

1. Test HTTP root routing (should return 200, not 404):
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -H "Host: freshrss.<oracle-server>" http://<traefik-ip>:80/
   ```

2. Test FreshRSS install page (should return 200 if Traefik is routing):
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -H "Host: freshrss.<oracle-server>" http://<traefik-ip>:80/install.php
   ```

3. Test API endpoint directly (should return non-404 if routing works):
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -H "Host: freshrss.<oracle-server>" http://<traefik-ip>:80/api/greader.php/accounts/ClientLogin
   ```

4. Test both old and new FreshRSS server IPs, as IPs may change during migrations (e.g., 10.1.1.10 → 161.153.112.27).

## Interpreting Results
- **200 on root/install.php, 404 on API**: FreshRSS container may not be running, or API path is misconfigured
- **404 on all paths**: Traefik has no Host rule for `freshrss.<oracle-server>` – check Traefik Docker labels or dynamic config
- **301 redirects**: Server is forcing HTTPS – test HTTPS endpoints with `-k` flag for self-signed certs
