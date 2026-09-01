# CMA Preference Management — Domain Knowledge

## Overview

Capital Market Assumption (CMA) preference management allows clients to rank, prioritize, weight, or exclude specific CMA providers when computing withdrawal plan outcomes. Zero existing wealth platforms (eMoney, RightCapital, MoneyGuidePro, Orion, Adaptive Wealth, SigFig) offer client-facing CMA preference management — complete first-mover advantage for WealthForge.

## CMA Provider Landscape

### Tier 1 — Primary Providers (widely used by wealth platforms)

| Provider | Update Freq | Methodology | Horizon | Key Differentiator |
|----------|------------|-------------|---------|-------------------|
| BlackRock (BII) | Quarterly | BIITS framework | 30-year | Institutional-grade, subjective market assessment |
| Vanguard (VCMM) | Semi-annual | Probabilistic ranges | 15-year | Publishes ranges not point estimates; low-cost ethos |
| Fidelity Institutional | Annual | Top-down macro + earnings estimates | 20-year | Earnings estimate integration |
| J.P. Morgan (LTCMA) | Annual | Macro-economic nationalism + AI | 10-15 year | 30th edition; emerging market focus |
| State Street (SSGA) | Annual | Passive/index-based | 10-year | Passive investing philosophy |
| Amundi | Annual | Explicit OBBBA modeling | 10-year | Only provider to explicitly model OBBBA |
| Capital Group | Annual | Active management/fundamental | 10-year | Active management aligned |

### Tier 2 — Specialized/Niche Providers

| Provider | Focus | Client Relevance |
|----------|-------|-----------------|
| Dimensional ("Reality Check") | Factor-based, academic | Quantitative/academic clients |
| Bridgewater | Macro regime-based (All Weather) | Risk-parity investors |
| Ninety-One | Multi-asset, global | International diversification |
| Capital Economics | Macro forecasting | Macro-aware clients |
| Schroders | ESG-integrated | ESG-focused clients |
| PIMCO | Fixed-income specialist | Bond-heavy portfolios |

### Tier 3 — Platform-Internal

| Provider | Description |
|----------|-------------|
| WealthForge Internal | Platform-calculated consensus |
| Advisor-Defined | Custom assumptions set by advisor |

## Provider Independence Score (PIS)

Many "independent" CMAs share underlying data sources:
- Bloomberg is the most widely used data source (6+ providers)
- Many providers share Bloomberg terminal data, Fed yield curves, VIX data
- PIS (0-100) quantifies true independence vs. data-source overlap
- Weight adjustment: `effective_weight = weight × (1 + (PIS - 50) / 200)`
  - PIS > 50 gets bonus (more independent data sources)
  - PIS < 50 gets penalty (more likely to share data)

## Preference Model

Three layers: global, asset-class-specific, horizon-specific.

Preference levels: `strongly_preferred` → `preferred` → `acceptable` → `neutral` → `avoid` → `strongly_avoid`

Weight overrides: `strongly_preferred` = 2.0, `preferred` = 1.5, `acceptable` = 1.0, `neutral` = 0.5, `avoid` = 0.0

## Key Behavioral Findings

- A 0.5% change in expected equity returns can shift plan success rates by 5-15pp for clients near plan margin
- Clients who "prefer" multiple providers may unknowingly prefer correlated data sources
- Template-based onboarding with progressive disclosure is the right UX approach
- Plan success rate inflation detection is critical (clients may game preferences)

## Regulatory Considerations

- **SEC Marketing Rule**: Auto-generated CMA disclosure required per plan output
- **Reg BI**: Advisor override must be documented with justification
- **FINRA 2111**: Client-chosen CMAs must still produce suitable plans
- **State disclosures**: CA, NY, MA, FL have specific CMA disclosure requirements
- **CFP Board fiduciary**: Loyalty, care, and disclosure obligations apply

## Competitive Landscape

| Platform | CMA Customization | Client Preference | Transparency |
|----------|------------------|-------------------|-------------|
| eMoney | ❌ | ❌ | ❌ Black box |
| RightCapital | ❌ | ❌ | ❌ Black box |
| MoneyGuidePro | ⚠️ Advisor-only | ❌ | ⚠️ Limited |
| Adaptive Wealth | ⚠️ Advisor-only | ❌ | ⚠️ Limited |
| Orion | ❌ | ❌ | ❌ Black box |
| SigFig | ⚠️ Some | ❌ | ⚠️ Limited |
| WealthForge (proposed) | ✅ Full | ✅ Client-facing | ✅ Full |

## New Sub-Topics for Future Research

- Preference template A/B testing framework (medium)
- Advisor recommendation engine for CMA preferences (medium)
- CMA preference change impact notification system (medium)
- Client CMA preference data export and portability (medium)
- CMA preference audit and compliance reporting (high)

## Sources

1. Kitces Blog, "Does Having The 'Right' Capital Market Assumptions Matter?" Dec 2024
2. BlackRock BII CMA, Feb 2026
3. J.P. Morgan LTCMA, Oct 2025 (30th edition)
4. Fidelity Institutional CMA, 2025
5. Vanguard VCMM, semi-annual
6. SEC Marketing Rule (Rule 206(4)-8), 2024
7. FINRA Rule 2111 Suitability
8. CFP Board Standards of Conduct
9. Amundi CMA, annual
10. Dimensional Reality Check, annual
11. SSGA CMA, annual
12. Capital Group CMA, annual
13. Ninety-One CMA, quarterly
14. Bridgewater All Weather Research
15. PIMCO Global Investment Returns
16. Schroders Global Investment Returns
17. Capital Economics CMA
18. BlackRock Expected Returns Analyzer Methodology
19. J.P. Morgan LTCMA PRNewswire, Oct 20 2025
20. Fidelity International CMA White Paper, Jun 2025
