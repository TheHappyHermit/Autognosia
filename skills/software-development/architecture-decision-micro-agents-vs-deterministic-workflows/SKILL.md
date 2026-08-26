---
name: architecture-decision-micro-agents-vs-deterministic-workflows
category: software-development
description: How to choose between pure micro-agent architectures and hybrid deterministic workflows with narrow LLM usage for financial advisory systems
---

# Architecture Decision: Micro-Agents vs. Deterministic Workflows

## Decision Context
When implementing AI-driven financial advisory systems, architects must choose between pure micro-agent architectures and hybrid deterministic workflows with narrow LLM usage.

## The Problem
The engineering specification called for 24 micro-agents, but the implemented system showed a different architecture with 80% rule engines and only 20% LLM usage.

## Analysis Process

### Step 1: Read the Specification
- 1,890-line engineering specification defining 24 micro-agents
- Each agent: trigger → LLM decision → tool call → result
- Communication via Redis/RabbitMQ bus
- Supervision via agent_events table

### Step 2: Review Implementation Status
- STATUS.md showed 52 live FastAPI routes covering portfolio rebalancing, CRM, analytics, compliance
- System already implemented as deterministic workflows, not agent-based
- Architecture follows "Determinism Ladder": 80% rule engines, 20% LLM for language tasks

### Step 3: Compare Approaches

**Pure Micro-Agents Approach:**
```
Trigger → LLM → JSON tool call → Deterministic function → Result
```
- Pros: Clear separation, easy to understand, fits "agent" metaphor
- Cons: Higher latency, more moving parts, harder to audit, more expensive

**Deterministic Workflows with Narrow Agents:**
```
Trigger → Rule Engine → Result
                   ↓
             (LLM on-demand for language tasks only)
```
- Pros: Faster, more auditable, lower cost, deterministic, better for financial systems
- Cons: Less "agentic", requires understanding of architecture philosophy

### Step 4: Apply Architecture Philosophy
The specification itself states:
> "Code is deterministic. Agents are narrow. LLMs are rats pushing buttons. Rust computes. Python orchestrates. The LLM only touches what code cannot handle."

This is the **Code-First, LLM-Last principle** from the spec itself.

## The Decision

**Chose the hybrid deterministic workflow approach** because:

1. **Regulatory Requirements**: Financial systems need audit trails, deterministic behavior, and explainability
2. **Performance**: Rule engines are 10-100x faster than LLM calls
3. **Cost**: LLM calls cost money; rule engines are free
4. **Reliability**: Deterministic systems don't hallucinate or fail unpredictably
5. **Compliance**: SEC/FINRA require "how did the AI reach this decision?" - easier with deterministic systems
6. **Architecture Alignment**: The specification's own philosophy supports this approach

## Implementation Pattern

### Where to Use Deterministic Workflows (Rung 1-4):
- Portfolio drift calculation
- Tax lot selection
- Wash sale detection
- Compliance rule checking
- VaR/CVaR calculation
- Monte Carlo simulation
- Portfolio optimization
- Report generation
- Fee calculation

### Where to Use Narrow LLM Micro-Agents (Rung 5-6):
- Email classification (urgency, topic, action required)
- Call summarization and transcription
- Meeting preparation briefings
- Research document analysis
- Client onboarding natural language intake
- Plain English explanations of complex financial concepts

### Architecture Components

```
Cron Jobs → Rule Engines → Database → API
  ↓
LLM Calls (on-demand, JSON schema constrained)
  ↓
Validation → Action → Audit Log
```

### Database Schema for Compliance
- `ai_explanation_payloads` table (SEC Rule 204-2 mandatory)
- `agent_events` table (FINRA Notice 24-09 supervision log)
- `portfolio_events` table (immutable ledger)
- All tables append-only with no-update rules

### Technology Stack by Rung

| Rung | Technology | When to Use | Example |
|------|------------|-------------|---------|
| 1 | Pure Rust (PyO3) | Numerical computation | Drift, VaR, tax lots |
| 2 | Python + Numba | Portfolio math | Monte Carlo inner loops |
| 3 | Python rule engine | Compliance, suitability | AML, Reg BI checks |
| 4 | Python + data pipeline | Report assembly | PDF generation |
| 5 | SLM (3-8B) + JSON | Single-step routing | Email classification |
| 6 | SLM (30B MoE) + JSON | Multi-step reasoning | Research analysis |
| 7 | Human | Final approval | Money movement, advice |

## Lessons Learned

1. **Always read both spec AND status docs** - they may tell different stories
2. **Architecture philosophy matters more than literal interpretation** - the "why" is more important than the "what"
3. **Financial systems need determinism** - auditors and regulators demand it
4. **LLMs are tools, not architects** - they should augment, not replace, deterministic systems
5. **The specification itself contained the answer** - it defined the architecture philosophy

## Reusable Patterns

### Pattern 1: Determinism Ladder Implementation
```python
class DeterminismLadder:
    def route_task(self, task_type: str, context: dict):
        if task_type in ["drift", "var", "tax_lots"]:
            return self._use_rust_engine(context)
        elif task_type in ["compliance", "suitability"]:
            return self._use_python_rule_engine(context)
        elif task_type in ["email_classification"]:
            return self._use_llm_agent(context, model="qwen3-8b")
        else:
            raise ValueError(f"Unknown task type: {task_type}")
```

### Pattern 2: Agent vs. Workflow Decision Matrix
```python
AGENT_DECISION_MATRIX = {
    # (requires_language_understanding, is_critical_for_compliance, latency_sensitive)
    "email_classification": (True, False, True),
    "call_summarization": (True, False, True),
    "portfolio_drift": (False, True, True),
    "tax_lot_selection": (False, True, True),
    "compliance_check": (False, True, True),
    "fee_calculation": (False, True, True),
    "research_analysis": (True, False, False),
}

def should_use_agent(task_name: str) -> bool:
    requires_lang, is_compliance, is_latency = AGENT_DECISION_MATRIX[task_name]
    # Use agent only if language understanding is required AND not compliance-critical
    return requires_lang and not is_compliance
```

### Pattern 3: LLM Call Wrapper with Validation
```python
class LLMAgent:
    def call_agent(self, prompt: str, schema: dict, max_retries: int = 3):
        for attempt in range(max_retries):
            try:
                response = self._call_llm(prompt)
                validated = self._validate_response(response, schema)
                if validated:
                    return validated
            except Exception as e:
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.1 * (attempt + 1))
        
    def _validate_response(self, response: str, schema: dict):
        # Use Pydantic or JSON schema validation
        try:
            parsed = json.loads(response)
            # Validate against schema
            return parsed
        except (json.JSONDecodeError, ValidationError) as e:
            raise ValueError(f"LLM output validation failed: {e}")
```

## Related Skills
- `the client platform-subsystem-integration-pattern` - for integrating new subsystems
- `financial-planning-tool-development-pattern` - for tax-aware financial tools
- `test-driven-development` - for implementing features with tests

## References
- STATUS.md (project status document)
- website_instructions (1,890-line specification)
- SEC Rule 204-2 (AI explanation requirements)
- FINRA Notice 24-09 (AI as supervised employee)
- "Code-First, LLM-Last" principle from specification

## Tags
#architecture #financial-systems #ai-agents #determinism #compliance #llm