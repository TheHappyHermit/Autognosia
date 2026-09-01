# (no title)
URL: https://mintlify.wiki/traefik/traefik/operations/api

> ## Documentation Index
> 
> Fetch the complete documentation index at: https://mintlify.com/traefik/traefik/llms.txt
> Use this file to discover all available pages before exploring further.

# API

> REST API endpoints for querying Traefik runtime configuration, routers, services, and middlewares

# REST API

Traefik exposes a comprehensive REST API for querying runtime configuration, monitoring routers, services, middlewares, and more.

## Overview

The Traefik API provides access to:

- Runtime configuration of routers, services, and middlewares
- Entry points and their configurations
- TCP and UDP router information
- Health and status information
- Debug and profiling endpoints (when enabled)

The API is disabled by default and must be explicitly enabled in the static configuration.

## Security Considerations

## Never Expose Publicly

The API exposes sensitive configuration data including:

- Service endpoints and backends
- Middleware configurations
- TLS certificate information
- Provider details

Always restrict API access to internal networks only.

## Use Authentication

Always secure the API with authentication middleware:

- Basic Authentication
- Digest Authentication
- Forward Authentication
- IP Allow Lists

## Disable in Production

Consider disabling the API entirely in production, or exposing it only on a separate internal entry point.

## Configuration

### Enable the API

Enable the API in your static configuration:

```yaml
api:
  dashboard: true
  debug: false

```

```toml
[api]
  dashboard = true
  debug = false

```

```bash
--api=true
--api.dashboard=true

```

This creates a special service `api@internal` that can be referenced in routers.

### Secure Mode (Recommended)

Create a router with authentication to access the API:

```yaml
http:
  routers:
    api:
      rule: "Host(`traefik.example.com`)"
      service: api@internal
      middlewares:
        - auth
      
  middlewares:
    auth:
      basicAuth:
        users:
          - "admin:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/"

```

```toml
[http.routers.api]
  rule = "Host(`traefik.example.com`)"
  service = "api@internal"
  middlewares = ["auth"]

[http.middlewares.auth.basicAuth]
  users = [
    "admin:$apr1$H6uskkkW$IgXLP6ewTrSuBkTrqE8wj/"
  ]

```

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.api.rule=Host(`traefik.example.com`)"
  - "traefik.http.routers.api.service=api@internal"
  - "traefik.http.routers.api.middlewares=auth"
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$apr1$$H6uskkkW$$IgXLP6ewTrSuBkTrqE8wj/"

```

The router rule must match the `/api` path prefix. Using a Host rule is recommended as it matches all paths on that host.

### Insecure Mode

For development and testing only:

```bash
traefik --api.insecure=true

```

This exposes the API on the `traefik` entry point (default port 8080) at `http://:8080/api/`

Insecure mode is not recommended for production and does not support authentication middleware.

#