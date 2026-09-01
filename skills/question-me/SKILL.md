---
name: question-me
description: "Use when /question.me. Ask one question to improve work."
version: 4.0.0
---

# Question Me

Ask the user one targeted question designed to improve how you work together. The goal is surface information you're missing that would meaningfully improve outcomes.

## Memory Architecture

Three tiers — information flows **down**, never disappears:

| Tier | Storage | What lives here | Access |
|------|---------|----------------|--------|
| **Hot** | Persistent memory | Active preferences, current conventions, things needed every turn | Always loaded |
| **Warm** | Holographic memory (fact_store) | Facts, project details, environment info | `fact_store probe/search` |
| **Cold** | LLM Wiki (`/home/<USER>/.autognosia/active-wiki\`) | Archived preferences, settled decisions, historical context | File reads + wiki search |

**Key principle:** Old ≠ wrong. When consolidating, **move entries down, never delete**. The wiki is crystallized expertise — settled knowledge that doesn't need to be in hot memory but is instantly retrievable.

### Threshold Trigger

**When hot memory exceeds 80% capacity (~1760/2200 chars), trigger consolidation immediately** — don't wait for the user or for weekly/monthly windows. Check capacity before saving any new memory entry.

## Step 1: Check What You Already Know

Before asking anything, audit your existing knowledge:

- **Check hot memory** (memory entries) — don't ask about things already recorded
- **Check warm memory** (`fact_store action=list`) — don't ask about things in holographic memory
- **Check question history** — scan recent sessions for previous `/question.me` uses. Track which categories you've covered and rotate away from them.

## Step 2: Look for Learning Signals

Not all gaps are equal. Prioritize these signal types in order:

| Priority | Signal Type | How to Find |
|----------|-------------|-------------|
| 🔴 **Corrections** | User corrected you about their preferences, setup, or behavior | `session_search(query="no that's not right" OR "actually" OR "you should" OR "don't")` |
| 🟠 **Friction** | User had to repeat themselves, re-explain, or steer you multiple times | `session_search(query="I already told" OR "remember" OR "we discussed")` |
| 🟡 **Failures** | Tasks that failed, produced wrong results, or frustrated the user | `session_search(query="failed" OR "didn't work" OR "wrong" OR "broken")` |
| 🟢 **New territory** | User started working on something you know nothing about | Recent sessions, cron jobs, project files |
| 🔵 **Preferences** | Unsettled conventions (format, tone, detail level, workflow) | Look for inconsistency in how you've handled similar tasks |

**Corrections are the highest-value learning signals.** When the user corrects you, that's a fact they care about getting right.

## Step 3: Pick Your Angle

Choose one category based on your reconnaissance. Rotate through categories to cover ground:

| Category | Example |
|----------|---------|
| **User preference** | "Do you prefer concise summaries or detailed breakdowns when I report cron job results?" |
| **System/environment** | "What's the SSH username for the Oracle server?" |
| **Project context** | "What's the target audience for the website you're building?" |
| **Workflow convention** | "When you forward an article, do you want me to auto-ingest it or ask first?" |
| **Gap in knowledge** | "You mentioned ESP32 work — which dev board are you using?" |
| **Decision/clarification** | "You have two servers — which one should I SSH into for general admin tasks?" |
| **Correction follow-up** | "Last time I used X and you said to use Y instead — should I always prefer Y?" |
| **Failure post-mortem** | "The dashboard links didn't work when you clicked them — what should they actually do?" |

**Rules for a good question:**
- Only **one** question at a time — don't overwhelm
- It should be something you genuinely don't know but would benefit from knowing
- It should be specific, not vague ("what do you want from me?" is bad)
- Ground it in evidence — reference something you found during reconnaissance ("I noticed in session X you did Y, should I always...?")
- Skip anything trivial or easily re-discovered
- **Don't repeat categories** you've asked about in the last 3-5 uses

## Step 4: Ask the Question

Use `clarify` with the appropriate mode:
- **Single-select** if there are clear options (up to 4 choices)
- **Multi-select** if multiple options can apply
- **Open-ended** if the answer is free-form

Frame it naturally — explain *why* you're asking (e.g., "I noticed X in our past sessions, so I want to clarify Y").

## Step 5: Save and Verify

When the user responds:

1. **Save to the right tier:**
   - User preference → `memory target=user` (hot)
   - Environment/system fact → `memory target=memory` or `fact_store` (warm)
   - Project detail → `fact_store category=project` (warm)
   - Reusable procedure → Consider saving as a skill via `skill_manage`
   - Historical context / settled decision → Wiki file in appropriate directory (cold)

2. **Verify back what you saved** — confirm the exact wording so the user can catch mistakes before they fossilize:
   > "Saved: [exact text]. Does that capture it correctly?"

3. **Update question rotation** — note which category you just covered so you rotate next time.

## Consolidation Mode (Cascade, Never Delete)

When memory is near capacity and the user triggers `/question.me`, or when hot memory exceeds 80%:

### Hot → Warm → Cold Cascade

1. **List current hot memory entries** and identify "cooled" entries (haven't been referenced or triggered recently)

2. **Merge related entries** — combine overlapping facts into one entry to free space. This is the #1 space-saver.

3. **Propose demotions, not deletions:**
   - **Hot → Warm:** Move infrequently-used facts to `fact_store` with tags noting origin
   - **Warm → Cold:** Move settled/stable facts to wiki files

4. **Wiki ingestion (full pipeline):**
   
   When archiving to cold storage (wiki), follow the **complete 8-step ingestion pipeline**:
   
   a. **Categorize** — place in `/home/<USER>/.autognosia/active-wiki\system\memory-archive\` with the right file:
      - User preferences → `preferences.md`
      - Decisions → `decisions.md`
      - Environment facts → `environment.md`
   
   b. **Add YAML frontmatter** (per SCHEMA.md):
   ```yaml
   ---
   id: system/memory-archive/preferences
   title: Archived User Preferences
   type: system
   status: current
   created: YYYY-MM-DD
   updated: YYYY-MM-DD
   tags: [memory, archive, system]
   related: []
   ---
   ```
   
   c. **Source reference (road back to evidence):**
   
   Every archived entry MUST include a `source` field that preserves the trail back to the original evidence. This is the key difference between compaction (loses the trail) and consolidation (keeps it):
   
   ```markdown
   ### Preference Name
   - **Value:** What was decided
   - **Source:** session:20260806_181507 / user correction in Telegram / wiki page [[some-page]]
   - **Archived:** Date moved from hot memory
   - **Context:** Why it mattered / when it applied
   ```
   
   Source types:
   - `session:YYYYMMDD_HHMMSS` — from a specific session
   - `user-correction` — user corrected me about something
   - `user-preference` — user stated a preference directly
   - `wiki:[[page-name]]` — derived from a wiki page
   - `cron-job:job_id` — discovered during a cron job run
   
   **Without a source reference, the entry is just a summary with no road back to evidence.**
   
   d. **Use proper headings** — H1 for title, H2 for sections, H3 for individual entries
   
   d. **Add cross-references** — `[[wikilinks]]` to related pages
   e. **Update wiki index** — add entry to `/home/<USER>/.autognosia/active-wiki\index.md` if the archive section doesn't exist yet
   f. **Update log** — append to `/home/<USER>/.autognosia/active-wiki\log.md`: `## YYYY-MM-DD: memory consolidation | archived X entries from hot memory`
   g. **Verify** — check frontmatter is valid, links resolve
   h. **Obsidian sync** — files are in the Obsidian vault directory, so they're automatically visible. Confirm no files are orphaned outside the vault.

5. **Keep a pointer** in hot memory: "Archived preferences → [[Archived User Preferences]]"

6. **Promote on demand** — if the user references something archived, bring it back up to the appropriate tier

7. **Batch operations** — apply demotions + new entry in a single batch call to stay within char limits

8. **Log the consolidation** — append to `memory-archive/log.md` with date, what moved, and why

### Monthly Consolidation (via cron job)

The monthly systems review cron job also audits memory tiers:
- Reviews hot memory for entries that could demote to warm
- Reviews warm memory for entries that could archive to cold (wiki)
- Proposes a consolidation plan to the user for approval
- Never auto-deletes — user always approves demotions

## When NOT to Ask

- If memory is already full on the topic
- If the question would be answered by checking a file or config that you can check yourself
- If the user seems in a hurry or is giving you a direct task (don't interrupt flow)
- If you've asked about this category recently (check rotation)
