# ReMe (2025) Research Summary

## What ReMe (2025) Is

**ReMe = "Remember Me, Refine Me: A Dynamic Procedural Memory Framework for Experience-Driven Agent Evolution"**

- **Paper**: arXiv:2512.10696 (December 2025)
- **Venue**: Accepted at ACL 2026 Findings (not ICLR)
- **Authors**: Zouying Cao, Jiaji Deng, Li Yu, Weikang Zhou, et al. (Agentscope/AI2)
- **Code**: https://github.com/agentscope-ai/ReMe
- **Framework**: Dynamic procedural memory with three mechanisms:
  1. Multi-faceted distillation (success patterns, failure analysis, comparative insights)
  2. Context-adaptive reuse (scenario-aware indexing + adaptive rewriting)
  3. Utility-based refinement (selective addition of validated memories, utility-based pruning)
- **Key finding**: Memory-scaling effect — Qwen3-8B + ReMe outperforms memoryless Qwen3-14B (8.83% Avg@4 gain, 7.29% Pass@4 gain)

## The Contradiction: Citation Mismatches Across Dual-Memory Reports

The "4 potential contradictions" are **citation mismatches**, not factual contradictions. Reports make consistent claims about ReMe's mechanisms and results, but cite different venues/years:

| Report | Citation | Correct? |
|--------|----------|----------|
| `frontier-research-ontology-2026-09-01-deep-update.md` | "ReMe (Remember Me, Refine Me, arXiv 2512)" / Source [15]: arXiv 2512.10696 | ✅ Correct |
| `research_findings.md` | "ReMe (2025)" / Table: 2025, arXiv | ✅ Correct |
| `frontier-research-ontology-round58-2026-09-06.md` | "Remember Me, Refine Me — A Dynamic Procedural Memory Framework (ACL 2026 Findings)" | ✅ Correct |
| `frontier-research-ontology-2026-09-07-round66.md` | **"ReMe: Procedural Memory for LLM Agents (ICLR 2026)"** / Source [22]: ICLR 2026 | ❌ **WRONG** — confuses ReMe with D-Mem (which IS at ICLR 2026, arXiv 2603.18631) |

## Resolution

1. **Fix round66.md**: Change "ReMe: Procedural Memory for LLM Agents (ICLR 2026)" → "ReMe: Remember Me, Refine Me — Dynamic Procedural Memory (arXiv 2512.10696, ACL 2026 Findings)"

2. **Fix source [22] in round66.md**: Replace with correct citation: "ReMe: Dynamic Procedural Memory for Experience-Driven Agent Evolution (arXiv 2512.10696, ACL 2026 Findings)"

3. **Verify no other reports have this error**: The other three dual-memory reports (deep-update, round58, research_findings) all cite correctly.

4. **Root cause**: The round66 report likely conflated ReMe with D-Mem (Dual-Process Memory System for LLM Agents, You et al., ICLR 2026, arXiv 2603.18631), which is a different paper also discussing dual-process memory but from a different team and venue.