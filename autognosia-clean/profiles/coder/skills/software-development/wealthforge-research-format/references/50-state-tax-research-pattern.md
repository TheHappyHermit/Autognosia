# 50-State Tax/Regulatory Data Research Pattern

## When to Use This Pattern

Research any topic where the answer depends on a 50-state (or multi-state) reference database — Social Security taxation, state income tax rules, property tax rates, estate/inheritance taxes, sales tax rates, state-specific retirement income exemptions, and state-level regulatory regimes (auto-IRA mandates, trust codes, insurance laws).

**Signal:** The research question includes phrases like "state-by-state", "all 50 states", "by state", or a specific state comparison ("MN vs WI vs FL").

## Research Phase: Three-Round Parallel Source Discovery

### Round 1: Find the canonical 50-state reference

Search for the authoritative compiled source — someone has already done the 50-state research. The best sources are:

| Source Tier | Type | Reliability | Update Cadence | Best For |
|-------------|------|-------------|----------------|----------|
| **Tax Foundation** | Policy think tank | High | Annual (major publications) | State income tax, SS tax, sales tax, property tax, estate tax |
| **Kiplinger** | Financial media | High | Annual (Jan-Feb) | SS tax, retirement income tax, state-by-state guides, estate tax |
| **Income Lab** | Wealth management software | High | Annual (Mar-Apr) | SS tax + pension + IRA tax by state (advisor-focused) |
| **AARP** | Consumer advocacy | Medium-High | Annual | SS tax (consumer-facing, simpler rules) |
| **SmartAsset** | Fintech | Medium | Annual | Retirement tax friendliness, property tax |
| **SSA.tools** | Independent tool | Medium | Annual | SS tax thresholds by state |
| **TakeHomeTax** | Tax planning startup | Medium | Annual (Apr) | Retirement tax strategy by state, IRMAA brackets, Roth conversion |
| **NationalTaxReports** | Tax reference | Medium | Annual (Apr) | State taxes on pensions, IRAs, 401(k)s (per-state detailed pages) |
| **CountryTaxCalc** | Tax calculator site | Medium | Annual | Interactive retirement tax comparison hub |
| **The Motley Fool** | Financial media | Medium | Annual (Jan) | Estate/inheritance tax by state (best single source for death taxes) |
| **Beancount.io** | Independent blog | Medium | On-demand | OBBBA senior deduction phaseout mechanics and interaction analysis |
| **ACTEC** | Estate law org | High | Annual | State death tax chart (canonical reference for estate/inheritance tax) |

**Search pattern:**
```
web_search(query=f"state-by-state {topic} taxation 2026 all 50 states exemption thresholds")
web_search(query=f"{topic} by state comparison 2026 Kiplinger OR Tax Foundation OR \"Income Lab\"")
web_search(query=f"retirement {topic} tax strategy by state 2026 guide")
```

**Priority:** Tax Foundation → Kiplinger → Income Lab → AARP → secondary sources.

For **estate/inheritance tax** specifically: ACTEC → The Motley Fool → Kiplinger → SmartAsset → Tax Foundation.

### Round 2: Extract and cross-validate

From the canonical source, extract the 50-state matrix. For each state, note:
- Tax status (exempt/partial/full)
- Exemption thresholds (by filing status)
- Phaseout mechanics (rate, increment, income definition)
- Age-based rules (if any)
- Year of latest change

**Cross-validation rule:** Every state's rule must be confirmed by at least TWO independent sources. If Tax Foundation and Kiplinger agree, the rule is likely correct. If they disagree (common for phaseout mechanics), go to Round 3.

**Red flag detection:** If sources disagree on a state's rules, check:
- Tax year (was the state in a phaseout? Did the rule change between source publication dates?)
- Income definition (some sources use AGI, others use "combined income" or "provisional income" — these are different)
- Filing status mixup (single vs MFJ thresholds are often confused)

### Round 3: State-specific deep-dive (for the 8-15 states that need it)

For states with complex rules or source disagreements, go to the **state's Department of Revenue website** or the **official state legislative portal**.

**Search pattern:**
```
web_search(query=f"[state] [topic] exemption subtraction deduction 2026 Department of Revenue")
```

**Official source hierarchy:**
1. State Department of Revenue official page (forms, publications, instructions)
2. State legislative bill text (for recent changes — look for bill numbers from news articles)
3. News articles citing state revenue department announcements (e.g., "WV fully eliminates SS tax starting Jan 1, 2026")
4. Practitioner blogs that cite state tax forms (CPA blogs, state-specific tax prep guides)

**When to use the state's official tax form instructions:**
- For states with unique worksheets (MN Schedule M1SS, UT Form TC-40A Part 3 Code AH, MT Form 2)
- When the phaseout mechanics are unclear from secondary sources
- When the state changed its rules in the current tax year

## Concrete State-Level Formulas (Reference Data)

The following formulas are derived from actual state tax codes and should be hardcoded into the R-50 engine. Each has been verified against at least two independent sources.

### Minnesota SS Phaseout Surcharge
MN exempts 100% of SS for AGI < $85K single / $105K MFJ (2026). For each dollar of AGI above the threshold, the SS subtraction is reduced by $0.33. The effective marginal rate surcharge = state_rate × 0.33.

```python
def mn_ss_phaseout_surcharge(agi, filing_status, ss_amount):
    threshold = 85000 if filing_status == 'single' else 105000
    if agi <= threshold:
        return 0.0
    excess_income = min(agi - threshold, ss_amount / 0.33)  # bounded by full SS phaseout
    return excess_income * 0.33  # Each $1 IRA withdrawal reduces SS exclusion by $0.33
```

**Planning implication:** In MN, a $20K Roth conversion that pushes AGI from $95K to $115K triggers a $5K reduction in SS subtraction, creating $350-$500 in additional state tax. No platform models this interaction.

### New York State Estate Tax Cliff
NY's estate tax exemption is ~$7.35M (2026). If the estate exceeds the exemption by MORE than 5% (~$7.72M), the ENTIRE estate becomes taxable at ~16%.

```python
def ny_estate_cliff(estate_value):
    exemption = 7_350_000
    cliff_threshold = exemption * 1.05  # 105% of exemption
    if estate_value <= exemption:
        return 0.0
    if estate_value <= cliff_threshold:
        return (estate_value - exemption) * 0.16  # tax on excess only
    else:
        return estate_value * 0.16  # tax on ENTIRE estate (the cliff)
```

**Planning implication:** An estate worth $7.5M pays $0 state estate tax. An estate worth $7.73M pays ~$1.24M — a 5% value difference that costs $1.24M in tax. WealthForge must model this cliff precisely; treating estate tax as a simple "value > exemption = tax" is wrong.

### Georgia Retirement Income Exclusion
GA exempts $65K/person of retirement income for age 65+, $35K/person for ages 62-64. Per-person means a married couple can exclude up to $130K total.

```python
def ga_retirement_exclusion(age, single_age, filing_status):
    if age >= 65:
        per_person = 65000
    elif age >= 62:
        per_person = 35000
    else:
        return 0
    exclusion = per_person
    if filing_status == 'mfj' and single_age >= 62:
        exclusion += per_person if single_age >= 65 else 35000
    return exclusion
```

### Colorado Pension/SS Exclusion Timing Window
CO allows up to $24K/person pension income exclusion for 65+. Critical nuance: Some states (CO, ME, MD) reduce pension exclusions when SS is received. Optimal strategy: take pension distributions BEFORE claiming SS to maximize exclusion amount. This is a year-by-year phase-shifting optimization problem.

## Additional Dimensions Beyond the Base Matrix

Every 50-state retirement tax research topic should systematically check for these additional dimensions that interact with the base data:

### Dimension 1: OBBBA Senior Deduction × State Conformity

The OBBBA (July 2025) $6K/$12K senior deduction (2025-2028, phases out 6%/$ above $75K/$150K MAGI) creates a state conformity crisis:
- **Rolling conformity states** (auto-adopt current IRC): Most states — the senior deduction applies at state level
- **Fixed-date conformity states** (CA, NJ, MA): Did NOT adopt OBBBA — no state benefit from senior deduction
- **Partial conformity states** (NY): Adopted some provisions but not others — must verify annually
- **No-income-tax states** (9): No state-level impact

**Research pattern:** For each relevant state, verify conformity_type (rolling/fixed-date/partial) and whether the OBBBA senior deduction has been adopted at state level. This field is NOT in standard tax databases and must be researched separately.

```sql
-- Additional field for state_tax_profiles table
obbba_conformity_status VARCHAR(20) CHECK (
    obbba_conformity_status IN ('conformed', 'not_conformed', 'partial', 'no_income_tax')
);
```

### Dimension 2: Local Income Tax Layer

10 states allow local income taxes (AL, IN, IA, KY, MD, MI, MO, NY, OH, OR, PA). Rates up to 3.75% (Philadelphia). These apply ON TOP of state rates and are almost never modeled.

**Research pattern:** For the 10 affected states, find the maximum local rate and list the specific cities/counties with significant rates. Not all local taxes apply to retirement income — verify per jurisdiction.

| State | Notable Local Tax | Max Rate | Applies to Retirement Income? |
|-------|------------------|----------|-------------------------------|
| OH | Municipal income taxes | 2.5% | Depends on municipality |
| PA | Philadelphia wage tax | 3.75% | Wages only (not retirement dist.) |
| KY | County school taxes | Varies | Generally yes |
| NY | NYC income tax | 3.876% | Yes (residents only) |
| MD | County income tax | 3.20% | Yes |

### Dimension 3: PL 104-94 (4 USC §114) Retirement Income Protection

Federal law protects qualified pension, 401(k), and IRA distributions from taxation by NON-RESIDENT states. A pension from CA paid to a FL resident is taxed by FL (if FL had income tax — it doesn't), NOT by CA.

**Does NOT protect:**
- Non-qualified deferred compensation
- Investment income (capital gains, dividends, interest)
- Earned income (W-2, self-employment)

**Research pattern:** When researching multi-state scenarios (client worked in CA, retired to NV), check whether each income source is a "qualified plan" under PL 104-94. The protection classifier logic:
1. Identify plan type (qualified = ERISA-covered, 401(k), IRA, government pension)
2. If qualified → income may only be taxed by state of RESIDENCE
3. If non-qualified → income may be taxed by state of SOURCE (double taxation risk)

### Dimension 4: Bracket Creep Projection

15 states do NOT index brackets, exemptions, or deductions for inflation (major offenders: NY, NJ, CT, VA, CA, MA, OR, HI). Over a 20-25 year retirement, this silently increases the effective state tax rate by 1-3 percentage points.

**Research pattern:** For each state, determine if brackets/exemptions/deductions are indexed. If not, model the projected bracket drift over N years using historical CPI-U.

**Note:** This interacts with the federal bracket creep (which IS indexed) — state bracket creep compounds on top of federal.

### Dimension 5: Widow's Penalty × State Tax Interaction

State exemptions that are doubled for MFJ filers revert to single levels post-widowhood. State SS exemption thresholds drop by 50%. State tax brackets compress by ~40%.

**Research pattern:** For each state, compute the post-widowhood state tax impact:
- `new_single_exemption = mfj_exemption / 2` (not always exactly half)
- `new_ss_threshold = mfj_ss_threshold / 2` (varies by state — some use different single/MJF ratios)
- `state_widow_penalty = state_tax_mfj - state_tax_single` at same income

### Dimension 6: Roth Conversion × State Taxation Variation

The state tax cost of Roth conversions varies dramatically by state type:
- **Graduated-rate states** (CA, NY, CT, MN, VT): State brackets compress the conversion space — less room for conversions at low rates
- **Flat-tax states** (15 states): Conversion math is simpler — one rate applies to all
- **Full-exemption states** (IL, MS, PA): Conversions may have ZERO state tax cost
- **No-income-tax states** (9): Zero state cost for conversions

**Research pattern:** Calculate the effective state marginal rate on a $X conversion for each state tier. The result determines whether conversions are more or less attractive in each state.

## Data Model Pattern: The 50-State Matrix

Every 50-state research topic produces a canonical database table. The pattern is:

```sql
CREATE TABLE {topic}_matrix (
    state_code CHAR(2) PRIMARY KEY,
    state_name VARCHAR(50),
    {topic}_status ENUM('exempt', 'federal_conformity', 'partial_exemption', 'credit_based', 'fully_taxable'),
    -- Status-specific columns
    exemption_threshold_single DECIMAL(10,2),
    exemption_threshold_joint DECIMAL(10,2),
    exemption_threshold_hoh DECIMAL(10,2),
    exemption_threshold_mfs DECIMAL(10,2),
    phaseout_rate DECIMAL(5,4),
    phaseout_increment DECIMAL(10,2),
    -- Age-based rules (if applicable)
    full_exemption_age INT,
    partial_exemption_age INT,
    -- Metadata
    effective_year INT,
    last_updated DATE,
    source_url VARCHAR(500),
    notes TEXT
);
```

**Additional columns for retirement income research** (when researching broader than just SS tax):

```sql
ALTER TABLE {topic}_matrix ADD COLUMN income_type_exemptions TEXT;
-- JSON blob: {"pension_single":65000,"pension_mfj":130000,"ira":"no_exemption","401k":"exempt","military":"exempt","private_pension":"fully_taxable"}

ALTER TABLE {topic}_matrix ADD COLUMN obbba_conformity_status VARCHAR(20);
-- 'conformed', 'not_conformed', 'partial', 'no_income_tax'

ALTER TABLE {topic}_matrix ADD COLUMN local_tax_max_rate DECIMAL(5,3);
-- Maximum local income tax rate, 0 if none

ALTER TABLE {topic}_matrix ADD COLUMN brackets_indexed BOOLEAN DEFAULT FALSE;
-- Whether brackets/exemptions are inflation-indexed

ALTER TABLE {topic}_matrix ADD COLUMN estate_tax_exemption DECIMAL(12,2);
-- NULL if no state estate tax

ALTER TABLE {topic}_matrix ADD COLUMN has_inheritance_tax BOOLEAN DEFAULT FALSE;
```

**Template variations by topic type:**
- **Income thresholds only** (e.g., SS exemption): threshold columns per filing status
- **Rate structure** (e.g., state income tax brackets): bracket_min, bracket_max, rate
- **Dollar-amount exemptions** (e.g., pension deduction): deduction_amount_single/joint
- **Credit-based** (e.g., Utah SS credit): credit_max, credit_phaseout_threshold, nonrefundable flag

## Verification Phase: Annual Update Workflow

State tax/regulatory rules change frequently. The update workflow is:

1. **Scan for changes**: Check Tax Foundation and Kiplinger for their annual update (usually Jan-Mar)
2. **Identify changed states**: Compare current matrix against new source
3. **Verify each change**: Find the state's actual legislation or revenue department announcement
4. **Update matrix**: Update effective_year, last_updated, and changed fields
5. **Log change**: Record in a changelog table: change_id, state_code, change_date, change_type, description, source_url
6. **Notify affected clients**: Identify any clients whose estimated tax changed due to the update

**Annual change frequency:** 2-5 states change their rules each year (either eliminating SS tax, raising thresholds, or changing phaseout mechanics).

**New source monitoring for 2026+:** The OBBBA conformity situation is fluid. States may adopt the senior deduction in 2026-2027 legislative sessions. Monitor Tax Foundation OBBBA state conformity tracker and state legislative websites quarterly.

## Interaction Identification Pattern

Every 50-state rule interacts with other financial planning features. When researching a state-by-state topic, systematically identify interactions by asking:

1. **Withdrawal optimization**: Does this state rule change the optimal account ordering for withdrawals? (Yes — state SS tax creates a phaseout surcharge on IRA withdrawals)
2. **Roth conversions**: Does this state rule make Roth conversions more or less expensive? (Yes — state SS tax phaseout adds a surcharge to conversion income)
3. **Widow's penalty**: Does this rule affect surviving spouses differently? (Yes — single filer thresholds are typically 50% of MFJ)
4. **ACA subsidies**: Does this rule affect early retirees differently? (Yes — dual AGI constraint with ACA MAGI limits)
5. **Relocation planning**: Is there a significant difference between states? (Yes — the whole point of the matrix)
6. **Married filing separately**: Are MFS thresholds different from half of MFJ? (Often more restrictive)
7. **Other stealth taxes**: Does this rule interact with IRMAA, NIIT, or AMT? (Potentially — state SS phaseout surcharge adds to the stacked marginal rate)
8. **Estate/inheritance tax**: Are there planning opportunities involving relocation to avoid state death taxes? (Yes — moving from MA to NH saves estate tax on estates >$2M)

**Documentation pattern in research:**
```
**Cross-feature interactions identified:**
- [Feature X]: State rule [Y] changes the behavior of feature [X] because [Z]
- Design implication: [Specific change needed in feature X to account for state rule Y]
- No platform currently models this interaction
```

## Common Pitfalls

1. **Assuming all states use the same income definition** — Some use AGI, some use provisional income, some use federal taxable income. Verify the income definition for each state.
2. **Year-mismatch between sources** — If sources cite different years, the rule may have changed. Always convert to a single tax year (preferably the current year).
3. **Phaseout complexity** — Many states have non-linear phaseouts (MN: $1 per $3; MT: percentage-based; CT: 25% cap). Simple "yes/no" exemption status misses the most important tax planning insight.
4. **Forgetting MFS** — Married filing separately is the most penalized filing status in every state. Always verify MFS thresholds separately.
5. **Ignoring recent legislation** — States frequently eliminate or reduce these taxes. A source from last year may be wrong. Search for "[state] 2026 eliminates [...] tax" specifically.
6. **Treating "exempt" as "always $0"** — Some states are "exempt" for most but not all (e.g., NM exempts SS for AGI below $100K/$150K — above that it's fully taxable). Distinguish "full exemption" from "conditional exemption."
7. **Not checking the state's actual form** — Secondary sources often summarize incorrectly. When in doubt, read the state's tax form instructions.
8. **Forgetting the estate tax cliff** — NY's estate tax isn't just "value > exemption = tax." If the value exceeds the exemption by ≤5%, only the excess is taxed. If it exceeds by >5%, the entire estate is taxed. This is a step function, not a linear threshold. Always model the exact state's estate tax formula (MA: no exemption beyond $2M dollar-for-dollar; NY: 5% cliff; OR: $1M flat; WA: $2.2M sliding).
9. **Assuming "retirement income" means the same thing across income types** — MD excludes 401(k) distributions but NOT IRA distributions. RI similarly excludes 401(k)s but not IRAs. A client rolling an IRA into a 401(k) can suddenly qualify for a state tax exclusion. Always research per-income-type treatment, not a blanket "retirement income" rule.
10. **Missing the PL 104-94 protection layer** — When researching multi-state scenarios (client worked in CA, retired to NV), check whether each income source is a "qualified plan" under federal law. Not doing so can overstate the client's actual state tax liability.
11. **Ignoring the OBBBA state conformity mess** — The senior deduction ($6K/$12K) is not automatically available in every state. California (fixed-date conformity to IRC 2015) does not adopt OBBBA. Researching a Roth conversion in CA without checking OBBBA conformity produces a stale result: conversions in CA lose the OBBBA deduction floor that makes some conversions more attractive in conforming states.
