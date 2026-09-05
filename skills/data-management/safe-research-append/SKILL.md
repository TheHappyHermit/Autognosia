---
name: safe-research-append
description: Prevents accidental overwrite of WealthForge RESEARCH.md by enforcing append-only pattern
category: data-management
---

# RESEARCH.md SAFE APPEND

## CRITICAL RULE
RESEARCH.md must NEVER be overwritten. Always APPEND to it.

## WRONG (destroys previous research)
```python
write_file(path="~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md", content="new entry")
```

## CORRECT (preserves existing content)
```python
# 1. Read existing content
existing = read_file(path="~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md")

# 2. Append new entry
new_content = existing['content'] + "\n\n---\n\n" + new_entry

# 3. Write back
write_file(path="~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md", content=new_content)
```

## SAFER ALTERNATIVE
Use `terminal` with `>>` append operator:
```bash
echo "new entry" >> ~/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md
```

## IF YOU ACCIDENTALLY OVERWRITE
1. Check AGENDA_ARCHIVE.md for recovered content
2. Check AGENDA.md [✅] entries for key findings
3. Reconstruct from AGENDA.md summaries if needed
4. Document the data loss and never repeat the error
