---
name: mcp-stdio-path-and-pep668
description: Fix two common local-tool integration failures — Bun-based MCP servers dying with "Connection closed" (missing PATH) and pip installs failing on PEP 668 externally-managed Pythons.
category: devops
---

# MCP stdio PATH pitfall & PEP 668 bootstrap (Autognosia patterns)

## Pattern 1 — MCP server "Failed to connect: Connection closed" (Bun/npm global scripts)

Symptom: `hermes mcp add <name> --command <tool>` fails instantly with
"Connection closed", but running the same command manually works.

Root cause: tools installed via `bun install -g` / `npm -g` are scripts with
`#!/usr/bin/env bun` (or `env node`). MCP clients spawn stdio servers from a
minimal environment whose PATH lacks `~/.bun/bin` / global npm bin →
interpreter not found → server dies before handshake.

Diagnosis: run the exact command via subprocess with a clean env and read
stderr — you'll see `/usr/bin/env: 'bun': No such file or directory`.

Fix: absolute-path wrapper script, then register the wrapper:

```bash
cat > ~/somewhere/tool-mcp.sh <<'EOF'
#!/bin/bash
exec "$HOME/.bun/bin/bun" "$HOME/.bun/bin/<tool>" serve --surface starter "$@"
EOF
chmod +x ~/somewhere/tool-mcp.sh
printf 'y\n' | hermes mcp add <name> --command ~/somewhere/tool-mcp.sh --connect-timeout 30
```

Note: `hermes mcp add` prompts interactively to enable all tools — pipe `y`
when non-interactive.

**PGLite single-writer caveat:** GBrain on PGLite allows ONE process. Once an
MCP session spawns `gbrain serve`, CLI commands (`gbrain sync`, `doctor`,
`search`) fail with a lock error until it exits — this silently breaks
CLI-based crons. Fix: migrate to self-hosted Postgres+pgvector
(`gbrain migrate --to supabase --url postgres://...` despite the name, it
works with any Postgres; local Docker pgvector container is $0).

Real case: GBrain (`gbrain serve`) — wrapper at `~/.hermes/scripts/gbrain-mcp.sh`,
generic copy committed at `deploy/gbrain-mcp.sh` in the Autognosia repo,
docs in `docs/GBRAIN-MCP.md`.

## Pattern 2 — self-installing script crashes on PEP 668 systems

Symptom: a tool's ImportError fallback does
`subprocess.run([sys.executable, "-m", "pip", "install", ...], check=True)`
and dies with `externally-managed-environment` (Homebrew/distro Python).

Fix pattern (see Autognosia `scripts/dashboard_server.py::_ensure_web_deps`):
probe import → if missing, ensure an isolated venv under
`~/.<app>/<app>-venv`, pip-install inside it, then `os.execv()` re-exec into
the venv python. Never pip into the system interpreter.

Verification gotcha: after installing deps once, later test runs may silently
use a *different* interpreter that already has the deps — the broken path is
never exercised. Re-test with the exact interpreter that originally failed.
