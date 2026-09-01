# Novel Domain Research Pattern — Discovering an Unknown Source Ecosystem

## When to Use This Pattern

Most WealthForge research topics have established canonical sources (Kitces.com, Morningstar, IRS publications, SSA POMS, Ibbotson SBBI, state revenue websites, S&P/iBoxx indices, etc.). But some topics fall into **completely uncharted territory** — domains where:

- No wealth management platform has ANY features → no competitive landscape to analyze → no competitor docs to read
- No canonical researchers/authors exist → no Kitces-as-funnel for source discovery
- The domain has its OWN professional ecosystem → trade associations, regulators, data providers, and practitioners the planning industry rarely interacts with
- You must discover the entire source hierarchy from scratch using web_search alone

**Examples from WealthForge history:**
- **Franchise Finance Modeling** (this session) — IFA, FRANdata, FTC Franchise Rule, SBA SOP 50 10, franchise valuation firms (QMK Consulting, Sofer Advisors, BizWorth), franchise fee databases (Franzy, FranConnect, PeerSense), franchise broker ecosystem (WeSellRestaurants, DealStream, BizBuySell)
- **CRM software landscape** — Already had established sources (T3, Kitces), but the technology player ecosystem was its own domain
- **AI Notetaker landscape** — A fast-evolving startup ecosystem with no established source hierarchy

## The Pattern — 6-Step Source Ecosystem Discovery

### Step 1: Define the Domain's Structural Categories

Before searching, decompose the topic into its natural structural categories. Each category likely has its own source ecosystem.

**Franchise example:**
1. Industry size & macro data → trade association + economic research
2. Legal/regulatory framework → government agencies + law firms
3. Financial terms & fees → franchise broker databases + aggregator sites
4. Valuation methodology → valuation advisory firms + M&A guides
5. Financing mechanics → SBA sources + lender guides
6. Sector-specific operational data → industry portals per franchise type (QSR, service, retail)
7. Ownership patterns → franchise consultant content + franchisee forums

**For any novel domain, ask:** What are the 4-7 structural categories that define this domain's economic reality? Each is a search target.

### Step 2: Identify the Trade Association(s)

Almost every US industry has at least one trade association. Trade associations produce:
- Annual economic outlook reports (size, growth, employment data)
- Industry standards and definitions
- Member directories (the who's-who)
- White papers on regulatory issues
- State-by-state data

**How to find:** search `"[industry] association" OR "federation of [industry]" OR "[industry] trade group" annual report statistics`

**For franchise:** `International Franchise Association (IFA)` → produced the annual Franchising Economic Outlook via `FRANdata`. This single source provided the anchor statistics (845K establishments, $920B+ output, 8.9M jobs).

**What to extract from trade associations:** headcount/revenue statistics, growth rates, regulatory landscape overview, member demographics, annual publication calendar.

### Step 3: Identify the Primary Regulator(s)

Most domains have a primary federal or state regulator. Regulators produce:
- Definitive legal framework documents (rules, statutes, SOPs)
- Public databases and registries
- Guidance documents and compliance checklists
- Enforcement data and trends
- Consumer protection resources

**How to find:** search `"[industry] regulation" OR "[industry] disclosure requirements" OR "federal [industry] rule"`

**For franchise:** `FTC Franchise Rule (16 CFR Part 436)` → mandated the FDD, defined the 23 items. `SBA SOP 50 10` → governed franchise lending parameters.

**What to extract from regulators:** the exact legal structure, rule numbers, compliance requirements that any software feature must respect. These become Section 8 (Regulatory & Guardrails) content.

### Step 4: Build the Practitioner Source Hierarchy

For domains without canonical researchers, practitioners ARE the sources. Practitioners include:
- **Valuation/advisory firms** that specialize in the domain — they publish methodology guides and benchmark data
- **Brokerage/marketplace platforms** — they publish pricing guides and market reports
- **Software vendors** that serve the domain (NOT wealth management — the domain's own tech ecosystem)
- **Law firms** that specialize in the domain's regulations
- **Consultant networks** that match buyers/sellers — they publish educational content

**How to find (3 sub-queries per category):**
- `"[industry] valuation multiples EBITDA"` → finds valuation advisory firms
- `"[industry] for sale financing guide"` → finds brokers and lenders
- `"[industry] contract terms fees"` → finds legal analysis

**For franchise:**
| Practitioner Type | Example Sources Discovered |
|---|---|
| Valuation advisory | QMK Consulting, Sofer Advisors, BizWorth, Auxo Capital, DealFlow OS |
| Brokerage/marketplace | WeSellRestaurants, BizBuySell, DealStream, FranchiseBA |
| FDD/legal analysis | ClearlyFDD, FDD IQ, Sirion, FTC blog, franchise law blogs |
| Financing guides | Hartwell Labs, Crestmont Capital, Merchant Maverick, FDD IQ guides |
| Consultant networks | IFPG, FranChoice, PeerSense |
| Franchise databases | Franzy, Franchise Creator, FranConnect, PeerSense (6,300+ brands) |

**Key insight:** Each practitioner type provides a DIFFERENT KIND of data:
- Valuation firms → EBITDA multiples by subsector, valuation methodology
- Brokers → actual transaction data, price trends, buyer pool characteristics
- Legal → regulatory requirements, disclosure obligations, contract terms
- Lenders → financing parameters, approval rates, documentation requirements
- Databases → normalized comparison data across hundreds of specific products/brands

### Step 5: Cross-Validate Numerical Claims

With no canonical researcher to validate against, numerical claims require cross-validation from at least 2 independent practitioner sources.

**Cross-validation rule for novel domains:** Every numerical claim used in the research entry must be confirmed by at least TWO independent sources from different practitioner categories.

**Example (franchise):**
- "QSR EBITDA multiples range 2.5x-4.5x" → confirmed by QMK Consulting, BizWorth, Sofer Advisors, Auxo Capital (4 sources from 4 different firms)
- "Transfer fees typically 10-15% of sale price" → confirmed by FDD Item 6 text (legal source) AND franchise broker content (practitioner source)
- "SBA 7(a) guarantee fee = 3.5% of guaranteed portion" → confirmed by SBA SOP (regulator) AND Hartwell Labs guide (practitioner)
- "Royalty rates4-8% for QSR" → confirmed by Franzy, FranConnect, PeerSense, GrowthFactor (4 aggregator databases)

**When sources disagree** (e.g., one valuation firm says 2.5-4.5x, another says 2.0-4.0x), cite the range and use the mid-point from the more authoritative or more recent source. Flag the disagreement in the entry.

### Step 6: Generate Self-Discovery Topics

Novel domains naturally produce many more subtopics than well-trodden ones because there's more to discover. Use the "implementation sub-questions" angle from the standard NEW TOPICS section, plus these domain-specific angles:

- **Data infrastructure prerequisite** (ff-1: FDD OCR benchmark — you can't build FDD extraction without knowing extraction accuracy)
- **Government integration** (ff-2: SBA Directory API — you can't do real-time eligibility without this)
- **Risk specialization** (ff-3: ROBS risk calculator — a novel domain often has one "dangerous" path that needs special modeling)
- **Cross-domain integration** (ff-4: Franchise × QBI — how this novel domain interacts with established planning domains)
- **Quantification gap** (ff-5: Territory value decay — a widely-acknowledged but never-quantified value driver)
- **Worst-case cascade** (ff-6: Bankruptcy simulator — novel domains need their own stress testing)
- **Canonical database** (ff-7: 500-concept comparison database — novel domains often lack the canonical reference database that established domains have)

**Target for novel domains:** 6-7 new subtopics minimum (vs. 3-6 for established domains). The agenda should grow FASTER for novel territory.

## Comparison: Novel Domain vs. Established Domain Source Hierarchy

| Dimension | Established Domain (Retirement) | Novel Domain (Franchise) |
|---|---|---|
| Canonical researcher | Kitces, Pfau, Benz, Milevsky, Bodie | None — discover through search |
| Trade body source | SSA OACT, IRS, GAO | IFA, FRANdata, FTC, SBA |
| Academic source | SSRN, JFP, FPA Journal | None — trade research instead |
| Practitioner source | Fidelity, Schwab, Vanguard guides | Valuation firms, franchise brokers, FDD databases |
| Competitive platform | eMoney, RightCapital, Income Lab | None in wealth management — BizEquity is closest |
| Source count target | 15-20+ | 25-40+ (need more because less authoritative per source) |
| Cross-validation | Easy (Kitces confirms Pfau confirms Morningstar) | Hard (must find agreement between 2+ practitioner sources from different categories) |
| New topics target | 3-6 | 6-8 |
| Risk of stale assumptions | Low (well-covered field) | High (domain-specific trends may be unknown) |

## Pitfalls

1. **Industry jargon overload** — Novel domains have their own terminology (FDD, Item 19, ROFR, AUV, ROBS, SDE, EBITDA, SOP 50 10). Define every acronym on first use. Your audience is a financial planning coder who has never worked in this domain.

2. **False authoritative sources** — In novel domains, the top search result is often a content farm or pay-to-play "franchise review" site. Vet sources by: author credentials, publication date, sponsoring organization, cross-reference with other sources.

3. **Over-reliance on a single practitioner** — One valuation firm's methodology is not the industry standard. Always cross-reference with at least one other firm. If both agree, the claim is credible. If they diverge, cite the range.

4. **Confusing regulatory vs. best-practice** — SBA requirements are regulatory (must comply), but franchise valuation methodology is best-practice (negotiable). Clearly separate regulatory REQUIRES from practitioner RECOMMENDS.

5. **Missing the "this doesn't apply here" edge case** — Because nobody in wealth management has built franchise features before, it's easy to assume ALL franchises follow the same pattern. But a McDonald's franchise ($2M+ investment, 50-70 hr/wk, 4% royalty) and a Jan-Pro franchise ($50K investment, 10-15 hr/wk, 10% royalty) have fundamentally different economics. Sector-specific defaults per franchise type (QSR vs. retail vs. service vs. fitness) are essential.
