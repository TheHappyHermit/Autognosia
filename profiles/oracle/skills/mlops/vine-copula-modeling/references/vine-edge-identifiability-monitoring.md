# Vine Edge Identifiability Monitoring

## Purpose
Monitor identifiability at each bivariate pair-copula edge in a vine structure and track propagation of identifiability failure through the vine via conditional distribution contamination.

## Why It Matters
A non-identifiable edge corrupts the conditional CDFs that downstream edges depend on, creating cascading uncertainty. Edge-level diagnostics + propagation analysis prevents silent failure in treaty correlation modeling.

## Edge-Level Diagnostics

### 1. Profile Likelihood per Edge
- Compute profile likelihood L_e(θ) at 20 log-spaced points around θ̂_e
- Classify: IDENTIFIABLE (CI width < 30%), WEAK (30-60%), NON-IDENTIFIABLE (>60%)
- Flag edges where likelihood at CI boundary is within 1.92 log-units of peak

### 2. Edge-Specific Hessian Condition Number
- Compute Schur complement H_{-e} of full Hessian with respect to all edges except e
- κ(H_{-e}) >> κ(H) → edge e is a structural anchor
- Anchor edges require priority monitoring

### 3. Fisher Information Decomposition
- Marginal info: I_e = -∂²ℓ/∂θ_e² (diagonal element)
- Partial info: I_e|rest = 1/(I^{-1})_{ee} (Schur complement diagonal)
- Ratio I_e / I_e|rest < 0.3 → edge is highly dependent on other edges (warning sign)

### 4. Effective Sample Size per Edge
- n_eff,e = n × ∏_{c ∈ C_e} (1 - ρ̂²_{x_c, y_c | rest})
- n_eff,e < 30 → force Gaussian copula regardless of BIC preference

## Propagation Analysis

### Impact Score
impact(e) = identifiability_score(e) × |downstream(e)| / total_edges

- Build DAG: nodes = edges, edge e1→e2 if e2 conditions on variable output of e1
- Weight by fraction of conditioning set affected
- Find critical path from non-identified edge to leaf

### Propagation Risk Value (PRV)
PRV = Σ_e impact(e) × (1 - identifiability_score(e)) × depth_factor(e)

- depth_factor(e) = 1 + depth(e)/d
- PRV < 0.1: Low risk
- PRV 0.1-0.3: Medium — monitor closely
- PRV > 0.3: High — restructure vine or collect more data

### Parameter Correlation Propagation
- ρ_max(e) = max_{e'≠e} |σ_{e,e'}| / √(σ²_{e,e} σ²_{e',e'})
- ρ_max > 0.7 → correlation-critical: optimize edges jointly
- Use spectral clustering on correlation matrix to find optimization clusters

## Edge Model Selection Override
- Score > 0.7: Normal selection (SCG → Clayton/Gumbel → Gaussian)
- 0.4 ≤ Score ≤ 0.7: Skip SCG; Clayton vs Gumbel only
- Score < 0.4: Force Gaussian; log warning with recommended action

## Edge Cases
1. **Degenerate copula** (ρ=1, θ→∞): Replace with Gaussian θ=1, flag as "structural perfect correlation"
2. **Zero-annotation pairs**: Hierarchical borrowing from structurally similar treaties; Gaussian with wide CIs
3. **Near-circular conditioning**: |partial_corr| > 0.9 between two edges → diagnostics unreliable
4. **Truncation bias**: TB(e) = Σ_{e' beyond truncation} |ρ̂_{e,e'}| × |θ̂_{e'}| — if > threshold, diagnostics confounded

## Sources
- Aas et al. (2009) Pair-copula constructions of multiple dependence
- Dissmann et al. (2013) Selecting and estimating regular vine copulae
- Brechmann et al. (2012) Truncated regular vines in high dimensions
- Schepsmeier (2015) Efficient information based GoF tests for vine copulas
- Rump & Nagler (2025) Properties of stepwise parameter estimation in high-dimensional vine copulas (arXiv:2511.17291)
- Arbenz & Huser (2025) Dynamic Vine Copulas (arXiv:2605.03061)
- Czado (2019) Analyzing Dependent Data with Vine Copulas (Springer)
