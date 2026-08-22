# Block-Diagonal Approximation for Treaty Correlation Networks

## Problem
Treaty correlation matrices at scale (n=50-200 countries) are computationally expensive: O(n³) for Cholesky, O(n²) storage. Block-diagonal approximation exploits natural clusters (EU, Americas, Asia-Pacific) where intra-cluster correlations are strong but inter-cluster correlations are weak.

## Clustering Methods

### 1. Spectral Bisection (primary)
- Build adjacency graph from sparse precision matrix: Aᵢⱼ = |Ωᵢⱼ| if Ωᵢⱼ ≠ 0
- Compute graph Laplacian L = D - A
- Extract Fiedler vector (second smallest eigenvector of L)
- Recursive bisection until blocks reach target size (|Gᵢ| ≤ 20-25)
- Target: min-cut ratio < 5%

### 2. Louvain/Leiden Community Detection (for n > 100)
- Use |Ωᵢⱼ| as edge weights
- Optimize modularity: Q = (1/2m) Σᵢⱼ [Aᵢⱼ - (dᵢdⱼ)/(2m)] δ(cᵢ, cⱼ)
- Leiden guarantees well-connected communities (no isolated nodes)
- O(n log n) convergence vs O(n²) for Louvain

### 3. Domain-Knowledge Guided (baseline/fallback)
- Expert-defined groups (EU, Americas, Asia-Pacific, etc.)
- Refine with spectral clustering within each group
- Useful as prior or validation baseline

## Hub Node Handling
Treaties connecting multiple clusters (e.g., US with 100+ bilateral treaties) require special treatment:
- Identify via betweenness centrality or cross-block edge weight thresholds
- Keep in separate "hub layer" that updates with all blocks
- Apply Schur complement correction: Σ_cross_new = Σ_cross · (Σ_external)⁻¹ · Σ_crossᵀ
- For hubs with >3 significant cross-block edges, consider standalone block

## Performance Benchmarks

| Scenario | Dense Ops | Block-Parallel Ops | Speedup |
|----------|-----------|--------------------|---------|
| n=50, 5×10 | 125K | 5K | 25x |
| n=100, 10×10 | 1M | 10K | 100x |
| n=200, 10×20 | 8M | 80K | 100x |
| n=200, 20×10 | 8M | 20K | 400x |
| n=500, 25×20 | 125M | 200K | 625x |

Memory savings: n=200 → 90% reduction (320KB → 32KB + 1.6KB cross-block edges).

## Quality Metrics
- **Modularity Q**: >0.3 meaningful, >0.5 strong community structure. Target Q ≈ 0.40-0.60 for treaties.
- **Min-cut ratio**: <0.05. If >0.10, partition too coarse.
- **Approximation error ε**: ||Ω - Ω_approx||_F / ||Ω||_F. Target <0.05.
- **Block condition number κ**: <1000 for numerical stability.

## Degenerate Block Handling
- Minimum block size: 5 treaties. Merge smaller blocks with closest neighbor.
- If max off-diagonal <0.05 (near-identity), merge with nearest block.
- For blocks with <10 treaties, use Bayesian shrinkage toward identity.
- If block precision becomes non-PD, apply Higham's nearest PD algorithm.

## Block Evolution Monitoring
- Track modularity quarterly; re-cluster if Q drops below 0.3.
- Monitor cross-block edge growth; trigger re-partitioning if >10% YoY increase.
- Use "sticky" assignments: blocks persist ≥6 months even with slight Q degradation.
- Treaty amendment events trigger conditional re-estimation (reduced λ).

## Implementation Schema (key snippets)

```python
@dataclass
class TreatyBlock:
    block_id: str
    treaties: List[str]
    correlation_matrix: np.ndarray
    precision_matrix: np.ndarray
    hub_nodes: List[str]
    cross_block_edges: Dict[str, float]
    last_updated: datetime
    condition_number: float

def incremental_block_update(partition, changed_treaty, new_rate_data, alpha=0.1):
    """Update only affected block."""
    block = find_affected_block(partition, changed_treaty)
    block.correlation_matrix = (1-alpha)*old + alpha*empirical(new_rate_data)
    block.precision_matrix = graphical_lasso(block.correlation_matrix, block.lambda_reg)
    if block.cross_block_edges:
        block.precision_matrix += schur_correction(block, partition)
    if min_eig(block.precision_matrix) < 1e-10:
        block.precision_matrix = nearest_positive_definite(block.precision_matrix)
    block.vine_structure = build_vine_from_precision(block.precision_matrix)
```

## Sources
- Ames & Tarokh (2017) "Block-diagonal approximations for large-scale covariance estimation." IEEE Trans. Information Theory.
- Traag, Van Eck & Waltman (2019) "From Louvain to Leiden." Scientific Reports 9, 5233.
- Friedman, Hastie & Tibshirani (2008) "Sparse inverse covariance estimation with the graphical lasso." Biostatistics.
- Higham (2002) "Computing the nearest correlation matrix." IMA J. Numerical Analysis.
