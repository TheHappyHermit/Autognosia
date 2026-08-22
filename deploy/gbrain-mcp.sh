#!/bin/bash
# GBrain MCP server launcher for Hermes Agent.
#
# gbrain is a Bun script with `#!/usr/bin/env bun`. MCP clients spawn stdio
# servers with a minimal environment whose PATH usually lacks ~/.bun/bin,
# so the interpreter is never found and the server dies instantly
# ("Failed to connect: Connection closed"). Pin absolute paths instead of
# relying on PATH.
#
# Usage (in ~/.hermes/config.yaml):
#   mcp_servers:
#     gbrain:
#       command: "<repo>/deploy/gbrain-mcp.sh"
#       args: []
exec "$HOME/.bun/bin/bun" "$HOME/.bun/bin/gbrain" serve --surface starter "$@"
