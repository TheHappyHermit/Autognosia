# PostgreSQL Password Special Characters - Shell Escaping Patterns

## The Problem

The `$` character in passwords (e.g., `J1234osh$`) is interpreted by shell as variable expansion. This causes the password to be truncated and merged with the hostname.

**Error**: `ValueError: invalid literal for int() with base 10: 'J1234oshdatabase:5432'` — the `$` was stripped and password merged with host.

## Root Cause

When the URI is:
```
postgresql+psycopg://josh434:J1234osh$@database:5432/honcho
```

The shell sees `$@database` as a variable expansion, so it becomes:
```
postgresql+psycopg://josh434:J1234oshdatabase:5432/honcho
```

The port parsing then fails because `J1234oshdatabase:5432` is not a valid port number.

## Verified Working Patterns

### 1. Single Quotes with `docker run -e`
```bash
# Single quotes prevent shell expansion
docker run -e DB_CONNECTION_URI='postgresql+psycopg://josh434:J1234osh$@database:5432/honcho' ...
```

### 2. `--env-file` with `docker run`
```bash
# .env file contains literal $ (no expansion)
docker run --env-file .env ...
```

The `.env` file should have:
```
DB_CONNECTION_URI=postgresql+psycopg://josh434:J1234osh$@database:5432/honcho
```

### 3. `docker-compose.yml` with `env_file:`
```yaml
services:
  deriver:
    env_file:
      - .env
```

**Note**: `docker compose` with `env_file:` can still have issues in some versions. Verified working: `--env-file` with `docker run`.

## What Does NOT Work

| Method | Result |
|--------|--------|
| Double quotes `"` | Fails - `$` still expands |
| No quotes | Fails - `$` expands |
| `docker compose` with `env_file:` and `$` in value | Sometimes fails (version dependent) |
| `write_file`/`patch` with masked `***` values | Writes literal `***` to file |

## Debugging

```bash
# Check what the container actually receives
docker exec honcho_deriver printenv DB_CONNECTION_URI

# Test URI parsing in container
docker exec honcho_deriver python3 -c "
from sqlalchemy.engine.url import make_url
import os
url = os.environ['DB_CONNECTION_URI']
print('Parsed:', make_url(url))
"
```