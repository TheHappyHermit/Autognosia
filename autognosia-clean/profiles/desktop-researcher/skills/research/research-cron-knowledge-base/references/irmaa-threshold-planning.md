# IRMAA Threshold Planning in Retirement Software — Quick Reference

**Source:** Deep research session 2026-05-15  
**Full findings:** RESEARCH.md under "IRMAA Threshold Planning and Optimization in Retirement Withdrawal Software"

## IRMAA Mechanics

IRMAA (Income-Related Monthly Adjustment Amount) = surcharge on Medicare Part B + D premiums when MAGI exceeds thresholds. Uses a **two-year lookback** (2026 premiums based on 2024 MAGI).

### 2026 IRMAA Brackets (Part B + D Combined, Per Person)

| Tier | Single MAGI | MFJ MAGI | Annual Surcharge Per Person | Per Couple |
|------|------------|----------|---------------------------|-----------|
| None | ≤$109K | ≤$218K | $0 | $0 |
| 1 | $109K-$137K | $218K-$274K | $1,148 | $2,297 |
| 2 | $137K-$171K | $274K-$342K | $2,886 | $5,772 |
| 3 | $171K-$205K | $342K-$410K | $4,620 | $9,240 |
| 4 | $205K-$500K | $410K-$750K | $6,355 | $12,710 |
| 5 | $500K+ | $750K+ | $6,936 | $13,872 |

Base Part B: $202.90/mo (2026). Part D base varies by plan.

### Critical Structural Properties

- **Hard cliffs** — $1 over threshold triggers FULL surcharge (e.g., $218,001 → $2,297/yr couple)
- **Two-year lookback** — 2026 premiums based on 2024 MAGI. Decisions today invisible until 2 years later.
- **Per person** — Each spouse pays IRMAA separately. Both on Medicare = 2x surcharge.
- **Annual reassessment** — Recalculated every year from prior-year tax return.
- **MAGI for IRMAA** = AGI + tax-exempt interest (broader than standard AGI)
- **MFS anomaly** — Punitive narrow band: $109K then jumps to $391K for single filer threshold (vs. $137K-$171K-$205K progressive for other statuses)
- **First threshold increased** $106K (2025) → $109K (2026), 2.83% CPI-U indexed

## The Roth Conversion-IRMAA Trap (#1 Planning Miss)

### Worked Example (from Income Lab)
- Client age 63, $130K base retirement income
- Advisor recommends $150K Roth conversion (fills 24% bracket)
- 2026 total MAGI: $280K → pushes couple into IRMAA Tier 2
- 2028 premium cost: $5,770/yr (Tier 2) vs. $2,297 (Tier 1) = **$3,473/yr penalty**
- Conversion saved ~$26K in federal taxes at 24%
- But a $140K conversion would have stayed in Tier 1
- **Effective marginal rate on last $10K: 58.7%** (24% federal + IRMAA penalty)

**Golden rule:** For clients 63+, the conversion ceiling = MIN(tax bracket ceiling, IRMAA tier threshold) minus all other income. **Safety margin:** Keep $2K-$5K below each IRMAA threshold for unexpected income.

## SSA-44 Appeal Process

Form SSA-44 allows IRMAA redetermination based on *current* income (not 2-year lookback) after qualifying life-changing events.

### 8 Qualifying Events
1. Marriage
2. Divorce/annulment
3. Death of spouse
4. Work stoppage (retirement)
5. Work reduction
6. Loss of income-producing property
7. Pension loss
8. Employer settlement payment

**☠️ Roth conversions are NOT a qualifying event** — cannot undo IRMAA via SSA-44.

**Savings:** $1,148-$6,936/person/year. **Advisor opportunity:** No major platform automates eligibility detection.

## Widow/Widower Trap

When spouse dies: MFJ → Single filing status. Single thresholds ≈ 50% of MFJ thresholds, but survivor's income often doesn't drop by half. A couple below $218K MFJ could see the survivor on $120K — now above the $109K single threshold, triggering IRMAA for the first time.

**Strategy:** Pre-death Roth conversions to reduce survivor's future RMDs. SSA-44 after death (qualifying event #3).

## Competitive Landscape: IRMAA Software Support

| Tool | IRMAA Support | Key Detail | Pricing |
|------|--------------|------------|---------|
| **Income Lab Tax Lab** | ✅ Best | Cliff-aware, multi-year optimization, integrated with full plan | ~$159/mo |
| **RightCapital** | ✅ Good | Year-by-year bracket constraint, Action Items | $125-150/mo |
| **Covisum Tax Clarity** | ✅ Good | 100% EMR spikes on visual Tax Map (standalone) | Contact |
| **MaxiFi (ESPlanner)** | ✅ Good | Economics-based lifetime optimization | $109-149/yr |
| **Boldin (NewRetirement)** | ⚠️ Limited | Bracket-constrained strategy (not optimized) | $990/yr |
| **Holistiplan Premium** | ❌ None | Static bracket display only | $150-200/mo |

## Six IRMAA Planning Strategies

1. **Roth Bracket Filling** — Size conversions to fill IRMAA tier, not tax bracket
2. **Income Timing** — Spread large income events across years so no single year overshoots
3. **QCDs** — Clients 70.5+: direct IRA→charity distributions reduce MAGI directly
4. **HSA Maximization** — HSA contributions reduce AGI/MAGI
5. **Municipal Bonds** — Limited (muni interest counted in MAGI for IRMAA)
6. **Life Insurance CV Withdrawals** — Up-to-basis withdrawals don't affect MAGI

## WealthForge Implementation Status

**✅ Already built (foundation, ~30%):**
- IRMAA_BRACKETS in `tax_year_projection.py` (all 5 statuses, Part B)
- `_irmaa_review()` — checks current MAGI, returns "covered"/"breach" + room to next threshold
- `roth_conversion_optimizer.py` — IRMAA guardrail logic + irmaa_watch status
- RMD agent — system prompt to alert on IRMAA trigger risk
- Threshold catalog — IRMAA alongside bracket/NIIT/cap gain thresholds

**❌ Critical gaps (9):**
1. No Part D surcharges ($14.50-$91/mo missing)
2. Single-year projection only — no two-year lookahead
3. No multi-year scenario optimization
4. No SSA-44 appeal workflow (zero-competition feature)
5. No widow/widower trap modeling
6. No EMR visualization (Covisum Tax Map pattern)
7. No MFS IRMAA strategy logic
8. No OBBBA senior deduction phaseout interaction
9. No QCD-driven IRMAA offset modeling

## OBBBA Interaction (2026+)

New senior deduction ($6K single/$12K joint for 65+) phases out between $150K-$350K MAGI, adding ~1.3pp to EMR. **Three-way stack** (SS taxability + IRMAA cliffs + senior phaseout) pushes EMR >55%. Covisum: "A client may appear to be in the 22% bracket but effectively pay 55%+ on additional income."

## Topics Added From This Research

1. **SSA-44 Appeal Workflow Integration** — No platform automates this. Quick-to-market, high-value feature. Added to Planning Engine & AI.
2. **EMR Visualization Pattern** — Covisum Tax Map as reference architecture for IRMAA cliff visualization. Added to Planning Engine & AI.
3. **MFS IRMAA Strategy** — Bracket anomaly analysis for high-earner/low-earner couples. Added to Tax.
4. **Survivor IRMAA Trap** — MFJ→Single filing transition edge case. Added to Tax.
5. **OBBBA Senior Deduction + IRMAA** — Three-way stacking creates >55% EMR. Added to Tax.

## Key Sources

- Income Lab: IRMAA Brackets 2026 Guide, Roth Conversion + IRMAA Guide, 6 IRMAA Strategies, SSA-44 Guide
- Covisum: Tax Clarity IRMAA Visualization, EMR Under OBBBA
- Boldin Help Center: IRMAA Bracket Limit Roth Conversion Strategy
- CMS: 2026 Medicare Parts A & B Premiums and Deductibles
- RightCapital Q2 2025 Updates (IRMAA Action Items)
- Holistiplan Help Center (no IRMAA handling)
