# draft-ietf-ianabis-rfc7120bis Research Report

## Summary

RFC 7120bis is an update to the IANA early allocation process that doubles the allocation term from 1 year to 2 years and creates a new process for non-IETF standards organizations to obtain early allocations from "Specification Required" registries. The document is in version -03 (July 2026) and awaits IESG approval.

## RFC 7120 Current Process

RFC 7120 (BCP 100) established early allocation procedures for IETF Stream documents:
- **Term**: 1 year, renewable (with IESG approval after first extension)
- **Scope**: Only IETF Stream Internet-Drafts
- **Applicable Registries**: Standards Action, IETF Review, RFC Required, and Specification Required (conditional)
- **Process**: Authors → WG Chairs → AD approval → IANA request → Expert review (for Spec Req) → Temporary allocation
- **Conditions**: Document must be close to IESG approval, sufficient community interest, risk of contention if not allocated

## Bis Changes (Section 1.1)

Two major changes in draft-ietf-ianabis-rfc7120bis:

1. **Extended Term**: All early allocations extended from **1 year to 2 years**
2. **New Process for SDOs**: Creates early allocation procedure for standards-related organizations needing "Specification Required" allocations before publishing finalized specifications

Additional changes:
- Creates "IESG-Recognized Standards-Related Organizations" registry
- Clarifies renewal process (first renewal automatic for 2 years, subsequent renewals need IESG approval)
- Notes that IANA requests expert approval for early allocation where registries require both document publication and expert approval

## CBOR WG Impact

### Current CBOR Simple Values Registry
- Range 0-19: Standards Action
- Range 32-255: **Specification Required** (Expert: Carsten Bormann)
- Existing temporary allocation: value 59 (SPICE SD-CWT, expires 2026-12-16)

### Pending CBOR Work
- **draft-ietf-cbor-packed**: Packed CBOR needs simple values and tags for compression functionality
  - Current revision -19 explicitly states: "choosing requested simple values and tag numbers, in preparation for continuing the early allocation process"
- **draft-goncharov-rfcregsimples-00**: Proposes registering simple values 0-15 for packing/templating (individual draft, not WG-adopted)

### Impact Assessment
- **Positive**: 2-year term benefits CBOR WG as their documents often take longer to progress through IESG review
- **No change to eligibility criteria**: CBOR WG still needs WG chair + AD approval for early allocations
- **Expert review still required**: Carsten Bormann (as Designated Expert) must approve allocations from range 32-255
- **Faster?**: No - same multi-step approval process (WG chairs → AD → IANA → Expert)
- **Potential benefit**: If CBOR documents use "Specification Required" registries and need allocations before publication, they now have twice the time before renewal

## Timeline

| Version | Date | Milestone |
|---------|------|-----------|
| draft-baber-ianabis-rfc7120bis-00 | March 2025 | Individual submission |
| Adopted by IANABIS WG | November 2025 | Became draft-ietf-ianabis-rfc7120bis-00 |
| -01 | February 2026 | WG revision |
| -02 | June 2026 | Major revision |
| -03 | July 2026 | Current version, expires January 7, 2027 |
| IESG Approval | TBD | Not yet on IESG decisions list (as of September 2026) |

The document has not yet entered IESG evaluation. Based on typical IESG processing times and the document's current state, publication as an RFC is likely late 2026 or early 2027.

## Sources

1. https://datatracker.ietf.org/doc/draft-ietf-ianabis-rfc7120bis/
2. https://datatracker.ietf.org/doc/html/draft-ietf-ianabis-rfc7120bis-03
3. https://datatracker.ietf.org/doc/draft-ietf-ianabis-rfc7120bis/history
4. https://www.iana.org/assignments/cbor-simple-values/cbor-simple-values.xhtml
5. https://datatracker.ietf.org/doc/draft-ietf-cbor-packed/
6. https://datatracker.ietf.org/doc/draft-goncharov-rfcregsimples/
7. https://datatracker.ietf.org/wg/ianabis
8. https://datatracker.ietf.org/iesg/decisions/2026
