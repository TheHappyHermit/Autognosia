# Prior Update Scheduling Domain Knowledge

## GREEN/YELLOW/RED Tier Classification

| Tier | Sensitivity Score | Client Impact | Approval Authority |
|------|-------------------|---------------|-------------------|
| 🟢 GREEN | < 0.3 | < 100 clients | Auto-approve |
| 🟡 YELLOW | 0.3 – 0.8 | 100–500 clients | Advisor acknowledgment (48h) |
| 🔴 RED | > 0.8 | > 500 clients OR any methodology change rate > 30% | IC approval required |

## Key Thresholds

- **Staleness limit:** 90 days — if prior is older than 90 days, force immediate apply regardless of tier
- **Max window size:** 5 updates per scheduling window
- **Advisor acknowledgment deadline:** 48 hours
- **IC meeting deadline:** Next IC meeting or emergency session within 14 days
- **Methodology change rate threshold:** > 30% of affected clients changing methodology → RED tier

## Impact Forecasting Metrics

- `clients_by_change_type`: {old_method → new_method: count}
- `clients_by_advisor`: {advisor_id: count}
- `clients_by_geography`: {state: count}
- `clients_by_sensitivity`: {tier: count}
- `methodology_distribution_before/after`: bar chart data
- `estimated_advisor_workload_hours`: sum(affected_clients × 0.5 per advisor)
- `estimated_client_communications`: count of clients needing individual outreach
- `high_priority_client_count`: clients near RMD age or with high net worth

## Client Communication Templates

### Template 1: GREEN tier (post-hoc)
> "Hi [Client], as part of our ongoing research, we've updated our withdrawal methodology scoring model. Your recommended approach remains [Methodology] — our research continues to support this choice for your situation."

### Template 2: YELLOW tier (advance notice)
> "Hi [Client], our research-based scoring model has been updated. This update may affect the recommended withdrawal methodology for some clients. I'll review your specific situation and reach out within [timeframe] with any recommendations."

### Template 3: RED tier (IC-approved)
> "Hi [Client], our Investment Committee has reviewed and approved an update to our withdrawal methodology scoring model. For your situation, the recommended methodology has [changed from X to Y / remained the same]. Here's why this matters for you: [personalized explanation]."

### Template 4: No Change (GREEN tier, aggregate)
> "Hi [Client], our quarterly research update is complete. The withdrawal methodology recommended for your portfolio remains [Methodology] — our analysis continues to support this approach."

## Rollback Protocol

- **Trigger:** Post-update impact exceeds forecast by > 20% OR any high-priority client adversely affected
- **Approval:** Same tier-based workflow as forward approval
- **Communication:** "Our recent methodology update caused unexpected impact. We've reverted to the previous model while we investigate."
- **Limit:** Maximum 2 rollbacks per quarter; CCO approval required for rollback #3+

## IC Briefing Structure

1. Executive Summary (1–2 sentences)
2. Sensitivity Analysis (score, dimension breakdown, change rate)
3. Impact Summary (methodology distribution changes, affected counts)
4. Client Segmentation (high-priority count, geography spread)
5. Comparison to last [N] prior updates
6. Risk Assessment (compliance implications, communication requirements)
7. System Recommendation (APPROVE / APPROVE WITH MODIFICATIONS / REJECT)

## Advisor Acknowledgment Fatigue Detection

- **Flag threshold:** > 90% auto-acknowledgment rate
- **Metrics tracked:** acknowledgment rate, time-to-acknowledge, override rate per advisor
- **Escalation:** CCO review if patterns suggest blind acknowledgment
- **Mitigation:** Progressive notification fatigue detection; auto-escalation

## Scheduling Optimization

- **Objective:** Minimize sum of (affected_advisors × affected_clients) across all windows
- **Constraint:** Staleness limit (90 days), max window size (5 updates)
- **Algorithm:** Greedy bin-packing with staleness priority (oldest first)
