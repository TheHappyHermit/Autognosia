# Internal Service Locations

Known IPs and access patterns for internal services on this network.

## Local Server (<V100_HOST>)

Primary machine running Docker-based services behind Traefik.

| Service | Hostname | Port | Access Pattern |
|---------|----------|------|----------------|
| FreshRSS | freshrss.<oracle-server> | 443 | IP direct with `Host: freshrss.<oracle-server>` |
| LiteLLM | litellm.<oracle-server> | 443 | IP direct with Host header |
| Traefik dashboard | traefik.<oracle-server> | 443 | Reverse proxy manager |
| Honcho | localhost | 8000 | Direct, no Host header needed |

### Connection Pattern

```bash
# All services use Traefik with self-signed certs
curl -sk "https://<V100_HOST>/api/greader.php/accounts/ClientLogin" \
  -H "Host: freshrss.<oracle-server>" \
  --max-time 15
```

The Host header is critical — Traefik routes based on it.
DNS (`freshrss.<oracle-server>`) may not resolve; always use IP direct.

## Oracle Server (161.153.112.27)

Old/alternate cloud server. Currently no FreshRSS there.

| Service | Port | Notes |
|---------|------|-------|
| <oracle-server> frontend | 443 | Public website, not FreshRSS |
| the client platform | 443 | the workspace app workspace at /opt/the client platform-ai/ |
