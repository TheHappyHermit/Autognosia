# LTCG Harvesting Key Data — WealthForge Research Quick Reference

## 2026 Long-Term Capital Gains Tax Brackets

### Federal LTCG Rates
| Taxable Income (Single) | Taxable Income (MFJ) | LTCG Rate |
|------------------------|---------------------|-----------|
| Up to $49,450 | Up to $98,900 | 0% |
| $49,451 – $545,050 | $98,901 – $600,000 | 15% |
| Above $545,050 | Above $600,000 | 20% |

*Source: Tax Foundation 2026 brackets, Kiplinger 2025-2026 rates, Fidelity 2026 data. 2.3% inflation adjustment over 2025.*

### NIIT Thresholds (3.8% surtax on ALL LTCG, not just excess)
| Filing Status | NIIT Threshold |
|--------------|----------------|
| Single | $200,000 |
| MFJ | $250,000 |
| MFS | $125,000 |

*Source: IRC §1411. Note: NIIT applies to ALL LTCG when MAGI exceeds threshold, not just the excess portion. This is the "NIIT cliff" — the marginal cost of the last dollar of LTCG jumps from 15% to 18.8%.*

### LTCG × SS Taxation (IRC §86)
| Filing Status | 50% Taxability Threshold | 85% Taxability Threshold |
|--------------|------------------------|------------------------|
| Single | $25,000 | $34,000 |
| MFJ | $32,000 | $44,000 |
| MFS | $0 (all taxable) | $0 |

### State Tax Treatment (Key Patterns)
- **9 states exempt ALL capital gains**: AK, FL, NV, SD, TN, TX, WA (until 2030), WY, NH (until 2027)
- **13 states tax LTCG at reduced rates**: CA (13.3%), NY (10.9%), MA (12%), IL (4.95%), PA (0.99%)
- **28 states tax LTCG at ordinary income rates**
- **12 states have NO income tax**: AK, FL, NV, SD, TN, TX, WY, NH (until 2027), WA (until 2030)
- **CA state tax cliff**: $285K MFJ threshold for top rate — harvest above this triggers 13.3% on entire LTCG

## Key IRC Sections
- **IRC §1(h)**: LTCG tax rate provisions (0%/15%/20%)
- **IRC §1250**: Unrecaptured depreciation — max 25% rate
- **IRC §1411**: NIIT provisions (3.8% on net investment income)
- **IRC §1091**: Wash sale rule (30-day lookback before/after)
- **IRC §1014**: Death benefit step-up in basis (eliminates all LTCG at death)
- **IRC §1223**: Holding period requirements (>1 year for LTCG)

## 0% Bracket Capacity Formula
```
remaining_0_pct = max(0, bracket_ceiling - ordinary_income - taxable_ss)
```
Where:
- `bracket_ceiling` = $49,450 (single) or $98,900 (MFJ) for 2026
- `ordinary_income` = SS benefits + pension + wages + taxable interest + dividends
- `taxable_ss` = computed via IRC §86 formula (up to 85% of SS benefits)

**Capacity ranges**: $0 (near NIIT threshold) to $98,900 (empty nest, no SS).

## Tax Alpha Research (Markovitz & Pfau, SSRN)
- Tax-loss harvesting yields **1.10% annual tax alpha** from 1926-2018
- Drops to **0.85% annual** when wash sale constraints are modeled
- Source: "An Empirical Evaluation of Tax-Loss Harvesting Alpha" (SSRN abstract_id=3351382)

## Competitive Landscape (Asset-Level LTCG Prioritization)
- **Holistiplan** ($499+/yr): Strongest tax planning but operates at AGGREGATE level only. Says "harvest $15K" but not "harvest from Fund A, not Fund B."
- **RightCapital** (Kitces 8.7/10 tax rating): Basic TLH only. No LTCG optimization.
- **eMoney**: No dedicated LTCG module.
- **Income Lab**: Retirement income specialist. No tax optimization beyond Roth conversion.
- **Orion**: Portfolio management. No planning-level tax optimization.
- **Vanguard Tax Alpha Calculator**: Provides TLH alpha estimates but no asset-level prioritization.
- **Betterment**: Internal asset location methodology (tax efficiency ranking) but not a client-facing tool.
- **Zero platforms provide asset-level LTCG harvesting prioritization** — pure WealthForge-native innovation.

## Research Patterns
- **0% bracket harvesting** = "free step-up in basis" — permanently eliminates future tax on gains
- **NIIT cliff** is the most dangerous trap: 3.8% applies to ALL LTCG when MAGI crosses threshold
- **State tax cliffs** (CA $285K MFJ) can create unexpected liability even when federal rate is 0%
- **Death benefit step-up** (IRC §1014) reduces harvest urgency for high-mortality clients
- **Wash sale cascade** risk: recommended harvests may create wash sales among themselves

## Key Sources
1. Kitces.com — "Mechanics Of The 0% Long-Term Capital Gains Rate"
2. Kitces.com — "Tax Bracket Filling in Early Retirement"
3. Markovitz & Pfau, SSRN — "An Empirical Evaluation of Tax-Loss Harvesting Alpha"
4. Vanguard Tax Alpha Calculator
5. Betterment Asset Location Methodology
6. Holistiplan (competitive benchmark)
7. RightCapital (Kitces 8.7/10 tax rating)
8. T3/Inside Information 2026 Software Survey
9. IRS Publication 550 (capital gains)
10. IRS Publication 551 (cost basis)
11. IRC §1(h), §1091, §1250, §1411, §1014
12. Kiplinger 2025-2026 Capital Gains Tax Rates
13. Tax Foundation 2026 Tax Brackets
14. Baird Wealth 2026 Tax Facts
15. NerdWallet 2025-2026 Capital Gains Tax Rates
16. Fidelity Capital Gains Tax Rates 2026
17. QuantCalc — Tax Bracket Filling in Early Retirement
18. 24/7 Wall St. — Tax Loss Harvesting Case Studies
