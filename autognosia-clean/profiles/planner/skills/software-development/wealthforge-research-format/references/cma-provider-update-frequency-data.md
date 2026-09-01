# CMA Provider Update Frequency Data (Updated: 2026-05-24)

## Provider Update Schedules

| Provider | Claimed Frequency | Last Update | Data Date | Staleness (as of May 2026) |
|----------|-------------------|-------------|-----------|----------------------------|
| BlackRock | Annual + quarterly BII | Feb 25, 2026 | Dec 31, 2025 | ~3 months |
| Vanguard | Quarterly (VCMM) + annual | Mar 31, 2026 | Mar 31, 2026 | ~0 months |
| J.P. Morgan | Annual (30th edition) | 2026 edition | N/A | ~0 months |
| PIMCO | Semiannual (5-year) | Sep 24, 2025 | Q3 2025 | ~8 months |
| AQR | Quarterly | Jan 14, 2026 | Late 2025 | ~4 months |
| Capital Group | Annual | 2026 edition | N/A | ~0 months |
| UBS | Annual | 2026 edition | N/A | ~0 months |
| Lombard Odier | Annual | Feb 2026 | N/A | ~3 months |
| Morgan Stanley | Annual | 2026 edition | N/A | ~0 months |
| Invesco | Annual | 2026 edition | N/A | ~0 months |
| PGIM | Quarterly | 2026 edition | Dec 2025 | ~5 months |
| Amundi | Annual | 2026 edition | N/A | ~0 months |
| **Dimensional** | Annual (Reality Check) | **Dec 20, 2024** | N/A | **~17 months** |

## Key Findings

- **Zero advisory platforms** (eMoney, MoneyGuidePro, RightCapital, eFront) monitor CMA update frequency
- **Dimensional Reality Check is 17 months stale** — the canonical example of the problem
- **Update frequency varies dramatically**: quarterly (AQR, PGIM), semiannual (PIMCO), annual (most others)
- **Several providers have no documented schedule**: Cohen & Steers, Goldman Sachs, BNY, State Street
- **Private markets CMAs** (Tamarix, Preqin, Cambridge Associates) need different staleness thresholds (12-18 months)

## Staleness Thresholds by Frequency

| Frequency | Staleness Threshold | Alert Trigger | Critical Threshold |
|-----------|---------------------|---------------|-------------------|
| Quarterly | 120 days | 100 days | 150 days |
| Semiannual | 210 days | 180 days | 270 days |
| Annual | 395 days | 365 days | 455 days |
| Irregular | N/A | >18 months | >24 months |

## Sources

- BlackRock Investment Institute CMA (blackrock.com/institutions/cma)
- Vanguard VCMM quarterly updates (corporate.vanguard.com/vemo)
- J.P. Morgan 30th Annual LTCMA
- PIMCO semiannual CMA (Sep 2025)
- AQR quarterly CMA (Jan 2026)
- Dimensional Reality Check (Dec 2024)
