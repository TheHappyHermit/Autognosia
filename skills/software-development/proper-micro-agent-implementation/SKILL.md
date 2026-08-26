---
name: proper-micro-agent-implementation
description: Guidelines for correctly implementing micro-agents as decision layers that call existing workflows rather than reimplementing workflow logic
category: software-development
---

# Proper Micro-Agent Implementation According to Specification

## Overview
This skill describes the correct approach to implementing micro-agents in the WealthForge AI system, based on the specification principle: "Every micro-agent in this system is designed so that the LLM makes exactly one decision per invocation: which tool to call with what parameters. The tool itself contains all the logic."

## Core Principle
Agents are **decision layers**, not workflow reimplementations. They should be thin wrappers that delegate actual workflow logic to existing services.

## Correct Agent Pattern (Decision Layer Wrapper)
1. **Validate and route input** (basic validation only)
2. **Make ONE LLM-based decision**: "Which tool/service to call with what parameters?"
3. **Call existing workflow/service** for the actual logic (the "tool" that contains all the logic)
4. **Handle agent-specific concerns**: compliance logging, supervision, routing
5. **Return results** in the standard agent format
6. **Be THIN**: Minimal business logic - focused on decision-making and delegation

## Evaluation Framework
To check if an agent is properly implemented, ask:
- Does it primarily: Validate input → Make LLM decision (which tool/params) → Call existing service → Format result? ✅ (Good)
- Or does it reimplement the service's workflow logic internally? ❌ (Bad)
- Where is the actual "heavy lifting" - in services or duplicated in the agent?

## Common Pitfalls to Avoid
1. **Workflow Duplication**: Reimplementing logic that already exists in services (e.g., duplicating `rebalancer.py` functions like `compute_drift`, `select_lots_for_sale`, etc. in an agent)
2. **Thick Agents**: Agents containing significant workflow implementation instead of just delegation
3. **Multiple Complex Decisions**: Agents making multiple complex determinations instead of one clear LLM decision about which tool to call

## Application Examples

### ✅ CORRECT: PortfolioRebalancerAgent as Thin Wrapper
```python
# GOOD: Agent calls existing rebalancer service
def _execute_internal(self, context: AgentContext) -> AgentResult:
    positions = self._get_positions(context)
    targets = self._get_targets(context)
    account = self._get_account_info(context)
    
    # ONE DECISION: Call the rebalancer service with appropriate parameters
    proposal = self.rebalancer_service.generate_proposal(
        portfolio_id=context.portfolio_id,
        account_id=context.account_id,
        positions=positions,
        targets=targets,
        account=account,
        triggered_by="agent_request"
    )
    
    # Handle compliance/logging/agent-specific concerns
    self._log_agent_event(context, "rebalance_proposal_generated", proposal)
    
    return AgentResult(
        success=True,
        data={"proposal": proposal}
    )
```

### ❌ INCORRECT: PortfolioRebarancerAgent Reimplementing Workflow
```python
# BAD: Agent reimplements rebalancer logic
def _execute_internal(self, context: AgentContext) -> AgentResult:
    positions = self._get_positions(context)
    targets = self._get_targets(context)
    
    # WRONG: Reimplementing drift calculation logic that should be in rebalancer.py
    total_value = sum(p.market_value for p in positions)
    # ... [20 lines of drift calculation logic] ...
    
    # WRONG: Reimplementing lot selection logic that should be in rebalancer.py
    lots = []
    # ... [30 lines of lot selection logic] ...
    
    # This violates the specification - the agent is doing the workflow logic
    return AgentResult(
        success=True,
        data={"proposal": self._build_proposal(positions, targets, drift, lots)}
    )
```

## Implementation Checklist
Before considering an agent complete, verify:
- [ ] Agent makes exactly one LLM decision: which tool/service to call with what parameters
- [ ] Actual workflow logic resides in existing services, not in the agent
- [ ] Agent validates input and routes to appropriate service
- [ ] Agent handles compliance logging, supervision, and agent-specific concerns
- [ ] Agent returns results in standard format
- [ ] Agent is THIN - focused on decision-making, not workflow implementation
- [ ] No duplication of service logic (check against `/backend/app/services/` files)

## When to Apply This Skill
- Creating new micro-agents in the WealthForge AI system
- Reviewing existing agent implementations for correctness
- Refactoring agents that inappropriately duplicate workflow logic
- Evaluating whether agent implementations follow the specification principle

## Related Concepts
- Determinism Ladder (80% rule-based engines, 20% LLM for language tasks)
- Service injection pattern (agents calling existing services like rebalancer, contact_manager, etc.)
- Compliance logging (SEC Rule 204-2, FINRA suitability, etc.)
- Agent event supervision and audit trails