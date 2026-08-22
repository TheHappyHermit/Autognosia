# Bridge Years Roth Conversion Optimization — Condensed Reference

**Domain:** Multi-year Roth conversion strategy optimization for the retirement gap window (ages 62-72/75).

## The Bridge Years Window

The period between earned-income end and RMD onset (typically ages 62-73 for those born 1951-1959; 62-75 for born 1960+). During this window:
- **No earned income** — taxable income is largely controllable
- **No RMDs** — full bracket space available
- **Social Security may not start** — clean bracket space before SS tax torpedo
- **IRMAA considerations begin at 63** (2-year lookback: age 63 income → age 65 Medicare premiums)

## The Multi-Constraint Optimization Problem

### Constraint Hierarchy (by age)

| Age | Primary Ceiling Constraint | Secondary Constraint |
|-----|---------------------------|---------------------|
| 55-62 | Federal bracket | ACA cliff ($86,560 MFJ) |
| 63-64 | IRMAA Tier 1 ($218K MFJ) | Federal bracket + ACA cliff |
| 65-69 | IRMAA Tier 1 ($218K) | Federal bracket + OBBBA senior deduction phaseout ($150K-$350K) |
| 70-72 | SS tax torpedo + IRMAA | Federal bracket |
| 73+ | RMD floor forces minimum income | IRMAA + SS torpedo + bracket |

### IRMAA 2026 Brackets (MFJ, Part B + D)

| MAGI Threshold | Annual IRMAA Per Couple |
|---------------|------------------------|
| ≤$218,000 | $0 |
| $218,001 - $274,000 | $2,297 |
| $274,001 - $342,000 | $5,770 |
| $342,001 - $410,000 | $9,240 |
| $410,001 - $749,999 | $12,710 |
| $750,000+ | $13,872 |

**Critical:** IRMAA is a hard cliff, not graduated. $1 over costs $2,297/yr for a couple. Build $2K-$5K safety margin. SSA-44 appeals are NOT available for Roth conversions.

### KEY INSIGHT (Income Lab, 2026): The conversion ceiling is NOT the top of the tax bracket — it is the lower of the bracket ceiling and the IRMAA threshold minus all other income.

**58.7% effective marginal rate case study:** $150K conversion at 63 with $130K other income = $280K MAGI, crossing Tier 1. Last $10K costs $2,400 tax (24%) + $3,473 IRMAA = 58.7% effective.

## Conversion Value by Age Window (Priority Order)

| Priority | Age | Rationale | Max Annual Conversion (MFJ 2026) |
|----------|-----|-----------|----------------------------------|
| 1st | 62-64 | No SS torpedo, no IRMAA lookback yet | ~$133K (12% bracket after $32,200 standard deduction) |
| 2nd | 65-69 | SS torpedo inactive (if SS delayed), IRMAA active | ~$80K-$150K (12-22%, bounded by $218K IRMAA ceiling) |
| 3rd | 70-72 | SS benefits crowd out bracket space | ~$40K-$80K (depends on SS amount) |
| 4th | 73+ | RMDs fill brackets; minimal conversion space | Remaining bracket space after RMD |

## Algorithmic Approaches (Six Identified)

| Approach | Tool | Method | Strength | Weakness |
|----------|------|--------|----------|----------|
| Bracket Iteration | Pralana | Fill marginal tax brackets sequentially | Simple, fast, user-adjustable | Cannot select optimal rate year-by-year (combinatorial explosion) |
| Integrated Optimization | Income Lab Tax Lab | Full-plan multi-year optimization with IRMAA-SS-RMD | IRMAA cliff-aware, client visuals, FULL plan connection | $159/mo, no widow penalty, no ACA integration |
| Consumption Smoothing | MaxiFi | Intertemporal utility maximization | Finds maximized LIFETIME SPENDING, not just minimized taxes | PDF/Excel output only, no advisor workflow |
| Combinatorial Search | RightCapital Solve | 6 withdrawal sequences × 3 asset location × N bracket options | Integrated in comprehensive planning | Same strategy all years, SS as separate module |
| Break-Even Tax Rate | Vanguard BETR | BETR = future tax rate where conversion is neutral | Accounts for funding source, basis, horizon | Single-year only, no multi-year optimizer |
| Tax-Return Projections | Holistiplan Premium | Multi-year projections from processed 1040s | Deep tax accuracy | Not connected to full financial plan |

## Vanguard BETR Framework Details

BETR is sensitive to TAX PAYMENT FUNDING SOURCE:

| Tax Payment Source | BETR at 35% Current Rate |
|-------------------|--------------------------|
| IRA (withdraw to pay) | 35.0% |
| Tax-Efficient Taxable Account | 30.1% |
| Tax-Inefficient Taxable Account | 23.5% |
| Cash (money market/savings) | 14.1% |

**Implication:** For clients with taxable accounts or cash, BETR drops 22-60% below current marginal rate — conversions benefit even at LOWER future rates.

## The SS "Crowding Out" Effect

Provisional Income = AGI + Tax-Exempt Interest + ½ SS Benefits

When SS is claimed, each conversion dollar pushes provisional income, making $0.50-$0.85 of previously untaxed SS benefits taxable. This reduces bracket capacity by 50-85 cents per conversion dollar.

**Practical impact:** Delaying SS to 70 preserves 6+ years of clean conversion bracket space (62-69) worth ~$800K+ in conversion capacity at 12%.

## Widow's Penalty (Survivor's Penalty)

Upon first spouse's death, filing status compresses: MFJ brackets (~$109K wide at 22%) collapse to Single (~$54K wide). The 22% bracket drops from $109,750 wide to $54,875 wide. Standard deduction halves ($32,200→$16,100). IRMAA thresholds also roughly halve.

**Optimization implication:** Aggressive Roth conversions during bridge years reduce the surviving spouse's RMD base and protect them from bracket compression. A small advance: the year of death + 2 following years allow Qualifying Widow(er) filing (preserves MFJ bracket widths temporarily).

## OBBBA Senior Deduction (2025-2028 only)

- $12,000 additional standard deduction for MFJ 65+
- Phases out $150K-$350K MAGI
- Creates larger 0% bracket (~$44,200 MFJ for 65+)
- Phaseout adds ~1.3 pp to effective marginal rate in $150K-$350K range
- Temporary — aggressive conversions during 2025-2028 capture the expanded 0% bracket

## Competitor Gap Matrix

| Capability | Income Lab | RightCapital | MaxiFi | Pralana | Holistiplan | Covisum |
|-----------|-----------|-------------|--------|---------|-------------|---------|
| Multi-Year Optimization | ✅ Full | ✅ Year-by-year | ✅ Lifetime | ✅ Bracket | ⚠️ Projections | ✅ Forward |
| IRMAA Cliff-Aware | ✅ Core | ⚠️ Basic | ✅ | ✅ As limit | ❌ | ✅ Core |
| SS Integration | ✅ 8.60 T3 | ✅ 7.96 T3 | ✅ | ✅ | ❌ | Separate tool |
| Full Plan Connected | ✅ | ✅ | ✅ | ⚠️ Partial | ❌ | ❌ |
| State Tax | ✅ Guide | ⚠️ Limited | ❌ | ❌ | ❌ | ❌ |
| Widow Penalty | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ACA Integration | ❌ | ❌ | ❌ | ✅ FPL limit | ❌ | ❌ |
| Funding Source Opt | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Recommendation for Planning Engine Algorithm

**Primary: Dynamic Programming (DP)** with state variables (year, tIRA balance, Roth balance, taxable balance, cumulative IRMAA MAGI, SS status, filing status). DP naturally handles the time-offset IRMAA constraint.

**Backup: Heuristic Bracket Filling** as fast approximate solver with DP validation.

**Optional: Consumption-Smoothing Objective** as toggleable alternative.

Five-constraint simultaneous optimization (Roth + SS claiming + withdrawal sequencing + RMDs + ACA) remains unsolved by any existing tool — WealthForge opportunity.

## Key Sources

- Income Lab: Roth Conversion Strategy Guide (Fitzpatrick, Mar 2026)
- Income Lab: Roth Conversion and IRMAA Multi-Year Guide (Apr 2026)
- Income Lab: Best Roth Conversion Software 2026 (comparison)
- Vanguard: A BETR Approach to Roth Conversions (Passman, Jul 2025)
- Pralana: Understanding Roth Optimization (forum documentation on algorithmic limitations)
- The Finance Buff: Roth Conversion with SS and Medicare IRMAA (Harry Sit)
- Motley Fool: Roth Conversions, RMDs, and the Tax Torpedo (Mar 2026)