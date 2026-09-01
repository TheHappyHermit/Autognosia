# WPS CCO Compliance Dashboard — Key Data Reference

> Quick-reference for the WPS Compliance Dashboard for CCO (wps-01). Full 12-section research entry at RESEARCH.md (2026-05-18 22:20). Load this when researching ANY WPS compliance, CCO dashboard, or retirement income documentation feature.

## 5-Component WPS Health Score (Per Client, 0-100)

```
wps_health_score = (
    has_signed_wps * 30 +              // 30 if signed WPS exists, 0 if not
    methodology_appropriateness * 25 +  // 0-25 based on risk profile match
    review_currency * 25 +               // 25 if reviewed within 12 months, scales down linearly
    state_disclosure_completeness * 10 + // 10 if all applicable state disclosures present
    version_currency * 10                 // 10 if on latest WPS template version
)
```

Color thresholds: 🟢 >=80, 🟡 60-79, 🔴 <60

## Firm-Level Aggregates

| Metric | Formula | Thresholds |
|--------|---------|------------|
| **Firm WPS Health** | avg(per-client health scores) | 🟢 >=80, 🟡 60-79, 🔴 <60 |
| **WPS Adoption Rate** | signed_wps / retired_clients | 🟢 >85%, 🟡 70-85%, 🔴 <70% |
| **Review Compliance Rate** | reviewed_within_12mo / due_for_review | 🟢 >90%, 🟡 75-90%, 🔴 <75% |
| **Advisor WPS Generation Rate** | signed_wps_for_advisor / retired_clients_for_advisor | Compare to firm avg |
| **Methodology HHI** | sum((pct_method_i)^2 for all methods) | 🟢 <0.3, 🟡 0.3-0.5, 🔴 >0.5 |

## 3-Tier Alert Engine

| Tier | Severity | Delivery | Examples |
|------|----------|----------|----------|
| **P1** | Critical | Immediate CCO notification | health_score <30, retired >90d without WPS, HHI >0.7 |
| **P2** | Warning | Weekly digest | health 30-60, review compliance <70%, advisor gen rate <50% |
| **P3** | Informational | Monthly report | state disclosure <90%, methodology drift detected |

## 7 CCO Dashboard Widgets

| ID | Widget | Data Source | Interaction |
|----|--------|------------|-------------|
| CCO-WPS-1 | Landing: KPI Cards + Donut + Advisor Table + Feed | wps_compliance_snapshots, wps_advisor_performance | Click-to-drill, sortable |
| CCO-WPS-2 | Advisor Detail Drill-Down | Advisor-level WPS data | Per-advisor client list, bulk actions |
| CCO-WPS-3 | Methodology Distribution Heat Map | Advisor x Methodology grid | Color-intensity, benchmark toggle |
| CCO-WPS-4 | Review Compliance Trend Line | 12-month rolling wps_advisor_performance | Annotations for dips |
| CCO-WPS-5 | Geographic State Disclosure Map | wps_state_compliance_tracking | US heat map, click to drill |
| CCO-WPS-6 | Exam Package Builder | wps_exam_packages | 3-step wizard -> SHA-256 hashed ZIP |
| CCO-WPS-7 | E&O Risk Distribution Histogram | Per-client health scores | Score buckets with dollar exposure |

## Complete Competitive Landscape - 17 Platforms, 0 WPS

| Category | Platforms Checked | Has WPS? |
|----------|------------------|----------|
| **RIA Compliance (8)** | ComplyRIA, SmartRIA, Hadrius, Luthor, ComplianceAlpha, RegEd, Vigilant, RIA in a Box | 0/8 |
| **Wealth Management (9)** | Timeline (UK), Income Lab, eMoney, RightCapital, MoneyGuidePro, Orion, Addepar, Tamarac, Advyzon | 0/9 (Timeline UK: static template only) |
| **DIY Templates (2)** | Morningstar RPS, Bogleheads RPS | Static PDF, not compliance-grade |

## SEC 2026 Exam Priorities - Retirement Income Documentation

SEC Division of Examinations FY 2026 Priorities (Nov 17, 2025):
1. **Fiduciary conduct for retail-facing advisers** - top priority
2. **Recommendations to older investors and those saving for retirement**
3. **"Whether the file shows the adviser's reasoning at the time it was made"**

Goodwin Law (Dec 2025): "Examiners will be asking not only whether a recommendation was suitable, but whether the file shows the adviser's reasoning at the time it was made."

## E&O Liability Quantification Formula

```
per_client_lawsuit_probability = 
    health_score < 30 : 3.0%
    health_score 30-60 : 1.0%
    health_score 60-80 : 0.3%
    health_score >= 80 : 0.05%

firm_expected_liability = sum(per_client_lawsuit_prob * $315K avg_settlement)
// $315K = midpoint of $150K-$500K per case (InvestmentNews 2025)
```

## WPS-to-Risk-Profile Appropriateness Mapping

| Methodology | Min PS | Max PS | Best For |
|-------------|--------|--------|----------|
| Fixed 4% Rule | 20 | 50 | Conservative, simplicity |
| Risk-Based Guardrails | 30 | 70 | Moderate, Fitzpatrick-Tharp |
| Guyton-Klinger | 40 | 75 | Moderate-growth, guardrails |
| Modified RMD | 30 | 60 | Conservative, RMD-aligned |
| VPW | 60 | 95 | Aggressive, variable-income |
| Vanguard Dynamic | 30 | 65 | Moderate, floor-limited |
| Floor & Ceiling | 10 | 40 | Ultra-conservative, minimum-income |
| Hatchet (Spending Smile) | 50 | 85 | Aggressive, go-go/slow-go |
| Consumption Smoothing | 40 | 80 | Moderate, MaxiFi-style |

## SQL Schema Key Tables

6 core tables: wps_compliance_snapshots, wps_compliance_alerts, wps_advisor_performance, wps_methodology_library, wps_state_compliance_tracking, wps_exam_packages

## Key Source URLs

- SEC 2026 Exam Priorities: https://www.sec.gov/files/2026-exam-priorities.pdf
- Jump.ai SEC Compliance (Apr 2026): https://jump.ai/advisor-trends/compliance/sec-compliance
- Goodwin Law 2026 Exam Priorities: https://www.goodwinlaw.com/en/insights/publications/2025/12/alerts-privateequity-pif-2026-sec-exam-priorities-for-registered-investment-advisers
- Kitces WPS original (Feb 2014): https://www.kitces.com/blog/crafting-a-withdrawal-policy-statement-for-retirement-income-distributions-guyton/
- InvestmentNews compliance comparison: https://www.investmentnews.com/glossary/best-ria-compliance-software-solutions/262147
- T3 2026 Survey: T3/Inside Information
