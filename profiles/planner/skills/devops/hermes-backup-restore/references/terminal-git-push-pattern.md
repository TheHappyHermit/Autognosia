# Terminal Git Push Pattern — Avoiding LLM Rate Limits

## Problem

Uploading large files (README, INSTALL.md, documentation) to GitHub via LLM tool calls burns through rate limits because:
- The LLM processes the file content token-by-token
- Each tool call that handles the content counts against provider quotas
- Free tiers (OpenRouter, etc.) have strict per-minute limits

## Solution: Use `terminal` for Pure Git Operations

The `terminal` tool runs shell commands directly on the VM — **zero LLM tokens consumed**.

### Pattern

```bash
# 1. Clone (if not already local)
cd /home/josh434
git clone https://github.com/openclaw434/autognosia.git

# 2. Write file directly from cached source (no LLM processing)
cat /home/josh434/.hermes/cache/documents/doc_<hash>_message.txt > /home/josh434/autognosia/INSTALL.md

# 3. Commit and push via git (uses local gh auth)
cd /home/josh434/autognosia
git add INSTALL.md
git commit -m "Add INSTALL.md"
git push origin main
```

### Key Points

| Step | Tool | LLM Tokens? |
|------|------|-------------|
| Clone | `terminal` | No |
| Write file | `terminal` (cat/redirect) | No |
| Commit | `terminal` (git) | No |
| Push | `terminal` (git) | No |

The `gh` CLI auth is already configured on the VM — `git push` uses it automatically over HTTPS.

### When User Sends a File

1. File lands at `~/.hermes/cache/documents/doc_<hash>_message.txt`
2. Use `cat` to copy it to the repo
3. Git add/commit/push — all via `terminal`

### Why This Worked

- Previous attempts may have used `web_search`, `browser`, or other LLM-backed tools
- This session: only `terminal` for git operations
- Result: **Zero rate limit issues**, files pushed successfully

### Reusable Commands

```bash
# Push any file from cache to repo
REPO=autognosia
FILE=INSTALL.md
CACHE_FILE=$(ls -t ~/.hermes/cache/documents/doc_*_message.txt | head -1)
cat "$CACHE_FILE" > "/home/josh434/$REPO/$FILE"
cd "/home/josh434/$REPO"
git add "$FILE"
git commit -m "Add $FILE"
git push origin main
```