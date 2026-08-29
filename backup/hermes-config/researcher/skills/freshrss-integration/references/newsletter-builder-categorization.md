# Newsletter Builder: Fetching & Categorization Patterns

## Critical Bug: Sort Order Parameter

The FreshRSS Google Reader API returns articles **oldest first** by default. When fetching the reading list, you **MUST** include `"r": "n"` (newest first) in the request params:

```python
# WRONG — returns 82-day-old articles
params={"n": 200, "output": "json"}

# CORRECT — returns today's articles
params={"n": 200, "output": "json", "r": "n"}
```

Without `"r": "n"`, the API returns the oldest unread articles first. With 16,000+ accumulated unread articles across 400+ subscriptions, the first 200 items will all be weeks or months old.

## Content Extraction False Matches

### The Problem

When extracting full article text from paywalled or JS-heavy sites (especially SeekingAlpha), trafilatura may return only the "Participants" or "Conference Call" section instead of the article body. This extracted text can contain words that match categorization keywords:

- SeekingAlpha earnings call transcripts: "Research Division" → matches "research", "Evercore" → matches "ev"
- This causes earnings calls and financial articles to be routed into Science or AI sections

### The Fix

**Finance exclusion must take priority over keyword scoring.** Use a two-stage filter:

1. **Detect finance/business articles** via title regex and keywords BEFORE scoring
2. **Exclude them from all topic sections** regardless of keyword matches

```python
import re

earnings_pattern = re.compile(
    r'\([A-Z]{1,5}\)\s*(?:Q[1-4]|presents)|'
    r'Q[1-4]\s+\d{4}\s+(?:earnings|results|commentary)|'
    r'(?:Q[1-4]\s+)?\d{4}\s+(?:Earnings|Results)\s+(?:Call|Transcript|Presentation)',
    re.I
)
finance_keywords = [
    'earnings call', 'earnings presentation', 'earnings call transcript',
    'fund commentary', 'q1 2026', 'q2 2026', 'q3 2026', 'q4 2026',
    'q1 2025', 'q2 2025', 'q3 2025', 'q4 2025',
    'form 144', 'form 13d', 'form def', 'sec filing',
    'stock analysis', 'stock surges', 'stock rally', 'market cap',
    'dividend growth', 'corporate bond', 'rising dividend',
    'index dynamics', 'egress filtering', 'security tool',
    # --- NEW PATTERNS (2026-07) ---
    'named official', 'official partner', 'design software partner',
    'validates ai-ran', 'ai-ran blueprint', 'infrastructure',
    'press release', 'announces partnership', 'strategic partnership',
    'collaboration agreement', 'memorandum of understanding',
    'wall street', 'beat estimates', 'beat consensus', 'consensus estimates',
    'fiscal quarter', 'fiscal year', 'year-to-date', 'ytd',
    'revenue beat', 'earnings beat', 'eps beat', 'guidance',
    'cheap stocks', 'stocks to buy', 'stocks to watch', 'about to explode',
    'undervalued', 'overvalued', 'price target', 'analyst rating',
    'upgrade', 'downgrade', 'buy rating', 'sell rating', 'hold rating',
    'portfolio', 'investment', 'investor', 'shareholder', 'dividend yield',
    'market beat', 'seeking alpha', 'motley fool', 'insider monkey',
    'zacks', 'benzinga', 'streetinsider', 'fool.com'
]

# Extended pattern for corporate press releases with tickers
corp_press_pattern = re.compile(
    r'\([A-Z]{1,5}\)\s+(?:named|announces?|validates?|partners?|launches?|acquires?|reports?|signs?|extends?)',
    re.I
)

is_finance = (any(kw in combined for kw in finance_keywords) or 
              bool(earnings_pattern.search(title)) or 
              bool(corp_press_pattern.search(title)))

# In categorization: check is_finance FIRST, before any keyword scoring
if is_finance:
    other_content.append(article)  # Exclude from all topic sections
elif llm_ai_score >= 2 and llm_ai_score >= science_score:
    llm_ai_content.append(article)
elif science_score >= 2:
    science_content.append(article)
```

## Scoring-Based Categorization

Binary `any()` matching is too coarse. Use **score counting** (sum of keyword matches) with minimum thresholds:

```python
science_score = sum(1 for kw in science_keywords if kw in combined)
llm_ai_score = sum(1 for kw in llm_ai_keywords if kw in combined)
international_score = sum(1 for kw in international_keywords if kw in combined)
```

**Thresholds that work in practice:**
- `llm_ai_score >= 2` — Requires at least 2 AI keyword matches (avoids false positives from "ai" in "chairman")
- `science_score >= 2` — Requires at least 2 science keyword matches
- `international_score >= 1` — Lower threshold since geopolitical articles are common

### Keyword Boundary Matching

Simple substring matching causes false positives:
- `"ai"` matches "chairman", "detail", "available"
- `"ev"` matches "evercore", "every", "evidence"
- `"research"` matches "Research Division" (brokerage department)

**Solutions:**
- Use prefix/space patterns: `"ai "` instead of `"ai"`, `"ai-"` as separate keyword
- Use multi-word keywords: `"artificial intelligence"`, `"machine learning"`, `"large language model`
- For short acronyms, require trailing punctuation or space: `"gpt-"` instead of `"gpt"`
- Always check the **title** with a regex for strong signals (earnings calls, filings) before relying on extracted content

## Feed Category Boosting

FreshRSS assigns category labels to articles (e.g., feed folders). Use these as score boosts:

```python
category_str = ' '.join(categories).lower()
has_tech_cat = any(c in category_str for c in ['technology', 'tech news', 'ai'])
has_science_cat = any(c in category_str for c in ['science'])
has_world_cat = any(c in category_str for c in ['news-global', 'world', 'politics'])

if has_tech_cat:
    llm_ai_score += 3  # Strong signal — boost AI score
if has_science_cat:
    science_score += 3
if has_world_cat:
    international_score += 3
```

A feed category match is worth more than a keyword match because it reflects the user's own organization.

## LLM Hallucination in Section Summaries

When an LLM summarizes a section with too few articles (1-2), it may **hallucinate content** from other articles in the batch or generate plausible-sounding text that has no source. Observed in production:

- "Gaming Monitor Deals" appeared in AI & Tech section despite no gaming article being in the filtered pool
- The LLM invented content to fill the section

**Mitigation:**
- Set a minimum article count per section (e.g., 3 articles). If below, omit the section or merge with "other".
- Alternatively, use bullet-point style summaries instead of narrative paragraphs — this discourages hallucination since each bullet must map to a specific article.

## Summarization Fallback Cleanup (2026-07)

When OpenRouter is rate-limited (403), the fallback truncation must clean the `TITLE:`/`CONTENT:` prefix format used during categorization:

```python
def summarize_content(text, openrouter_key=None):
    # ... OpenRouter call ...
    except Exception as e:
        # Fallback: strip TITLE:/CONTENT: prefixes before truncating
        lines = text.split('\n')
        clean_parts = []
        for line in lines:
            line = line.strip()
            if line.startswith('TITLE:') or line.startswith('CONTENT:'):
                content = line.split(':', 1)[1].strip() if ':' in line else line
                if content and content != 'Untitled':
                    clean_parts.append(content)
            elif line and not line.startswith('TITLE:') and not line.startswith('CONTENT:'):
                clean_parts.append(line)
        clean_text = ' '.join(clean_parts)
        return clean_text[:500] + ("..." if len(clean_text) > 500 else "")
```

This prevents newsletter output like `TITLE: AI Breakthrough CONTENT: Researchers developed...` in fallback mode.
