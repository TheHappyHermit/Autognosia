# Debate-Driven Domain Topic Dispatch Patterns

## What Are Debate Files?

Domain topic files that map active theoretical disagreements as competing positions with named figures, key works, and current state of resolution. Written from domain knowledge — no web_search required.

## Dispatch Pattern

```
delegate_task(
    goal="Write <path>/<Debate-Topic>.md. Cover [debate areas]. Frame as active debates.",
    context="Oracle wiki. Create domain topic file. 25-35KB.\nNO execute_code/python/scripts allowed. Write from domain knowledge only.",
    role="leaf"
)
```

## File Size Targets

- **Debate domain topics:** 25-35KB (tolerance up to ~65KB if depth warrants)
- First drafts often overshoot by 20-30% — instruct subagent to trim to target
- Transfer-Learning hit context overflow at 71KB (overshoot was 115% over target)

## Proven Debate Topics from Session 2026-08-14

### AI/ML (8 debates)
- Representation-Learning-Debate (32KB)
- Reasoning-and-Planning-Debate (35KB)
- Alignment-Debate (37KB)
- General-Intelligence-Debate (35KB)
- Data-Efficiency-and-Sample-Complexity-Debate (failed — timeout)
- Transfer-Learning-and-Generalization-Debate (71KB — overshot)
- Scaling-Laws-and-Emergence-Debate (37KB)
- Reinforcement-Learning-Debate (65KB)
- Interpretability-Debate
- Deep-Learning-Critique-and-Alternatives

### Neuroscience (4 debates)
- Attention-and-Consciousness-Debate (34KB)
- Emotion-and-Decision-Making-Debate (failed — timeout)
- Neural-Correlates-of-Consciousness-Debate (34KB)
- Free-Energy-Principle-Debate (53KB)
- Learning-Theory-Debate (52KB)
- Memory-Systems-Debate
- Neuroplasticity-Debate (27KB)
- Perception-and-Action-Debate

### Philosophy of Mind (4 debates)
- Personal-Identity-and-the-Self-Debate (30KB)
- Representation-and-Computation-Debate (59KB)
- Theories-of-Consciousness-Debate
- Free-Will-and-Responsibility-Debate
- Embodied-and-Enactive-Cognition (38KB)
- Symbolic-AI-vs-Connectionism
- Language-and-Thought-Debate

## Failure Modes

1. **Context overflow** — If goal text is too long, the subagent runs out of tokens before writing. Keep goal under 1KB.
2. **Timeout** — Local model stream timeout after 600s. Happens when the subagent makes too many API calls. Keep context minimal.
3. **Overshoot** — First drafts can be 60-70KB. Instruct subagent to target 25-35KB and trim if needed.

## Key Lesson

Debate files are faster than entity profiles because they don't require web research — the subagent writes from domain knowledge directly. A single dispatch completes in 3-15 minutes vs 2-3 hours for research-heavy entity profiles.
