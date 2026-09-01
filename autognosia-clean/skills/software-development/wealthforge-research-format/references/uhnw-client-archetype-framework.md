# UHNW Client Archetype Framework

Five ultra-high-net-worth (UHNW, >$10M net worth) client archetypes for WealthForge CMA template specialization. Each has distinct planning needs, trust structures, and competitive gaps that standard HNW/MNW templates miss.

## Archetype 1: Business Exit Founder

**Profile:** Sold/transitioned a business ($50M–$500M exit). Concentrated stock, massive capital gains event.
**Key needs:**
- Qualified Business Income (QBI) phase-out tracking post-exit
- Charitable extraction strategies (DAF, CRT, CRUT) for excess gains
- Trust funding for remaining assets (RLT, GRAT)
- Liquidity planning for estate tax vs. capital gains tradeoff
**WealthForge CMA modification:** Needs `concentrated_position` flag, QBI sunset tracking, charitable deduction optimization widget
**Competitive gap:** eMoney/RightCapital cannot model concentrated position risk; Addepar tracks it but has zero planning

## Archetype 2: Multi-Generation Family

**Profile:** 3+ generations, family office structure, complex trust web.
**Key needs:**
- Dynasty trust funding (GST exemption allocation)
- Inter-family gift strategy (annual exclusion + lifetime)
- Family governance framework (family constitution, investment committee)
- Succession planning for next-gen wealth transfer
**WealthForge CMA modification:** Multi-entity household model, generation-skipping tax model, family governance checklist widget
**Competitive gap:** Zero planning platforms handle GST planning; Addepar tracks family office assets but no planning

## Archetype 3: International Holder

**Profile:** Assets in multiple jurisdictions, foreign bank accounts, possible PPLI.
**Key needs:**
- FBAR/FATCA compliance tracking
- Foreign tax credit optimization
- Domicile planning (state + international)
- Cross-border estate planning (treaty considerations)
**WealthForge CMA modification:** Multi-currency portfolio model, foreign tax credit calculator, domicile optimization engine
**Competitive gap:** No domestic planning platform handles international tax; Addepar tracks but doesn't plan

## Archetype 4: Private Equity Investor

**Profile:** Significant PE/VC allocations, K-1 income, illiquid assets.
**Key needs:**
- PE J-curve modeling (capital calls vs. distributions timing)
- K-1 income estimation (critical for withdrawal planning)
- Illiquid asset liquidity timeline
- LP/GP fee structure impact on net returns
**WealthForge CMA modification:** `illiquid_asset_schedule` data model, K-1 income estimator, PE return waterfall calculator
**Competitive gap:** No planning platform models PE cash flow timing; Addepar reports PE positions but doesn't model cash flow

## Archetype 5: Philanthropic Builder

**Profile:** Active charitable giving, foundation/daf creation, legacy planning.
**Key needs:**
- Charitable remainder trust (CRT) modeling
- Donor-advised fund (DAF) contribution strategy
- Qualified charitable distribution (QCD) optimization
- Foundation vs. DAF comparison
**WealthForge CMA modification:** `charitable_strategy` module, CRT payout calculator, QCD timing optimizer
**Competitive gap:** RightCapital has basic DAF widget; no platform integrates CRT + QCD + DAF in unified planning

## Trust Types for UHNW Modeling

| Trust Type | Full Name | Key Feature | WealthForge Modeling Need |
|---|---|---|---|
| RLT | Revocable Living Trust | Avoids probate, grantor trust | Asset transfer tracking, step-up basis |
| ILIT | Irrevocable Life Insurance Trust | Removes life insurance from estate | Crummey notice tracking, premium schedule |
| SLAT | Spousal Lifetime Access Trust | Gift + retain access via spouse | Gift tax return, spousal income sharing |
| Dynasty Trust | Dynasty Trust | GST exemption, multi-gen | Generation-skipping tax allocation |
| GRAT | Grantor Retained Annuity Trust | Zero-out GRAT for appreciation | Annuity payment schedule, remainder calc |
| CRT | Charitable Remainder Trust | Income + charitable deduction | Payout rate, charitable remainder calc |
| QPRT | Qualified Personal Residence Trust | Home transferred at discount | Property valuation, retained term tracking |

## Critical UHNW-Specific CMA Factors

### Liquidity Constraint Factor
UHNW clients often have $50M+ in assets but only $5M in liquid investments (PE, illiquid real estate, private business). The CMA must weight withdrawal plans by **actual liquid assets**, not total net worth.

```
effective_asset_base = liquid_investments + (illiquid_assets × liquidity_multiplier)
# liquidity_multiplier: 0.3 for PE, 0.5 for real estate, 0.0 for private business
```

### Multi-Entity Tax Complexity
UHNW clients often have income across multiple entities (S-corps, partnerships, trusts). Withdrawal planning must model:
- Entity-level tax rates vs. individual rates
- K-1 income timing uncertainty
- State tax allocation across jurisdictions

### Trust-Dependent Distribution Triggers
Distribution schedules tied to trust terms (e.g., "health, education, maintenance, support" standard) create non-standard withdrawal patterns that standard CMA engines don't handle.

## Competitive Landscape

| Platform | UHNW Data Model | Planning Engine | Combined UHNW + Planning |
|---|---|---|---|
| Addepar | ✅ Full | ❌ None | ❌ No planning |
| eMoney | ❌ Limited | ✅ Strong | ❌ Cannot model trusts/PE |
| RightCapital | ❌ Limited | ✅ Strong | ❌ No dynasty/GST planning |
| Orion | ✅ Reporting | ❌ None | ❌ No planning |
| Financial Modeling Labs | ❌ Limited | ✅ Strong | ❌ No UHNW specialization |
| WealthForge | ✅ **White space** | ✅ **Target** | ✅ **Complete gap** |

**Key insight:** No existing platform combines UHNW data model (trusts, PE, multi-entity, international) with financial planning engine. This is the pure WealthForge opportunity.

## Sources
- Kitces.com: UHNW planning strategies (2025-2026)
- Preqin: Private equity market data and LP behavior
- ACTEC: Trust and estate planning guidelines
- SEC Marketing Rule (2019): Performance reporting for UHNW clients
- CFP Board Standards: Fiduciary requirements for complex client structures
