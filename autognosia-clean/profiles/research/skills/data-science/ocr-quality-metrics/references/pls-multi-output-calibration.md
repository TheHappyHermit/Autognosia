# PLS2 Multi-Output Calibration for OSD Confidence

Research date: 2026-05-28. Source: WealthForge deep research run 756.

## Why PLS2 for Calibration?

When OSD confidence is augmented with cell-level features (not just raw score), PLS2 regression is the appropriate calibration method for multi-output accuracy targets.

### When to Use PLS2 vs Platt/Isotonic

| Scenario | Use |
|----------|-----|
| Single scalar accuracy target | Platt scaling (primary) or Isotonic (secondary) |
| Multi-output accuracy (horizontal, vertical, character, word) | PLS2 |
| Features include cell_area, text_density, DPI, document_type | PLS2 |
| Small dataset (<500 samples with features) | Platt scaling only |
| n_features > n_samples | PLS2 (handles this case) |
| Correlated features (dpi_estimate correlated with cell_area) | PLS2 (handles collinearity) |

## Feature Engineering for PLS Calibration

| Feature | Description | Expected Impact |
|---------|-------------|-----------------|
| raw_osd_score | Tesseract OSD confidence | Primary predictor |
| cell_area | Width x height of cell ROI (px) | Smaller cells → lower OSD confidence |
| text_density | Ratio of text pixels to total pixels | Higher density → more reliable OSD |
| dpi_estimate | Estimated scan DPI | Higher DPI → better OSD |
| document_type_encoded | One-hot: SEC/annual/tax/RFI/bank | Different types have different OSD behavior |
| orientation | Target orientation (0/90/180/270) | Some orientations have systematically different OSD |
| font_size_estimate | Estimated font size from cell geometry | Smaller fonts → lower OSD confidence |
| background_complexity | Variance of non-text regions | Complex backgrounds degrade OSD |
| skew_angle | Estimated deskew angle | Skewed text has different OSD behavior |

## PLS2 vs PLS3 Distinction

- **PLS2:** Multiple response variables (Y is a matrix). Used when calibrating accuracy for multiple dimensions simultaneously (orientation accuracy AND script accuracy AND character-level accuracy).
- **PLS3:** Three-way arrays (tensor data). Relevant if calibrating using 3D structures (confidence scores organized by document_type x orientation x DPI_level simultaneously).

For WealthForge, **PLS2** is primary.

## Two-Stage Calibration Architecture

```
Stage 1: Platt scaling
  raw_osd_score → calibrated_scalar_accuracy

Stage 2: PLS2 refinement
  (calibrated_scalar_accuracy, cell_features) → calibrated_accuracy_vector
    targets: [horizontal_accuracy, vertical_accuracy, character_accuracy, word_accuracy]
```

This is preferred over using raw OSD scores as PLS input because the Platt-calibrated score is already a better predictor than the raw unstandardized confidence.

## Cross-Validation Strategy

```
Stratified K-Fold (K=5):
- Stratify by: document_type x orientation x DPI_level
- Metrics: ECE, Brier Score, R-squared, coverage at 5%
- Optimize n_components by max R-squared on validation folds
```

## Model Selection Criteria

| Criterion | Platt | Isotonic | PLS2 |
|-----------|-------|----------|------|
| ECE (target) | < 3% | < 2% | < 2.5% |
| Brier Score (target) | < 0.02 | < 0.015 | < 0.018 |
| Sample efficiency | High (1K+) | Medium (5K+) | Medium (500+) |
| Smoothness | Smooth | Step function | Smooth |
| Multi-output | No | No | Yes |
| Extrapolation | Moderate | Poor (clipped) | Moderate |

## Red-Team Edge Cases

1. **OOD documents:** Detect via cell feature statistics (flag when features fall outside 3 sigma of training distribution)
2. **Extreme confidence scores:** Clip predictions to [0.01, 0.99]
3. **Tesseract version drift:** Implement drift detection — previously calibrated scores become invalid after version updates
4. **Calibration overfitting:** Require minimum 500 samples per document_type x orientation combo
5. **Calibration inversion:** Enforce monotonicity strictly; use PAVA with post-hoc check

## Competitive Landscape

**ZERO competitors implement multi-output calibrated confidence scores.** All major platforms (Google Document AI, AWS Textract, Azure Form Recognizer, Adobe, eMoney, RightCapital, Orion, TeamMate, Workiva) return raw/un-calibrated scores or none at all.

## Sources

- Abdi, H. (2007). "Partial Least Squares (PLS) Regression." Encyclopedia of Measurement and Statistics, SAGE.
- Wold, H. (1966). "Estimation of Principal Components and Related Models by Iterative Least Squares." Multivariate Analysis, Academic Press.
- NirPyResearch (2020). "Partial Least Squares Regression in Python." https://nirpyresearch.com/partial-least-squares-regression-python/
- mixOmics Documentation. https://mixomics.org/methods/spls/ — Sparse PLS for high-dimensional calibration.
- Guo, C. et al. (2017). "On Calibration of Modern Neural Networks." ICML 2017.
