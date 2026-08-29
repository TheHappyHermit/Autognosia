---
name: digital-credentials-certification
description: Design, implement, and verify digital credential systems for professional certifications — badge issuance, verification APIs, embeddable widgets, and Open Badges 3.0 compliance.
trigger: Load when designing advisor certification display systems, building credential verification infrastructure, evaluating digital badge platforms for integration, ensuring Open Badges 3.0 compliance, or researching competitive positioning of certification programs.
---

# Digital Credential & Certification Systems

Design, implement, and verify digital credential systems for professional certifications.

## Scope

- Digital badge platform architecture and competitive analysis
- Open Badges 3.0 specification compliance (Ed25519 signing, issuer metadata, assertion structure)
- Public verification API design (lookup, search, bulk endpoints)
- Embeddable badge widgets (SVG inline, info cards, JS auto-populating)
- Badge lifecycle management (issuance, expiration, revocation)
- Regulatory considerations (SEC Marketing Rule, FINRA suitability, state advertising rules)
- Competitive benchmarking of credential platforms (Credly, BadgeCert, Accredible, Certifier, CFP Board)

## Key References

- `references/badge-platforms-competitive-landscape.md` — Competitive analysis of Credly, BadgeCert, Accredible, Certifier, CFP Board, FINRA
- `references/open-badges-3-0-technical-spec.md` — Open Badges 3.0 assertion structure, signing, issuer metadata, interoperability

## Key References

- `references/badge-platforms-competitive-landscape.md` — Competitive analysis of Credly, BadgeCert, Accredible, Certifier, CFP Board, FINRA
- `references/open-badges-3-0-technical-spec.md` — Open Badges 3.0 assertion structure, signing, issuer metadata, interoperability

## Pitfalls

- **Don't build badge infrastructure from scratch** unless domain specificity requires it. Credly/BadgeCert handle the plumbing — differentiate on competencies, not platform.
- **Open Badges 3.0 is mandatory**, not optional. Without it, badges can't be imported into backpacks (Canvas, Moodle, Credly) and lack cryptographic trust.
- **SEC Marketing Rule compliance** is required when badges are used in advisor marketing — claims must be accurate, criteria disclosed, and records kept for 5 years.
- **CFP Board mark usage rules** apply if advisor uses "CFP®" alongside your certification — never imply CFP Board endorsement.
