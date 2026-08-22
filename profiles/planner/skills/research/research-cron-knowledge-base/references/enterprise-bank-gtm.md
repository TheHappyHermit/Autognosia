# Enterprise Private Bank Go-to-Market in WealthTech — Reference

## The Four Bank Tech Strategy Archetypes

Understanding a bank's technology strategy is the first step in knowing whether it's a viable partner target.

| Bank | Tech Strategy | Tech Budget | Key Platform | Entry Difficulty |
|------|--------------|-------------|--------------|-----------------|
| **JPMorgan** | Build (in-house) | $19.8B/yr (2026) | Connect Coach AI (advisors), LLM Suite (200K employees), proprietary portfolio systems | **Hardest** — internal build is default. Entry requires deep specialization (e.g., Addepar for alts reporting). Best via niche gaps in existing stack. |
| **Citi** | Partner (platform-led) | Smaller but growing | Advyzon (UMA tech + TAMP), Citi Sky (Google Gemini via Citigold), BlackRock (portfolio solutions) | **Most receptive** — Andy Sieg's pivot from lending to investment-centric wealth, replacing legacy. Willing to bet on non-incumbent partners. |
| **Morgan Stanley** | Hybrid (in-house + selective partners) | Not disclosed | UMAX (in-house UMA), Addepar (PWM seit 2017), E*Trade, crypto capabilities | **Moderate** — strong in-house DNA but proven willingness to partner at PWM level. Addepar won MS Fintech Award. |
| **Goldman Sachs** | Custody-first (strategic investment) | Not disclosed | GeoWealth ($42.5M strategic investment), Ayco (workplace financial health) | **Indirect** — GS uses minority investments rather than platform partnerships. Partner with GeoWealth, not GS directly. |

## The Addepar Bank Playbook

Addepar has the most validated enterprise bank GTM in wealthtech, with 6 partnerships forming a repeatable pattern:

| Bank | Geography | Scale | What Addepar Provides |
|------|-----------|-------|-----------------------|
| **HSBC US Private Bank** | United States | $65B AUM | Consolidated performance reporting. Alts reporting as key differentiator. |
| **HSBC UK Private Banking** | UK → Channel Islands → Luxembourg | 15M+ UK customers | First major UK bank to adopt Addepar. Expanding regionally. |
| **J.P. Morgan Private Bank** | United States | Largest private bank (~$12B revenue) | Integration for Family Office & Lifestyle Services. JPM Omni Trust integration. |
| **LGT Wealth Management UK** | UK (Liechtenstein-backed) | CHF 359.6B, 30+ locations, 6,000+ employees | Front-office and client service platform. Multi-currency, cross-border, private markets. |
| **Itaú Private Bank** | Brazil (exclusive) | R$880B total allocated capital, ~30% Brazilian market share | **Exclusive** in Brazil. Holistic global wealth view (onshore R$660B + offshore R$162B). |
| **Morgan Stanley PWM** | United States | Top PWM teams (since 2017) | Data aggregation, performance reporting, client portal. Awarded MS Fintech Award. |

**The pattern:** Single-region single-use-case deployment → prove value → expand geographically + functionally. Each bank win becomes a reference for the next.

**What banks cite as Addepar's differentiators:**
1. **Alternatives data management & reporting** — consistently cited as #1
2. **Consolidated global portfolio views** — cross-custodian, multi-currency, cross-border
3. **Financial Graph data model** — handling complex entity ownership (trusts, LLCs, partnerships)
4. **Customizable white-labeled reporting** — minimal IT support needed

**What Addepar does NOT sell to banks:** financial planning, native tax optimization beyond cap gains, client onboarding workflows, CRM.

## The Advyzon Citi Wealth Breakthrough (April 2026)

**The most significant enterprise bank wealthtech deal in recent years.**

**Deal structure:** Advyzon Enterprise Solutions (tech) + Advyzon Investment Management/AIM (TAMP) + Citi Private Bank (distribution). Three-party model: platform + TAMP + bank.

**Scope:** Global UMA program for Citi Private Bank, Wealth at Work, Citigold & Citigold Private Client across NA, LATAM, EMEA, APAC. Rollout Q4 2026.

**Selection:** "Thorough and competitive search" against established enterprise vendors. Citi "sought a partner built from the ground up for holistic advice."

**Why Citi needed change — the Andy Sieg transformation:**
- Sieg (former Merrill Lynch president, joined 2023) found: JPM Private Bank = $12B revenue vs. Citi Private Bank = $2.7B
- Diagnosis: outdated, lending-centric, fragmented technology
- Strategy: rework comp to emphasize asset gathering, hire 100+ private bankers + 400+ advisors, replace legacy tech, deploy Citi Sky AI (Google Gemini)
- The prize: Citi's 15M+ US banking customers hold $3T elsewhere — a $5T total wallet opportunity

**Why Advyzon won:**
1. Modern single-codebase architecture (not acquired/patched)
2. AI-native (Advyzon AI agentic layer built into platform DNA)
3. 2,500+ firms, #1 T3 satisfaction 9 consecutive years (enterprise-sellable proof)
4. Bootstrapped discipline demonstrated long-term viability
5. Auria family office tier (launched Q1 2025) for UHNW clients

## The "Bank-Readiness" Checklist for WealthTech Platforms

### Certifications Required
| Certification | Priority | Notes |
|---------------|----------|-------|
| SOC 2 Type II | **Mandatory** | Table stakes for any US bank |
| ISO 27001 | **Strongly preferred** | Often required for non-US banks |
| ISO 27701 | EU banks | Privacy-focused certification |
| GDPR | EU/UK banks | Mandatory for European operations |
| CCPA | California banks | US state-level privacy |
| NY DFS 500 | New York banks | Cybersecurity regulation |
| CSA STAR | Enterprise | Cloud security attestation |

### Architecture Requirements
- Single-tenant option or strong multi-tenant isolation with BYOK (customer-supplied encryption keys)
- Multi-currency support (30-60+ currencies)
- Multi-jurisdiction support (onshore/offshore structures, trust/entity variations)
- Data residency / sovereign cloud deployment for regulated markets
- Multi-custodian data aggregation (50+ custodians)
- API-first architecture (REST/GraphQL)
- SSO/SAML/OAuth integration

### Vendor Due Diligence Items
- Financial stability: 3+ years audited financials, path to profitability
- Board/advisory board composition with regulated experience
- Insurance coverage (cyber, E&O, D&O)
- Annual third-party penetration testing results
- Vulnerability management program
- Vendor risk assessment questionnaire (200-500 questions)
- Sub-processor list and certifications
- Data processing agreement (DPA)
- Business continuity/disaster recovery test results
- Background checks on key personnel

### Timelines
- RFP process: 6-18 months
- Implementation: 6-24 months
- Total time-to-revenue: 12-36 months

## What WealthForge Should Do (Not Direct Bank Sales)

**Barriers to direct bank sales:**
1. **Too narrow** — Banks want integrated suites (portfolio + planning + trading + reporting + CRM + billing). WealthForge is a planning engine alone.
2. **Too early** — Bank RFPs require 3+ years audited financials, reference accounts, SOC 2 Type II. WealthForge likely lacks these.
3. **No TAMP** — Advyzon won Citi partly because they could provide both technology AND asset management (AIM).
4. **Implementation inertia** — 12-36 months. Focus on shorter-cycle segments first.
5. **Incumbent entrenchment** — eMoney at 35.62% share. Planning is a complement, not a replacement sell.

**Viable paths for WealthForge:**

**Path A: Planning-as-a-Service API Layer (eMoney Access API model)**
Build an API-first planning engine that banks/platforms embed into existing interfaces. White-label, no branding. Key APIs: scenario modeling, goal projection, Monte Carlo, tax optimization, withdrawal sequencing. Precedent: eMoney Access API (2019), MoneyGuide Play Zone API, Wealth.com Ester AI as a Service via MCP.

**Path B: Partner with Advyzon/Orion/Addepar**
Integrate WealthForge planning as a module within platforms that already have bank relationships. Advyzon just won Citi — $676B client assets. Orion serves MS/Schwab. Addepar has HSBC, JPM, LGT, Itaú, MS.

**Path C: Target smaller/regional banks first**
Shorter sales cycles, lower certification requirements (SOC 2 may suffice). Build reference-ability → move upmarket.

**Path D: The Citi JV model (Platform + Partner + Distribution)**
Find a distribution partner (TAMP, custodian, platform) and co-sell to banks. WealthForge provides planning technology; partner provides bank relationships.

## Key Competitive Insights

- **Addepar's bank relationships compound as a moat.** Each partnership takes 12-24 months and involves deep proprietary integration. Switching costs are enormous.
- **Advyzon's Citi win proves architectural modernity beats vendor tenure.** A bootstrapped company won against established enterprise vendors because of superior architecture + T3 satisfaction proof.
- **The "retail-to-wealth conversion" narrative is powerful.** Citi's $3T held-elsewhere opportunity shows banks are motivated to deploy technology that captures wallet share from existing banking relationships. This is a stronger sales pitch than "better planning software."
- **eMoney's 35.62% bank/enterprise share is the planning standard to complement.** WealthForge shouldn't compete head-on; it should offer planning capabilities that eMoney's portfolio-platform competitors lack.

## Discovery Context

This reference was created from the Enterprise Private Bank Go-to-Market in Wealthtech deep research (2026-05-15), which covered Addepar's bank partnerships (HSBC, JPM, LGT, Itaú, MS), Advyzon's Citi Wealth breakthrough, the four bank tech strategy archetypes, the bank-readiness checklist, and viable paths for WealthForge. Full findings in RESEARCH.md.
