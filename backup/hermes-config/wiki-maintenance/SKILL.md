---
name: wiki-maintenance
version: 2.0.0
description: >
  Maintain Active Wiki indexes, find orphans, broken links, stale pages,
  and contradictions. Use during cron jobs or manual wiki audits.
---

# Wiki Maintenance Skill

## Purpose

Keep the Active Wiki healthy by finding orphans, broken links, stale pages, and contradictions.

## Wiki Location

- **Active Wiki**: `~/.hermes-cortex/active-wiki/`
- **Categories**: `projects/`, `reference/`, `system/`, `personal/`
- **Metadata**: `.meta/` directory for ingestion logs and content hashes

## Workflow

### 1. Find Orphans

Pages with no incoming links:
```bash
find ~/.hermes-cortex/active-wiki/ -name "*.md" -exec grep -L "^Source:" {} \;
```

### 2. Check Broken Links

Find links to pages that don't exist:
```bash
grep -roh '\[\[.*\]\]' ~/.hermes-cortex/active-wiki/ | while read link; do
  page=$(echo "$link" | sed 's/\[\[\([^]]*\)\]\]/\1/')
  if ! find ~/.hermes-cortex/active-wiki/ -name "$page.md" -o -name "$page/index.md" | grep -q .; then
    echo "Broken link: $link"
  fi
done
```

### 3. Check Stale Pages

Pages not updated in 90+ days:
```bash
find ~/.hermes-cortex/active-wiki/ -name "*.md" -mtime +90 -exec ls -la {} \;
```

### 4. Check Contradictions

Search for conflicting claims about the same topic using fact_store.

### 5. Generate Report

Output a maintenance report with:
- Number of orphans found
- Broken links listed
- Stale pages listed
- Contradictions flagged

### 6. Suggest Actions

For each issue, suggest:
- Delete (if truly obsolete)
- Archive (move to cold storage)
- Update (refresh with current info)
- Link (add missing connections)

### 7. Update Metadata Log

Record maintenance actions in `~/.hermes-cortex/active-wiki/.meta/ingestion-log.md`.

## Maintenance Schedule

| Task | Frequency | Cron Job |
|------|-----------|----------|
| Find orphans | Daily | Wiki Lint (Daily) |
| Check broken links | Daily | Wiki Lint (Daily) |
| Check stale pages | Weekly | Wiki Lint (Weekly Deep) |
| Deep audit | Weekly | Wiki Lint (Weekly Deep) |
| Contradiction check | Weekly | Wiki Lint (Weekly Deep) |

## Archive Policy

Stale pages should be archived, not deleted. Move to Oracle Wiki if they represent historical knowledge, or to `.meta/archive/` if they're truly obsolete but might be referenced.

## Metadata Maintenance

After maintenance, update:
- `~/.hermes-cortex/active-wiki/.meta/ingestion-log.md` — Log what was checked and found
- `~/.hermes-cortex/active-wiki/.meta/content-hashes.json` — Update if pages were modified

## Related Bundled Skills

- **`grounded-citations`** — For citation-backed research integrity. Use when wiki pages contain claims that need verifiable sources. The citation ledger tracks URL-to-ID mappings mechanically (never from memory) and `verify` catches bad citations before delivery.
