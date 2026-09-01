# RIA Service Tier IT Analysis — Domain Reference

**Load when:** researching any bo-01-14-* topic (IT staffing model), IT infrastructure, compliance technology costs, or RIA technology stack questions where the firm's service model (fee-only vs fee-based vs commission-based) affects the answer.

## 6-Tier Service Model Classification

| Service Tier | Revenue Mix | IT Complexity (0-100) | Compliance IT Cost/Employee/Yr | Dual-Reg Penalty |
|---|---|---|---|---|
| **Fee-Only** | ≥80% fee-only revenue | 30 | $2,500 | No |
| **Fee-Dominant Hybrid** | ≥60% fee-only, <50% commission | 45 | $3,500 | No |
| **Fee-Based** | ≥50% fee-based revenue | 55 | $4,500 | Conditional |
| **Mixed Hybrid** | ≥70% fee-only + commission | 65 | $5,500 | Conditional |
| **Complex Hybrid** | No dominant tier | 75 | $6,500 | Conditional |
| **Commission-Based** | ≥50% commission revenue | 85 | $8,500 | Yes (1.3×) |

## Tech Stack Complexity by Tier

**Fee-Only (score: 30):** CRM, Financial Planning, Portfolio Mgmt, Compliance Doc, Fee Billing. NO: trading, order routing, trade surveillance, FINRA comm monitoring, insurance quoting, commission tracking.

**Fee-Based (score: 55):** Fee-only tools + Insurance Quoting, Commission Tracking, Reg BI Documentation, Insurance Licensing Management.

**Commission-Based (score: 85):** Fee-based tools + Trading Platform, Order Routing, Trade Surveillance (FINRA-compliant), FINRA Comm Monitoring (all channels), Suitability Documentation.

## Service-Tier-Aware Staffing Formula

```
adjusted_fte = base_fte × tier_multiplier × dual_reg_multiplier

tier_multipliers:
  fee-only:                    0.85 (15% less IT needed)
  fee-dominant hybrid:         0.90 (10% less)
  fee-based:                   1.25 (25% more)
  commission-based:            1.50 (50% more)
  mixed/complex hybrid:        1.10 (10% more)

dual_reg_multiplier:
  dual-registered:             1.30 (30% penalty)
  fee-only (no BD):            1.00
```

## Dual-Registration Cost Breakdown (Annual)

| Item | Cost Range |
|---|---|
| Trade Surveillance | $25K-$50K |
| FINRA Communication Monitoring | $15K-$30K |
| Enhanced Cybersecurity | $10K-$25K |
| Additional Compliance Documentation | $10K-$20K |
| Insurance Licensing Management | $5K-$10K |
| **Total Add-on** | **$50K-$150K/year** |

## Service Model Transition Costs

**Commission → Fee-Base (savings):** Trade surveillance (-$30K), FINRA comm monitoring (-$25K), order routing (-$10K), suitability docs (-$8K) = **$73K/yr savings**

**Commission → Fee-Only (savings):** Above + insurance quoting (-$5K) = **$78K/yr savings**

**Fee-Only → Fee-Based (addition):** Insurance quoting ($8K), commission tracking ($5K) = **$13K/yr addition**

## MSP Pricing by Service Tier

| Tier | MSP Cost/User/Mo | Notes |
|---|---|---|
| Fee-Only | $200 (0.9× base) | Cheaper MSPs acceptable (no FINRA expertise needed) |
| Fee-Based | $245 (1.1× base) | Moderate premium for Reg BI support |
| Commission-Based | $280 (1.25× base) | Must have FINRA compliance expertise |

## Key Industry Data

- ~35% of RIAs are fee-only, ~35% fee-based, ~15% commission-based, ~15% hybrid (Cerulli 2025)
- ~75% of advisors will be fee-based by 2026 (Cerulli migration trend)
- Dual-registered firms pay 1.5-2.5× more in compliance IT costs vs. fee-only of same size
- Fee-only RIAs have 30-40% lower total IT costs than commission-based RIAs
- Top-performing RIAs are 3.8× more likely to use data-driven service model decisions (Schwab 2025)

## Sources

1. Cerulli Associates US RIA Marketplace 2023
2. Schwab 2025 RIA Benchmarking Study (1,288 firms)
3. Kitces AdvisorTech Survey 2025
4. SEC Reg BI (34-86838)
5. FINRA Rules 3110, 4311, 3120
6. Oyster LLC: Dual Registration Analysis
7. Deloitte RIA Technology Trends Survey 2024-2025
