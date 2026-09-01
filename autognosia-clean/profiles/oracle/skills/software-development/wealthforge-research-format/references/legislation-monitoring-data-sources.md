# Legislative Monitoring Data Sources for WealthForge

## Overview

Data sources for active state legislation monitoring (uhnw-01d-1a-1-2c-2). WealthForge's monitoring stack uses three complementary layers.

---

## Layer 1: Primary — LegiScan API

**URL:** https://legiscan.com/legiscan

**Coverage:** All 50 states, DC Council, US Congress

**API provides:**
- Bill details: full text, titles, summaries, descriptions
- Status tracking: introduced → committee → hearing → passed → vetoed → enacted
- Sponsor information: introducer, co-sponsors, committee assignments
- Vote records: roll call votes with member positions
- Weekly datasets: complete session snapshots in JSON/CSV (updated Sundays)
- Programmatic JSON access for automated ingestion

**Pricing:** Professional accounts start at ~$300/month per state; multi-state packages scale with jurisdictions. API access requires professional or enterprise tier.

**Estimated cost for 50 states:** ~$10,000–$15,000/year

**Strengths:** Most comprehensive coverage, structured API, reliable weekly dumps
**Weaknesses:** Paid service, latency between bill action and API update

---

## Layer 2: Secondary — State Government Direct Feeds (Free)

### State Legislature APIs (REST)
- **California:** leginfo.legislature.ca.gov — Bill search, status, text
- **Texas:** capitol.texas.gov — Bill tracking with API access
- Most states provide REST APIs for bill search and status

### RSS/Atom Feeds
- Many states publish bill status updates via RSS
- Useful for lightweight monitoring without API keys

### Scraping Layer
- For states without APIs, lightweight scraper extracts bill data from HTML pages
- Target: bill list pages, bill detail pages, status change pages

### NCSL Databases
- **URL:** https://www.ncsl.org/technology-and-communication/ncsl-50-state-searchable-bill-tracking-databases
- National Conference of State Legislatures maintains searchable bill tracking databases for all 50 states
- Free, comprehensive, reliable
- Good fallback when state APIs are down

---

## Layer 3: Tertiary — Professional Services Integration

### Bloomberg Tax / CCH
- Professional tax research with state-specific alerting
- Expert interpretation of legislation (not just raw data)
- Cost: ~$15,000–$30,000/year per advisor
- API access for automated ingestion

### Thomson Reuters Checkpoint
- State tax law monitoring with expert commentary
- Similar to Bloomberg Tax, expensive, not client-facing

### Wolters Kluwer
- State compliance alerts and tax law updates
- Used by many accounting firms for state tax monitoring

### Big 4 State Tax Bulletins
- PwC, KPMG, Deloitte publish periodic state-specific tax change summaries
- High-value for UHNW clients with multi-state exposure
- Free/public — no API needed, just monitoring

---

## Competitive Legislative Tracking Platforms

### BillTrack50
- **URL:** https://www.billtrack50.com/info/
- State and federal bill and regulation tracking
- Government relations platform — NOT wealth management focused
- Cost: subscription-based, pricing not public

### GovHawk
- **URL:** https://govhawk.com/
- Legislative and regulatory tracking for legal/compliance/gov affairs teams
- Same gap — no wealth management context
- Pricing not public

### State Net (LexisNexis)
- **URL:** https://www.lexisnexis.com/en-us/products/state-net.page
- Leading online legislative and regulatory intelligence for 50 states + Congress
- Professional service: monitor, evaluate, influence proposals
- Expensive, not client-facing, not integrated with financial planning

### MultiState
- Staffed legislative tracking service
- High-touch, expensive, not scalable
- Provides human analysts, not API access

---

## WealthForge Competitive Gap

No existing platform combines:
1. Multi-state legislative monitoring
2. Automatic tax strategy classification (QSBS, QOF, PPLI, etc.)
3. Client-specific impact analysis
4. Actionable mitigation recommendations

WealthForge would be the first to offer this integrated capability.

---

## Implementation Priority for 50-State Coverage

**Tier 1 (Immediate):** CA, NY, TX, FL, IL, PA, OH, GA, NJ, NC — 10 priority states via LegiScan API
**Tier 2 (Weeks 5–8):** Remaining states via LegiScan expansion + direct feeds
**Tier 3 (Ongoing):** Professional services integration for high-value clients

---

## Sources

- LegiScan API documentation (https://legiscan.com/legiscan)
- LexisNexis State Net (https://www.lexisnexis.com/en-us/products/state-net.page)
- BillTrack50 (https://www.billtrack50.com/info/)
- GovHawk (https://govhawk.com/)
- MultiState (https://www.multistate.us/)
- NCSL Bill Tracking Databases (https://www.ncsl.org/technology-and-communication/ncsl-50-state-searchable-bill-tracking-databases)
- Research entry uhnw-01d-1a-1-2c-2 (RESEARCH.md)
