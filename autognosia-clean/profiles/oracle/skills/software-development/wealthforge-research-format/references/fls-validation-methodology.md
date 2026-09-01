# FLS Assessment Instrument Validation

Three-phase validation framework for the 10-question Financial Literacy Score (FLS) used in WealthForge's client sophistication tiering system.

## Three-Phase Validation

### Phase 1: Known-Group Validation
Compare FLS scores across groups with objectively different literacy levels:
- CFP/CFA charterholders (expected 8-10)
- CPA professionals (expected 7-9)
- Retail investors, 5+ years (expected 5-7)
- Recent college grads (expected 3-5)
- Workshop attendees (expected 4-6)
- **n ≥ 50 per group**, administer alongside ASK-Fin or SFIQ, compute Cohen's d for separation

### Phase 2: Outcome-Based Validation
Correlate FLS with actual client outcomes:
- **Engagement depth:** time-on-page, click-throughs, document downloads, return visits
- **Decision quality:** migration rate, migration satisfaction, advisor-rated quality
- **Behavioral:** panic-selling during drawdowns, plan adherence, retirement readiness
- **Stats:** logistic regression, ordinal regression, survival analysis, mixed-effects model
- **Expected effects:** r=0.30-0.45 on engagement, OR=0.60-0.75 on panic-selling

### Phase 3: Convergent/Discriminant Validation
Compare against established measures:
- **ASK-Fin** (gold standard): expected r=0.60-0.75
- **SFIQ** (self-assessed): expected r=0.40-0.55
- **TFIE** (scenario-based): expected r=0.50-0.65
- **Cohen/Prendergast** (basic literacy): expected r=0.35-0.50
- **Discriminant:** FLS should NOT correlate strongly with education (r<0.40) or age (r<0.30)

## Psychometric Benchmarks
- Cronbach's alpha >= 0.70
- Test-retest reliability r >= 0.70 (30-day interval)
- CVR >= 0.62 per Lawshe's method
- Convergent validity r >= 0.50 with established measures

## A/B Testing Framework
Compare FLS-based tiering vs AUM-based tiering across 1,000+ clients stratified by:
- AUM band ($<1M, $1-5M, $5-20M, $20-100M, >$100M)
- Age cohort (<35, 35-50, 50-65, 65-75, >75)
- Product complexity (Simple, Moderate, Complex)
- Tenure (<1yr, 1-3yr, 3-5yr, >5yr)

Primary metrics: engagement depth (+0.5 levels), decision quality (+0.3 points), satisfaction (+0.4 points), plan adherence (+8-12%), panic-selling (-30-40%).
Duration: 90-day primary test, 180-day recommended.

## Key Finding
Zero competitors implement financial-literacy-based client tiering. AUM conflates wealth with sophistication — the core WealthForge differentiator.
