---
name: prompt-me
version: 3.0.0
description: >
  Execute a "getting to know you" learning protocol. Ask one targeted question
  that helps build a model of the user's preferences, goals, and working style.
  NOT for operational tasks — those go on his task list.
trigger: /prompt.me
---

# prompt-me Skill

## Purpose

Ask one targeted question at a time to learn more about the user — his preferences, goals, working style, and how he wants things done. This is about building a long-term model of who he is, not generating operational tasks.

## What the user DOESN'T Want

- "What single unblocked operational task would yield the greatest leverage?"
- "Which subscription should I cancel?"
- "What task should I complete for you today?"
- "Which tool should I fix next?"

These are **operational tasks** — they go on his task list, not in prompt-me. the user is clear: he takes care of operational follow-ups himself when he's ready.

## What the user DOES Want

Questions that help you learn:
- His preferences and working style
- How he wants things done
- His goals (short and long term)
- What frustrates him
- What he values
- How he prefers to receive information
- What assumptions he wants you to challenge
- How he measures success

## Workflow

### Phase 1: Internal State Analysis (Silent)

1. Scan recent sessions for the user correcting your assumptions or approach
2. Identify a genuine gap in your understanding of him — not a task gap, a **person gap**
3. If you can't find a real knowledge gap, **abort**. Don't ask filler.

### Phase 2: Formulate a Learning Question

Frame the question around understanding the user better:

- **Poor:** "How do you want me to configure X?" (operational)
- **Good:** "When you think about your ideal daily workflow, what's the one friction point that consistently slows you down?" (learning)
- **Poor:** "What should I do about your subscriptions?" (operational)
- **Good:** "Is there a tool or process you've tried that you wanted to work but couldn't get working — and what made you give up?" (learning)

### Phase 3: The Engagement

Present your query using this strict structure:

1. **The Context:** Briefly reference what triggered the question (a session observation, a correction he made, a gap you noticed)
2. **The Question:** A single, specific, non-operational question about his preferences, goals, or working style

### Phase 4: Save to Memory

Once the user answers:

1. Extract the core preference or goal
2. Extract boundary conditions ("Yes, but only when...")
3. If the answer conflicts with existing memory, **overwrite** the old memory
4. Commit to the appropriate memory tier:
   - Hot memory: active preferences referenced every session
   - Warm memory (fact_store): environment facts, project context
   - Cold (wiki): archived preferences, settled decisions
5. Close with a brief acknowledgment — do not narrate database mechanics

## Consolidation

When hot memory exceeds 80% capacity, cascade cooled entries to warm/cold tiers following wiki ingestion standards. Always preserve source references so there's a road back to evidence.

## Wiki Location

- **Active Wiki:** `$HOME/.autognosia/active-wiki/`
- **prompt-me archive:** `$HOME/.autognosia/active-wiki/system/memory-archive/prompt-me/`
