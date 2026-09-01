# Canonical Data Model Research Pattern

## When to Use This Pattern

Load this reference when the research agenda requires defining a **canonical data model** — a unified schema that must be synthesized from multiple existing platforms' data models. Signals:

- The topic mentions "data model," "schema," "canonical fields," or "system of record"
- The build spec requires defining what fields/tables a new WealthForge module needs
- The research involves comparing multiple platforms' API structures to find common patterns
- The topic is a cross-reference like XR-01-1 (Master Client Record) or any `mcr-*` entry

This pattern bridges feature research and infrastructure research — it produces a buildable SQL schema with field-level system-of-record assignments, not just a feature description.

## Research Methodology

### Round 1: Platform API Discovery (parallel)

Launch 4-8 simultaneous `web_search` calls targeting the data models of every major platform in the domain. For a wealth management data model, target:

| Platform Type | Example Systems | Search Pattern |
|--------------|----------------|----------------|
| CRM with wealth model | Salesforce FSC, Redtail, Wealthbox, Practifi | `"[platform] data model [object] fields schema"` |
| Custodial platforms | Schwab, Fidelity, Pershing, Altruist | `"[platform] API [account/position] data fields"` |
| Portfolio accounting | Orion, Tamarac, Black Diamond, Addepar, Advyzon | `"[platform] API data model [object] fields"` |
| Financial planning | eMoney, RightCapital, MGP, Income Lab | `"[platform] API [client/household/account] data schema"` |
| Industry standards | OpenWealth, FDX, ISO 20022 | `"[standard] API specification data model"` |
| Compliance platforms | Hadrius, RIA in a Box, ComplySci | `"[platform] API [client/compliance] fields"` |
| Billing systems | Orion Billing, BillFin, Advyzon Billing, SmartKx | `"[platform] billing fee schedule data model"` |

Search for specific objects the target schema needs. For a client data model: `"Person Account"`, `"FinancialAccount"`, `"Household object"`, `"PartyRelationshipGroup"`, `"Contact model"`.

**Key:** In a single parallel round, cast the widest net — you're looking for which platforms *have* a public data model documentation page, not reading details yet.

### Round 2: Schema Extraction (parallel)

From Round 1 results, identify the 5-8 most promising documentation pages. Extract them simultaneously via `web_extract`. For each platform, capture:

1. **Object names and their field lists** (e.g., Salesforce FSC: FinancialAccount has 50+ fields)
2. **Relationship model** (how objects connect: household → person → account → position)
3. **Required vs optional fields** (reveals what the industry considers mandatory)
4. **Field types and constraints** (string length, decimal precision, ISO codes)
5. **API endpoints and access patterns** (reveals sync feasibility)

**Note on Salesforce FSC docs:** Salesforce developer docs (`developer.salesforce.com`) and help docs (`help.salesforce.com`) often fail under `web_extract` due to redirects/login gates. Try these alternatives:
- Search for third-party summary articles (`minusculetechnologies.com`, `thetorontogroup.com`, `vantagepoint.io` blogs)
- Use `browser_navigate` for Salesforce docs when `web_extract` fails
- Search for Salesforce Trailhead modules on the topic (they have stable URLs)

**Note on custodial API docs:** Schwab Advisor Services, Fidelity Wealthscape, and Pershing NetX360 APIs often have login-gated developer portals. Public documentation is limited. For these:
- Search for integration partner documentation (RightCapital integration, Practifi integration, Wealthbox integration docs describe the data flow)
- Search for third-party data migration guides (Navirum blog, Minuscule Technologies blogs)
- Search for "File mapping" or "field mapping" guides that document the data format

### Round 3: Domain Identification

From the extracted schemas, identify the **canonical domains** that appear across all platforms. For wealth management, the core domains are:

```
DOMAIN 1: Client Demographics    (every platform has this)
DOMAIN 2: Household / Family     (FSC, Tamarac, planning platforms)
DOMAIN 3: Financial Accounts     (custodians, portfolio, billing)
DOMAIN 4: Positions & Holdings   (custodians, portfolio systems)
DOMAIN 5: Transactions           (custodians, portfolio systems)
DOMAIN 6: Financial Plan         (planning platforms)
DOMAIN 7: Compliance & KYC       (compliance platforms)
DOMAIN 8: Communications Log     (CRM, email, phone system)
```

Each domain has a **System of Record** — the one authoritative source:

| Domain | System of Record | Rationale |
|--------|-----------------|-----------|
| Client Demographics | CRM | Most frequently updated, client-facing |
| Household | Planning / CRM | Planning needs for household-level analysis |
| Accounts | Custodian | Legal ownership, trade activity |
| Positions | Custodian | Securities held — must match broker records |
| Transactions | Custodian | All money movement, cost basis |
| Financial Plan | Planning Platform | Plan is created and managed there |
| Compliance | Compliance Platform | Regulated process with audit trail |
| Communications | CRM | Advisor-client interaction record |

## Schema Synthesis Approach

### Step 1: Define Core Tables and Relationships

From the cross-platform analysis, define the entity-relationship model:

```
Household 1───N HouseholdMembers N───1 Client
Household 1───N Entity (trust, LLC, etc.)
Client 1───N AccountOwnership N───1 Account
Account 1───N Position
Account 1───N Transaction
Household 1───1 Plan
Client 1───1 ComplianceProfile
Household / Client 1───N Communication
```

### Step 2: Per-Table Field Definition

For each table, iterate through the platforms' field lists and:

1. **Union all fields** across platforms — create a superset
2. **Normalize field names** to a canonical naming convention (`snake_case`, descriptive names)
3. **Identify the authoritative source** for each field (which platform has the most trustworthy version)
4. **Define field types** using PostgreSQL/standard SQL types:
   - `VARCHAR(N)` for text with known max length
   - `TEXT` for unlimited text
   - `DECIMAL(18,2)` for currency amounts
   - `DECIMAL(18,6)` for quantities/securities
   - `DECIMAL(8,4)` for percentages
   - `DATE` for dates, `TIMESTAMPTZ` for timestamps
   - `JSONB` for flexible/complex structures
   - `UUID` for primary keys
   - `VARCHAR(3)` for ISO country codes
5. **Mark PII fields** for encryption (SSN, DOB, full address, phone)
6. **Define FK constraints** that enforce referential integrity

### Step 3: System-of-Record Registry Design

The SOR registry is the most important governance table — it defines which system is authoritative for each field. Design it as a separate table:

```sql
CREATE TABLE mcr_system_of_record (
    sor_id UUID PRIMARY KEY,
    field_name VARCHAR(100) NOT NULL,
    domain VARCHAR(30) NOT NULL,
    authoritative_system VARCHAR(50) NOT NULL,
    conflict_resolution_rule VARCHAR(30) DEFAULT 'authoritative_wins',
    sync_frequency VARCHAR(30),
    sync_method VARCHAR(30),
    is_read_only VARCHAR(30)
);
```

**Conflict resolution rules:**
- `authoritative_wins` — The declared SOR's value is truth. Always.
- `most_recent_wins` — Last update timestamp determines winner.
- `highest_value_wins` — For computed/aggregated fields (e.g., highest AUM count).
- `manual_resolve` — Route to human review queue (used only when auto-resolution is impossible or too risky, e.g., beneficiary discrepancies).

**Field-level assignment logic:**

| Field | SOR | Reason |
|-------|-----|--------|
| `legal_name` | CRM | Client provides it, advisor verifies |
| `ssn_last4` | CRM (onboarding) | Verified against ID document once |
| `primary_address` | CRM (client-provided) | Subject to change, CRM most current |
| `mailing_address` | Custodian | Form of record for statements, tax forms |
| `phone, email` | CRM | Most frequently updated by CSA |
| `account_number, type` | Custodian | Legal ownership record |
| `balance, positions` | Custodian | Actual holdings — must match broker |
| `cost_basis` | Custodian | IRS Form 1099-B source, verified by broker |
| `beneficiaries` | Custodian (legal) / Estate Plan (intent) | Dual SOR: legal form = actual, estate doc = intended. Discrepancy = alert. |
| `risk_tolerance` | Compliance Platform | Regulated assessment with dated record |
| `fee_schedule` | Signed Advisory Agreement | Legal contract |
| `plan_goals` | Planning Platform | Where plan is modeled |
| `monte_carlo_results` | WealthForge Engine | Computed, not imported |
| `kyc_status` | Compliance Platform | AML-regulated process |

### Step 4: UI Widget Design for Data Management

Every canonical data model needs at minimum three UI widgets (designed in prose with ASCII mockups):

**Widget 1: Data Health Dashboard (for COO / Ops Manager)**
- Overall health score (0-100) as the headline number
- Per-domain health breakdown (cards with color coding)
- Discrepancy list grouped by severity (Critical / Warning / OK)
- Each discrepancy row: client name, field, System A value, System B value, authoritative source, action button
- "Sync Now" button for individual fields, "Sync All" for batch
- Auto-refreshed daily (manual refresh button)

**Widget 2: Client Completeness Gauge (for Advisor / CSA)**
- Appears on the client record page
- Shows completion percentage by domain
- Color-coded field-by-field grid with status icons (✅ synced, ⚠️ differs, ❌ missing, 🔴 expired)
- Each missing/expired field has an action button to fill or update
- "Sync All" button that triggers propagation to all connected systems

**Widget 3: One-Click Propagation Button**
- Appears after any field edit
- Shows count: "Push to All Systems (N)"
- Modal: list of target systems with status (Done, Pending, Form Required)
- Progress bar during propagation
- "Close" button — does NOT auto-dismiss

See the MCR entry in EMPLOYEE-ROLES-RESEARCH.md for complete ASCII mockups of all three widgets.

### Step 5: Red-Team Data Governance Decisions

Every data model research entry must include 6-8 failure modes. Standard failures for canonical data models:

| Failure Mode | Scenario | Mitigation |
|-------------|----------|------------|
| Stale data conflicts | Two systems updated same field simultaneously | Optimistic locking + version history. Last-writer-wins with audit trail |
| Propagation failure cascade | CRM API is down, MCR updated locally | Write-ahead log with retry queue (exponential backoff 1s → 24hr). Escalate after 24hr |
| Beneficiary drift | Estate plan updated but custodian never changed | Monthly beneficiary discrepancy report + P1 alerts for any mismatch |
| Data quality spiral | Initial load has errors that propagate everywhere | Read-only pilot (30d) → reconcile-only (30d) → limited propagation (30d) → full auto-prop |
| GDPR/CCPA erasure conflict | Client requests deletion but some systems must retain data | Soft-delete + field anonymization. Not all fields deletable. Custodian data out of WealthForge control |
| Unbounded data growth | Transaction history grows 10M+ rows for 500-client firm | Partition by year. Tiered storage: NVMe→SSD→HDD→S3 archive |
| Identity collision | Two clients with matching partial identifiers | SSN hash is never sole criterion. Multi-factor matching with confidence thresholds |

### Step 6: Propagation Patterns by Connector Type

Document how the MCR pushes/pulls data from each type of source system:

| Connector Type | Examples | Propagation Method |
|----------------|----------|-------------------|
| Full API (read + write) | Salesforce FSC, Redtail, Wealthbox, Altruist | REST/gRPC write; retry with backoff; confirmation read-back |
| Read-only API (no write) | Schwab, Fidelity, Pershing, Orion, eMoney | Scheduled polling; data pulled into MCR; no write-back |
| Flat file upload | Pershing netX360, some billing systems | Generate pre-formatted file; manual upload portal or SFTP |
| Form generation | Beneficiary changes at most custodians | Generate pre-filled PDF/HTML forms with instructions |
| Manual entry portal | Any system without API | Display instructions and pre-filled web form targets |
| No integration | Legacy systems | MCR serves as authoritative source; no write-back |

## When NOT to Use This Pattern

- When the topic is a pure feature with no data infrastructure component (use the standard 12-section format)
- When the topic is a specific algorithm or calculation (use the standard 12-section format with BUILD SPEC emphasis)
- When the topic is an employee role analysis (use `wealthforge-employee-role-research` skill)
- When the schema needed is trivial (<5 tables, <50 fields) — just write it inline in the BUILD SPEC section

## Related Reference Files

- `references/12-section-template.md` — Standard template; this pattern replaces sections 6-9 with data-model-specific content
- `references/cross-role-xr-research-pattern.md` — For XR topics that span multiple roles; this data model pattern is the sub-research method when the XR topic is data-focused
- `wealthforge-employee-role-research` — For the software inventory (section 3 of employee role), this pattern provides the "what fields does each system store" methodology

## Example: MCR Session

See the complete MCR research entry in EMPLOYEE-ROLES-RESEARCH.md (`2026-05-16 10:00 — XR-01-1: Master Client Record (MCR) Canonical Data Model` — 12 sections, 9-domain SQL schema, 8 red-team edge cases, 3 UI widgets, 22 sources). This session followed this exact pattern and produced:

- 9 PostgreSQL tables with full field definitions, FK constraints, indexes
- System-of-record registry with per-field authoritative source assignments
- 6 connector type classifications
- 8 failure modes with mitigations
- 3 widget designs with ASCII mockups
- 7 new subtopics (mcr-01 through mcr-07) added to AGENDA.md
