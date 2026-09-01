# Researcher Persona Deep Dive

## When to Use

Use this variant when the research agenda entry is about a **person** (e.g., "Wade Pfau — Retirement Researcher" or "William Bernstein — Efficient Frontier") rather than a specific feature or domain.

## Adapted Structure

| Standard Section | Researcher Variant |
|:--|:--|
| 1. STRATEGY & CONTEXT | Who is this person? Why do they matter? Institutional affiliations, credentials, Google Scholar metrics, professional roles, and their influence on wealth management. |
| 2. THE PROBLEM | What intellectual gap were they trying to fill? What question did existing literature fail to address? |
| 3. CORPUS MAPPING | Complete bibliography: ALL books (with editions/dates), key papers with citation counts, most-cited works. Include conference talks, podcasts, interviews. |
| 4. CORE FRAMEWORKS | Each framework gets its own subsection. Extract: (a) what it claims, (b) key formula/algorithm, (c) empirical evidence, (d) adoption in current planning software. 3-5 frameworks per researcher. |
| 5. COMPETITIVE LANDSCAPE | Which software products implement this researcher's ideas? Compare depth of implementation. Identify researchers whose ideas have ZERO software implementation (pure WealthForge opportunity). |
| 6. BUILD SPEC | Pseudocode, data models, and algorithms derived from the researcher's frameworks. Often the longest section. |
| 7. UI/UX | Widget designs derived from the researcher's concepts. |
| 8. REGULATORY | Same as standard if applicable. |
| 9. ARCHITECTURAL BLUEPRINT | Database schema for the researcher's distinct data objects. |
| 10. RED TEAMING | **Criticisms and limitations of the researcher's work.** Map the debates: Pfau vs Kitces on safety-first, Bernstein vs Monte Carlo proponents. Minimum 5-7 criticisms with specific rebuttals. |
| 11. KEY SOURCES | 15-18 sources minimum. Books by the researcher, key academic papers with SSRN/DOI, Google Scholar profile, practitioner articles, critical/dissenting sources. |
| 12. NEW TOPICS | Each framework becomes 2-3 new `[⏳]` feature topics. Add cross-refs to existing agenda items that reference this researcher. |

## Additional Sections Unique to Researcher Deep Dives

### A. Cross-Researcher Comparison Table
When the researcher has obvious intellectual counterparts/antagonists (Pfau vs Kitces, Bernstein vs Bengen), produce a comparison table across 6-10 dimensions (default approach, annuity stance, SWR position, preferred tool, spending philosophy).

### B. Researcher-to-Feature Cross-Reference
Map every existing `[✅]` research entry that cites this researcher. Prevents redundant re-research and shows how the researcher permeates the knowledge base.

### C. Zero-Competition Feature Opportunity List
Numbered list of features that: (a) derive directly from the researcher's frameworks, (b) NO existing wealth management platform has implemented, (c) WealthForge can build. This is the "why did we research this person?" answer.

## When NOT to Use This Variant

- When the topic is a specific article (use standard 12-section format)
- When the topic is a software platform (use standard competitor format)
- When the topic is an employee role (use `wealthforge-employee-role-research` skill)
- A researcher deep-dive is a 1-time-per-researcher event. After the deep dive, subsequent work on their concepts goes in standard format under feature topics.

## Three Researcher Archetypes

### 1. Academic Researchers (Pfau, Milevsky, Bodie, Estrada)
- **Search first:** Google Scholar → SSRN
- **Metrics:** h-index, i10-index, citation count
- **Framework density:** Algorithm-heavy (Funded Ratio, PAY Rule)
- **Primary output:** Peer-reviewed papers
- **Software impl count:** High (5-8 features per researcher)
- **Source reliability:** SSRN/DOI links (stable)

### 2. Practitioner Journalists (Benz, Tharp, Morningstar columnists)
- **Search first:** Morningstar.com → Podcast transcripts
- **Metrics:** Goodreads rating, podcast downloads, Barron's rankings
- **Framework density:** Behavioral/framework-heavy (Bucket Approach, Blind Spots)
- **Primary output:** Articles + books + podcast
- **Software impl count:** High (8+ features per researcher)
- **Source strategy:** Morningstar.com web_extract works reliably. Also search podcast transcripts ("White Coat Investor", "The Long View") for detailed framework explanations not published in article form.

### 3. Independent Scholars (Bernstein, Kitces, Guyton, Klinger)
- **Search first:** Google Scholar → Kitces.com → Books
- **Metrics:** Mixed — both academic citations and practitioner adoption
- **Framework density:** Mixed (LMP is algorithmic, 80% ceiling is conceptual)
- **Primary output:** Books + newsletters + blog
- **Software impl count:** Medium (3-5 features per researcher)
- **Source strategy:** Kitces.com (may need fallback hierarchy), books

## Required Sources (beyond standard REQUIRED SOURCES)

For researcher deep dives, add these to your search plan:

- **Google Scholar** — Citations, h-index, i10-index, most-cited papers. https://scholar.google.com/
- **SSRN Author Page** — Complete paper listing with abstracts. https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=XXXXX
- **Amazon/Google Books** — Book titles, editions, publication dates, table of contents
- **Podcast interviews** — Often reveal frameworks not in published papers
- **Practitioner critiques** — Search "[researcher] criticism" or "[researcher] debate"
- **Competitor documentation** — Search "[software] [researcher framework]" to see implementations
- **Industry conference keynotes** — Researchers often unveil frameworks at conferences before publishing
