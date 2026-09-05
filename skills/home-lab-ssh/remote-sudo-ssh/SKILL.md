---
name: remote-sudo-ssh
description: Run remote sudo on password hosts via background-PTY dance.
---

# Remote sudo over SSH (password hosts)

Run root-level commands on an SSH host that does NOT have NOPASSWD sudo configured. The terminal tool's bash backend cannot feed an interactive sudo prompt, and a **foreground** `ssh -tt` times out (~180s) before you get to type the password — so foreground attempts always fail with exit 124 at `[sudo] password for`.

## Working technique (background PTY + poll + submit)

```bash
# 1) Start as a BACKGROUND pty process (returns session_id). Do NOT use foreground.
ssh -tt -i ~/.ssh/<key> user@host 'sudo bash -c "YOUR COMMAND"'   # background=true, pty=true

# 2) Poll — confirm the prompt is showing: "[sudo] password for <user>:"
process(action=poll, session_id=...)

# 3) Submit the password (submit adds Enter)
process(action=submit, data="<password>", session_id=...)

# 4) Wait and read output
process(action=wait, session_id=..., timeout=180)
```

## Pitfalls

- **Foreground PTY ssh + sudo = guaranteed exit 124.** The tool's foreground timeout fires before you can submit. Always `background=true` for any command that will hit a sudo prompt. (A plain non-sudo foreground ssh is fine.)
- **Setting `SUDO_PASSWORD` in `.env` does NOT make remote sudo work** — the terminal tool does not inject it through SSH. The PTY+submit dance is required on password hosts regardless of `.env`.
- **Long commands:** build archives with `sudo bash -c "tar czf /tmp/x.tar.gz ... && chmod 644 /tmp/x.tar.gz"` so a later non-sudo step can read the file (root-owned files in `/tmp` are unreadable by the normal user).
- **Don't retry an identical failed foreground command** — it will fail identically. Switch to background PTY instead.
- Prefer adding a scoped NOPASSWD sudoers entry (`/etc/sudoers.d/<user>-nogpass`, limited commands) if the host is used often and the user approves — then plain `ssh ... 'sudo cmd'` works with no dance.

## Per-host facts (Josh's lab)

See `references/lab-hosts.md` for which hosts have NOPASSWD vs need the password, and where the password lives.
