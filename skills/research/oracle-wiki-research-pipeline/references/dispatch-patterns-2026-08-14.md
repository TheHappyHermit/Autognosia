# Dispatch Patterns — Updated 2026-08-14

## Primary Pattern: Domain Knowledge Only (RECOMMENDED)

For well-known researchers, use a single dispatch with domain knowledge. This is faster, more reliable, and avoids Tavily HTTP 432 failures.

**Context:**
```
Oracle wiki. Create entity profile. 20-30KB.
NO execute_code/python/scripts allowed.
Write from domain knowledge only — no web search.
```

**Goal:**
```
Write [Name] entity profile to /home/josh434/.autognosia/oracle/brain\Entities\[Name].md.
Cover: [3-6 key topics]. 20-30KB.
```

Typical runtime: 13-30 minutes. Typical output: 25-70KB.

## Fallback: Multi-Round Research

Only when entity is obscure or needs 2024-2025 citations:
- 3 rounds, 5KB max each (R1=foundations, R2=contributions, R3=synthesis)
- Write to temp files, merge, clean up

## Critical Rules

1. **No execute_code/python/scripts in dispatch contexts** — User demands manual execution only. All verification via terminal (`stat`, `ls`, `wc`). Scripts trigger approval delays.
2. **No file deletions (rm) on wiki files** — User will not approve destructive commands. Leave duplicates in place.
3. **One entity per delegation call** — Bundling 2+ entities hits the ~8K token stream limit and times out after 4-5 hours.
4. **Keep goal under 1KB** — Bullet points, not prose paragraphs.

## File Size Targets (12KB ceiling REMOVED)

| Task | Target | Typical |
|------|--------|---------|
| Entity profile | 20-30KB | 25-70KB |
| Domain topic | 15-30KB | 15-69KB |
| Multi-round chunk | 5KB | 5KB |
| Gap analysis | 40KB | 30-40KB |

All content files ≥10KB (specialist-grade). Index files are naturally smaller — do not expand.

## Verification

After async completion, verify on disk:
```bash
stat -c"%s filename" /home/josh434/.autognosia/oracle/brain/Entities/filename.md
```

If file missing despite "completed" status, re-dispatch with "keep it focused" directive.
