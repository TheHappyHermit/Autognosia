# 2026 IRMAA Bracket Reference Data

## Source
Full research entry: `RESEARCH.md` — "RMD × IRMAA Brackets Interaction Engine" (2026-05-17, Run 102)
Primary source: CMS Fact Sheet Nov 2025, Kiplinger Nov 2025/May 2026, Income Lab Mar 2026

## Core Rule
IRMAA = Income-Related Monthly Adjustment Amount on Medicare Part B & Part D premiums.
- **Two-year lookback:** 2026 premiums determined by 2024 MAGI (tax return filed in 2025).
- **Cliffs, not gradients:** $1 over a threshold triggers the FULL surcharge for the entire year.
- **Per-person surcharge:** Each Medicare-enrolled individual pays their own surcharge independently.
- **SSA-44 appeals** available for life-changing events (retirement, death of spouse, work reduction). 83% never file.
- **Standard Part B premium (2026):** $202.90/mo per person (no IRMAA = this is all you pay).
- **Standard Part D premium (2026, avg):** ~$38.99/mo but varies by plan — IRMAA surcharge is added regardless.

## 2026 IRMAA Bracket Tables

### Single Filers (also used for Married Filing Separately — with a trap at high tiers)

| Tier | MAGI Range | Part B Surcharge/mo | Part D Surcharge/mo | Total/mo/Person | Total/yr/Person |
|------|-----------|-------------------|-------------------|----------------|----------------|
| 0 | $0 — $109,000 | $0 | $0 | $0 | $0 |
| 1 | $109,000 — $138,000 | $81.20 | $14.50 | $95.70 | $1,148.40 |
| 2 | $138,000 — $184,000 | $204.20 | $37.30 | $241.50 | $2,898.00 |
| 3 | $184,000 — $278,000 | $326.00 | $60.00 | $386.00 | $4,632.00 |
| 4 | $278,000 — $500,000 | $408.70 | $74.70 | $483.40 | $5,800.80 |
| 5 | $500,000+ | $487.00 | $91.00 | $578.00 | $6,936.00 |

### Married Filing Jointly (Both on Medicare)

| Tier | MAGI Range | Per-Person/mo | Couple/mo | Couple/yr |
|------|-----------|--------------|----------|----------|
| 0 | $0 — $218,000 | $0 | $0 | $0 |
| 1 | $218,000 — $276,000 | $95.70 | $191.40 | $2,296.80 |
| 2 | $276,000 — $368,000 | $241.50 | $483.00 | $5,796.00 |
| 3 | $368,000 — $556,000 | $386.00 | $772.00 | $9,264.00 |
| 4 | $556,000 — $750,000 | $483.40 | $966.80 | $11,601.60 |
| 5 | $750,000+ | $578.00 | $1,156.00 | $13,872.00 |

### Married Filing Separately (Asymmetric Compression Trap)

MFS tiers match Single EXCEPT Tier 4 and Tier 5 thresholds:

| Tier | MAGI Range | Note |
|------|-----------|------|
| 0-3 | Same as Single | Same thresholds |
| 4 | $278,000 — **$391,000** | NOT $500K (Single's top) |
| 5 | **$391,000+** | NOT $500K+ |

**Consequence:** A couple with $400K each ($800K total) filing MFS hits Tier 5 ($1,156/mo = $13,872/yr for both).
Same couple filing MFJ with $800K combined stays in Tier 4 ($966.80/mo = $11,601.60/yr).
**MFS penalty at this income: $2,270.40/year.**

## Key Derived Values

### Annual Couple Cost by Tier (both on Medicare)
- Tier 0→1 crossing: $2,296.80/yr (just $1 over $218K triggers this)
- Tier 1→2 crossing: $3,499.20/yr increment (total = $5,796.00)
- Tier 2→3 crossing: $3,468.00/yr increment (total = $9,264.00)
- Tier 3→4 crossing: $2,337.60/yr increment (total = $11,601.60)
- Tier 4→5 crossing: $2,270.40/yr increment (total = $13,872.00)

### 2025→2026 Changes
- Part B standard premium: $185.00 → $202.90 (+9.7%)
- IRMAA surcharge dollars: ~9% increase across most tiers
- Threshold indexation: ~3% (CPI-linked)
- Key tension: surcharge dollars grow FASTER than thresholds, making IRMAA more expensive even after inflation adjustment

## Core Formulas

```
annual_irmaa_for_individual = (part_b_surcharge + part_d_surcharge) * 12
annual_irmaa_for_household = annual_irmaa_for_individual × medicare_enrollees

magi_for_irmaa = AGI + tax_exempt_interest + foreign_earned_exclusion
  (includes: Roth conversions, taxable SS, traditional IRA withdrawals, capital gains, dividends)
  (excludes: pre-tax retirement contributions, QCDs)

irmaa_tier = lookup(magi, filing_status)  # 0-5
is_cliff_crossed = irmaa_tier(magi) != irmaa_tier(magi - 1)

effective_marginal_rate_on_rmd = (federal_tax + irmaa_increment) / rmd_amount
  # Can exceed 60% when crossing a cliff

qcd_irmaa_roi = irmaa_savings / qcd_amount × 100
  # Typically 10-15% for crossing Tier 0↔1
```

## Cross-References to WealthForge Features
- **RMD-IRMAA Crossover Widget (IR-1):** Uses these bracket values for dual-line chart
- **Two-Year Lookback Timeline (IR-2):** Connects tax return year to premium year using these thresholds
- **QCD Hedge Calculator (IR-3):** QCD amount → reduced MAGI → recompute IRMAA tier → savings
- **Roth Conversion Tradeoff (IR-4):** Conversion amount → increased MAGI → recompute tier → two-year surcharge cost
- **Marginal Rate Signpost Chart (sc-4):** IRMAA bracket overlays on marginal rate visualization
- **SSA-44 Appeal Generator (IR-7):** Alternative income reduces IRMAA with these same brackets
- **Stacked Rate Calculator (smr-1 through smr-7):** IRMAA as one component of combined marginal rate
- **Widow's Penalty Analyzer (wp-1 through wp-7):** Single thresholds vs MFJ thresholds for survivor analysis
