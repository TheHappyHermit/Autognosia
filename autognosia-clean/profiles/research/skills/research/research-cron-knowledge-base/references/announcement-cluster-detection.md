# Announcement Cluster Detection

## What It Is

A research technique for discovering adjacent topics by checking what other companies announced simultaneously or within the same short window. When a company makes a major product launch, regulatory filing, or partnership announcement, competitors often cluster their own announcements in the same timeframe — whether by coincidence, competitive response, or shared industry events.

## When to Use

- You're researching a specific company's product launch, funding round, or partnership
- You find a press release dated [specific date]
- You want to ensure you're not missing a major competitive development that happened in the same window

## How to Apply

**During step 3 (deep research) of a research run:**

1. When you find a press release or announcement with a specific date (e.g., "April 14, 2026"), note the date
2. Run a parallel search for other wealthtech/adjacent announcements from the same date or week:

```
web_search("wealth management AI announcement April 14 2026")
web_search("fintech news April 14 2026 agentic AI platform")
```

3. If you find a different company's announcement on the same date, follow the trail:
   - Extract both announcements
   - Compare positioning, architecture, and target audience
   - Check if they're product-adjacent (would a customer choose one or the other, or are they complementary?)
4. If the discovered topic warrants its own deep dive, add it as a new [⏳] to the agenda

## Real Example: April 14, 2026 "Agentic Thursday"

Researching TIFIN.AI led to discovering its launch date was April 14, 2026. A same-date search revealed:

- **TIFIN.AI** — "Industry-first agentic operating system" for wealth, asset management, insurance
- **Wealth.com Ester Intelligence** — "System of specialized agents" for estate & tax planning (launched same day, expanded capabilities)

Both used the "system of specialized agents" language. Comparing them side-by-side revealed:
- TIFIN.AI = cross-platform enterprise orchestration (multi-agent OS)
- Ester = domain-specific planning AI (estate + tax focused)
- Together, they validated two different "planning-domain AI" archetypes

This single date check produced **4 new agenda topics**: Wealth.com Ester Intelligence, TIFIN AXIS middle office platform, TIFIN incubator model, and Wealth.com enterprise embedding strategy.

## Why This Works

Industry announcement clustering happens for several reasons:

1. **Industry conferences** — Many companies time announcements for the same conference (T3 Advisor Conference, Schwab IMPACT, Fintech Meetup)
2. **Quarter-end cycles** — Companies batch announcements for end-of-quarter press cycles
3. **Competitive response** — A competitor's announcement triggers a rapid response from peers
4. **News cycle optimization** — Multiple companies independently targeting the same "news vacuum" windows
5. **Earnings/regulatory cycles** — Quarterly earnings or regulatory deadline-driven clustering

## Implementation Pattern

```
search("TIFIN Group announces TIFIN.AI") → finds date April 14, 2026
  ↓
search("wealth management April 14 2026 announcement") 
  ↓
discovers Wealth.com Ester Intelligence (same day)
  ↓
extract both → compare → identify 4 new agenda topics
```

## Cross-Reference With Sub-Topic Sweep

When the cluster discovery produces topics that are sub-topics of the main research (e.g., TIFIN AXIS is a sub-product of TIFIN), you can often mark both at once using the Sub-Topic Sweep pattern. When the cluster topics are genuinely separate (e.g., Wealth.com is a different company in a different category), add them as standalone agenda items.
