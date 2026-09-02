# Internal Service Locations

Known IPs and access patterns for internal services on this network.

## Local Server (<FRESHRSS_IP>)

Primary machine running Docker-based services behind Traefik.

| Service | Hostname | Port | Access Pattern |
|---------|----------|------|----------------|
| FreshRSS | freshrss.wineandgecko.com | 443 | IP direct with `Host: freshrss.wineandgecko.com` |
| LiteLLM | litellm.wineandgecko.com | 443 | IP direct with Host header |
| Traefik dashboard | traefik.wineandgecko.com | 443 | Reverse proxy manager |
| Honcho | localhost | 8000 | Direct, no Host header needed |

### Connection Pattern

```bash
# All services use Traefik with self-signed certs
curl -sk "https://<FRESHRSS_IP>/api/greader.php/accounts/ClientLogin" \
  -H "Host: freshrss.wineandgecko.com" \
  --max-time 15
```

The Host header is critical — Traefik routes based on it.
DNS (`freshrss.wineandgecko.com`) may not resolve; always use IP direct.

## Oracle Server (161.153.112.27)

Old/alternate cloud server. Currently no FreshRSS there.

| Service | Port | Notes |
|---------|------|-------|
| wineandgecko.com frontend | 443 | Public website, not FreshRSS |
| WealthForge AI | 443 | Paperclip workspace at /opt/wealthforge-ai/ |
