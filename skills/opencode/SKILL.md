---
name: opencode
version: 1.0.0
description: >
  Delegate coding tasks to OpenCode CLI. Use for writing, editing, and debugging code files. NEVER send private data, personal files, or non-code material to OpenCode — it routes to a remote server (Gemini 2.5 Pro).
---

# OpenCode Skill

## Purpose

Use OpenCode CLI for code-only tasks. OpenCode routes to a remote server (Gemini 2.5 Pro), so only code should be sent.

## Security Rules

- **CODE ONLY** — Never send private data, personal files, or non-code material
- **NO SECRETS** — Never include API keys, passwords, or credentials
- **NO PERSONAL CONTENT** — Never send wiki entries, memory content, or personal notes
- **LOCAL PROCESSING** — All private data stays local via execute_code, write_file, read_file, patch, terminal

## Workflow

### 1. One-Shot Code Tasks

```bash
opencode run "Create a Python script that does X" --model opencode/big-pickle
```

### 2. Code Review

```bash
opencode run "Review this code for bugs" --model opencode/big-pickle
```

### 3. Debugging

```bash
opencode run "Fix this error: [error message]" --model opencode/big-pickle
```

## Available Models

| Model Type | Example | Use Case |
|------------|---------|----------|
| Remote (free) | `opencode/big-pickle` (default) | General coding tasks |
| Remote (free) | `opencode/<other-free-model>` | Alternative free models |
| Local | `local/<provider>/<model>` | When local processing needed |

## Configure Preferred Models

Configure your preferred models in `${HOME}/.hermes/config.yaml`:

```yaml
opencode:
  default_model: "opencode/big-pickle"
  available_models:
    - "opencode/big-pickle"
    - "local/anthropic/claude-3.5-sonnet"
```

## Installation

```bash
# Install OpenCode CLI from https://github.com/opencode-ai/opencode
# Hermes will attempt: npm install -g @opencode/cli (or brew on Mac)
# Add to PATH
# Configure models in ${HOME}/.hermes/config.yaml
```

## When NOT to Use OpenCode

- Processing personal data
- Writing wiki entries
- Managing memory
- Handling secrets or credentials
- Any non-code task