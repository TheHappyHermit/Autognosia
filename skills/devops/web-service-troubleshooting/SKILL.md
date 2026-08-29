---
name: web-service-troubleshooting
description: Systematic approach to diagnose why a web service is not responding at an expected URL
category: devops
---

## Web Service Availability Diagnosis

When you expect a web service to be available at a specific URL but it's not responding, follow this systematic troubleshooting approach.

### Initial Checks

1. **Direct Access Test**
   ```bash
   curl -I https://expected-service.example.com/api/
   # or
   curl -v https://expected-service.example.com/api/
   ```
   Look for:
   - HTTP status codes (200 = OK, 4xx/5xx = service issue)
   - Connection errors (could not resolve host, connection refused, timeout)

2. **DNS Resolution Check**
   ```bash
   dig expected-service.example.com +short
   nslookup expected-service.example.com
   host expected-service.example.com
   ```
   - If no IP returned: DNS issue (subdomain not configured)
   - If IP returned: proceed to service checks

3. **Ping/Test Connectivity** (if ICMP allowed)
   ```bash
   ping -c 3 expected-service.example.com
   # or
   nc -zv expected-service.example.com 443
   ```

### Service-Specific Diagnosis

If DNS resolves but service doesn't respond:

4. **Check Main Domain**
   Test if the service might be running on the main domain or a different path:
   ```bash
   curl -I https://example.com/
   curl -I https://example.com/service-path/
   curl -I https://example.com/api/
   ```

5. **Check Common Alternative Paths**
   For common services:
   - FreshRSS: `/freshrss/`, `/api/greader.php`
   - Other RSS readers: `/reader/`, `/rss/`
   - APIs: `/api/`, `/v1/`, `/v2/`
   - Admin panels: `/admin/`, `/wp-admin/`, `/phpmyadmin/`

6. **Web Search for References**
   Search for mentions of the service to discover correct URL:
   - Search for the service name + domain
   - Check documentation or setup guides
   - Look for subdomain references in known configurations

7. **Check Service Status** (if you have server access)
   ```bash
   # Check if service is running
   systemctl status servicename
   docker ps | grep servicename
   # Check ports
   netstat -tlnp | grep :port
   ss -tlnp | grep :port
   # Check logs
   journalctl -u servicename
   docker logs containername
   ```

### OpenClaw Gateway-Specific Diagnosis (NEW)

When troubleshooting an OpenClaw gateway that appears running but fails to process requests:

1. **Check Gateway Health Endpoint**
   ```bash
   curl -s -H "Authorization: Bearer <token>" http://localhost:18789/health
   # Expected: {"ok":true,"status":"live"}
   ```

2. **Inspect Gateway Logs for Model Routing Errors**
   ```bash
   journalctl --user -u openclaw-gateway -n 100 --no-pager
   ```
   Look for:
   - `FailoverError: Unknown model: <model-id>` → Provider missing from `models.providers`
   - `model fallback decision: candidate_failed` → Model configured but provider not registered
   - `provider-transport-fetch` with 429/401 → Auth/quota issue, not config issue

3. **Validate Config Against Schema**
   ```bash
   openclaw doctor
   # or
   openclaw config validate
   ```

4. **Verify Model Provider Registration**
   ```bash
   # Check configured providers
   jq '.models.providers | keys' ~/.openclaw/openclaw.json
   # Check referenced models in agents
   jq '.agents.defaults.models | keys' ~/.openclaw/openclaw.json
   jq '.agents.list[].model.primary' ~/.openclaw/openclaw.json
   ```
   Every model referenced in `agents.*.model` MUST have a corresponding entry in `models.providers.<provider>.models[]` with matching `id`.

5. **Test Agent Turn via Gateway Call**
   ```bash
   openclaw gateway call --token <token> --params '{"agent":"main","messages":[{"role":"user","content":"test"}]}' agent.run
   ```

### Verification Steps

Once you get a response:

1. **Expected Locations**
   - Subdomain: `freshrss.example.com`
   - Subdirectory: `example.com/freshrss/`
   - API endpoint: `https://host/freshrss/api/greader.php`
   - Alternative: `example.com/reader/` (if using old Google Reader alias)

2. **Authentication Required**
   FreshRSS API requires authentication even for basic endpoints:
   ```
   curl -H "Authorization: GoogleLogin auth=YOUR_TOKEN" \
        https://freshrss.example.com/api/greader.php/accounts/ClientLogin
   ```

3. **Common Issues**
   - Service not started or crashed
   - Reverse proxy not configured for subdomain
   - Firewall blocking port
   - DNS not pointing to correct server
   - Virtual host misconfiguration

### Verification Steps

Once you get a response:

1. **Check for Expected Content**
   - For FreshRSS: Look for XML/JSON response or login redirect
   - For APIs: Check if response matches expected format
   - For web UIs: Look for service-specific elements in HTML

2. **Test Authentication**
   If service requires auth, test with known credentials:
   ```bash
   # FreshRSS ClientLogin example
   curl -X POST "https://host/api/greader.php/accounts/ClientLogin" \
        -d "Email=username&Passwd=api-password&service=reader"
   ```

3. **Validate Against Documentation**
   Compare response to service's API documentation

### When to Escalate

If all checks fail:
- Verify with service administrator/owner
- Check if service was deprecated or moved
- Look for announcements about service changes
- Consider alternative services if this is for a time-sensitive task

### Prevention for Future

1. **Document Expected URLs** in project documentation
2. **Set up monitoring** for critical services
3. **Create health check endpoints** if you control the service
4. **Use configuration management** to ensure DNS and service consistency