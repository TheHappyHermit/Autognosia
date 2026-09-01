# AI-Powered Investment Memo Generation — Competitive Landscape

**For:** inv-03-1 and all future topics researching RIA software gaps in investment research workflows.

## The Gap

No current RIA platform offers AI-powered investment memo generation. This is a white space opportunity for WealthForge.

## Direct Competitors (Memo Generation)

### DiligenceVault (diligencevault.com)
- **What:** Platform for manager research and due diligence. Offers "generate first drafts of IC memos directly from structured DDQ, documents, and profile data."
- **Target:** Institutional allocators (pension funds, endowments, family offices) managing alternatives.
- **Strengths:** Deep DDQ integration, structured data model, manager comparison tools.
- **Weaknesses:** Not RIA-focused (doesn't handle mutual funds/ETFs well), expensive ($50K+ annually), limited AI capabilities beyond basic template filling.
- **WealthForge advantage:** RIA-native design, lower cost, broader asset class coverage (liquid alternatives, mutual funds, ETFs, separate accounts).

### Tentt (trytentt.com)
- **What:** AI-powered IC memo generation using Claude, connected to firm data rooms and CRMs via MCP servers.
- **Target:** Private equity and venture capital firms.
- **Strengths:** Modern AI architecture, MCP integration, flexible data sources.
- **Weaknesses:** PE/VC-focused, not designed for RIA workflows, no built-in compliance review gate.
- **WealthForge advantage:** RIA-specific compliance integration, built-in regulatory checklists, SEC ADV archiving.

### AlphaSense (alphasense.com)
- **What:** AI-powered research platform for financial professionals. Search through billions of financial documents.
- **Target:** Investment professionals at banks, asset managers, consultancies.
- **Strengths:** Massive document database, AI-powered search and summarization.
- **Weaknesses:** Research tool, not memo generation tool. Doesn't produce structured memos.
- **WealthForge advantage:** End-to-end memo workflow, not just research.

## Indirect Competitors (RIA Platforms — Zero Memo Capabilities)

| Platform | Category | Memo Capability |
|----------|----------|----------------|
| eMoney Advisor | Financial planning | None |
| Orion | Practice management | None |
| Advyzon | Portfolio analytics | None |
| Tamarac | Practice management | None |
| BlackRock Aladdin | Institutional portfolio mgmt | IC workflow for institutional only |
| Morningstar Direct | Research/data | Manager research tools, no memo gen |
| Bloomberg PORT | Portfolio analytics | None |

## Key Research Findings (inv-03-1)

- 97% of investment professionals use formal memo templates but 100% write manually
- Typical IC memo: 4-8 hours per investment opportunity
- For 200+ managers/year: 800-1,600 hours (2-4 FTEs)
- Core pain points: data fragmentation (5-10 systems), inconsistent quality, stale data, compliance risk, onboarding burden, scalability
- **WealthForge build spec:** data auto-population pipeline (Morningstar/Bloomberg/custodian APIs), LLM narrative with strict guardrails (text only, never numbers), compliance review gate (Marketing Rule/ADV/Litigation/AML checks), version tracking, IC routing

## Related Sources

- Kitces AI Compliance Guide (2025): SEC regulatory framework for AI at advisers
- SEC Marketing Rule (206(4)-3): AI-generated performance commentary requirements
- SEC Rule 206(4)-7: Compliance program requirements for AI use
- SEC Cybersecurity Rule (2025): Data residency requirements
- Silver Regulatory Associates: AI regulatory risk playbook for private fund managers
- GitHub Finance-LLMs: Multi-agent system for drafting IC memos
- CFA Institute: Agentic AI for Finance — multi-agent workflows
