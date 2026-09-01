# QLAC (Qualified Longevity Annuity Contract) — Condensed Domain Reference

**Source:** Comprehensive 12-section feature research entry in RESEARCH.md (2026-05-16, Run #67). This is a quick-reference distillation; load the full entry for build specs and UI widget designs.

---

## Core Rules (2026)

| Parameter | Value |
|---|---|
| Max premium (2026) | **$210,000** per person ($420K per couple), inflation-indexed |
| 25% cap? | **Eliminated** by SECURE 2.0 — dollar limit only |
| Income start | Must begin no later than **age 85**; can be earlier |
| Eligible accounts | Traditional IRA, 401(k), 403(b), governmental 457(b) |
| Ineligible | Roth IRA/401(k), inherited IRAs, defined benefit plans |
| Liquidity | **Illiquid by design** — no cash surrender value after free-look |
| Death benefit | Return of Premium, Period Certain (10/15/20yr), or Joint Life |
| Joint life | Allowed — spouse continuation reduces payout ~10-20% |
| Purchaser min age | Varies by carrier: 31 (NYL) to 52 (Pacific Life) |

### SECURE 2.0 Transformative Changes (§§331-332)

- Limit raised from $125K (or 25% of account) to $200K (now $210K indexed)
- 25%-of-account cap eliminated entirely
- LTC accelerated death benefit riders authorized (§332) — **still unimplemented by any carrier as of May 2026**
- Purchasers of old $125K QLACs can add the difference (up to $85K more)

---

## Top 8 QLAC Carriers (2026)

| Carrier | AM Best | Min Age | Notes |
|---|---|---|---|
| **New York Life** | A++ | 31 | Most flexible min age; often best payout; top-tier |
| **MassMutual** | A++ | 50 | Flexible-premium DIA; conservative pricing |
| **Pacific Life** | A+ | 52 | 10-year QLAC veteran; consistently competitive |
| **Guardian** | A++ | 50 | Top ratings; smaller QLAC program |
| **Lincoln Financial** | A+ | 50 | Strong broker-dealer distribution |
| **Brighthouse** | A | 50 | Often competitive; lower rating than mutuals |
| **Integrity Life** | A+ | 50 | Can offer best per-dollar payouts |
| **United of Omaha** | A+ | 50 | Recognizable brand; conservative pricing |

**Source:** AnnuityJournal.org (2026). The **three-quote rule**: obtain quotes from at least 3 top-rated carriers (NYL, MassMutual, Pacific Life), pick highest payout from A+ or better.

---

## Key Math

### RMD Reduction

```
old_rmd_base  = total IRA/401(k)/403(b)/457(b) balance
new_rmd_base  = old_rmd_base - qlac_premium  (max $210K)
rmd_factor    = lookup_irs_table(current_age)
old_rmd       = old_rmd_base / rmd_factor
new_rmd       = new_rmd_base / rmd_factor
rmd_reduction = old_rmd - new_rmd
```

**Example** (73-year-old, $1.5M IRA, $210K QLAC):
- Without QLAC: RMD = $1.5M ÷ 26.5 = ~$56,600
- With QLAC: RMD = $1.29M ÷ 26.5 = ~$48,700
- Reduction: **~$7,900/yr** → $1,700/yr tax savings at 22% bracket

### Tax Savings Components (Annual)

```
income_tax_savings = rmd_reduction × marginal_rate
irmma_savings      = IRMAA surcharge_without_QLAC - IRMAA_surcharge_with_QLAC
ss_torpedo_savings = SS_taxability_without - SS_taxability_with
total_savings      = income_tax + irmma + ss_torpedo
```

*Note: IRMAA savings use 2-year lookback — appear 2 years after purchase.*

### Sample Payout Rates

From Blueprint Income (May 2026), $100K life-only annual income:

| Age | Immediate | 5yr Defer | 10yr Defer | 15yr Defer |
|---|---|---|---|---|
| 65 | $7,809 | $11,262 | $18,297 | $32,564 |
| 70 | $8,796 | $13,478 | $23,937 | $48,722 |

A $210K QLAC at age 62 (spouse 59) starting at 80: approximately **$4,000/month** (joint life).

---

## The Kitces Counterargument (2015-2016)

**Core thesis from Kitces.com:**
- A QLAC purchased at age 72 requires living past **age 100** to beat an 8%-growth portfolio
- Even at 5% growth, QLAC doesn't pull ahead until ~93
- QLACs underperform equities but outperform bond ladders (mortality credits)
- Should be viewed as **fixed-income replacement**, not investment
- Quote: *"Using a QLAC to avoid RMDs requires living past age 100 just to beat an IRA growing at 8%!"*

**2026 Re-evaluation (this research):**
- Kitces analysis predated SECURE 2.0 expansion AND near-zero-rate environment
- At 4.3% 10yr Treasury (May 2026), QLAC payouts are significantly higher than 2014-2021
- Kitces did NOT model secondary benefits: IRMAA avoidance, SS tax torpedo defusing, known-time-horizon framing
- Most valuable **not as standalone investment but as coordinated element** in broader retirement tax optimization
- **Decision framework**: QLAC as fixed-income replacement + longevity hedge, not growth investment

---

## Decision Framework

### QLAC Appropriate When:
- IRA >$500K
- Age 55-75
- Moderate-to-high longevity concern
- Low-to-moderate legacy importance
- Sufficient liquid assets outside IRA

### QLAC Inappropriate When:
- IRA <$200K
- Life expectancy <80
- High legacy importance
- High liquidity needs
- Age >80 (too little deferral benefit)

### Client Suitability Checklist:
- [ ] IRA balance >$500K
- [ ] Age 55-75
- [ ] Client concerned about outliving assets
- [ ] Legacy importance ≤6/10
- [ ] $50K+ liquid assets outside IRA
- [ ] Client can accept illiquidity
- [ ] No significant health issues reducing life expectancy
- [ ] Understanding that QLAC is NOT a growth investment

---

## Competitive Landscape

| Platform | QLAC Capability |
|---|---|
| **eMoney** | **None.** No QLAC-specific modeling |
| **RightCapital** | **None.** No QLAC differentiation from DIA |
| **MoneyGuidePro** | **None.** No QLAC |
| **Orion/Tamaraic/Addepar/Advyzon** | **None.** |
| **Income Lab** | **Partial.** SPIA/DIA guardrails, no QLAC RMD exclusion |
| **MaxiFi Planner** | **None.** |

**Standalone quote engines** (no plan integration):
- Blueprint Income — Best consumer quotes
- QLAC Quote / QLACRates.com — Carrier comparison
- Go2Income / AnnuityRatesHQ — QLAC calculators
- Fidelity QLAC interactive tool

**Key gap:** Zero wealth management platforms have integrated QLAC decision tools. **Pure WealthForge-native innovation opportunity.**

---

## Key Sources

1. Kitces (Sep 2015) — "Don't Use A QLAC To Avoid IRA RMD Obligations"
2. Kitces (Jan 2016) — "Longevity Insurance Compared To Stock & Bond Returns"
3. Kitces (Dec 2017) — "Strategies To Reduce Or Delay RMD Mandatory Withdrawals"
4. Kitces (Apr 2026) — "Flexible Retirement Date Window" (QLAC coordination)
5. Kiplinger — "Curious About a QLAC? SECURE 2.0 Gives This Annuity a Boost" (2023)
6. 24/7 Wall St (Apr 2026) — "The QLAC...Delays Your RMDs Until Age 85"
7. Fidelity — "A Way to Secure Retirement Income Later in Life" + Secure Act 2.0 guide
8. Blueprint Income — QLAC quotes calculator, current rates (May 2026)
9. AnnuityJournal.org — "Best QLAC Companies 2026: Top 8 Carriers"
10. Cardinal Guide (Mar 2026) — "How a QLAC Can Reduce RMDs"
11. IRS Treas. Regs §1.401(a)(9)-6, Q&A-12 through Q&A-17
12. SECURE 2.0 Act of 2022, §§331-332
13. NAIC Suitability in Annuity Transactions Model Regulation (#275)
14. Stanford Center on Longevity — QLAC longevity research
15. TIAA Institute (Dec 2025) — "Income is the New Outcome"

---

## Related Topics in the Knowledge Base

- **RMD-SWR collision research** (RESEARCH.md) — QLACs as 1 of 4 RMD mitigation strategies
- **Roth conversion calculator** — QLAC conflicts with/converts from same IRA balance
- **ss-3 bridge funding** — QLAC as longevity backstop after SS bridge
- **Annuity types comparison** (AN-1 through AN-8) — Annuity classification framework containing QLAC
- **Widow's penalty** (wp-1 through wp-7) — Joint-life QLAC continued payments to survivor
- **IRMAA threshold planning** — QLAC's MAGI-lowering benefit reduces IRMAA surcharges
- **Standard deduction trap** — QLAC coordination with charitable giving and itemization
- **AGENDA.md subtopics:** qlac-1 through qlac-8 (8 new subtopics, 2 🔴 HIGH)
