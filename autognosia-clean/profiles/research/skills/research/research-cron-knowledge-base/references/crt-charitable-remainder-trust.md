# Charitable Remainder Trust (CRT) — Quick Reference

Condensed domain reference for CRT research, planning, and software implementation. Use when research encounters concentrated stock positions (>30% of NW in single holding with low basis), charitable trust modeling, NIIT avoidance strategies, or wealth replacement ILIT strategies.

## Core Types

| Type | Payout | Best For | Key Constraint |
|------|--------|----------|----------------|
| **CRAT** (Annuity Trust) | Fixed dollar amount (5-50% of initial FMV) | Predictable income needs | No additional contributions; 5% exhaustion test (Rev. Rul. 77-374) |
| **CRUT** (Unitrust) | Fixed % of annual FMV, revalued yearly | Growth-oriented, inflation hedge | Additional contributions allowed; lower exhaustion risk |
| **NICRUT** (Net Income CRUT) | Lesser of unitrust % or net income | Illiquid assets, deferral | No makeup provision for shortfall years |
| **NIMCRUT** (Net Income + Makeup CRUT) | Lesser of unitrust % or net income, with makeup account | Deferred income, retirement timing | Makeup payout creates lump-sum ordinary income tax spike |
| **Flip-CRUT** | NICRUT/NIMCRUT pre-trigger, standard CRUT post-trigger | Real estate, PE, closely held stock | Trigger must be specific (e.g., sale of contributed asset) — if it never fires, stays in NICRUT mode |
| **T-CRUT** (Testamentary CRUT) | Funded at death via will/IRA bequest | IRA owners with charitable intent | SECURE Act 10-Year Rule interaction; 30+ year breakeven vs. outright stretch |

## Core Tax Mechanics

**Section 7520 Rate:** 120% of federal midterm rate (AFR). Used to discount the charitable remainder. **May 2026: ~5.0%.** Higher 7520 = larger charitable deduction. Monthly IRS publication.

**Charitable Deduction:** Present value of the charitable remainder interest, computed at the 7520 rate on the contribution date.

**CRAT Deduction Formula:**
```
Annuity_Factor = (1 - (1 + 7520)^(-Term)) / 7520
PV_Remainder = FMV - (FMV × Payout_Rate × Annuity_Factor)
```

**CRUT (iterative):** `PV_Remainder = FMV × (1 - Unitrust_Factor)` — requires iterative computation because payout depends on future trust value.

**10% Minimum Remainder Test (IRC Sec. 664(d)(1)(D), (2)(D)):** PV of remainder must be >= 10% of initial FMV. **Most common CRT failure mode.** Makes CRUTs impossible for beneficiaries under ~27-28 at current 7520 rates.

**5% Exhaustion Test (CRAT only, Rev. Rul. 77-374):** CRAT must have <5% probability of running out of money before term ends.

## Four-Tier Distribution (IRC Sec. 664(b) — "Worst In, First Out")

| Tier | Income Type | Tax Treatment |
|------|-------------|---------------|
| 1 | Ordinary income (interest, STCG, non-qualified divs) | Ordinary rates (top 37%) |
| 2 | LTCG, unrecaptured Sec. 1250 gain, collectibles | Capital gains rates (0/15/20%) |
| 3 | Tax-exempt interest (munis) | Tax-free |
| 4 | Corpus (principal) — return of donor's original investment | Tax-free |

Each year's distribution is pulled from the highest-taxed tier first. Once a tier is exhausted, moves to the next. This means early distributions tend to be more highly taxed (Tier 1 consumed first), while later distributions become more tax-efficient (Tier 4 corpus).

## NIIT Exemption (IRC Sec. 1411(c)(5))

CRTs are explicitly exempt from the 3.8% Net Investment Income Tax. This creates the single most concrete dollar savings of CRT use.

**Sample calculation:** $5M concentrated stock, $200K basis, $4.8M gain:
- NIIT on direct sale: $4.8M × 3.8% = **$182,400 saved**
- Federal LTCG on direct sale: $4.8M × 20% = **$960,000 deferred**
- Total first-year tax saved: **$1,142,400**
- State taxes vary (CA 13.3% + NIIT = another $638K)

## Wealth Replacement (CRT + ILIT)

The most powerful combined strategy with zero software support:
1. Client contributes stock to CRT → sells tax-free → diversifies → generates income stream
2. ~30% of CRT income funds life insurance premiums in an Irrevocable Life Insurance Trust (ILIT)
3. ILIT death benefit (income-tax-free) goes to heirs at client's death
4. Charity receives CRT remainder
5. Result: heirs get more than direct inheritance (tax-free insurance > after-tax estate), charity gets funded, donor gets income + deduction

## Critical Compliance Rules

1. **Self-Dealing (IRC Sec. 4941):** Donor cannot borrow from, sell to, or direct CRT investments for personal benefit. Penalties: 10% → 200% if uncorrected.
2. **UBTI Excise Tax (IRC Sec. 664(c)(2)):** 100% excise tax on unrelated business taxable income. Avoid debt-financed property and active business income in CRTs.
3. **Pre-Arranged Sale Doctrine:** If donor signs binding sale agreement before CRT funding, gain attributed to donor, not trust.
4. **S Corp Stock Prohibition (IRC Sec. 1361):** CRTs cannot be S corporation shareholders.
5. **Form 5227:** Annual filing required even if no tax is owed.
6. **Qualified Appraisal (IRC Sec. 170(f)(11)):** Required for assets >$5K (>$500K = Form 8283 attachment).

## State CRT Tax Treatment

| State | CRT Treatment | Impact |
|-------|---------------|--------|
| **New Jersey** | Imposes gross income tax on CRT capital gains (8.97%) | **Destroys federal tax benefit** — potential $448K+ tax on $5M sale |
| **Pennsylvania** | Does NOT recognize CRT tax exemption for PA PIT | CRT income taxed at 3.07% flat |
| **California** | Generally conforms to federal | Quirks with CRT deduction timing |
| **New York** | Generally conforms | NY City does not add separate tax |
| **Most other states** | Follow federal treatment | No additional tax burden |

**NJ implication:** A CRT for an NJ resident may NOT be advisable unless the savings from federal NIIT + capital gains deferral exceeds NJ's 8.97% gross income tax on the sale. Build state CRT tax treatment into any strategy comparison.

## Key Numbers & Thresholds

- **Minimum contribution:** Practical minimum ~$250K-$500K ($100K legally minimum but admin costs make smaller ones uneconomic)
- **Ideal range:** $500K-$10M+ concentrated position
- **Payout rate:** 5-8% typical (5% minimum by law, 50% maximum)
- **Term:** Up to 20 years (non-charitable term) or life expectancy
- **Deduction limit (LTCG property):** 30% of AGI per year, 5-year carryforward
- **Qualified appraisal required:** Assets >$5K
- **Admin costs:** Legal setup $5K-$15K, trustee 0.5-1.5%/yr, CPA $1K-$3K/yr, investment 0.3-1.0%/yr → total 1-3%/yr erosion
- **7520 rate (May 2026):** ~5.0% (most favorable since 2007; each +1% adds ~10-15% to deduction)

## Competitive Landscape

| Tool | CRT Capability | Price |
|------|----------------|-------|
| eMoney Advisor | Basic deduction calculator only | Bundled |
| Wealth.com | Estate tax + CRT comparison | Bundled |
| Vanilla | CRT deduction modeling | Bundled |
| Valur CRT Calculator | Income + deduction projection | Free |
| PGDC (Planned Giving Design Center) | Full CRT/CLT calculator suite | $395/yr |
| Crescendo GiftProcessor | Comprehensive CRT/CLT | Charity-priced |
| CalCRUT | Free CRUT calculators | Free |
| RightCapital/Orion/Tamarac/Addepar | None | N/A |

**Gap:** No platform provides integrated CRT Planner with: (1) concentrated position auto-identification, (2) 6-strategy comparison (direct sale vs gradual vs CRUT vs CRAT vs CRT+ILIT vs DAF), (3) NIIT exemption computation, (4) 4-tier payout modeling, (5) wealth replacement ILIT integration, (6) state CRT tax treatment flags.

## Key Sources

1. Kitces.com — "Can A Charitable Remainder Trust Replace The Stretch IRA?" (2025)
2. Kitces.com — "Using T-CRUT To Give Twice To Both Loved Ones And Charity" (2025)
3. Kitces.com — "Leveraging NPIFs For Charitable Deductions Over CRTs" (2025)
4. The Tax Adviser (AICPA, Sep 2025) — "Planning with Charitable Remainder Trusts"
5. IRC Sec. 664 — Statutory foundation; IRC Sec. 1411(c)(5) — NIIT exemption
6. IRS Section 7520 Rate Tables (irs.gov/applicable-federal-rates)
7. Fidelity Charitable CRT Guide (fidelitycharitable.org)
8. Schwab Charitable CRT Guide (schwab.com/learn)
9. Beancount.io — "CRUT vs CRAT: Tax-Free Asset Sales" (May 2026)
10. BNY Mellon Wealth Management — Concentrated Stock Survey (2025)
11. Leimberg — "The Charitable Remainder Trust Letter" (multiple issues)
12. IRS Form 5227 — Split-Interest Trust Information Return
