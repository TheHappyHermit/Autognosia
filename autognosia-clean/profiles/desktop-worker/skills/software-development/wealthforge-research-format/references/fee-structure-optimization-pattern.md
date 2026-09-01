# Fee Structure Optimization Research Pattern

## When to Use

Apply this pattern when researching RIA fee structures, fee optimization, or fee-related competitive landscape analysis. Covers: AUM-based, tiered AUM, performance-based, fixed/retainer, hourly, and hybrid fee models.

## Core Analytical Framework

Every fee structure research entry MUST analyze across these 4 dimensions:

### 1. Revenue Impact Dimension
- **Annual fee calculation** per client under each fee model
- **Effective rate** (fee / AUM) comparison
- **Revenue stability score** (0-100): how predictable is this revenue?
  - Fixed/retainer: 95 (most stable)
  - AUM/tiered AUM: 85 (scales with market)
  - Hybrid: 78 (moderate)
  - Hourly: 60 (volatile)
  - Performance: 30 (least stable)
- **5-year and 10-year projections** with market growth assumptions
- **Firm-wide revenue impact** when switching clients between models

### 2. Client Impact Dimension
- **Fee as % of return**: does the client get value?
- **Client-side value calculator**: fee vs. services received
- **Client preference alignment**: does the model match client expectations?
- **Fee transparency score**: can the client understand what they're paying?
- **Competitive benchmarking**: is the fee in line with peers?

### 3. Valuation Impact Dimension
- **Firm valuation multiple** by fee structure (Mercer Capital 2025):
  - Fee-only (AUM): 2.1x revenue
  - Fee-based: 1.8x revenue
  - Commission-based: 1.1x revenue
- **PE buyer discount for mixed models**: 10-25% multiple reduction for hybrid fee stacks that can't be cleanly underwritten
- **Weighted multiple** computation for firm-wide fee mix
- **Revenue mix sensitivity**: how does shifting clients between models affect enterprise value?

### 4. Fee Compression Risk Dimension
- **Historical fee rate trend**: is the effective rate declining over time?
- **AUM growth compression**: does AUM growth naturally reduce effective rates?
- **Robo-advisor benchmark pressure**: 0.25% robo rate as competitive floor
- **Client segment vulnerability**: which clients are most at risk of fee compression?
- **Defense strategies**: tiered pricing, breakpoint optimization, value-add service bundling

## Industry Context (Updated 2026-05-23)

- **AUM dominant at 68%** of RIA revenue but declining
- **Retainer/subscription at 39%** (up from 28% in 2021)
- **Hybrid models at 26%** (72% of firms use multiple fee models)
- **Median AUM fee**: 1.00% on first $1M (unchanged since 2009)
- **Avg fee as % of total AUM**: declined from 85bps (2015) to 78bps (2024)
- **54% of advisors** expect ≥90% of revenue from advisory fees by 2026 (Cerulli)

## Competitive Landscape Pattern

When auditing competitors for fee structure features, check:
1. **Fee schedule management** (BillFin, Orion, Advyzon) — execute current fees only
2. **Fee benchmarking** (Schwab, Citywire) — static data only
3. **Revenue analytics** (AdvisorEconomics) — current state analysis only
4. **Valuation data** (Mercer Capital) — static multiples only

**Key finding pattern**: If zero competitors provide X fee optimization capability, flag as "uncontested WealthForge innovation opportunity" with TAM estimate.

## Recommended Widgets (by use case)

| Use Case | Widget | Purpose |
|----------|--------|---------|
| Client comparison | FS-1 Fee Comparison Studio | Side-by-side across all 5 fee models |
| Firm strategy | FS-2 Fee Mix Optimizer | Optimize firm-wide fee mix |
| Risk identification | FS-3 Fee Compression Defense | Flag at-risk clients |
| Client conversation | FS-4 Client-Side Value Calculator | Show fee vs. value received |

## Sources to Include

Always include at minimum: Schwab RIA Benchmarking Study, Mercer Capital RIA Valuation Study, Kitces fee structure research, Cerulli fee trends, and SEC regulatory guidance (Rule 206(4)-2 for performance fees, Marketing Rule for disclosures).

## Cross-References

- `competitive-table-pattern.md` — competitive landscape audit format
- `wealthtech-competitive-analysis-pattern.md` — wealthtech platform comparison
- `agenda-update-patterns.md` — agenda topic discovery and formatting
- `12-section-template.md` — full research entry format
- EXEC-02 (CFO) — fee strategy widget context
- MO-04 (Billing Specialist) — billing system integration
- FA-01 (Advisor) — client communication templates
- BO-06 (Accounting/Finance) — firm-wide financial impact
