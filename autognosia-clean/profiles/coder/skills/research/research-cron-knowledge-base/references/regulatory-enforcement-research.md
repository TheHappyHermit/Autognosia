# Regulatory Enforcement Research for Competitive Intelligence

## When to Use This Pattern

Add regulatory enforcement research as a standard dimension when analyzing any SEC-registered competitor (RIA, broker-dealer, or financial advisory platform). Skip this when the competitor is not regulated (pure calculator/planning tools that explicitly disclaim fiduciary duty).

## Source Types (in order of reliability)

### 1. SEC IAPD (Investment Adviser Public Disclosure) — Primary Source
- **URL:** https://adviserinfo.sec.gov/firm/summary/{CRD}
- **What it yields:** Form ADV, registration status, disclosure history, past regulatory actions
- **How to find the CRD number:** Search the competitor's name at adviserinfo.sec.gov, or find it in their website footer/fine-print disclosures ("SEC-registered investment adviser CRD# XXXXXX")
- **What to extract:** Regulatory AUM (compare to public claims), number of clients, disciplinary history, Form ADV Part 2 brochure for business description

### 2. SEC Administrative Proceedings — Primary Source
- **URL:** https://www.sec.gov/files/litigation/admin/YYYY/ia-XXXX.pdf
- **What it yields:** Exact allegations, settlement terms, cease-and-desist orders, fines
- **How to find:** Search `site:sec.gov "Company Name" "administrative proceeding"` or `site:sec.gov/litigation/admin "Company Name"`
- **Key sections to read in an SEC order:**
  - **Summary** — High-level description of violations
  - **Respondent** — Legal entity name, registration details
  - **Facts** — The detailed allegations (this is the competitive intelligence goldmine — it reveals what claims the company was making vs. what they could actually do)
  - **Settlement terms** — Fine amount, compliance undertakings, cooperation credit
- **What to watch for:** The SEC order reveals specifics about the company's operations, marketing claims, internal policies, and actual technical capabilities that are not available from any other source

### 3. SEC Press Releases — Secondary Source
- **URL:** https://www.sec.gov/news/press-release/
- **What it yields:** Summary announcements of enforcement actions (less detail than admin proceedings but easier to find)
- **Search:** `site:sec.gov "Company Name" "charges"`

### 4. Legal/Financial Press Analysis — Tertiary Source
- **Sources:** Harvard Law CG Forum (corpgov.law.harvard.edu), Citywire, InvestmentNews, ThinkAdvisor, Financial Planning
- **What it yields:** Industry context, analysis of enforcement trends, expert commentary on the significance
- **How to use:** Confirm and contextualize the primary sources — don't rely on press alone for facts

## Enforcement Action Taxonomy — What to Look For

### AI Washing (most relevant for 2024-2026 wealthtech competitors)
- False claims about AI capabilities, sophistication, or regulatory status
- Claiming to be "the first" AI financial advisor without substantiation
- Overstating asset scale on platform or AUM
- Making unsubstantiated performance claims
- **Real case:** Global Predictions (PortfolioPilot) — SEC March 2024 — claimed $6B+ platform assets (~$187M actual), "first regulated AI financial advisor," false TLH service claims, unsubstantiated performance

### Marketing Rule Violations (SEC Amended Marketing Rule 206(4)-1)
- Advertising hypothetical performance without required policies/procedures
- Paid testimonials without disclosure
- Cherry-picked performance without relevant benchmarks
- Incomplete or misleading disclosure statements

### Compliance Infrastructure Failures
- Failure to implement written compliance policies
- Failure to conduct required annual compliance reviews
- Code of Ethics violations
- Custody rule violations

### Contract Violations
- **Hedge clauses** — Language in advisory contracts that misleads clients into thinking they waived non-waivable causes of action
- **Unilateral contract changes** — Terms that allow the advisor to change contract terms without advance client notice
- Missing or inadequate Form ADV filing updates

### Registration Status Issues
- Operating as an RIA without proper registration
- Exempt reporting adviser claiming exemptions they don't qualify for
- Late or incomplete Form ADV/Form CRS filings

## Correlation Table: Claims vs. Reality

When analyzing a competitor's marketing claims vs. what SEC documents reveal, this correlation table helps structure the competitive analysis:

| Claim Type | Marketing Statement | SEC Reality | Competitive Implication |
|------------|-------------------|-------------|------------------------|
| Asset Scale | "$30B+ on platform" | $187M regulatory AUM (Form ADV) | "On platform" ≠ "managed" — AUA vs AUM distinction matters |
| AI Sophistication | "First regulated AI financial advisor" | Chatbot does not generate allocation recommendations (SEC finding) | AI claim may exceed actual automated advisory capability |
| Service Availability | "Tax-loss harvesting" | Service not actually offered at time of claim | Features may be pre-announced or aspirational |
| Performance | "Outperformed benchmark by X%" | Unsubstantiable claims | Verify performance claims independently or discount them |

## Competitive Analysis Framework — How to Use Enforcement Data

### Severity Assessment
- **Minor/Procedural:** Missing filing deadlines, paperwork violations, single client complaint. Competitor impact: low — these are common.
- **Moderate:** Marketing rule violations, one-off false claim, inadequate policies. Competitor impact: medium — indicates compliance immaturity.
- **Severe:** Systematic fraud, repeated false claims, AI washing, client harm. Competitor impact: high — reveals unreliable competitor with sustainability risk.

### Timing Analysis
- **Pre-funding enforcement:** Suggests founder inexperience or corner-cutting — high risk for investor exit
- **Post-funding enforcement:** Suggests growth outpacing compliance infrastructure — survivable if addressed
- **Ongoing/multiple enforcements:** Pattern of non-compliance — structural rather than one-off
- **Clean pre-funding but later enforcement:** Most common pattern as companies scale and attract SEC attention

### Positioning the Enforcement Insight
In competitive intelligence or investor narrative context, SEC enforcement data supports these claims:
- **Differentiation:** "Competitor X was SEC-charged for AI washing; our capability claims are verified and built on genuine algorithmic optimization, not marketing."
- **Risk assessment:** "Competitor's compliance history creates partnership/custody risk — would a custodian want to work with a firm that has an active cease-and-desist?"
- **Advisor trust:** "Advisors who must document their due diligence will hesitate to recommend a platform with SEC enforcement history to their clients."

## Pitfalls

1. **Do not conflate AUA and AUM.** "Assets on platform" (AUA) is always larger than regulatory assets under management (AUM). Many DTC platforms claim AUA as a growth metric but file much smaller regulatory AUM. The gap is expected — but the ratio tells you something about the business model.

2. **Form ADV AUM is often stale.** Filed annually with a quarter lag. The number in the most recent filing may be 6-18 months old.

3. **SEC enforcement does not mean the company is out of business.** PortfolioPilot continued growing after its March 2024 settlement. The market often overlooks enforcement history. Your competitive analysis should note the history but calibrate the threat level to current reality.

4. **Challenge of "principal/main regulator" (My number 1 issue).** Not all investment adviser firms are SEC-regulated. Some are state-regulated (under $100M AUM). SEC IAPD only shows SEC-registered firms. For state-regulated firms, search individual state securities regulator databases.

5. **CRD number is the key.** Without the CRD number, searching SEC databases is difficult. Extract the CRD from the competitor's website disclosures (usually in footer or compliance page). If not visible, search the firm name at adviserinfo.sec.gov.

## Related Research Patterns

- **Cross-reference with Form ADV Part 2 brochure** — The firm's written disclosure document often describes services, fees, conflicts, and disciplinary history in prose. Good for understanding business model evolution.
- **Compare year-over-year ADV filings** — Changes in AUM, number of clients, or disclosure items between filing years reveal growth trajectory and emerging issues.
- **Cross-reference with SEC "AI washing" enforcement initiative** — The SEC launched a specific AI enforcement initiative in 2024. Multiple AI advisor cases (Global Predictions, Delphia) were announced on the same day — a coordinated sweep that signals SEC attention to the AI wealth management segment.

## Discovered Via

PortfolioPilot DTC AI Wealth Platform research (2026-05-15) — SEC Order IA-6574 against Global Predictions, Inc. revealed false AI claims, overstated asset scale, unsubstantiated performance claims, and marketing rule violations that were not discoverable from the company's marketing materials alone.
