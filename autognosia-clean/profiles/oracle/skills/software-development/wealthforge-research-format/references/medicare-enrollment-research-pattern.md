# Medicare Enrollment Research Pattern (v1)

## When to Use This Pattern

Load this reference file when researching ANY Medicare enrollment planning topic:
- Initial Enrollment Period (IEP) planning
- Medigap vs Medicare Advantage decision
- Part D plan selection and optimization
- HSA/Medicare coordination timing
- Employer coverage coordination at 65
- COBRA-to-Medicare bridge
- IRMAA prediction and appeal (SSA-44)
- Medicare × Social Security claiming coordination
- State-specific Medigap/MA/Part D rules
- Medicare enrollment for cross-border/returning retirees
- Dual-eligible (Medicare + Medicaid) coordination

This pattern COMPLEMENTS `references/insurance-research-pattern.md` (which covers LTC, Life, Disability). Medicare enrollment is a distinct domain with different source types, regulatory bodies, and research techniques.

## Required Source Hierarchy — Medicare Enrollment

### Tier 1 — Official Government Sources (Start Here)

These are the ONLY authoritative sources for premium amounts, bracket thresholds, and enrollment period dates:

1. **CMS (Centers for Medicare & Medicaid Services)**
   - `cms.gov/newsroom/fact-sheets/` — Annual Part A/B premium and deductible announcements (released mid-November for following year)
   - `cms.gov/data-research/statistics-trends-and-reports/medicare-advantagepart-d-contract-and-enrollment-data/` — MA/Part D enrollment data, plan availability
   - `medicare.gov/plan-compare/` — Plan Finder for Part D/MA comparison (the only official source of formulary data and star ratings)
   - **Key publications:** Annual "Medicare Parts A & B Premiums and Deductibles" fact sheet, Part D Redesign Program Instructions
   - **Reliability:** Always loads via web_extract (lightweight HTML pages). Also available as PDF press releases.

2. **MedPAC (Medicare Payment Advisory Commission)**
   - `medpac.gov/` — Annual "Status of the Medicare Advantage Program" report (January). The most comprehensive MA market analysis. Usually PDF format.
   - Covers: MA enrollment trends, star ratings, payment rates, plan availability, Medicare spending data
   - **Reliability:** PDF downloads via curl work reliably.

3. **SSA (Social Security Administration)**
   - IRMAA determination letters and SSA-44 appeal form
   - Part B premium deduction from SS benefits, hold-harmless provisions
   - `ssa.gov/forms/ssa-44.pdf` — IRMAA appeal form (critical for widget design)

4. **IRS**
   - HSA contribution limits and Medicare coordination rules
   - Publication 969 (Health Savings Accounts) for HSA/Medicare crossover rules
   - IRC Section 223 for HSA eligibility rules post-Medicare enrollment

### Tier 2 — Authoritative Consumer-Facing Sources

These sources compile and explain official data in accessible formats. Use for cross-validation and plain-English explanations:

5. **KFF (Kaiser Family Foundation)**
   - `kff.org/medicare/` — Best independent Medicare policy analysis. Annual "State of Medicare" reports, Part D snapshot, MA market analysis.
   - **Key publication:** "A Current Snapshot of the Medicare Part D Prescription Drug Benefit" (updated annually)
   - **Reliability:** web_extract works reliably. KFF pages are well-structured HTML.

6. **Kiplinger**
   - `kiplinger.com/retirement/medicare/` — Annual Medicare premiums and IRMAA brackets guide (Jan-Feb). Most-cited consumer-facing IRMAA reference.
   - **Key publication:** "Medicare Premiums [Year]: IRMAA Brackets" — Complete bracket tables by filing status
   - **Reliability:** May be paywalled or truncated. Search for "Kiplinger Medicare IRMAA brackets" as fallback.

7. **AARP**
   - `aarp.org/medicare/` — Comprehensive Medicare guides with calculator tools. Annual "What's New for Medicare" previews.
   - **Key publications:** Medicare drug changes (IRA implementation), late enrollment penalty guides, Medigap vs MA decision tools
   - **Reliability:** Reliable web_extract. May need to bypass age-gate articles.

### Tier 3 — Practitioner & Advisor Sources

These sources provide the decision frameworks and strategy analysis that form the basis of build specs:

8. **Kitces.com (Nerd's Eye View)**
   - `kitces.com/blog/figuring-out-best-healthcare-early-retirement-medicare-cobra-aca-exchange/` (Aug 2019) — The definitive COBRA/ACA/Medicare decision framework for financial planners. Core algorithm for employer coverage coordination widgets. **Critical source.**
   - `kitces.com/blog/2018-medicare-open-enrollment-period-oep-annual-election-planning-for-2019/` (Nov 2018) — Medigap/MA annual review discipline. Annual enrollment period workflow.
   - `kitces.com/blog/understanding-the-medicare-part-b-premium-hold-harmless-provisions-for-social-security-beneficiaries/` (Aug 2015) — Part B premium mechanics, hold-harmless provisions.
   - `kitces.com/blog/retirement-health-savings-account-and-medicare/` (Jan 2016) — HSA/Medicare coordination, triple-tax advantage, qualified expenses.
   - **Fallback:** Kitces.com may be unreachable. Search practitioner blogs citing these articles (Henningfield CPA, Beancount.io, Wealth Enhancement Group).

9. **SHRM (Society for Human Resource Management)**
   - `shrm.org/topics-tools/news/benefits-compensation/` — Revised COBRA notices, Medicare mistake warnings, employer coverage coordination. Critical for verifying COBRA/Medicare trap documentation.

10. **NCOA (National Council on Aging)**
    - `ncoa.org/article/` — HSA/Medicare guides, late enrollment penalties, Medicare Savings Programs. Good for dual-eligible and low-income client workflow research.

11. **FinanceWonk / The Finance Buff (Harry Sit)**
    - `financewonk.com/references/medicare-irmaa` — Most reliable independent IRMAA reference. Complete bracket tables by year and filing status, with projected future thresholds. MFS penalty explained. SSA-44 guide. Updated annually.
    - `thefinancebuff.com/medicare-irmaa-income-brackets.html` — Multi-year IRMAA projections (current year + 3 future years). Critical for Roth conversion interaction research.

### Tier 4 — Industry & Academic Sources

12. **Chartis / Healthscape**
    - Annual "Medicare Advantage market reset" analysis. MA enrollment trends, plan withdrawals, star rating changes. Best source for competitive MA data (2026: enrollment slowing, plan withdrawals up 40%).

13. **Cerulli Associates**
    - Advisor Medicare planning gap data. Annual "U.S. Advisor Metrics" report. Key stat: 67% of clients ask about Medicare, only 32% of advisors confident.

14. **Milliman**
    - `milliman.com/en/insight/` — MA-PD plan analysis, $0 premium PPO trends, actuarial Medicare cost projections. Good for MA market structure research.

15. **AHIP (America's Health Insurance Plans)**
    - Medicare Advantage and Part D industry surveys. Consumer sentiment data. Source for "60% of enrollees cite confusion" stats.

### Tier 5 — State-Specific Sources

16. **State Departments of Insurance**
    - Medigap rate filings, state-specific guaranteed issue protections, Medicare Savings Program eligibility. Search "[state] Department of Insurance Medicare supplement rate filing [year]".
    - Critical for verifying state-specific Medigap GI rights beyond federal law (NY, CT, MA, CA, RI, WA, OR, AZ, NV, VT, CO, ME have additional protections).

17. **State Health Insurance Assistance Program (SHIP)**
    - `shiphelp.org/` — Free counseling, state-specific Medicare guides. Good for validating dual-eligible and MSP workflows.

## Source Hierarchy Flowchart

```
Research Question → Is it a specific number/date? 
  → YES → Tier 1 (CMS official) ONLY. Do NOT cite secondary sources for premium amounts or bracket thresholds.
  → NO → Is it an enrollment rule or penalty?
    → YES → CMS + KFF cross-validation. Kitces.com for practitioner interpretation.
    → NO → Is it a strategy/decision framework?
      → YES → Kitces.com primary. Cross-validate with AARP/SHRM practitioner guides.
      → NO → Is it market/trend data?
        → YES → Chartis, MedPAC, KFF. Cross-validate with Milliman.
        → NO → Is it state-specific?
          → YES → State DOI + SHIP cross-validation. Use FinanceWonk as national cross-reference.
```

## Six-Widget Ecosystem (From Medicare Enrollment Planner Research)

Every Medicare enrollment planner entry should design some or all of these widgets:

| Widget ID | Name | Purpose | Primary Audience |
|:--|:--|:--|:--|
| MP-1 | Medicare Enrollment Timeline | Horizontal timeline showing 24-month IEP window with color-coded milestones | Client |
| MP-2 | Medigap vs MA Decision Card | Side-by-side score comparison with confidence gauge | Advisor (shared with client) |
| MP-3 | IRMAA Prediction Gauge | Projected IRMAA tier with surcharge dollar estimate and SSA-44 trigger | Advisor |
| MP-4 | HSA Stop Contribution Warning | Safe stop date, excess contribution risk, excise tax estimate | Client |
| MP-5 | Employer Coverage Decision Tree | Flowchart with 3 branches (20+, <20, COBRA/retiree) | Client |
| MP-6 | 10-Year Cost Projection Chart | Stacked area chart comparing Medigap vs MA total costs | Advisor (shared with client) |

## Key Data Points to Capture Per Research Run

For ANY Medicare enrollment topic, always capture and hardcode these values (from CMS official sources):

```yaml
medicare_parameters:
  year: 2026  # Research year
  part_b:
    standard_premium: 202.90  # Monthly
    deductible: 283  # Annual
    late_penalty: "10% per 12-month period, for life"
  part_d:
    national_base_premium: 38.99  # 2026 monthly
    max_out_of_pocket: 2100  # Annual (inflation-adjusted from $2,000 in 2025)
    deductible: 590  # Standard annual
    initial_coverage_limit: 5030  # Approximate
    late_penalty: "1% of base premium per uncovered month, for life"
  irmaa:
    part_a_deductible: 1676  # Per benefit period
    base_premium_low: 202.90
    base_premium_high: 689.90
    tiers: 5
    lookback_years: 2  # 2026 premiums use 2024 income
```

## Common Pitfalls

1. **COBRA is NOT creditable coverage for Part B delay.** This is the most expensive single Medicare mistake. Never assume COBRA protects from late enrollment penalties. Cite SHRM guidance and DOL revised notices.

2. **Retroactive Part A contamination.** Medicare Part A can be retroactive 6 months when applied for after 65. HSA contributions during that retroactive period become excess. The safe stop date is 6 months BEFORE planned Medicare enrollment, not the enrollment date.

3. **MFS IRMAA paradox.** Married filing separately has an IRMAA threshold of $109K (same as single) but the surcharge is calculated per-person. MFS filers often hit Tier 3-4 IRMAA with moderate combined household income. Always check filing status.

4. **Medigap underwriting trap.** The Medigap Open Enrollment Period (6 months starting at 65 + Part B enrollment) is the only guaranteed-issue window in most states. Once past it, medical underwriting can deny or price up Medigap. This is the #1 risk for MA enrollees who later want to switch.

5. **Part D donut hole elimination ≠ free drugs.** The IRA eliminated the coverage gap (donut hole) in 2025, replacing it with a $2,100 out-of-pocket cap. But beneficiaries still pay coinsurance (25% in initial coverage phase). The cap came alongside the $2,000 deductible in some plans — total costs vary.

6. **Spousal coordination failure.** When one spouse turns 65 while the other is still working with employer coverage, BOTH spouses need separate analyses. The 65-year-old's spousal coverage under the working spouse's <20-employee plan does NOT qualify for Part B delay.

7. **VA benefits are NOT creditable coverage.** Veterans often delay Part B because they have VA benefits. VA coverage is limited to VA facilities and does NOT qualify as creditable coverage for Part B delay. The result: permanent Part B penalty.

8. **Cross-border returning citizens have no SEP.** US citizens returning from overseas at 70+ who never enrolled in Medicare have no Special Enrollment Period. They must wait for General Enrollment Period (Jan-Mar, coverage starts July 1) and face permanent Part B penalty.
