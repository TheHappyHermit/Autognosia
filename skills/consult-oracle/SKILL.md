---
name: consult-oracle
version: 1.0.0
description: >
  Route specialist questions to the Oracle profile for domain expertise.
  Use when the question requires specialized knowledge beyond general reasoning.
---

# Consult Oracle Skill

## Purpose

Delegate specialist questions to the Oracle profile, which has access to curated domain knowledge.

## When to Use

- Technical questions requiring domain expertise
- Framework and methodology questions
- Questions about specialized topics in the Oracle vault
- When the answer requires more than general reasoning

## Workflow

1. **Identify the question** — What domain expertise is needed?
2. **Gather context** — What personal context does the Oracle need?
3. **Delegate to Oracle** — Use `delegate_task` with the oracle profile
4. **Receive results** — Oracle returns structured analysis with vault citations
5. **Verify and respond** — Check Oracle's answer, cite sources, respond to user

## Example

```python
delegate_task(
    goal="Analyze this financial planning strategy",
    context="User is a financial planner with CS background...",
    profile="oracle"
)
```

## What NOT to Consult Oracle About

- Personal facts and preferences
- Task management questions
- General knowledge that doesn't require domain expertise
- Questions that can be answered from the personal wiki