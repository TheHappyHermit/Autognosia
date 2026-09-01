# CMA Update Significance Filter

When a CMA (Capital Market Assumptions) provider publishes a new edition, this filter determines whether WealthForge should recalculate every client's withdrawal plan — and for which clients. The core problem: not all CMA updates are created equal. Some shift expected returns by 0.1% (routine maintenance), while others shift them by 2-3% (regime change). Recalculating on every update creates "plan churn" — clients see their plans change constantly, which erodes trust and creates advisor workload.

## Four-Component Significance Score

### Component 1: CMA Change Magnitude Score (CMS)
```
CMS = Σᵢ (wᵢ × |r_newᵢ - r_oldᵢ| / σᵢ)

where:
    wᵢ = portfolio weight of asset class i
    r_newᵢ = new expected return for asset class i
    r_oldᵢ = old expected return for asset class i
    σᵢ = long-term volatility of asset class i (annualized)
```
- CMS < 0.5: Routine update — no recalculation needed
- CMS 0.5–1.5: Moderate — queue for batch
- CMS 1.5–3.0: Significant — priority recalc
- CMS > 3.0: Major regime shift — urgent recalc

**Multi-asset extension with regime sensitivity:**
```
CMS_extended = Σⱼ (wⱼ × |r_newⱼ - r_oldⱼ| / σⱼ) × ρⱼ
ρⱼ = 1.5 for private markets, 1.3 for EM, 1.2 for high yield, 1.0 baseline, 0.8 for cash
```

### Component 2: Client Portfolio Sensitivity Score (CPSS)
```
CPSS = Σᵢ (wᵢ_client × wᵢ_CMA × |r_newᵢ - r_oldᵢ|) × life_stage_multiplier

life_stage_multiplier:
    Pre-retirement (>10 years): 0.3
    Transition (0-10 years): 0.7
    Early retirement (0-5 years): 1.2
    Mid-retirement (5-15 years): 1.0
    Late retirement (>15 years): 0.8
```

### Component 3: Plan Margin Score (PMS)
```
PMS = (1 - plan_margin) × plan_margin_sensitivity
plan_margin = success_probability - 0.50
plan_margin_sensitivity = 1 / max(plan_margin, 0.01)
```
- PMS > 5: Wide margin — low priority
- PMS 2–5: Moderate — medium priority
- PMS 1–2: Thin — high priority
- PMS < 1: Critical — immediate recalc

**Key insight:** Non-linear weighting makes clients near 50% success rate exponentially more sensitive.

### Component 4: Recalculation Cost Score (RCS)
```
RCS = base_cost(15min) × complexity_multiplier × client_value_factor
complexity: 1.0 simple, 1.5 moderate, 2.0 complex
value: 0.5 low AUM, 1.0 medium, 2.0 high, 3.0 ultra-high
```

## Composite Score and Decision Logic
```
Significance = 0.35×CMS_norm + 0.25×CPSS_norm + 0.30×PMS_norm + 0.10×RCS_inverse_norm
```
- Score < 0.25: Skip — log for audit trail
- Score 0.25–0.50: Queue — batch recalc next window
- Score 0.50–0.75: Priority — recalc within 24 hours
- Score > 0.75: Urgent — immediate recalc + advisor notification

## Delta Analysis (Efficient Approximation)
Instead of full Monte Carlo for every client:
```
delta_SR ≈ (∂SR/∂μ) × Δμ + (∂SR/∂σ) × Δσ
```
Accuracy: 85-95% vs full Monte Carlo. Decision thresholds:
- delta_success_rate > 5pp → immediate recalc
- delta_sustainable_withdrawal > $100/month → priority recalc
- delta_first_failure_year > 2 years → priority recalc
- delta_success_rate 2-5pp near 50% → recalc

## Withdrawal Strategy Sensitivity Matrix
| Strategy | CMA Sensitivity | Reason |
|---|---|---|
| Common Rule | HIGH | Fixed amounts directly affected by returns |
| Bracket-Filling | MEDIUM | Tax dynamics partially insulate from returns |
| SLSQP Optimizer | HIGH | Directly optimizes on CMA inputs |
| Proportional | MEDIUM | Inflation-linked, less return-sensitive |
| Vanguard Dynamic | LOW | Adapts to market conditions |
| Roth-First | MEDIUM | Sequencing affected but Roth provides insulation |

## Batch Recalculation Windows
- **Weekly:** Sunday 02:00 UTC — queue tier
- **Ad-hoc (CMS > 2.0):** Within 4 hours — promote queue to priority
- **Emergency (CMS > 3.0):** Within 1 hour — full recalc all clients
- **Crisis (VIX > 30):** High-AUM only for first 24h, delta-analysis-only for 48h

## Net Portfolio Impact (Correlated Opposing Changes)
```
net_impact = |Σᵢ (wᵢ × Δrᵢ)|
```
If net_impact < 0.1%, update is likely immaterial regardless of individual asset class changes.

## Correlation Sensitivity Component
```
CMS_corr = Σᵢⱼ (wᵢ × wⱼ × |ρ_newᵢⱼ - ρ_oldᵢⱼ|) × σᵢ × σⱼ
```
If CMS_corr > 0.5, treat as significant regardless of CMS_return.

## Sources
- BlackRock 2026 CMA (blackrock.com)
- BNY 2026 CMA (bny.com)
- SEI 2026 CMA Update (March 5, 2026)
- eMoney Planner, RightCapital, MoneyGuidePro competitive analysis
- SEC Marketing Rule (2024), FINRA Rule 2111, CFP Board Standards
- DiLello & Simon SLSQP methodology
