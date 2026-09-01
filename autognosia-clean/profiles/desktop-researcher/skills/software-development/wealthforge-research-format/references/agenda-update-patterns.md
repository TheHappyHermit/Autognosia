# AGENDA.md Update Patterns

When updating AGENDA.md (currently ~3,900 lines, 982KB+), the `patch` tool may fail due to: (1) file read with offset/limit triggering "re-read the whole file" warning, (2) non-unique old_string across many similar sections, (3) multi-line block insertion that fuzzy matching can't handle reliably.

## Pattern 1: Verify Uniqueness Before Patching

Before calling `patch`, verify your old_string is unique:
```python
import subprocess
result = subprocess.run(['grep', '-c', 'your anchor text', 'AGENDA.md'], capture_output=True, text=True)
count = int(result.stdout.strip())
if count > 1:
    print(f"WARNING: {count} occurrences — old_string not unique!")
```

## Pattern 2: Python readlines() + insert() for Multi-Line Block Insertion

When `patch` fails (due to truncated view warning or non-unique old_string), use Python for line-level insertion:

```python
with open('/path/to/AGENDA.md', 'r') as f:
    lines = f.readlines()

# Find the insertion point
insert_marker = 'your unique line marker'
insert_idx = None
for i, line in enumerate(lines):
    if insert_marker in line:
        insert_idx = i
        break

if insert_idx is None:
    print("Could not find insertion point!")
else:
    # Build multi-line block
    new_block = [
        'line 1\n',
        'line 2\n',
        'line 3\n',
    ]
    lines = lines[:insert_idx+1] + new_block + lines[insert_idx+1:]
    with open('/path/to/AGENDA.md', 'w') as f:
        f.writelines(lines)
```

**When to use:** When you need to INSERT a multi-line block (not replace a single line). This is the most common AGENDA.md update pattern when adding new [⏳] subtopics.

## Pattern 3: Python readlines() + replace() for Single-Line Replacement

When you need to REPLACE a single line (e.g., marking [⏳] as [✅]):

```python
with open('/path/to/AGENDA.md', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'old marker' in line:
        lines[i] = 'new marker line\n'
        break

with open('/path/to/AGENDA.md', 'w') as f:
    f.writelines(lines)
```

**When to use:** For single-line replacements. Use `str.replace(old, new, 1)` if the old_string is unique. If not unique, use the line-by-line approach above.

## Pattern 4: Temp Python Script for Very Long Replacements

When the replacement string is extremely long (1,000+ chars), inline `execute_code` may fail with `SyntaxError`. Write a temp script instead:

```python
# Step 1: write the Python script to a temp file
write_file(path='/tmp/update_agenda.py', content=r'''
with open('/path/to/AGENDA.md', 'r') as f:
    content = f.read()

old_marker = '- [⏳] **Short topic name**'
new_marker = '- [✅] **Long topic name** — ... (your full research summary here, can be 500+ chars) ...'
content = content.replace(old_marker, new_marker, 1)

with open('/path/to/AGENDA.md', 'w') as f:
    f.write(content)
''')

# Step 2: run via terminal
terminal(command='python3 /tmp/update_agenda.py && rm /tmp/update_agenda.py')
```

## Pattern 5: grep + Python for Complex Multi-Section Updates

When you need to update multiple sections at once (e.g., mark one topic ✅ AND add new [⏳] subtopics):

```python
with open('/path/to/AGENDA.md', 'r') as f:
    lines = f.readlines()

# Find insertion points
insert_new_subtopics_after = None
for i, line in enumerate(lines):
    if 'bo-03-7: BD-to-onboarding handoff' in line:
        insert_new_subtopics_after = i
        break

if insert_new_subtopics_after:
    # Add new subtopics block after the found line
    new_block = [
        '\n',
        '**New sub-topics discovered from 2026-05-21 bo-03-1 Sales Command Center research:**\n',
        '|- [⏳] **bo-03-8: ...** — description...\n',
        '|- [⏳] **bo-03-9: ...** — description...\n',
        # ... more subtopics ...
        '\n',
    ]
    lines = lines[:insert_new_subtopics_after+1] + new_block + lines[insert_new_subtopics_after+1:]
    
    with open('/path/to/AGENDA.md', 'w') as f:
        f.writelines(lines)
```

## Common Pitfalls

1. **Non-unique old_string**: AGENDA.md has dozens of sections ending in identical boilerplate. Always verify uniqueness with `grep -c` first.
2. **Truncated file state**: If you've read AGENDA.md with offset/limit, the patch tool's fuzzy matcher may be in a confused state. Re-read the full file before patching.
3. **Very long replacement strings**: Inline `execute_code` with very long strings fails with `SyntaxError`. Use Pattern 4 (temp script) instead.
4. **Multi-line blocks in patch**: The patch tool is designed for single-line or small multi-line diffs. For large multi-line block insertion, use Pattern 2 (Python readlines).
5. **Line ending inconsistencies**: When building new_block, use `\n` consistently. Don't mix `\n` and `\r\n`.
