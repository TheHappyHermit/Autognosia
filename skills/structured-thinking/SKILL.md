---
name: structured-thinking
description: Use when facing complex analytical tasks that need disciplined reasoning structure. Apply frameworks like MECE, issue trees, hypothesis-driven thinking, and decision matrices to break down problems systematically. Triggers on requests to "think through this systematically", "help me analyze this", "what are my options", or when facing multi-factor decisions with no obvious answer.
---

# Structured Thinking

## What It Is

Structured thinking is the deliberate application of frameworks to organize complex reasoning. Unlike first principles (which strips to fundamental truths), structured thinking **organizes the reasoning process itself** — ensuring you cover all relevant factors, avoid double-counting, and make your logic inspectable.

The key insight: **how you structure a problem determines what solutions you can see**. A poorly structured analysis hides good solutions; a well-structured one makes them obvious.

## When to Use

- Multi-factor decisions with no obvious answer
- Problems where you suspect you're missing something but can't identify what
- Analysis that needs to be communicated to others (structure = clarity)
- Situations where cognitive biases might distort unstructured reasoning
- Complex tradeoffs between incommensurable values
- When you need to be able to defend your reasoning later

## Core Frameworks

### 1. MECE (Mutually Exclusive, Collectively Exhaustive)

Decompose a problem into categories that don't overlap and cover everything:

- **Mutually Exclusive**: No double-counting. Each element belongs to exactly one category.
- **Collectively Exhaustive**: Nothing important is left out. All categories together cover the whole.

**How to apply:**
1. List all factors relevant to the problem
2. Group them into categories
3. Check: does any factor belong to two categories? (violates MECE)
4. Check: is any factor left out? (violates CE)
5. Redraw boundaries until MECE is satisfied

**Common MECE structures:**
- **2x2 matrix**: Two independent dimensions create four quadrants
- **Process decomposition**: Steps in a sequence (input → process → output)
- **Stakeholder decomposition**: Each stakeholder's perspective
- **Time decomposition**: Past / Present / Future
- **Cost decomposition**: Fixed / Variable / Semi-variable

**Example:**
- Problem: "Why are sales declining?"
- Non-MECE: "Price, quality, marketing, competition, economy" (overlapping, incomplete)
- MECE: "Demand-side factors / Supply-side factors / Competitive factors / Macro factors"

### 2. Issue Trees (Logic Trees)

Break a question into sub-questions, recursively, until you reach answerable components:

```
[Top question]
├── [Sub-question A]
│   ├── [Sub-sub A1]
│   └── [Sub-sub A2]
├── [Sub-question B]
│   ├── [Sub-sub B1]
│   └── [Sub-sub B2]
└── [Sub-question C
```

**Rules:**
- Each level should be MECE
- Branches should be independent (no causal overlap)
- Leaf nodes should be directly answerable with data
- The tree should "answer" the top question when all leaves are resolved

**Types:**
- **Deductive tree**: Start from a conclusion, ask "what must be true for this to hold?"
- **Inductive tree**: Start from observations, group them into themes
- **Hypothesis tree**: Start from a proposed answer, break into testable sub-hypotheses

### 3. Hypothesis-Driven Thinking

Form a preliminary answer first, then test it — rather than analyzing everything before concluding:

1. **Form a hypothesis**: What do you think the answer is? (based on experience, intuition, or quick analysis)
2. **Identify what must be true**: For this hypothesis to be correct, what sub-claims must hold?
3. **Test the critical claims**: Which sub-claims are most uncertain or most consequential?
4. **Confirm or revise**: Does the evidence support the hypothesis?

**Why it's faster:**
- Focuses data collection on what matters
- Avoids "analysis paralysis" from trying to examine everything
- Mirrors the scientific method (hypothesis → test → revise)

**Risk:** Confirmation bias. Counter by actively seeking disconfirming evidence.

### 4. Decision Matrix (Weighted Criteria)

When choosing between options with multiple criteria:

1. List your options (rows)
2. List your criteria (columns)
3. Weight each criterion by importance (sum to 1.0)
4. Score each option on each criterion (1-5 or 1-10)
5. Multiply score × weight for each cell
6. Sum across rows to get total score

**Example:**
| Criteria (weight) | Option A | Option B | Option C |
|-------------------|----------|----------|----------|
| Cost (0.3) | 3×0.3=0.9 | 5×0.3=1.5 | 2×0.3=0.6 |
| Quality (0.4) | 4×0.4=1.6 | 2×0.4=0.8 | 5×0.4=2.0 |
| Speed (0.2) | 5×0.2=1.0 | 3×0.2=0.6 | 2×0.2=0.4 |
| Risk (0.1) | 3×0.1=0.3 | 4×0.1=0.4 | 3×0.1=0.3 |
| **Total** | **3.8** | **3.3** | **3.3** |

**When to use:** Multi-stakeholder decisions where tradeoffs need to be explicit and defensible.

### 5. Analysis of Competing Hypotheses (ACH)

When you need to distinguish between multiple possible explanations:

1. List all plausible hypotheses
2. List all evidence/observations
3. Create a matrix: hypotheses × evidence
4. For each cell, ask: "Is this evidence consistent, inconsistent, or irrelevant to this hypothesis?"
5. Look for evidence that **disproves** hypotheses (not evidence that confirms)
6. The hypothesis with the fewest inconsistencies is most likely

**Why it works:** Confirmation bias makes us seek evidence that supports our preferred hypothesis. ACH forces us to look at how each piece of evidence discriminates between hypotheses.

### 6. Pyramid Principle (Barbara Minto)

Structure communication so the most important point comes first:

```
[Answer/Recommendation] ← Start here
├── [Key argument 1]
│   ├── Supporting data
│   └── Supporting data
├── [Key argument 2]
│   ├── Supporting data
│   └── Supporting data
└── [Key argument 3]
    ├── Supporting data
    └── Supporting data
```

**Rules:**
- Top-down: Answer first, then supporting arguments
- Group ideas into pyramids of 3-7 supporting points
- Each level must logically support the level above
- Every point must be a summary of the points below it

**When to use:** Any analysis that needs to be communicated to decision-makers.

## Cognitive Forcing Strategies

Techniques to override systematic cognitive biases:

### Prospective Hindsight (Pre-Mortem)
Imagine you're in the future and the decision turned out badly. What went wrong?
- Creates psychological distance from current optimism
- Surfaces risks that feel abstract when thinking forward

### Consider the Opposite
For any conclusion you're reaching, ask: "What would I expect to see if the opposite were true?"
- Directly counters confirmation bias
- Works even when you just pretend to consider the alternative

### External View (Reference Class Forecasting)
Ignore the specifics of this case. Ask: "What happened in similar cases?"
- Counters optimism bias and planning fallacy
- Uses base rates instead of inside view

### Decomposition
Break a judgment into components and judge each separately.
- Counters halo effects and implicit biases
- Forces you to evaluate each dimension independently

## Structured Thinking vs Related Approaches

| Approach | Focus | Question it answers |
|----------|-------|---------------------|
| **First Principles** | Fundamental truths | "What is actually true?" |
| **Structured Thinking** | Reasoning organization | "How should I think about this?" |
| **Critical Thinking** | Argument evaluation | "Is this argument valid?" |
| **Systems Thinking** | Feedback loops and emergence | "How does this system behave?" |
| **Design Thinking** | Human-centered solutions | "What should we build?" |

## Common Failure Modes

1. **Framework fetishism**: Applying frameworks rigidly when the problem needs flexibility. Frameworks are tools, not rules.
2. **False precision**: Using a decision matrix with made-up weights and scores to justify a gut decision. If the inputs are garbage, the output is garbage.
3. **MECE-washing**: Creating categories that look MECE but don't actually illuminate the problem. MECE is a means, not an end.
4. **Analysis without action**: Structuring forever without making a decision. Set a "good enough" threshold.
5. **Ignoring the meta-level**: Applying structured thinking to the wrong problem. Sometimes the problem itself needs reframing.

## Integration with Other Skills

- **First Principles**: Use when you need to challenge the fundamental assumptions within your structure
- **Epistemic Protocol**: Use when evaluating evidence within your analysis
- **Cortex Verification**: Use when checking the conclusions of your structured analysis
- **Personal Cognitive Router**: Use to decide when structured thinking is the right mode

## Quick Reference

```
PROBLEM: [State the problem]

STRUCTURE SELECTION:
- Need to decompose? → MECE or Issue Tree
- Need to decide? → Decision Matrix
- Need to explain? → Pyramid Principle
- Need to diagnose? → Hypothesis-Driven or ACH
- Need to forecast? → Prospective Hindsight

APPLY:
[Selected framework with data]

CHECK:
- Am I missing anything important? (CE check)
- Am I double-counting anything? (ME check)
- Am I seeking disconfirming evidence?
- What would change my mind?

COMMUNICATE:
[Pyramid structure: answer first, then supporting arguments]
```
