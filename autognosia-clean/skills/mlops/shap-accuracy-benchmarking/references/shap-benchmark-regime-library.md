# SHAP Benchmark Regime Library

Curated benchmark test cases for SHAP approximation accuracy testing in financial modeling contexts.

## Synthetic Regime Test Cases

| ID | Name | Features | Correlation | Model | Purpose |
|----|------|----------|-------------|-------|---------|
| SYN-001 | Low-dim independent | 5-10 | r < 0.1 | XGBoost | Baseline accuracy |
| SYN-002 | Low-dim correlated | 5-10 | r > 0.7 | XGBoost | Correlation stress test |
| SYN-003 | Medium-dim independent | 10-30 | r < 0.1 | XGBoost | Medium-dim baseline |
| SYN-004 | Medium-dim clustered | 10-30 | cluster r > 0.5 | XGBoost | Clustered feature stress |
| SYN-005 | High-dim sparse | 30-100 | sparse | XGBoost | Dimensionality stress |
| SYN-006 | Non-tree continuous | 10-50 | mixed | Neural Net | Non-tree accuracy |
| SYN-007 | Non-tree categorical | 10-50 | mixed | Neural Net | Categorical accuracy |
| SYN-008 | Deep tree ensemble | 20-50 | mixed | LightGBM | Tree architecture test |
| SYN-009 | Mixed feature types | 10-30 | mixed | XGBoost | Mixed-type accuracy |
| SYN-010 | Distribution shift | 10-30 | mixed | XGBoost | OOD detection |

## Financial Regime Test Cases

| ID | Name | Features | Description | Stress Level |
|----|------|----------|-------------|-------------|
| FIN-001 | Portfolio allocation | 20-50 | Asset weights, risk factors, macro indicators | Normal |
| FIN-002 | Client risk profiling | 10-30 | Demographics, financial metrics, behavioral scores | High-stakes |
| FIN-003 | Withdrawal optimization | 15-40 | Balance, age, income, tax bracket, market conditions | Complex |
| FIN-004 | Asset allocation | 30-100 | Sector weights, factor exposures, correlation matrix | High-dim |
| FIN-005 | Tax-loss harvesting | 10-25 | Lot-level cost basis, holding period, market data | Mixed-type |
| FIN-006 | Compliance scoring | 20-50 | Regulatory indicators, risk metrics, audit flags | Mixed-model |

## Stress Regime Test Cases

| ID | Name | Features | Description | Source |
|----|------|----------|-------------|--------|
| STR-001 | March 2020 crash | 20-50 | High volatility, regime-switching data | Historical |
| STR-002 | 2022 rate hikes | 15-30 | Rising rate environment, bond portfolio stress | Historical |
| STR-003 | 2008 crisis | 30-60 | Credit market freeze, correlation breakdown | Historical |
| STR-004 | Adversarial features | 10-30 | Features engineered to maximize approximation error | Synthetic |

## Materiality Classification Reference

| Status | Relative L1 Error | Action |
|--------|-------------------|--------|
| GREEN | < 5% | No action needed |
| YELLOW | 5-15% | Monitor, log |
| ORANGE | 15-30% | Consider switching method |
| RED | > 30% | Must switch to more accurate method |
| GRAY | No benchmark data | Manual review required |
