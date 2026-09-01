# Insurance Illustration Data Exchange Landscape

Condensed knowledge bank of the life insurance illustration data ecosystem.
Discovered 2026-05-22 (Run 165) during sdli-1 research.

## Carrier Quoting / Illustration Platforms

### iPipeline LifePipe
- **Role:** Dominant multi-carrier quoting engine for term and GUL
- **Coverage:** 60+ carriers
- **Users:** 275,000+ advisors
- **Data Formats:**
  - **NQ (Numeric Quote):** Compact numeric representation. Fields encoded as numbered data elements (element 1 = issue age 1, element 2 = issue age 2, element 3 = death benefit, element 4 = annual premium, element 5-N = cash value at each age, element N+1-M = COI schedule)
  - **SO2 (Standard Offer 2):** Structured XML format with carrier-specific product details, full illustration projections, guaranteed vs. non-guaranteed elements, NAIC-compliant disclosure language
- **API:** `https://quoteapi-td0.ipipeline.com` (Swagger available). OAuth2 auth.
- **Endpoints:** POST /v1/quote (submit), GET /v1/quote/{id} (retrieve), POST /v1/quote/export (export)
- **Limitation:** No estate planning integration; no performance monitoring

### WinFlex (now Zinnia, post-2024 Ebix acquisition)
- **Role:** Multi-carrier illustration platform
- **Coverage:** 38+ carriers
- **Users:** 275,000+ users
- **Data Format:** FLX (Flex) — proprietary carrier-agnostic format
- **Acquisition:** Zinnia (Eldridge Industries) acquired Ebix's life and annuity assets in April 2024. Assets include: WinFlex, LifeSpeed (order entry), AnnuityNet, TPP (underwriting), SmartOffice (CRM)
- **Export Formats:** FLX (native), CSV (tabular), XML (structured), PDF (visual)
- **Limitation:** No public API. Requires desktop/web app export.

### Proformex
- **Role:** Leading in-force policy management platform
- **Function:** Data aggregation, analytics, portfolio monitoring for life insurance and annuities
- **Target:** Independent life insurance and advisory firms
- **Pricing:** $50K-$200K+ annual cost
- **API:** Proformex API available for data access
- **Gap:** Standalone platform, no planning integration

### NIC (Network Insured Connect)
- **Role:** Multi-carrier in-force data platform
- **Coverage:** 50+ direct carrier feeds
- **Function:** Aggregates in-force data; enables carriers and distributors to share content
- **API:** NIC Data Exchange API for in-force data access
- **Gap:** Agent-focused, not wealth management focused

## Industry Data Standards

### ACORD OLifE
- ACORD XML data model for life insurance data exchange. Struggled with digitization; slow carrier adoption.

### LIMRA LDEx (LIMRA Data Exchange Standards)
- BCM Standards: Exchange of carrier benefit plan designs with technology providers
- In-force data exchange: Policy status, cash value, death benefit data
- Widely adopted but digitization progress slow

### NAIC Model Regulation #582
- Governs life insurance illustration disclosures
- Must clearly distinguish guaranteed vs. non-guaranteed elements
- Non-guaranteed elements (CR, dividends, COI) must be labeled
- Discloser (carrier) name and phone number required
- **ASOP No. 24:** Actuarial standard for illustrators; disciplined current scale methodology

## Major Carrier API Landscape

| Carrier | API Format | Notes |
|---------|-----------|-------|
| Guardian Life | Proprietary REST API | Strong GUL pricing. XML/CSV/PDF export |
| New York Life | Proprietary REST API | Top mutual carrier |
| MassMutual | Proprietary REST API | Top mutual. Dividend scale methodology |
| Northwestern Mutual | Proprietary REST API | Largest life insurer |
| Lincoln Financial | Proprietary REST API | Strong survivorship GUL pricing |
| Standard Insurance | Proprietary REST API | GUL specialist |
| Penn Mutual | Proprietary REST API | GUL specialist |
| Ameritas | Proprietary REST API | Strong GUL pricing |
| Transamerica | Proprietary REST API | Strong GUL pricing |
| Protectors | Proprietary REST API | GUL specialist |
| Global Atlantic | Proprietary REST API | Strong survivorship |
| National Western | Proprietary REST API | GUL specialist |

## Canonical Data Model (from sdli-1 research)

Core entities for illustration ingestion:

- **CarrierIllustration:** Single carrier's illustration, normalized to canonical schema
  - Fields: carrier_name, carrier_id, product_name, policy_type, health_class_1/2, issue_age_1/2, death_benefit, premium_schedule, projections[], assumptions, source_format, ingestion_status
- **IllustrationProjection:** Single year projection
  - Fields: policy_year, attained_age_1/2, death_benefit, cash_value, cumulative_premiums, cost_of_insurance, policy_fee, surrender_value, dividend_paid, net_amount_at_risk
- **IllustrationAssumptions:** Illustration assumptions
  - Fields: guaranteed_crediting_rate, guaranteed_cost_of_insurance_schedule, guaranteed_death_benefit, guaranteed_cash_value_schedule, projected_crediting_rate, projected_dividend_scale, mortality_table, illustration_date
- **IllustrationComparison:** Side-by-side comparison
  - Fields: client_id, comparison_date, illustrations[], lowest_premium, highest_cash_value, best_cost_per_1000, cv_at_key_ages, db_at_key_ages

## Key Insight

The illustration ingestion gap sits at the intersection of three domains (quoting engines, in-force data platforms, and planning platforms) that have zero overlap. WealthForge can be the first platform to unify them. The canonical data model above is the foundation for this unification.
