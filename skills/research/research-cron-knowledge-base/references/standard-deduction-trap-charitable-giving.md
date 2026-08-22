# The Standard Deduction Trap — Charitable Giving Overpayment in Retirement Projections

## The Core Problem

**~90% of taxpayers take the standard deduction** (IRS SOI TY2022: 88.6%). For retirees specifically, the percentage is even higher (no mortgage interest, lower SALT). This means ~9 out of 10 retirees who donate to charity receive ZERO federal tax benefit from those donations.

**The trap:** Charitable deductions are Schedule A "below-the-line" itemized deductions. If total itemized deductions don't exceed the standard deduction ($32,200 MFJ 2026), the charitable portion produces $0 in tax savings — but most planning software still models it as reducing taxable income dollar-for-dollar.

## The QCD Solution

Qualified Charitable Distributions (QCDs) from IRAs (age 70½+, up to $100K/yr indexed) solve this by **excluding the distribution from AGI entirely** — not deducting it.

### Why AGI exclusion beats deduction

| Property | QCD | Cash Donation |
|----------|-----|---------------|
| Enters AGI? | No | Yes |
| Deduction? | N/A (excluded above the line) | Yes (itemized, may be wasted) |
| Affects IRMAA? | No | Yes (higher AGI = more IRMAA) |
| Affects SS taxation? | No | Yes (higher provisional income) |
| Satisfies RMD? | Yes | No |
| Works for non-itemizers? | Yes | No |
| Bypasses 0.5% AGI floor (2026+)? | Yes | No |
| Bypasses 35% cap (top bracket 2026+)? | Yes | No |

### Lifetime impact

RetirementForge analysis: $20K/yr QCD vs. cash donation over 20 years → **$80K-$120K less** in lifetime taxes and Medicare surcharges for the same charitable impact.

### IRMAA multiplier effect

$10K cash donation that pushes MAGI into IRMAA Tier 1:
- Lost tax deduction: $2,200 (22% bracket)
- IRMAA surcharge triggered: ~$1,741/yr × 2 people × 2 years lookback = ~$6,964
- **Combined annual overpayment: ~$5,682 on a $10K donation**

## The OBBBA 2026 Changes (Three New Constraints)

### 1. Non-Itemizer Charitable Deduction (above-the-line)
- $1,000 single / $2,000 MFJ max deduction
- Direct cash to 501(c)(3) public charities ONLY
- **Explicitly excludes** DAFs, supporting orgs, private foundations
- Fixed amounts (not inflation-indexed)
- Annual savings: $100-$740 depending on bracket

### 2. 0.5% AGI Floor for Itemizers
- Only contributions ABOVE 0.5% AGI are deductible
- $500K AGI → first $2,500 non-deductible
- $1M AGI → first $5,000 non-deductible
- **Floor applied in reverse order:** 20%-limit category first → 60%-limit category last
- Carryovers from prior years NOT added to current-year floor calculation
- Unused amounts carry forward 5 years

### 3. 35% Cap for Top-Bracket Filers
- Tax benefit of itemized charitable deductions capped at 35% rate
- $100K gift: $35K benefit instead of $37K (top bracket)
- **ADDITIONAL provision** — top-bracket filers face BOTH the floor AND the cap

## DAF Exclusion Problem

Donor-Advised Fund contributions are excluded from the non-itemizer deduction. This means:
- In standard-deduction years: DAF contributions get NO deduction
- DAF bunching strategy is less effective under OBBBA
- For retirees below itemization threshold: QCDs become the ONLY tax-efficient method

## Planning Software Gap

**No major planning platform (eMoney, RightCapital, MoneyGuidePro) correctly models this.** All model charitable giving as an itemized deduction that reduces taxable income — wrong for ~90% of retirees.

Consequences of the modeling error:
- Projections OVERSTATE after-tax retirement income by 10-37% of donated amounts
- For $500K-$1M lifetime charitable giving: error is $50K-$370K
- No platform handles the QCD-vs-DAF-vs-cash three-way comparison
- No platform offers native QCD workflow automation
- Few if any updated for OBBBA 2026 rules

## Related Research

- `obbba-senior-deduction.md` — Senior deduction ($6K/$12K for 65+, 2025-2028) is a SEPARATE provision from the charitable rules. Both are in OBBBA but affect different tax lines.
- `ss-tax-torpedo.md` — QCDs reduce SS taxation by reducing provisional income.
- `irmaa-threshold-planning.md` — QCDs are the most powerful IRMAA avoidance tool for charitably-inclined retirees.
- `bridge-years-roth-conversion.md` — QCD-Roth bracket space allocation problem (70½-73/75 window where both compete for limited bracket space).
- `hsa-optimization-aca-magi.md` — HSA + QCD = most powerful AGI reduction combo for charitably-inclined retirees.
- `ssa-44-appeal-workflow.md` — QCDs are the one tool that doesn't need SSA-44 filing because they don't show up in AGI at all.

## Sources

- IRS SOI data: 88.6% standard deduction rate (TY2022)
- Tax Policy Center: ~10% itemize
- RetirementForge QCD vs. distribute+deduct analysis
- Michael Ryan Money: QCD vs. IRMAA interaction
- Wiss CPAs: QCD bypasses 0.5% floor
- Reninc: Floor application order (reverse by category)
- CAPTRUST: OBBBA charitable rules
- Taft Law: Non-itemizer deduction details
- Fidelity Charitable study: 78% prioritize giving, only 51% discussed with advisor
