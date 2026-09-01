# CSM Floor Proximity Monitoring — PPLI Carrier Health

## Domain: IFRS 17 CSM Monitoring for Bermuda PPLI Carriers

### Key Metrics

**CFPR (CSM Floor Proximity Ratio)** = CSM_sac / (Fulfillment_Cash_Flow + Risk_Adjustment)
- >25% = Green | 10-25% = Amber | 5-10% = Orange | <5% = Red (critical)

**CDR (CSM Decay Rate)** = (CSM_t - CSM_{t-1}) / CSM_{t-1} × annualized
- > -5%/yr normal | -5% to -15% elevated | < -15% rapid decay

**CFD (CSM Floor Distance)** = CSM_sac absolute (dollars to zero)

**SCCS (SAC Concentration Score)** = CSM_sac / CSM_carrier_total

### Alert Tiers
- **CRITICAL**: CFPR <5%, CDR < -20%, CFD < $100K → notify 4h, review 7d
- **HIGH**: CFPR 5-10%, CDR -15% to -20%, SCCS >25% + CFPR <15% → notify 24h
- **ELEVATED**: CFPR 10-25%, CDR -5% to -15%, CFPR decline >5pp/period → notify 48h
- **NORMAL**: CFPR >25%, CDR > -5% → quarterly review

### Data Sources (by availability)
BMA filings (high), SEC EDGAR (medium), carrier reports (medium), estimates (low)

### Competitive Landscape
Zero wealth platforms (eMoney, RightCapital, MoneyGuidePro, Addepar, Orion) monitor SAC-level CSM. Complete first-mover advantage for UHNW PPLI segment.

### Related Topics
- uhnw-01d-1a-1-2c-7e-4b-1a-5b (parent: SAC-Level CSM Aggregation Engine)
- uhnw-01d-1a-1-2c-7e-4b-1a-5b-2a (CFPR alert system)
- uhnw-01d-1a-1-2c-7e-4b-1 (DAC Impairment Monitoring)
- uhnw-01d-1a-1-2c-7e-4b-1a-5b-5 (Dual-Framework DAC+CSM Dashboard)
