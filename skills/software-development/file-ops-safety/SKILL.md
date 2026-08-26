---
name: file-ops-safety
description: Mandatory safety rules for all file operations — deletion, modification, and cleanup. Prevents irreversible data loss from unsanctioned file edits.
version: 1.0.0
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [file-safety, deletion, backup, data-integrity]
---

# File Operations Safety Rules

> **Non-negotiable.** These rules apply to every file operation, regardless of context or apparent triviality.

## Core Rules

### 1. NEVER delete content without asking first

Before deleting, removing, truncating, or clearing any file content:

- **Explicitly ask the user.** State what you're about to delete and why.
- **Never assume** a user wants content removed. Even "cleanup" or "shortening" requires permission.
- **Never delete because "it would be cleaner."** User decides what's clean.

### 2. ALWAYS backup before modifying

Before modifying a file that contains data you can't easily reconstruct:

- **Read and record the full content** of the section you're about to change
- **Keep a copy** in memory or a temporary file before writing changes
- **Verify the backup** matches the original before proceeding

### 3. Verify deletions before committing

When you delete content (with user approval):

- **Confirm the deletion actually happened** — read back the file
- **Check that nothing important was lost** — verify no orphaned entries, broken references, or lost data

### 4. When in doubt, don't delete

If you're unsure whether content is safe to remove:

- **Ask first** — "Can I remove X? It's about Y."
- **Move, don't delete** — if the user is hesitant, offer to move content to a backup location rather than delete it
- **Document what was removed** — if the user says yes, record what you deleted and where it went

## Pitfalls

**Cleaning up files without backup.** This is the most common failure mode. You see a file with redundant content and think "I'll just clean this up." Don't. Ask first. Back up first.

**Deleting entries you think are "duplicates."** Two entries may look similar but serve different purposes. Never delete based on your judgment of redundancy.

**Truncating files to save context.** Never delete content just to reduce file size or save tokens. This is data destruction, not optimization.

**Assuming git will save you.** Files may not be tracked. Always verify git tracking (`git status <file>`) before relying on it as a safety net. If the file is untracked or missing from git entirely, treat it as a one-shot file — backup is mandatory.

**Backing up to memory instead of a file.** When modifying large files, writing the backup to a temp file (not relying on context window) is required. Context can be lost before you need it. Use `cp <file> <file>.backup` or save the section to a temp file before editing.

**Cleaning up without checking for truly missing content.** Before deleting or restructuring, scan for entries that appear incomplete but may have been truncated by the user. Check: entries ending without `—` or `-`, lines shorter than ~150 chars for task entries, and entries using non-standard separators (` - ` vs ` — `).

**Not asking before "improving" a file.** Shortening, reformatting, or "cleaning up" a file is still a modification that destroys data. Always ask: "I want to [action] [file] because [reason]. Should I proceed?" even when the change seems obviously beneficial.

**Overwriting append-only files.** the client platform's `RESEARCH.md` is append-only — never use `write_file` on it. Always check the file's purpose before writing: if the file is a research log, knowledge base, or any growing document, use `>>` via terminal or read-then-append. The `write_file` tool replaces the entire file. Rule: `write_file` on a `.md` file that could be a log = immediate red flag — verify append intent first. If you weren't yet sure it was log-like, read it first and confirm the append intent before calling `write_file`.

**Concurrent/cron writes overwriting sibling work.** As seen in Run 868, running as a cron job or alongside other agents increases collision risk on shared append-only files. Always read the file's current size/timestamp before appending, then append in one operation. Prefer per-session or per-topic files in a `research_outcomes/` directory when possible — they avoid the collision problem entirely.

## Recovery is not a substitute for prevention

If you've already deleted content without asking:

- **Acknowledge the mistake immediately** — don't try to hide it
- **Reconstruct from available sources** — research notes, context, other files
- **Tell the user what happened** — what was deleted, what you recovered, what's still missing
- **Never repeat it** — this is a hard rule going forward

## User-facing phrasing

When asking for permission:
> "I want to delete/remove [what] from [file]. It will [impact]. Should I proceed?"

When confirming:
> "Done. I removed [what] from [file]. The file now has [N] entries. Want me to verify anything?"

When reporting a mistake:
> "I deleted [what] without asking. I've recovered [what] from [sources]. [N] entries are still missing. I won't do this again without explicit permission."
