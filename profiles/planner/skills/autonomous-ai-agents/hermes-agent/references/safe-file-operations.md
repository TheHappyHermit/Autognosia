# Safe File Operations — Pitfalls & Recovery

## THE Card: `write_file` Overwrites Everything

**`write_file` is NOT an append operation.** It replaces the *entire* file content with whatever you pass. This is the most common and most destructive file mistake in Hermes sessions.

### The Offset/Limit Trap

If you call `read_file` with `offset` and `limit` parameters (partial view), and then call `write_file` on the same file:

1. You will destroy the content you didn't read
2. The tool warns: *"was last read with offset/limit pagination (partial view). Re-read the whole file before overwriting it."* — **This warning is not optional. Stop and re-read the full file.**

**Safe workflow for modifying large files:**

```
# If you only need to change a small part:
→ Use patch(old_string, new_string) — finds and replaces, preserves rest
→ OR read the FULL file first, then write_file with the complete new content
→ NEVER write_file after offset/limit read without first re-reading fully
```

## Use `patch` for Targeted Edits

`patch` (mode='replace') does a find-and-replace within a file without touching anything else:

```python
patch(
    path="/path/to/file.md",
    old_string="[⏳] Old topic name",
    new_string="[✅] New topic name"
)
```

- Uses fuzzy matching (9 strategies) — whitespace/indentation differences OK
- Returns a unified diff so you can verify the change
- Runs syntax checks after editing
- `replace_all=True` to replace all occurrences

**When to use write_file vs. patch:**

| Action | Tool |
|--------|------|
| Create a new file | write_file |
| Overwrite entire file with new content | write_file |
| Add content to end of file | write_file (with full file content) |
| Fix a typo or update a line | patch |
| Change a config value | patch |
| Bulk multi-file edits | patch (mode='patch', V4A format) |

## Recovery: What to Do When You Overwrite a File

If you accidentally `write_file` over an existing file:

### Step 1: Don't panic. Check local backups first.

Before reaching for session_search (which is slower and less reliable), check these in order:

```
# 1. Git history (if the file was in a repo)
cd /path/to/dir && git log --oneline -5

# 2. Shell backup files
ls -la ${HOME}/.Trash/files/ 2>/dev/null
find /path/to/dir -name "*.bak" -o -name "*.swp" -o -name "*.~" 2>/dev/null
find . -name ".*.swp" 2>/dev/null   # vim swap files

# 3. Hermes state snapshots (periodic config/db backups)
find ${HOME}/.hermes/state-snapshots/ -name "*.db" 2>/dev/null
# NOTE: state snapshots contain state.json/config, NOT user document files
```

### Step 2: Reconstruct from your own conversation context (fastest)

If you read the file earlier in this session (via `read_file`), **that output is still in your conversation**. This is the fastest recovery path:

1. Scroll back through your own tool outputs to find the `read_file` calls that returned the original content
2. Combine old content + new content in memory (Python or manual concatenation)
3. Write the full combined file back with one `write_file` call
4. Add a note at the top documenting the consolidation

### Step 3: If conversation context is insufficient, try session_search

```python
session_search(query="file path and key terms from the lost content", limit=5)
```

This searches past session transcripts. It's less reliable for raw file content (sessions are summarized, not full file dumps), but can recover enough to reconstruct the structure.

### Step 4: As a last resort, re-research from web sources

If the file contained research findings from external sources, re-research the same topics using `web_search` + `web_extract` and reconstruct the findings. Cross-reference with any agenda or index file to verify completeness.

### Prevention: The Append Pattern

If you are accumulating research into a log file (appending new sections), **do NOT use this unsafe pattern:**

```python
# UNSAFE — overwrites the file
write_file(path="RESEARCH.md", content="New section only")
```

**Use this safe pattern instead:**

```python
# SAFE — read full file, combine, write
from hermes_tools import read_file, write_file

old = read_file(path="RESEARCH.md")
new_findings = """...new section content..."""
full_content = old["content"] + new_findings
write_file(path="RESEARCH.md", content=full_content)
# OR use patch to insert at the end:
# patch(path="RESEARCH.md", old_string="last line of old file", new_string="last line\\n\\n---\\n\\nNew section")
```

**The critical rule:** If you last read the file with `offset`/`limit` (partial view), you MUST re-read the full file (no offset/limit) before calling `write_file`.

## Prevention Checklist

Before calling `write_file`, ask yourself:

- [ ] Have I read this file with offset/limit (partial view)?
  - If YES → re-read the full file first, or use patch instead
- [ ] Am I replacing the entire file?
  - If NO → use patch instead of write_file
- [ ] Is this a new file?
  - If YES → write_file is fine
- [ ] Could this be done with patch (targeted edit)?
  - If YES → prefer patch (safer)
