---
name: context7
description: Use when OpenCode needs up-to-date documentation for libraries, frameworks, APIs, or tools. Context7 provides current docs instead of relying on training data. Use for any library-related questions or when the agent needs to verify API signatures, configuration options, or best practices.
metadata:
  hermes:
    tags: [documentation, libraries, references, api-docs, research, verification]
---

# Context7 — Up-to-date Documentation

## What is Context7

Context7 is a skill + CLI + MCP server that provides AI coding agents with up-to-date, version-specific documentation for thousands of libraries and frameworks. Instead of relying on potentially outdated training data, OpenCode can fetch the exact docs for the version of a library you're using.

**Why this matters:** LLMs often suggest deprecated APIs, wrong signatures, or outdated patterns. Context7 fixes this by fetching the real docs at the moment of need.

## When to Use Context7

Use Context7 when:
- **Library questions** — "How do I use X from library Y?"
- **API verification** — "What are the options for configure()?"
- **Version-specific docs** — "What changed in React 19?"
- **Best practices** — "What's the recommended pattern for Z?"
- **Deprecation checks** — "Is this API still current?"
- **New libraries** — "How does the latest version of X work?"
- **Framework setup** — "How do I set up Next.js 15?"

**Rule of thumb:** If you're about to suggest code that uses a library you're not 100% sure about, use Context7 to verify.

## How to Use Context7

### Option 1: CLI commands

```bash
# Search for a library
ctx7 library react

# Get docs for a specific library (use the ID from search)
ctx7 docs /facebook/react

# Get docs with a specific query
ctx7 docs /facebook/react "hooks"

# Setup (one-time)
ctx7 setup
```

### Option 2: MCP tools (if configured)

```bash
# Query docs for a library
ctx7 query-docs --libraryId /vercel/next.js --query "app router setup"

# Search for libraries
ctx7 search --query "postgres orm"
```

### Option 3: Direct invocation

Just ask:
```
use context7 with /vercel/next.js for app router setup
use context7 with /mongodb/docs for aggregation pipeline
use context7 with /anthropics/skills/pdf for PDF generation
```

## Popular Library IDs

| Library | Context7 ID |
|---------|-------------|
| React | `/facebook/react` |
| Next.js | `/vercel/next.js` |
| MongoDB | `/mongodb/docs` |
| Supabase | `/supabase/supabase` |
| Tailwind CSS | `/tailwindlabs/tailwindcss` |
| Prisma | `/prisma/prisma` |
| Drizzle | `/drizzle-team/drizzle-orm` |
| Express | `/expressjs/express` |
| Fastify | `/fastify/fastify` |
| Node.js | `/nodejs/node` |
| Python | `/python/cpython` |
| PostgreSQL | `/postgres/postgres` |
| Redis | `/redis/redis` |
| Docker | `/moby/moby` |
| Kubernetes | `/kubernetes/kubernetes` |

## Workflow with OpenCode

When OpenCode encounters a library question:
1. OpenCode identifies the library and the question
2. OpenCode runs: `ctx7 docs /library/id "question"`
3. Context7 returns the relevant documentation section
4. OpenCode uses the docs to write accurate, current code

## Setup

```bash
# One-time setup (installs the skill)
npx ctx7 setup

# For OpenCode specifically:
npx ctx7 setup --universal

# Install a specific skill:
npx ctx7 skills install /anthropics/skills --universal
```

## Josh-Specific Rules

- **When working on the dashboard:** Use Context7 to verify any React, CSS, or API patterns before suggesting code
- **When using new libraries:** Always check Context7 for the latest API instead of guessing
- **For the Active Wiki:** Use Context7 to get accurate docs for any homelab services being integrated
- **PII reminder:** Don't send any code with PII to Context7 — scrub first

## Integration with Other Skills

- **gstack:** Use Context7 before `/plan-eng-review` to verify architecture decisions
- **gsd-core:** Use Context7 during `/gsd-spec-phase` to research technical requirements
- **Playwright:** Use Context7 to get the latest Playwright API docs
