---
name: gstack
description: Use gstack when Coder needs specialist roles for product planning, design review, code review, QA, release management, or debugging. Garry Tan's Claude Code skill pack that turns a single AI into a virtual engineering team of 23+ specialists.
metadata:
  hermes:
    tags: [coding, design, review, qa, release, debugging, claude-code, specialist, workflow, planning]
---

# gstack — Garry Tan's Virtual Engineering Team

## What is gstack

gstack is an open-source skill pack by Garry Tan (CEO of Y Combinator) that transforms a single Claude Code session into a virtual engineering team. It provides 23+ specialist slash commands, each tuned for a distinct phase of software development — from founder-level product thinking to automated QA testing and one-command shipping.

Instead of one generic AI assistant, you get explicit cognitive gears: a CEO who rethinks the product, an eng manager who locks architecture, a designer who catches AI slop, a reviewer who finds production bugs, a QA lead with a real browser, a security officer who runs OWASP + STRIDE audits, and a release engineer who ships the PR.

All skills are Markdown prompts (human-readable), MIT licensed, and free. Works on Coder, Claude Code, Codex, Cursor, and 10+ other AI coding agents.

**Repository:** https://github.com/garrytan/gstack

## When to use gstack

Use gstack skills when Coder needs to:
- Plan or scope a new feature with strategic product thinking
- Review a plan from CEO, engineering, or design perspectives
- Generate or iterate on UI/UX designs
- Review code for production-killing bugs
- Debug issues with systematic root-cause analysis
- QA test in a real browser with auto-fixes
- Ship a release with PR creation and deployment
- Run security audits (OWASP + STRIDE)
- Generate documentation
- Run engineering retrospectives

**Default preference:** When a coding task matches any gstack specialist role, prefer that gstack skill over generic Coder prompts.

## All Specialist Skills

### Think Phase

#### /office-hours
- **Role:** YC Office Hours
- **When to invoke:** Starting any new feature, product idea, or significant change. Required first step for features > 2 hours.
- **What it does:** Six forcing questions that reframe your product before writing code. Pushes back on your framing, challenges premises, generates implementation alternatives with effort estimates. Writes a design doc that feeds into every downstream skill.
- **Key flags:** None

#### /plan-ceo-review
- **Role:** CEO / Founder
- **When to invoke:** After /office-hours, before implementation. When you need strategic product thinking or scope decisions.
- **What it does:** Rethinks the problem to find the 10-star product hiding inside the request. Four scope modes: Expansion, Selective Expansion, Hold Scope, Reduction. Reads the design doc from /office-hours.
- **Key flags:** None

### Plan Phase

#### /plan-eng-review
- **Role:** Eng Manager
- **When to invoke:** After /plan-ceo-review, before implementation. When architecture needs to be locked down.
- **What it does:** Locks in architecture, data flow, diagrams, edge cases, and test plan. Forces hidden assumptions into the open. ASCII diagrams for data flow, state machines, error paths.
- **Key flags:** None

#### /plan-design-review
- **Role:** Senior Designer
- **When to invoke:** When planning UI-heavy features. After /plan-ceo-review, alongside /plan-eng-review.
- **What it does:** Rates each design dimension 0-10, explains what a 10 looks like, then edits the plan to get there. Includes AI Slop detection. Interactive — one AskUserQuestion per design choice.
- **Key flags:** None

#### /autoplan
- **Role:** Review Pipeline
- **When to invoke:** When you want a fully reviewed plan in one command. Alternative to running /plan-ceo-review, /plan-design-review, and /plan-eng-review separately.
- **What it does:** Runs CEO → design → eng review automatically with encoded decision principles. Surfaces only taste decisions for human approval. Eng review always runs last so it reviews the final amended plan.
- **Key flags:** None

### Build Phase

#### /design-consultation
- **Role:** Design Partner
- **When to invoke:** Starting a new UI project or redesign. When you need a complete design system.
- **What it does:** Builds a complete design system from scratch. Researches the landscape, proposes creative risks, generates realistic product mockups. Writes DESIGN.md.
- **Key flags:** None

#### /design-shotgun
- **Role:** Design Explorer
- **When to invoke:** When exploring visual directions. After /design-consultation or when you have a vague design idea.
- **What it does:** Generates 4-6 AI mockup variants using GPT Image. Opens a comparison board in your browser for side-by-side review. Collects feedback and iterates. Taste memory learns what you like across rounds.
- **Key flags:** None

#### /design-html
- **Role:** Design Engineer
- **When to invoke:** After a mockup is approved (from /design-shotgun, /plan-design-review, or direct input).
- **What it does:** Turns a mockup into production-quality HTML/CSS. Uses Pretext for computed text layout — text reflows on resize, heights adjust to content. 30KB overhead, zero dependencies. Detects framework (React/Svelte/Vue). Smart API routing for landing page vs dashboard vs form.
- **Key flags:** None

#### /design-review
- **Role:** Designer Who Codes
- **When to invoke:** For live-site visual audits. After shipping frontend changes.
- **What it does:** Same audit as /plan-design-review but also fixes what it finds. Atomic commits, before/after screenshots. 80-item audit checklist.
- **Key flags:** None

### Review Phase

#### /review
- **Role:** Staff Engineer
- **When to invoke:** After implementation, before shipping. On any branch with changes.
- **What it does:** Finds bugs that pass CI but blow up in production. Auto-fixes the obvious ones. Flags completeness gaps. Advisory simplification lens flags over-built code — never blocks, never auto-applies.
- **Key flags:** None

#### /investigate
- **Role:** Debugger
- **When to invoke:** When a bug is reported but root cause is unknown. Before attempting any fix.
- **What it does:** Systematic root-cause debugging. Iron Law: no fixes without investigation. Traces data flow, tests hypotheses, stops after 3 failed fixes. Auto-freezes to the module being investigated.
- **Key flags:** None

#### /cso
- **Role:** Chief Security Officer
- **When to invoke:** Before shipping any user-facing feature. After code review passes.
- **What it does:** OWASP Top 10 + STRIDE threat model. Zero-noise: 17 false positive exclusions, 8/10+ confidence gate, independent finding verification. Each finding includes a concrete exploit scenario.
- **Key flags:** None

#### /codex
- **Role:** Second Opinion
- **When to invoke:** After /review, when you want cross-model verification. Before shipping critical code.
- **What it does:** Independent code review from OpenAI Codex CLI. Three modes: review (pass/fail gate), adversarial challenge, open consultation. Cross-model analysis when both /review and /codex have run.
- **Key flags:** `--mode review|challenge|consult`

### Test Phase

#### /qa
- **Role:** QA Lead
- **When to invoke:** After code is implemented and reviewed. On staging URLs.
- **What it does:** Tests app in real browser, finds bugs, fixes with atomic commits, re-verifies. Auto-generates regression tests for every fix.
- **Key flags:** Provide URL as argument (e.g., `/qa https://staging.myapp.com`)

#### /qa-only
- **Role:** QA Reporter
- **When to invoke:** Same as /qa but when you want a report without code changes.
- **What it does:** Same methodology as /qa but report only. Pure bug report without code changes.
- **Key flags:** Provide URL as argument

### Ship Phase

#### /ship
- **Role:** Release Engineer
- **When to invoke:** After review and QA pass. When you're ready to open a PR.
- **What it does:** Syncs main, runs tests, audits coverage, pushes, opens PR. Bootstraps test frameworks if none exist. Auto-invokes /document-release.
- **Key flags:** None

#### /land-and-deploy
- **Role:** Release Engineer
- **When to invoke:** After /ship and PR approval. When ready to deploy to production.
- **What it does:** Merges PR, waits for CI and deploy, verifies production health. One command from "approved" to "verified in production."
- **Key flags:** None

### Reflect Phase

#### /retro
- **Role:** Eng Manager
- **When to invoke:** End of sprint or project milestone. For team health and process improvement.
- **What it does:** Team-aware weekly retro. Per-person breakdowns, shipping streaks, test health trends, growth opportunities. `/retro global` spans all projects and AI tools (Claude Code, Codex, Gemini).
- **Key flags:** `global` (span all projects)

### Power Tools

#### /browse
- **Role:** QA Engineer
- **When to invoke:** Any time Coder needs web browsing. **Josh-specific: always use /browse instead of claude-in-chrome.**
- **What it does:** Real Chromium browser, real clicks, real screenshots. ~100ms per command after startup. Anti-bot stealth mode available via /open-gstack-browser.
- **Key flags:** None

#### /spec
- **Role:** Spec Author
- **When to invoke:** When you have vague intent that needs to become precise, executable instructions.
- **What it does:** Turns vague intent into a precise, executable spec in five phases (why, scope, technical with mandatory code-reading, draft, file). Codex quality gate before file (blocks below 7/10), fail-closed secret redaction, dedupe against existing issues. Archive to project corpus for team-corpus recall.
- **Key flags:** `--execute` (spawns implementation in fresh worktree)

#### /document-generate
- **Role:** Documentation Author
- **When to invoke:** When docs are missing or need to be created from scratch.
- **What it does:** Generates missing docs from scratch using the Diataxis framework. Researches the codebase first, then writes reference / how-to / tutorial / explanation docs that match the code. Invokable standalone or chained from /document-release.
- **Key flags:** None

#### /document-release
- **Role:** Technical Writer
- **When to invoke:** Auto-invoked by /ship, or manually after shipping features.
- **What it does:** Updates all project docs to match what shipped. Catches stale READMEs automatically. Builds a Diataxis coverage map (reference / how-to / tutorial / explanation) so gaps are visible in the PR body.
- **Key flags:** None

### Safety Modes

#### /careful
- **Role:** Safety Guardrails
- **When to invoke:** Say "be careful" or when about to run destructive operations.
- **What it does:** Warns before destructive commands (rm -rf, DROP TABLE, force-push). Override any MEDIUM warning; root/home recursive deletes and default-branch force-pushes are hard-denied.
- **Key flags:** None (activated by saying "be careful" or explicitly invoking)

#### /freeze
- **Role:** Edit Lock
- **When to invoke:** When debugging or making targeted changes. Prevents scope creep.
- **What it does:** Restricts file edits to one directory. Prevents accidental changes outside scope while debugging. /investigate auto-freezes to the module being investigated.
- **Key flags:** None

### Setup & Integration

#### /setup-deploy
- **Role:** Deploy Configurator
- **When to invoke:** One-time setup before first use of /land-and-deploy.
- **What it does:** Detects your platform, production URL, and deploy commands. Configures everything needed for deployment automation.
- **Key flags:** None

#### /setup-gbrain
- **Role:** GBrain Onboarding
- **When to invoke:** When setting up GBrain memory system for the first time.
- **What it does:** Gets you from zero to running GBrain in under 5 minutes. PGLite local, Supabase existing URL, or auto-provision a new Supabase project. MCP registration for Claude Code + per-repo trust triad (read-write/read-only/deny).
- **Key flags:** None

#### /sync-gbrain
- **Role:** Memory Sync
- **When to invoke:** After significant code changes or GBrain setup. Keep memory current.
- **What it does:** Re-indexes this repo's code into GBrain, refreshes the GBrain Search Guidance block in CLAUDE.md, auto-removes guidance when capability check fails.
- **Key flags:** `--incremental` (default), `--full`, `--dry-run`

## Workflow Patterns

### Full product (end-to-end feature)
```
/office-hours → /plan-ceo-review → /plan-eng-review → implement → /review → /ship
```
Use when building a new feature from scratch with significant scope.

### Quick fix
```
/review → fix → /qa
```
Use when fixing a bug or making a small change.

### Design-heavy
```
/design-consultation → /design-shotgun → /design-html → implement
```
Use when the primary work is UI/UX with minimal backend logic.

### Debugging
```
/investigate → fix → /qa-only
```
Use when the root cause of a bug is unknown.

### Security audit
```
/cso → fix findings → /review → /ship
```
Use before shipping user-facing features.

### Parallel sprints
Run multiple workflows simultaneously across different features, coordinating through the Review Readiness Dashboard.

## Josh-Specific Rules

1. **Use /browse instead of claude-in-chrome** for all web browsing tasks. /browse provides real Chromium with real clicks and screenshots.
2. **When working on the dashboard, prefer /design-consultation and /design-html** over claude-design. The Pretext-native HTML output from /design-html is production-quality and avoids the "AI slop" look.
3. **/office-hours is mandatory for any new feature > 2 hours of work.** Do not skip strategic product thinking.
4. **Dark-themed glassmorphism UI is the default aesthetic.** When /design-consultation or /design-html generates designs, specify dark theme with glassmorphism effects (frosted glass, subtle gradients, soft shadows).
5. **Always verify UI changes in a real browser, not just syntax checks.** Use /browse or /qa to confirm visual correctness.
6. **PII scrubbing required before any commit.** Ensure no personal data, API keys, or credentials are in the code.

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