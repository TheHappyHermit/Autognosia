---
name: github-rate-limit-avoidance
description: "Use local git/gh CLI for GitHub ops — avoid LLM rate limits."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [GitHub, Rate Limits, LLM, CLI, Git]
    related_skills: [github-repo-management, github-auth, github-pr-workflow]
---

# GitHub Rate Limit Avoidance

**Core principle:** Never use LLM tool calls (web_search, web_extract, browser, execute_code with HTTP) to interact with GitHub when a local CLI command achieves the same result.

## Why This Matters

| Resource | Limit | Who Owns It |
|----------|-------|-------------|
| **OpenRouter / LLM provider** | ~1,000 req/day (free tier) | User's LLM budget |
| **GitHub API (authenticated)** | 5,000 req/hour | User's GitHub account |
| **GitHub API (unauthenticated)** | 60 req/hour | IP-based |

Using LLM tools to call GitHub APIs burns the **wrong budget** — the user's scarce LLM credits instead of their generous GitHub API quota.

## Correct Patterns (Zero LLM Tokens)

### Pushing Files (README, code, docs)
```bash
cd /path/to/local/repo
# Write file via shell heredoc — no LLM processing
cat > README.md << 'EOF'
[your content]
EOF
git add README.md
git commit -m "Add README"
git push origin main
```

### Creating Repos
```bash
# gh CLI — uses local PAT, zero LLM tokens
gh repo create my-new-project --private --clone
```

### Reading Repo Contents
```bash
# Clone locally, then read with cat/read_file
git clone https://github.com/owner/repo.git
cat repo/README.md
```

### Checking Repo Status
```bash
gh repo view owner/repo --json name,visibility,defaultBranch
```

### Managing Releases
```bash
gh release create v1.0.0 --title "v1.0.0" --generate-notes
```

### CI/CD Interaction
```bash
gh run list --limit 10
gh run view <RUN_ID> --log-failed
gh run rerun <RUN_ID> --failed
```

## Anti-Patterns (Burn LLM Tokens)

| ❌ Don't Do This | ✅ Do This Instead |
|-----------------|-------------------|
| `web_search("site:github.com owner/repo README")` | `gh repo view owner/repo --json readme` |
| `browser_navigate("https://github.com/owner/repo")` | `git clone ...` then `read_file` |
| `execute_code` with `requests.post` to GitHub API | `gh api repos/owner/repo/contents/file` |
| LLM generating curl commands for GitHub API | Use `gh` CLI built-ins |

## When GitHub Web API Is Acceptable

- **Rare, one-off queries** where `gh` doesn't have a subcommand
- **Webhook payloads** received by your server (not initiated by you)
- **OAuth flows** that require browser interaction

Even then, prefer `gh api <endpoint>` over raw `curl` — it handles auth, pagination, and rate limit headers automatically.

## Local Auth Setup (Prerequisite)

This pattern requires `gh` auth or SSH keys configured locally:

```bash
# One-time setup
gh auth login
# or
ssh-keygen -t ed25519
gh ssh-key add ~/.ssh/id_ed25519.pub
```

Once configured, **all subsequent GitHub operations are local** — no LLM involvement needed.

## Quick Decision Tree

```
Need to interact with GitHub?
│
├─► Can I do it with `git` or `gh` CLI?
│     │
│     ├─► YES → Use terminal() with git/gh commands → ZERO LLM tokens
│     │
│     └─► NO → Is it a one-off rare query?
│           │
│           ├─► YES → Use `gh api` or `curl` via terminal() → GitHub API tokens only
│           │
│           └─► NO → Re-evaluate — you probably CAN use gh
```

## Related Skills

- `github-repo-management` — Core repo operations (clone, create, fork, settings)
- `github-auth` — Auth setup for gh/SSH
- `github-pr-workflow` — PR lifecycle with gh
- `github-code-review` — Review PRs locally