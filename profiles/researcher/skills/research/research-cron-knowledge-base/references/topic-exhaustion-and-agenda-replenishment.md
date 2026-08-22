# Topic Exhaustion & Agenda Replenishment

When a research cron's AGENDA.md reaches zero `[⏳]` topics, the agenda has been fully consumed. This is a natural lifecycle event for finite research agendas — but it can also happen prematurely if the agenda was too narrow or topics were consumed too quickly.

## Detection

```bash
# Zero pending = agenda exhausted
grep -c '⏳' AGENDA.md  # returns 0

# Healthy state
grep -c '⏳' AGENDA.md  # should be > 0
grep -c '✅' AGENDA.md  # completed count
```

## Root Causes

1. **Natural completion** — The research scope was finite and all items were consumed (e.g., researching all major wealthtech competitors). This is expected after 200+ runs.

2. **Premature exhaustion** — Topics were too narrow or too many sub-topics were added per session (agenda grew faster than it shrank, but then hit a dead end).

3. **Topic quality** — Topics that cannot sustain 2000+ words with 10+ sources get skipped by the cron, creating "zombie" topics that block progress.

4. **Stream alternation gap** — In dual-stream setups (Employee-Roles vs. General Features), one stream may exhaust while the other still has topics. The cron should switch streams when the current one is empty.

## Recovery: Replenishing the Agenda

### Strategy 1: Expand the Research Scope
Add adjacent topics from the same domain:
- If competitor research is done → add competitor sub-products, parent companies, or acquired entities
- If feature research is done → add related regulatory frameworks, implementation patterns, or integration scenarios
- If employee role research is done → add cross-role workflows, hiring benchmarks, or org design patterns

### Strategy 2: Deepen Existing Topics
Break broad [✅] topics into sub-topics that deserve their own research entries:
- A completed "eMoney Platform Analysis" → "eMoney Decision Center Algorithm," "eMoney Tax Optimization Engine," "eMoney Client Portal Architecture"
- A completed "Tax-Loss Harvesting Methods" → "Parallel Position Management Algorithm," "Wash Sale Prevention Logic," "Tax-Aware Rebalancing"

### Strategy 3: Cross-Platform Analysis
Shift from single-competitor deep dives to comparative analysis:
- "Compare withdrawal methodologies across 5 planning engines"
- "Analyze AI feature maturity across 8 wealthtech platforms"
- "Map regulatory compliance features across TAMP vs. pure-play platforms"

### Strategy 4: New Domain Discovery
Add entirely new research categories discovered through prior research:
- New regulatory changes (e.g., OBBBA provisions, SEC rules)
- Emerging technology trends (e.g., AI agent architectures for wealth management)
- Market structure shifts (e.g., bank-RIA partnerships, custody consolidation)

### Strategy 5: Red-Team / Edge Case Research
Add adversarial topics that test the project's assumptions:
- "Regulatory enforcement actions against wealthtech platforms (2020-2026)"
- "Failure modes of robo-advisor algorithms in stress scenarios"
- "Known data quality issues in wealth management aggregators"

## Prevention: Keeping the Agenda Alive

1. **Add topics proactively during research** — Every session should add 3-5 new topics. The agenda should grow faster than it shrinks.

2. **Set a minimum agenda size** — When `[⏳]` count drops below 15, trigger a replenishment session. Don't wait for zero.

3. **Use the "adjacent discovery" pattern** — After each research entry, explicitly ask: "What are 3 adjacent topics that would be valuable to research next?" Add them immediately.

4. **Cross-reference with USED_RESEARCH.md** — Topics covered in the archive may have adjacent sub-topics not yet explored.

5. **Monitor topic quality** — If topics are consistently being skipped (cron can't produce 2000+ words), replace them with broader, more researchable topics.

## When to Stop

Not every research agenda needs infinite topics. If:
- All major competitors have been analyzed
- All key features have been documented
- All regulatory frameworks relevant to the project have been covered
- The project has enough research to begin implementation

Then the agenda is complete. The next phase is **implementation**, not more research. Document the completion:
- Add a `## Research Complete` section to AGENDA.md
- Note the final run count and total topics researched
- Archive AGENDA.md and start a new agenda for the next research phase

## See Also
- `cron-research-context-management` — "Diagnosing Silent Runs" section covers topic exhaustion as a diagnostic case
- `research-cron-knowledge-base` — "Agenda self-expansion is critical" pitfall
