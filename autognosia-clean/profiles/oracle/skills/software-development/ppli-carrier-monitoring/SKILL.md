---
name: ppli-carrier-monitoring
description: Domain knowledge and research patterns for PPLI carrier health monitoring — IFRS 17 CSM, DAC impairment, SAC-level analysis, and Bermuda PPLI carrier financial health assessment for UHNW wealth planning.
category: software-development
---

# PPLI Carrier Health Monitoring

## Domain Overview

This skill covers monitoring the financial health of PPLI (Private Placement Life Insurance) carriers, primarily Bermuda-based, for UHNW wealth planning. Key domains:

1. **IFRS 17 CSM Monitoring** — Contractual Service Margin tracking for Bermuda carriers (VFA-specific metrics, SAC-level aggregation, floor proximity alerts)
2. **DAC Impairment Monitoring** — US GAAP Deferred Acquisition Cost tracking for domestic carriers
3. **SAC-Level Analysis** — Segregated Account Column monitoring for concentration risk and floor proximity
4. **Carrier Comparison** — Cross-carrier health benchmarking and peer group analysis

## When to Load

Load this skill when researching any PPLI carrier health, UHNW insurance wrapper, or Bermuda PPLI topic. Specifically for:
- `uhnw-01d-1a-1-2c-7e-4b-*` — PPLI carrier health monitoring topics
- `uhnw-01b-*` — PPLI subaccount correlation topics
- `uhnw-01c-*` — PPLI 1035 exchange optimization topics
- Any topic involving PPLI carrier selection, monitoring, or migration

## Key Domain Concepts

### CSM (Contractual Service Margin)
- IFRS 17 concept: unearned profit deferred over contract life
- VFA CSM is market-sensitive (releases with fund returns) — unlike DAC
- Cannot go negative; once zero, adverse changes flow to P&L immediately
- Measured at insurance group level within each SAC

### DAC (Deferred Acquisition Cost)
- US GAAP concept: deferred acquisition costs amortized over contract life
- Impairment occurs when DAC/Reserve > 15% (critical threshold)
- DAC recovery speed varies by carrier (7-14 years typical)

### SAC (Segregated Account Column)
- Bermuda law permits asset/liability segregation per policy or policy group
- Each SAC splits into multiple insurance groups under IFRS 17
- Carrier-level aggregates mask SAC-level concentration risk

### Key Metrics
- **CFPR** (CSM Floor Proximity Ratio): CSM / (FCF + RA) — <5% = CRITICAL
- **CDR** (CSM Decay Rate): annualized CSM erosion rate — < -15% = rapid decay
- **CFD** (CSM Floor Distance): absolute dollars to zero
- **SCCS** (SAC Concentration Score): CSM_sac / CSM_carrier — >20% = concentration risk

## Reference Files

- **`references/csm-floor-proximity-monitoring.md`** — CSM floor proximity metrics, alert tiers, data sources, competitive landscape. Load when researching SAC-level CSM monitoring.
- **`references/bermuda-ppli-carrier-inventory.md`** — (future) Inventory of Bermuda PPLI carriers with domiciles, ratings, and data availability.
- **`references/bootstrap-ci-dynamic-thresholds.md`** — Bootstrap CI dynamic thresholds for PPLI peer group analysis: N-dependent CI levels (99% for N<5, 97.5% for 5-10, 95% for 10-30, 90% for 100+), BCa coverage error data, competitive landscape (zero competitors implement this). Load when researching any bpu-* topic or PPLI peer group uncertainty quantification.

## Research Patterns

### Carrier Health Assessment
1. Check DAC/Reserve ratio (US GAAP carriers) or CSM/AUM ratio (IFRS 17 carriers)
2. Check concentration: HHI of CSM across SACs
3. Check floor proximity: % of SACs with CFPR < 10%
4. Check trend: CDR direction and acceleration
5. Cross-reference with AM Best / S&P / Moody's ratings
6. Check for restructuring events (mergers, separations, accounting changes)

### Competitive Analysis Pattern
- Zero wealth management platforms provide SAC-level CSM monitoring
- Even insurance analytics platforms (S&P Global, Moody's) only operate at carrier/segment level
- Revenue opportunity: $15K-50K/year for full PPLI carrier monitoring suite
