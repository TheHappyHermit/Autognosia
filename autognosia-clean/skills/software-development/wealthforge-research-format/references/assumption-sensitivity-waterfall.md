# Assumption Sensitivity Waterfall — Reference

## Overview
Per-assumption dollar impact on sustainable spending — a WealthForge-native innovation. No existing wealth management platform surfaces this metric.

## Key Findings (from wps-02a research, 2026-05-21)

### Primary Sensitivity Rankings (on $1M portfolio, 4.5% withdrawal rate)
1. **Inflation** — #1 risk driver. +0.5% expected inflation = -$6,400/yr sustainable spending (16% of base). Most clients underestimate this.
2. **Equity Returns** — +1% = +$2,850/yr. 2.9x more sensitive than bonds.
3. **Bond Returns** — +1% = +$980/yr. Least sensitive of the three primary assumptions.
4. **Withdrawal Rate** — +0.5% = -$3,200/yr. Direct dollar-for-dollar impact.
5. **Sequence of Returns Risk** — Early negative returns cost 2-3x more than late negative returns.

### Interaction Effects
- High inflation + low equity returns amplifies individual risks by 20-30% above additive predictions.
- Each WPS methodology has a DIFFERENT sensitivity profile — VPW, 4% Rule, Vanguard Dynamic all respond differently to the same assumption changes.

### Architecture
- Pre-computed lookup table: 7 equity levels × 7 bond levels × 6 inflation levels = 294 entries.
- Real-time waterfall rendering in UI from lookup table (no runtime Monte Carlo).
- Quarterly recalibration required as CMA data changes — sensitivity factors become stale within months.

### WealthForge-Native Innovation Opportunities
- "Remaining tax-free LTCG capacity" as a primary metric (zero competitors do this)
- Per-assumption dollar sensitivity (zero competitors do this)
- Methodology-specific sensitivity profiles (zero competitors do this)
- Advisor bias detection in assumption selection (zero competitors do this)

## Sources
- Kitces.com retirement research on assumption sensitivity
- Blanchett retirement spending smile research
- Morningstar 2026 SWR studies
- Income Lab sensitivity feature documentation
- SSRN academic papers on retirement assumption uncertainty

## New Topics Discovered (wps-02a-1 through wps-02a-5)
- wps-02a-1: Withdrawal methodology-specific sensitivity profiles (HIGH)
- wps-02a-2: Dynamic sensitivity recalibration engine (HIGH)
- wps-02a-3: Client-facing "Assumption Risk Score" composite metric (MEDIUM)
- wps-02a-4: Historical scenario overlay for sensitivity factors (MEDIUM)
- wps-02a-5: Cross-assumption correlation sensitivity (HIGH)
