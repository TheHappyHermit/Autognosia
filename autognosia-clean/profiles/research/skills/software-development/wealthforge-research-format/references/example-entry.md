# Example Entry — 12-Section Format

This is a worked example showing the 12-section template applied to a real WealthForge feature topic. Use this as a structural reference when writing your own entries.

---

## 2026-05-15 20:00 — Tax Lot Selection Algorithm

### 1. STRATEGY & CONTEXT (Industry Analysis)

The US capital gains tax code allows investors to choose WHICH specific shares they sell when disposing of a position — a technique called "tax lot selection." Most brokerages default to FIFO (First In, First Out), which is almost always the most tax-inefficient method because the oldest shares have the lowest cost basis and therefore the largest gain.

Better platforms (Schwab, Fidelity, Interactive Brokers) offer alternatives: LIFO, HIFO, and specific identification. However, NO consumer platform does true multi-position lot optimization — simultaneously picking the optimal combination of lots across multiple positions to achieve a goal (raise $X cash, rebalance to target weights) while minimizing total tax. The academic literature (Dammon, Spatt, Zhang 2001; Berndt et al. 2020) establishes the mathematical framework as a constrained optimization problem, but no commercial planning engine has implemented it as a user-facing feature.

### 2. THE PROBLEM (Plain English)

**Meet Dave.** He bought Apple at three different times:
- Lot A: 100 shares at $50 (cost basis $5,000) — bought 2019
- Lot B: 100 shares at $150 (cost basis $15,000) — bought 2021
- Lot C: 100 shares at $180 (cost basis $18,000) — bought 2023

Apple is now $200/share. Dave needs to sell 100 shares to raise $20,000.

**The wrong choice (FIFO):** Sells Lot A. $15,000 gain. Tax: **$2,250.**
**The right choice:** Sell Lot C. $2,000 gain. Tax: **$300.**
**The savings: $1,950 on one trade.** Over 30 years, this compounds to tens of thousands.

### 3. COMPETITIVE LANDSCAPE

| Platform | Lot Selection | Multi-Position Opt. |
|----------|--------------|---------------------|
| Schwab/Fidelity/IBKR | HIFO, LIFO, FIFO, Specific ID | No |
| Wealthfront/Betterment | Automated TLH across positions | Yes (TLH only) |
| M1 Finance | "Least tax impact" heuristic | Partial |
| RightCapital/eMoney | No lot-level control | No |
| **WealthForge (proposed)** | **Yes — multi-position optimizer** | **Yes** |

### 4. ADVISOR & CLIENT SENTIMENT

- **r/CFP (2025):** "Tax lot management is my #1 client conversation. There's no tool that does this automatically."
- **Bogleheads (2024):** "I keep a spreadsheet of all my tax lots. It's ridiculous that in 2024, I need Excel."
- **Kitces (2023):** "The tax lot selection problem is mathematically straightforward but operationally absent from every major planning platform."

### 5. WHAT WEALTHFORGE HAS / IS MISSING

```
WE HAVE: Tax lot data model, portfolio holdings, single-account TLH, substantially identical pairs table
WE'RE MISSING: Multi-position tax lot optimizer, rebalancing integration, comparison UI
```

### 6. BUILD SPEC

**Data inputs:** List of TaxLot objects (symbol, purchase_date, shares, cost_basis_total, current_price) + goal (target_cash, tax_bracket).

**Core logic:** Sort lots by tax efficiency (losses first, smallest gains next, short-term gains last). Pick in order until target reached.

**Output:** Selected lots with proceeds, total gain, total tax, and comparison to FIFO.

### 7. UI/UX

Advisor: Side-by-side comparison panel (FIFO vs. Optimal). Green/red highlight. "$1,950 Tax Saved" badge.
Client: Simplified "We saved you $1,950" message.

### 8. REGULATORY

- IRS Section 1012 (basis identification)
- SEC Rule 206(4)-7 (best execution fiduciary duty)
- Disclosure: "Consult your tax advisor"

### 9. ARCHITECTURE

**Agent A5 TaxLotOptimizer (Rung 1).** Triggered by RebalanceProposer. Adds lot_selections JSONB to trade_proposals table.

### 10. RED TEAMING

Wrong cost basis, wash sales, client behavior, partial share rounding, advisor overrides.

### 11. SOURCES

Dammon et al (2001), Kitces.com, IRS Pub 550, Schwab/Fidelity docs. 10+ sources.

### 12. NEW TOPICS

Direct indexing implications, tax bracket forecasting, charitable donation optimization.
