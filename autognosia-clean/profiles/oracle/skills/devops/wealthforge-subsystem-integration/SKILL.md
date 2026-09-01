---  
name: wealthforge-subsystem-integration
category: devops
description: Standardized approach for integrating new subsystems into WealthForge AI platform while maintaining architectural consistency
---

## Overview
Standardized approach for integrating new subsystems into the WealthForge AI platform while maintaining architectural consistency.

## Trigger Conditions
Use this skill when:
- Adding a new major feature/module to WealthForge AI
- Integrating third-party APIs (banking, Twilio, email services)
- Creating new API endpoints for existing or new functionality
- Following the established architectural patterns

## Architecture Pattern

### 1. Directory Structure
```
backend/app/api/v1/
├── __init__.py              # Main v1 router (existing)
├── new_subsystem/
│   ├── __init__.py          # Subsystem router registration
│   ├── system.py            # Core business logic & services
│   ├── routes.py            # API endpoint definitions
│   ├── models.py            # Pydantic models (if needed)
│   └── [additional files]   # Domain-specific files
```

### 2. Core Components

#### system.py
- **Purpose**: Core business logic and service classes
- **Contents**:
  - Service classes for external integrations
  - Business logic engines
  - Data transformation utilities
  - Mock implementations for development
- **Example**: Banking API client, compliance engine, AI agent orchestrator

#### routes.py
- **Purpose**: FastAPI route definitions and endpoint handlers
- **Contents**:
  - All API endpoints for the subsystem
  - Request/response models (Pydantic)
  - Background tasks for async operations
  - Error handling and validation
- **Example**: Wire transfer routes, compliance checking endpoints, rebalancing proposals

#### __init__.py (subsystem)
- **Purpose**: Subsystem router registration
- **Contents**:
```python
from fastapi import APIRouter
from . import routes, system  # Import subsystem components

router = APIRouter(prefix="/api/v1/new-subsystem", tags=["new-subsystem"])
router.include_router(routes.router)

print("✅ New subsystem router registered")
```

### 3. Integration Steps

#### Step 1: Create Subsystem Directory
```bash
mkdir -p backend/app/api/v1/new_subsystem
cd backend/app/api/v1/new_subsystem
```

#### Step 2: Implement Core System Logic
Create `system.py` with service classes:
```python
class NewService:
    """Core service for new subsystem"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def process(self, data: dict):
        """Business logic implementation"""
        return {"result": "processed", "data": data}
```

#### Step 3: Define API Endpoints
Create `routes.py` with FastAPI endpoints:
```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .system import NewService

router = APIRouter()

class ProcessRequest(BaseModel):
    input_data: str
    config: dict = {}

@router.post("/process")
async def process_data(request: ProcessRequest):
    service = NewService()
    try:
        result = await service.process(request.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Step 4: Register Subsystem Router
Update `backend/app/api/v1/__init__.py`:
```python
from fastapi import APIRouter
from . import (
    auth,
    # ... existing imports ...
    new_subsystem  # NEW: Import your subsystem
)

router = APIRouter(prefix="/api/v1", tags=["api-v1"])

# Include all routers
router.include_router(auth.router)
# ... existing includes ...
router.include_router(new_subsystem.router)  # NEW: Include subsystem
```

#### Step 5: Update Main Application
Update `backend/app/main.py`:
```python
# New subsystem integration
try:
    from app.api.v1 import router as new_subsystem_router
    app.include_router(new_subsystem_router)
    logger.info("✅ New subsystem loaded")
except Exception as e:
    logger.warning(f"⚠️ New subsystem failed: {e}")
```

#### Step 6: Update Documentation
Update `STATUS.md`:
- Add new subsystem to "Key Features Completed" section
- Update completion percentage
- Document new API endpoints

### 4. Integration Patterns by Subsystem Type

#### Type A: External API Integration (Banking, Twilio, Email)
**Example**: Wire transfer system, call intelligence
- Create API client class in `system.py`
- Implement mock services for development
- Add real API integration later
- Include authentication/authorization handling

**Key Considerations**:
- Rate limiting and retry logic
- Error handling for API failures
- Data transformation between systems
- Background task scheduling for async operations

#### Type B: Business Logic Engine (Compliance, Billing, Analytics)
**Example**: Compliance engine, billing calculator
- Create rule engine class in `system.py`
- Implement validation and processing methods
- Add audit logging
- Include performance optimization (caching, batching)

**Key Considerations**:
- Rule configuration management
- Performance optimization
- Audit trail requirements
- Testing strategy

#### Type C: Data Processing Pipeline (CRM, Reports)
**Example**: CRM system, PDF report generation
- Create data processing classes in `system.py`
- Implement database integration
- Add background task queues
- Include data validation and sanitization

**Key Considerations**:
- Database schema changes
- Background processing
- Data consistency guarantees
- Performance at scale

### 5. Testing Strategy

#### Unit Tests
- Test service classes in isolation
- Mock external dependencies
- Test edge cases and error conditions

#### Integration Tests
- Test API endpoints with real service instances
- Verify database interactions
- Test authentication and authorization

#### End-to-End Tests
- Full workflow testing
- User journey validation
- Performance testing under load

### 6. Deployment Considerations

#### Environment Variables
- Add new variables to `.env.example`
- Document required configurations
- Include default values where appropriate

#### Docker Configuration
- Update `docker-compose.yml` if new services needed
- Add environment variables to service definition
- Configure health checks and dependencies

#### CI/CD Pipeline
- Add new tests to test suite
- Update deployment scripts
- Add health checks for new endpoints

### 7. Monitoring and Logging

#### Logging
- Use structured logging with appropriate levels
- Include context in log messages (user ID, request ID)
- Log errors with full stack traces

#### Metrics
- Track API endpoint performance
- Monitor business logic execution times
- Track error rates and types

#### Health Checks
- Add subsystem-specific health endpoints
- Include database connectivity checks
- Monitor external service health

### 8. Error Handling Pattern

```python
from fastapi import HTTPException, status

@router.post("/endpoint")
async def endpoint_handler(request: RequestModel):
    try:
        # Business logic
        result = await service.process(request)
        return result
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}"
        )
    except ServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_424_FAILED_DEPENDENCY,
            detail=f"Service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
```

### 9. Performance Optimization

#### Caching
- Use Redis for frequently accessed data
- Implement cache invalidation strategies
- Cache external API responses where appropriate

#### Background Processing
- Use FastAPI BackgroundTasks for async operations
- Consider Celery for complex background workflows
- Implement retry logic for failed tasks

#### Database Optimization
- Add appropriate indexes for new queries
- Use connection pooling
- Implement query optimization

### 10. Security Considerations

#### Authentication
- Use existing JWT authentication middleware
- Implement role-based access control (RBAC)
- Add permission checks for sensitive operations

#### Data Validation
- Validate all inputs using Pydantic models
- Sanitize database inputs
- Implement output encoding

#### External Integrations
- Store API keys in environment variables
- Use secret management for sensitive data
- Implement rate limiting for external APIs

### 11. Example: Payment System Integration

See the WealthForge AI payment system implementation for a complete working example:
- `backend/app/api/v1/payments/` - Full subsystem implementation
- `backend/app/main.py` - Integration into main application
- `STATUS.md` - Documentation updates

### 12. Troubleshooting

#### Router Not Loading
- Check import paths in `__init__.py`
- Verify Python package structure
- Check for circular imports
- Verify FastAPI router registration

#### API Endpoints Not Available
- Check prefix in subsystem `__init__.py`
- Verify router inclusion in `backend/app/main.py`
- Check CORS configuration
- Verify authentication requirements

#### Service Errors
- Check service class initialization
- Verify external API connectivity
- Review error logs for details
- Check environment variable configuration

## Related Skills
- `wealthforge-github-sync` - Syncing code to GitHub
- `wineandgecko-deployment` - Full deployment process
- `paperclip-integration` - External service integration patterns

## Tags
#weathforge-ai #integration-pattern #api-design #microservices #devops