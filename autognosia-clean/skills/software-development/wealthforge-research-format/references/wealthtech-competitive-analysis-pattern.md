# WealthTech Competitive Analysis Pattern

## Why This Exists

Many WealthForge research topics require a structured competitive analysis of wealth management software platforms (PMS, CRM, financial planning, reporting, tax, etc.). Unlike generic technology evaluations, wealthtech competitive analysis requires understanding a specific set of dimensions unique to the wealth management industry: market segmentation by AUM, T3 market share data, pricing model types (per-account, AUM-bps, flat), custodial relationships, advisor sentiment from T3/Kitces/Reddit, and integration depth.

This reference documents the methodology developed during SS-8 (Portfolio Management Software Landscape, 2026-05-17) for analyzing ANY wealth management software category.

## When to Load This

Load when the research topic involves:
- Comparing wealth management software platforms (PMS, CRM, planning, reporting, tax, document management, client portals)
- Analyzing competitive landscape in the RIA/wealthtech ecosystem
- Evaluating build vs partner vs integrate decisions for a software category
- Assessing advisor adoption/retention patterns in wealthtech

Do NOT load for:
- General technology evaluation (use `technology-evaluation` skill)
- Feature-specific competitive landscape (the standard Section 3 of 12-section format handles this)
- Client-side tools comparison (use standard competitive table pattern)

## The 4-Tier Market Segmentation

Wealth management software platforms almost always segment into these four tiers by firm AUM:

| Tier | AUM Range | Characteristics | Pricing | Examples |
|------|-----------|----------------|---------|---------|
| **1. Enterprise** | $5B+ | Multi-custodial, deep portfolio accounting, institutional-grade reporting | $15K-$100K+/yr | Envestnet | Tamarac, Orion Advisor Tech, SS&C Black Diamond, Addepar |
| **2. Mid-Market** | $500M-$5B | All-in-one suites, integrated CRM+PMS+planning but less depth | $6K-$30K/yr | Advyzon, Morningstar Office, AdvisorEngine |
| **3. Modern Custodian-Native** | $100M-$2B | Bundled with custody at disruptive pricing, modern UX | 0.01%/mo or free | Altruist, Schwab iRebal/Portfolio Connect |
| **4. Niche / Specialty** | All sizes | Single-purpose: risk assessment, research, rebalancing, analytics | $3K-$15K/yr | Nitrogen (Riskalyze), YCharts, Kwanti, Smartleaf, Panoramix |

**Research question for each tier:**
- Does this platform's target market overlap with WealthForge's ideal client profile?
- Could WealthForge integrate with this tier, or compete with it?
- Is this tier growing, shrinking, or static? (Check T3 3-year market share trend)

## The 13-Dimension Feature Comparison Matrix

For every wealthtech competitive analysis, evaluate each platform across these dimensions. Use `✅ / ⚠️ / ❌` status indicators per the competitive-table-pattern.

### Core Dimensions (always include):
1. **Portfolio Accounting** — Cost basis, corporate actions, dividends, splits, reconciliation
2. **Performance Reporting** — TWRR, MWRR, benchmark comps, attribution, client-facing reports
3. **Rebalancing** — Model management, drift monitoring, trade generation, tax-aware rebalancing (UMA, tax-lot)
4. **Billing** — AUM-based fee schedules, fee compression, billing reconciliation
5. **CRM** — Contact management, task workflow, activity tracking, integration depth
6. **Financial Planning** — Goal planning, Monte Carlo, tax planning, withdrawal optimization, SS planning
7. **Client Portal** — Self-service dashboards, mobile, document sharing, secure messaging

### Advanced Dimensions (include when relevant):
8. **Tax Optimization** — TLH, Roth conversion analysis, withdrawal sequencing, tax-lot accounting. **Note: This is the #1 gap across ALL PMS platforms.** If the competitive analysis shows anything better than ❌ for ANY platform here, verify with primary sources — many claim tax features that are actually basic calc-only.
9. **AI Features** — Natural language query, AI notetakers, AI rebalancing recommendations, anomaly detection
10. **Open API** — REST API quality, OAuth availability, webhook support, documentation quality, sandbox environment
11. **Mobile** — Advisor-facing mobile app quality, client-facing mobile app
12. **Alternatives Management** — Private equity, real estate, hedge fund data aggregation, entity mapping, illiquid tiering
13. **Ecosystem / Integrations** — Number of pre-built integrations, CRM connectors, custodial feeds, planning software links

### Comparison Matrix Template:

```markdown
| Capability | Platform A | Platform B | Platform C | WealthForge Opportunity |
|------------|-----------|-----------|-----------|------------------------|
| Portfolio Accounting | ✅/⚠️/❌ | ... | ... | 🏆 Build / Partner / Skip |
| Performance Reporting | ✅/⚠️/❌ | ... | ... | 🏆 Build / Partner / Skip |
| Rebalancing | ✅/⚠️/❌ | ... | ... | 🏆 Build / Partner / Skip |
| [Dimension 4] | ... | ... | ... | ... |
| Tax Optimization | ... | ... | ... | 🏆 **HUGE OPPORTUNITY** |
```

**Key rule:** The rightmost column ("WealthForge Opportunity") is NOT optional. Every dimension gets a clear assessment: Build a competitive feature, Partner/integrate with existing providers, or Skip (market too crowded, low differentiation). Mark "HUGE OPPORTUNITY" in **bold** for dimensions where NO major platform provides the capability.

## Advisor Sentiment Synthesis Methodology

Wealthtech competitive analysis must include what advisors ACTUALLY think about each platform — not just vendor marketing claims.

### Source Hierarchy:
1. **T3/Inside Information Survey** (annual, March) — The canonical source. 2,900+ advisor responses across 70 categories. Market share, satisfaction ratings (0-10), "All Star" rankings, open-ended comments. Search for the PDF at t3technologyhub.com. Key metrics: market share %, average user rating, Software All Star status.
2. **Reddit r/CFP** — Real unfiltered advisor sentiment. Search: `site:reddit.com/r/CFP [platform name]`. Look for threads like "Regret [Platform]?" or "Switching from [Platform] to [Platform]".
3. **Kitces.com comments** — Advisor community comments on Kitces AdvisorTech articles provide detailed implementation feedback.
4. **InvestmentNews / WealthManagement.com** — Analyst reviews and comparison articles.
5. **G2 / Capterra** — User reviews with verified usage. Take with grain of salt (selection bias: only unhappy or very happy users review).

### Sentiment Tagging:
After synthesis, tag each platform with all that apply:
- "Powerful but painful" — Strong features, terrible UX
- "Best all-in-one" — Good enough at everything
- "Beautiful but limited" — Best UX, not enough depth for complex needs
- "Outdated but reliable" — Still works, hasn't kept up
- "Best in class at X" — One killer feature, weak elsewhere
- "Growing fast" — Newer platform gaining share
- "Losing share" — Established platform declining

### Sentiment Quote Pattern:
```
**Platform Name** — "Direct quote from advisor source" (r/CFP, [date])
```

## Pricing Model Analysis

Wealthtech pricing falls into distinct models. Classify each platform:

| Model | How It Works | Example | WealthForge Implication |
|-------|-------------|---------|------------------------|
| Per-account ($/mo) | Cost scales with number of client accounts | Advyzon: $6.5K base + $15/account/yr | Easy to undercut |
| AUM bps (%) | Percentage of assets under management | Traditional custodians: 5-30bps | Hard to compare directly |
| Flat/seat/advisor | Per-advisor subscription | YCharts: $3K-$10K/yr | Predictable for firms |
| Tiered by AUM bracket | Different price at $100M/$500M/$1B | Most enterprise PMS | Complex but standard |
| Free/custody-bundled | Free with custody relationship | Schwab iRebal, Altruist One (0.01%/mo) | Hardest to compete with |

**Key insight for WealthForge:** Per-account + intelligence layer pricing (e.g., $X/mo per household for tax optimization features, independent of PMS cost) is the cleanest model because WealthForge doesn't compete with the PMS — it adds value ON TOP of whatever PMS the firm already uses.

## The "What WealthForge Should NOT Build" Anti-Pattern

Every wealthtech competitive analysis MUST produce a clear list of what WealthForge should NOT build. This is as important as what TO build.

### Categories of "Don't Build":

1. **✅ Crowded + Low Differentiation — Skip:** Portfolio accounting, performance reporting, TWRR/MWRR calculation, billing — 50+ vendors already do this well. Building would take 2+ years and produce nothing differentiating.

2. **✅ Network Effect Platforms — Partner:** Custody, CRMs, rebalancing engines — these have network effects (more advisor users → better integrations → harder to leave). Partner via API rather than compete.

3. **❌ Adjacent But Distracting — Defer:** Client portals, document management, e-signatures, reporting PDF generation — important but not core to WealthForge's tax/optimization mission. Partner or integrate.

4. **🏆 True Gaps — BUILD:** Tax optimization, withdrawal sequencing, Roth conversion planning, SS timing optimization, scenario comparison workspaces — the "intelligence layer" that NO existing platform provides.

### Decision Framework Template:

```markdown
| Capability | Gap Exists? | Complexity | Differentiation | Build? |
|-----------|-------------|-----------|----------------|--------|
| Feature A | ❌ 10+ platforms do it | High | Low (me-too) | ❌ SKIP |
| Feature B | ✅ No platform does it | Medium | Very High | 🏆 BUILD |
| Feature C | ✅ Partial support | Low | Medium | ⚠️ PARTNER |
```

## PMS Integration Architecture Pattern

When the competitive analysis involves PMS data integration (reading portfolio data from third-party PMS platforms), follow this canonical architecture:

```
+--- PMS LAYER (3rd Party Platforms) ---+
|  Orion | Tamarac | Addepar | Advyzon  |
+---------------------------------------+
            | (REST API / OAuth)
            v
+--- WEALTHFORGE PMS ADAPTER LAYER -----+
|  PMS-Adapter-[Platform]                |
|  Normalizes: holdings, positions,      |
|  transactions, account model           |
+---------------------------------------+
            |
            v
+--- WEALTHFORGE INTELLIGENCE LAYER ---+
|  Optimization | Analysts | Scenarios  |
+---------------------------------------+
            |
            v
+--- WEALTHFORGE OUTPUT LAYER ---------+
|  Recommendations | Dashboard | Reports |
+---------------------------------------+
```

### Adapter Build Priority Matrix:
When analyzing multiple PMS platforms for integration, produce this matrix:

| PMS | Market Reach | API Quality | Build Difficulty | Value | Priority |
|-----|-------------|-------------|------------------|-------|----------|
| Platform A | #1 share (T3 data) | REST API, documented | Medium | Very High | **P1** |
| Platform B | Largest custody | Limited | Medium | High | **P1** |
| Platform C | Fastest growing | Developer API | Easy | High | **P2** |
| Platform D | UHNW dominant | REST, complex data model | Hard | High | **P2** |
| Platform E | Growing fast | Limited | Easy | Medium | **P3** |
| Platform F | Declining share | Limited | Hard | Low | **P4** |

### Canonical PMS Data Model (for adapter normalization):

```python
@dataclass
class PMSAccount:
    account_id: str
    account_number: str
    account_type: str  # 'INDIVIDUAL', 'JOINT', 'IRA', 'ROTH_IRA', '401K', etc.
    custodian: str     # custodian name
    household_id: str
    advisor_id: str
    tax_status: str    # 'TAXABLE', 'TAX_DEFERRED', 'TAX_FREE'
    registration: str  # Full registration type
    opened_date: date
    closed_date: Optional[date]

@dataclass
class PMSHolding:
    account_id: str
    security_id: str   # CUSIP, ISIN, or internal ID
    ticker: str
    security_name: str
    asset_class: str   # 'EQUITY', 'FIXED_INCOME', 'CASH', 'ALT', etc.
    quantity: Decimal
    cost_basis_total: Decimal
    cost_basis_per_share: Decimal
    market_value: Decimal
    unrealized_gain_loss: Decimal
    lot_level: bool    # Whether tax-lot data is available

@dataclass
class PMSTaxLot:
    account_id: str
    security_id: str
    lot_id: str
    purchase_date: date
    quantity: Decimal
    cost_basis_per_share: Decimal
    total_cost_basis: Decimal
    current_market_value: Decimal
    gain_loss_percent: Decimal
    holding_period: str  # 'SHORT_TERM', 'LONG_TERM'
```

Copy this dataclass structure into any BUILD SPEC that involves PMS data integration.

## Gap Analysis Synthesis Pattern

After completing the comparison matrix, produce a numbered "Gaps Across ALL Platforms" list. Each gap should be specific enough for a product manager to write a user story.

### Format:
```markdown
**Key Gaps Across ALL [Platform Category] Platforms:**
1. **[Gap Name]** — One-sentence description of what no platform does. Why it matters ($-impact or time-savings).
2. **[Gap Name]** — ...
3. **[Gap Name]** — ...
```

### Common Gap Categories in Wealthtech:
- **No optimization** — Platforms calculate but don't optimize (calculate RMD but don't suggest strategies)
- **No auto-detection** — No platform surfaces opportunities without the advisor manually configuring
- **No scenario comparison** — Multi-dimensional "what-if" across tax/withdrawal/risk is universally missing
- **No cross-system intelligence** — Report generation is siloed per platform, no unified intelligence layer
- **No cohort risk awareness** — No platform considers retirement cohort when setting SWR/guardrails
- **No state tax interaction** — Federal-state interaction taxes are universally ignored ($200K ACA-IRMAA-NIIT interaction)

### The Wedge Feature:
After the gap list, explicitly state: **"The single highest-value feature WealthForge can build in this category is [Feature], because [reason]."**

## Red-Team for WealthTech Analysis

When writing Section 10 (RED TEAMING) for a wealthtech competitive analysis topic, include these wealthtech-specific edge cases:

1. **Stale data scenario** — PMS sync failure during critical review period → mitigation: data freshness warnings, scenario block
2. **Multi-PMS conflict** — Same account reported by two platforms → deduplication engine, manual resolution flag
3. **Writeback failure** — Recommendation fails silently on PMS side → polling confirmation, escalation alert
4. **PMS API rate limiting** — Large firm saturates API during sync → adaptive rate limiting, queue-based processing
5. **Data privacy across PMS boundaries** — Client data from two custodians mixed in WealthForge → ephemeral processing model
6. **PMS version incompatibility** — API breaking change takes all connected firms dark → version pinning, staged rollout, rollback procedure
7. **Advisor over-reliance** — Auto-accepted recommendations without fiduciary review → mandatory review gate, compliance audit

## Worked Example
See SS-8 (RESEARCH.md, appended 2026-05-17) for the complete worked example analyzing 11 PMS platforms across all 13 dimensions with advisor sentiment synthesis, build priority matrix, and 7 new subtopics discovered.
