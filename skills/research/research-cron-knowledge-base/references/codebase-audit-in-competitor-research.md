# Codebase Audit as Part of Competitor Research

When researching a competitive feature or product, don't just read marketing pages — **also check what your own project already has built.** This reveals the real gap: what's missing vs. what exists but isn't surfaced.

## The Pattern

### Step 1: Search the codebase for the feature domain

```python
from hermes_tools import search_files
search_files(pattern="rebalanc", path="/path/to/project", file_glob="*.py", output_mode="files_only")
```

This finds every file that touches the feature. Sort by module/agent/service directory to see the architecture.

### Step 2: Inventory the files

Read key files — don't need to read every line. Focus on:
- **Class/function signatures** (what's the API?)
- **Module docstrings** (what's the intended purpose?)
- **Config enums** (what modes/types are defined?)
- **Agent pipeline** (what's the data flow between components?)

```python
# Quick inventory: read first 100 lines of each key file to understand structure
from hermes_tools import read_file
read_file("/path/to/engine.py", limit=100)
```

### Step 3: Map the architecture

Build a mental (or written) table:
| Agent/Module | File | What it does | Competitor equivalent | Gap? |
|---|---|---|---|---|
| DriftChecker | drift_checker.py | Scans portfolios for drift breaches | Quantum drift monitoring | Partial |
| RebalanceProposer | rebalance_proposer.py | Assembles trade proposals | Quantum trade assembly | Partial |

### Step 4: Identify gaps by comparing against competitor taxonomy

After reconstructing the competitor's feature taxonomy (see `references/competitor-analysis-deep-dive.md`), map each competitor feature to a codebase component:

- **Exact match** — WealthForge has a direct equivalent
- **Partial match** — WealthForge covers the concept differently (e.g., agent-based vs. monolithic)
- **Gap** — WealthForge doesn't have this at all
- **Structural advantage** — WealthForge's approach is architecturally better (e.g., modular agents vs. monolithic engine)

### Step 5: Assess gap severity

Not all gaps are equal. Classify each:
- **UX gap** — The logic exists but isn't surfaced as a user-selectable option
- **Orchestration gap** — The building blocks exist but aren't composed into the right workflow
- **Missing computation** — The core algorithmic logic doesn't exist
- **Architectural gap** — Would require a new subsystem or service

Most gaps in mature projects are UX or orchestration gaps, not missing computation.

## Real Example (from WealthForge Quantum Rebalancer research)

When researching Advyzon Quantum's "9 rebalancing modes," the codebase audit revealed:

| What competitors do | What WealthForge has | Verdict |
|---|---|---|
| Full portfolio rebalance | RebalancingEngine + DriftChecker | Exact match |
| Tax-loss harvesting | TLHScannerAgent + TaxLotSelector | Exact match (agent-based) |
| Wash sale prevention | WashSaleDetector | Exact match |
| Location optimization | HouseholdRebalancer + AssetLocationOptimizer | Exact match |
| New money allocation | NewMoneyAllocator | Exact match |
| Proposal review | ProposalReviewer | Exact match |
| NLQ command parsing | NLQIntentParser | Exact match |
| Sleeve-level rebalancing | ❌ Not found | Gap |
| Tactical security swaps | ❌ Not found | Gap |
| Cash management rebalancing | ❌ Not found | Gap |
| Continuous monitoring | ❌ Event-driven only | Gap |
| Workflow automation layer | ❌ Not found | Gap |
| Rebalancing dashboard UI | ❌ Not found | Gap |
| Model marketplace | ❌ Not found | Gap |

**Key insight:** 7 of 11 gaps were UX/orchestration gaps (logic exists but needs surfacing/connecting), not missing computation. The agent architecture is structurally superior to monolithic competitors — it just needs the orchestration layer to be built.

## Step 6: Add effort estimation to gap analysis

Not all gaps are equally hard to close. After identifying gaps, classify each by estimated effort:

| Gap | Solution/Industry Reference | Current Status | Effort to Close |
|-----|---------------------------|----------------|-----------------|
| Cross-account TLH coordination | Orion UMH tax overlay coordinates TLH across household taxable accounts | TLH agent works per-account only | **Medium** |
| Household-level compliance monitoring | Compliance should evaluate risk at household level, not per-account | Account-level only | **High** (architectural) |
| AI-powered statement analysis | Orion: AI-powered custodian statement parsing | Not built | **High** (new capability) |
| Values-based investing at household level | ESG/values screens across all household accounts | Not built | **Low-Medium** |
| Quantified tax alpha reporting | SEI LifeYield: dollar-value tax savings per strategy | Partial | **Low-Medium** |

Effort levels:
- **Low** — Extends an existing agent/service with new parameters/logic, no new infrastructure
- **Low-Medium** — New agent or extension reusing existing data models and infrastructure
- **Medium** — New logic + integration with 2+ existing systems
- **High** — New subsystem, new external integration, or architectural change to core compliance/risk layer
- **Very High** — New regulatory approvals, custodial partnerships, or years-long build

This effort assessment is critical for roadmap prioritization — a gap rated "Medium" can often be addressed in a single sprint, while "High" gaps may drive the entire quarter's architecture roadmap.

## Real Examples

### Example 1: WealthForge Quantum Rebalancer research
When researching Advyzon Quantum's "9 rebalancing modes," the codebase audit revealed:

| What competitors do | What WealthForge has | Verdict |
|---|---|---|
| Full portfolio rebalance | RebalancingEngine + DriftChecker | Exact match |
| Tax-loss harvesting | TLHScannerAgent + TaxLotSelector | Exact match (agent-based) |
| Wash sale prevention | WashSaleDetector | Exact match |
| Location optimization | HouseholdRebalancer + AssetLocationOptimizer | Exact match |
| New money allocation | NewMoneyAllocator | Exact match |
| Proposal review | ProposalReviewer | Exact match |
| NLQ command parsing | NLQIntentParser | Exact match |
| Sleeve-level rebalancing | ❌ Not found | Gap |
| Tactical security swaps | ❌ Not found | Gap |
| Cash management rebalancing | ❌ Not found | Gap |
| Continuous monitoring | ❌ Event-driven only | Gap |
| Workflow automation layer | ❌ Not found | Gap |
| Rebalancing dashboard UI | ❌ Not found | Gap |
| Model marketplace | ❌ Not found | Gap |

**Key insight:** 7 of 11 gaps were UX/orchestration gaps (logic exists but needs surfacing/connecting), not missing computation. The agent architecture is structurally superior to monolithic competitors — it just needs the orchestration layer to be built.

### Example 2: WealthForge Orion UMH research
When researching Orion's Unified Managed Household capabilities, the codebase audit revealed a more nuanced pattern with bimodal effort distribution:

| Gap | Orion/Industry Solution | WealthForge Status | Effort |
|-----|----------------------|-------------------|--------|
| Unified cross-account TLH | Orion tax overlay coordinates TLH across household taxable accounts | TLHScannerAgent works per-account | **Medium** |
| Cross-account wash sale coordination | Orion prevents wash sales across all household accounts | WashSaleDetector has multi-account scope but not household-coordinated | **Low-Medium** |
| AI-powered statement analysis | Orion: AI-powered custodian statement parsing | No equivalent | **High** |
| Household-level compliance monitoring | Risk evaluated at household level (Datos Insights prerequisite) | Account-level compliance only | **High** (architectural) |
| Household tax budget optimization | Annual gain/loss budgets tracked across household | No cross-account gain budget tracking | **Medium** |
| Held-away retirement account integration | Orion Pontera: 401(k)/403(b) inclusion | Outside asset model exists but no custodial integration | **High** |
| Quantified tax alpha reporting | SEI LifeYield: $185K Social Security quantification, bps saved | Estimated savings logged but no client-facing narrative | **Low-Medium** |
| Values-based investing at household level | ESG screens applied at household level | Not built | **Low-Medium** |

**Key insight:** ~60% of gaps were Medium-or-easier (extending existing agents), ~40% were High (architectural changes). The #1 architectural prerequisite (household-level compliance monitoring) was also the highest-effort gap — meaning it should drive the roadmap timeline. Effort assessment transforms a flat feature checklist into a sequenced build plan.

## When to Skip

Don't do a codebase audit when:
- You're researching a domain that's clearly not in the project scope (e.g., researching estate planning for a portfolio management app)
- The project is pre-MVP and has no code to audit
- You're already confident from prior work that the feature doesn't exist

## Pre-requisites

- Need file system access to the project directory
- Know the project structure (at minimum: which directories hold domain logic vs. UI vs. config)
- Have run `search_files` at least once to establish the file landscape
