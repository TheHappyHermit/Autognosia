---
name: stacked-marginal-rate-calculator
description: Build the NIIT-IRMAA-AMT combined marginal rate calculator — the only tool that shows a client's TRUE marginal rate including all stealth taxes stacking on one dollar of additional MAGI.
category: mlops
---

# Stacked Marginal Rate Calculator — Build Approach

## When to Use This Skill
When implementing the stacked marginal rate analyzer widget or compute engine. The core function `compute_stacked_marginal_rate()` answers: "If I add $1 to MAGI, what is my true total marginal rate including everything?"

## Key Constants (2026)

### NIIT
- Thresholds: $200K (single/HOH), $250K (MFJ/QSS), $125K (MFS)
- Rate: 3.8% (IRC Sec. 1411)
- NOT indexed for inflation (frozen since 2013)
- Three zones: safe (MAGI < threshold), crossover (MAGI between threshold and threshold+NII => marginal 3.8%), full (MAGI > threshold+NII => all NII taxed but no marginal)

### IRMAA (2026)
- Part B standard: $202.90/mo
- MFJ tiers: ≤$218K (0), $218-274K ($81.20/mo), $274-342K ($202.90/mo), $342-410K ($324.60/mo), $410-750K ($446.30/mo), >$750K ($487/mo)
- Single tiers: ≤$109K, $109-137K, $137-171K, $171-205K, $205-500K, >$500K
- MFS penalty: $109,001 → Tier 4 IMMEDIATELY ($446.30/mo)
- Part D surcharges: $14.50/$37.50/$60.40/$83.30/$91.00 per month per person (same bracket structure)
- Two-year lookback: 2024 income determines 2026 premiums
- CLIFF-BASED: $1 over threshold triggers entire tier surcharge

### AMT (2026)
- Exemption: $87,350 single, $135,650 MFJ
- Phaseout starts: $626K single, $1.25M MFJ
- Rates: 26% (first $239K AMTI), 28% (above)
- Triggers: ISO exercise spread, large SALT deduction (CA/NY/NJ), pass-through depreciation diff
- NIIT adds on TOP of AMT (AMT doesn't replace NIIT)

## Stacking Table (MFJ)
| MAGI | Bracket | NIIT | IRMAA | Note |
|------|---------|------|-------|------|
| $218K | 24% | 0% | 0% | 24% total |
| $219K | 24% | 0% | 19.3%* | 43.3% (IRMAA cliff crossing) |
| $250K | 24% | 0% | 0%** | 24% (below NIIT threshold) |
| $251K | 24% | 3.8% | 0%** | 27.8% (NIIT crossover) |
| $274K | 24% | 3.8% | 0%** | 27.8% |
| $275K | 24% | 3.8% | 19.3%* | 47.1% (IRMAA T1→T2 + NIIT) |

*IRMAA marginal = $3,475/yr tier jump / $1 crossing = 19.3% on that single dollar
**IRMAA is already active at these levels from the prior tier; the marginal rate is triggered at crossings

## Core Algorithm
```python
def compute_stacked_marginal_rate(magi, nii, filing_status, taxable_income, 
                                  is_amt_applicable=False, is_spouse_medicare=True,
                                  state_rate=0.0):
    # 1. Get ordinary marginal bracket rate
    # 2. Compute NIIT marginal (3.8% if in crossover zone, 0% otherwise)
    # 3. Compute IRMAA marginal (cliff-weighted: surcharge_increase / $1 if at boundary, else 0)
    # 4. Compute AMT marginal (26% or 28% if AMT applicable)
    # 5. Sum = total marginal rate
```

## UI Widgets
1. **Stacked Rate Gauge** — Horizontal bar decomposing bracket+NIIT+IRMAA+state+AMT into one rate
2. **MAGI Threshold Map** — Visual line from $0 to $1M+ with all boundaries marked
3. **Multi-Year Timeline** — Stacked rate per year over 30-year projection, color-coded by severity
4. **IRMAA Cliff Warning Card** — Alert when client within $10K of any IRMAA boundary
5. **Roth Conversion Slider** — Live updating stacked rate as conversion amount changes

## Pitfalls
- IRMAA lookback confusion: show BOTH current-year and two-year-lagged rates
- MFS penalty auto-detection: must detect MFS filing status, don't default to single brackets
- AMT is highly complex — default to "not modeled" and let power user opt in
- State tax rate varies dramatically (TX=0%, CA=13.3%+1.1% mental health surtax)
- Part D IRMAA often forgotten (adds $174-$1,092/yr per person)
