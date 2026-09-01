# Social Security Bridge Funding — Key Data & Decision Rules

**Source:** Full 12-section research entry in RESEARCH.md (2026-05-16). This reference file is a condensed knowledge bank for quick lookup during future research runs.

---

## Core Mechanics

### Delayed Retirement Credits (DRCs)
- **Rate:** +8% per year past Full Retirement Age (FRA, age 67 for those born 1960+)
- **Max delay:** Age 70 (3 years past FRA = +24%, cumulative 77% over age 62)
- **Example:** $2,572/mo at 62 → $4,555/mo at 70 (77% increase, Kiplinger)
- **Survivor benefit:** Higher-earning spouse's delay permanently increases survivor benefit

### The Gap
- **Who should delay:** ~90% of Americans (CNBC/BPC, Jul 2025)
- **Who actually delays:** ~10%
- **Cost of sub-optimal claiming:** ~$111K average per household (Yahoo Finance, Feb 2026)
- **Break-even age:** ~80 (simple), but survivor benefit + COLA push true value 2-3x higher

### Bridge Period Math
- **Funding requirement:** Total bridge need = sum(annual_spend × inflation_adj for each bridge year)
- **Rule of thumb:** Need 15-20x annual expenses in investable assets to fund bridge + rest of retirement (MJ T Associates)

---

## Bridge Funding Sources — Tax Impact Matrix

| Source | Tax Treatment | Pre-59.5 Penalty? | ACA MAGI Impact | Best For |
|--------|--------------|-------------------|-----------------|----------|
| Taxable brokerage | LTCG rates (0%/15%/20%) | No | LTCG not counted for ACA | First-tier bridge funding |
| Trad IRA/401(k) withdrawals | Ordinary income | 10% (except SEPP/Rule 55) | Yes, fully counted | Second-tier |
| Roth IRA contributions | Tax-free | No (contributions only) | No | Bridge buffer |
| Roth conversion ladder | Tax on conversion, 5-yr seasoning | No after 5yr | Yes (conversion year) | Pre-59.5 bridge |
| SEPP/72(t) | Ordinary income | Exempt | Yes | Early retirement <59.5 |
| Rule of 55 (employer 401k) | Ordinary income | Exempt (same employer) | Yes | Ages 55-59.5 |
| HECM reverse mortgage | Tax-free (loan, not income) | N/A | No | Long bridge (62+) |
| HELOC | Interest cost, not income | N/A | No | Emergency/short bridge |
| SPIA (term certain) | Exclusion ratio (partial taxable) | N/A | Yes (taxable portion) | Safety-first bridge |
| TIPS ladder (in IRA) | Ordinary income on withdrawal | 10% if pre-59.5 | Yes | Inflation-protected bridge |
| Part-time work | Ordinary income | N/A | Yes | Reduces bridge drawdown |

---

## ACA Subsidy Cliff Rules (2026)

- **Threshold:** 400% of Federal Poverty Level (~$58K single, ~$78K couple)
- **Cliff returned:** 2025+ (was temporarily removed by ARPA/IRA)
- **Repayment:** No cap if actual income exceeds 400% FPL — full subsidy lost on $1 over
- **Subsidy value:** $8K-$18K/yr typical for early retirees
- **MAGI for ACA:** AGI + tax-exempt interest + non-taxable SS + foreign income
- **Key constraint:** $50K Roth conversion might save $5K in future taxes but cost $8K in lost ACA subsidies (BridgeToFI analysis)
- **Caveat:** Catastrophic plans may be viable for high-MAGI bridge years
- **State ACA supplements:** CA, MA, MN, NY, VT have additional state-level subsidies with different rules

---

## IRS Penalty Exception Rules (for bridge funding)

### Rule of 55
- Who: Separated from employer in or after year you turn 55
- What: 401(k) from THAT employer only (not IRAs)
- How: Penalty-free withdrawals at any age from that plan
- Limitation: Only works for current/former employer's plan, not rollover IRAs

### SEPP 72(t)
- Who: Any age
- What: IRA penalty-free withdrawals via Substantially Equal Periodic Payments
- How: Fixed annual distribution calculated by IRS life expectancy methods
- Duration: 5 years or until 59.5 (whichever is longer)
- ⚠️ **Critical risk:** Modification = retroactive penalties on ALL past distributions
- ⚠️ **Recommendation:** Prefer Roth ladder over SEPP in bridge engine design

### Roth Conversion Ladder
- Who: Any age with trad IRA funds
- What: Convert trad → Roth, then withdraw converted principal after 5 years
- Duration: 5-year seasoning period for EACH conversion year
- Strategy: Start conversions 5 years before bridge begins
- Limitation: Only converted PRINCIPAL accessible — earnings wait until 59.5

---

## Optimal Bridge Funding Strategy (P1/P2/P3 Framework from BridgeToFI)

```
P1: Retirement → Age 59.5
  Sources: Taxable brokerage, cash/HYSA, Roth contributions, earned income
  Allocation: Conservative (50/50 to 60/40)
  
P2: Age 59.5 → Social Security Start
  Sources: Traditional IRA/401(k) (now penalty-free), taxable, Roth
  Allocation: Moderate (60/40 to 70/30)
  
P3: Social Security Onward
  Sources: SS benefit (guaranteed floor), portfolio withdrawals
  Allocation: Can be more aggressive as SS acts as bond-like floor
```

---

## Asset Allocation Rules for Bridge Funds

- **Default recommendation:** 2-3 years of bridge spending in cash/short-term bonds
- **TIPS ladder:** For fixed real bridge income, TIPS ladder at current ~2% real yields (2026)
- **Equity exposure in bridge fund:** Minimize — bridge funds have short time horizon (3-8 years)
- **Rebalancing:** Replenish cash bucket from portfolio gains in good market years
- **SPIA bridge:** Term-certain SPIA for exactly the bridge period (e.g., 8-year term at age 62)

---

## Survivor Benefit Value (Underappreciated Bridge Dimension)

- If Bob (higher earner) delays from 62 ($2,200/mo) → 70 ($3,970/mo)
- Jane's survivor benefit permanently increases: $1,770/mo × 12 = $21,240/yr
- Over expected 15-year widowhood: ~$318,600 in additional survivor income
- This is the CHEAPEST survivor insurance available — 8% DRC rate beats any commercial product
- **Key insight:** Bridge funding cost should be measured against the survivor benefit value, not just the primary earner's break-even

---

## Behavioral Economics for Bridge Design

- **Loss aversion dominates:** Clients fear portfolio depletion in early retirement more than they value higher future SS
- **Pre-commitment device:** Automated monthly transfers from bridge account to checking ($2,572/mo = simulated SS paycheck)
- **"Do-over" rule (SS Administration):** Withdraw application within 12 months, pay back benefits, reapply later. Available ONCE in lifetime.
- **Default design:** The bridge plan should auto-execute — advisors set it up once, client doesn't make annual claiming decisions
- **Visual cue always visible:** "If you claim at 62, your monthly check is permanently locked at $2,572. If you wait until 70, it grows to $4,555."
