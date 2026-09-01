# Canonical Data Product Research Pattern

## What This Is

Some research runs produce not just a feature spec but an **actual reference database** that should seed production. The research output IS the data — tables of canonical pairs, 50-state matrices, classification taxonomies, risk scores. The engineering team should be able to `INSERT INTO` from your research file.

**Signs you're in a data-product run (not a feature-spec run):**
- The output has rows and columns (ticker A, ticker B, correlation, risk tier)
- You're classifying items into categories (same_index_different_issuer, different_segment)
- Each row carries metadata for audit/compliance (review date, basis, override policy)
- The output could be deployed as a `seed.sql` file

## Three-Layer Structure

### Layer 1: Taxonomy Layer
Define the classification system first — the categories and their definitions — before any data. Future agents need to understand WHY a pair is "moderate" not "aggressive."

Example from SI-01:
```
regulatory_basis taxonomy:
  1. same_index_same_issuer     → AVOID (clearly substantially identical)
  2. same_index_different_issuer → aggressive (gray zone — IRS has not ruled)
  3. different_index_same_segment → moderate (different index, same market segment)
  4. different_segment           → conservative (different index, different segment)
  5. direct_stock_replacement    → aggressive (individual stock swaps)
  6. factor_rotation             → moderate (different factor exposure)
```

### Layer 2: Data Layer
The actual rows. Every row needs:
- **Identifiers**: ticker pair, asset class, issuer, index tracked
- **Quantitative support**: correlation, overlap percentage (where available)
- **Classification**: regulatory basis, risk tier
- **Governance**: is_active, panel_review_date, panel_decision

Use markdown tables for readability with ~5-10 rows, then note the full version is in the appended research.

### Layer 3: Governance Layer
How the data product lives and changes over time:
- Annual review cadence
- New-item ingestion pipeline (e.g., new ETF detection)
- Firm-override mechanism (CCO-configurable overrides with version history)
- Change audit trail

## When to Use This Pattern

Use when the 12-section BUILD SPEC produces a multi-row classification table that will be directly seeded into production. Do NOT use for single-row config values (thresholds, constants, interest rates) or for pure algorithm descriptions.

Typical candidates:
- Security pair databases (TLH swaps, substantially identical pairs)
- 50-state tax/regulatory matrices (SS tax, estate tax, income tax conformity)
- Carrier comparison databases (life insurance, annuity, disability)
- Risk tier classification tables (portfolio risk, AML risk, compliance risk)
- Fee schedule and billing rule tables
- Factor exposure classification tables

## SQL Schema Pattern

```sql
-- Every data product needs at minimum:
-- 1. A canonical table with governance fields
CREATE TABLE <topic>_canonical (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- data fields specific to this product
    ticker_a TEXT NOT NULL,
    ticker_b TEXT NOT NULL,
    -- governance fields
    is_active BOOLEAN DEFAULT true,
    is_firm_override BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES advisors(id),
    reviewed_at DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(ticker_a, ticker_b)
);

-- 2. A firm-override table for CCO configuration
CREATE TABLE <topic>_firm_overrides (
    override_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID REFERENCES firms(id) NOT NULL,
    -- same data fields as canonical, override versions
    override_reason TEXT NOT NULL,
    approved_by UUID REFERENCES advisors(id),
    approved_at TIMESTAMPTZ DEFAULT now()
);

-- 3. A change log for SEC audit trail
CREATE TABLE <topic>_change_log (
    change_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    changed_field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES advisors(id),
    changed_at TIMESTAMPTZ DEFAULT now(),
    change_reason TEXT
);
```

## Worked Example: SI-01 Pair Database

See RESEARCH.md (SI-01, 2026-05-18) for the full 50+ pair database. Layer structure:

**Taxonomy** (Layer 1):
6 regulatory_basis types with explicit risk tier mapping and IRS ambiguity level

**Data** (Layer 2):
20 asset classes × 50+ pairs, each with correlation, overlap, issuer info

**Governance** (Layer 3):
- 4-table SQL schema (canonical + firm_overrides + change_log + new_etf_watchlist)
- Mandatory annual CCO review
- New-ETF classification within 30 days of launch
- 7 subtopics for continuous improvement (si-01-1 through si-01-7)

## Cross-References

- `canonical-data-model-research-pattern.md` — Use when the output is a schema/API spec, not populated data
- `novel-domain-research-pattern.md` — Use when researching a domain with zero existing software coverage (complementary: that pattern covers SOURCE discovery, this pattern covers OUTPUT format)
