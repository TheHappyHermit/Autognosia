---
name: prompt-me
version: 2.0.0
description: >
  Execute an Active Learning protocol to eliminate future execution friction.
  Analyze recent interactions, identify high-utility missing variables,
  formulate hypotheses, and extract conditional logic to permanently optimize operations.
trigger: /prompt.me
---

# prompt-me Skill

## Purpose

Ask one targeted question at a time to sharpen plans, challenge thinking, and surface blind spots. After the exchange, archive the conversation to cold storage.

## Workflow

### Phase 1: Internal State Analysis (Silent)

1. Scan recent episodic memories and task executions.
2. Identify a "Friction Point." A friction point is defined as:
   - A variable you had to guess (e.g., mapping a specific directory path).
   - An inefficient hardware or network assumption.
   - A formatting or execution preference you lacked.
   - A recurring pattern where you lacked context.
3. If no high-utility friction point exists, **abort the questioning protocol**. Do not ask trivia.

### Phase 2: Hypothesis Generation (Silent)

Instead of formulating an open-ended question, formulate a targeted hypothesis based on context clues.

- **Poor:** "How do you want me to configure X?"
- **Excellent:** "To maximize efficiency, I assume we should do X. Should I lock this as the default rule?"

### Phase 3: The User Engagement

Present your query using this strict structure:

1. **The Value Prop:** Briefly state exactly what future automated task you are trying to optimize.
2. **The Hypothesis:** State your assumption and ask for confirmation or correction.

### Phase 4: Conditional Extraction & Memory Commit

Once the user answers, process the data using Conditional Ontology rules:

- Extract the core fact.
- Extract the boundary conditions (e.g., "Yes, do X, but ONLY when condition Y is met").
- If the user's answer conflicts with an existing memory, **OVERWRITE** the old memory. Do not append it as a duplicate.
- Silently commit this structured rule to long-term memory.
- Close the interaction with a brief, non-robotic acknowledgment (e.g., "Got it. Rule locked in for future tasks."). Do not narrate your database mechanics.

## Archive to Cold Storage

When the exchange is complete, archive the question and answer to the wiki:

```markdown
---
id: system/memory-archive/prompt-me/YYYYMMDD-topic
title: prompt-me - Topic
type: system
tags: [prompt-me, archive]
created: YYYY-MM-DD
---

# Question: [the question asked]

## Response
[user's answer]

## Outcome
[what changed as a result]

Source: session:YYYYMMDD_HHMMSS
```

## Consolidation

When hot memory exceeds 80% capacity, archive old prompt-me entries to cold storage following the wiki ingestion standards (frontmatter, headings, source field).

## Wiki Location

- **Active Wiki:** `/home/josh434/.autognosia/active-wiki/`
- **prompt-me archive:** `/home/josh434/.autognosia/active-wiki/system/memory-archive/prompt-me/`
