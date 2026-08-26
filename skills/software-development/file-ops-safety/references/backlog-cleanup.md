# Backlog File Cleanup Pattern

## Context

the client platform roadmap uses `agenda_backlog_toberesearched.md` — a 4,000+ line file with task entries in the format:
```
||||||||||||||||||  - [⏳] **code: Title** — description text
```

The `||||||...` prefix is an indentation marker (not decorative). Entries are organized by section (wps, wo, ml, bo, etc.) with hierarchical codes.

## Cleanup Workflow

### Step 1: Identify truly broken entries
Run a scan for entries that are genuinely missing descriptions:
- Lines shorter than ~150 chars
- No ` — ` or ` - ` separator after the title
- Ends with `**` or `**title` without trailing content

### Step 2: Fix missing descriptions first
Before any cleanup, fill in any truly missing descriptions using context from:
- Surrounding section headers
- Similar entries in the same section
- The code prefix (which often hints at the topic)

### Step 3: Verify before deleting
- Read the full file size (line count)
- Note which entries you plan to remove
- Ask user explicitly: "I want to remove [N] entries from [file]. They are: [list codes]. Should I proceed?"

### Step 4: Delete with line-specific targeting
When deleting migrated entries, use line-number-based operations (not string matching) because:
- Entry codes may appear in descriptions of other entries
- The same title text may appear in multiple sections
- Use `patch` with sufficient unique context from surrounding lines

### Step 5: Verify after
- Read back the file to confirm only intended entries were removed
- Check for orphaned section markers or broken hierarchy

## Common Pitfalls

- **Using string-based patch for deletion** — will match 1000+ times. Use line-number targeting.
- **Deleting before verifying descriptions** — some entries look short but have descriptions using ` - ` instead of ` — `.
- **Not checking git status** — the file may not be tracked. Always `git status <file>` first.
- **Not asking before "cleaning up"** — shortening a file is still destructive. Always ask.