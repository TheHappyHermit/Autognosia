# Cross-Role (XR) Research Pattern — WealthForge Third Research Stream

**Applies to:** XR-01 through XR-06 topics in AGENDA.md

## When to Use This Pattern

The XR (Cross-Role) topics sit between feature research (12-section) and employee role research (9-section). They describe infrastructure, systems, and workflows that span **all 25+ employee roles** simultaneously. Use this pattern when the topic:

- Describes something EVERY role does (data entry, reports, notifications)
- Spans front office, middle office, and back office equally
- Cannot be understood by analyzing a single role in isolation
- Involves cross-system or cross-department interaction patterns
- Requires synthesizing findings from all employee roles' widget designs

**Loaded XR topics (6 total):**
- XR-01: Common Admin & Data Entry Tasks ✅
- XR-02: Cross-Role Workflow Mapping ✅
- XR-03: Enterprise GUI Archetype Library ✅
- XR-04: Mobile vs Desktop Workflows ✅
- XR-05: Notification & Alert System ✅
- XR-06: Reporting & Document Generation ✅

## Adapted 10-Section Structure for XR Topics

XR research uses a hybrid of the feature and employee role formats:

### 1. CROSS-ROLE INVENTORY (replaces STRATEGY)
Catalog every instance of the topic across all 25+ roles. For XR-06: every report every role generates. For XR-05: every notification type across all roles. For XR-01: every data field every role enters. This section is the **definitive inventory** — nothing like it exists anywhere else.

**Method:** For each employee role research entry in EMPLOYEE-ROLES-RESEARCH.md, extract the specific items relevant to this XR topic. Build a role-by-item matrix showing which roles interact with which items.

### 2. THE PROBLEM (Plain English)
Same as feature format — a human situation showing why this cross-role fragmentation is painful.

### 3. COMPETITIVE LANDSCAPE
No platform provides cross-role coverage. The key competitive insight is: **no one has built this.** The analysis should show which platforms come closest and where they fail. Often the answer is "Salesforce FSC has the best starting point but needs massive extension."

### 4. ADVISOR & EMPLOYEE SENTIMENT
Gather quotes and pain points from ALL affected roles, not just advisors. The CSA complaining about data entry, the CCO complaining about compliance reporting, the PM complaining about fragmented notifications. Role-differentiated sentiment.

### 5. WHAT WEALTHFORGE HAS / IS MISSING
Standard format but map against ALL existing widget designs across all roles. Many roles may already have partial widget designs that need to be unified.

### 6. BUILD SPEC (Unified Architecture)
The core deliverable of an XR topic: a **single canonical data model** that unifies the fragmented per-role instances. For XR-06: the Universal Report Builder schema. For XR-05: the notification_events 6-table schema. For XR-01: the Master Client Record 200+ field schema.

**The unification imperative:** Every XR topic must produce exactly ONE canonical data model. If you end up with separate tables per role, you're doing it wrong — the whole point of XR research is to consolidate.

Include pseudocode for the core engine (report generator, notification router, workflow dispatcher, sync engine).

### 7. UI/UX (Multi-Role Widgets)
Design widgets that have role-aware presentation layers — the CCO sees different dashboard elements than the FA, even though they share the same underlying data model.

Key UX patterns for XR topics:
- **Role-aware landing screens** — Each role sees their most relevant slice first
- **Role filter/sidebar** — Switch between "My View," "Team View," "Firm View"
- **Permission-gated actions** — FA can create tasks, CCO can only review
- **SLA/Status badges** — Cross-role visibility into who's responsible for what

### 8. REGULATORY & GUARDRAILS
Same as feature format — XR topics often have significant compliance implications because they span departments.

### 9. ARCHITECTURAL BLUEPRINT
System architecture showing integration points with all affected systems. API endpoints, event bus design, role-based access control.

### 10. RED TEAMING + NEW TOPICS
Combine the standard red-teaming edge cases with the systematic decomposition method (Angles 1-5) for new subtopics.

## Research Sources for XR Topics

XR topics require a different research approach than standard features:

1. **Primary source: EMPLOYEE-ROLES-RESEARCH.md** — Every role research entry contains relevant widgets, workflows, and pain points. Scan ALL roles for mentions of the XR topic.
2. **T3/Kitces surveys** — Cross-role satisfaction data is harder to find but Kitces' technology satisfaction data by role is invaluable.
3. **Industry operations blogs** — CCO roundtables, COO operational efficiency posts, operations manager forums. These roles talk about cross-role pain.
4. **AssetMark/SS&C platform documentation** — Document how they handle cross-system workflows.
5. **Reddit r/CFP, r/RIA, r/FinancialCareers** — Employees at all levels post about cross-role frustrations.
6. **SWPP / FPA conference talks** — Operations and practice management sessions often address the cross-role gap.

## Common Pitfalls in XR Research

1. **Role omission** — It's easy to focus on advisor/PM roles and forget CSA, Office Manager, Compliance Officer, HR. Every role matters in XR research because the whole point is the cross-role connection.
2. **Over-specification for a single role** — Designing the ideal XR widget for the FA but making it useless for the COO. Role-aware presentation must be baked into the spec, not bolted on.
3. **Missing the handoff** — XR topics always involve handoffs (workflow steps, notification routing, data sync). The handoff IS the problem — don't design a system that eliminates handoffs but doesn't document them.
4. **Assuming all roles have equal influence** — In practice, the COO and CCO often veto decisions about operations and compliance workflows. Make sure the build spec accounts for approval hierarchies.
5. **No SLA framework** — XR topics need explicit SLA targets (how fast should an ACAT transfer be processed? How fast should a notification be acknowledged?) because they're process infrastructure, not standalone features.

## Relationship to Other Patterns

| Pattern | When to Use |
|---------|-------------|
| 12-section feature research (standard) | Single functional domain, one department, one client outcome |
| 9-section employee role research | Single role, all their tasks and tools |
| **XR cross-role research (this pattern)** | Infrastructure spanning all roles |
| Researcher deep-dive variant | Person's body of work across multiple domains |

XR research typically generates more new [⏳] subtopics than standard feature research (5-8 vs 3-6) because each role discovered in the inventory creates a potential subtopic.
