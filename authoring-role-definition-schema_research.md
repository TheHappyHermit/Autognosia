# authoring-role-definition-schema — Research

## What this topic is about
We need a **canonical authoring role definition** inside the WealthForge estate/inheritance-tax authoring platform. The platform already has a role-model concept in `esta-2b-1a-3-5-sub-3-2d-2`; this subtopic makes the **data contract** explicit so every downstream piece (field-level edit policy, privilege exemptions, identity attestation, appointment/session binding, and immutable edit audit) can read consistent permissions from one source of truth instead of hardcoded rules.

## Plain-English findings
- **Role as identity grain, not user attribute.** The right model is: *role instance* for a *user@firm* inside a *matter/jurisdiction/discipline* scope (author, reviewer, publisher, compliance officer). That scales across firms, bar admissions, and matter-specific sessions.
- **Authoring actions need two dimensions: jurisdiction + field.** A role should declare allowed *scopes* (which states/rules/matter cases it applies to) and allowed *field categories* (metadata, rule conditions/exceptions, plain-text reviewer notes, ancillary evidence references).
- **Privilege classes and role exemptions.** Some roles must override default restrictions for non-privileged users when `privilege-class-edit-exemption-table` is active. The schema should declare either `allow`, `deny`, or `exempt`.
- **Power-of-attorney/attorney-attestation linkage.** Attorneys can submit/refresh attestation artifacts (bar number, jurisdiction, term). The schema should tolerate multiple concurrent appointments, with one default active session.
- **What to build first.** Start with a *read-only role registry* to satisfy edit-policy evaluation and audit attribution. Add lifecycle states (`pending|active|suspended|revoked`) and provenance fields.

## Competitors / references / analogues
- **GitHub CODEOWNERS + fine-grained permissions:** 4-value scoping model (`user/org/team/invitation`) is a useful metaphor for multi-jurisdiction counsel access.
- **Law firm conflict/billing-filter roles (Clio, MyCase):** Typically expose `role_can_edit|view|billing|admin`, but they do not model privilege-aware legal editing.
- **Datomic / PRISM rich-authorization models:** Attribute-based access control with *subject, action, object, context* maps cleanly to our fields.
- **Legal-kludge:** Existing tools (HotDocs, Exari) only support static authoring roles; none expose immutable audit trails tied to each edit.

## Regulatory considerations
- **Attorney licensing / unauthorized practice of law (UPL).** Any `publisher` role that enacts a rule in a jurisdiction must be tied to a valid in-state counsel attestation; the schema should expose this as a validation hook.
- **Timekeeping and privilege:** The role schema should NOT store soap-style legal work product; it should store only *authority*, not content.
- **Immutable edit audit linkage:** Once attached to an edit transaction, role identity plus attestation state at edit-time becomes part of the audit record.

## Recommended schema shape
```
authoring_role:
  id
  name
  description
  jurisdiction_scope
  discipline_scope
  field_permissions
    field_name: allow|deny|exempt
  privilege_class_edit_exempt
  attestation_requirements
  lifecycle_state
  provenance
    created_by
    approved_by
    effective_date
    expiration_date
  notes_for_audit
```

## Key blockers / open questions
- The exact field naming taxonomy must align with `esta-2b-1a-3-5-sub-3-2d-1`.
- Requires UI for role lifecycle edit forms and reviewer assignment via `esta-2b-1a-3-5-sub-3-3.2`.
- Potential UPL review needed for `publisher` role mapping.
