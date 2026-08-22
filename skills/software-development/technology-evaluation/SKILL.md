---
name: technology-evaluation
description: Systematic approach to evaluating and comparing technologies, tools, or frameworks to make informed decisions based on specific requirements and context.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [evaluation, comparison, decision-making, technology-selection]
    related_skills: [plan, writing-plans, systematic-debugging]
---

# Technology Evaluation Methodology

A structured approach to evaluating and comparing technologies, tools, or frameworks to make informed decisions.

## When to Use This Skill

- Choosing between competing tools/frameworks
- Evaluating whether to adopt a new technology
- Assessing migration paths from legacy systems
- Making architecture decisions with multiple options
- When user asks "should I use X or Y?" or "what's the best way to..."

## Evaluation Process

### 1. Define Requirements & Context
```bash
# Clarify the specific use case
# What problem are we trying to solve?
# What are the constraints? (performance, budget, team expertise, etc.)
# What does "better" mean in this context?
```

### 2. Gather Information
For each technology being evaluated:
- Official documentation
- GitHub repositories (stars, activity, issues)
- Recent blog posts/tutorials
- Community discussions (Stack Overflow, Reddit, Discord)
- Benchmark reports (if applicable)
- Try basic examples/tutorials

### 3. Create Comparison Framework
Establish evaluation criteria relevant to your context:

| Criteria | Weight (1-5) | Notes |
|----------|--------------|-------|
| Learning Curve |  | How easy is it to get started? |
| Performance |  | Speed, resource usage, scalability |
| Maintenance |  | Update frequency, breaking changes, LTS |
| Community & Support |  | Documentation quality, activity, help availability |
| Ecosystem |  | Plugins, integrations, complementary tools |
| Cost |  | Licensing, infrastructure, training |
| Security |  | Track record, auditability, compliance |
| Flexibility |  | Customization options, extensibility |
| Debugging/Tooling |  | Dev tools, logging, debugging capabilities |

### 4. Hands-on Testing (When Possible)
- Build a minimal proof-of-concept
- Test edge cases relevant to your use case
- Measure actual performance if benchmarks aren't available
- Evaluate error handling and debugging experience

### 5. Analyze Trade-offs
- No technology is perfect - identify key trade-offs
- Consider long-term implications beyond initial implementation
- Assess risk factors (abandonment, breaking changes, vendor lock-in)

### 6. Document Findings
Create a comparison document including:
- Executive summary with recommendation
- Detailed pros/cons for each option
- Context-specific considerations
- Potential migration path if applicable
- Next steps / action items

### 7. Make Recommendation
Format: "Based on [context], I recommend [technology] because [specific reasons]. Consider [alternative] if [specific condition]."

## Anti-Patterns to Avoid
- Choosing based solely on popularity/trends
- Ignoring maintenance burden
- Over-engineering for hypothetical future needs
- Not considering team's existing expertise
- Failing to define clear success criteria
- Making decisions without hands-on testing when possible

## Example Output Structure

```
# Technology Evaluation: [Tool A] vs [Tool B]

## Executive Summary
[Brief recommendation with key reasoning]

## Context & Requirements
[Describe the specific use case and constraints]

## Evaluation Criteria
[List criteria with weights and justification]

## Detailed Comparison
### [Tool A]
**Pros:**
- [Specific advantage with evidence]
- [Specific advantage with evidence]

**Cons:**
- [Specific disadvantage with evidence]
- [Specific disadvantage with evidence]

### [Tool B]
**Pros:**
- [Specific advantage with evidence]
- [Specific advantage with evidence]

**Cons:**
- [Specific disadvantage with evidence]
- [Specific disadvantage with evidence]

## Recommendation
[Clear recommendation with reasoning]

## Next Steps
[Concrete actions to take if proceeding]
```

## When to Update This Skill
- After using it for a significant technology decision
- When you discover new evaluation criteria that proved important
- When your context changes significantly (different team, scale, constraints)
- When you learn about new tools that should be added to your evaluation toolkit

## Related Skills
- `plan` - For creating implementation plans after deciding
- `writing-plans` - For detailed technical specifications
- `systematic-debugging` - For troubleshooting during evaluation proofs-of-concept