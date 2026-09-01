---
name: karpathy-guidelines
description: Use when writing, editing, or reviewing ANY code. These are always-on behavioral guidelines derived from Andrej Karpathy's observations on LLM coding pitfalls. They prevent overcomplication, hidden assumptions, and bloated diffs.
metadata:
  hermes:
    tags: [coding, guidelines, best-practices, simplicity, verification, behavioral, always-on]
---

# Karpathy-Inspired Coding Guidelines

> "The models make wrong assumptions on your behalf and just run along without checking. They don't manage their confusion, don't seek clarifications, don't surface inconsistencies, don't present tradeoffs, don't push back when they should."
> — Andrej Karpathy

## When to Use

These guidelines are **always active** for any coding task. They apply when:
- Writing new code
- Editing existing code
- Reviewing code
- Debugging
- Refactoring
- Planning implementation

## The Four Principles

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing anything:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

**The test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## Integration with OpenCode Workflow

When working with OpenCode:
1. **Before sending a task to OpenCode**: Include the relevant Karpathy principle in the task brief
2. **After OpenCode completes work**: Check that simplicity and surgical changes principles were followed
3. **If overcomplicated**: Send back to OpenCode with "Apply Karpathy principle #2 — simplify this"

## Josh-Specific Applications

- **Dashboard work**: Every feature should be just complex enough — no speculative "flexibility"
- **API integrations**: Change only what's needed for the integration, don't refactor adjacent code
- **Bug fixes**: Write a reproduction test first, then fix — don't shotgun debug
- **PII scrubbing**: Surgical changes principle — don't "improve" unrelated code while scrubbing

## Tradeoff Note

These guidelines bias toward **caution over speed**. For trivial tasks (typo fixes, obvious one-liners), use judgment — not every change needs the full rigor.

**Goal**: Reduce costly mistakes on non-trivial work, not slow down simple tasks.
