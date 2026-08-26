# Size and Frontmatter Notes (2026-08-13)

## Size Enforcement in Practice

When the user specifies a size range (e.g., 20-30KB), first drafts routinely exceed the upper bound. The Leslie Valiant entity was requested at 20-30KB and came in at 33KB. Always run `wc -c` immediately after `write_file` and trim if over target — don't assume the draft is within bounds.

**Rule of thumb:** Write to ~80% of the stated upper bound, then expand if needed. This avoids the trim cycle entirely.

## Frontmatter Schema Inconsistency

There's a mismatch between the SCHEMA.md frontmatter convention (uses `id:`, `provenance:`, `related:`, `status:`) and the simpler newer convention documented in `references/research-patterns.md` (drops those fields for `title:`, `created:`, `type:`, `tags:`, `confidence:`). 

**Current practice:** When creating new entities, use the richer SCHEMA.md frontmatter (`id:`, `provenance:`, `related:`, `status:`, `domain:`) as it provides more structure for cross-referencing. The simpler schema may be outdated.
