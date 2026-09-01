---
name: first-principles
description: Use when facing complex problems that need fundamental reasoning from ground truth. Decompose assumptions, audit beliefs, and rebuild understanding from base principles. Triggers on requests to "think from first principles", "what's really true here", "strip away assumptions", or when conventional wisdom seems wrong.
---

# First Principles Thinking

## What It Is

First principles reasoning strips a problem down to its most fundamental, undeniable truths — then builds back up. Instead of reasoning by analogy ("this is how it's always been done"), you ask: **What is actually true here? What can I not doubt?**

The opposite of first principles is **reasoning by analogy**: copying existing solutions, following conventions, or accepting inherited assumptions without scrutiny.

## When to Use

- Conventional wisdom about a problem seems wrong or incomplete
- You're entering a domain where you have no experience (no analogies to copy)
- Existing solutions are failing and you need a fundamentally different approach
- Someone says "that's just how it's done" and you want to challenge it
- You're designing something novel where no template exists
- Cost/performance ratios seem absurd and you suspect they're based on legacy constraints

## The DARE Framework

### 1. Decompose — Break the problem into its most fundamental truths

Ask: *What do I know to be absolutely true?*

- Strip away all assumptions, conventions, and inherited beliefs
- Identify the physical, mathematical, or logical constraints that cannot be violated
- Separate "facts" from "stories we tell about facts"
- Push past surface-level features to underlying mechanisms

**Prompts:**
- "What are the fundamental constraints here that cannot be changed?"
- "If I strip away all assumptions, what remains?"
- "What is the actual mechanism at work beneath the surface?"
- "What would be true in any possible world?"

### 2. Audit — Examine your own beliefs and assumptions

Ask: *Which of my "truths" are actually just assumptions?*

- List every belief you hold about the problem
- For each belief, ask: "How do I know this is true?"
- Distinguish between direct evidence and inference
- Identify cognitive biases that may be distorting your view

**Common assumption types to audit:**
- **Convention**: "This is how it's always been done"
- **Authority**: "An expert told me this"
- **Analogy**: "It worked in another domain, so it must work here"
- **Inertia**: "We've already invested in this approach"
- **Framing**: "The problem was presented this way, so I assume it's the right frame"

**Prompts:**
- "What am I assuming that might not be true?"
- "If I learned this belief from someone else, have I verified it?"
- "What would prove this belief wrong?"
- "Am I confusing familiarity with truth?"

### 3. Recombine — Build new solutions from the ground up

Ask: *Given only the fundamental truths, what solutions become possible?*

- Combine fundamental truths in novel ways
- Don't be constrained by existing solutions or categories
- Look for solutions that would work even if no one had ever tried anything before
- Consider approaches that seem "impossible" given current conventions

**Prompts:**
- "If I were starting from scratch with no legacy, what would I build?"
- "What solution emerges if I only respect physical/logical constraints?"
- "What would this look like if cost were no object? If time were no object?"
- "What's the simplest possible solution that satisfies all constraints?"

### 4. Experiment — Test your rebuilt understanding

Ask: *How can I verify this new understanding quickly?*

- Design the cheapest possible test
- Identify the riskiest assumption and test it first
- Look for disconfirming evidence, not just confirming
- Be willing to kill your new idea if evidence contradicts it

**Prompts:**
- "What's the smallest experiment that would validate or invalidate this?"
- "What would I expect to see if this is wrong? Am I seeing it?"
- "What's the fastest way to be proven wrong?"
- "If this experiment fails, what does that teach me?"

## Additional Frameworks

### Socratic Questioning

A systematic method for probing assumptions through disciplined questioning:

1. **Clarification**: "What do you mean by X?" "Can you give me an example?"
2. **Assumptions**: "What are we assuming here?" "Why might that assumption be wrong?"
3. **Evidence**: "How do we know this is true?" "What evidence supports this?"
4. **Alternatives**: "Is there another way to look at this?" "What if the opposite were true?"
5. **Implications**: "If this is true, what follows?" "What are the consequences?"
6. **Meta-question**: "Why is this question important?" "What should we be asking instead?"

### Inversion (Charlie Munger)

Instead of asking "how do I succeed?", ask **"how do I guarantee failure?"** — then avoid those things.

- What would make this project fail for certain?
- What decisions would guarantee a bad outcome?
- What assumptions, if wrong, would be catastrophic?

### Pre-Mortem Analysis (Gary Klein)

Imagine the project has already failed. Ask: *What went wrong?*

- Creates "prospective hindsight" — thinking backward from a future failure
- Surfaces risks that optimism would otherwise hide
- Works because it's easier to imagine concrete failures than abstract risks

### Second-Order Thinking

For every effect, ask: **"And then what?"**

- First order: "If we do X, Y will happen"
- Second order: "If Y happens, what else happens?"
- Third order: "If Z happens, what are the systemic consequences?"

Most people stop at first-order effects. Second-order thinking reveals hidden costs and cascading impacts.

### The 5 Whys

Keep asking "why?" until you reach a root cause:

- "Why did this fail?" → "Because the server crashed"
- "Why did the server crash?" → "Because it ran out of memory"
- "Why did it run out of memory?" → "Because the cache wasn't bounded"
- "Why wasn't the cache bounded?" → "Because we never tested at scale"
- "Why didn't we test at scale?" → "Because we didn't have a staging environment"

The fifth why reveals the systemic fix, not just the symptom.

## Cognitive Biases to Watch

| Bias | What it does | How to counter |
|------|-------------|----------------|
| **Confirmation bias** | Seeks evidence that supports existing beliefs | Actively seek disconfirming evidence |
| **Anchoring** | Over-relies on first piece of information | Deliberately re-anchor from different starting points |
| **Availability heuristic** | Overweights recent or vivid examples | Look for base rates and statistical evidence |
| **Dunning-Kruger** | Overestimates understanding of complex topics | Ask "what would I need to know to know I'm wrong?" |
| **Sunk cost fallacy** | Continues because of past investment | Ask "if I were starting today, would I choose this?" |
| **Status quo bias** | Prefers current state over alternatives | Ask "if this weren't already true, would I choose it?" |

## Common Failure Modes

1. **False fundamentals**: Mistaking a deeply-held assumption for an undeniable truth. Always ask: "Could I be wrong about this?"
2. **Premature convergence**: Settling on a new solution too quickly. Sit with the decomposed state longer.
3. **Analysis paralysis**: Decomposing forever without recombining. Set a deadline for moving to solutions.
4. **Elegant irrelevance**: Building a beautiful solution to the wrong problem. Re-audit the problem framing.
5. **Cargo cult reasoning**: Going through the motions of first principles without actually challenging assumptions.

## Integration with Other Skills

- **Epistemic Protocol**: Use when auditing beliefs — distinguish evidence from assumption
- **Structured Thinking**: Use when recombining — structure the solution space
- **Cortex Verification**: Use when experimenting — verify claims against reality
- **Personal Cognitive Router**: Use to decide when first principles is the right mode

## Quick Reference

```
PROBLEM: [State the problem]

DECOMPOSE:
- Fundamental truths: [What cannot be doubted]
- Constraints: [What cannot be changed]
- Mechanisms: [How things actually work]

AUDIT:
- Assumptions I'm making: [List]
- How I know each is true: [Evidence level]
- What would prove each wrong: [Falsification test]

RECOMBINE:
- Solutions from scratch: [Build from truths only]
- Simplest possible: [Minimum viable solution]
- If no legacy: [Greenfield approach]

EXPERIMENT:
- Riskiest assumption: [What to test first]
- Smallest test: [Cheapest validation]
- Disconfirmation signal: [What would prove this wrong]
```
