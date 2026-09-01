# Legislative Correlation Matrix (LCM) — Domain Knowledge

## Overview

The LCM models how legislative proposals affecting PPLI, QSBS, QOF, GRAT, and other deferral strategies are correlated. Legislative risk is NOT independent — proposals cluster in revenue-raising packages, entrepreneurship packages, and infrastructure packages, creating systemic risk.

## Four Legislative Package Types

### 1. Revenue-Raiser Cluster (HIGH PPLI-QSBS correlation: 0.6-0.8)
- **Composition:** PPLI abuse closure + GRAT/grantor trust reform + carried interest reform + partnership income recharacterization
- **Precedent:** Wyden's April 2026 Tax Week (5 simultaneous bills: S.4279 PPLI, S.4287 GRAT, derivatives mark-to-market, partnership reform, Fair Trusts)
- **Impact:** PPLI severe, QSBS moderate (indirect), QOF negligible
- **Mechanism:** PPLI is high-profile target; QSBS/GRAT added as revenue contributors

### 2. Entrepreneurship Cluster (pro-QSBS, anti-PPLI: -0.3 correlation)
- **Composition:** QSBS expansion + R&D credit + startup equity expensing
- **Precedent:** OBBBA (July 2025) — QSBS expanded ($10M→$15M exclusion, $50M→$75M cap) while PPLI provisions introduced separately
- **Impact:** QSBS positive, PPLI variable
- **Strategy implication:** Accelerate QSBS deployments before PPLI restrictions

### 3. Infrastructure/Community Cluster (high QOF correlation: 0.7+)
- **Composition:** QOF extension + LIHTC + historic preservation + new markets tax credit
- **Precedent:** Opportunity Zones Transparency, Extension, and Improvement Act (Booker-Scott-Warner-Young-Van Hollen) — extends deadline from Dec 31, 2026 to Dec 31, 2028
- **Impact:** QOF positive, PPLI/QSBS negligible
- **Strategy implication:** Natural diversification hedge against revenue-raiser packages

### 4. Trust/Transfer Tax Cluster (GRAT-PPLI correlation: 0.5-0.6)
- **Composition:** GRAT reform + dynasty trust taxation + PPLI closure + estate tax adjustment
- **Precedent:** Wyden-King GRAT bill (S.4287, April 2026) + Fair Trusts for Fiscal Responsibility Act (Murray-Wyden, May 2026)
- **Impact:** GRAT severe, PPLI severe if combined with S.4279
- **Risk:** GRAT+PPLI common UHNW strategy; simultaneous elimination is catastrophic

## Core 6x6 Correlation Matrix

| | PPLI RR | QSBS RR | QOF Ext | GRAT Ref | Ptnr Ref | State Decoup |
|---|---|---|---|---|---|---|
| **PPLI RR** | 1.00 | 0.72 | 0.05 | 0.58 | 0.45 | 0.10 |
| **QSBS RR** | 0.72 | 1.00 | 0.08 | 0.35 | 0.40 | 0.65 |
| **QOF Ext** | 0.05 | 0.08 | 1.00 | 0.02 | 0.15 | 0.05 |
| **GRAT Ref** | 0.58 | 0.35 | 0.02 | 1.00 | 0.50 | 0.18 |
| **Ptnr Ref** | 0.45 | 0.40 | 0.15 | 0.50 | 1.00 | 0.18 |
| **State Dec** | 0.10 | 0.65 | 0.05 | 0.12 | 0.18 | 1.00 |

RR = Revenue-Raiser

## Systemic Risk Score Formula

**SRS = sum(w_i * LRS_i) + lambda * sum(sum(rho_ij * w_i * w_j * LRS_i * LRS_j))**

- w_i = weight of strategy i in portfolio (by after-tax expected value)
- LRS_i = Legislative Risk Score for strategy i
- rho_ij = correlation coefficient between strategies i and j
- lambda = correlation premium scaling factor (default 0.5)

**Key finding:** Correlation premium can reduce expected tax alpha by 50-75% for correlated portfolios. A $80M business sale client deploying PPLI + QSBS + GRAT simultaneously faces 3x the risk of isolated deployment.

## Dynamic Correlation Adjustments

| Factor | Effect on Correlation |
|---|---|
| Unified Democratic control | Revenue-raiser corr increases (0.72→0.85) |
| Divided government | Revenue-raiser corr decreases (0.72→0.55) |
| Revenue crisis | All revenue-raiser correlations increase |
| Pre-election year | Lower correlation (avoid controversial pairings) |
| Post-election year | Higher correlation (mandate-driven packaging) |
| Treasury enforcement aggression | PPLI legislative correlation decreases (enforcement substitutes for legislation) |

## State-Level QSBS Decoupling (May 2026)

- **Enacted:** Oregon (March 2026, protects $39M→$83M revenue), Maine
- **Proposed:** New York (April 2026), Washington (failed)
- **Non-conforming (historical):** California, Pennsylvania, Mississippi, Alabama
- **Conforming (as of 2026):** NJ began conforming Jan 1, 2026
- **States cost ~$710M in 2026, rising to $1.2B in 2031** per ITEP
- **Correlation with federal revenue raisers:** 0.10 (low), but rising to 0.35+ if cascade continues

## Key 2026 Legislative Events

| Date | Event | Impact |
|---|---|---|
| Apr 13, 2026 | S.4279 introduced (Wyden) | PPLI tax-exempt status stripped, 180-day conversion window |
| Apr 14-17, 2026 | Wyden Tax Week (5 bills) | Revenue-raiser cluster: PPLI + GRAT + derivatives + partnership + trusts |
| Mar 2026 | Oregon QSBS decoupling enacted | State-level threat to federal QSBS exclusion |
| Apr 2026 | New York QSBS decoupling proposed | Growing state-level correlated threat |
| May 2026 | Fair Trusts for Fiscal Responsibility Act (Murray-Wyden) | GRAT + dynasty trust targeting |

## Competitive Landscape

**Zero competitors model legislative correlation between deferral strategies.** This is a complete first-mover advantage in the UHNW segment.

- eMoney: Independent strategy modeling only
- MoneyGuidePro: Independent strategy modeling only
- RightCapital: Basic legislative scenario toggles only (tax rate changes)
- Orion: Aggregation platform, no planning
- Addepar: UHNW portfolio management, no legislative analysis
- Capital Preferences: CMA-focused only

## Data Sources for LCM

| Source | Type | Update Freq |
|---|---|---|
| Congress.gov | Bill text, sponsorship | Real-time |
| JCT (JCT.gov) | Revenue estimates | Quarterly |
| CBO (CBO.gov) | Budget projections | Monthly |
| LegiScan | State legislation | Daily |
| GovInfo (govinfo.gov) | Bill status, amendments | Real-time |
| CRS Reports | Legislative analysis | As published |
| Tax Foundation | Tax policy analysis | Weekly |

## Correlation Confidence

Each coefficient includes CI based on:
- Sample size (historical co-introductions)
- Time decay (exponential, half-life = 3 years)
- Source reliability (JCT/CBO = high, advocacy = low)

**Example:** PPLI-QSBS correlation = 0.72 [0.58, 0.86] (95% CI, n=12 packages 2020-2026)

## Edge Cases

1. **Correlation overfitting:** Small samples (n<12) produce unreliable coefficients
2. **Spurious correlation:** Both strategies targeted by same package type ≠ direct link
3. **Regime change blindness:** Correlations from one political regime may not hold under another
4. **Black swan:** Unexpected proposals create new correlations not in matrix
5. **Client misinterpretation:** Correlation ≠ probability of enactment
6. **State-level blind spot:** State decoupling correlations poorly modeled
