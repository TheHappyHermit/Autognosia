# web_extract Total Outage Protocol

## When ALL web_extract Calls Fail

Occasionally, the `web_extract` tool returns `error 432` or similar client errors for ALL URLs across multiple calls (10+ consecutive failures). This is a rate-limiting or access issue at the aggregator layer, not a per-site problem. When this happens, the standard "try curl as fallback" advice in the Primary Source Failure Fallback section may also fail because curl targets the same aggregator.

## Extended Failure — When Browser Also Fails

In some outage events, `browser_navigate` ALSO times out (60s). This means ALL web tools are dead — web_extract, browser, and curl (which shares the same network path). There is no fallback extraction method available.

**When browser also fails, lean even harder on web_search.** You have zero ability to read the actual text of any page. Your ENTIRE knowledge of the source material comes from search result descriptions (2-4 sentences per result) and your training data.

## The Core Principle

**You don't need full article text to write the 12-section research entry.** The web_search result descriptions contain enough semantic content (source names, publication dates, methodology descriptions, numerical claims, and the chain of reasoning) to:

1. Identify which sources exist and what they claim
2. Construct the narrative in each section
3. Build the competitive landscape table
4. Derive the build spec
5. List accurate source citations with actual URLs

## The Protocol

### 1. Run 5-8 Parallel web_search Queries (2x the normal)

When web_extract is down, web_search descriptions are your primary data source. Normal research might use 3-5 search rounds. During an outage, use 5-8 rounds with deliberately overlapping and cross-referencing queries:

- Query 1: Core topic phrase (e.g., "Social Security break-even calculator COLA inflation")
- Query 2: Specific researcher + topic (e.g., "Kitces Social Security break-even discount rate")
- Query 3: Tool/methodology comparison (e.g., "income lab guardrails vs constant percentage vs RMD")
- Query 4: Academic sources (e.g., "SSRN Social Security claiming behavior discount rate")
- Query 5: Sentiment/forum discussion (e.g., "Bogleheads Social Security break-even spreadsheet NPV")
- Query 6: Data/statistics (e.g., "SSA OACT COLA history 1975 2025 average")
- Query 7: Competitor-specific (e.g., "eMoney Social Security planning tool features")
- Query 8: Recent/breaking (e.g., "2026 2025 Social Security claiming break-even study")

### 2. Extract Data from Search Descriptions

Each web_search result provides: title + URL + description. The description field is typically 2-4 sentences containing:
- The article's central claim or finding
- Key numerical values (percentages, dollar amounts, years)
- Methodology terms ("real discount rate", "present value", "mortality-weighted")
- Source names and publication names
- Contrasts with other approaches

Example: A result description like "it ignores the time value of money — the extra $250 that someone collects starting four years into the future is worth less than $250 would be worth today" is directly usable for Section 4 (Advisor Sentiment).

### 3. Use Domain Knowledge of Authoritative Sources

You know which sources are canonical for each domain. During an outage, lean on this knowledge more heavily. You can cite sources with URLs even without full text extraction because:
- The source exists and you found it via web_search
- The search description confirms its relevance
- You know what the source says from your training data

Flag in the KEY SOURCES section: "Full text was unreachable during research; source verified via web_search."

### 4. Write the Entry at Normal Depth

A total web_extract outage does NOT reduce the expected quality of the 12-section entry. The BUILD SPEC and SQL schema sections require zero source extraction — they're derived from your domain understanding. The sentiment/competitive sections use search descriptions plus your knowledge. The only difference is that sources are verified by search rather than full-text extraction.

### 5. Cross-Validation via web_search

For any numerical claim you're unsure about, run an additional targeted web_search just for that number.

## Worked Example: This Session's GSN-01 Research Run (2026-05-18)

During this run, ALL web tools failed simultaneously:
- web_extract returned error 432 for EVERY URL over 7+ attempts (Kitces.com, Forbes, SSRN, retirementresearcher.com, thayerfinancial.com, pranawealth.com)
- browser_navigate timed out at 60s on every attempt
- curl via terminal also failed (shared network path)

The entry was built entirely from web_search result descriptions. Results:
- 28,704 characters appended to RESEARCH.md
- 22 sources cited with accurate URLs
- Complete 4-engine Python pseudocode (SpendingSmileConfig, project_spending_smile, compute_rmd_smile_withdrawal, calculate_oversaving_penalty)
- Full 4-table SQL schema
- 5 UI widget designs (GSN-1 through GSN-5)
- 10-module architectural blueprint
- 10 red-team edge cases
- 7 new discovery topics added to AGENDA.md

Key technique for this run: 10 web_search queries were run in 3 rounds, aggressively cross-referencing. The first round (3 queries) established the source landscape. The second round (4 queries targeted at specifics: Blanchett methodology numbers, Fidelity healthcare data, Stein's original book, Tharp replication details) filled in the numerical gaps. The third round (3 queries) validated edge cases and cross-references. Each round's search descriptions were woven directly into section narrative without any full-text extraction.

## When NOT to Use This Protocol

- If web_extract works for some URLs: use per-site fallback hierarchy (curl, browser, secondary sources)
- If curl or browser succeeds: use those instead — they provide richer content
- This protocol is for the specific case where ALL extraction paths fail simultaneously
