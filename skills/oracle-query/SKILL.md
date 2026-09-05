---
name: oracle-query
description: Search Oracle vault and return specialist analysis.
---

# Oracle Query

Search the Oracle knowledge vault and return structured specialist analysis.

## Workflow

1. **Parse request** — Extract question, domain, constraints, and required output format.

2. **Search Oracle vault** — The vault is at `/home/josh434/.autognosia/oracle/brain\domains\`. Installed domains:
   - `radio-rf/` — SDR tools, radio operators, hardware, Seattle radio (46 files)
   - `cybersecurity/` — Kali OS software (1 file)
   - `financial-planning/` — Empty (awaiting content)
   - `local-ai/` — Empty (awaiting content)
   
   Use `search_files` to find relevant pages, then `read_file` to load them.

3. **Load relevant pages** — Read Markdown pages from the appropriate domain directory.

4. **Analyze evidence** — Compare competing claims, identify stale information, note missing evidence.

5. **Return structured result**:
   - conclusion
   - evidence used
   - library pages used
   - important assumptions
   - unknown information
   - disputed claims
   - fresh research needed
   - confidence
   - suggested personal writeback

## Empty Domain Handling

If the specific domain requested is empty or lacks sufficient information, return:
```
Knowledge not yet installed for this domain.
Installed domains: radio-rf (47 files), cybersecurity (1 file).
Please add curated Markdown files to /home/josh434/.autognosia/oracle/brain\domains\ or /home/josh434/.autognosia/incoming\.
```

Do not invent an answer when the vault lacks information.