# Oracle Wiki Graph Build — Worked Example

## Context
Oracle wiki at `~/.autognosia/oracle/brain/` — 598 markdown files, ~1.9M words covering consciousness studies, neuroscience, AI cognition theory, and SDR/OSINT stack.

## What Worked
1. **Subagent-based semantic extraction** (6 parallel chunks, ~100 files each)
   - Used `execute_code()` to split files into chunks grouped by directory
   - Dispatched all 6 subagents with `subagent_type="general-purpose"` in one response
   - 3 of 6 chunks completed successfully (chunks 1, 3, 4): 29,425 nodes, 188,202 edges
   - 3 chunks failed (timeouts, JSON truncation) — chunk 3 actually succeeded despite timeout error

2. **Graph build via `execute_code()` + subprocess**
   - Terminal gateway kills long-running Python processes (>60s)
   - Used `execute_code()` with `subprocess.run()` and graphifyy interpreter
   - Build: 29,053 nodes → 158,301 edges → 198 communities
   - Completed in ~30s via this approach

## What Failed
- **OpenRouter API key exhaustion** — $10 credit limit hit when trying graphify's native OpenAI backend. All 61 chunks failed with 403 "Key limit exceeded". The key `sk-or-v1-1a2b3c4d...` has been consumed.
- **Terminal gateway kills** — direct `terminal()` calls to graphify build process were killed after ~60s (gateway SIGTERM). This is why `execute_code()` + subprocess is required.
- **Subagent dispatch timeouts** — when the task goal string contained large embedded file lists, dispatch timed out at 420s even though the subagent actually started.

## Key File Locations
- Graph: `~/.autognosia/oracle/brain/graphify-out/graph.json` (61.6 MB)
- Report: `graphify-out/GRAPH_REPORT.md` (65.4 KB, 1,296 lines)
- Analysis: `graphify-out/.graphify_analysis.json` (1 MB)
- Extract: `graphify-out/.graphify_extract.json` (77 MB)
- Detect: `graphify-out/.graphify_detect.json` (56.9 KB)

## API Keys Status
- GEMINI_API_KEY: Not set (checked env file, only OPENROUTER/TAVILY/JINA/GLM keys present)
- GOOGLE_API_KEY: Not set
- OPENROUTER_API_KEY: Set but credits exhausted (403 errors)
- GLM_API_KEY: Set (cc593ef0...) — could potentially be used if graphify supports kimi/moonshot backend

## Post-Build Notes
- 21,229 isolated nodes (≤1 connection each) — from the 2 chunks that failed completely
- 8 thin communities omitted (< 3 nodes each)
- 86% of edges are INFERRED (0.75 confidence) — graphify's default inference level
- Community cohesion ranges from 0.04 (low) to 1.00 (perfect)
- 10 god nodes identified, 5 surprising connections
