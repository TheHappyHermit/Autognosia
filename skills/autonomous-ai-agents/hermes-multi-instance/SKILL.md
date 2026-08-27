---
name: hermes-multi-instance
description: Use when comparing or syncing two Hermes instances.
---

# Hermes Multi-Instance Audit & Sync

Audit and sync skills, cron jobs, and knowledge bases across the user's Hermes installs (Windows desktop ↔ agent VM <LAN_HOST>) over SSH.

the user runs multiple Hermes instances that share a knowledge architecture but are NOT the same install:
- **Windows desktop** (`C:\Users\<username>\AppData\Local\hermes`) — primary personal agent; Oracle Vault at `C:\Hermes\Oracle\Vault`, LLM wiki at `C:\Hermes\LLM_WIKI`.
- **Agent VM <LAN_HOST>** (user <username>) — runs hermes-cortex; its own Hermes instance operates autonomously 24/7.

Connect per the `home-lab-ssh` skill (key: `~/.ssh/id_ed25519_agent_server`). Never touch the agent VM's running processes or config without explicit user go-ahead — file-level drops only by default.

## Audit workflow

1. **Skills diff.** List both sides, then set-diff:
   ```bash
   # local (git-bash): find ~/AppData/Local/hermes/skills -name SKILL.md | sed 's|.*/skills/||; s|/SKILL.md||' > /tmp/my_skills.txt
   # remote: ssh ... "find ~/.hermes/skills -name SKILL.md | sed 's|^.*skills/||; s|/SKILL.md$||'" > /tmp/agent_skills.txt
   comm -23 <(sort /tmp/my_skills.txt) <(sort /tmp/agent_skills.txt)  # only local has
   ```
   Note: the agent VM also keeps per-profile skills under `~/.hermes/profiles/<name>/skills/` (e.g. oracle profile ~203). Check those too when answering "does it have X".

2. **Cron diff.** Read `~/.hermes/cron/jobs.json` on each side; compare by function, not count — the two stacks are usually disjoint by design.
   - **Pitfall: job lists are NOT static.** The agent VM's own Hermes self-provisioned 23 cron jobs from `hermes-cortex/cron-jobs/definitions.md` in a single session (2026-08-16). Always re-list immediately before reporting; a list from hours ago may be stale.

3. **Path mapping BEFORE any transfer.** The destination is whatever the *operational components* read, not what config files claim:
   - Read `hermes-cortex/config/paths.yaml` for declared paths — then grep the actual scripts (`~/hermes-cortex/scripts/*.py`) and installed skills for hardcoded paths. On <LAN_HOST> these disagree (see references/agent-server-cortex-paths.md).
   - Check env vars that redirect defaults: e.g. bundled llm-wiki skill reads `WIKI_PATH` (unset → `~/wiki`; on <LAN_HOST> it is now set to the cortex active-wiki — see reference).

## Transfer techniques (Windows desktop → Linux VM)

- **tar-over-SSH pipe** — rsync is not installed on the agent VM; tar exists both sides:
  ```bash
  tar -C /c/Hermes/Oracle/Vault --exclude='./~' -cf - . | ssh -i ~/.ssh/id_ed25519_agent_server <username>@<LAN_HOST> "mkdir -p <dest> && tar -xf - -C <dest>"
  ```
- **Verify with counts, not exit codes:** `find <dest> -name '*.md' | wc -l` on both sides must match the source count (excluding intentional exclusions).
- Exclude known artifacts deliberately (e.g. the stray literal `~` dir in the desktop Vault — an accidental unexpanded-tilde clone of a GitHub repo, 731 md files; designed home if ever preserved: `oracle/raw/`).

## Skill push (path-adapted, desktop → agent VM)

Desktop skills hardcode `C:\Hermes\...` / `/c/Hermes/...` paths — never copy them raw. Build an adapted tree locally, verify it's clean, then tar-push:

1. Run `scripts/adapt_and_push_skills.py` (regex rule table for the verified desktop→cortex mapping; edit RULES if the mapping changes). It writes the adapted tree to a local temp dir and prints how many files changed.
2. **Verify zero Windows paths remain** before pushing: `grep -rnE 'C:\\Hermes|/c/Hermes|AppData' <tree>` — expect no output. Watch for stragglers the rule table misses (e.g. state.db backup globs).
3. Push with the same tar-over-SSH pipe, into `~/.hermes/skills/` (create category dirs like `research/` first). Nested skill dirs (e.g. `hermes-troubleshooting/cron-job-management/SKILL.md`) push fine as-is; frontmatter `name:` must match the dir name.
4. **Tell the user** new skills only become visible to the remote instance after its gateway reloads / refreshes its skill index — they won't appear in a live session immediately.

## Pitfalls

- **Quoting hell with nested SSH + python.** `ssh host "python3 -c \"...\""` mangles quotes through git-bash. Instead write the script locally and pipe via stdin:
  ```bash
  cat /tmp/check.py | ssh -i ~/.ssh/id_ed25519_agent_server <username>@<LAN_HOST> "python3 -"
  ```
- **Config files lie about where data lives.** `paths.yaml` declared `oracle_path: ~/.hermes-cortex/oracle`, but every operational script/skill read `oracle/brain/` (and GBrain + literal-search fallback hardcoded `~/personal-agent/oracle/brain`). Files dropped at the config-declared root were invisible to the entire pipeline. Always grep scripts for actual paths before choosing a destination.
- **Terminal output truncation:** long SSH command outputs can come back as "1 lines output" in compacted context — re-run with narrower queries or write results to a file and read it.

## Reference

- `references/agent-server-cortex-paths.md` — verified path map for <LAN_HOST> (paths.yaml vs actual script paths, GBrain hardcodes, cron self-provisioning behavior, what was copied when).
