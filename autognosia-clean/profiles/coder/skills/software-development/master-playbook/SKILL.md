---
name: software-development
description: Master playbook for developing software with OpenCode. This is the PRIMARY skill for any coding project — it defines the full lifecycle, which skills to use at each phase, and how the coder agent collaborates with OpenCode and the main Hermes agent. Load this skill before starting any coding work.
metadata:
  hermes:
    tags: [coding, playbook, workflow, opencode, lifecycle, master, always-on]
---

# Software Development Master Playbook

This is the **master playbook** for developing software with OpenCode. It defines the complete lifecycle, which skills to use at each phase, and how to collaborate with OpenCode and the main Hermes agent.

## How to Use This Skill

**Load this skill at the START of any coding project.** It tells you:
1. Which phase of development you're in
2. Which specialized skill to use for that phase
3. How to brief OpenCode for that phase
4. How to verify the output before moving on

## The Development Lifecycle

Every coding project follows this lifecycle:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOFTWARE DEVELOPMENT LIFECYCLE                │
├─────────────────────────────────────────────────────────────────┤
│  1. DISCOVER      → What are we building? Why?                  │
│  2. PLAN          → How will we build it? What's the architecture?│
│  3. DESIGN        → What does it look like? How does it feel?   │
│  4. SPECIFY       → What are the exact requirements?             │
│  5. IMPLEMENT     → Write the code                              │
│  6. VERIFY        → Does it work? Is it production-ready?        │
│  7. REVIEW        → Is the code quality high?                   │
│  8. SHIP          → Deploy and deliver                          │
└─────────────────────────────────────────────────────────────────┘
```

## Phase 1: DISCOVER

**Goal:** Understand what you're building and why.

### When to use:
- New feature requests
- New project ideas
- Vague requirements that need clarification

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| gstack | `/office-hours` | Any new feature > 2 hours |
| gstack | `/plan-ceo-review` | Strategic product decisions |
| context7 | `ctx7 docs /library/id` | Library/framework questions |

### Workflow:
1. **Coder:** Receive task from main agent
2. **Coder:** If task > 2 hours, brief OpenCode to run `/office-hours`
3. **OpenCode:** Runs `/office-hours` — asks 6 forcing questions, challenges framing
4. **OpenCode:** Produces design doc with implementation alternatives
5. **Coder:** Review design doc, verify it addresses the original request
6. **Coder:** If unclear, send back to OpenCode with specific questions

### Verification:
- [ ] Design doc exists and addresses the original request
- [ ] Multiple implementation approaches considered
- [ ] Success criteria defined

## Phase 2: PLAN

**Goal:** Define the technical approach and architecture.

### When to use:
- After discovery is complete
- Before any code is written
- When architecture decisions are needed

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| gstack | `/plan-eng-review` | Architecture, data flow, edge cases |
| gstack | `/plan-design-review` | Design review (if UI involved) |
| gsd-core | `/gsd-new-project` | New repo/service setup |
| gsd-core | `/gsd-onboard` | Existing codebase onboarding |

### Workflow:
1. **Coder:** Brief OpenCode to run `/plan-eng-review` with the design doc
2. **OpenCode:** Produces architecture plan with diagrams, edge cases, tests
3. **Coder:** Review plan for simplicity (karpathy principle #2)
4. **Coder:** If overcomplicated, send back with "simplify this"
5. **Coder:** Verify plan covers all requirements from discovery

### Verification:
- [ ] Architecture defined with diagrams
- [ ] Data flow documented
- [ ] Edge cases identified
- [ ] Test strategy defined
- [ ] Plan is SIMPLE (karpathy principle #2)

## Phase 3: DESIGN

**Goal:** Define the visual design and user experience.

### When to use:
- Any UI work (web pages, dashboards, admin panels)
- Before implementing frontend code
- When visual quality matters

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| gstack | `/design-consultation` | Build design system from scratch |
| gstack | `/design-shotgun` | Generate multiple design variants |
| gstack | `/design-html` | Production HTML generation |
| gsd-core | `/gsd-ui-phase` | UI design contract |

### Workflow:
1. **Coder:** Brief OpenCode to run `/design-consultation` with requirements
2. **OpenCode:** Proposes design system, creative risks, mockups
3. **Coder:** Review design for Josh's preferences (dark glassmorphism)
4. **Coder:** If unsure about taste, consult main Hermes agent
5. **OpenCode:** Generates production HTML with `/design-html`

### Josh's Design Preferences:
- **Aesthetic:** Dark-themed glassmorphism
- **Colors:** Dark backgrounds (#0a0a0a, #1a1a2e), frosted glass effects
- **Typography:** Clean, modern
- **Avoid:** claude-design (previous attempts looked horrible)

### Verification:
- [ ] Design system defined (colors, typography, spacing)
- [ ] Mockups generated and approved
- [ ] Production HTML created
- [ ] Responsive design considered

## Phase 4: SPECIFY

**Goal:** Create precise, testable requirements.

### When to use:
- Before implementation starts
- When requirements are complex
- When you need verifiable success criteria

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| gsd-core | `/gsd-spec-phase` | Clarify WHAT via Socratic questioning |
| gsd-core | `/gsd-discuss-phase` | Gather phase context |
| karpathy-guidelines | (always on) | Goal-driven execution |

### Workflow:
1. **Coder:** Brief OpenCode to run `/gsd-spec-phase` for the current phase
2. **OpenCode:** Runs Socratic questioning, edge coverage probe
3. **OpenCode:** Produces SPEC.md with acceptance criteria
4. **Coder:** Verify spec is testable (karpathy principle #4)
5. **Coder:** If spec is vague, send back for clarification

### Verification:
- [ ] SPEC.md exists with clear acceptance criteria
- [ ] Edge cases identified and covered
- [ ] Success criteria are verifiable (not "make it work")
- [ ] Prohibitions (must-NOT constraints) documented

## Phase 5: IMPLEMENT

**Goal:** Write the actual code.

### When to use:
- After spec is approved
- The main building phase

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| gsd-core | `/gsd-plan-phase` | Research, plan, verify a phase |
| gsd-core | `/gsd-execute-phase` | Execute a phase with subagents |
| gsd-core | `/gsd-quick` | Ad-hoc tasks with GSD guarantees |
| karpathy-guidelines | (always on) | Simplicity, surgical changes |

### Workflow:
1. **Coder:** Brief OpenCode to run `/gsd-execute-phase` with the SPEC.md
2. **OpenCode:** Implements the spec, spawning subagents for heavy work
3. **Coder:** Read the files OpenCode claims to have written
4. **Coder:** Run syntax checks (node --check, python3 -m py_compile)
5. **Coder:** Verify simplicity (karpathy principle #2)
6. **Coder:** If overcomplicated, send back with "simplify this"

### Verification:
- [ ] All files OpenCode claims to write actually exist
- [ ] Syntax checks pass
- [ ] Code is simple (not overcomplicated)
- [ ] Changes are surgical (only what was asked)
- [ ] No dead code or unused imports

## Phase 6: VERIFY

**Goal:** Ensure the code works correctly and is production-ready.

### When to use:
- After implementation is complete
- BEFORE delivering to main agent
- **MANDATORY for any GUI work**

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| playwright | (always on) | **MANDATORY for GUI work** |
| gsd-core | `/gsd-verify-phase` | Verify phase meets acceptance criteria |
| gsd-core | `/gsd-eval` | Evaluate code quality |
| gstack | `/qa` | QA testing with auto-fixes |
| gstack | `/qa-only` | QA reporting without code changes |

### Workflow:
1. **Coder:** Start the server (if applicable)
2. **Coder:** Create and run Playwright verification script
3. **Coder:** Take screenshots at multiple viewports
4. **Coder:** Verify no console errors, all elements present, live data rendering
5. **Coder:** If GUI work: brief OpenCode to run `/qa` for additional testing
6. **Coder:** If verification fails: send back to OpenCode with specific fixes

### Verification:
- [ ] Playwright screenshots show correct rendering
- [ ] No console errors
- [ ] All expected elements visible
- [ ] Live data rendering (not mock data)
- [ ] Responsive at mobile/tablet/desktop
- [ ] Forms and buttons functional

## Phase 7: REVIEW

**Goal:** Ensure code quality is high.

### When to use:
- After verification passes
- Before shipping

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| gstack | `/review` | Staff engineer code review |
| gsd-core | `/gsd-code-review` | Code review with auto-fix |
| gstack | `/investigate` | Root-cause debugging (if issues found) |
| gsd-core | `/gsd-debug` | Systematic debugging |

### Workflow:
1. **Coder:** Brief OpenCode to run `/review` on the changes
2. **OpenCode:** Finds bugs, auto-fixes obvious ones, flags completeness gaps
3. **Coder:** Review the fixes for correctness
4. **Coder:** If issues found, send back to OpenCode with specific fixes
5. **Coder:** If debugging needed, brief OpenCode to run `/investigate`

### Verification:
- [ ] Code review completed
- [ ] All issues addressed
- [ ] No drive-by refactoring (karpathy principle #3)
- [ ] Code matches existing style

## Phase 8: SHIP

**Goal:** Deploy and deliver.

### When to use:
- After review passes
- When code is production-ready

### Skills to use:
| Skill | Command | When |
|-------|---------|------|
| gstack | `/ship` | Release management, PR creation |
| gstack | `/land-and-deploy` | Deployment automation |
| gsd-core | `/gsd-ship` | Ship a phase |

### Workflow:
1. **Coder:** Brief OpenCode to run `/ship` with the changes
2. **OpenCode:** Creates PR, runs checks, prepares deployment
3. **Coder:** Verify the PR is clean (only intended changes)
4. **Coder:** Deploy if applicable
5. **Coder:** Deliver to main agent with summary

### Verification:
- [ ] PR created with clean diff
- [ ] Only intended changes in the diff
- [ ] All checks pass
- [ ] Deployment successful (if applicable)

## Always-On Principles

These principles apply to EVERY phase:

### Karpathy Guidelines (always active)
1. **Think Before Coding** — State assumptions, surface tradeoffs
2. **Simplicity First** — Minimum code, no speculation
3. **Surgical Changes** — Touch only what you must
4. **Goal-Driven Execution** — Define success criteria, loop until verified

### Context7 (when needed)
- Use when you have library questions
- Use when you need to verify API signatures
- Use when you need current documentation

### Playwright (mandatory for GUI)
- Use after ANY GUI work
- Use before delivering to main agent
- Use to verify live data rendering

## Consultation with Main Agent

When you encounter a question requiring "taste" (what Josh would prefer):

### When to consult:
- Color palette or visual style choices
- Layout preferences (sidebar vs topnav, card vs list)
- Feature prioritization when scope is constrained
- Tone of voice for copy
- Animation/transition preferences
- Any decision where you'd normally ask "what do you think?"

### Handoff Template:
```
[CONSULTATION REQUEST]
Context: [what OpenCode is working on]
Question: [specific question requiring Josh's taste/preference]
Options considered: [list options]
Impact: [how this affects the deliverable]
```

### Process:
1. Coder identifies a decision requiring Josh's taste
2. Coder fills out the handoff template
3. Main Hermes agent consults memory, Honcho, Active Wiki
4. Main Hermes agent responds with recommendation and rationale
5. Coder proceeds with the recommendation

## Skill Quick Reference

| Phase | Primary Skill | Command | Secondary Skill |
|-------|---------------|---------|-----------------|
| Discover | gstack | `/office-hours` | context7 |
| Plan | gstack | `/plan-eng-review` | gsd-core |
| Design | gstack | `/design-consultation` | gsd-core |
| Specify | gsd-core | `/gsd-spec-phase` | karpathy |
| Implement | gsd-core | `/gsd-execute-phase` | karpathy |
| Verify | playwright | (script) | gstack `/qa` |
| Review | gstack | `/review` | gsd-core |
| Ship | gstack | `/ship` | gsd-core |

## File Locations

All skills are in the coder profile:
- `skills/gstack/SKILL.md` — Garry Tan's specialist skills
- `skills/gsd-core/SKILL.md` — GSD Core commands
- `skills/software-development/context7/SKILL.md` — Documentation lookup
- `skills/software-development/playwright/SKILL.md` — GUI verification
- `skills/software-development/karpathy-guidelines/SKILL.md` — Behavioral guidelines
- `skills/software-development/master-playbook/SKILL.md` — This file
