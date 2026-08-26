# FreshRSS Deployment on Oracle Server (wineandgecko.com)

## Prerequisites
- Oracle Cloud ARM64 server (Ubuntu 24.04)
- SSH access as `ubuntu` user with key at `~/.ssh/oracle_cloud_key`
- Docker and Docker Compose installed
- Traefik running as reverse proxy

## Deployment Steps
1. **Create data directory** (run via SSH as ubuntu):
   ```bash
   ssh -i ~/.ssh/oracle_cloud_key ubuntu@161.153.112.27 "sudo mkdir -p /opt/freshrss/data && sudo chown -R 1000:1000 /opt/freshrss"
   ```

2. **Deploy FreshRSS container with Traefik labels**:
   ```bash
   ssh -i ~/.ssh/oracle_cloud_key ubuntu@161.153.112.27 "docker run -d \
     --name freshrss \
     -v /opt/freshrss/data:/data \
     -e TZ=UTC \
     -l traefik.enable=true \
     -l 'traefik.http.routers.freshrss.rule=Host(\`freshrss.wineandgecko.com\`)' \
     -l traefik.http.services.freshrss.loadbalancer.server.port=80 \
     freshrss/freshrss:latest"
   ```

3. **Verify deployment**:
   ```bash
   # Check container is running
   ssh -i ~/.ssh/oracle_cloud_key ubuntu@161.153.112.27 "docker ps | grep freshrss"
   
   # Test Traefik routing (should return JSON, not 404)
   ssh -i ~/.ssh/oracle_cloud_key ubuntu@161.153.112.27 "curl -s -H 'Host: freshrss.wineandgecko.com' http://localhost/api/greader.php"
   ```

4. **Complete initial setup** (browser-based):
   - Navigate to `http://freshrss.wineandgecko.com/install.php`
   - Create admin user: username `<username>`, password from `FRESHRSS_API_PASSWORD` in `~/.hermes/.env`
   - Enable Google Reader API: Settings → Reading → Enable Google Reader API
   - Note: CLI initialization via `docker exec freshrss php /var/www/FreshRSS/app/install.php` returns "Forbidden" — only browser-based setup is supported.

## Notes
- FreshRSS data persists in `/opt/freshrss/data` on the Oracle server
- Traefik automatically routes `freshrss.wineandgecko.com` to the container via Docker labels
- If the container is recreated, data is preserved in the volume