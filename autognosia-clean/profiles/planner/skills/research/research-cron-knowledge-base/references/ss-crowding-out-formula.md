# SS Tax Torpedo "Crowding Out" Formula — Quantitative Model for Planning Engine Integration

**Source:** Synthesized from Reichenstein & Meyer (FPA 2018, 2022), QuantCalc, Benefora, Kitces.com, Early Retirement Now, The Finance Buff. Researched 2026-05-15.

## Core Problem

When Social Security benefits are in payment, each dollar of Roth conversion increases provisional income (PI), which causes a portion of SS benefits to become taxable. This effectively "crowds out" available bracket space — each conversion dollar consumes more than $1 of bracket capacity.

## The Provisional Income Formula

```
PI = MAGIpi + Tax-Exempt Interest + ½ × Social Security Benefits
```

where MAGIpi = AGI minus taxable SS benefits (includes IRA withdrawals, pensions, wages, dividends, capital gains, Roth conversion amounts).

## SS Inclusion Tiers (MFJ, unchanged since 1983/1993)

| PI Range | SS Benefits Taxable | Marginal Inclusion Rate |
|----------|-------------------|------------------------|
| Below $32,000 | 0% | x = 1.0 (no SS taxed) |
| $32,000 – $44,000 | Up to 50% | x = 1.50 |
| Above $44,000 | Up to 85% | x = 1.85 |

For Single filers: $25,000 / $34,000 thresholds. Same multiplier logic.

## The Crowding Out Formula (Synthesized)

**Effective Conversion Capacity = B / x**

where:
- **B** = nominal tax bracket width (e.g., $94,300 for 22% MFJ bracket in 2026)
- **x** = SS inclusion multiplier at the margin (1.0, 1.50, or 1.85)

### Numerical Example — $48K SS benefits, MFJ, 22% bracket

**Without SS (pre-claiming years):**
- Full bracket space: $94,300
- Conversion capacity at 22%: $94,300
- No crowding

**With SS ($48K benefits), $20K other income:**
- PI_base = $20,000 + 0.5 × $48,000 = $44,000 (exactly at upper threshold)
- Any additional $1 enters the 85% zone → x = 1.85
- Effective capacity: $94,300 / 1.85 = **$50,973**
- **Crowding out: $43,327 (46% of bracket space lost)**

## The Three-Zone Crowding Model

**Zone 1: Pre-Crowding (PI < threshold_lower)**
- x = 1.0 (no SS taxed)
- EMR = nominal bracket rate
- Full bracket space available

**Zone 2: Partial Crowding (PI in 50% zone)**
- x = 1.50
- EMR = bracket rate × 1.50 (e.g., 12% → 18.0%, 22% → 33.0%)
- Zone width: $12,000 MFJ, $9,000 Single

**Zone 3: Full Crowding (PI > threshold_upper, SS not yet 85% taxed)**
- x = 1.85
- EMR = bracket rate × 1.85 (e.g., 12% → 22.2%, 22% → **40.7%**)
- Continues until the "saturation point" is reached

## The Saturation Point Formula (Where Crowding Ends)

For MFJ:
```
PI_saturation = $44,000 + (0.85 × SS − $6,000) / 0.85
```

Above this PI, 85% of SS is already taxable — additional conversion dollars face normal marginal rates (x = 1.0 again). This creates the "beyond the torpedo" strategy from Reichenstein & Meyer.

## Effective Marginal Rate (EMR) Table

| Nominal Bracket | In 50% Tier (×1.50) | In 85% Tier (×1.85) |
|----------------|---------------------|---------------------|
| 10% | 15.0% | 18.5% |
| 12% | 18.0% | 22.2% |
| 22% | 33.0% | **40.7%** |
| 24% | 36.0% | 44.4% |

## The "First-Dollar Step Cost" Insight

The marginal rate on the FIRST dollar of conversion post-SS is the HIGHEST (because it triggers SS inclusion at the margin). But once enough is converted to reach the saturation point, subsequent dollars face normal rates.

**The optimal strategy is often binary:** convert NOTHING or enough to pass THROUGH the entire torpedo zone to saturation. Small token conversions are the worst of both worlds — they pay high effective rates without reaching the point where crowding ends.

## Strategic Implications

1. **Pre-SS years (62-69) are ~1.85x more valuable for conversions** than post-SS years
2. **Convert nothing OR enough to reach saturation** — small conversions are a trap
3. **SS delay extends the pre-SS window** — each year of delay = one more year of full bracket space
4. **The "Effective Bracket Compression Ratio" (EBR)** is a potential differentiated metric for planning tools — a single number showing how much SS reduces conversion capacity
5. **State-level SS taxation** (8 states: CO, CT, MN, MT, NM, RI, UT, VT) amplifies the crowding effect by adding 5-10% to the EMR

## Planning Engine Integration Requirements

The crowding out model requires:
- **Provisional income calculator** (PI = MAGIpi + exempt interest + ½ SS)
- **SS inclusion function** (the three-zone piecewise formula)
- **Effective bracket compression function** (EMR = bracket_rate × x)
- **Multi-year dynamic projection** — compression ratio changes each year as IRA is drawn down
- **Saturation point detection** — signals where crowding ends

## Key Sources

- Reichenstein & Meyer, "Understanding the Tax Torpedo" (FPA Journal, July 2018)
- Reichenstein & Meyer, "Tax-Efficient Withdrawal Strategies for Five Groups" (FPA Journal, July 2022)
- QuantCalc Tax Torpedo Calculator: https://quantcalc.app/tax-torpedo/
- Benefora SS Tax Torpedo Guide (Apr 2026): https://www.benefora.org/articles/social-security-tax-torpedo
- Kitces.com, "Why The Value Of A Roth Conversion Is Calculated Using (True) Marginal Tax Rates" (Oct 2022)
- Early Retirement Now, "Taxation of Social Security: The Tax Torpedo & Roth Conversion Tightrope" (2019)
