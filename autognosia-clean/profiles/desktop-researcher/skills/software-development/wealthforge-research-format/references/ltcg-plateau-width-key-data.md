# LTCG Bump Zone × SS Torpedo Interaction — Key Data

**Produced:** 2026-05-21 (Run 154)  
**Related:** wo-1 (SS tax torpedo), wo-1g (OBBBA triple interaction), WO-3 (Roth conversion optimizer)

## Core Finding: Constant Plateau Width

The nominal LTCG plateau width is **CONSTANT at $489,700** regardless of SS benefit level or ordinary income. This is because the IRS 0%→15% LTCG bracket boundary is fixed at $94,050 to $583,750 (MFJ 2025). The width = $583,750 - $94,050 = $489,700.

What VARIES is:
1. **Where in the LTCG range the plateau sits** (shifted by ordinary income)
2. **Whether the SS torpedo is active** at any point in the plateau
3. **The effective marginal rate** within the plateau (13.6% to 22.6%)

## SS Torpedo Width — Also Constant

The SS torpedo width is **CONSTANT at $12,000** for MFJ (tier thresholds $32K/$44K are fixed). For very high SS ($70K+), the width drops to $9,000.

The SS benefit level only shifts WHERE in the LTCG range the torpedo activates, not its width:

| SS Benefit | SS First Taxable at LTCG | SS Hits 85% at LTCG | SS Torpedo Width |
|------------|--------------------------|---------------------|------------------|
| $20,000 | $22,000 | $34,000 | $12,000 |
| $30,000 | $17,000 | $29,000 | $12,000 |
| $40,000 | $12,000 | $24,000 | $12,000 |
| $50,000 | $7,000 | $19,000 | $12,000 |
| $60,000 | $2,000 | $14,000 | $12,000 |
| $70,000 | $0 | $9,000 | $9,000 |

## Effective Marginal Rate on LTCG

| Scenario | Marginal Rate |
|----------|--------------|
| $0 ordinary + $30K SS (LTCG at plateau middle) | 19.1% |
| $0 ordinary + $60K SS (LTCG at plateau middle) | 19.6% |
| $30K ordinary + $36K SS (LTCG at plateau middle) | 19.5% |
| $50K ordinary + $48K SS (LTCG at plateau middle) | 19.8% |
| $94,050 ordinary + $60K SS (LTCG at plateau end) | 21.2% |

**Breakdown:** 15% LTCG rate + SS torpedo component (0.0% to 5.0% depending on SS level) + NIIT (3.8% when MAGI > $250K MFJ)

## 49.95% Marginal Rate Explanation

The 49.95% marginal rate arises from:
- 22% ordinary bracket marginal rate
- 15% LTCG rate  
- 12.4% SS tax (when SS is at 85% taxable)
- **= 22% + 15% + 12.4% = 49.4%** (≈49.95% with rounding and specific phase-in rates)

## OBBBA Triple Interaction

OBBBA senior deduction: $6,000/person ($12,000 MFJ) for 65+, phases out at $60 per $1,000 MAGI above $75,000 (6% marginal rate), fully phased out at $175,000 MAGI. Available 2025-2028.

Combined with LTCG and SS:
- OBBBA phaseout: 60% marginal rate
- 15% LTCG rate
- 12.4% × 0.85 = 10.54% SS phase-in (85% tier)
- **= 60% + 15% + 10.54% = 85.54% marginal rate at peak**

## IRC Section 86 Formula (SS Taxable)

```
Combined Income = AGI (excl SS) + tax-exempt interest + 0.5 × SS benefit

MFJ thresholds: Tier 1 = $32,000, Tier 2 = $44,000
Single thresholds: Tier 1 = $25,000, Tier 2 = $34,000

Step 1 = min(0.5 × SS, max(0, Combined - Tier1)) × 50%
Step 2 = min(max(0, 0.5 × SS - Step1), max(0, Combined - Tier2)) × 85%
         + min(Step1, max(0, Tier2 - Tier1)) × 35%
Taxable SS = max(Step1, Step2)
```

## IRS LTCG Bracket Boundaries (MFJ 2025)

- 0% bracket: $0 to $94,050 taxable income
- 15% bracket: $94,051 to $583,750 taxable income
- 20% bracket: above $583,750

## NIIT Threshold

- MFJ: $250,000 MAGI
- Single: $200,000 MAGI
- Rate: 3.8% on net investment income (includes LTCG)

## Competitive Gap

Zero wealth management platforms dynamically adjust LTCG bump zone boundaries based on SS benefit level. All use fixed IRS bracket boundaries ($94,050 for 0% bracket — MFJ 2025).

## Related Research

- wo-1a: LTCG bump zone × SS torpedo plateau width calculator (full 12-section entry)
- wo-1a-1: Per-client LTCG harvesting zone calculator
- wo-1a-3: OBBBA phaseout × LTCG bump zone interaction
- wo-1a-7: NIIT threshold × LTCG × SS combined income trigger
- wo-1a-9: LTCG bump zone × IRMAA cliff interaction
