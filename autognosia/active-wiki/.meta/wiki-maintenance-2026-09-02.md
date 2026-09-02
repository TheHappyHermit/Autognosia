---
type: wiki-maintenance-report
date: 2026-09-02
scope: Active Wiki (all non-raw, non-archived pages)
---

# Wiki Maintenance Report — 2026-09-02

## Summary

| Metric | Count |
|--------|-------|
| Total .md files (all) | 161 |
| Active pages (excluding raw/_archive/graphify-out/_meta/_queues) | ~70 |
| Orphaned pages (no incoming links) | 67 |
| Broken wiki links | 19 |
| Stale pages (90+ days) | 0 |

---

## 1. ORPHANED PAGES (67)

Pages with zero incoming internal links. Most are category/index pages or research output pages — expected for this wiki structure since cross-linking is minimal.

### System pages (all orphans — these form the backbone of the wiki)
- `system/index.md`
- `system/agent-boundaries.md`
- `system/autognosia-repo.md`
- `system/coder-profile.md`
- `system/core-preferences.md`
- `system/data-authority.md`
- `system/graphify-policy.md`
- `system/honcho-stack.md`
- `system/model-config.md`
- `system/oracle-research.md`
- `system/wiki-configuration.md`
- `system/memory-archive/index.md`
- `system/memory-archive/preferences.md`
- `system/memory-archive/environment.md`
- `system/memory-archive/log.md`
- `system/memory-archive/decisions.md`
- `system/memory-archive/2026-04-21-daily-log.md`

### Reference pages (all orphans)
- `reference/index.md`
- `reference/agent-zero-kb.md`
- `reference/coding-subagent-management.md`
- `reference/local-model-coding-agents.md`
- `reference/ontology-engineering-research.md`
- `reference/view-rendering-fix.md`

### Decision pages
- `decisions/index.md`
- `decisions/research-lanes-pause.md`
- `decisions/v100-contention-pattern.md`

### Dashboard research (all orphans — 15 files, last modified ~Aug 26)
- `dashboard-research/agent-control-planes.md`
- `dashboard-research/agent-panels.md`
- `dashboard-research/css-techniques.md`
- `dashboard-research/design-spec.md`
- `dashboard-research/hermes-dashboard-ecosystem.md`
- `dashboard-research/inspiration.md`
- `dashboard-research/novel-dashboard-ideas.md`
- `dashboard-research/openclaw-design-research.md`
- `dashboard-research/overview.md`
- `dashboard-research/service-pages-ai-ml.md`
- `dashboard-research/service-pages-downloads.md`
- `dashboard-research/service-pages-infra.md`
- `dashboard-research/service-pages-infra-netsec.md`
- `dashboard-research/service-pages-media.md`
- `dashboard-research/service-pages-productivity.md`
- `dashboard-research/service-pages-remaining.md`
- `dashboard-research/services-catalog.md`

### Research frontiers (all orphans — 20 files, all from Sept 2026)
- `research/frontier-research-sept-2026-update.md`
- `research/frontier-research-ontology-sept-2026-round4.md`
- `research/frontier-research-ontology-sept-2026-round5-addendum.md`
- `research/frontier-research-ontology-sept-2026-round9.md`
- `research/frontier-ontology-research-sept-2026-round10.md`
- `research/frontier-research-sept-2026-round11.md`
- `research/frontier-research-commonsense-2026-09-01.md`
- `research/frontier-research-kg-ontology-memory.md`
- `research/frontier-research-kg-ontology-memory-sept-2026-2.md`
- `research/frontier-research-kg-ontology-sept-late-2026-addenda-3.md`
- `research/frontier-research-kg-ontology-sept-late-2026-final.md`
- `research/frontier-research-fca-semanticweb-evaluation.md`
- `research/frontier-research-ontology-2026-09-01.md`
- `research/frontier-research-ontology-2026-09-01-5.md`
- `research/frontier-research-ontology-2026-09-01-deep-update.md`
- `research/frontier-research-ontology-comprehensive-update-2026-09-01.md`
- `research/frontier-research-ontology-sept-late-2026-addenda.md`
- `research/frontier-research-ontology-sept-late-2026-addenda-2.md`
- `research/frontier-research-round6-addendum-sept-2026.md`
- `research/frontier-research-round7-sept-2026.md`
- `research/frontier-research-round8-sept-2026.md`

### Other orphans
- `index.md` (root index — expected orphan, nothing links to it)
- `Welcome.md`
- `SCHEMA.md`
- `HOW-TO-USE.md`
- `log.md`
- `.meta/ingestion-log.md`
- `.meta/wiki-maintenance-2026-09-01.md`
- `comparisons/index.md`
- `comparisons/hermes-vs-claude-code-vs-codex.md`
- `entities/agents/index.md`
- `entities/agents/hermes.md`
- `health-and-routines/index.md`
- `homelab/index.md`
- `homelab/infrastructure.md`
- `personal-finance/index.md`
- `projects/index.md`
- `projects/_template/index.md`
- `projects/_template/project-template.md`
- `purchases/index.md`

### Assessment
Most "orphans" are **not true problems** — they're index pages, category pages, or research output that follow a directory-per-topic pattern rather than a wiki-link pattern. The wiki operates more as a flat document store with category directories than a true interlinked wiki. The index.md at root is the only real hub, and it links out to categories but nothing links back.

---

## 2. BROKEN LINKS (19)

### A. Empty directories (12 broken dir links)
These directories exist but have no `index.md` or `AGENTS.md`, so the `[[dir/]]` links don't resolve:
- `entertainment/` — directory exists, but empty
- `failures-and-lessons/` — directory exists, but empty
- `hardware/` — directory exists, but empty
- `ideas/` — directory exists, but empty
- `learning/` — directory exists, but empty
- `meals-and-household/` — directory exists, but empty
- `people/` — directory exists, but empty
- `queries/` — directory exists, but empty
- `questions/` — directory exists, but empty
- `recurring-responsibilities/` — directory exists, but empty
- `travel/` — directory exists, but empty
- `wiki/` — directory exists, but empty

**All 12 are linked from `index.md`** — the root index points to categories that exist as empty directories.

### B. Truly broken page links (4)
- `karpathy-llm-wiki-pattern` — does not exist
- `obsidian-integration` — does not exist (bundled Hermes skill, not a wiki page)
- `page-name` — appears to be example/template text from a rendered page
- `wikilinks` — appears to be example/template text

**Sources**: These appear in `HOW-TO-USE.md`, `log.md`, and `.meta/ingestion-log.md` — likely leftover example text or ingestion artifacts.

---

## 3. STALE PAGES (0)

No pages older than 90 days were found. All pages were modified within the last 90 days.

---

## 4. RECOMMENDATIONS

### Priority 1 — Fix broken directory links (high impact, low effort)
Create placeholder `index.md` files for the 12 empty category directories, or remove the links from `index.md` if those categories are no longer needed:
```markdown
---
title: Category Name
status: placeholder
---

## Overview
[To be populated]
```

### Priority 2 — Clean up broken page links (medium impact)
Replace/remove the 4 broken page references (`karpathy-llm-wiki-pattern`, `obsidian-integration`, `page-name`, `wikilinks`) in `HOW-TO-USE.md` and `log.md`.

### Priority 3 — Consider consolidating research orphans (low urgency)
The 20 frontier research files in `research/` are all orphaned. Consider:
- Keeping them as a timestamped archive (current state is fine)
- Or consolidating into a single summary page if the individual rounds are superseded

### Priority 4 — Dashboard research cleanup (medium)
The 18 dashboard-research files (all from Aug 26) are orphaned. If the dashboard work is complete, consider archiving to `_archive/`.

---

## 5. NOTES

- The wiki structure is **directory-based, not wiki-link-based** — pages live in category directories but rarely link to each other. This is a design pattern, not a bug.
- The `index.md` at root serves as the sitemap but itself has no incoming links (expected).
- The `.meta/` pages and raw files are intentionally excluded from the active page count.
- No stale pages found — the wiki is actively maintained.
