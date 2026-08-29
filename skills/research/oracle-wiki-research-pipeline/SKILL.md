---
name: oracle-wiki-research-pipeline
description: Use when building Oracle wiki via researcher delegation.
---

# Oracle Wiki Research Pipeline

## Research Protocol (CRITICAL)

**NEVER use web_search directly.** All internet research goes through the Researcher profile via `delegate_task`. This is enforced via `/home/josh434/.autognosia/SYSTEM-RULES.md`.

**NEVER write research files yourself.** Your training data is not verified research. Only content produced by the Researcher profile (which uses web_search) counts as verified.

## Delegation Strategy

### Context Window Management
- **Send ONE researcher at a time** when topics are large. The local model (RTX 3090) has limited context space.
- **Break large topics into 2-3 smaller sub-topics** if a single researcher would exceed context limits.
- **Example:** Instead of "Agent Systems" (too broad), send "Early Agent Systems & Coding Agents" then "Agent Memory & Benchmarks" separately.
- **Watch for context overflow:** If a researcher returns "Context length exceeded", the scope was too large — split it next time.

### Researcher Instructions
Always include these in the context:
```
CRITICAL INSTRUCTIONS:
1. You MUST write your research directly to a markdown file using write_file
2. Use web_search to verify facts, citations, and current data before writing
3. Keep entries concise (2-3 paragraphs each)
4. Include specific papers, researchers, and dates
```

### File Naming Convention
```
/home/josh434/.autognosia/oracle/brain\<Domain>\Domain-Topic-PartN-<Specific>.md
/home/josh434/.autognosia/oracle/brain\Entities\<Person-Name>.md          # For individual researchers/thinkers
/home/josh434/.autognosia/oracle/brain\Entities\<Theory-Name>.md          # For named theories/frameworks
```

## Pipeline Loop

1. **Dispatch** researcher with narrow scope → waits for completion
2. **Verify** file was actually written to disk (`ls -la` the target path)
3. **Evaluate** coverage gaps against target domains
4. **Dispatch** next researcher for identified gaps
5. **Repeat** until comprehensive across all target domains
6. **Synthesize** only after wiki is fully populated

## File Handling Constraints

### Large write_file Timeouts
- **Parent agent:** `write_file` can timeout on payloads >~8K tokens. Break into multiple smaller files (Part1, Part2, etc.) or use `patch` for targeted edits.
- **Subagents (researchers):** Have separate, higher limits — successfully write 20-43KB files. Do NOT artificially split researcher payloads.
- See `references/wave-dispatch-patterns.md` for validated limits.

### Front Matter Compliance
All wiki files require:
```yaml
---
title: "Topic Title"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
type: research_report
tags: [relevant, tags]
sources:
  - "Author Year Paper Title"
confidence: 0.9
---
```

## Target Domains

### Core Cognition (always covered)
- Neuroscience, Memory Systems, Attention Mechanisms
- Neuroplasticity & Learning, Sleep & Offline Processing
- Emotion & Affective Computing, Motivation & Curiosity
- Creativity & Insight, Language & Thought
- Decision Making Under Uncertainty, Pathology & Failure Modes
- Scaling & Emergence, Tool Use & Extended Mind

### AI & Systems
- AI/LLM cognition & theory, Agent Systems
- Chinese AI Research, Open Source AI
- Developmental AI, Information Theory & Evolution
- Embodiment & Robotics, Consciousness Studies
- Self-Reflection & Metacognition

### Comparative & Social
- Animal Cognition, Social Cognition & Collective Intelligence

### Philosophy & Psychology
- Philosophy of Mind, Psychology (major figures)
- Ancient Greek Philosophy, Nietzsche & Existentialism
- Religion & Philosophy of Mind
- Depth Psychology (Jung, Freud, Bernays)

### Totality Mandate
Coverage must span: neuroscience fundamentals, AI cognition theory, human psychology, philosophy of mind, animal cognition, consciousness studies, historical philosophers (ancient Greeks to Nietzsche), depth psychology (Jung, Freud, Bernays), and religious/contemplative traditions. No synthesis until exhaustive.

## Pitfalls

- **Context overflow** — If a researcher returns "Context length exceeded", the scope was too large. Split into 2-3 narrower sub-topics next time.
- **File not written** — Always verify the file exists on disk (`ls -la` the target path). If missing, re-dispatch with narrower scope.
- **Stale research** — Require web_search verification in every researcher prompt.
- **Batching too many researchers** — Sequential dispatch only. The 3090 has limited context.
- **Assistant writing research directly** — Only the Researcher profile/subagent conducts research and writes files. This avoids hallucination and training data leakage.
- **write_file timeouts** — Parent agent payloads >~8K tokens timeout (break into parts). Subagents have higher limits — see File Handling Constraints section.
- **Scope too broad** — If a topic has 5+ sub-topics, split across 2 researchers. Each should cover 2-3 sub-topics max.
- **Missing historical depth** — Always include both foundational thinkers (ancient Greeks, Freud, Jung) and cutting-edge research (2024-2025 papers).
- **Missing global perspective** — Cover Chinese, European, and American research labs. Don't limit to US/UK sources.
- **Missing religious/philosophical perspective** — Include how major world traditions understand consciousness, mind, and self.
- **Entity entries need different structure** — Person/theory entries go in `Entities/` with biographical header, core claims, evidence, and implications — not the domain-report format.
- **Size constraints from user must be respected** — If the user specifies a max size (e.g., 25KB), draft then trim. First drafts often overshoot by 20-30%.
## Synthesis Deferral
Do NOT generate architecture recommendations or implementation plans until the wiki is fully populated and cross-referenced across all target domains. Research first, synthesize later.

## Support Files
- `references/researcher-context-template.md` — reusable researcher prompt template
- `references/current-domain-list.md` — up-to-date list of Oracle vault domains
