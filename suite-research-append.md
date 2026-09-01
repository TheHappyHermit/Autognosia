---

## 2026-05-31 — Duty-of-segregation witness workflow for CBOR vendor-prefix policy events
**Topic:** vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow

### Strategy & Context (Why this matters)
In event-driven and regulatory-reporting architectures that use CBOR encoding, vendor-specific prefixes and media types risk collision when multiple systems emit events into shared streams. A "duty of segregation" witness workflow is a governance pattern in which an independent witness system attests that events from a given vendor prefix were properly isolated, that no cross-contamination occurred, and that the emitter honored its regulatory duty to segregate its message space. WealthForge's prior research on CBOR vendor-prefix policy, rotation ceremonies, and WORM-sealed audit envelopes creates the exact scaffolding needed to operationalize this pattern in a wealth-management context.

### What to Build (Plain-English)
1. **Witness Attestation Service** — lightweight verifier that consumes streaming CBOR events, checks each event's vendor-prefix tag against an allowlist, and emits a signed attestation when a vendor's duty-of-segregation obligation is satisfied or violated.
2. **Prefix Allowlist Schema** — canonical representation of allowable vendor prefixes with effective dates, scope, and rotation calendar.
3. **Rotation-Retirement Ceremony Integration** — tie witness attestation to the prefix rotation lifecycle; retiring prefix cannot be decommissioned until the witness reports zero contamination in its final epoch.
4. **Audit Evidence Pack** — immutable JSON-serialized attestation log compatible with the previously researched detached-envelope format and canonical-JSON verification.

### Competitors / Landscape
- **Apache Kafka / Pulsar**: provide per-topic/tenant isolation at middleware layer only; neither vendor emits WORM-verifiable CBOR prefix attestations.
- **CNCF Wallet / COSE**: define key identification and trust anchors but no vendor-prefix segregation workflow.
- **Financial audit platforms (Workiva, ApproveForge)**: handle governance events at document level, not binary encoded event streams.
- **Custom SIEM rules**: some firms detect unauthorized prefixes via regex/logic but lack standardized CBOR vocabulary and rotation-linked ceremony workflow.

WealthForge advantage: first mover in CBOR vendor-prefix segregation witness for wealth-management event streams.

### Regulatory Considerations
- **SEC / FINRA recordkeeping** (Rule 17a-3/4, Regulatory Notices 17-50 and 21-18): immutable capture of supervisory events; segregated namespaces reduce cross-firm contamination risk.
- **Duty of segregation (Investment Advisers Act / custody rules):** client records must remain separate from adviser's own; analogous logic applies when events from multiple advisers share a reporting stream.
- **Audit attestation standards** (ISACA, AICPA, IIA): independent witness attestation required for high-risk automated controls; CBOR-encoded attestations can be hashed into a WORM store to satisfy evidence standards.

### Build Priority & Decision
- Build a standalone witness microservice (`cbor_segregation_witness.py`) reading from the event bus, validating vendor prefixes against the canonical allowlist, and producing an append-only attestation log.
- Hook into the existing rotation-retirement-ceremony work so a prefix cannot be retired without final-epoch zero-contamination certification.
- Serialize attestations with the previously designed detached-envelope + canonical-JSON schema so downstream verifiers (auditors, regulators) can confirm integrity without re-ingesting the full event stream.

### Main Risks
- **Allowlist drift**: prefix registry changes without notifying the witness. Mitigation: webhook-driven reload + periodic sync.
- **Replay after compromise**: malicious insider rotates prefix to hide contamination. Mitigation: witness signs each epoch with a time-anchored key; prior attestations remain independently verifiable.
- **Performance overhead**: verifying every event adds latency. Mitigation: sample-based verification with mandatory 100% verification at rotation boundaries.

### New Subtopics Discovered
- vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow:witness-attestation-schema (HIGH)
- vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow:rotation-linked-sync-gate (HIGH)
- vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow:auditor-verification-openapi-path (MEDIUM)
Research appended for vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:duty-of-segregation-witness-workflow
--- end ---
---

## 2026-05-31 — Communication Reconciliation Log Schema — Part 1: Core Record Model
**Topic:** it-4

# Communication Reconciliation Log Schema — Part 1: Core Record Model

## 1. Problem Statement

When advisors and custodians exchange settlement-override communications (early close notices, deferral approvals, rejection reasons), WealthForge must prove:
- **What was sent**, **when**, **to whom**, and **whether it was received**
- **What was changed** between versions (e.g., advisor amends a deferral request after custodian pushes back)
- **What the system did next** (retry, suppress, escalate, archive)

This is the **communication reconciliation log** — an immutable, searchable event stream that turns a messaging thread into an auditable case file.

---

## 2. Schema Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Append-only** | Regulatory bodies (SEC, FINRA) require unaltered history. WORM or blockchain-style append aligns with `custodian-calendar-overrides-4-4-compliance-retention-archive`. |
| **Event-sourced, not state-snapshot** | Store `Command → Event → Reaction` chains. Allows replay for debugging and compliance reconstruction. |
| **Deduplication-first identity** | Every event carries an idempotency key so that retries do not create phantom branches. |
| **Tenant + conversation isolation** | Multi-tenant RIA/custodian environments require logical partitioning per `client_id` / `custodian_id` / `override_request_id`. |

---

## 3. Proposed Core Schema (JSON-LD friendly)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://wealthforge.io/schemas/communication-recon-log/v1",
  "title": "CommunicationReconciliationEvent",
  "type": "object",
  "required": ["event_id", "occurred_at", "event_type", "actor", "channel", "override_request_id"],
  "properties": {
    "event_id": {
      "type": "string",
      "format": "uuid",
      "description": "Primary key — immutable once written"
    },
    "idempotency_key": {
      "type": "string",
      "description": "Client-generated; format: {override_request_id}:{actor}:{step}:{seq} for dedup"
    },
    "occurred_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO-8601 with millisecond precision; source-of-truth is server UTC"
    },
    "event_type": {
      "type": "string",
      "enum": [
        "MESSAGE_CREATED",
        "MESSAGE_DELIVERED",
        "MESSAGE_READ",
        "MESSAGE_ACKNOWLEDGED",
        "MESSAGE_REJECTED",
        "MESSAGE_RETRIED",
        "MESSAGE_SUPPRESSED",
        "VERSION_APPLIED",
        "ESCALATION_TRIGGERED"
      ]
    },
    "actor": {
      "type": "object",
      "required": ["actor_type", "actor_id"],
      "properties": {
        "actor_type": { "type": "string", "enum": ["ADVISOR", "CUSTODIAN", "SYSTEM", "COMPLIANCE"] },
        "actor_id": { "type": "string", "description": "User ID, custodian participant ID, or service account" }
      }
    },
    "channel": {
      "type": "string",
      "enum": ["EMAIL", "SECURE_MESSAGE", "API_CALL", "PORTAL_NOTIFICATION", "WEBHOOK"]
    },
    "override_request_id": {
      "type": "string",
      "description": "FK to settlement-override aggregate; the case this event belongs to"
    },
    "conversation_id": {
      "type": "string",
      "description": "Groups related events into one thread; changes when a new deferral cycle starts"
    },
    "version": {
      "type": "integer",
      "description": "Monotonic per-conversation counter; incremented on retry/branch"
    },
    "parent_event_id": {
      "type": ["string", "null"],
      "format": "uuid",
      "description": "FK to prior event; null only for root MESSAGE_CREATED"
    },
    "payload_hash": {
      "type": "string",
      "description": "SHA-256 of canonical JSON payload; integrity anchor"
    },
    "legal_hold": {
      "type": "boolean",
      "default": false,
      "description": "If true, retention schedule excludes automatic purge"
    },
    "jurisdiction_tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "e.g. ['SEC', 'FINRA', 'NY', 'IL'] — drives retention policy"
    },
    "metadata": {
      "type": "object",
      "description": "Open-ended bag for custodian-specific fields; must not contain PII"
    }
  }
```

### Key Fields Explained

| Field | Why It Exists |
|-------|---------------|
| `idempotency_key` | Prevents duplicate branches on retry; required by FINRA Rule 4530(b)(6) accurate books-and-records. |
| `parent_event_id` | Builds the directed acyclic graph of the conversation. Enables diff-based summaries (schema Parts 2–3). |
| `conversation_id` | Groups the request/response cycle. Advisor amending a request gets a new `version` but same `conversation_id`. |
| `payload_hash` | Cheap integrity check before expensive WORM write. |
| `legal_hold` + `jurisdiction_tags` | Drives retention/write-once behavior without embedding policy code in the log writer. |

---

## 4. Indexing and Query Patterns

### 4.1 For Advisor UX
```sql
-- Show full thread for one override request, newest first
SELECT * FROM comm_recon_log
WHERE override_request_id = 'REQ-2026-XXXX'
ORDER BY version DESC, occurred_at ASC;
```

### 4.2 For Compliance Audit
```sql
-- Reconstruct exact timeline with actor identity for a regulatory request
SELECT occurred_at, actor_type, actor_id, event_type, channel, payload_hash
FROM comm_recon_log
WHERE override_request_id = ? AND legal_hold = true
ORDER BY occurred_at;
```

### 4.3 For Deduplication / Retry Debugging
```sql
-- Detect phantom retries (same idempotency key, different event_id)
SELECT idempotency_key, COUNT(DISTINCT event_id) AS branches
FROM comm_recon_log
GROUP BY idempotency_key
HAVING branches > 1;
```

### 4.4 For Daily Reconciliation Job
```sql
-- Events missing expected counterpart for today's run
SELECT crl.override_request_id, crl.event_type
FROM comm_recon_log crl
LEFT JOIN settlement_overrides so ON so.id = crl.override_request_id
WHERE crl.occurred_at >= CURRENT_DATE
  AND so.status NOT IN ('SETTLED', 'CANCELLED');
```

---

## 5. Competitors & Market Landscape

| Competitor / Tool | Approach | Gap vs. WealthForge |
|-------------------|----------|---------------------|
| **Stripe Idempotency Keys** | Client-generated idempotency keys stored for 24h; returns 200 for duplicate POSTs. | Stateless, short-lived. No long-term reconstruction, no legal-hold branching. |
| **Swimlane / Exabeam UEBA** | Security-event schemas with parent_event_id chains. | Security-focused; no financial instrument context, no custody-feed correlation. |
| **DTCC / Custodian Event Logs** | SWIFT gpi, DTCC GIVES event streams. | Carrier-controlled; advisor cannot query end-to-end. Proprietary formats. |
| **ACTION (FINRA)** | Order-management audit schemas (Order Capture, Execution). | Limited to equity/options lifecycle; no settlement-override branch modeling. |

**WealthForge differentiation:** The schema above unifies **advisor workflow**, **custodian calendar override**, and **compliance retention** in one event graph. No competitor provides *advisor-controlled* end-to-end reconstruction of settlement-override communications with built-in retention jurisdiction tagging.

---

## 6. Regulatory Considerations

| Regime | Requirement | Schema Mapping |
|--------|-------------|----------------|
| **SEC 17a-4 / 17a-3** | Books and records for 3–6 years; immediately accessible. | `legal_hold`, `payload_hash`, `occurred_at`, `actor`. WORM storage per `custodian-calendar-overrides-4-4-compliance-retention-archive` research. |
| **FINRA Rule 4530** | Record complaints, arbitration settlements, and supervisory reviews. | `jurisdiction_tags` triggers FINRA 6-year flag; `actor_type = COMPLIANCE` routes to supervisory review queue. |
| **MiFID II Art. 16(7)** | Record communications "related to orders" for 5 years. | `channel` enumeration; `override_request_id` links to order lifecycle if mapped later. |
| **NY DFS 500 / IL BIPA** | Notification of unauthorized access; data-minimization. | `metadata` must be PII-free; breach alerting should scan `actor_id` exposure paths only. |
| **Bank Secrecy Act / OFAC** | Retain records that could relate to sanctions screening. | `legal_hold` overrides purge schedules; `occurred_at` timezone preservation matters for extraterritorial clients. |

### Common Pitfalls to Avoid
1. **Embedding PII in event payloads** — store only hashes or FK references; keep client name/SSN in separate access-controlled store.
2. **Using auto-increment IDs only** — if storage is sharded or moved, sequential IDs leak. UUID v7 or `{ts}-{node}-{seq}` is audit-friendlier.
3. **Time-sync ambiguity** — require NTP-synchronized server timestamps; reject client-supplied `occurred_at` for financial events.

---

## 7. Recommended Implementation Roadmap

### Phase 1 — Event Capture (MVP, 2–3 weeks)
- Define `Command → Event` mappers for the 5 core override comms channels.
- Persist events via `append_entry()` from `append_research.py`-style writer into `comm_recon_log` table or S3-like object store.
- Emit `payload_hash` using SHA-256 over `actor_id` + `channel` + `body` + `ts`.

### Phase 2 — Replay & Audit UI (3–4 weeks)
- Build `/override/{id}/timeline` endpoint returning ordered `version` chain.
- Add diff rendering: highlight `VERSION_APPLIED` events to show what changed between advisor attempts.

### Phase 3 — Reconciliation Nightly Job (2 weeks)
- Cross-reference `comm_recon_log` against `settlement_overrides` to flag missing ACKs or orphaned retries.
- Integration point with `custodian-calendar-overrides-4-4-reconciliation:daily-reconciliation-job`.

### Phase 4 — Policy Hardening (2 weeks)
- Attach `legal_hold` and `jurisdiction_tags` from pre-existing `compliance_retention_archive` records.
- Enable WORM sealing per-partition (e.g., quarter-sharded S3 Object Lock or PostgreSQL `pg_repack` + append-only table).

---

## 8. New Subtopics Emerging from This Research

While refining the schema, the following granular items surfaced. Recommend promoting them as `[⏳]` children of `custodian-calendar-overrides-4-4-reconciliation:communication-reconciliation-log-schema`:

- **communication-reconciliation-log-schema-1a: Event-sourcing store selection and access-pattern analysis** — Compare append-only object store (S3/Glacier), time-series DB (TimescaleDB), and event log (Kafka compacted topics).
- **communication-reconciliation-log-schema-1b: Payload canonicalization and hash-chain specification** — JSON canonicalization rules (JCS), key ordering, null handling, and Merkle-sealing rollup for quarterly integrity proofs.
- **communication-reconciliation-log-schema-1c: PII boundary enforcement and redaction policy** — Regex / classifier-based redaction pipeline before WORM write; audit log of redaction decisions.

---

## 9. Summary

**What to build:** An append-only, event-sourced communication log with idempotency keys, parent links, jurisdiction-driven retention, and cheap integrity hashing. Start with MVP event capture, then layer replay UI, nightly reconciliation, and policy hardening.

**Competitive advantage:** Advisor-controlled end-to-end audit trail for settlement-override communications — a category no custodian or UHNW platform currently offers in consumable form.

**Regulatory considerations:** SEC / FINRA multi-year WORM retention, MiFID II 5-year comms archive, NY/IL breach handling, and strict PII avoidance. The schema is designed so that retention behavior shifts via policy flags rather than code changes.
Research appended for it-4
--- end ---
---

## 2026-05-31 — audit-ready-rotation-journey-mapper:audit-ready-rotation-journey-mapper
**Topic:** vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:audit-ready-rotation-journey-mapper

## Overview
`audit-ready-rotation-journey-mapper` focuses on creating an end-to-end, auditor-readable record of every vendor CBOR prefix rotation ceremony as it advances through state-machine stages and supporting phases such as approval, dual-write, verification, and retirement.

## What to build
- Ceremony journey manifest schema covering proposal, approvals, dual-write window, verification samples, retirement timestamp, and rollback evidence.
- Ledger-style export rendering the state-machine lifecycle in a format that matches the existing `auditor-readable-allowlist-template`.
- Region-scoped journey views mapping both success paths and failure-/rollback paths, so auditors can inspect what happened in each locality.
- Integration hooks into `rotation-automation-sdk` and `duty-of-segregation-witness-workflow` so ceremony steps update the journey manifest automatically rather than through manual annotations.

## Competitors and analogues
- **HashiCorp Vault / cert-manager rotation flows:** offer ceremony-like rollouts with rollback states, but expose auditor-facing dashboards and export formats only secondarily.
- **PKI ceremonies (government/private CA):** document key ceremonies with co-signatures; closest analog for attestation requirements. Still usually document-ledger or PDF-based rather than machine-readable journey manifests.
- **OpenTelemetry semantic convention changelogs:** track schema deprecation in public GitHub issue timelines, lacking approval gates, secret/state acceptance proofs, or region views.
- No direct audit-export product exists that ties rotating vendor prefixes to a structured, region-scoped, exportable journey manifest for financial-compliance reviewers.

## Regulatory considerations
- **SOX/financial audit integrity:** requires evidence that both old and new prefixes existed in active and staged sets at dual-write boundaries, with named approvers and timestamps.
- **PCI-DSS critical security control change:** prefix rotation is a control-plane change; evidence must include scope impact and approval before production emission begins.
- **ISO 27001 change management (Annex A 12.1.2):** documentation must record the change request, approvals, back-out plan, and peer review; the journey manifest can become the canonical record.
- **MiFID II / transaction reporting evidence retention:** journey manifests should be archiveable for 5+ years and support examination retrieval by prefix, region, and ceremony id.

## New subtopic leads
- journey-manifest-state-transition-schema (HIGH)
- regional-diff-merge-alert-for-journey-evidence (HIGH)
- witness-attestation-merge-into-journey-manifest (MEDIUM)
- pdf/markdown export adapter for auditor-readable journey bundle (MEDIUM)

## Blockers / open questions
- `auditor-readable-allowlist-template` must be finalized so this journey manifest export can match its terminology and layout.
- Journey manifest schema must be aligned with `rotation-automation-sdk` ceremony events to avoid duplication or drift.
- Legal/regulator review should confirm that “journey map” naming satisfies examination expectations versus traditional “rotation evidence pack.”
Research appended for vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:audit-ready-rotation-journey-mapper
--- end ---
---

## 2026-05-31 — Bounded retry budget and backoff policy engine
**Topic:** esta-2b-1a-3-5-sub-3-2c-3

# Research: esta-2b-1a-3-5-sub-3-2c-3 — Bounded retry budget and backoff policy engine
## Key findings

- Purpose: enforce a bounded retry budget for multi-channel alert dispatch so privilege-bound notifications do not spam regulated messages or exhaust downstream rate limits.

## What to build

- Retry budget model: per-client, per-chapter, or per-message-type budgets with configurable caps and time windows.
- Backoff policy engine: jittered exponential backoff with escalation rules; avoids thundering herd during partial outages.
- Priority-class gating: privilege-class buckets get separate budgets so SEC/fiduciary or UHNW messages do not starve or get blocked by lower-priority retries.
- Safety controls: circuit breaker, max-burst limiter, and escalation path to human operator when budget is exhausted.

## Competitors

- Wealth platforms do not expose retry budgets as a documented alert infrastructure primitive.
- Standard Twilio/SendGrid/Resend rate-limiting is implemented by code, not as a configurable WealthForge-alert domain primitive.

## Regulatory considerations

- Critical alert retention: retained message delivery receipts must remain auditable even after retries stop.
- Regulator expectation: continuous monitoring of failed alerts is implied by best-practice SLA frameworks; WealthForge should prove finite retry and explicit failover for examiners.

## New sub-topic

- `esta-2b-1a-3-5-sub-3-2c-3a`: IAM-annotated retry damping policy — link retry rate to client privilege tier and channel capacity.
Research appended for esta-2b-1a-3-5-sub-3-2c-3
--- end ---
---

## 2026-05-31 — Cross-border Social Security totalization decision engine
**Topic:** it-4

# RESEARCH: it-4 — Cross-border Social Security totalization decision engine

**Date:** 2026-05-31

## What to Build

A totalization decision engine that:
- Maps client nationality/residency -> applicable SSA totalization treaty
- Determines Certificate of Coverage (Form SSA/CG 21) eligibility and workflows
- Calculates self-employment (SE) Social Security tax exposure before/after treaty
- Projects benefit protection impact of divided careers

Key product requirements:
- **Country lookup:** U.S. totalization agreements currently cover 30 countries (as of 2026), including Italy, Germany, Switzerland, Canada, France, Japan, Chile, Brazil, and more.
- **Certificate of Coverage workflow:** Determine whether the U.S. or host country covers the work, then trigger the SSA online application or denial path. Track issuance and renewal.
- **SE tax exposure analysis:** Compute 15.3% U.S. SE tax plus host-country social charges. Compare with and without totalization relief.
- **Benefit gap analysis:** Show years credited in both systems and identify gaps in protection.

## Competitors / Landscape

- **SSA International Programs:** Primary government source; status tables, agreement descriptions, and online Certificate of Coverage portal (`opts.ssa.gov`).
- **Tax preparation platforms:** Do not own this workflow. Most expat tax software handles foreign earned income exclusion or FEIE, but SSA totalization is separate and undertooled.
- **Global mobility / GEO providers:** Companies like Safeguard Global, Remote, Deel handle payroll compliance, so they solve dual-taxation at the corporate payroll layer, but not at the advisor/client financial planning layer.
- **Opportunity:** WealthForge would be the first RIA/wealth platform to embed totalization decisioning with retirement projection, giving RIAs a differentiated offering for U.S. expat and internationally mobile clients.

## Regulatory Considerations

- **SSA Totalization Agreements:** Bilateral treaties that coordinate Social Security coverage. Purpose: eliminate dual taxation and fill benefit gaps for split careers.
- **IRS Interaction:** Totalization status affects self-employment tax under IRC §1401 and can change Form SE filing. Some countries also impose employer-side social charges.
- **Certificate of Coverage:** Form SSA/CG 21 / online application through `opts.ssa.gov`. Employers/Self-employed must carry proof of coverage in the host country to avoid double payment.
- **State/Local Impact:** In countries without totalization, clients may face social charges plus U.S. SE tax, substantially reducing after-tax income and retirement savings.
- **Client Vulnerability:** Self-employed expats and digital nomads in non-treaty countries face the highest exposure (15.3% + host country charges), making this a high-value advisor tool.

## UI / Integration Notes

- **Primary widgets:** Treaty Lookup, Certificate Tracker, SE Tax Calculator, Benefit Impact summary.
- **Trigger points:** International onboarding, annual tax review, self-employed income detection, relocation workflow.
- **Cross-references:** IT-MOD-5 retirement planner, IT-MOD-1 domicile/residency scoring, spec-02 tax specialist.
Research appended for it-4
--- end ---
---

## 2026-06-01 — Auditor-Readable Allowlist Template for CBOR Vendor Prefix Policy
**Topic:** vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:whitelist-ci-gate:auditor-readable-allowlist-template

# Auditor-Readable Allowlist Template for CBOR Vendor Prefix CI Gate

## Summary
This research documents standard patterns for publishing a human‑auditable allowlist of CBOR/COSE media‑type vendor prefixes, OIDs, and extension labels that may pass the CI gate. The recommended approach is an in‑repo, schema‑validated JSON document plus an audit log append‑only record, rendered into Markdown/HTML for reviewers.

## What To Build
- **Allowlist JSON schema** (`cbor-vendor-allowlist.json`) with:
  - `prefix` / `label` / `mime_type` + `owner` / `scope` / `expires`
  - `ci_gate_status` (`allow`/`deny`/`review`)
  - `last_attestation` hash + signer identity reference
- **Render/publish step** that converts the JSON into a frozen audit document:
  - Markdown table sorted alphabetically, with invalid/experimental rows highlighted.
  - HTML/PDF optional for offline delivery.
- **Gitops policy gate** that rejects vendor types outside the allowlist at CI time and attaches a human‑readable diff to PR comments.

## Competitors / Industry Patterns
- Microsoft CBOR/COSE tools expect stable, well‑known labels but do **not** enforce a standardized vendor allowlist artifact.
- CoAP/IANA registry conventions for “application/cose; cose-type=” string parameters.
- Supply‑chain allowlist patterns from Kubernetes Policy Controller and OPA Gatekeeper are the closest analogues.
- Audit‑export formats used in PKI Certification Practice Statements (CPs) Appendixes align with “auditor‑readable” requirements.

## Regulatory / Compliance Considerations
- **Auditor readability**: choose deterministic serialization (JSON Schema + JCS) so derived artifacts are reproducible.
- **Retention / immutability**: combine with append‑only audit log (see `prefix-collision-legal-evidence-format`) to prove each change was attested.
- **Jurisdictional tolerance**: the presented table should separate “active / experimental / revoked” per IANA conventions to counter claims of unmanaged exposure.

## Recommendations
1. Keep canonical source of record as `cbor-vendor-allowlist.json` with an XSD/JSON‑Schema file alongside it.
2. Publish derived outputs under both `site/registry/` for online review and `.pdf/.html` for offline evidence packs.
3. Link attestation hashes into the `prefix-collision-legal-evidence-format` bundle for traceability.
Research appended for vendor-specific-media-type-and-extensions:event-cbor-vendor-prefix-policy:whitelist-ci-gate:auditor-readable-allowlist-template
--- end ---
