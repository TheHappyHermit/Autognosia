---
name: multi-round-research
description: "Use for multi-pass entity research; avoids overflow."
---

# Multi-Round Research

## When to use
Researching a person/entity/domain where one deep dive would flood context with intermediate data, or where the topic spans many sources.

## Procedure
1. **Round 1 — Foundations**: who/what, origins, core facts. Budget: ~5KB of source material (1-2 searches). Write findings to `temp-<Subject>-R1.md`.
2. **Round 2 — Contributions**: work, achievements, key artifacts. Same budget → `temp-<Subject>-R2.md`.
3. **Round 3 — AI views / synthesis**: how the field or AI community evaluates them; cross-cutting themes → `temp-<Subject>-R3.md`.
4. Merge the three temp files into one final document (e.g., entity profile). Synthesize, don't concatenate.

## Why it works
Each round is small enough that context never overflows; a failure in one round doesn't poison later rounds; the merge step forces real synthesis instead of raw dump.
