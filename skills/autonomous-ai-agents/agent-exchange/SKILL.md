---
name: agent-exchange
description: Share files, tasks, and messages with the other Hermes.
---

# Agent Exchange — Desktop ↔ Server Hermes Coordination

Two Hermes instances share a coordination folder on the main server's NAS. This skill is the desktop-side copy; the server instance has its own equivalent skill (same contract, mirrored paths).

## Who is who
- **desktop** = this agent (Windows desktop `C:\Users\josh4`). Sleeps after ~1h idle; runs high-quality local model (qwen3.8-27b via LM Studio 127.0.0.1:1234). Has SSH keys to all lab machines — everyone's hands for anything requiring SSH.
- **server** = always-on Hermes on `hermes-vm` (10.1.1.37, user josh434). Models: stealth/ox-alpha cloud primary, Qwen3.6-35B-A3B local fallback (10.1.1.10:8080), OpenRouter free tier. No SSH of its own; CIFS mount kept alive by `nas-mount-keeper` container.
- **agent-zero** = agent on `DragonOS` (10.1.1.18, user josh434). Owns the radio/SDR/OSINT/hacking-tools KB (`~/agent-zero/agent-zero/usr/shared/knowledge_base/` + `obsidian_vault/Hacker_Tools`). Snapshot shared at `shared/knowledge/agent-zero-kb-20260822/`.

## The folder
- SMB: `\\server\nas\agent-exchange` → map as needed (`net use Z: \\server\nas`).
- Server-side path: `/mnt/nas/agent-exchange`.
- **The contract lives in `README.md` inside the folder — read it first every time before using any part of the exchange.** It is the source of truth; if this skill and README disagree, README wins (it's what both agents see).

## Layout (schema v1)
```
agent-exchange/
  README.md            ← contract (read first)
  inbox-desktop/       ← FOR me. Others write; I read + clear.
  inbox-server/        ← FOR server. I write; it reads + clears.
  inbox-agent-zero/    ← FOR agent-zero. I write; it reads + clears.
  shared/knowledge/    ← research notes, findings (markdown); KB snapshots as <source>-kb-<YYYYMMDD>/
  shared/wiki/desktop/ ← my wiki contributions
  shared/wiki/server/  ← its wiki contributions
  shared/skills/       ← dated skill snapshots: <skill>-<YYYYMMDD>/
  shared/crons/        ← cron definitions, same naming
  tasks/pending|doing|done/   ← task ledger (one file per task)
```

## Message format
File name `YYYYMMDD-HHMMSS-<slug>.md`, frontmatter:
```yaml
---
from: desktop | server
to: server | desktop
type: question | task | data | fyi
reply-to: <filename or "none">
status: open | answered
---
```
Body = self-contained markdown (receiver has no other context).

## Operating rules (non-negotiable)
1. Only write to the OTHER agent's inbox; never edit/delete files in my own inbox except moving processed ones to `tasks/done/`.
2. Polling etiquette: check inbox at session start, before non-trivial tasks, and no more often than every 10 min while waiting. No tight loops — "don't stress anything" is a standing user constraint.
3. Task lifecycle: delegate = task file in `tasks/pending/` (frontmatter: from, assignee, deadline?, status) + fyi message in assignee's inbox. Assignee moves pending→doing→done and appends results.
4. No clobbering: never edit files I didn't create outside my inbox; propose changes as `<name>-<YYYYMMDD>.md` alongside the original.
5. Skills/crons are copied, never moved — authoritative copy stays on the owning machine; exchange holds dated snapshots only.
6. Wiki data: markdown only, each agent in its own subfolder until an explicit merge request.
7. Atomic writes: when writing a file the other agent may read, write `<name>.tmp` first then rename over the target (PowerShell `Rename-Item -Force`) — readers must never see half-written files.
8. Versioned sharing (optional upgrade): if skills/cron snapshots accumulate, convert `shared/skills/` and/or `shared/crons/` into a bare git repo on the share — I commit changes, server pulls when it needs them (event-free, history + conflict detection). Dated folders are fine until then.
9. Size discipline: NAS volume is ~96% full → markdown + small files only. No media/weights/binaries without asking first via message.

## Typical flows
- **Ask server something:** write question to `inbox-server/`, status stays open, check for reply at next natural checkpoint or within 10 min if actively waiting.
- **Delegate SSH work I can't do while asleep:** task file in `tasks/pending/` with `assignee: desktop` — server leaves it; I pick up on wake. Reverse direction works the same way (server has no SSH, so tasks needing lab access are mine).
- **Share a skill/cron:** copy to `shared/skills/<name>-<YYYYMMDD>/`, fyi message with install instructions.
- **Wake-up check:** first thing after sleep — scan `inbox-desktop/` and `tasks/pending/` for anything addressed to me.

## Pitfalls
- The NAS share is guest-accessible on the LAN — treat exchange content as non-sensitive; never put SSH keys, tokens, or passwords in it (no secrets cross this channel).
- SMB from Windows can hold file locks briefly after writes — if a read looks stale, retry once.
- Don't assume server acts on inbox messages instantly; it's always-on but may be mid-task. Inbox + task ledger are async by design.
