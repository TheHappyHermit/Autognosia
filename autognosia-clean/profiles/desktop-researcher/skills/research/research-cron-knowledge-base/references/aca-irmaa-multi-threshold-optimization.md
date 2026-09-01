# ACA Subsidy Cliffs + IRMAA + Senior Deduction — Multi-Threshold Optimization Reference

**Source:** Deep research session 2026-05-15
**Full findings:** RESEARCH.md under "ACA Subsidy Cliffs vs. IRMAA vs. Tax Bracket Optimization — Multi-Threshold Planning for Early Retirees (50-65)"

## Overview

Early retirees (ages 50-65) face three interacting income-based threshold systems that create effective marginal tax rates exceeding 55%. No existing retirement planning tool simultaneously optimizes across all three. This is WealthForge's differentiator opportunity.

## The Three Threshold Systems

| System | Ages Affected | Constraint Type | Key MFJ Threshold (2026) | $1 Overshoot Cost |
|--------|--------------|-----------------|--------------------------|-------------------|
| ACA Subsidy Cliff | 50-64 (pre-Medicare) | HARD CLIFF | $86,560 (400% FPL, 2-person) | $15K-$25K/yr lost subsidies |
| OBBBA Senior Deduction | 65+ (2025-2028 only) | Gradual phaseout | $150K-$250K (6%/$) | Up to $2,880 extra tax |
| IRMAA | 65+ (life) | HARD CLIFFS | $218K/$274K/$342K/$410K | $2,297-$13,872/yr surcharge |

**Critical interaction:** These apply to *different* age ranges but overlap during ages 65-68. Roth conversions done at 63 affect IRMAA at 65 (2-year lookback). Senior deduction phaseout stacks at $150K-$250K, exactly where IRMAA Tier 1 starts ($218K).

## Key 2026 Data Points

### ACA Subsidy Cliff (OBBBA did NOT extend enhanced credits)
- 2026 FPL (2-person HH): **$21,640** → 400% FPL: **$86,560**
- Below cliff: expected contribution is 9.96% of MAGI (flat at 300-400% FPL)
- Above cliff: 100% unsubsidized premium = $15K-$25K/yr for 64-year-old couples
- The cliff is an ON/OFF switch, not a phaseout
- ACA PTC phase-in adds 10-19% effective marginal rate on top of federal tax

### ACA as Marginal Rate Adder (The Finance Buff data, 2026)

| Income Level (% FPL) | ACA Add-On | Federal Bracket | Combined Rate |
|---------------------|-----------|-----------------|---------------|
| 133-150% | 11.4-13.5% | 10% | 21.4-23.5% |
| 200-250% | 14-17.6% | 12% | 26-29.6% |
| 250-300% | 16-19.1% | 12-22% | 28-41.1% |
| 300-400% | 9.96% (flat) | 22-24% | 31.96-33.96% |
| Over 400% | 0% (CLIFF) | N/A | Cliff is constraint |

### IRMAA 2026 Brackets (Married Filing Jointly)

| Tier | MAGI Range | Annual Surcharge Per Couple |
|------|-----------|----------------------------|
| None | ≤ $218,000 | $0 |
| 1 | $218,001 - $274,000 | $2,297 |
| 2 | $274,001 - $342,000 | $5,770 |
| 3 | $342,001 - $410,000 | $9,240 |
| 4 | $410,001 - $749,999 | $12,710 |
| 5 | ≥ $750,000 | $13,872 |

**Source:** CMS / IRS Rev. Proc. 2025-25. Two-year lookback: 2026 income → 2028 premiums.

### OBBBA Senior Deduction Phaseout (2025-2028)
- Up to $6,000/person ($12,000/couple, both 65+)
- MFJ phaseout: starts at $150K MAGI, fully phased at $250K
- Phaseout rate: **6 cents per dollar** over threshold
- Effective rate adder: ~1.3 pp at 22% bracket
- Stacks on top of IRMAA + SS tax torpedo at $218K-$250K overlap zone

## The Three-Zone Optimization Framework

### Zone 1: Pre-Medicare (Ages 50-64)

**Hardest constraint:** ACA cliff at $86,560 MFJ. This dominates all other planning.

**Optimization strategy:**
1. Minimize or defer Roth conversions (every converted dollar reduces ACA subsidies at 10-19% marginal rate)
2. Maximize HSA contributions ($8,750 family + $1,000 catch-up age 55+ = $9,750) — HSA reduces MAGI dollar-for-dollar
3. Fund living expenses from Roth accounts (tax-free, not counted in MAGI) or taxable account basis (return of capital)
4. Traditional IRA withdrawals should be sized to stay BELOW the $86,560 cliff with a safety margin
5. Self-employed health insurance deduction (above-the-line) reduces MAGI for sole props/LLCs

### Zone 2: Early Medicare Window (Ages 65-73, the "Low-Tax Window")

**Hardest constraint:** IRMAA cliffs at $218K/$274K/$342K/$410K. Senior deduction phaseout also active.

**Optimization strategy:**
1. **Aggressive Roth conversions** — fill federal brackets up to but NOT crossing the next IRMAA tier
2. The conversion ceiling = MIN(tax bracket ceiling, next IRMAA threshold minus $2K-$5K safety margin)
3. **Income Lab's cautionary example:** $150K conversion at 63 on $130K base → $280K MAGI in IRMAA Tier 2 → 58.7% effective marginal rate on last $10K
4. Senior deduction phaseout at $150K-$250K interacts with IRMAA Tier 1 ($218K)

### Zone 3: Post-RMDs (Ages 73+)

**Hardest constraint:** RMD floor makes income largely unavoidable.

**Optimization strategy:**
1. Roth conversions at this stage rarely make sense
2. QCDs (Qualified Charitable Distributions, available from 70.5) can reduce AGI and potentially IRMAA exposure
3. Key is accurate RMD projection so clients understand their inevitable IRMAA costs

## The SS Tax Torpedo Interaction

Social Security taxability creates effective marginal rates of 150-185% of the tax bracket within the provisional income phase-in range (Reichenstein, FPA 2018). For early retirees with SS benefits, the torpedo overlaps with:
- **ACA subsidy phase-in** (~$40K-$86K MFJ): creates ~29% combined marginal rate in 12% bracket
- **IRMAA + senior phaseout** (~$218K-$250K): creates 55%+ combined EMR

**Provisional income formula:** PIA = AGI + tax-exempt interest + 50% of SS benefits. When PIA exceeds $32K (MFJ), up to 50% of SS becomes taxable; over $44K, up to 85%.

## HSA Bridge Concept (Specific Planning Strategy)

A differentiated WealthForge planning workflow:
1. **Accumulation phase:** Maximize HSA contributions while employed; invest for growth
2. **Early retirement (50-64):** Use HSA distributions to pay for ACA premiums and medical expenses
3. **Advantage:** HSA distributions for qualified medical expenses are tax-free AND don't count toward ACA MAGI
4. **Result:** Can keep MAGI well below the $86,560 ACA cliff while using HSA to pay healthcare costs

## Competitive Gap Analysis

| Tool | ACA Cliff | IRMAA | Senior Deduction | SS Torpedo | Simultaneous? |
|------|----------|-------|-----------------|-----------|--------------|
| Income Lab | ❌ | ✅ Best | ❌ | ⚠️ Partial | ❌ |
| RightCapital Solve | ❌ | ⚠️ Partial | ❌ | ❌ | ❌ |
| MaxiFi | ❌ | ⚠️ Partial | ❌ | ✅ Economics | ❌ |
| Pralana | ❌ | ⚠️ Basic | ❌ | ⚠️ Basic | ❌ |
| Covisum Tax Map | ❌ | ✅ EMR only | ❌ | ❌ | ❌ |
| Finance Buff SS | ✅ Only free tool | ❌ | ❌ | ❌ | ❌ |
| Boldin | ❌ | ❌ | ❌ | ❌ | ❌ |

**Zero tools handle all four.** This is WealthForge's multi-threshold optimization opportunity.

## Key Sources

- The Finance Buff (Harry Sit): ACA cliff series, premium tax credit percentages
- Hyperion Financial Planning: ACA cliff case study
- Income Lab (Justin Fitzpatrick): Roth/IRMAA multi-year planning guide
- CMS: 2026 Medicare Parts A & B Premiums and Deductibles
- HHS ASPE: 2026 Federal Poverty Guidelines
- FPA (Reichenstein, July 2018): SS Tax Torpedo research
- IRS Rev. Proc. 2024-35, Rev. Proc. 2025-25: ACA applicable percentages
- Beancount.io / TYS LLP: OBBBA senior deduction phaseout mechanics
