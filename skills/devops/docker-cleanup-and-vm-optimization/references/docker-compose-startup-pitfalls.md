# Docker Compose Startup Pitfalls

## The Problem

Docker Compose has several subtle failure modes that are easy to miss, especially in multi-stack environments where services interact across networks.

## Pitfall 1: Stale Container Name Conflicts

**Symptom:**
```
service:X Error response from daemon: Conflict. The container name "/name" is already in use by container "abc123". You have to remove (or rename) that container to be able to reuse that name.
```

**Cause:** A previous run crashed or was stopped without cleanup. The container still exists in "Created" or "Exited" state with the same name.

**Fix:**
```bash
# Always do a full down before up -d
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d
```

**Prevention:** Add `--env-file` to the down command too, and check for stale containers first:
```bash
# Check for stale containers with the same name
docker ps -a --filter "name=^/container-name$"
docker rm -f container-name 2>/dev/null  # force-remove if needed
```

## Pitfall 2: Duplicate Networks (ENOTFOUND)

**Symptom:**
```
ENOTFOUND service-name
```
Services can't resolve each other by Docker network hostname despite being in the same compose file.

**Cause:** Two different Docker Compose projects each created their own network with the same name (e.g., `autognosia_firecrawl-internal` and `docker_firecrawl-internal`). Containers from different networks cannot talk to each other.

**Fix:**
```bash
# List all matching networks
docker network ls | grep firecrawl-internal
# or any service-specific network name

# Remove all duplicates
docker network rm docker_firecrawl-internal autognosia_firecrawl-internal

# Restart
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d
```

**Prevention:** Always use `docker compose down` before `up -d`. Never start a compose stack while an old one is still lingering.

## Pitfall 3: Silent `env_file:` Defaults

**Symptom:** Service starts but fails silently — connection errors, auth failures, wrong configuration — even though the `.env` file looks correct.

**Cause:** Each service in docker-compose.yml has `env_file:` with `required: false`. Missing or empty environment variables silently default to empty strings. The compose file reads `.env` internally, but if the file is empty or variables are unset, there's no error.

**Fix:** Always pass `--env-file` explicitly on the CLI:
```bash
docker compose --env-file docker/.env.web-stack -f docker/docker-compose.yml up -d
```

**Prevention:** In compose files, document that `--env-file` is required. Add a Known Issues section in the compose file header noting this requirement.

## Pitfall 4: Container Name Collisions Across Stacks

**Symptom:**
```
Conflict. The container name "/hermes-camofox" is already in use
```

**Cause:** Two different Docker Compose stacks use the same `container_name` directive. Even if they're in different projects, Docker treats container names as global.

**Fix:**
```bash
# Check which stack owns the container
docker ps -a --filter "name=^/hermes-camofox$"
docker inspect hermes-camofox --format '{{.Config.Labels}}'

# Stop/remove the stale container, then restart the new stack
docker rm -f hermes-camofox
docker compose -f new-stack.yml down
docker compose -f new-stack.yml up -d
```

**Prevention:** Use project-specific container name prefixes (e.g., `autognosia-camofox`, `hermes-camofox`) to avoid collisions across stacks.

## Quick Recovery Checklist

When a Docker Compose stack won't start:

1. `docker compose down` — clean up everything
2. `docker ps -a --filter "name=^/prefix-"` — check for stale containers
3. `docker network ls | grep network-name` — check for duplicate networks
4. `docker compose --env-file .env -f docker-compose.yml up -d` — restart with explicit env file
5. `docker logs <container>` — verify startup success
