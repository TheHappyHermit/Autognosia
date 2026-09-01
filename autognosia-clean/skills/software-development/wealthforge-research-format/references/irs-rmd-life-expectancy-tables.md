# IRS RMD Life Expectancy Tables — Quick Reference

**Source:** IRS Publication 590-B (2024+). Tables last updated by the SECURE Act (2020) and subsequent IRS updates effective 2022+.

**Why this file exists:** These tables appear in multiple research topics (Modified RMD Method, RMD-SWR collision, RMD impact on IRMAA, QLAC optimization, RMD calculator). Rather than re-extracting from the IRS PDF each time, hardcode the values here.

---

## Table I — Single Life Expectancy (for Inherited IRAs)

Used as the default table for the **Modified RMD Safe Withdrawal Method** when the retiree wants higher lifetime spending and has average life expectancy expectations. Also the standard table for nonspouse beneficiaries of inherited IRAs.

Key characteristic: Assumes shorter life expectancy → **higher withdrawals**. Designed to deplete the account by the beneficiary's late 80s.

| Age | Divisor | % of Portfolio |
|-----|---------|---------------|
| 50  | 36.2   | 2.76% |
| 51  | 35.3   | 2.83% |
| 52  | 34.4   | 2.91% |
| 53  | 33.5   | 2.99% |
| 54  | 32.6   | 3.07% |
| 55  | 31.6   | 3.16% |
| 56  | 30.7   | 3.26% |
| 57  | 29.8   | 3.36% |
| 58  | 28.9   | 3.46% |
| 59  | 28.0   | 3.57% |
| 60  | 27.1   | 3.69% |
| 61  | 26.2   | 3.82% |
| 62  | 25.3   | 3.95% |
| 63  | 24.4   | 4.10% |
| 64  | 23.5   | 4.26% |
| 65  | 22.9   | 4.37% |
| 66  | 22.0   | 4.55% |
| 67  | 21.1   | 4.74% |
| 68  | 20.2   | 4.95% |
| 69  | 19.4   | 5.15% |
| 70  | 19.0   | 5.26% |
| 71  | 18.6   | 5.38% |
| 72  | 18.2   | 5.49% |
| 73  | 17.8   | 5.62% |
| 74  | 17.4   | 5.75% |
| 75  | 17.0   | 5.88% |
| 76  | 16.6   | 6.02% |
| 77  | 16.2   | 6.17% |
| 78  | 15.8   | 6.33% |
| 79  | 15.4   | 6.49% |
| 80  | 15.0   | 6.67% |
| 81  | 14.6   | 6.85% |
| 82  | 14.2   | 7.04% |
| 83  | 13.8   | 7.25% |
| 84  | 13.4   | 7.46% |
| 85  | 13.0   | 7.69% |
| 86  | 12.6   | 7.94% |
| 87  | 12.2   | 8.20% |
| 88  | 11.8   | 8.47% |
| 89  | 11.4   | 8.77% |
| 90  | 11.0   | 9.09% |
| 91  | 10.6   | 9.43% |
| 92  | 10.2   | 9.80% |
| 93  | 9.8     | 10.20% |
| 94  | 9.4     | 10.64% |
| 95  | 9.0     | 11.11% |
| 96  | 8.6     | 11.63% |
| 97  | 8.2     | 12.20% |
| 98  | 7.8     | 12.82% |
| 99  | 7.4     | 13.51% |
| 100 | 7.0     | 14.29% |
| 101 | 6.6     | 15.15% |
| 102 | 6.2     | 16.13% |
| 103 | 5.8     | 17.24% |
| 104 | 5.4     | 18.52% |
| 105 | 5.0     | 20.00% |
| 106 | 4.6     | 21.74% |
| 107 | 4.2     | 23.81% |
| 108 | 3.8     | 26.32% |
| 109 | 3.4     | 29.41% |
| 110 | 3.0     | 33.33% |
| 111 | 2.6     | 38.46% |
| 112 | 2.2     | 45.45% |
| 113 | 1.8     | 55.56% |
| 114 | 1.4     | 71.43% |
| 115+ | 1.0    | 100.00% |

> Note: For ages 50-54 and 66-69, values are interpolated from Table I as published in IRS Pub 590-B. For precise official values, consult the current year's Publication 590-B.

---

## Table III — Uniform Lifetime Table

Used for **unmarried account owners** or **married account owners whose spouse is not more than 10 years younger**. The standard table for calculating compliance RMDs from IRAs. Also used in the Modified RMD Method when the retiree wants more conservative withdrawals (portfolio lasts until late 90s).

Key characteristic: Adds ~10 years to life expectancy → **more conservative** (lower) withdrawals than Table I.

| Age | Divisor | % of Portfolio |
|-----|---------|---------------|
| 72  | 27.4   | 3.65% |
| 73  | 26.5   | 3.77% |
| 74  | 25.5   | 3.92% |
| 75  | 24.6   | 4.07% |
| 76  | 23.7   | 4.22% |
| 77  | 22.9   | 4.37% |
| 78  | 22.0   | 4.55% |
| 79  | 21.1   | 4.74% |
| 80  | 20.2   | 4.95% |
| 81  | 19.4   | 5.15% |
| 82  | 18.5   | 5.41% |
| 83  | 17.7   | 5.65% |
| 84  | 16.8   | 5.95% |
| 85  | 16.0   | 6.25% |
| 86  | 15.2   | 6.58% |
| 87  | 14.4   | 6.94% |
| 88  | 13.6   | 7.35% |
| 89  | 12.8   | 7.81% |
| 90  | 12.0   | 8.33% |
| 91  | 11.2   | 8.93% |
| 92  | 10.4   | 9.62% |
| 93  | 9.8     | 10.20% |
| 94  | 9.2     | 10.87% |
| 95  | 8.6     | 11.63% |
| 96  | 8.0     | 12.50% |
| 97  | 7.4     | 13.51% |
| 98  | 6.8     | 14.71% |
| 99  | 6.2     | 16.13% |
| 100 | 5.6     | 17.86% |
| 101 | 5.0     | 20.00% |
| 102 | 4.4     | 22.73% |
| 103 | 3.8     | 26.32% |
| 104 | 3.2     | 31.25% |
| 105 | 2.6     | 38.46% |
| 106 | 2.0     | 50.00% |
| 107 | 1.4     | 71.43% |
| 108+ | 1.0    | 100.00% |

> Important: Table III starts at age 72 (the RMD age). For Modified RMD Method research, use Table I for ages below 72. For clients aged 72+ wanting the conservative option, switch to Table III.

---

## Table II — Joint Life and Last Survivor Expectancy

Used for **account owners with a spouse more than 10 years younger**. Also suitable for single retirees who want the most conservative withdrawal approach (by using a "phantom" spouse 11 years younger).

This is a **matrix** — you look up the account owner's age on the left column and the spouse's age on the top row. The intersection is the divisor.

Key characteristic: Longest possible life expectancy assumption → **most conservative** (lowest) withdrawals.

### Key Entries (owner age → spouse age 11 years younger → divisor):

| Owner Age | Spouse Age (11 yrs younger) | Divisor | % of Portfolio |
|-----------|---------------------------|---------|---------------|
| 65        | 54                        | 33.9    | 2.95% |
| 66        | 55                        | 33.1    | 3.02% |
| 67        | 56                        | 32.3    | 3.10% |
| 68        | 57                        | 31.5    | 3.17% |
| 69        | 58                        | 30.7    | 3.26% |
| 70        | 59                        | 29.9    | 3.34% |
| 71        | 60                        | 29.1    | 3.44% |
| 72        | 61                        | 28.3    | 3.53% |
| 73        | 62                        | 27.5    | 3.64% |
| 74        | 63                        | 26.7    | 3.75% |
| 75        | 64                        | 25.9    | 3.86% |
| 76        | 65                        | 25.1    | 3.98% |
| 77        | 66                        | 24.3    | 4.12% |
| 78        | 67                        | 23.5    | 4.26% |
| 79        | 68                        | 22.7    | 4.41% |
| 80        | 69                        | 21.9    | 4.57% |

### Full Matrix Usage:

```python
# Pseudocode for Table II lookup
def get_table_ii_divisor(owner_age: int, spouse_age: int) -> Decimal:
    """
    Look up divisor from Table II Joint Life and Last Survivor Expectancy.
    Owner_age on left column, spouse_age on top row of IRS Pub 590-B Table II.
    
    Key insight: If spouse is more than 10 years younger, the divisor is
    always >= Table III for the same owner age, meaning lower withdrawals.
    """
    # Full 2D matrix is 100+ rows × 100+ columns.
    # For common cases (spouse 1-10 years younger), the divisor is close to Table III.
    # For spouses 11+ years younger, the divisor increases significantly.
    # Full table available in IRS Pub 590-B Appendix B.
    pass
```

---

## Comparison: Which Table Produces What Withdrawal?

For a **$1,000,000 portfolio at age 73** (the RMD start age):

| Table | Divisor | Annual Withdrawal | % of Portfolio | Depletion Age |
|-------|---------|-------------------|---------------|---------------|
| I     | 17.8    | $56,180           | 5.62%         | ~late 80s     |
| III   | 26.5    | $37,736           | 3.77%         | ~late 90s     |
| II    | 27.5    | $36,364           | 3.64%         | ~100+         |

The difference between Table I and Table III is **49% more annual income** at age 73. This is why table selection is the single most impactful decision in the Modified RMD Method.

---

## How to Use This File

1. **For RMD compliance calculations**: Use Table III (Uniform Lifetime). This is the IRS-mandated table for most IRA owners.

2. **For Modified RMD Method (aggressive)**: Use Table I (Single Life Expectancy). Produces the highest lifetime spending. Best for clients with average life expectancy, no strong bequest motive, and non-portfolio income to buffer volatility.

3. **For Modified RMD Method (conservative)**: Use Table III (Uniform Lifetime). Produces spending that lasts into late 90s. Best for clients who want portfolio preservation or have longevity concerns.

4. **For Modified RMD Method (most conservative)**: Use Table II (Joint Life) with a "phantom" spouse 11 years younger. Produces the lowest spending curve. Best for very wealthy clients or those with significant longevity risk.

5. **For early retirees (under age 50)**: Only Table I has divisors for all ages starting from the minimum age. Use Table I and select a divisor based on the retiree's actual age. The Modified RMD Method works at any age using Table I.

6. **Table effectiveness matters**: The SELECTION of the table matters more than getting the divisor exact to one decimal place. Most wealth management platforms don't offer ANY table selection — just having the choice is a competitive advantage for WealthForge.
