# Ratcheting Safe Withdrawal Rate — Key Data

**Source:** Kitces.com, "The Ratcheting Safe Withdrawal Rate — A More Dominant Version of the 4% Rule?" Jun 3, 2015.
**Full research entry:** RESEARCH.md (kswr-01), Run 105.

## Core Parameters (Default Config)

| Parameter | Default | Range | Notes |
|-----------|---------|-------|-------|
| Initial WR | 4.0% | 3.0-5.5% | 3.5% for 50yr FIRE horizon (Kitces 2019) |
| Ratchet threshold | 150% of initial portfolio | 120-200% | Nominal value check, not real/inflation-adjusted |
| Ratchet increment | +10% spending increase | 5-20% | Applies to current spending baseline, locked permanently |
| Inflation adjustment | CPI-U matching | User-defined | Spending also adjusts for inflation each year |
| Recommended AA | 50-70% equities | 40-80% | Higher equity = more ratchet opportunity, more risk |

## Core Algorithm (Pseudocode)

```
Each year:
  1. Check if portfolio_end (from prior year) >= threshold × initial_portfolio
     YES → permanently increase spending baseline × (1 + increment)
  2. Apply inflation COLA to current spending baseline
  3. Withdraw spending amount from portfolio
  4. Apply market returns to remaining portfolio
  5. Record: spending, portfolio value, ratchet_triggered
```

## Multi-Threshold Extension

Thresholds form a geometric series: T_n = initial_portfolio × (1.50^n)

| Threshold Tier | Portfolio Multiple of Initial | Cumulative Ratchets | Spending Increase |
|:--|:--|:--|:--|
| Tier 0 (start) | 1.00× | 0 | Baseline (inflation-adjusted) |
| Tier 1 | 1.50× | 1 | +10% (1.10× baseline) |
| Tier 2 | 2.25× (1.5²) | 2 | +21% (1.21× baseline) |
| Tier 3 | 3.38× (1.5³) | 3 | +33% (1.33× baseline) |
| Tier 4 | 5.06× (1.5⁴) | 4 | +46% (1.46× baseline) |
| Tier N | 1.50^N | N | × (1 + 0.10)^N |

## Historical Context (SBBI Data 1926-2015, 60/40 Portfolio)

- Initial WR that worked in ANY 30-year period: 4% to 10% (median ~6.5%)
- Only 12 of 115 rolling 30-year periods ended with less than starting wealth at 4% WR
- The 4% rule leaves median terminal wealth ~2-3× initial portfolio → $200K+ untapped on $100K
- Ratcheting converts surplus into $150K-$300K more lifetime spending for 90%+ of retirees

## Database Schema (Key Tables)

```sql
-- Strategy config per client
ratcheting_strategies (strategy_id, client_id, initial_portfolio, 
    initial_withdrawal_pct, ratchet_threshold_pct, ratchet_increment_pct,
    multi_ratchet_enabled, compliance_doc_id)

-- Aggregate simulation results
ratcheting_simulation_results (result_id, strategy_id, scenario_type,
    total_spending, total_4pct_comparison, ratchet_premium,
    ratchet_count, final_portfolio, depletion_flag)

-- Year-by-year detail
ratcheting_yearly_detail (detail_id, result_id, year_number,
    spending_amount, portfolio_start, portfolio_end,
    ratchet_triggered, cumulative_spending)
```

## Comparison With Other Withdrawal Strategies

| Dimension | Fixed 4% Rule | Ratcheting | Guyton-Klinger | Risk-Based (Tharp) |
|:--|:--|:--|:--|:--|
| Spending goes up? | Inflation only | +10% on 150% threshold | +10% on Prosperity rule | Continuous via PoA |
| Spending goes down? | Never | **Never** | Yes, up to -10% | Yes, up to ~20% |
| Initial WR | 4% | 4-5% | 5.2-5.5% | 4-5% |
| Psychological appeal | Safety | **One-way up** | Conditional cuts | Data-driven cuts |
| Complexity | Trivial | Low (one rule) | Medium (4 rules) | High (MC-driven) |
| Lifetime spending (30yr, $1M) | ~$1.2M | ~$1.4-1.7M | ~$1.5-1.8M | ~$1.3-1.6M |

## Cross-References to Other Research

- **Hatchet integration** (kswr-1): Dual-phase ratcheting for pre-SS (high WR) and post-SS (low WR)
- **Withdrawal sequencing** (kswr-2): Where extra spending comes from when ratchet triggers
- **IRMAA awareness** (kswr-4): Ratchet may push over Medicare premium thresholds
- **Dynamic Spending Strategies (DSS-1)** : Part of 9-strategy comparison engine
- **Comparative Withdrawal Engine (swr-1)** : One of 8+ strategies in method selection
- **Risk-Based Guardrails (rbg-1 through rbg-8)** : Alternative approach with continuous adjustment
- **Guyton-Klinger (gk-1 through gk-7)** : Alternative approach with up/down guardrails
- **Modified RMD Method** : Alternative approach using IRS tables

## Red Team Edge Cases (Most Impactful)

1. **No ratchet ever** (1966 retiree) → behaves as standard 4% rule, no harm
2. **Early ratchet then crash** (YR2 hit 150%, YR3 crash -30%) → new higher spending is unsustainable but rare (historical testing confirms survival)
3. **RMD conflict** (age 73+, IRA-heavy) → RMDs may exceed ratchet-based spending → use two-phase model
4. **Widow's penalty** (spouse dies, spending re-baseline needed) → life-change modifier needed
5. **Inflation erosion** (nominal threshold never reached in high-inflation) → option for real/inflation-adjusted threshold
6. **FIRE 50yr horizon** → use 3.5% initial rate with same 150%/10% parameters
7. **Wrong AA** (80/20 = too volatile; 30/70 = no ratchet likely) → only recommend 50-70% equity
