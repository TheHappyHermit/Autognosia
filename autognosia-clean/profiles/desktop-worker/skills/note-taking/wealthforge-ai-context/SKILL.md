---
name: wealthforge-ai-context
description: Context about user's WealthForge AI project and preferences
category: note-taking
---

# WealthForge AI Project Context

## Project Overview
User is building WealthForge AI, an AI-forward financial planning software suite starting with a portfolio rebalancing modeling engine. Plans to expand to full Bloomberg-like terminal and quant analysis website.

## Technical Preferences
- **Primary Language**: Python for quantitative work (with shell/C++ when necessary)
- **Avoids**: 'Typed scripts' (TypeScript)
- **Architecture Vision**: Hybrid architecture with code-driven components, workflows, and minimal AI agents (2-3 tools per agent)
- **Environment**: Ubuntu Linux, comfortable with CLI tools
- **Work Style**: Methodical work with verification at each step
- **Communication**: Prefers direct, actionable answers without excessive scrolling or repeated details

## Communication Preference — Plain English Only

**⚠️ IMPORTANT: This user has ZERO financial industry background. They have never worked in wealth management. They don't know what companies like BlackRock, Envestnet, or eMoney do. They don't understand industry acronyms (UMH, SMA, DI, UMA, RPM, TAMP, etc.).**

Every piece of research, planning document, or explanation MUST:
- Assume the reader has never seen this industry before
- Explain every concept from scratch with real-world examples
- Answer "what does this actually do for a regular person?" not "what market trend is this?"
- Be short enough to read in 10 seconds — not a consulting report

**Buildable specificity rule:** Every finding must include "How to code it" instructions for a programmer with zero finance knowledge. What data goes in? What calculation runs? What comes out?

**Bad (old format):** "The Cerulli/Parametric 'Customized at Scale' framework reveals 80% of affluent investors want account customization, with tax optimization surpassing portfolio construction as the #1 platform priority. WealthForge's planning engine addresses the UMH-era automation gap."

**Good (new format):** "Sarah has $300k in a 401(k), $100k in a Roth IRA, and $50k in a brokerage account. She needs $4k/month in retirement. Pick which account to withdraw from first to minimize taxes. The calculation: simulate taxes for each possible withdrawal order over 30 years, pick the cheapest. Most apps don't do this."

## Web Search Backend (Updated 2026-05-15)
- **Primary (search):** DuckDuckGo (ddgs) — free, unlimited
- **Extract (content pulling):** Tavily — only for fetching content from specific URLs (rare)
- **Spare:** Brave Search API set in .env but not actively used
- Config: `web.search_backend: ddgs` in config.yaml

## Dashboard (Updated 2026-05-15)
- Hermes dashboard running on **http://0.0.0.0:9119** (LAN accessible)
- Systemd user service (`hermes-dashboard.service`) — auto-starts on boot
- Access from LAN at http://10.1.1.37:9119

## Newsletter Pipeline (Fixed 2026-05-14)
- FreshRSS is at **10.1.1.10** (local server, NOT Oracle 161.153.112.27)
- Script uses IP direct with `Host: freshrss.wineandgecko.com` header
- Summarization uses `openrouter/owl-alpha` (free model, replaced `openai/gpt-4o-mini` which hit $10 limit)
- Morning cron: 0 6 * * * (job_id eebf16fd600a)
- Evening cron: 0 21 * * * (job_id 2fdcb131de85)
- See `references/newsletter-pipeline-state.md` under `newsletter-builder-troubleshooting` skill

## Ongoing Research Engine (Updated 2026-05-15 20:20)

### Track 1: Hermes-Vault Research (Competitive/Regulatory/Product)
- Cron job every 15-30 min doing deep research on WealthForge competitive/regulatory/product topics
- Knowledge base at `~/Documents/Hermes-Vault/wealthforge-roadmap/`
- Files: AGENDA.md (state tracker), RESEARCH.md (accumulated findings)
- AGENDA.md uses **pipe prefix format** — always read 5 lines around target before patching to determine correct prefix
- RESEARCH.md has grown beyond safe `write_file` size — use Python append or shell heredoc

### Track 2: Codebase-Local Research (Implementation-Ready Topics)
- **NEW (2026-05-15):** Second research track inside the codebase itself at `knowledge_base/research_outcomes/`
- Path: `/home/josh434/Projects/wealthforge-ai-local/knowledge_base/research_outcomes/`
- Produces 12-section institutional-grade research files with direct codebase references (exact module names, function signatures, database schemas from wag-engine/backend/frontend)
- Uses the `wealthforge-research-format` skill's 12-section template
- AGENDA.md and RESEARCH.md created from scratch at this path (they didn't exist before)
- **First completion (2026-05-15 20:20):** FIX-04 Monte Carlo Multiple Return Distributions — replaced 62-line file (old version) with 791-line/48KB comprehensive revision. All 12 sections covered. Key findings: wag-engine Monte Carlo only uses GBM/log-normal (`Normal` from `rand_distr`), no Student-t/bootstrap/regime-switching built, Kitces/Tharp found 6.5% of MC scenarios worse than worst-case history, no competitor offers multi-distribution comparison.
- **Algorithm reference — simultaneous optimization:** `references/simultaneous-optimization-algorithm.md` under this skill documents the four-lever retirement optimization problem, seven existing-tool gaps, three algorithmic schools, six active constraints, and recommended hybrid architecture for WealthForge's planning engine. Load when researching planning engine algorithm design.
- **OBBBA senior deduction reference:** `references/obbba-senior-deduction.md` under this skill documents the complete OBBBA senior deduction mechanics, phaseout formula, three-way interaction with SS torpedo + IRMAA, the "Senior Deduction Trap" (hidden 1.3pp marginal cost), competitive landscape (no major tool models the phaseout as a constraint), and 5 potential components to build. Load when researching Roth conversion optimization, IRMAA planning, or tax-efficient retirement planning.
- **RESEARCH.md recovery lesson (2026-05-15):** File was truncated from 288 to 255 lines when `write_file` was called after a partial `read_file`. Recovered by reconstructing full content from conversation context. After writing, verify with `wc -c` — if size barely changed, write truncated.
- **RESEARCH.md recovery lesson (2026-05-15 18:30):** File was truncated again (583 to 227 lines) when `write_file` was called after reading with offset/limit. Recovered by reconstructing full content from conversation context (the read_file outputs from earlier in the session were still visible). Key lesson: the write_file warning is NOT a block — the write executes and destroys data. Always use Python append (`open(file, 'a')`) or shell heredoc (`cat >>`) for RESEARCH.md. If write_file is the only option, read the FULL file first (no offset/limit) and include ALL content in the write.
- **AGENDA.md patch lesson (2026-05-15):** When inserting items with double quotes (e.g., "crowding out"), patch's string serialization may auto-escape quotes to `"` which don't match the file's plain `"` characters. Fix: read the exact region from the file, then supply old_string/new_string with plain double quotes (not escaped).
- **AGENDA.md patch lesson (2026-05-15 18:30):** When AGENDA.md has accumulated `||` pipe prefix artifacts from prior botched writes, the `patch` tool's fuzzy matching may still work because it ignores whitespace/formatting differences. However, verify the patched region immediately with `read_file` — if the patch introduced extra `|` characters or changed the prefix format, fix with a follow-up patch. The `||` prefix pattern is common in the Strategic Lessons and Operations sections of the WealthForge AGENDA.md.
- **Key alternatives architecture finding (2026-05-16):** WealthForge's `alternatives_family_office_workspace.py` (2,349 lines) defines 13 dedicated tools for private assets/family office workflows: private asset registry, commitment ledger, capital calls/distributions, NAV updates, K-1 routing, side-letter extraction, diligence archive, capital-call cash forecast, liquidity/concentration monitor, **entity ownership graph (LIVE — already deployed)**, private investment IRR/multiples ledger, PE/VC waterfall review, and GP/LP statement packet builder. 11 of 13 are "source-ready" (data model + workflow defined, automated ingestion not yet built). The entity ownership graph is a differentiated capability that competitors (Auria) charge premium for. The critical gap vs. incumbents is AI-powered document ingestion from fund portals and email.
- **Key Bernstein research finding (2026-05-16):** William Bernstein's "Retirement Calculator from Hell" 5-part series is now fully researched and documented in RESEARCH.md. Key WealthForge gaps: 80% ceiling warning system (no competitor has this), LMP builder (native safe floor + risk portfolio architecture), SOR failure distribution heatmap, hedonic adjustment layer, demographic-adjusted CMA. 5 widget designs (WB-1 through WB-5) with complete build specs. Bernstein's LMP framework (25x residual expenses in safe assets) is the most actionable feature gap. The 80% ceiling concept is a unique differentiator — no platform warns about Monte Carlo probability inflation. See `references/bernstein-retirement-data.md` under `wealthforge-research-format` skill for quick-reference data.
- **Key rebalancing architecture finding (2026-05-16 05:15):** WealthForge has 12+ rebalancing agents/services already built but lacks surfaced mode taxonomy, sleeve-level trading, tactical swaps, continuous monitoring, and workflow automation layer. See group_a_rebalancing/ for agent inventory.
- **Key tax planning finding (2026-05-16 05:30):** Altruist Hazel AI Tax Planning triggered 5-10% wealth management stock sell-off. Kitces analysis reveals sell-off was about Altruist's custodial threat (not AI replacing advisors). Tax planning transitioning from differentiator to baseline expectation. Hazel pricing $50-125/seat is an AI pricing benchmark. Altruist Personalized Indexing at $2K minimum (vs. Schwab $100K). Recommended: partner with Holistiplan/Hazel/april for tax analysis, own execution layer (UMH, cross-account optimization).
- **Key UMH finding (2026-05-16 05:15):** Datos Insights "18-month mandate" — UMH transitioning from differentiator to baseline requirement by late 2027. WealthForge has ~40% of UMH stack (HouseholdRebalancer + AssetLocationOptimizer + tax_sensitive_overlay). Biggest gap: household-level compliance monitoring (architectural challenge per Datos Insights). Recommended: overlay model path (6-12 months) vs. full-stack (12-24 months, $2-3M).
- **Insurance illustration data exchange landscape:** `references/illustration-data-exchange-landscape.md` documents the carrier quoting/illustration platform ecosystem (iPipeline LifePipe, WinFlex/Zinnia, Proformex, NIC), industry data standards (ACORD OLifE, LIMRA LDEx, NAIC Reg #582), 12 carrier API formats, and the canonical data model for illustration ingestion (CarrierIllustration, IllustrationProjection, IllustrationAssumptions, IllustrationComparison). Load when researching insurance, survivorship life, or in-force policy monitoring topics.

## GitHub Policy
- Do NOT push to GitHub unless the user explicitly says so
- When cloning repos for local work, rename `origin` → `origin-upstream` to prevent accidental pushes

## Current Systems
- **Memory System**: Honcho (primary) running locally at http://127.0.0.1:8000, workspace josh-hermes, mode hybrid, global session
- **Legacy Preference**: User prefers custom SQLite-based memory enhancement system (~/.hermes/memory_enhancement/memories.db) over Honcho plugin due to zero-dependency, offline-capable, private nature
- **Browser**: Camofox as primary backend with Chromium fallback (managed_persistence: true in ~/.hermes/config.yaml)
- **Obsidian Vault**: Dedicated vault at ~/Documents/Hermes-Vault with symlinks to ~/.hermes/ config, SOUL.md, memory_enhancement (SQLite), and skills (must remain isolated from OpenClaw vault)

## Automation & Integrations
- **Newsletter Pipeline**: Script at ~/.hermes/scripts/newsletter_builder.py (cron 6AM/9PM Telegram delivery)
- **RSS**: FreshRSS at freshrss.wineandgecko.com (josh434, 432 subs)
- **n8n MCP**: https://n8n.wineandgecko.com/mcp-server/http (Bearer token, tools prefixed 'mcp_n8n_mcp_')
- **Jina API Key**: Used as LAST RESORT only (~10% of sites, mainly investing.com Cloudflare)
- **Free Extraction**: Handles 80% of feed

## OpenClaw Deployment
- User recently moved Paperclip installation to bare metal Ubuntu due to Docker restrictions
- Open to giving SSH access to Oracle cloud deployment when company is ready for research/improvement phase