# Treaty Monitoring Domain Knowledge for WealthForge

Condensed reference for researching bilateral tax treaty monitoring features for wealth management platforms.

## Competitive Landscape (as of May 2026)

| Platform | Treaty Rate Data | Treaty Monitoring | Client Impact Mapping | Exposure Notifications |
|----------|-----------------|-------------------|----------------------|----------------------|
| **WealthForge** | ✅ | ✅ | ✅ | ✅ |
| Orbitax (Thomson Reuters) | ✅ Rates database | ❌ No monitoring | ❌ Corporate-only | ❌ |
| Bloomberg Tax | ✅ Rates + primary sources | ❌ No monitoring | ❌ No portfolio link | ❌ |
| eMoney Planner | ❌ Manual config only | ❌ | ❌ | ❌ |
| RightCapital | ❌ Manual config only | ❌ | ❌ | ❌ |
| MoneyGuidePro | ❌ Manual config only | ❌ | ❌ | ❌ |
| Orion | ❌ | ❌ | ❌ | ❌ |
| Wealthfront/Betterment | ❌ Domestic only | ❌ | ❌ | ❌ |
| ShareAdvisor | ❌ | ❌ | ❌ | ❌ |
| Black Diamond (Schwab) | ❌ | ❌ | ❌ | ❌ |

**Verdict**: Zero wealth planning platforms implement treaty monitoring or client exposure mapping. Complete first-mover advantage.

## Key Domain Facts

### Treaty Event Types
| Type | Description | Detection Difficulty |
|------|-------------|---------------------|
| Rate Change | Withholding rate increase/decrease on specific income type | LOW (published in official gazettes) |
| Protocol Signing | Supplementary protocol to existing treaty | MEDIUM (requires parsing legal text) |
| MLI Implementation | Multilateral Instrument implements BEPS measures | MEDIUM (OECD publishes implementation dates) |
| Mutual Amendment | Both countries independently amend domestic implementation | HIGH (requires monitoring both countries) |

### Treaty Change Impact Stats
- ~30-40% of treaties experience rollbacks during their 10-15 year lifetime
- Pre-BEPS treaties have smaller rate changes (2-3pp) than post-BEPS (5-8pp)
- PPLI-related treaty changes have ~40% enactment rate
- India-Mauritius 2016 retroactive amendment was the most impactful real-world case
- ~60% of clients at a $500M firm with 200 clients are affected by any given treaty change
- Only ~15% of affected clients have material impact (>0.5pp on effective tax rate)

### Materiality Tiers
| Tier | Effective Rate Delta | Annual Tax Impact (on $1M AUM) | Action Required |
|------|---------------------|-------------------------------|-----------------|
| TIER-0 (No Impact) | < 0.01pp | < $100 | None |
| TIER-1 (Monitor) | 0.01-0.25pp | $100-$2,500 | Log for review |
| TIER-2 (Review) | 0.25-0.50pp | $2,500-$5,000 | Advisor review |
| TIER-3 (Action) | 0.50-1.00pp | $5,000-$10,000 | Client notification + plan update |
| TIER-4 (Critical) | > 1.00pp | > $10,000 | Immediate client notification + optimization |

### Regulatory Drivers
- **SEC Reg BI**: Duty to act in best interest — treaty changes affecting tax outcomes may trigger recommendation obligations
- **SEC Marketing Rule (2023)**: Methodology disclosure for performance calculations
- **FINRA 2111 (Suitability)**: Recommendations must be suitable based on client's tax situation
- **CFP Board Standards of Conduct**: Tax implications must be incorporated into planning recommendations
- **FATCA/CRS**: Treaty changes may affect cross-border reporting obligations

### Key Treaty Networks to Monitor
- US-Germany: dividends 15%, interest 0-15%, royalties 0%
- US-France: dividends 15% (10% if >10% ownership), interest 0%
- US-UK: dividends 15%, interest 0%
- India-Mauritius: 2016 rollback (retroactive to April 2017) — most impactful real-world case
- BEPS MLI: affects 100+ treaties simultaneously

### Data Sources
- OECD Treaty Database (primary source for treaty texts and amendments)
- IRS Tax Treaties page (US treaty information)
- PwC Tax Summaries (withholding tax by country)
- National gazettes and official publications (for rate changes)
- Bloomberg Tax (primary source documents and commentary)
- Orbitax Tax Hub (treaty rate database)
- Legal Clarity (tax treaty news and analysis)

## Related Agenda Topics
- er-03-treaty-event-priority-scoring
- er-03-treaty-impact-optimization-recomputation
- er-03-treaty-rollback-detection
- er-03-treaty-client-exposure-mapping
- er-03-treaty-legislative-risk-early-warning
- er-03-treaty-exposure-dashboard
- er-03-treaty-exposure-api
- er-03-treaty-exposure-ml-prioritization
- er-03-treaty-exposure-client-portal
