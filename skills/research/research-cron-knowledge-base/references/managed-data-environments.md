# Managed Data Environments in WealthTech — Reference

## What They Are

A **managed data environment** is a productized data infrastructure layer that unifies, governs, and activates investment/planning data from disparate systems into a single governed environment. It transforms what was previously an internal plumbing concern into a product with its own revenue stream and switching-cost moat.

## Why They Matter

- **Switching costs:** Once a firm's data is governed within the environment, migration requires rearchitecting all data pipelines — prohibitively expensive
- **AI readiness:** Unified, clean, governed data is the prerequisite for enterprise AI. No data foundation → no trustworthy AI outputs.
- **New revenue category:** Productizing internal infrastructure creates a second revenue stream (data-as-a-product) beyond the core platform

## Key Examples

| Platform | Approach | Status |
|----------|----------|--------|
| **Addepar ADX** (May 2026) | Productized internal Databricks lakehouse + Financial Graph + Addison AI; $9T on platform, 1,400+ firms | **Launched** |
| **iCapital Data Solutions** | Mirador + AltExchange acquisitions; alts data aggregation + consolidated reporting; post-acquisition integration | **Integrating** |
| **SS&C Accord** | AI/ML alternatives data aggregation for Black Diamond ecosystem | **Operational** |
| **Canoe Intelligence** | AI-first platform-agnostic alts extraction; 44K+ fund database; 500+ firms | **Mature standalone** |

## ADX Architecture Reference

- **Infrastructure:** AWS (hosting) + Databricks (lakehouse, Unity Catalog, MLflow, Agent Bricks)
- **Data model:** Financial Graph (graph-based: nodes=entities, edges=ownership, paths=computational unit)
- **Data pipeline:** Medallion architecture (bronze=raw ingestion, silver=normalized/validated, gold=analytics-ready)
- **AI layer:** Addison (native AI) plus client-owned custom models on the governed data foundation
- **Metrics:** 60% cost reduction ($2M+ savings), 5x pipeline delivery speed
- **Key quote:** "By the end of this year, we will not be writing any code by hand within Addepar — it will all be agents." — Bob Pisani, CTO

## Implications for WealthForge

1. **Consider a "Planning Data Exchange" (PDX)** — Productize WealthForge's planning engine, Monte Carlo, tax optimization, and household graph infrastructure as a consumable data product for enterprise clients. This would enable enterprise partners to embed planning intelligence into their existing platforms via governed APIs.

2. **Medallion architecture applies to planning data** — Bronze: raw planning inputs (imports, aggregation feeds). Silver: normalized entity/goal/holding structures with validation. Gold: analytics-ready projections, scenarios, and optimization outputs.

3. **ADX integration adapter** — Build a bidirectional adapter so WealthForge can participate in Addepar's managed data environment, consuming portfolio data and contributing planning intelligence.

4. **Data-as-a-product analytics** — Package anonymized planning data (scenario patterns, tax outcome benchmarks, goal achievement trends) as premium data products, analogous to Addepar's Private Fund Benchmarks.

## Discovery Context

This reference was created from the Addepar Data Exchange (ADX) deep research (2026-05-15), which covered:
- ADX architecture and infrastructure (Databricks, AWS, Financial Graph, medallion architecture)
- Competitive landscape (iCapital, SS&C Accord, Canoe)
- Productized infrastructure as competitive moat pattern
- Implications for WealthForge's data strategy

Full findings in RESEARCH.md under "Addepar Data Exchange (ADX) — Managed Data Environment Architecture"