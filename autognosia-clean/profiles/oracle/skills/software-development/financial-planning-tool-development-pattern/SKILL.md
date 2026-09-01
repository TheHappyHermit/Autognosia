---
name: financial-planning-tool-development-pattern
category: software-development
description: Reusable pattern for building tax-aware financial planning tools with composite scoring, scenario comparison, and IRS/regulatory compliance checking.
created: 2026-04-21
last_updated: 2026-04-21
---

## Overview
Reusable pattern for building tax-aware financial planning tools with composite scoring, scenario comparison, and IRS/regulatory compliance checking.

## Use Cases
- Social Security claiming strategy optimization
- Required Minimum Distribution (RMD) calculations
- Asset location optimization for tax efficiency
- Tax bracket analysis
- College savings planning
- Estate planning tools
- Any tax-aware optimization problem

## Core Components

### 1. Tax-Aware Optimization Engine
```python
class FinancialPlanningOptimizer:
    def __init__(self):
        self.scoring_weights = {
            'benefit_amount': 0.40,
            'tax_efficiency': 0.25,
            'risk': 0.15,
            'break_even': 0.10,
            'timing': 0.10
        }
    
    def _calculate_composite_score(self, strategy, client_data):
        """Calculate weighted composite score for optimization"""
        score = 0.0
        for metric, weight in self.scoring_weights.items():
            score += self._get_metric_score(strategy, metric, client_data) * weight
        return round(score, 2)
```

### 2. Scenario Comparison System
```python
async def compare_strategies(self, strategy1_id, strategy2_id):
    """Compare two optimization strategies"""
    result1 = await self.calculate_strategy(strategy1_id, client_data)
    result2 = await self.calculate_strategy(strategy2_id, client_data)
    
    comparison = {
        'metric1_difference': result1['metric1'] - result2['metric1'],
        'metric2_difference': result1['metric2'] - result2['metric2'],
        'recommended': 'Strategy 1' if result1['score'] > result2['score'] else 'Strategy 2'
    }
    return comparison
```

### 3. IRS/Regulatory Compliance Checking
```python
class ComplianceChecker:
    def check_compliance(self, accounts, current_year):
        """Validate regulatory compliance"""
        compliance_report = {
            'compliant_accounts': 0,
            'non_compliant_accounts': 0,
            'total_shortfall': 0.0
        }
        
        for account in accounts:
            required = self._calculate_required_amount(account)
            taken = account.get('distribution_taken', 0)
            
            if abs(required - taken) > 0.01:  # Allow rounding
                compliance_report['non_compliant_accounts'] += 1
                compliance_report['total_shortfall'] += required - taken
            else:
                compliance_report['compliant_accounts'] += 1
        
        compliance_report['compliance_rate'] = (
            compliance_report['compliant_accounts'] / len(accounts)
        ) if accounts else 0
        
        return compliance_report
```

### 4. Portfolio-Level Analysis
```python
async def portfolio_analysis(self, portfolio_data):
    """Analyze entire portfolio across multiple tools"""
    results = {
        'social_security': await self.ss_optimizer.optimize(portfolio_data),
        'rmd': await self.rmd_calculator.calculate(portfolio_data),
        'asset_location': await self.asset_optimizer.optimize(portfolio_data)
    }
    
    # Calculate overall portfolio efficiency
    portfolio_score = self._calculate_portfolio_score(results)
    
    return {
        'results': results,
        'portfolio_score': portfolio_score,
        'recommendations': self._generate_recommendations(results)
    }
```

## API Design Best Practices

### Endpoint Structure
```
GET    /api/v1/financial-planning/ss/optimize      - Optimize SS claiming
POST   /api/v1/financial-planning/ss/compare       - Compare two strategies
GET    /api/v1/financial-planning/ss/strategies    - List all strategies
GET    /api/v1/financial-planning/ss/stats         - Get statistics

GET    /api/v1/financial-planning/rmd/calculate    - Calculate RMD
POST   /api/v1/financial-planning/rmd/multi        - Multi-account RMD
GET    /api/v1/financial-planning/rmd/compliance   - Check compliance

POST   /api/v1/financial-planning/asset/optimize   - Optimize asset location
POST   /api/v1/financial-planning/asset/compare    - Compare scenarios
GET    /api/v1/financial-planning/asset/efficiency - Portfolio efficiency
```

### Request Models (Pydantic)
```python
class OptimizationRequest(BaseModel):
    current_age: int = 60
    expected_lifespan: int = 85
    marital_status: str = "single"
    current_income: float = 100000.0
    tax_bracket: float = 0.24
    health_status: str = "average"
    filing_year: int = None
    retirement_age: int = 65

class StrategyComparisonRequest(BaseModel):
    strategy1_id: str
    strategy2_id: str
```

### Response Models
```python
class OptimizationResponse(BaseModel):
    client_profile: dict
    recommended_strategies: list
    total_strategies_evaluated: int
    optimal_strategy: dict

class StrategyDetailsResponse(BaseModel):
    strategy_id: str
    primary_claim_age: int
    expected_benefit: float
    tax_efficiency_score: float
    risk_score: float
    composite_score: float
```

## Integration Pattern

### 1. Module Structure
```
backend/app/api/v1/financial_planning/
├── __init__.py              # Router registration
├── ss_optimizer.py          # Social Security tool
├── rmd_calculator.py        # RMD calculator
├── asset_location.py        # Asset location optimizer
└── routes.py               # API endpoints
```

### 2. Main.py Integration
```python
# Financial Planning Suite
try:
    from app.api.v1.financial_planning import router as financial_planning_router
    app.include_router(financial_planning_router)
    logger.info("✅ Financial Planning Suite loaded")
except Exception as e:
    logger.warning(f"⚠️ Financial Planning Suite failed: {e}")
```

### 3. Error Handling Pattern
```python
@router.post("/optimize")
async def optimize(request: OptimizationRequest):
    try:
        result = await optimizer.optimize_for_client(request.dict())
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {str(e)}"
        )
```

## Testing Strategy

### Unit Tests
```python
def test_optimization_engine():
    optimizer = SocialSecurityOptimizer()
    result = optimizer.optimize_for_client({
        "current_age": 62,
        "expected_lifespan": 85,
        "marital_status": "married"
    })
    assert len(result["recommended_strategies"]) == 5
    assert result["optimal_strategy"]["composite_score"] > 80
```

### Integration Tests
```python
async def test_api_endpoints():
    # Test all API endpoints
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/financial-planning/ss/optimize", json=request_data)
        assert response.status_code == 200
```

## Performance Considerations

### Caching Strategies
```python
class OptimizerCache:
    def __init__(self):
        self.cache = {}
    
    async def get_cached_result(self, key):
        if key in self.cache:
            return self.cache[key]
        result = await self.calculate(key)
        self.cache[key] = result
        return result
```

### Batch Processing
```python
async def batch_optimize(self, client_requests: list):
    """Optimize multiple clients efficiently"""
    tasks = [self.optimize_for_client(req) for req in client_requests]
    return await asyncio.gather(*tasks)
```

## Documentation Pattern

### STATUS.md Updates
```markdown
## Financial Planning Suite (Phase 3 Complete)

### Social Security Optimizer
- 9,000+ claiming strategies
- 6 filing types supported
- Health-adjusted life expectancy
- Composite scoring (benefit, tax, risk, timing)

### RMD Calculator
- IRS Uniform Lifetime Table compliant
- Multi-account support
- Tax withholding optimization
- Compliance checking

### Asset Location Optimizer
- 6 asset classes with tax profiles
- Tax-efficient placement
- Scenario comparison
- Portfolio efficiency scoring
```

## Lessons Learned

1. **Composite Scoring Matters**: Multiple factors (benefit amount, tax efficiency, risk, timing) must be weighted appropriately for realistic recommendations

2. **Health Adjustments**: Life expectancy modeling significantly impacts optimization results

3. **Tax Bracket Awareness**: Different tax treatments for different asset classes drive optimal allocations

4. **Regulatory Compliance**: Always build compliance checking into financial tools

5. **Scenario Comparison**: Clients want to see "what if" scenarios before making decisions

6. **Portfolio-Level View**: Tools should provide holistic recommendations, not just individual calculations

## When to Use This Pattern

✅ Use when building:
- Retirement planning tools
- Tax optimization strategies
- Investment allocation tools
- Regulatory compliance systems
- Any optimization problem with multiple competing objectives

❌ Avoid when:
- Simple calculations with no optimization
- Tools requiring real-time market data (different pattern needed)
- Systems without tax implications

## Related Skills
- `wealthforge-subsystem-integration-pattern` - Integration best practices
- `test-driven-development` - Testing financial tools
- `api-schema-reconciliation` - API design validation