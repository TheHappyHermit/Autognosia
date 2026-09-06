---
name: gsd-core
description: Use gsd-core when Coder needs spec-driven development, phase-based project management, codebase mapping, or quality gates. Lightweight meta-prompting, context engineering, and spec-driven workflow engine for AI coding agents.
metadata:
  hermes:
    tags: [coding, planning, spec-driven, workflow, quality-gates, phase-management, project-init, codebase-mapping, context-engineering]
---

# gsd-core — Git. Ship. Done.

## What is gsd-core

gsd-core is an open-source, MIT-licensed toolkit for steering coding agents with structured discipline. It splits work into five phases (discuss, plan, execute, verify, ship) and delegates heavy lifting to subagents that each start with a clean context.

It's a meta-prompting, context-engineering, and spec-driven development system that routes whichever model provider you configure. Instead of one generic assistant trying to do everything, gsd-core provides a repeatable loop with durable markdown artifacts and quality gates at every boundary.

**Key principles:**
- **Spec before code** — clarify WHAT before discussing HOW
- **Phase isolation** — each phase has clear inputs, outputs, and exit criteria
- **Durable artifacts** — every phase produces markdown that persists across sessions
- **Quality gates** — verification is built into the workflow, not bolted on
- **Subagent delegation** — heavy work spawns in clean contexts to avoid pollution

**Repository:** https://github.com/open-gsd/gsd-core

## When to use gsd-core

Use gsd-core when Coder needs to:
- Initialize a new project with deep context gathering
- Onboard an existing codebase into a structured workflow
- Break work into phases with clear acceptance criteria
- Run spec-driven development with Socratic questioning
- Map an existing codebase for understanding
- Execute a phase with wave-based parallelization
- Verify work meets acceptance criteria before shipping
- Manage multiple workstreams or workspaces
- Run ad-hoc tasks with GSD quality guarantees

**Default preference:** When a coding task involves project initialization, phase management, or spec-driven development, prefer gsd-core over generic Coder prompts.

## Namespace Routers

Six namespace routers serve as first-stage entry points. They keep the skill-listing token cost low (~120 tokens for 6 routers vs ~2,150 for a flat listing) while every concrete sub-skill remains directly invocable.

| Router | Routes to |
|---|---|
| `/gsd-workflow` | Phase pipeline — discuss / plan / execute / verify / phase / progress / next |
| `/gsd-project` | Project lifecycle — milestones, audits, summary |
| `/gsd-quality` | Quality gates — code review, debug, audit, security, eval, ui |
| `/gsd-context` | Codebase intelligence — map, graphify, docs, learnings |
| `/gsd-manage` | Management — config, workspace, workstreams, thread, update, ship, inbox |
| `/gsd-ideate` | Exploration & capture — explore, sketch, spike, spec, capture |

## Core Commands

### Project Initialization

#### /gsd-new-project
- **When to invoke:** Starting a brand new project from scratch. **Josh-specific: use for any new repo/service.**
- **What it does:** Initializes a new project with deep context gathering. Produces PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, config.json, research/ directory, and CLAUDE.md.
- **Key flags:** `--auto @file.md` (auto-extract from document, skip interactive questions)

#### /gsd-onboard
- **When to invoke:** Onboarding an existing codebase into GSD. **Josh-specific: use for onboarding existing codebases.**
- **What it does:** Guides an existing codebase through first-time GSD onboarding. Checks repo state, routes through codebase mapping, optional docs ingest, project initialization, and creates an onboarding summary.
- **Key flags:** `--fast` (prefer lightweight mapping first), `--text` (plain-text gates instead of TUI)

#### /gsd-workspace
- **When to invoke:** Managing isolated workspaces for multi-repo or feature isolation.
- **What it does:** Creates, lists, or removes isolated workspace environments with repo copies and independent .planning/ directories.
- **Key flags:** `--new`, `--list`, `--remove <name>`, `--name <name>`, `--repos repo1,repo2`, `--strategy worktree|clone`, `--branch <name>`, `--auto`

### Phase Loop Commands

#### /gsd-spec-phase
- **When to invoke:** Before any implementation work. Clarifies WHAT a phase delivers.
- **What it does:** Clarifies WHAT through Socratic questioning with quantitative ambiguity scoring, then probes for omitted edges. Runs edge-completeness probe (8-category taxonomy: boundary, adjacency, empty, encoding, ordering, precision, idempotency, concurrency) and prohibition-completeness probe. Produces SPEC.md.
- **Key flags:** `--auto` (skip interactive questions, never auto-dismisses edges), `--text` (plain-text menus for remote sessions)
- **Position in workflow:** spec-phase → discuss-phase → plan-phase → execute-phase → verify

#### /gsd-discuss-phase
- **When to invoke:** After spec-phase, before plan-phase. When you need to gather phase context.
- **What it does:** Gathers phase context through adaptive questioning before planning. Produces CONTEXT.md and DISCUSSION-LOG.md.
- **Key flags:** `--all` (discuss all gray areas), `--auto` (auto-select defaults), `--batch` (group questions), `--analyze` (trade-off analysis), `--power` (bulk answers from file), `--assumptions` (surface implementation assumptions)

#### /gsd-ui-phase
- **When to invoke:** When a phase has frontend/UI work.
- **What it does:** Generates UI design contract for frontend phases. Produces {phase}-UI-SPEC.md.
- **Key flags:** None (takes phase number as argument)

#### /gsd-plan-phase
- **When to invoke:** After discuss-phase. Research, plan, and verify a phase.
- **What it does:** Researches the domain, plans the implementation, and verifies the plan. Runs package legitimacy gate on external packages. Produces RESEARCH.md, PLAN.md, and VALIDATION.md.
- **Key flags:** `--auto`, `--research` (force re-research), `--skip-research`, `--research-phase <N>` (research-only mode), `--view` (print existing RESEARCH.md), `--gaps` (gap closure mode), `--skip-verify`, `--prd <file>`, `--ingest <path-or-glob>`, `--reviews` (replan with review feedback), `--bounce` (external plan bounce validation), `--mvp` (vertical-slice mode), `--no-tracer` (opt out of tracer-first), `--tdd` (TDD mode), `--granularity <coarse|standard|fine>`

#### /gsd-execute-phase
- **When to invoke:** After plan-phase. Execute all plans in a phase.
- **What it does:** Executes all plans in a phase with wave-based parallelization. Spawns subagents for each plan. Produces per-plan SUMMARY.md, git commits, and VERIFICATION.md.
- **Key flags:** `--wave N` (execute only Wave N), `--cross-ai` (delegate to external AI CLI), `--no-cross-ai` (force local execution)

#### /gsd-verify-phase
- **When to invoke:** After execute-phase. Verify a phase meets acceptance criteria.
- **What it does:** Verifies a phase meets acceptance criteria. Runs honest verifier with backstop abstention for non-inferable checks. Produces VERIFICATION.md.
- **Key flags:** None (takes phase number as argument)

### Navigation & Status

#### /gsd-progress
- **When to invoke:** Anytime you need to know "where am I? What's next?"
- **What it does:** Shows status, next steps, and can automatically advance to the next logical workflow step. Reads project state and determines the appropriate action.
- **Key flags:** `--next` (auto-advance), `--next --auto` (chain steps until completion), `--next --converge` (with plan-review convergence), `--do "task description"` (dispatch freeform intent), `--forensic` (integrity audit)

#### /gsd-next
- **When to invoke:** When you want an interactive smart-entry menu before dispatch.
- **What it does:** State-aware smart-entry launcher. Reads STATE.md, ROADMAP.md, verification artifacts, and git status to classify the current situation and dispatch exactly one existing GSD command.
- **Key flags:** None

#### /gsd-stats
- **When to invoke:** When you need project statistics.
- **What it does:** Shows project statistics including phase completion, token usage, and milestone progress.
- **Key flags:** None

### Quality & Security

#### /gsd-code-review
- **When to invoke:** After implementation, before shipping. On any branch with changes.
- **What it does:** Reviews code for quality issues, bugs, and anti-patterns.
- **Key flags:** `--fix` (auto-fix issues found)

#### /gsd-debug
- **When to invoke:** When a bug is reported but root cause is unknown.
- **What it does:** Systematic debugging with root-cause analysis. Traces data flow and tests hypotheses.
- **Key flags:** None

#### /gsd-secure-phase
- **When to invoke:** Before shipping any user-facing feature. After code review passes.
- **What it does:** Security audit phase. Runs OWASP + STRIDE threat modeling.
- **Key flags:** None

#### /gsd-eval
- **When to invoke:** When you need to evaluate code quality.
- **What it does:** Evaluates code quality against GSD standards.
- **Key flags:** None

#### /gsd-ui-review
- **When to invoke:** After frontend implementation. Retroactive visual audit.
- **What it does:** Retroactive 6-pillar visual audit of implemented frontend. Produces UI-REVIEW.md with screenshots.
- **Key flags:** None (takes phase number as argument)

### Codebase Intelligence

#### /gsd-map-codebase
- **When to invoke:** When onboarding an existing codebase or when you need to understand unfamiliar code.
- **What it does:** Maps existing codebase for understanding. Produces codebase map in .planning/codebase/.
- **Key flags:** `--fast` (lightweight mapping)

#### /gsd-ingest-docs
- **When to invoke:** When you have existing ADRs, PRDs, SPECs, or docs that should inform the project.
- **What it does:** Bootstraps or merges a .planning/ setup from existing docs. Runs parallel classification plus synthesis with precedence rules and cycle detection.
- **Key flags:** `path` (target directory), `--mode new|merge`, `--manifest <file>`, `--resolve auto`

#### /gsd-import
- **When to invoke:** When you have an external plan file to bring into GSD.
- **What it does:** Ingests an external plan file with conflict detection against PROJECT.md decisions before writing anything.
- **Key flags:** `--from <filepath>`, `--from-gsd2` (reverse-migrate from GSD-2), `--path <dir>`

### Exploration & Capture

#### /gsd-explore
- **When to invoke:** When you have an idea that needs probing before becoming a phase.
- **What it does:** Socratic ideation session — guides an idea through probing questions, optionally spawns research, then routes output to the right GSD artifact.
- **Key flags:** `topic` (optional topic to explore)

#### /gsd-sketch
- **When to invoke:** When you need to sketch out ideas quickly.
- **What it does:** Sketches ideas through structured prompts.
- **Key flags:** None

#### /gsd-spike
- **When to invoke:** When you need to answer a technical question before committing to an approach.
- **What it does:** Spikes on a technical question — time-boxed research to answer a specific question.
- **Key flags:** None

#### /gsd-spec
- **When to invoke:** When you need to create a specification.
- **What it does:** Creates a specification document through structured prompts.
- **Key flags:** None

#### /gsd-capture
- **When to invoke:** When you need to capture context for later use.
- **What it does:** Captures context from the current session into durable artifacts.
- **Key flags:** None

### Management

#### /gsd-config
- **When to invoke:** When you need to manage GSD configuration.
- **What it does:** Manages GSD configuration settings.
- **Key flags:** None

#### /gsd-ship
- **When to invoke:** After phase verification passes. When you're ready to open a PR.
- **What it does:** Creates PR from completed phase work with auto-generated body. Runs ship gates (security, broken-windows ledger).
- **Key flags:** `--draft` (create as draft PR)

#### /gsd-thread
- **When to invoke:** When you need to manage threads.
- **What it does:** Manages threads for parallel work streams.
- **Key flags:** None

#### /gsd-update
- **When to invoke:** When you need to update GSD.
- **What it does:** Updates GSD to the latest version.
- **Key flags:** None

#### /gsd-inbox
- **When to invoke:** When you need to manage inbox items.
- **What it does:** Manages inbox items and notifications.
- **Key flags:** None

#### /gsd-workstreams
- **When to invoke:** When you need to manage workstreams.
- **What it does:** Manages workstreams for parallel development tracks.
- **Key flags:** None

### Quick Tasks

#### /gsd-quick
- **When to invoke:** For ad-hoc tasks that need GSD quality guarantees.
- **What it does:** Executes ad-hoc tasks with GSD guarantees. Composable quality pipeline flags.
- **Key flags:** `--full` (complete quality pipeline), `--validate` (plan-checking + verification only), `--discuss` (lightweight discussion), `--research` (spawn researcher), `list`, `status <slug>`, `resume <slug>`

#### /gsd-autonomous
- **When to invoke:** When you want to run all remaining phases autonomously.
- **What it does:** Runs all remaining phases autonomously. Chains through the full phase loop without human intervention.
- **Key flags:** `--from N` (start from phase), `--to N` (stop after phase), `--only N` (restrict to phase N), `--interactive` (lean context with user input), `--converge` (plan-review convergence), `--cross-ai` (alias for converge)

## Phase Loop

The core GSD workflow is a five-phase loop:

```
spec → discuss → plan → execute → verify
```

1. **Spec** — Clarify WHAT through Socratic questioning. Edge coverage probe. Prohibition coverage probe. Produce SPEC.md.
2. **Discuss** — Gather phase context through adaptive questioning. Produce CONTEXT.md.
3. **Plan** — Research the domain, plan the implementation, verify the plan. Produce RESEARCH.md, PLAN.md, VALIDATION.md.
4. **Execute** — Execute plans with wave-based parallelization. Produce SUMMARY.md, git commits.
5. **Verify** — Verify phase meets acceptance criteria. Produce VERIFICATION.md.

After verification passes, ship the phase and move to the next one.

## Josh-Specific Rules

1. **Use /gsd-new-project for any new repo/service.** Do not skip project initialization.
2. **Use /gsd-onboard for onboarding existing codebases.** The codebase map is essential for understanding.
3. **Dark-themed glassmorphism UI is default for any UI work.** When /gsd-ui-phase generates design contracts, specify dark theme with glassmorphism effects.
4. **Always verify UI changes in browser.** Use /gsd-ui-review or browser verification, not just syntax checks.
5. **PII scrubbing required before any commit.** Ensure no personal data, API keys, or credentials are in the code.
6. **Prefer deterministic workflows over agents.** GSD's phase loop provides structure — use it rather than ad-hoc prompting.

## Consultation Protocol

When Coder encounters a question requiring "taste" (what Josh would prefer), it should ask the main Hermes agent via structured handoff rather than guessing.

### Handoff Template
```
[CONSULTATION REQUEST]
Context: [what Coder is working on]
Question: [specific question requiring Josh's taste/preference]
Options considered: [list options]
Impact: [how this affects the deliverable]
```

### Process
1. Coder identifies a decision requiring Josh's taste/preference
2. Coder fills out the handoff template and sends to main Hermes agent
3. Main Hermes agent consults memory, Honcho, Active Wiki for relevant preferences
4. Main Hermes agent responds with a recommendation and rationale
5. Coder proceeds with the recommendation (or escalates to Josh if still unclear)

### Examples of taste decisions
- Color palette or visual style choices
- Layout preferences (sidebar vs topnav, card vs list)
- Feature prioritization when scope is constrained
- Tone of voice for copy
- Animation/transition preferences