# Cron/Agent AGENDA.md Update Protocol

## Context
Cron jobs and background agents often fail to write to `~/Documents/Hermes-Vault/wealthforge-roadmap/AGENDA.md` using `patch` or `write_file` due to mount-level permission restrictions that deny temp-file (`.hermes-tmp.*`) creation in the working tree. The file itself is readable and writable, but Hermes-side write wrappers fail.

## Workaround
Use an inline Python script via `terminal(command=...)` to perform the atomic replacement, or use direct `write_file` on non-temp paths when the wrapper supports it.

## Recommended pattern
```python
path = '/home/josh434/Documents/Hermes-Vault/wealthforge-roadmap/AGENDA.md'
with open(path, 'r') as f:
    content = f.read()
old = '    - [⏳] **topic-id: old text'
new = old.replace(']', '✅', 1).replace('old text', 'new summary')
content = content.replace(old, new)
with open(path, 'w') as f:
    f.write(content)
```

## Checklist
- [ ] Read AGENDA.md before editing to avoid blind overwrite
- [ ] Confirm the old string is unique or anchored on the exact line
- [ ] Preserve emoji exactly in both `old` and `new`
- [ ] Verify the line changed with `grep -n 'topic-id' AGENDA.md` before finishing
