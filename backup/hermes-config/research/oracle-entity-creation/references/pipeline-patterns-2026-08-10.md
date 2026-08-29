# Oracle Wiki Pipeline Patterns — Session Notes

## Session: 2026-08-10 (Deep Gap Analysis Execution)

### Validated Parallel Batching Pattern

The previous "one researcher at a time" guidance was outdated. Testing showed:
- **≤3 concurrent leaf tasks per `delegate_task` call works reliably**
- Payloads >~8K tokens trigger hard stream timeouts
- Each leaf task must be self-contained with its own goal, context, and file target
- Example: dispatch 3 entity profiles, 3 domain files, or 3 bridge documents in one batch

### 12KB Hard File Limit

User enforces strict 12KB (12,288 bytes) per file. Key findings:
- Subagents frequently overshoot on first draft (13-16KB common)
- Always include "trim to 12KB" in task prompts
- Verify with `wc -c` after writing; use `patch` to trim if over
- Prioritize cutting biographical fluff over technical content when trimming

### Tavily HTTP 432 Behavior

- Tavily web_search backend **consistently returns HTTP 432 errors**
- This is EXPECTED and NOT an error to debug
- Subagents fallback to internal knowledge, which produces accurate files for well-known entities/concepts
- Do NOT retry searches or stall waiting for web results
- For obscure/current topics, consider curl + Wikipedia raw API as alternative

### Gap Analysis → Phased Execution Workflow

Validated 5-phase approach for wiki expansion:
1. **Deep gap analysis** — Enumerate all files, sample depth, identify missing items. Output: `GAP-ANALYSIS-DEEP.md`
2. **Phase 1: Critical depth additions** — Fill most significant content gaps
3. **Phase 2: Cross-domain bridges** — Interdisciplinary documents in `Cross-Domain/`
4. **Phase 3: Methods coverage** — Technical depth for specific tools/methods
5. **Phase 4: Entity profiles** — Missing person/organization entries

### Cross-Domain Bridge Document Pattern

Bridge documents connect two domains and live in `/home/josh434/.autognosia/oracle/brain\Cross-Domain\`. Each bridge:
- Maps concepts from Domain A to Domain B with explicit comparisons
- Includes comparison tables and cross-references
- Identifies what each field can learn from the other
- Ends with open questions at the intersection
- Must be ≤12KB
