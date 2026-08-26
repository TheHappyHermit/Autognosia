# Canonical Data Model Research Format

Use this 14-section format when researching cross-domain data model / architecture topics for WealthForge (or similar RIA platforms). This format is designed for topics like mo-05-2 (Canonical Wealth Management Data Model), mo-05-1 (RIA Data Platform), and XR-01 subtopics (MCR, propagation engine, etc.).

## When to Use

- Researching a canonical data model, enterprise schema, or unified data layer
- Designing the "single source of truth" for an RIA platform
- Analyzing cross-domain entity relationships (party, account, position, transaction, etc.)
- Researching identity resolution, system-of-record conflict resolution, or data governance
- Comparing existing data model standards (Salesforce FSC, OpenWealth, FDX, ISO 20022)

## Section Template

### 1. STRATEGIC & BUSINESS CONTEXT
Why does this data model matter? What business problem does it solve? Quantify the cost of NOT having it (hours wasted, compliance risk, decision quality erosion). Frame as a strategic opportunity, not a technical exercise.

### 2. THE PROBLEM: N Points of Semantic Dissonance
List each specific class of data conflict between systems (identity, household, account type, position representation, transaction categories, valuation timing, fee schedules, regulatory fields). Each dissonance should describe:
- What two (or more) systems disagree on
- Why it matters (real-world impact)
- How the canonical model resolves it

### 3. EXISTING STANDARDS & REFERENCE MODELS
Survey every relevant existing standard that the canonical model inherits from or extends beyond. For each:
- Organization / standard name
- Key entities and data model
- What it does well
- Its limitations (what it doesn't cover)
- Reference URL

### 4. CANONICAL DOMAIN MODEL — N Domains, 40+ Core Entities
Organize into business domains, not technical layers. Each domain:
- **Domain Name:** Brief description
- **Core entities:** Each entity with its purpose, supertype/subtype hierarchy, and relationships
- Example domains: Party, Relationship/Household, Account, Position/Holding, Transaction, Performance/Attribution, Financial Plan, Billing/Revenue, Compliance/Regulatory, Operations/Admin

### 5. CORE ENTITY DETAIL: Representative Full Field Specification
Pick the most complex and most-connected entity. Provide its COMPLETE field specification:
- Field name, data type, PK/FK constraints, default value, nullability
- Enum values where applicable
- JSONB extensibility patterns
- Indexes
- Notes on business rules
This serves as the canonical example — if you can specify this entity fully, every other entity follows the same pattern.

### 6. IDENTITY RESOLUTION & ENTITY MATCHING
How do you match entities (clients, accounts, securities) across source systems? Layered approach:
- Primary matching: SSN/TIN hash, exact name+DOB
- Secondary matching: fuzzy name + phone/email/address
- Fallback: partial match with manual review
- Each match tier should have confidence score and auto-merge vs. flag-for-review threshold

### 7. SYSTEM-OF-RECORD ASSIGNMENT
Define authoritative source for every key field when multiple systems report different values. Table format:
| Field | System of Record | Fallback | Notes |
Include at least 15-20 fields showing the pattern. Document what happens when the system of record is unavailable (fallback chain).

### 8. DATABASE IMPLEMENTATION ARCHITECTURE
Storage layer (PostgreSQL → warehouse migration path), indexing strategy (B-tree, GIN trigram, BRIN temporal), partitioning scheme, CQRS/event sourcing pattern. Be prescriptive about specific index types and partition keys.

### 9. API & INTEGRATION LAYER
RESTful endpoint patterns, write-back propagation engine design, webhook/event bus integration. Show real endpoint URLs and method signatures, not abstract patterns.

### 10. COMPETITIVE LANDSCAPE
How do existing platforms handle (or fail at) this data model? For each competitor:
- Their approach
- Strengths
- Specific gaps vs. the canonical model being designed
- Why those gaps create opportunity for WealthForge

### 11. IMPLEMENTATION ROADMAP
Phased approach with concrete deliverables per phase:
- Phase 1 — Foundation (3 months): core entities, identity resolution, primary connectors
- Phase 2 — Breadth (3 months): transaction model, performance entities, billing linkage
- Phase 3 — Depth (3 months): compliance, household, beneficiary cross-referencing, event sourcing
- Phase 4 — Intelligence (3 months): data quality scoring, conflict automation, NLQ, AI anomaly detection

### 12. RED TEAMING — 10 Edge Cases
Systematic failure mode analysis. Each edge case should have:
- Scenario description (concrete and realistic)
- The risk/mitigation
Typical failure modes: custodian API changes, dual identity, transferred accounts, corporate actions, multi-currency, privacy/deletion requests, overlapping system-of-record claims, schema evolution, real-time vs. batch mismatch, idempotent ingestion.

### 13. KEY SOURCES (15-25 minimum)
Every industry standard, competitor documentation, job posting, cross-reference to previous research, and industry analysis report used. Include URLs and brief description of why each source was valuable.

### 14. NEW TOPICS DISCOVERED
At minimum 3-6 new [⏳] research topics that this data model analysis revealed. Each should have:
- Topic name
- What it entails
- Why it matters
- Cross-reference to other agenda items

## Pitfalls

1. **Over-modeling the obvious** — It is easy to add "all the fields anyone could ever want." Be ruthless: every field must have a known consumer (API endpoint, report, compliance requirement, planning calculation). Fields with no known consumer create maintenance burden. Mark them as `jsonb extensible` rather than first-class columns.

2. **Competitive landscape over-claiming** — "No existing platform has this" is a strong claim. Verify by checking: Salesforce FSC data model docs, OpenWealth API spec, FDX v5.3 investment extensions, Milemarker publications, Addepar ADX documentation, and the prior MCR research in EMPLOYEE-ROLES-RESEARCH.md. Source the claim to specific evidence or soften it.

3. **Identity resolution over-promising** — SSN/TIN matching sounds simple but many accounts lack SSN (international clients, trusts, retirement plans, held-away assets). Design the fallback chain for every tier, not just the primary match. 100% auto-merge is never achievable — document the expected manual review rate.

4. **System-of-record assumptions** — Firms configure systems differently. A firm may use CRM as master for address while another uses custodian. Design the SOR table as configurable defaults with firm-level overrides, not hardcoded rules.

5. **CQRS event sourcing scope creep** — CQRS adds significant complexity. Only apply event sourcing to fields that need audit trail (compliance, beneficiary, fee schedule) — not every field. Document which entities are event-sourced and which are simple CRUD.

6. **Partition key selection failure** — Date-based partitioning breaks if the entity doesn't have a reliable date (e.g., security master — securities don't have a "transaction date"). Use hash-based or list partitioning for reference data, temporal partition for transactional data.
