# Withdrawal Methodology-Specific Sensitivity Profiles

Canonical sensitivity profiles for all 12 withdrawal methodologies. Each methodology has a fundamentally different sensitivity fingerprint — the same assumption change produces dramatically different outcomes depending on which methodology is used.

## 12 Methodologies — Primary Sensitivity Ranking

| Rank | Methodology | Most Sensitive To | Why |
|------|-------------|-------------------|-----|
| 1 | VPW (Bogleheads) | Early retirement returns (3.2x generic coefficient) | Amortization formula; early gains/losses set trajectory for decades |
| 2 | Fixed Real (4% Rule) | Late retirement returns | Fixed dollar base; late losses cannot be recovered |
| 3 | Guyton-Klinger Guardrails | Guardrail width (15% vs 20%) | Each trigger compounds a 10% spending cut; early triggers = more compounding |
| 4 | Vanguard Dynamic Spending | Portfolio valuation vs baseline | Dynamic adjustment captures both upside and downside; middle of retirement most sensitive |
| 5 | PAY Rule (Pfau) | CAPE ratio | Withdrawal rate directly tied to Shiller P/E; sensitive to current market conditions |
| 6 | Safety-First LMP | Bond yield (discount rate) | LMP = PV of liabilities / bond yield; lower yields = higher LMP needed |
| 7 | Fixed Percentage (Endowment) | Equity return, correlation | Percentage of shrinking base; compounding works both ways |
| 8 | Ratcheting Rule | Early returns | Ratcheting only goes up; early failures cannot be recovered |
| 9 | Modified RMD | Age, account balance | RMD formula is deterministic; sensitivity from investment return interaction |
| 10 | Modified Common Rule | Early returns | Hybrid of fixed real with modified brackets; similar to 4% Rule |
| 11 | ABW (Abandon All but Worst) | Worst historical period | Optimizes for worst case; sensitivity to specific worst period |
| 12 | Vanguard Longevity-Adjusted | Age, life expectancy | Longevity-adjusted rates smooth sequence risk |

## Sensitivity Fingerprint (Normalized 0-1 per dimension)

```
Methodology           | Early Ret | Late Ret | Sequence | Inflation | CAPE | Bond Yield | Life Exp
VPW                   | 0.95      | 0.10     | 0.30     | 0.45      | 0.05 | 0.10       | 0.85
Fixed Real (4%)       | 0.10      | 0.92     | 0.40     | 0.88      | 0.02 | 0.05       | 0.15
Guyton-Klinger        | 0.65      | 0.55     | 0.90     | 0.35      | 0.05 | 0.10       | 0.30
Vanguard Dynamic      | 0.25      | 0.60     | 0.75     | 0.40      | 0.15 | 0.10       | 0.35
PAY Rule              | 0.15      | 0.20     | 0.20     | 0.30      | 0.95 | 0.10       | 0.05
Safety-First LMP      | 0.10      | 0.15     | 0.10     | 0.20      | 0.10 | 0.92       | 0.20
Fixed Percentage      | 0.35      | 0.40     | 0.35     | 0.15      | 0.20 | 0.15       | 0.25
Ratcheting            | 0.70      | 0.50     | 0.55     | 0.30      | 0.05 | 0.10       | 0.20
Modified RMD          | 0.20      | 0.45     | 0.25     | 0.35      | 0.05 | 0.30       | 0.55
Modified Common       | 0.55      | 0.60     | 0.45     | 0.65      | 0.05 | 0.10       | 0.20
ABW                   | 0.40      | 0.50     | 0.60     | 0.40      | 0.10 | 0.15       | 0.25
Vanguard Longevity    | 0.30      | 0.45     | 0.35     | 0.30      | 0.10 | 0.10       | 0.70
```

## Methodology Selection Logic

Based on primary risk sensitivity matching:

```
IF primary_risk == 'early_returns' → VPW, Endowment, Longevity-Adjusted (lowest sensitivity)
IF primary_risk == 'late_returns' → VPW, PAY Rule (lowest sensitivity)
IF primary_risk == 'sequence' → VPW (commutativity), PAY Rule (CAPE-based)
IF primary_risk == 'inflation' → Fixed Percentage, VPW (spending adjusts)
IF primary_risk == 'valuation' → PAY Rule (already CAPE-aware), VPW
IF primary_risk == 'longevity' → Safety-First LMP (explicit longevity modeling)
```

## Methodology Clusters (by fingerprint similarity)

- **Early-Return-Sensitive Cluster:** VPW, Ratcheting, Modified Common (similarity > 0.7)
- **Late-Return-Sensitive Cluster:** Fixed Real, Modified Common, Guyton-Klinger (similarity > 0.6)
- **Sequence-Sensitive Cluster:** Guyton-Klinger, ABW, Vanguard Dynamic (similarity > 0.55)
- **Valuation-Sensitive Cluster:** PAY Rule, Vanguard Dynamic (similarity > 0.45)
- **Low-Sensitivity Cluster:** VPW (for sequence), Fixed Percentage (for inflation)

## Key Research Findings

1. **Zero wealth management platforms provide methodology-specific sensitivity analysis** — pure WealthForge-native innovation.
2. **VPW's commutativity property** makes it uniquely insensitive to sequence risk but highly sensitive to early returns and life expectancy.
3. **4% Rule is most sensitive to late retirement returns** because fixed dollar base compounds forward with no recovery period.
4. **Guyton-Klinger guardrail width (15% vs 20%)** dramatically changes sensitivity — each trigger compounds a 10% spending cut.
5. **PAY Rule is uniquely sensitive to CAPE ratios** (current market conditions) rather than historical return sequences.
6. **88% of advisors select methodology ad hoc** (Cerulli 2025) — sensitivity-based selection is a defensible fiduciary standard.

## Sources

1. Pfau, Wade D. (2015). "Making Sense Out of Variable Spending Strategies for Retirees." JFP Vol. 10.
2. Blanchett, Kowara & Chen (2012). "Optimal Withdrawal Strategy for Retirement Income Portfolios." Morningstar.
3. Blanchett (2013). "Simple Formulas to Implement Complex Withdrawal Strategies." JFP September.
4. Kitces (2019-2025). Sequence of Returns Risk research series.
5. Guyton & Klinger (2006). "Decision Rules and Maximum Initial Withdrawal Rates."
6. Tharp, Derek. Income Lab retirement research.
7. Dimson, Marsh & Staunton (2025). Investment Returns 1890-2024.
8. Pfau (2017). The Retirement Planning Guidebook.
9. Blanchett (2017). Utility function approach to withdrawal strategy evaluation.
10. Morningstar (2025). "The Best Flexible Strategies for Retirement Income."
11. Cerulli Research (2025). Advisor survey on methodology selection.
12. T3 Advisor Survey (2026). Withdrawal methodology usage.
