---  
name: wealthforge-subsystem-integration-pattern  
category: software-development  
description: Proven pattern for integrating new subsystems into WealthForge AI platform
---

# Modular Subsystem Integration Pattern

## Overview
This skill documents the proven approach for integrating new subsystems into the WealthForge AI platform, successfully used for Phase 1 (Payment System) and Phase 2 (Call Intelligence).

## Trigger Conditions
Use this pattern when:
- Adding a new major feature/system to WealthForge AI
- Integrating third-party APIs
- Creating new API endpoints following existing conventions
- Building dashboard components for new features

## Pattern Structure

### 1. File Organization (3-file pattern)
```
backend/app/api/v1/
├── {subsystem_name}/
│   ├── __init__.py              # Router aggregation
│   ├── system.py                # Core business logic
│   ├── routes.py                # API endpoints
│   └── dashboard.py             # Dashboard/analytics endpoints (optional)
```

### 2. system.py - Core Logic
**Responsibilities:**
- Initialize system components
- Implement business logic methods
- Handle external integrations
- Maintain state
- Provide clean interface for routes

**Example structure:**
```python
class SystemHandler:
    def __init__(self):
        # Initialize clients, state
        self.state = {}
    
    async def process_data(self, input_data: dict) -> dict:
        # Business logic
        pass
```

### 3. routes.py - API Endpoints
**Responsibilities:**
- Define FastAPI routes with validation
- Handle errors properly
- Use BackgroundTasks for async processing
- Return appropriate status codes

**Example structure:**
```python
router = APIRouter(prefix="/api/v1/{subsystem_name}", tags=["{subsystem_name}"])

class RequestModel(BaseModel):
    field1: str
    field2: int

@router.post("/endpoint")
async def endpoint_handler(request: RequestModel, background_tasks: BackgroundTasks):
    try:
        result = await system_handler.process(request)
        background_tasks.add_task(process_async_task, result)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 4. dashboard.py - Analytics (Optional)
**Responsibilities:**
- Provide summary statistics
- Historical data aggregation
- Performance metrics

### 5. __init__.py - Router Aggregation
```python
from fastapi import APIRouter
from . import system, routes, dashboard

router = APIRouter()
router.include_router(routes.router)
router.include_router(dashboard.router)
```

### 6. main.py Integration
**Add to main.py:**
```python
try:
    from app.api.v1.{subsystem_name} import router as subsystem_router
    app.include_router(subsystem_router)
    logger.info("✅ {Subsystem Name} loaded")
except Exception as e:
    logger.warning(f"⚠️ {Subsystem Name} router failed: {e}")
```

**Update section header:**
```python
# {Subsystem Name} - Phase {X}
```

## Integration Checklist

- [ ] Create subsystem directory with 3-4 files
- [ ] Implement core logic in system.py
- [ ] Add API endpoints with validation
- [ ] Include background task support
- [ ] Add error handling
- [ ] Integrate into main.py
- [ ] Update STATUS.md
- [ ] Commit and push

## Common Pitfalls

- File corruption during patching → Restore from git
- Router organization issues → Use proper __init__.py files
- Background task failures → Add error handling in tasks

## Files Modified
```
backend/app/main.py              - Add import
backend/app/api/v1/{subsystem}/  - New files
STATUS.md                        - Update completion
```

## Related Skills & References

- `research-cron-knowledge-base` for the full WealthForge research methodology that discovered many of these patterns
- See `references/crm-connector-architecture.md` for the external-system connector pattern (3-phase: outbound read → inbound writeback → widget embedding). Use this when integrating WealthForge with any external CRM, custodian, or planning platform that has a REST API.

**Created:** 2026-04-22  
**Last Updated:** 2026-05-17 (added CRM connector reference)

## Extended Pattern (Phases 3-5)

### Phase 3: Financial Planning Suite
**New pattern:** Multi-component financial planning tools with composite scoring

**File Organization:**
```
backend/app/api/v1/financial_planning/
├── __init__.py              # Router aggregation
├── ss_optimizer.py          # Social Security Optimizer (9,000+ strategies)
├── rmd_calculator.py        # Required Minimum Distribution Calculator
└── asset_location.py        # Asset Location Optimizer
```

**Key Features:**
- Composite scoring algorithms (40+ factors)
- Scenario comparison tools
- IRS/regulatory compliance checking
- Tax-aware optimization
- Multiple calculation methods per component

### Phase 4: Research & Investment Tools
**New pattern:** Dual-system integration with shared data models

**File Organization:**
```
backend/app/api/v1/research/
├── __init__.py              # Router aggregation
├── fundamental_analysis.py  # Financial statement processing
└── esg_scoring.py           # ESG scoring engine
```

**Key Features:**
- Weighted scoring across multiple dimensions
- Sector-specific benchmarks
- Automated analyst notes generation
- Comparison tools between companies
- Mock data generation for testing

### Phase 5: Micro-Agents System
**New pattern:** 24 independent AI agents with standardized interface

**File Organization:**
```
backend/app/api/v1/micro_agents/
├── __init__.py              # Router aggregation
├── portfolio_optimizer/      # Agent 1
│   ├── __init__.py
│   └── agent.py
├── risk_assessment/         # Agent 2
│   ├── __init__.py
│   └── agent.py
└── ... (22 more agents)
```

**Key Features:**
- Dataclass-based result structures
- Behavioral profiling integration
- Risk factor analysis with mitigation strategies
- Composite scoring across multiple dimensions
- Standardized API interface for all agents

## Updated Integration Checklist (Phases 3-5)

### Phase 3: Financial Planning
- [ ] Create financial_planning directory
- [ ] Implement 3+ components with shared scoring logic
- [ ] Add composite scoring algorithms
- [ ] Include IRS compliance checking
- [ ] Add scenario comparison tools
- [ ] Integrate into main.py
- [ ] Update STATUS.md with detailed feature list

### Phase 4: Research & Investment
- [ ] Create research directory
- [ ] Implement dual-system (Fundamental + ESG)
- [ ] Add sector-specific benchmarks
- [ ] Include automated analyst notes generation
- [ ] Add company comparison tools
- [ ] Integrate mock data generation
- [ ] Integrate into main.py
- [ ] Update STATUS.md

### Phase 5: Micro-Agents
- [ ] Create 24 agent directories
- [ ] Implement standardized agent interface
- [ ] Use dataclasses for results
- [ ] Include behavioral profiling
- [ ] Add risk factor analysis
- [ ] Implement composite scoring
- [ ] Integrate all agents into main.py router
- [ ] Update STATUS.md

## New Learnings & Best Practices

### 1. Composite Scoring Pattern
```python
# Instead of simple averages, use weighted scoring
weights = {
    "factor1": 0.35,
    "factor2": 0.30,
    "factor3": 0.35
}

total_score = sum(score * weights[factor] for factor, score in scores.items())
```

### 2. Dataclass Results
```python
# Standardize result structures across components
@dataclass
class AnalysisResult:
    score: float
    recommendations: List[str]
    risk_level: str
    notes: List[str]
```

### 3. Sector-Specific Benchmarks
```python
# Load industry-specific benchmarks
benchmarks = {
    "Technology": {"pe_ratio": 28.5, "roe": 0.22},
    "Energy": {"pe_ratio": 12.5, "roe": 0.14}
}
```

### 4. Error Handling Pattern
```python
try:
    from app.api.v1.{subsystem} import router as subsystem_router
    app.include_router(subsystem_router)
    logger.info("✅ {Subsystem Name} loaded")
except Exception as e:
    logger.warning(f"⚠️ {Subsystem Name} router failed: {e}")
```

### 5. Status Tracking Pattern
```markdown
## Engineering Specification Compliance
- **Specification Location**: `/home/josh434/.hermes/website_instructions` (1,890 lines)
- **Current Completion**: ~95% of specification implemented
- **Phases Completed**: 5/8

### Phases Completed:
✅ Phase 1: Payment & Wire Transfer Infrastructure (100%)
✅ Phase 2: Call & Email Intelligence (100%)
✅ Phase 3: Financial Planning Suite (100%)
✅ Phase 4: Research & Investment Tools (100%)
✅ Phase 5: Micro-Agents System (100%)
```

## Files Modified Across All Phases
```
backend/app/main.py              - Add imports for each phase
backend/app/api/v1/              - New subsystem directories
STATUS.md                        - Update completion percentage
.gitignore                       - Add new dependencies
```

**Updated:** 2026-04-22  
**Status:** ✅ Extended and proven across 5 phases