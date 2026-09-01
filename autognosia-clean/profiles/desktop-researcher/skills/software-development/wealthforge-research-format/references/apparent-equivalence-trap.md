# Surface-Level Equivalence Trap — Research Pattern

## What It Is

A recurring pattern in wealth management research where **two things that appear equivalent under one set of rules diverge critically under another set.** The surface-level similarity causes advisors (and software) to treat them identically, missing a material difference that drives planning decisions.

## Canonical Example from This Session

**Roth 401(k) vs Roth IRA for Inherited RMDs:**

| Dimension | Roth 401(k) | Roth IRA |
|-----------|-------------|----------|
| Lifetime RMDs (owner) | Eliminated 2024 (SECURE 2.0 §325) | Never required |
| **Inherited RMD (annual, pre-death RBD)** | **Required** | **NOT required** |
| Inherited RMD rule source | Participant's actual RBD determines | Owner always treated as died BEFORE RBD |
| Heir's experience | Annual mandatory withdrawals + 10-year depletion | No annual withdrawals — just 10-year depletion |

**The Trap:** On the surface, "Roth = Roth." Both are after-tax, both grow tax-free, both have no lifetime RMDs (since 2024). But the inherited RMD rule diverges — and fewer than 15% of advisors know this.

**The Cost:** A $300K Roth 401(k) annual RMD for a 50-year-old heir is ~$7,500-$10,000/year for 10 years, forcing early withdrawals that could have grown tax-free in a Roth IRA.

## Where This Pattern Appears in WealthForge Research

| Topic | Apparent Equivalence | Hidden Divergence | Research Entry |
|-------|---------------------|-------------------|----------------|
| Roth 401(k) vs Roth IRA | Both "Roth" — no lifetime RMDs | Inherited RMD rules differ | 2026-05-16 Roth 401(k) RMD Avoidance |
| Standard deduction vs Itemized | Both reduce taxable income | State conformity, senior deduction phaseout, SALT cap interaction | 2026-05-16 Standard Deduction Trap |
| 401(k) vs IRA (RMD deferral) | Both "retirement accounts" | Still-working exception only applies to current employer's plan (not IRAs) | Kitces still-working exception |
| QCD vs DAF vs Stock Donation | All "charitable giving" | Income limit, deduction floor, NIIT interaction, state conformity differ | 2026-05-15 Charitable Giving |
| MFJ vs Single filing status | Both "filing statuses" | Post-widowhood: brackets halve, IRMAA compresses, NIIT threshold drops | Widow's Penalty research |
| Traditional 401(k) vs Traditional IRA | Both "pre-tax" | RMD start age, still-working exception, creditor protection, QCD eligibility differ | RMD Research |
| Roth employer match vs Roth employee deferral | Both "Roth" in 401(k) | Employer match is taxable W-2 income (2024+ optional); employee deferral is not | 2026-05-16 Roth 401(k) research (rk-6) |
| Multiple SPIA contracts vs One SPIA | All "annuity income" | State guaranty limits per contract, ladder vs lump-sum mortality credit optimization | Annuity research (ann-1) |

## How to Detect and Handle This Pattern

### Detection Questions

1. **"What rules apply?" checklist:** When researching any account type or strategy, list ALL rule sets that apply: lifetime RMDs, inherited RMDs, creditor protection, contribution limits, tax treatment of distributions, state treatment, QCD eligibility, still-working exception, early withdrawal penalty exceptions. Compare across all apparently-similar types.

2. **The beneficiary perspective:** Many equivalences hold during the owner's lifetime but diverge upon inheritance (Roth 401(k) vs Roth IRA, stretch IRA vs 10-year rule, spousal vs non-spousal inheritance).

3. **The regulatory effective date check:** If two types are governed by different statutes, check whether one was updated and the other wasn't. Roth 401(k) lifetime RMDs were eliminated by SECURE 2.0 §325 (2024), but the inherited Roth 401(k) RMD rules come from the older §401(a)(9) framework.

4. **"What does every advisor assume?" test:** If an industry norm assumes equivalence (e.g., "Roth 401(k) = Roth IRA for RMD purposes"), that assumption is your research target.

### Research Structure

When you identify an apparent-equivalence trap, the BUILD SPEC and KEY SOURCES sections should include:

- **Side-by-side comparison table** (like the one above) showing each dimension where rules diverge
- **The "When These Diverge" analysis** — what triggers the divergence? (Death after RBD? Age threshold? State of residence? Plan document provisions?)
- **The "Why Most Advisors Get This Wrong" analysis** — what specific heuristic or surface similarity causes the error?
- **The "WealthForge Unbundle" widget** — a UI widget that shows the two apparently-equivalent options side by side with their REAL differences highlighted (see Widget RK-1 from the Roth 401(k) research)

### When NOT to Use This Pattern

- When two things are genuinely equivalent (e.g., Roth 401(k) and Roth IRA for lifetime Roth RMD post-2024 — genuinely equivalent, no divergence for the living owner)
- When the divergence is well-known and documented in advisor textbooks (pre-tax vs Roth divergence is already well-understood)
- When the divergence only affects <1% of clients (obscure edge cases that aren't worth a feature)

## Integration with Existing Skill Patterns

- This pattern frequently produces **new research topics** (Angle 4 from Systematic Decomposition — "The Gap Nobody Builds"). The divergence itself becomes a feature opportunity.
- The side-by-side comparison table style feeds directly into the **UI/UX section** (Section 7) as a widget design pattern.
- When the divergence involves regulatory asymmetry (one type follows one statute, the other follows different statute), this triggers the **Multi-Pass Constraint Optimization** pattern from the BUILD SPEC guidance.
