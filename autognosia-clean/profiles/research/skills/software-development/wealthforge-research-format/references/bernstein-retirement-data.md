# William Bernstein — Key Retirement Data

## The Retirement Calculator from Hell (5-Part Series, 1998-2004)

| Part | Title | Year | Core Thesis | URL |
|------|-------|------|-------------|-----|
| I | The Retirement Calculator from Hell | Sep 1998 | Sequence-of-returns risk via coin-toss analogy; 1966-1995 acid test (S&P real return = 0% 1966-1982); fixed inflation-adjusted vs fixed-percentage withdrawal comparison; 4% rule; "Alpo diet" | http://efficientfrontier.com/ef/998/hell.htm |
| II | The Retirement Calculator From Hell — Part II | Winter 2001 | Monte Carlo simulation tables for retirement (first practitioner-facing MC guide); Old Paradigm (7% stocks) vs New Paradigm (4.5% stocks) success rate tables by withdrawal rate (4-7%) and allocation; variance drag explanation | http://www.efficientfrontier.com/ef/101/hell101.htm |
| III | Eat, Drink, and Be Merry | Fall 2001 | **The 80% ceiling**: "any estimate of long-term financial success greater than about 80% is meaningless"; 40-year success probability table; institutional/geopolitical risk | http://www.efficientfrontier.com/ef/901/hell3.htm |
| IV | A Nation of Wal-Mart Greeters | Winter 2003 | Demographic crisis: worker-to-retiree ratio 3:1→1.5:1 by 2050; retirement age must rise to 73; "Coconut Island" analogy; median 401(k) for 60-64yos was $25K | http://efficientfrontier.com/ef/103/hell4.htm |
| V | The Unhappy Implications of the Easterlin Hypothesis | 2004 | Hedonic treadmill: relative wealth matters, not absolute; 2%/yr societal growth requires savings to grow 2% real; "save 1/3 of salary for 40 years" rule; get off the hedonic treadmill | http://www.efficientfrontier.com/ef/403/hell5.htm |

## Key Numerical Benchmarks from the Series

### 30-Year Success Rates (Old Paradigm — Stocks 7%, Bonds 2.5%)
| Portfolio | 4.0% WR | 5.0% WR | 6.0% WR | 7.0% WR |
|-----------|---------|---------|---------|---------|
| 100% Stocks | 98.7% | 93.4% | 81.0% | 63.3% |
| 50/50 | 99.6% | 91.4% | 61.2% | 24.9% |
| 100% Bonds | 87.2% | 33.4% | 3.7% | 1.3% |

### 30-Year Success Rates (New Paradigm — Stocks 4.5%, Bonds 3.5%)
| Portfolio | 4.0% WR | 5.0% WR | 6.0% WR | 7.0% WR |
|-----------|---------|---------|---------|---------|
| 100% Stocks | 88.8% | 70.4% | 48.0% | 28.3% |
| 50/50 | 98.2% | 80.1% | 41.3% | 12.0% |

### 40-Year Success Probabilities ($1M, 4.5% real, 10% std)
| Monthly Withdrawal | 40-Year Success |
|-------------------|-----------------|
| $5,000 | 30% |
| $4,500 | 46% |
| $4,000 | 63% |
| $3,500 | 78% |
| $3,000 | 90% |
| $2,500 | 97% |
| $2,000 | 99.5% |

## Core Concepts

**Sequence-of-Returns Risk (Part I):** The order of returns matters as much as the average. Two portfolios with identical 30-year average returns can have dramatically different outcomes depending on whether bad years come early or late.

**The Coin-Toss Analogy (Part I):** "If you are unlucky enough to roll 15 straight tails before rolling 15 straight heads, you can withdraw only $18,600 per year. Reverse the process and roll the 15 heads followed by 15 tails, and you can withdraw $248,600 per year."

**The 80% Ceiling (Part III):** Monte Carlo probabilities above ~80% are mathematically suspect because they assume institutional and political continuity for centuries. "History teaches us that depriving ourselves to boost our 40-year success probability much beyond 80% is a fool's errand."

**The 1966-1995 Acid Test (Part I):** S&P returned exactly inflation (6.81%) from 1966-1982 — real return was ZERO for 17 years. A retiree in 1966 following the 4% rule would have seen catastrophic portfolio damage.

**Liability-Matching Portfolio (LMP):** From *The Investor's Manifesto* (2010) and White Coat Investor interviews. Rule: 20-25x residual living expenses in safe assets (TIPS, SPIAs, short-term bonds). Everything above can go in risky assets. "Stop when you win the game."

**Bernstein's 1/3 Rule (Part V):** Work 40 years (20-60), retire 20 years (60-80) → save 1/3 of salary. Retire at 50 → save 1/2 of salary.

**"If You Can" Formula (2014):** 15% savings rate + 3-fund portfolio (US total stock, ex-US total stock, US total bond) + behavioral discipline. Free 16-page PDF: https://www.etf.com/docs/IfYouCan.pdf

## Books by Bernstein

| Title | Year | Focus |
|-------|------|-------|
| The Intelligent Asset Allocator | 2000 | MPT, efficient frontier, diversification |
| The Four Pillars of Investing (2nd ed. 2023) | 2002/2023 | Financial theory + history + psychology + portfolio construction |
| The Investor's Manifesto | 2010 | LMP framework, "stop when you win the game" |
| The Ages of the Investor | 2012 | Life-cycle investing: accumulation → preservation → decumulation |
| If You Can (free PDF) | 2014 | Minimalist retirement investing for millennials |

## LMP Builder Algorithm (For Coding)

```
Input: essential_expenses (dict), social_security (float), pensions (list), portfolio_total (float), tips_yield (float 0.02), spia_rate (float 0.0584)

1. residual_expense = essential_expenses - (social_security + sum(pensions))
2. floor_capital = residual_expense * 25  # Bernstein's 25x
3. risk_portfolio = portfolio_total - floor_capital
4. if risk_portfolio < 0: WARNING — underfunded for safe floor
5. Safe floor: TIPS ladder + SPIA + cash buffer (1-5yr expenses)
6. Risk portfolio: 100% equities (no additional bonds)

Output: { safe_floor_amount, risk_portfolio_amount, floor_construction, risk_construction, lmp_score }
```

## Key White Coat Investor Resources
- Episode #450 (Nov 2024): "When You Win the Game, Stop Playing — Bill Bernstein Interview" — https://www.whitecoatinvestor.com/when-you-win-the-game-stop-playing-with-bill-bernstein-450/
- "Bernstein Says Stop When You Win the Game" — https://www.whitecoatinvestor.com/bernstein-says-stop-when-you-win-the-game/

## Competitive Landscape Summary
No existing planning tool implements all of Bernstein's insights. See RESEARCH.md entry (2026-05-16) for the full 8-tool comparison table against 7 Bernstein criteria.
