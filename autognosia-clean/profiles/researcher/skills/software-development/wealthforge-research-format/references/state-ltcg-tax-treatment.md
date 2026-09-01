# State LTCG Tax Treatment Reference (2026)

## Purpose
Canonical reference for state-level capital gains tax treatment — used when researching LTCG harvesting, withdrawal optimization, state tax interactions, and relocation analysis.

## 50-State LTCG Tax Treatment Matrix (2026)

### No Income Tax States (9)
| State | Note |
|-------|------|
| AK | No state income tax |
| FL | No state income tax |
| NV | No state income tax |
| NH | No income tax on wages; 5% on interest/dividends (phasing out) |
| SD | No state income tax |
| TN | No state income tax (Hall tax eliminated 2021) |
| TX | No state income tax |
| WA | No income tax BUT has separate 7% capital gains tax (see below) |
| WY | No state income tax |

### Capital Gains Exempt from Income Tax (3)
| State | Note |
|-------|------|
| IA | Phasing out exemption by 2027 |
| MI | No state income tax on capital gains |
| MO | Exempts capital gains from income tax |

### Separate Capital Gains Tax (1)
| State | Threshold | Rate | Notes |
|-------|-----------|------|-------|
| WA | $262,000 (2023, inflation-adjusted) | 7% above threshold; +2.9% above $1M | Approved 2022; 62.99% voters want repeal |

### States Taxing Social Security (8)
(WV eliminated SS tax starting 2026)
| State | Single Exempt | MFJ Exempt | Phaseout Rate |
|-------|--------------|------------|---------------|
| CO | $10,420 | $20,840 | 5% |
| CT | $75,000 | $100,000 | 15% |
| MN | $86,410 | $110,780 | 33% |
| MT | $31,350 | $62,700 | 5% |
| NM | $10,924 | $16,416 | 5% |
| RI | $44,750 | $89,500 | 5% |
| UT | Conforms to federal | Conforms to federal | N/A |
| VT | $46,350 | $55,600 | 5% |

### States with Investment Income Surtax
| State | Rate | Notes |
|-------|------|-------|
| MD | 2% | On investment income above threshold |
| MN | 1% | NIIT analog |
| OR | Up to 9.9% | Top bracket rate |

### States with Mental Health Surtax
| State | Rate | Notes |
|-------|------|-------|
| CA | 1.33% | On high earners, added to base income tax |

### States with Local Income Tax
| State | Max Rate | Notes |
|-------|----------|-------|
| NY | 3.876% (NYC) | NYC residents face triple layer: NY State + NYC + MCTMT |
| OH | ~4% | Varies by municipality |
| KY | Varies | Municipal taxes |
| IL | Varies | Local surcharges |

## Effective 0% LTCG Capacity (MFJ, $30K SS, $0 ordinary income, 2026)

| Capacity Range | States |
|----------------|--------|
| $98,900 (full) | AK, FL, NV, NH, SD, TN, TX, WY, IA, MI, MO |
| ~$92,000 | WA (7% separate CG tax reduces capacity) |
| ~$84,000 | UT |
| ~$78,000 | WV, MD |
| ~$73,000 | CA, MA |
| ~$70,000 | MN |
| ~$68,000 | NY |
| ~$65,000 | OR, NJ |

## Key Formulas

### Effective 0% Capacity
```
state_adjusted_capacity = federal_capacity - capacity_reduction
capacity_reduction = ss_phaseout_impact + surtax_impact + state_ltcg_rate_impact
```

### Effective Marginal Rate on LTCG
```
effective_marginal = 0.15 (federal LTCG) + state_ltcg_rate + 0.038 (NIIT) + surtax_rate
```

### SS Phaseout Impact (for SS-taxing states)
```
if ordinary_income + SS > exempt_threshold:
    taxable_SS = min(0.85 * SS, 0.5 * (ordinary_income + SS - exempt_threshold))
    ss_phaseout_impact = taxable_SS * state_ltcg_rate
```

## Annual Update Pipeline
1. Source: Tax Foundation (state rates), SSA (SS tax provisions), state revenue websites
2. Verify: Cross-reference with IRS publications and state legislative sessions
3. Track: Legislative changes via state bill tracking
4. Notify: Affected client plans when thresholds/rates change
5. Changelog: Log all changes with effective dates

## Cross-References
- wo-1a-1: Federal LTCG harvesting zone calculator
- wo-1a-2: State-by-state SS taxation matrix
- wo-1a-8: State-by-state LTCG harvesting zone calculator
- wo-1a-8a: Local income tax integration
- wo-1a-8e: State LTCG × relocation decision engine
- str-1: 50-state retirement income tax matrix
- sst-5: State SS tax legislative change monitoring pipeline
- NOVEL-10: Regulatory change monitoring
