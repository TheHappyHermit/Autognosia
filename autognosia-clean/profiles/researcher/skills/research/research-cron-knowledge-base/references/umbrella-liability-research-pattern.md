# Umbrella Liability Research Pattern

Condensed reference for umbrella/excess liability insurance research in wealth planning. Load when researching ANY umbrella liability, excess liability, personal umbrella, or P&C insurance topic.

## Carrier Hierarchy (by client profile)

| Tier | Limit Range | Carriers | Typical Premium ($/yr per $1M) |
|------|------------|----------|-------------------------------|
| Standard | $1M-$5M | GEICO, Progressive, State Farm, Allstate | $200-$300 |
| Upper-Middle | $2M-$10M | State Farm, Allstate, Progressive, USAA | $150-$250 |
| HNW | $2M-$25M | Chubb, Cincinnati, Nationwide Private Client | $120-$200 |
| Ultra-HNW | $10M-$100M+ | Chubb, PURE, AIG Private Client Group, Berkshire Hathaway Guard | $100-$180 |

## Underlying Limit Requirements (carrier-mandatory)

- **Auto:** 250/500/100 minimum ($250K BI per person / $500K BI per accident / $100K PD)
- **Home:** $300K personal liability minimum
- **Critical:** If underlying limits fall below carrier minimums at claim time, umbrella may NOT respond — this is the #1 coverage gap.

## Recommended Limit Formula

```
base_limit = net_worth + (annual_income * 3)
risk_multiplier = 1.0 + (teen_drivers * 0.25) + (pool ? 0.15 : 0) + (dogs_high_risk ? 0.25 : 0) + (rentals * 0.20) + (professional_risk ? 0.15 : 0)
climate_adj = {low: 0.85, medium: 1.0, high: 1.25, extreme: 1.50}
recommended = round_up_to_standard_tier(base_limit * risk_multiplier * climate_adj)
```

Standard tiers: $1M, $2M, $3M, $5M, $7.5M, $10M, $15M, $20M, $25M, $50M

## State Jury Climate (5-tier)

| Climate | States | Adjustment |
|---------|--------|------------|
| Low | ND, IA, KS, NE, WY | x0.85 |
| Medium | National average | x1.0 |
| High | FL, TX, CA, IL | x1.25 |
| Extreme | NY, NJ, PA | x1.50 |

Source: Thomson Reuters US Chamber Institute for Legal Reform (Nuclear Verdicts Report)

## Key Stats

- Only 12-15% of US households carry umbrella coverage (III, 2025)
- Among advisory clients ($1M+): ~35-45% carry it - 55-65% exposed
- $1M policy: $150-$500/yr for standard-risk clients
- Nuclear verdicts >$1M grew 17% CAGR (2019-2025)
- Average jury awards >$1M in auto liability cases

## Common Coverage Exclusions

- Home-based business liability (requires separate endorsement)
- Rental property liability (requires separate policy)
- Intentional acts
- Professional liability (requires D&O or malpractice)
- Watercraft over certain horsepower/size
- Board service liability (requires D&O)

## WealthForge Integration Points

- PC-1 Coverage Dashboard (gap flag for "no umbrella")
- PC-2 Umbrella Calculator modal
- PC-3 Premium Trend Tracker
- Annual financial planning workflow trigger
- Client summary report inclusion
- Advisor productivity scorecard (P&C confidence metric)

## Sources

1. III (Insurance Information Institute) - Umbrella Liability Facts (2025)
2. Kiplinger - How Much Umbrella Insurance Do I Need? (Feb 2026)
3. NerdWallet - Umbrella Insurance Guide (Jan 2026)
4. Thomson Reuters US Chamber ILR - Nuclear Verdicts Report
5. PURE Insurance - Personal Excess Liability Coverage
6. CoverageCat - Standalone HNW Umbrella Carrier Comparison
7. InsuredBetter - Umbrella Insurance Cost (2026)
8. J.D. Power 2025 U.S. Home Insurance Study
9. T3/Inside Information 2026 Advisor Survey
10. Forbes - High-Value Home Insurance Companies (Mar 2026)
