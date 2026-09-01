# Simultaneous Optimization Problem — Condensed Reference

The four-lever retirement planning optimization problem: Social Security claiming age + withdrawal sequencing + Roth conversions + RMD coordination as a single unified combinatorial search.

## Core Finding

**No existing tool truly optimizes all four levers simultaneously.** Every tool treats at least one lever as a pre-optimized input or manual selection.

| Tool | SS | Withdrawals | Roth | RMDs | Simultaneous? | Algorithm |
|------|----|------------|------|------|---------------|-----------|
| Income Lab | Pre-optimized | 6 seq, selects best | Multi-yr, IRMAA | Modeled | ⚠️ Partial (Roth+withdrawals; SS separate) | Heuristic search |
| RightCapital Solve | Separate module | 6 seq, user selects | Bracket-filling | Modeled | ⚠️ Partial (Solve ranks combos; SS separate) | Combinatorial ranking |
| MaxiFi (Kotlikoff) | Integrated | Optimized | Optimized (iterative DP) | Modeled | ✅ Claims simultaneous ("non-linear eqns") | Iterative dynamic programming |
| Pralana | Separate opt | User selects | Bracket-iteration | Modeled | ❌ Admits: "Nor does Pralana run simultaneous optimizations" | Sequential bracket test |
| T. Rowe Price Income Solver | Bundled SSAnalyzer | Algorithmic | Integrated | Modeled | ⚠️ Partial (methodology not fully public) | Proprietary (Retiree Inc.) |

## The Six Active Constraints (Evolve with Age)

1. **Federal Tax Brackets** (10-37%, TCJA permanent under OBBBA)
2. **IRMAA Cliffs** (2-yr lookback, 4 tiers: $218K/$274K/$342K/$410K MFJ)
3. **SS Tax Torpedo** (provisional income formula, 22.2-40.7% effective rates)
4. **OBBBA Senior Deduction Phaseout** ($150K-$250K, temporary 2025-2028)
5. **ACA Subsidy Cliff** (hard $86,560 MFJ, ages 50-64 only)
6. **State Income Tax** (0-13.3%, plus 8-states SS taxation)

**Constraint evolution with age:**
- 50-64: ACA cliff dominates
- 62-64: Brackets + SS torpedo (if SS claimed early)
- 65-67: Senior phaseout + SS torpedo + IRMAA lookback → 55%+ marginal rates
- 67-72: SS torpedo dominates (full SS + pre-RMD bracket space)
- 73+: RMD floor + IRMAA compression

## Three Algorithmic Schools

### 1. Dynamic Programming (MaxiFi, Tharp framework)
- State space S = {age, tIRA balance, Roth balance, taxable balance, SS income, filing status, IRMAA lookback MAGI}
- Full DP state space ~4.8 × 10^10 — infeasible for real-time
- With discretization + pruning: ~9.6 × 10^6 — ~16 min batch processing
- Produces dynamic policy function (adaptable to outcomes), not just static plan

### 2. Heuristic/Combinatorial Search (Income Lab, RightCapital, Pralana)
- Pre-define finite strategy set and rank: ~6 sequences × ~10 Roth × 3-5 SS ages = 180-300 combos
- Computationally tractable (seconds to minutes, parallelizable)
- Transparent/auditable for advisors
- May miss optimal strategies outside predefined search space
- No dynamic policy function — static plan output

### 3. Non-linear Constrained Optimization / SLSQP (DiLellio & Simon, 2022)
- SLSQP applied to withdrawal strategy: 0.54% annual tax alpha improvement
- 150 decision variables (30 yrs × 4 accounts × Roth amount), ~300 constraints
- Runtime: seconds to minutes
- Deterministic only (single return path)
- Does not handle SS claiming optimization

## Seven Gaps (No Tool Fills Any)

1. **True four-lever simultaneous optimization** — all tools treat ≥1 lever as pre-optimized
2. **Time-offset constraints** (IRMAA 2-year lookback, ACA recertification)
3. **Widow's penalty** as active optimization constraint (MFJ→Single filing transition)
4. **Multi-objective optimization** — Pareto frontier for spending vs. bequest vs. taxes
5. **Stochastic optimization** — every optimizer is deterministic
6. **QCD-Roth integration** — bracket space allocation in 70½-73/75 window
7. **Dynamic policy function** — all tools produce static plans, not adaptive decision rules

## Recommended Architecture for WealthForge

**Hybrid approach:**
- Heuristic outer loop: broad SS age × withdrawal sequence comparison (180-300 combos, parallel)
- NLP/SLSQP inner loop: fine-grained annual Roth conversion optimization within each path
- DP-style backward induction: multi-year time-offset constraints (IRMAA, RMD)
- Objective: maximize after-tax spending, NOT ending wealth (advisors optimize for clients' lifetime spending)

**"Good enough" threshold:** Market evidence (RightCapital, Income Lab, MaxiFi all successful with approximate optimization) shows advisors accept near-optimal solutions. Focus on: clear quantified savings, transparent strategy comparison, explainable client output.

## Six New Subtopics Added to Agenda

1. Stochastic optimization (optimization within Monte Carlo)
2. Multi-objective optimization (Pareto frontier for competing goals)
3. Constraint evolution pattern (life-stage-aware optimizer)
4. Objective functions comparison (ending wealth vs. spending vs. consumption)
5. Filing status transition / widow's penalty as active constraint
6. SS crowding out formula (Roth conversion interaction with SS provisional income)

*Research date: 2026-05-15. Full findings in ~/Documents/Hermes-Vault/wealthforge-roadmap/RESEARCH.md.*
