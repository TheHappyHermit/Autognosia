---
name: newsletter-content-filtering
description: Defines how to process and filter newsletter content to match user preferences for a cohesive, sports-free news digest that reads like a properly written news article rather than a collection of summaries.
category: productivity
---
# Newsletter Content Filtering and Formatting Preferences

## Trigger Conditions
When generating newsletters from FreshRSS or similar news aggregation sources, and the user has indicated they want:
- No sports content
- Cohesive, fully-written news article format (not just article summaries)
- Focus on scientific news, LLM/AI news, and international news
- Exclusion of article links in favor of synthesized narrative

## Overview
This skill defines how to process and filter newsletter content to match user preferences for a cohesive, sports-free news digest that reads like a properly written news article rather than a collection of summaries.

## Steps

### 1. Content Collection and Initial Filtering
- Fetch articles from FreshRSS feeds (using IP-direct connection: 10.1.1.10 with Host: freshrss.[private-site].com)
- Apply sports filtering: Exclude any articles containing sports-related keywords in title, content, or tags
  - Sports keywords: sport, football, soccer, baseball, basketball, tennis, golf, olympics, championship, tournament, match, game, team, player, league, nfl, nba, mlb, nhl, fifa, ufc, mma, cricket, rugby, etc.
- Prioritize content categories: science, technology (especially LLM/AI), international/world news, politics, business, health, environment

### 2. Content Processing for Cohesive Narrative
- Do NOT simply extract and list article summaries
- Instead, synthesize content into a flowing narrative organized by topic/theme
- For each major topic (scientific developments, LLM/AI advances, international events):
  - Identify key developments from multiple sources
  - Write 2-3 paragraphs explaining what happened, why it matters, and connections between related items
  - Use neutral, informative tone appropriate for a news digest
  - Omit specific source attributions and links as requested
  - Focus on the "what" and "why" rather than "where I read it"

### 3. Structure and Flow
- Opening: Brief overview of the most significant developments across all categories
- Section 1: Scientific News (space, physics, biology, medicine, climate, etc.)
- Section 2: LLM/AI News (model releases, breakthroughs, applications, industry developments)
- Section 3: International News (geopolitics, economics, culture, significant global events)
- Section 4: Other Notable Developments (business, technology, health, environment as relevant)
- Closing: Forward-looking note on trends to watch

### 4. Quality Assurance
- Verify zero sports content remains
- Ensure narrative flows logically from one topic to the next
- Check length is appropriate for a newsletter (typically 800-1500 words)
- Confirm tone is informative, neutral, and engaging
- Validate that no article links or direct attributions are present

## Pitfalls
- Over-filtering: Being too aggressive with sports keywords might catch legitimate non-sports content (e.g., "the game of physics" or "business sport" metaphors)
- Loss of nuance: Synthesizing too aggressively might oversimplify complex developments
- Incoherence: Poor transitions between topics can make the newsletter feel disjointed
- Missing key developments: Over-reliance on filtering might cause important non-sports items to be missed if they contain filtered keywords

## Verification
- Manual review of generated newsletter for sports content absence
- Check that content reads as a cohesive article rather than a list
- Verify focus on requested categories (science, LLM/AI, international)
- Confirm no links or direct source attributions appear in final output
- Ensure newsletter can be read and understood without needing to click through to sources

## Notes
This approach transforms the newsletter from a curation service into a synthesis service, providing the user with a ready-to-read informed summary of developments rather than requiring them to process multiple article summaries.