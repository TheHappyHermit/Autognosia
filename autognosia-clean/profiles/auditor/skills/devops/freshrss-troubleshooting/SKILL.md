---
name: freshrss-troubleshooting
description: Systematic troubleshooting guide for FreshRSS access issues including DNS, authentication, API endpoints, and newsletter builder problems
category: devops
---

# FreshRSS Troubleshooting Guide

## Common Issues and Solutions

### 1. DNS Resolution Failures
**Symptom**: `Could not resolve host: freshrss.wineandgecko.com` or `Name or service not known`

**Solutions**:
- Verify DNS resolution works on local network: `dig freshrss.wineandgecko.com`
- Add to `/etc/hosts` if missing: `10.1.1.10 freshrss.wineandgecko.com`
- Ensure you're on the local network where the DNS entry exists

### 2. Missing Host Header (404 Errors)
**Symptom**: 404 errors when accessing API endpoints despite service running

**Solutions**:
- ALL requests MUST include `Host: freshrss.wineandgecko.com` header
- Example curl: `curl -vk -H "Host: freshrss.wineandgecko.com" https://10.1.1.10/api/greader.php`
- In code: Add headers dictionary with `"Host": "freshrss.wineandgecko.com"`

### 3. SSL Certificate Issues
**Symptom**: SSL certificate errors, self-signed certificate warnings

**Solutions**:
- Instance uses self-signed certificate (TRAEFIK DEFAULT CERT)
- In code: Set `verify=False` for requests (development only)
- For production: Add the cert to trusted certificate store
- In browsers: Proceed past security warning

### 4. Authentication Failures
**Symptom**: 401/403 errors, "Auth failed" messages

**Solutions**:
- Verify credentials in `.env`: `FRESHRSS_USERNAME` and `FRESHRSS_API_PASSWORD`
- Ensure username is the actual FreshRSS login username (not email)
- Auth tokens last ~2 hours - implement re-authentication on 401/403
- Test auth endpoint directly: 
  ```bash
  curl -k -X POST "https://10.1.1.10/api/greader.php/accounts/ClientLogin" \
    -H "Host: freshrss.wineandgecko.com" \
    -d "Email=josh434&Passwd=J1234osh$&service=reader"
  ```

### 5. Newsletter Builder Corruption
**Symptom**: "File unchanged since last read. The content from the earlier read_file result in this conversation is still current — refer to that instead of re-reading."

**Solutions**:
- The newsletter_builder.py script has been corrupted (likely by a skill view operation)
- Restore from backup or recreate
- Ensure FRESHRSS_URL in newsletter_builder.py does NOT include /api/ (it's added later in code)
- Verify script is executable: `chmod +x ~/.hermes/scripts/newsletter_builder.py`

### 6. Newsletter Builder Connection Issues
**Symptom**: `socket.gaierror: [Errno -2] Name or service not known`

**Solutions**:
- Check that FRESHRSS_URL environment variable is set correctly
- Verify the newsletter builder is reading from the correct .env file
- Test the FRESHRSS_URL directly with curl using the Host header
- Ensure the newsletter venv is properly activated

### 7. API Endpoint Availability
**Symptom**: 501 Not Implemented errors on certain endpoints

**Solutions**:
- Core endpoints that typically work:
  - `/accounts/ClientLogin` (auth)
  - `/reader/api/0/user-info` (user info)
  - `/reader/api/0/stream/contents/*` (fetch articles)
  - `/reader/api/0/edit-tag` (mark read/starred)
- Endpoints that may return 501:
  - `/reader/api/0/subscription/list`
  - `/reader/api/0/unread-count`
  - `/reader/api/0/tag/list`
- These often depend on server plugins/configuration

### 8. Content Extraction Issues
**Symptom**: Articles showing "Full article content could not be retrieved"

**Solutions**:
- This is expected for heavily blocked/paywalled sites
- FreshRSS often stores truncated content - always implement content waterfall
- The newsletter builder includes a 7-stage waterfall:
  1. RSS content/summary
  2. Direct URL fetch + trafilatura
  3. BS4 paragraph extraction
  4. Playwright headless Chromium
  5. Wayback Machine
  6. FlareSolverr (Cloudflare bypass)
  7. Jina Reader (API key required)
  8. Fallback to RSS summary/title

### 9. Cron Job Failures
**Symptom**: Newsletter cron jobs failing silently or producing errors

**Solutions**:
- Ensure cron jobs have the `freshrss-integration` skill attached
- Use: `cronjob update <job_id> skills='[\"freshrss-integration\"]'`
- Check cron job logs for specific error messages
- Verify environment variables are accessible in cron context
- Test the newsletter builder manually before relying on cron

## Verification Steps

### Step 1: Basic Connectivity
```bash
# Test basic connectivity with Host header
curl -vk -H "Host: freshrss.wineandgecko.com" https://10.1.1.10/api/greader.php
# Should return HTML with "FreshRSS API endpoints"
```

### Step 2: Authentication Test
```bash
# Test authentication
curl -k -X POST "https://10.1.1.10/api/greader.php/accounts/ClientLogin" \
  -H "Host: freshrss.wineandgecko.com" \
  -d "Email=josh434&Passwd=J1234osh$&service=reader"
# Should return Auth=josh434/... token
```

### Step 3: API Endpoint Test
```bash
# Get auth token first, then test API
TOKEN=$(curl -k -s -X POST "https://10.1.1.10/api/greader.php/accounts/ClientLogin" \
  -H "Host: freshrss.wineandgecko.com" \
  -d "Email=josh434&Passwd=J1234osh$&service=reader" | grep -o 'Auth=.*' | cut -d= -f2)

# Test user-info endpoint
curl -k -s "https://10.1.1.10/api/greader.php/reader/api/0/user-info" \
  -H "Host: freshrss.wineandgecko.com" \
  -H "Authorization: GoogleLogin auth=$TOKEN"
# Should return JSON user info
```

### Step 4: Newsletter Builder Test
```bash
# Test newsletter builder with small article count
cd ~/.hermes/scripts/
MAX_ARTICLES=2 LOOKBACK_HOURS=1 FRESHRSS_TAG="" ./newsletter_builder.py
# Should produce a formatted newsletter output
```

## Prevention Tips

1. **Always include Host header** when accessing via IP address
2. **Verify credentials** are present and correct in `.env` files
3. **Monitor token expiration** and implement automatic refresh
4. **Test newsletter builder manually** before relying on cron
5. **Keep backups** of working newsletter_builder.py script
6. **Document working configurations** in skills for future reference

## Related Skills
- `freshrss-integration`: Main skill for connecting to FreshRSS via Google Reader API
- `newsletter-builder-troubleshooting`: For diagnosing newsletter-specific issues
- `web-service-troubleshooting`: General web service diagnosis patterns