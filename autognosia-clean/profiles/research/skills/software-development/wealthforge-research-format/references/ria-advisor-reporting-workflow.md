# RIA Advisor Client Reporting Workflow

Domain knowledge for researching er-03 and related Employee-Roles topics on RIA reporting workflows.

## The Reporting Lifecycle

### Quarterly Performance Reporting
- **Standard workflow**: Pull custodian statements → aggregate in Orion/Black Diamond → generate branded PDFs → add commentary → batch-email → file compliance copy
- **Time investment**: 2-4 hours per client per quarter for high-touch RIAs; 400-800 hours/quarter for firms with 200+ clients
- **Automation level**: 90% data aggregation automated; 10% commentary/analysis manual
- **WealthForge gap**: No platform produces PPLI-specific performance metrics (subaccount-level returns, insurance cost drag, tax-deferred gain accumulation)

### Tax Reporting
- **Annual workflow**: 1099 aggregation, wash sale adjustments, cost basis calculation, state tax allocations, foreign asset reports, PPLI tax summaries
- **PPLI gap**: PPLI produces insurance company statements (not 1099s) — premium basis, death benefit, cash value, subaccount performance, insurance costs, surrender charges
- **Zero competitors** generate PPLI tax summaries integrated with standard tax packages
- **WealthForge advantage**: Direct access to PPLI policy data through broker-dealer processing

### Exit Tax Tracking (§877A)
- **For expatriate clients**: Mark-to-market valuation, deferred tax schedule, interest charge calculation, PPLI exclusion analysis, IRS compliance calendar
- **PPLI interaction**: Assets in PPLI pre-expatriation may be excluded from §877A deemed sale (owned by foreign insurance company)
- **Zero competitors** track exit tax compliance
- **WealthForge advantage**: Built-in exit tax tracking with PPLI exclusion analysis

## Competitive Landscape

| Feature | Orion | Black Diamond | Addepar | RightCapital | eMoney | WealthForge |
|---------|-------|--------------|---------|-------------|--------|-------------|
| PPLI subaccount performance | None | None | None | None | None | Full |
| PPLI tax summary | None | None | None | None | None | Full |
| Exit tax tracking | None | None | None | None | None | Full |
| Treaty-based tax reporting | None | None | None | None | None | Full |
| Cross-border FBAR tracking | Basic | Basic | Basic | None | None | Full |

## WealthForge Reporting Architecture

Six modules: R-01 (PPLI Policy Dashboard), R-02 (PPLI Tax Summary), R-03 (Exit Tax Tracker), R-04 (Cross-Border Tax Dashboard), R-05 (Quarterly Plan Update Generator), R-06 (Compliance Reporting Engine).

## Regulatory Considerations
- SEC Marketing Rule: PPLI performance must be net of all fees; tax-deferred gain cannot be presented as investment return
- FINRA Suitability (Rule 2111): Insurance costs must be disclosed and justified
- State insurance regulatory compliance: Multi-state PPLI reporting requirements
- IRS: Form 8606, 8938, FBAR, 5471, 8865 for PPLI clients; Form 8854 for expatriates

## Key Pitfalls
1. PPLI data comes from insurance company PDFs/emails/portals — not standard custodian APIs
2. Exit tax PPLI exclusion requires business purpose documentation for IRS defense
3. Treaty-based withholding varies 0-30% on dividends depending on insurer jurisdiction
4. PPLI subaccounts drift from target faster than traditional portfolios due to varying fee structures
