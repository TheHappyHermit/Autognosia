# Research Append Safety for WealthForge Research Files

`write_file` ALWAYS overwrites; it never appends. WealthForge research runs must not use it to update `RESEARCH.md`, `EMPLOYEE-ROLES-RESEARCH.md`, or equivalent logs.

## Cause

Previous runs lost research entries after calling `write_file` on a target log: the tool replaced the entire file, including earlier entries.

## Rule

Never use `write_file` on any research log for partial updates. Pick one of the approved append methods below.

## Approved append methods

1) Python append — simplest portable option
```python
with open(
  '/home/josh434/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md',
  'a',
) as f:
  f.write(entry_content)
```

2) Bash append
```bash
cat << 'EOF' >> /home/josh434/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
ENTRY TEXT
EOF
```

## Preferred mitigation

Write new research work to a standalone file:
```python
# Researcher artifact, separate from the live log
write_file(
  path='research_outcomes/research_entry_{topic_id}.md',
  content=entry_content,
)
```
A consolidated append step then runs under controlled workflow rules. This keeps the live log safe during any later cron-run merge.

## Concurrent write protection

- Read-before-write the target log when other agents or jobs may run in parallel.
- Prefer standalone artifact files over live-log appends.
- Avoid triple-quoted strings over roughly 25KB in `execute_code`; write to a temp file first, then append.
