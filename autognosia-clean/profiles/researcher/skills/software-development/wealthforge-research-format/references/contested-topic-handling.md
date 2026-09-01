# Contested Topic Handling — When Credible Sources Disagree

## Why This Matters

Wealth management research frequently encounters topics where prominent practitioners, academics, or data sources disagree materially. The widow's penalty (McQuarrie vs. QuantCalc), safe withdrawal rates (Bengen 4% vs. Morningstar 3.25-3.9% vs. Pfau safety-first), Roth conversion value (show-me-the-money skeptics vs. all-in optimizers), and Social Security claiming (break-even skeptics vs. delay advocates) all have credible voices on both sides.

**The failure mode:** citing only one side produces research that is either alarmist (ignoring counter-evidence) or dismissive (ignoring real pain points). Either extreme undermines trust in the research.

## Pattern: Contested Topic Resolution

### Step 1: Identify the Contradiction Early

During parallel research, if you encounter a source that directly contradicts the majority of your findings, do NOT ignore it. A single contrarian academic paper (McQuarrie, JFP Dec 2023) or practitioner analysis is a signal that the topic has nuance, not that the source is wrong.

**Diagnostic questions:**
- Is the contrarian argument from a credible source? (peer-reviewed journal, established researcher, recognized practitioner)
- Does it have citations and data, or is it opinion?
- Is the disagreement about magnitude (how big is the effect) or existence (does the effect exist at all)?
- Does the contrarian apply to a specific subset of the population? (e.g., McQuarrie's argument mainly holds for moderate-income retirees whose expenses fall proportionally)

### Step 2: Build BOTH Arguments Into the Research Entry

The research entry must present both sides fairly, not as a "he said / she said" but as a **scope analysis**:

| Component | How to Handle |
|-----------|---------------|
| **Section 4 (Sentiment)** | Quote both sides. Cite McQuarrie by name and paper title. Cite QuantCalc by name with their numbers. |
| **Section 10 (Red Teaming)** | The contrarian view belongs here as a first-class challenge. E.g., "Challenge 1: 'This will scare clients unnecessarily.'" |
| **Section 8 (Regulatory)** | Fiduciary duty means not over-recommending. If conversions cost money today for a benefit that may never materialize (both spouses die close together), the advisor needs to see the downside. |
| **Section 5 (Gap Analysis)** | Include the "When this doesn't matter" case — clients below the threshold where the penalty is real. |

### Step 3: Synthesize with a "WealthForge Take"

After presenting both sides, write a synthesis paragraph that:

1. **Identifies the boundary** — "McQuarrie's argument applies to moderate-income retirees (<$500K pre-tax IRA) whose expenses fall proportionally. For retirees with $1M+ in pre-tax IRAs, the penalty is real and action is warranted."
2. **States the resolution** — "WealthForge should handle both cases: flag when the penalty is material AND when it's insignificant (don't scare clients unnecessarily)."
3. **Prevents over-reaction** — "Present the penalty as a RANGE (best-case / expected / worst-case), not a single number, with clear mortality assumptions."

### Step 4: Embed in Red Teaming

Every contested topic must have a Red Teaming entry that addresses the contrarian position directly. The response should:
- Acknowledge the validity of the concern
- State WealthForge's specific mitigation
- Provide the threshold or boundary where the concern applies vs. doesn't

**Example (from Widow's Penalty research):**
> **Challenge 1: "This will scare clients unnecessarily."**
> Response: Present the penalty in context. Show it alongside both-spouses-live projection. McQuarrie (2023) argues the penalty is overstated when income falls proportionally. For clients with modest retirement savings (<$500K pre-tax IRA), the penalty is small and the "reassurance" scenario is more appropriate. For clients with $1M+ in pre-tax IRAs, the penalty is real and action is warranted. WealthForge should auto-classify: "Your exposure level is LOW/MODERATE/HIGH" — don't use a one-size-fits-all fear message.

### Step 5: Document the Boundary in Build Spec

In Section 6 (BUILD SPEC), the data model should include the toggle/classification that handles both sides:
```python
# Classification logic for contested topic
penalty_exposure = classify_exposure(
    pre_tax_ira_balance=client.pre_tax_ira,
    total_annual_spending=client.spending,
    ss_survivor_benefit=client.ss_survivor
)
# Returns: "LOW" (<$500K IRA, penalty <$20K lifetime),
#          "MODERATE" ($500K-$1M IRA, penalty $20K-$100K),
#          "HIGH" ($1M+ IRA, penalty $100K+)
```

## When Not to Use This Pattern

- **Settled science** — When the disagreement is only among non-credible sources (blog comments, social media). Rely on peer-reviewed research and practitioner surveys.
- **Regulatory minimum** — When one side is clearly illegal or prohibited by regulation. Don't present "some advisors think you can skip AML checks" as a valid alternative view.
- **Purely academic** — When the disagreement has no practical implication for WealthForge's build decisions. Don't add noise.

## Example: Widow's Penalty Research (May 2026)

See RESEARCH.md entry for "THE WIDOW'S TAX PENALTY" (2026-05-15, Run 12) for a worked example:
- Section 4 directly addresses McQuarrie as contrarian view
- Section 5 differentiates LOW/MODERATE/HIGH exposure
- Section 10 has a dedicated Red Teaming challenge for "will scare clients unnecessarily"
- Section 8 addresses fiduciary over-recommendation risk
- Build spec includes exposure classification logic
