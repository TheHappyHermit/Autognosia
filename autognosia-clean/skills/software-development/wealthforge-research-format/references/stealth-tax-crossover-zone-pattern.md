# Stealth Tax / Crossover Zone Analysis Pattern

## What This Is

A generalizable analytical framework for taxes where the trigger is **indirect** — the transaction itself is not taxed, but it pushes other income into taxable territory. This pattern applies across multiple WealthForge features and must be recognized in every tax-related research run.

## The Core Insight

Many retirement taxes have a "crossover zone" — a range where:

1. The taxpayer has some income type A that IS directly taxable (e.g., investment income for NIIT)
2. The taxpayer has some income type B that is NOT directly taxable (e.g., IRA distributions for NIIT)
3. But income type B raises MAGI, which pushes income type A into taxable territory

In this zone, **every dollar of type B income costs the taxpayer the tax rate on type A income** — even though type B itself isn't taxed.

## Where This Pattern Applies

| Tax/Mechanism | Type A (directly taxed) | Type B (indirect trigger) | Threshold |
|---|---|---|---|
| **NIIT (3.8%)** | Net investment income (dividends, gains, interest) | IRA distributions, Roth conversions, pensions, SS | $200K/$250K MAGI |
| **Social Security taxation** | SS benefits (up to 85% taxable) | IRA distributions, Roth conversions, wages | $25K/$32K provisional income |
| **IRMAA (Medicare premiums)** | Part B/D premiums (up to $3,822/yr extra) | Roth conversions, RMDs, capital gains | $106K/$212K MAGI (2025) |
| **ACA premium tax credit** | Premium subsidy (cliffs at 400% FPL) | Roth conversions, capital gains, dividends | 400% FPL (~$51K/$104K) |
| **AMT exemption phaseout** | AMT exemption (28% phaseout rate) | All income types | ~$1.2M MFJ (2025) |
| **Child tax credit phaseout** | $2,000/child credit | All income types | $400K MFJ |
| **Senior deduction phaseout (OBBBA)** | $6K/person additional deduction | Roth conversions, RMDs, wages | $75K/$150K MAGI |

## The Three-Zone Framework

Every stealth tax has three zones. Identify them in every research run:

### Zone 1: SAFE
- MAGI is below the threshold
- No tax applies
- Additional type B income has zero stealth tax cost
- **Action:** Fill brackets freely up to the threshold

### Zone 2: CROSSOVER (the critical zone)
- MAGI is between threshold and (threshold + type A income)
- Each additional dollar of type B income pushes one dollar of type A income into taxable territory
- **Effective marginal rate = stated bracket + stealth tax rate**
- **Action:** Model the true marginal cost before recommending type B transactions

### Zone 3: FULL
- MAGI exceeds (threshold + type A income)
- All type A income is already fully taxed
- Additional type B income has zero stealth tax cost (type A is already maxed out)
- **Action:** Type B transactions are "cheaper" here than in the crossover zone

## How to Apply in Research

### Step 1: Identify the Threshold
Find the exact MAGI threshold. Is it indexed for inflation? If not, note the "bracket creep" effect — more taxpayers enter the zone each year.

### Step 2: Identify Type A and Type B Income
- Type A = what gets directly taxed (investment income, SS benefits, premium subsidies)
- Type B = what raises MAGI but isn't directly taxed (IRA distributions, Roth conversions, pensions)

### Step 3: Calculate the Crossover Ceiling
```
crossover_ceiling = threshold + type_A_income
```
This is the MAGI level at which all type A income is fully exposed.

### Step 4: Determine the Effective Marginal Rate
```
if MAGI < threshold:
    effective_rate = stated_bracket_rate  # No stealth tax
elif MAGI < crossover_ceiling:
    effective_rate = stated_bracket_rate + stealth_tax_rate  # CROSSOVER ZONE
else:
    effective_rate = stated_bracket_rate  # Full exposure, no additional marginal cost
```

### Step 5: Model the "Hidden Cost"
Show the dollar amount the client will pay that they don't expect:
```
hidden_cost = min(MAGI - threshold, type_A_income) * stealth_tax_rate
```

## Example: NIIT Crossover Zone (from 2026-05-15 research)

```python
def analyze_niit_crossover_zone(magi, net_investment_income, filing_status):
    threshold = NIIT_THRESHOLDS[filing_status]  # $250K MFJ
    magi_over = max(magi - threshold, 0.0)
    crossover_ceiling = threshold + net_investment_income

    if magi < threshold:
        zone = "safe"
        marginal_niit_rate = 0.0
    elif magi < crossover_ceiling:
        zone = "crossover"
        marginal_niit_rate = 0.038  # Each $1 of IRA withdrawal costs 3.8 cents
    else:
        zone = "full"
        marginal_niit_rate = 0.0  # All NII already taxed

    niit_exposure = min(magi_over, net_investment_income)
    return {
        "zone": zone,
        "niit_tax": round(niit_exposure * 0.038, 2),
        "marginal_niit_rate": marginal_niit_rate,
        "effective_bracket_adjustment": round(marginal_niit_rate * 100, 1)
    }
```

## Why This Pattern Matters for WealthForge

Every tax-related feature in WealthForge (Roth conversion optimizer, withdrawal sequencer, RMD planner, Social Security timing tool, ACA subsidy optimizer, IRMAA planner) must account for crossover zone effects. A Roth conversion that looks good at 22% bracket may actually cost 25.8% when NIIT is triggered, or 30%+ when IRMAA is also triggered.

**The combined marginal rate across multiple stealth taxes is the single most important number that no competitor shows.** WealthForge can differentiate by showing the TRUE marginal rate (bracket + NIIT + IRMAA + SS torpedo + deduction phaseout) in a single gauge.

## Research Checklist for Stealth Tax Topics

When researching any tax-related feature, always answer:

- [ ] What is the MAGI threshold? Is it indexed for inflation?
- [ ] What is type A income (directly taxed)?
- [ ] What is type B income (indirect trigger)?
- [ ] What is the crossover ceiling formula?
- [ ] What is the effective marginal rate in each zone?
- [ ] Does this tax interact with other stealth taxes (NIIT + IRMAA + SS torpedo)?
- [ ] What is the "hidden cost" in a typical client scenario?
- [ ] Does the existing codebase model the crossover zone or just the direct tax?