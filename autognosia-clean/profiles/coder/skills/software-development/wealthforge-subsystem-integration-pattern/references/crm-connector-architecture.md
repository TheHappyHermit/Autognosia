# CRM Connector Architecture — External System Integration Pattern

**Context:** Researched 2026-05-17 as part of the WealthForge CRM Landscape deep-dive. This document captures the reusable 3-phase connector architecture for integrating external CRM systems (Redtail, Wealthbox, Salesforce FSC, Advyzon) into WealthForge.

## When to Use This Pattern

Use this pattern when WealthForge needs to:
- Read client data from an external CRM into its planning engine
- Write WealthForge-generated data (tasks, notes, activities) back to an external CRM
- Embed WealthForge widgets inside an external CRM interface
- Build a bridge between WealthForge and any external system with a REST API

## Core Principle: CRM-Agnostic Integration Layer

WealthForge does NOT build a native CRM. Instead, it becomes the "intelligence layer on top of any CRM." The CRM connector handles read/write/embed for each major CRM while WealthForge features (withdrawal optimizer, RMD agent, tax planner) work identically regardless of source system.

## Phase 1: Outbound Connectors (Read CRM Data)

**Purpose:** Ingest client data from CRM into WealthForge for planning and analysis.

### Canonical Data Schema (pull from any CRM, store in WealthForge)

```sql
CREATE TABLE crm_clients (
    client_id UUID PRIMARY KEY,
    crm_client_id VARCHAR(255),
    crm_source VARCHAR(50),       -- 'redtail', 'wealthbox', 'salesforce', 'advyzon'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    marital_status VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(20),
    household_id UUID,
    advisor_id UUID,
    service_tier VARCHAR(50),
    client_since DATE,
    risk_tolerance VARCHAR(50),
    last_sync TIMESTAMP,
    sync_status VARCHAR(20)       -- 'synced', 'pending', 'error'
);

CREATE TABLE crm_activities (
    activity_id UUID PRIMARY KEY,
    client_id UUID REFERENCES crm_clients(client_id),
    activity_type VARCHAR(50),    -- 'meeting', 'call', 'email', 'note', 'task'
    activity_date TIMESTAMP,
    summary TEXT,
    crm_source VARCHAR(50),
    last_sync TIMESTAMP
);
```

### Connector Interface (Abstract Base)

```python
class BaseCRMConnector(ABC):
    """Abstract base for all CRM connectors."""
    
    @abstractmethod
    async def get_client(self, crm_client_id: str) -> dict: ...
    
    @abstractmethod
    async def get_household(self, household_id: str) -> dict: ...
    
    @abstractmethod
    async def get_activities(self, client_id: str, since: datetime) -> list: ...
    
    @abstractmethod
    async def get_tasks(self, client_id: str, status: str = "open") -> list: ...
    
    @abstractmethod
    def sync_schema(self) -> dict:
        """Return field mapping from CRM-specific schema to canonical schema."""
```

### File Organization

```
src/integrations/crm/
├── __init__.py
├── base_connector.py               # Abstract connector interface (above)
├── redtail/
│   ├── connector.py                # Orion/Redtail API implementation
│   ├── auth.py                     # OAuth 2.0 flow
│   ├── models.py                   # Redtail-specific field mappings
├── wealthbox/
│   ├── connector.py
│   ├── auth.py
│   ├── models.py
├── salesforce/
│   ├── connector.py
│   ├── auth.py                     # OAuth 2.0 JWT Bearer
│   ├── models.py
├── advyzon/
│   ├── connector.py
│   ├── auth.py
│   ├── models.py
├── data_mapper.py                  # Canonical schema mapping engine
├── sync_scheduler.py               # Celery beat tasks for nightly sync
├── sync_monitor.py                 # Sync health dashboard backend
```

## Phase 2: Inbound Connectors (Write to CRM)

**Purpose:** Push WealthForge-generated data back to CRM, making WealthForge feel like a native part of the CRM.

### Write Operations

| Operation | Description | When Triggered |
|-----------|-------------|----------------|
| Task creation | "RMD review needed for client X" → CRM task | After RMD calculation |
| Activity logging | "Withdrawal optimizer run — $X savings identified" → CRM activity | After feature use |
| Note creation | "Tax projection completed" → CRM note | After analysis |
| Document linking | "Generated report Z" → CRM document | After report generation |
| Alert creation | "TLH opportunity detected" → CRM alert/warning | After market scan |

### Writeback Implementation

```python
def push_task_to_crm(crm_source: str, task_data: dict) -> dict:
    """Route task creation to the correct CRM."""
    connectors = {
        'redtail': RedtailConnector,
        'wealthbox': WealthboxConnector,
        'salesforce': SalesforceConnector,
        'advyzon': AdvyzonConnector,
    }
    connector = connectors[crm_source]()
    return connector.create_task(task_data)
```

## Phase 3: Widget Embedding (CRM Integration)

**Purpose:** Advisors see WealthForge data without leaving their CRM.

### Embedding Approaches by CRM

| CRM | Embedding Method | Implementation |
|-----|-----------------|----------------|
| Redtail/Orion | Custom tab via Orion Integration Platform | Orion plugin |
| Wealthbox | Custom side panel via Wealthbox App Framework | React SPA loaded in iframe |
| Salesforce FSC | Lightning Web Component (LWC) | LWC embedded in page layouts |
| Advyzon | Custom tab within Advyzon UI | Advyzon API partner integration |

### Embedded Widget Content

```
Client Summary Panel (embedded in CRM contact view)
├── WealthForge Plan Status: 🟢 On Track / 🟡 Review Needed / 🔴 Action Required
├── Key Metrics: Tax Alpha Achieved, Withdrawal Strategy, RMD Status
├── Quick Actions: [Run Withdrawal Optimizer] [Run Tax Projection] [Generate Report]
└── Alerts: RMD due in 30 days | TLH opportunity | IRMAA risk
```

## Red-Team Edge Cases for CRM Connectors

1. **Multi-CRM firms** — After M&A, a firm may run Redtail + Wealthbox + Salesforce simultaneously. Identity resolution engine needed to match clients across CRMs.

2. **API rate limits** — Each CRM has different quotas. Use exponential backoff, overnight bulk sync, and on-demand individual sync.

3. **Data quality** — CRMs accumulate stale data (old phone numbers, orphaned accounts). Data quality scoring per field. Staleness flags if >180 days.

4. **Schema drift** — CRMs add/rename/deprecate API fields. Automated API field discovery on sync. Version-pinned connector definitions.

5. **Permission boundaries** — Not all CRM data visible to all users. Pass-through OAuth scopes. Role-aware sync.

6. **System-of-record conflicts** — Who owns the canonical address? Configurable SOR per field category. Default: CRM owns contact data, WealthForge owns planning data, custodian owns position data.

7. **No-CRM solo advisors** — WealthForge internal client management (lite CRM mode) for solo shops.

## Related References

- `research-cron-knowledge-base` skill, RESEARCH.md for the full CRM Landscape 12-section entry (11 vendors analyzed, market share data, pricing, advisor sentiment)
- `wealthforge-subsystem-integration-pattern` SKILL.md for the base 3-file integration pattern (system.py, routes.py, dashboard.py)
