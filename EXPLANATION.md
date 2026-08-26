# What `hermes-config-backup` Does

This skill backs up all your Hermes customizations to a Git repository. It preserves:

- **Config:** `config.yaml`, `SOUL.md`
- **Profiles:** Each profile's `config.yaml`, `profile.yaml`, `SOUL.md`, `cron/`
- **Skills:** The entire `skills/` tree (all 250+ skills with references/, scripts/, templates/)
- **Cron:** Global cron jobs (`cron/jobs.json`) and per-profile cron scripts

**What it intentionally excludes:**
- Memory, sessions, cache, logs, auth/secrets, runtime state, curator metadata

**Cron job #1 ("Config Backup")** uses this skill to run a daily git backup of your entire Autognosia config — profiles, skills, cron jobs, everything — so you can restore it on a new machine or recover from data loss.

It's safe and useful. Leave it as-is.

---

# Acceptance Tests

They already exist at `tests/ACCEPTANCE_TESTS.md` — lightweight shell scripts that verify Docker services, API health, wiki operations, backups, and cron jobs.

---

# Next Steps

1. Rewrite prompt-me with the Active Learning protocol
2. Merge in high-value elements from the old prompt-me skill
