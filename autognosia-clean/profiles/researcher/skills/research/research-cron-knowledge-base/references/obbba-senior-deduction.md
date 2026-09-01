# OBBBA Senior Deduction Reference

## Quick Reference

The One Big Beautiful Bill Act (Pub. L. 119-21, July 4, 2025) created a temporary $6,000 deduction per person age 65+ for tax years 2025-2028.

| Parameter | Value |
|-----------|-------|
| Amount per person | $6,000 |
| MFJ both 65+ | $12,000 |
| Claim location | Schedule 1-A (above-the-line) |
| Phaseout start (Single/HOH) | $75,000 MAGI |
| Phaseout start (MFJ) | $150,000 MAGI |
| Phaseout rate | $60/$1,000 excess (6%) |
| Fully phased out (Single) | $175,000 |
| Fully phased out (MFJ) | $250,000 |
| MFS eligibility | Ineligible |
| Available to itemizers | Yes |

## Three-Layer Deduction Stack (MFJ both 65+, 2026)

- Layer 1: Standard deduction — $32,200
- Layer 2: Age add-on (IRC §63(f)) — $1,600/person ($3,200)
- Layer 3: OBBBA senior deduction — $6,000/person ($12,000)
- **Total: $47,400 tax-free income**

## Phaseout Formula

```
Reduction = $60 × (MAGI − Threshold) / $1,000 per eligible person (max $6,000)
Deduction Allowed = max(0, $6,000 − Reduction) per person
```

## Critical Modeling Distinction

**The deduction does NOT reduce MAGI/AGI** (confirmed by Harris Sit, The Finance Buff). It reduces taxable income after the standard/itemized deduction. This means:
- Does NOT reduce provisional income (no impact on SS taxability)
- Does NOT reduce IRMAA lookback MAGI
- Does NOT affect ACA subsidy qualification
- Conversion income that triggers the phaseout DOES affect all of these

## The "Senior Deduction Trap" (Walkner Condon)

Converting $10K in the $150K-$250K MFJ phaseout zone does TWO things simultaneously:
1. Taxes the $10K at marginal rate (e.g., 22%)
2. Phases out $600 of senior deduction ($120 per $1K × 2 spouses)

Hidden cost: ~1.3pp added to effective marginal rate.

## Three-Way Interaction Zone

The $150K-$250K range overlaps with:
- IRMAA Tier 1 ($212K threshold, 2-year lookback)
- SS tax torpedo zone (85% inclusion, 40.7% EMR)

Single conversion dollar can trigger all three constraints simultaneously via overlapping but different income definitions (MAGI for IRMAA/phaseout, provisional income for SS torpedo).

## Key Planning Strategy: "One Big Conversion"

Do one larger conversion that goes entirely through the phaseout zone ($150K-$250K) rather than smaller annual conversions that stop within it. Forgo the deduction entirely in one year, max out the bracket, and ensure full deduction eligibility in future years.

## Temporary Cliff

The deduction expires after December 31, 2028. A planning engine must automatically revert to $0 starting in 2029.

## MFS Ineligibility

MFS filers get ZERO deduction regardless of age. Combined with the MFS automatic 85% SS taxation rule, this creates a "MFS double penalty."
