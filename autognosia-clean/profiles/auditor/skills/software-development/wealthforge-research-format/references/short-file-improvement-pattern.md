# Short File Improvement Pattern

## When to Use

You find an existing research file that is <100 lines, especially one that has a single-paragraph format, missing sections, or no 12-section structure. These files are typically from an earlier, less rigorous research phase and need comprehensive replacement.

## Signal Detection

Check these signals before starting research on a topic:

1. **File size: <10KB and/or <100 lines** — Almost certainly needs full replacement
2. **Missing sections** — Look for 1-2 section format (e.g., "Executive Summary + Market Intelligence") instead of 12-section format
3. **No codebase references** — If the file doesn't reference exact module names, function signatures, or database schemas from the project
4. **No formulas or pseudocode** — Build Spec section should have actual algorithms, not descriptions
5. **Light source count** — Fewer than 5 sources with URLs

## The Pre-Scan Technique (Determining Priority)

When the AGENDA.md lists multiple short files needing improvement, do NOT pick the first one. Read ALL of them first to:

1. **Compare quality baselines** — Which file has the most salvageable content? Which is the thinnest? Prioritize the one where the replacement will have the highest marginal impact.
2. **Check for cross-cutting concerns** — Multiple short files may overlap. Read them all to identify shared topics and avoid duplicating source material.
3. **Assess codebase coverage** — Some topics may already have code implementations that are well-documented in the codebase files; these are higher-value improvements because the build spec will be more precise.
4. **Check feature_ideas_intake/ for validation context** — The intake research may contain competitive analysis or validation that short files missed, making the combination particularly valuable.

Prioritization heuristic: files that reference existing codebase modules (even vaguely) are higher impact because the build spec can be precise. Files that are pure strategy with no codebase references benefit more from the codebase deep dive.

## The Two-Stage Process

### Stage 1: Audit the Existing File

Before writing anything new, systematically assess what the existing file covers:

```
- [ ] Section 1 (Strategy & Context): Covered? Depth?
- [ ] Section 2 (The Problem): Covered? Concrete numbers?
- [ ] Section 3 (Competitive Landscape): Covered? Named competitors?
- [ ] Section 4 (Advisor/Client Sentiment): Covered? Real quotes?
- [ ] Section 5 (What WF Has/Is Missing): Covered? Exact module names?
- [ ] Section 6 (Build Spec): Covered? Formulas? Pseudocode?
- [ ] Section 7 (UI/UX): Covered? Chart descriptions? 
- [ ] Section 8 (Regulatory): Covered? Specific rule numbers?
- [ ] Section 9 (Architecture): Covered? SQL? API endpoints?
- [ ] Section 10 (Red Teaming): Covered? Mitigations?
- [ ] Section 11 (Sources): Count? With URLs?
- [ ] Section 12 (New Topics): Present?
```

Mark each as `NONE`, `PARTIAL`, or `COMPLETE`. This tells you where to focus.

### Stage 2: Codebase Deep Dive (What the Old File Misses)

Old files almost never reference the actual codebase. You MUST go deeper than just reading the one relevant module:

**Step 1: Read the architecture-level documents first** — Before searching for specific code modules, read these files for the big picture:
- `Master_Specification.md` — Architecture overview, all database schemas, agent contracts, API router structure
- `Schema_Cheat_Sheet.md` — Every suite endpoint, all table schemas, integration points
- `Data_Capture_Registry.md` — Breadth of data capture across all modules (often reveals tools/features the research topic didn't know existed)
- `Research_and_Roadmap.md` — Previous research summaries, what's been validated, implementation progress

These files together reveal the full surface area a topic touches — often more than the topic's dedicated module suggests.

**Step 2: Search the codebase for relevant identifiers** — Use `search_files(target='content', pattern=...)` on:
- Table names mentioned in the topic (e.g., `portfolio_events`, `tax_lots`, `immutable_audit_events`)
- Function/class names from the architecture docs (e.g., `EventProjector`, `FillRecorder`, `apply_event`)
- Any existing migration files (e.g., `010_add_portfolio_events`)
- Count existing `.rs` and `.tsx` files in relevant directories to gauge implementation maturity

**Step 3: Read the actual code** — Don't guess. Read the Rust/Python implementation to understand what exists:

```python
# Example codebase search pattern
search_files(target='files', pattern='*.rs', path='wag-engine/src/')
# Then read specific modules
read_file(path='wag-engine/src/monte_carlo/mod.rs')
```

**Step 4: Build the precise gap map** — Format:

```
WE HAVE:
- `wag-engine/src/monte_carlo/mod.rs` — GBM/log-normal via `rand_distr::Normal`, 80 lines
- `services/api/routers/portfolios.py` — Basic CRUD endpoints for portfolio data
- `010_add_portfolio_events.py` — WORM-compliant event table exists
- `immutable_audit_events` table (SUITE-020) — Hash-chained audit stream

WE'RE MISSING:
- No Student-t distribution in MC engine (module not found)
- No EventProjector service (no code found matching search patterns)
- No `portfolio_snapshots` table (check schema cheat sheet)
- No point-in-time API endpoint (`/as-of/{date}` not found)
```

Example from FIX-04:
```
Current: wag-engine/src/monte_carlo/mod.rs — GBM via rand_distr::Normal, 80 lines
Missing: Student-t (replace Normal with StudentT), historical bootstrap, block bootstrap, 
         regime-switching (new modules), Cornish-Fisher, CVaR, correlation breakdown
New modules needed: student_t.rs, bootstrap.rs, regime_switching.rs, cornish_fisher.rs
```

### The "Burn the Old File" Rule

When the existing file is <100 lines and lacks the 12-section format, do NOT try to patch it. The old format is fundamentally incompatible with the new. Write a complete replacement file from scratch. The old content is preserved in git history.

Exception: If the old file has a few paragraphs of genuinely useful content (e.g., a specific formula, a unique source), extract those paragraphs and incorporate them into the new file's relevant sections.

## Source-Accumulation Pattern

Old files typically have 2-5 sources. You need 10-15+. The pattern:

1. **Search sources in parallel** (Run 3-5 web_search calls simultaneously)
2. **Extract the most promising** (Run web_extract on 3-5 URLs simultaneously)
3. **Search follow-ups** (From extracted content, identify gaps and search again)
4. **Go deeper than the old file** — If the old file mentioned "Kitces said X", go read the actual Kitces article and extract the specific numbers

## Concrete Example: FIX-04 Improvement

The original 62-line file had:
- Section 1 (Executive Summary): 10 lines, good hypothesis
- Section 2 (Market Intelligence): 20 lines, 5 competitive mentions
- Section 3 (Red Teaming): 10 lines, 2 failure modes
- Section 4 (Architecture): 20 lines, single Rust module reference
- Section 5 (Diligence Log): 2 lines, 5 source URLs

Replacement (791 lines, 48KB):
- All 12 sections fully covered
- Codebase deep dive: read actual Rust code (80 lines), identified exact gap (no Student-t, no bootstrap, no regime-switching)
- 25 sources with URLs (vs. 5 in old file)
- 5 failure modes with specific mitigations (vs. 2 in old file)
- 8 new topics discovered (vs. 0 in old file)
- 4 complete algorithm specifications with pseudocode (vs. 0 in old file)

## Common Traps

- **Don't keep the old file's structure** — The 12-section format is the standard. Don't try to "add to" the old 2-section format.
- **Don't skip the codebase audit** — Old files almost never reference the actual code. Reading the code is where the real gaps emerge.
- **Don't forget AGENDA.md/RESEARCH.md** — If these don't exist at the codebase-local research_outcomes path, create them. Future sessions need the state tracker.
- **Verify file size after write** — If replacing an old file, verify the new file is actually larger. `wc -c` to confirm.
