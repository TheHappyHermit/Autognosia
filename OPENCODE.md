# OpenCode / Coder Agent — Setup & Skills Reference

This document specifies which skills and configuration the **Coder Agent** (OpenCode) needs when setting up Autognosia from this repository. The main Hermes agent uses this to bootstrap the Coder profile.

---

## 1. Agent Identity

- **Role:** Coding orchestrator — delegates 100% of code writing to OpenCode CLI, then verifies and delivers.
- **Never writes code directly** (except verification scripts, syntax checks, test harnesses).
- **Works on copies only** — never touches original repo files directly.

---

## 2. Model & Hardware

| Field | Value |
|-------|-------|
| **Model** | `Qwen3.8-27B` |
| **Provider** | LM Studio on desktop (`10.1.1.151:1234`) |
| **Hardware** | RTX 3090 (shared with OpenCode — sequential use only) |
| **Context** | ~110K tokens |

Both the Coder agent and OpenCode use the **same model on the same GPU**. They run sequentially: Coder briefs → OpenCode codes → Coder verifies → repeat.

---

## 3. Coder Profile Location

```
~/.hermes/profiles/coder/
├── SOUL.md          # Agent personality and workflow instructions
├── config.yaml      # Model/provider config (pins to LM Studio)
├── skills/          # Symlinks or copies of skills from main ~/.hermes/skills/
```

The `SOUL.md` is the canonical behavioral spec. When setting up fresh, copy the SOUL.md from this repo's `profiles/coder/SOUL.md` (or equivalent) into `~/.hermes/profiles/coder/SOUL.md`.

---

## 4. Required Skills (Always Load First)

These skills must be available to the Coder agent before any task:

| Skill | Location | Purpose |
|-------|----------|---------|
| `opencode` | `autonomous-ai-agents/opencode/SKILL.md` | Core OpenCode CLI delegation workflow |
| `dashboard-development` | *(if building dashboards)* | Phase-based dashboard builds with OpenCode |
| `code-review` | `software-development/code-review/SKILL.md` | Reviewing OpenCode output quality |
| `requesting-code-review` | `software-development/requesting-code-review/SKILL.md` | Pre-commit quality gates |

### Setup Command

```bash
mkdir -p ~/.hermes/profiles/coder/skills
cd ~/.hermes/skills
for skill in opencode code-review requesting-code-review; do
  ln -sf ~/.hermes/skills/$skill ~/.hermes/profiles/coder/skills/$skill
done
```

If the task involves dashboard/frontend work, also link:
```bash
ln -sf ~/.hermes/skills/dashboard-development ~/.hermes/profiles/coder/skills/dashboard-development
```

---

## 5. Skills Available As Needed

Load these based on task requirements:

| Skill | When to Load |
|-------|--------------|
| `systematic-platform-audit` | Auditing a completed build end-to-end |
| `systematic-debugging` | Root-cause debugging (4-phase) |
| `test-driven-development` | Enforce tests before features |
| `dogfood` | Exploratory QA of web apps |
| `spike` | Quick experiments before committing to build |
| `simplify-code` | Parallel cleanup of verbose code |
| `subagent-driven-development` | Execute plans via delegate_task |
| `technology-evaluation` | Compare approaches systematically |
| `file-ops-safety` | Any file deletion/modification/cleanup |
| `organizer-state` | Manage tasks/projects from within Coder |
| `playwright` or `computer-use` | GUI verification (MANDATORY before delivering UI work) |
| `first-principles` | Complex reasoning and design decisions |
| `gstack` | GStack development workflow |
| `gsd-core` | GSD core methodology |

---

## 6. Workflow Rules

### The Scratch Workspace Pattern (MANDATORY)

```bash
# 1. Create scratch copy
WORK=/tmp/oc-<project>-$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$WORK" && cp -r /path/to/original/. "$WORK/"

# 2. Run OpenCode on the COPY
cd "$WORK" && opencode run '<task brief>'

# 3. Verify output (read files, syntax check, test, browser capture)

# 4. Only after verification: copy approved files back one at a time

# 5. Verify originals are intact
cd <real repo> && git status --short
```

### Verification is Mandatory

After every OpenCode run:
1. Read the files OpenCode claims to have written
2. Run syntax checks (`node --check`, `python3 -m py_compile`)
3. For UI changes: verify in browser via `computer_use` capture
4. Test actual functionality — never trust OpenCode's self-report

### Pivot Rule

After **2 failed OpenCode attempts**, stop and use `patch` + `execute_code` directly. Do not retry OpenCode more than twice.

---

## 7. Consultation Rules

The Coder agent does not work in isolation:

| Need | Escalate To |
|------|-------------|
| Josh's taste / preference / direction | Main Hermes agent (`[CONSULTATION REQUEST]`) |
| Technical info, API docs, library behavior | Researcher agent (via `delegate_task`) |
| Existing knowledge, past decisions, provenance | Oracle (via `oracle-query` or graphify) |
| Recurring problems (3+ failures, blocked, dead ends) | STOP and ask the appropriate agent |

**Time limit:** 39+ minutes stuck → consult. Speed beats stubbornness.

---

## 8. OpenCode Quick Reference

```bash
# One-shot task
opencode run 'Add retry logic to API calls' --model desktop-lmstudio/qwen3.8-27b

# Interactive session (background PTY)
opencode                          # start TUI
opencode -c                      # continue last session
opencode -s <session_id>         # specific session

# Flags
--model desktop-lmstudio/qwen3.8-27b   # force model
--thinking                             # show thinking
-f file.txt                            # attach context
--agent build                          # build agent (default)
--agent plan                           # plan agent (read-only)
```

**Important:** Never use `/exit` in OpenCode — use Ctrl+C (`\x03`) to exit.

---

## 9. Security Rules

- **NEVER** send private data, personal files, or non-code material to OpenCode
- **NEVER** include API keys, passwords, or credentials in task briefs
- **ALWAYS** work on copies, never on original files
- **ALWAYS** verify originals remain untouched after the task

---

## 10. Keeping This Updated

When adding new skills to OpenCode or changing its workflow:

1. Update the relevant SOUL.md section in `~/.hermes/profiles/coder/SOUL.md`
2. Sync changes to this file in the repo (`autognosia-clean/OPENCODE.md`)
3. Update the main Hermes agent's SETUP.md to reference the new skill

This ensures the next Hermes that sets up Autognosia knows exactly what to configure.

---

## 11. Current Known Skills (as of 2026-08-30)

From `~/.hermes/skills/` that are relevant to Coder:

- `autonomous-ai-agents/opencode` ✓
- `software-development/code-review` ✓
- `software-development/requesting-code-review` ✓
- `software-development/systematic-debugging` ✓
- `software-development/test-driven-development` ✓
- `software-development/dogfood` ✓
- `software-development/spike` ✓
- `software-development/simplify-code` ✓
- `software-development/subagent-driven-development` ✓
- `software-development/technology-evaluation` ✓
- `software-development/file-ops-safety` ✓
- `software-development/systematic-platform-audit` ✓
- `software-development/computer-use` ✓ (for GUI verification)
- `cortex/first-principles` ✓
- `organizer-state` ✓
