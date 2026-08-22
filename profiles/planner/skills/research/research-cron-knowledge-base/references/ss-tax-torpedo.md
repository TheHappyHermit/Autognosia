# SS Tax Torpedo — Mechanics, Optimization, and WealthForge Opportunity

## The Provisional Income Formula

PI = MAGI + Tax-Exempt Interest + 50% × SS Benefits

Where MAGI = AGI − Taxable SS benefits (before SS inclusion).

| Filing Status | 0% Taxable | 50% Phase-In | 85% Phase-In |
|--------------|------------|-------------|-------------|
| Single | PI ≤ $25K | $25K < PI ≤ $34K | PI > $34K |
| MFJ | PI ≤ $32K | $32K < PI ≤ $44K | PI > $44K |
| MFS (lived together) | N/A | N/A | 85% always taxable |

**Thresholds unchanged since 1984 (50% tier) and 1993 (85% tier)** — never indexed for inflation. In 1984 <10% paid tax; by 2026 ~50% pay some tax.

## Effective Marginal Rates (150-185% of bracket)

Each $1 of non-SS income → +$0.85 of previously tax-free SS becomes taxable → taxable income +$1.85.

| Tax Bracket | 50% Phase-In EMR | 85% Phase-In EMR |
|------------|------------------|------------------|
| 10% | 15.0% | 18.5% |
| 12% | 18.0% | 22.2% |
| 22% | 33.0% | **40.7%** (most common) |
| 24% | 36.0% | **44.4%** |
| 32% | 48.0% | **59.2%** |

Under pre-TCJA 25% bracket (not current law): 46.25%. Kiplinger warning: "Low taxes in your 60s are a lullaby masking RMD collision at 73."

## Key Optimization Strategies (beyond "delay to 70")

1. **Bridge Years Roth Conversions (62-72):** Convert Traditional→Roth during low-income window. Roth withdrawals don't count toward PI. Fills brackets below torpedo zone.
2. **QCDs (70½+):** Reduce AGI dollar-for-dollar while satisfying RMDs — simultaneously reduces SS taxation AND IRMAA exposure.
3. **Withdrawal Sequencing:** Roth first + taxable basis + Traditional last (minimizes PI).
4. **Delaying SS to 70:** 8%/yr increase + reduced TDA withdrawal need = lower PI.
5. **Muni bond awareness:** Tax-exempt interest IS included in PI (common mistake).

## OBBBA Senior Deduction Interaction (2025-2028)

$6K/person ($12K MFJ) temporary deduction phases out $150K-$250K MAGI. Triple-interaction zone at $150K-$250K: SS fully taxable + deduction phaseout + IRMAA Tier 1 ($218K) = 55%+ effective marginal rate.

## State Taxation — 8 States in 2026

CO ($75K AGI exemption), CT ($100K MFJ exemption), MN, MT, NM, RI ($108K MFJ), UT, VT. West Virginia, Nebraska, Kansas, Missouri, North Dakota recently eliminated. **No major planning platform has state-by-state SS tax modeling.**

## MFS Trap

Married Filing Separately + lived together at any point = automatic 85% SS inclusion regardless of income. Most software assumes MFJ — WealthForge gap.

## Legislative Wildcard

You Earned It, You Keep It Act (S.2716) — would fully repeal federal SS taxation. If passed: torpedo eliminated, Roth conversions less valuable, claiming age math changes. Planning engine should support toggleable scenario mode.

## Sources

- Reichenstein & Meyer, FPA Journal Jul 2018 (foundational)
- Reichenstein, FPA Journal Sep 2021 ($1M portfolio case study)
- Kitces.com, Mar 2013 (foundational reference)
- Tax Foundation 2026 TCJA expiration bracket analysis
- Kiplinger "Don't Let Low Tax Rates Lull You" (2026)
- Pacific Life OBBBA senior deduction mechanics (Sep 2025)
- Chris Reddick FP OBBBA-enhanced planning
- CountryTaxCalc 2026 SS tax planning guide
- Business Insider 2026 state SS tax map
- Hartford Funds OBBBA SS deduction analysis
- Congress.gov S.2716 You Earned It, You Keep It Act
- SSA Research Note #12
