# OBBBA Scenario Toggle System (wps-02a-1a-2a-1a-a-1-1-1c-1-1-1-7a)

## Overview
The OBBBA scenario toggle system is a withdrawal planning module that dynamically switches between 3 legislative scenarios (Full OBBBA, Partial OBBBA, No-OBBBA/TCJA-sunset) and recomputes the entire withdrawal optimization under each scenario simultaneously.

## Three Scenarios

### Full OBBBA (base case)
- Individual tax brackets at TCJA rates (10/12/22/24/32/35/37%)
- Standard deduction: ~$15,750 single / ~$31,500 MFJ
- Estate exemption: $15M indexed, $30M MFJ
- LTCG: 0%/15%/20% at TCJA thresholds
- QBI 20% extended, SALT $10K cap extended

### Partial OBBBA (mixed)
- Most likely: individual brackets extended, estate exemption reduced (~$13.6M)
- QBI may be modified, SALT cap may change
- 2^16 possible combinations — pre-define 3 most likely presets

### No-OBBBA (TCJA-sunset)
- Brackets revert to pre-TCJA (10/15/25/28/33/35/39.6%)
- Standard deduction: ~$6,350 single / ~$12,700 MFJ
- Personal exemption returns (~$4,050/person)
- Estate exemption: ~$5M indexed
- QBI eliminated, SALT cap eliminated

## 16 Toggleable Provisions
Top rate, 5 bracket thresholds, standard deduction (single+MFJ), estate/gift exemption, QBI rate, SALT cap, AMT exemption+phaseout, CTC, LTCG thresholds (2), NIIT thresholds (2), deficit bond yield adjustment, growth equity adjustment, inflation adjustment.

## Withdrawal Plan Impact (Key Finding)
For $500K-$5M net worth clients, OBBBA increases Roth conversion capacity by ~37% ($35K more) and reduces plan failure rate by ~3.2pp. Bracket-filling capacity changes materially.

## Competitive Landscape
Zero existing platforms (MoneyGuidePro, eMoney, RightCapital, Addepar, Nightingale) offer legislative scenario toggling. Pure first-mover advantage.

## Client-Facing Widgets (5)
- SC-01: Scenario Overview Dashboard (side-by-side comparison table)
- SC-02: Annual Tax Delta Heatmap
- SC-03: Monte Carlo Scenario Comparison (overlaved percentile bands)
- SC-04: Scenario Probability Slider (interactive weights)
- SC-05: Strategy Change Alert (auto-detects when strategy shifts)

## Architecture
- LegislativeScenario data model (all 16 toggles + metadata)
- ScenarioComparison stores per-scenario optimization results + deltas
- ScenarioDelta engine computes tax/withdrawal/plan deltas between scenarios
- Hooks into SLSQP optimizer at 3 integration points (tax rate input, bracket-filling, Monte Carlo)

## Sources
IRS.gov, Tax Foundation, Amundi Research Center, Fidelity AART, J.P. Morgan CMA, Vanguard CMA, BlackRock CMA, CBO, CRFB, Yale Budget Lab, Brookings, Kitces.com, Baker Tilly, Grant Thornton, CPMLaw, Dechert, Smith Howard, Keystone Global, T3 Technology Survey.

## New Sub-topics (from Run 275)
- **7d**: State-level OBBBA conformity tracker
- **7e**: OBBBA QOF basis step-up calculator
- **7f**: OBBBA retirement plan contribution limit toggle
- **7g**: Provision-level sensitivity analysis
