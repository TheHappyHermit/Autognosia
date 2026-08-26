# Docker Image Audit Workflow

## The Problem

Docker accumulates unused images over time — old builds, deprecated versions, abandoned services. Deleting them requires verifying they're truly unused before removing, because images can be referenced by compose files, running containers, or build cache.

## Audit Procedure

### Step 1: List All Images on Disk

```bash
docker images --format "{{.Repository}}:{{.Tag}}\t{{.Size}}"
```

### Step 2: Check Running Containers

```bash
docker ps --format "{{.Names}}\t{{.Image}}\t{{.Status}}"
```

Note which images are actively used by running containers.

### Step 3: Check Compose/Dockerfile References

```bash
# In repo docker/ directory
grep -r "image:" docker/ --include="*.yml" --include="*.yaml"
grep -r "FROM " docker/ --include="Dockerfile"
```

Build a set of all images referenced by compose files and Dockerfiles.

### Step 4: Identify Orphan Images

Cross-reference:
- **KEEP**: Images used by running containers OR referenced in compose/Dockerfile
- **DELETE**: Images not in either category

```python
# Pseudocode for the audit logic:
keep_images = set()
# 1. Add images from running containers
for container in docker_ps():
    keep_images.add(container.image)

# 2. Add images from compose/Dockerfile references
for ref in compose_dockerfile_references():
    keep_images.add(ref)

# 3. Delete everything else
for disk_image in docker_images_on_disk():
    if disk_image not in keep_images:
        docker_rmi(disk_image)
```

### Step 5: Verify Before Delete

Common false positives to check:
- **Old honcho builds** (`honcho-server:latest`, `honcho-deriver:latest`) — replaced by `ghcr.io/plastic-labs/honcho:latest`. Safe to delete — data is in volumes, not images.
- **PGvector versions** (`pgvector/pgvector:pg17`) — check if compose uses a specific version (`pg15`). Delete unused versions.
- **Python base images** (`python:3.11-slim`) — check if Dockerfiles still reference them. If upgraded to 3.12, old version is orphaned.
- **Postgres variants** (`postgres:16-alpine`) — check compose files. If not referenced, it's likely an old stack leftover.

### Step 6: Delete and Prune

```bash
# Delete specific images
docker rmi <image>:<tag>

# Clean up dangling images (untagged, unreferenced)
docker image prune -f

# Clean build cache
docker builder prune -f
```

### Step 7: Verify Post-Cleanup

```bash
# Verify containers still healthy
docker ps --format "{{.Names}}\t{{.Status}}"

# Verify disk space freed
df -h

# Verify remaining images are correct
docker images --format "{{.Repository}}:{{.Tag}}\t{{.Size}}"
```

## Known Safe-to-Delete Images (Aug 2026)

| Image | Size | Why Safe |
|-------|------|----------|
| `autognosia-personal-state-api:latest` | 233MB | Replaced by personal-organizer-api |
| `autognosia-personal-ops-api:latest` | 233MB | Never used |
| `honcho-server:latest` | 2.4GB | Old honcho build, replaced by `ghcr.io/plastic-labs/honcho:latest` |
| `honcho-deriver:latest` | 2.4GB | Old honcho build |
| `pgvector/pgvector:pg17` | 627MB | Honcho uses pg15 |
| `python:3.11-slim` | 189MB | Dockerfiles now use 3.12 |
| `postgres:16-alpine` | 420MB | Not in any compose file |
| `alpine:latest` | 13MB | Build cache artifact |
| `ankane/pgvector:latest` | 628MB | GBrain compose not in active use |

**Total reclaimed: ~6.2 GB**

## Pitfalls

- **Don't confuse images with volumes.** User data lives in Docker volumes, not images. Deleting `honcho-server:latest` won't touch the PostgreSQL data volume.
- **Docker images share layers.** Deleting one image may not free the full reported size if layers are shared with other kept images. The reported savings are approximate.
- **GitHub API rate limits.** When checking name availability via GitHub search API, batch requests with delays (2-3 seconds between). After 30+ requests you'll hit the rate limit (HTTP 403).

## Session Results (Aug 18, 2026)

Applied this workflow to the VM. Disk dropped from 54GB → 46GB (8GB reclaimed). 9 unused images deleted, 6 kept. All 7 containers remained healthy.
