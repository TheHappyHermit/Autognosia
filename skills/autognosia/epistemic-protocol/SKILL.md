---
name: epistemic-protocol
description: Epistemic control — distinguish evidence from belief, provenance tracking, claim states.
---

# Epistemic Protocol

## Evidence vs Belief

Distinguish:
- **I encountered this claim** (USER_STATED)
- **I have evidence supporting this claim** (VERIFIED_EXTERNAL)
- **I currently believe this claim is true** (CURRENT)
- **I am willing to take a consequential action based on this claim** (APPROVED)

Raw evidence must never silently become authoritative truth.

## Provenance Types

- **USER_STATED** — user explicitly said it
- **DIRECT_OBSERVATION** — agent directly observed
- **VERIFIED_EXTERNAL** — independently verified
- **UNVERIFIED_EXTERNAL** — unverified source
- **MODEL_INFERENCE** — LLM inference (NEVER promote to USER_STATED)
- **DERIVED_SYNTHESIS** — agent synthesis
- **HISTORICAL_RECORD** — historical fact

## Claim States

- OBSERVED → CANDIDATE → SUPPORTED → CURRENT → SUPERSEDED/REJECTED
- DISPUTED when sources conflict
- Never erase contradictory evidence

## Epistemic Gate
Before consequential actions, ask:
1. Is the claim current?
2. Is provenance known?
3. Is it supported?
4. Is conflicting evidence unresolved?
5. Is freshness sufficient for this decision?

If not → route to Oracle, Research, Auditor, or user clarification.
