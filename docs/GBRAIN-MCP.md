# GBrain MCP Integration

Wire the [GBrain](https://github.com/garrytan/gbrain) historical index into
Hermes Agent so its retrieval tools (`get_page`, `query`, `graph`, `delta`,
...) are available in conversation. This matches the README design: GBrain is
the rebuildable long-term retrieval/index layer, accessed over MCP.

## The PATH pitfall (why this wrapper exists)

GBrain installs via Bun as a script with a `#!/usr/bin/env bun` shebang.
MCP clients launch stdio servers from a **minimal environment** whose `PATH`
usually does not include `~/.bun/bin`. The interpreter is never found and the
server dies instantly — the client reports:

```
✗ Failed to connect: Connection closed
```

even though `gbrain serve` works fine in an interactive shell.

## Fix: absolute-path launcher

`deploy/gbrain-mcp.sh` pins the Bun and gbrain binaries by absolute path
(`$HOME/.bun/bin/...`) and starts the MCP server on the `starter` surface
(~20 retrieval/memory operations).

```bash
chmod +x deploy/gbrain-mcp.sh
hermes mcp add gbrain --command "$PWD/deploy/gbrain-mcp.sh"
hermes mcp list        # expect: ✓ enabled, 26/26 tools
```

Restart Hermes (or start a new session) afterwards; tools appear as
`gbrain_*`.

## Surfaces

| Surface | Ops | Use when |
|---------|-----|----------|
| `verbs` | 7 memory verbs | minimal footprint |
| `starter` | ~20 ops | recommended default |
| `full` | everything | trusted local tooling |

Change the last line of the wrapper (`--surface starter`) if needed.

## Embeddings note (optional)

Keyword/lexical search works with zero configuration. Vector search is
**disabled** until an embedding provider is configured, and GBrain's doctor
will warn when a configured provider is nearing end-of-life. To enable
embeddings later:

1. Set an embedding model + key per the current GBrain docs
   (`docs/guides/embedding-migration.md` upstream), e.g. an
   OpenAI-compatible provider:
   ```bash
   gbrain migrate embeddings --to openai:text-embedding-3-small --dim 1024 --dry-run
   ```
2. Backfill: `gbrain embed --stale`
3. Verify: `gbrain doctor` should show the embedding checks passing.

Until then the brain serves keyword results — fully functional for small/
medium corpora; revisit when corpus size makes semantic recall valuable.
