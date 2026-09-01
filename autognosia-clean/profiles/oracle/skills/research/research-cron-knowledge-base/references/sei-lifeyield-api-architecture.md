# SEI LifeYield — API Architecture Reference

> Condensed knowledge bank from WealthForge deep research (2026-05-15). SEI LifeYield provides the industry's first API library for Unified Managed Household (UMH) capabilities via an overlay architecture.

## Corporate Status

- **Pre-2024:** Independent API-based SaaS provider, Boston-based
- **Dec 2024:** Acquired by SEI (NASDAQ: SEIC) for undisclosed sum
- **Post-acquisition:** SEI LifeYield, LLC — an unregulated subsidiary of SEI Investments Company
- **Strategic implication:** No longer a platform-agnostic independent provider. SEI is bundling into SEI Wealth Platform. Off-platform distribution announced but strategic priority is SEI's own platform.

## Architecture Pattern: Stateless API Overlay

- Not a platform — sits on TOP of existing systems (no rip-and-replace)
- Stateless REST APIs — each module can work independently or as a full suite
- Two deployment modes: out-of-box UI (immediate) or embedded API (enterprise integration)
- Built as SaaS pre-acquisition, now being bundled into SEI Wealth Platform

## The Six API Modules

### 1. Asset Location API
- Scans all household accounts, recommends optimal tax location for every asset
- **Taxficient Score (0-100):** proprietary metric measuring household tax efficiency
  - Industry average: 52/100
  - Post-optimization benchmark: 70+
  - Dollar translation: $1.2M household → $80K (10yr) / $155K (15yr) / $270K (20yr) gain
- Provides step-by-step improvement blueprint alongside score

### 2. Multi-Account Rebalancing API
- Operates alongside existing rebalancing tech (overlay, not replacement)
- Tracks: after-tax returns, location scores, portfolio drift, realized gain/loss, implementation cost
- Cross-account tax harvesting integration

### 3. Tax-Smart Withdrawals API
- Executes optimized withdrawals by selling mislocated assets first
- Handles hybrid scenarios: single/multiple accounts, mixed account types (taxable/tax-deferred/tax-free)
- Identifies TLH opportunities during withdrawal workflow
- Minimizes portfolio drift during cash raising

### 4. Tax Harvesting API
- Scans all taxable and non-taxable accounts
- Can work standalone or integrated with rebalancing/withdrawal APIs

### 5. Social Security+ API
- Real-time scenario modeling for optimal filing strategy
- Handles: individual, spousal, survivor, divorced-spouse scenarios
- Visual "Income Layers" showing SS coordinated with other retirement income
- Generates client-ready SSA filing instructions
- Identifies income gaps for annuity/insurance product positioning

### 6. Retirement Income Sourcing API
- Most comprehensive module — hyper-personalized decumulation plans down to security level
- Calculates: state/federal tax impact, SS taxation, Medicare/IRMAA, personal exemptions
- Stateless API with customizable capital market assumptions & simulation trials
- "The only automated, personalized, and scalable retirement income solution"

### Bonus: Tax-Smart Transitions
- Multi-account, multi-period transitions to target allocations
- Evaluates net ST/LT gains/losses at tax-lot level
- Scenario comparison based on tax budgets and drift

## The Multi-Account Overlay (Umbrella Product)
- Combines all modules into integrated service
- Estimates "lifetime value" of tax-smart practices
- Recommends optimal SS filing + account sequences + withdrawal amounts
- Quantifies basis-point improvement when applied to held-away assets

## Key Metrics & Validation

| Metric | Value | Source |
|--------|-------|--------|
| More retirement income | +33% | EY study ($1M household, age 50→65 retirement) |
| Lower tax burden | −40% | EY study |
| Higher bequests | +45% | EY study |
| Annual return improvement (asset location) | +52 bps | Morningstar |
| Annual income improvement | +54 bps | Morningstar |
| Average Taxficient Score | 52/100 | LifeYield database (millions of accounts) |
| Optimized Taxficient Score | 70+ | Post-LifeYield optimization |

## Enterprise Clients & Integrations

- Morgan Stanley Wealth Management (Jed Finn endorsement)
- SS&C Advent Black Diamond Wealth Platform (integration since 2018)
- SEI Wealth Platform (2022 partnership → acquisition)
- 80,000+ advisors reached through enterprise partners
- Largest financial institutions globally

## Comparison with Smartleaf

| Dimension | SEI LifeYield | Smartleaf |
|-----------|---------------|-----------|
| Focus | Household tax optimization + retirement income | Continuous rebalancing automation |
| Architecture | Stateless REST overlay APIs | API-first (deep rebalancing engine) |
| Key metric | Taxficient Score 0-100 | 99.365% automation rate, 2.72% tax alpha |
| Withdrawal engine | Native (Tax-Smart Withdrawals) | None |
| Retirement income | Retirement Income Sourcing, Social Security+ | None |
| Asset location | Proprietary algorithm + scoring | Cost-benefit unified scoring (CHOMPPN) |
| Corporate status | Acquired by SEI (Dec 2024) | Independent |
| They are complementary, not competitive | | |

## Key Lessons for Planning Platforms

1. **APIs as the integration pattern:** LifeYield validated that the "overlay API" is the right way to embed UMH into existing platforms without rip-and-replace
2. **Single-number metric works:** The Taxficient Score (0-100) is the most successful advisor engagement metric — benchmark anchoring + dollar translation + improvement blueprint
3. **6-module catalog is the right scope:** Not too many, not too few — each module independently useful, full suite creates stickiness
4. **EY validation is critical:** Independent research firm validation (not vendor-created) gives the value proposition credibility
5. **Acquisition changes everything:** Once acquired, a platform-agnostic API becomes a competitive asset — plan for self-sufficiency
