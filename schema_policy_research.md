## Summary
This research defines a practical schema-evolution policy for WealthForge's WORM-backed dual-write evidence manifests. The goal is to allow safe schema changes without breaking historical record immutability, judicial readback, or regulator portability.

## What to build
- Versioned manifest envelope contract with `schema_version` and `manifest_id`.
- Canonical compatibility modes: backward compatible, forward compatible, fully compatible, breaking.
- Transformation adapters that operate on attested historical records without rewriting their original bytes.
- Cross-region compatibility matrix so schema releases can be staged safely across regions and evidence stores.
- WORM-safe migration paths that keep immutability guarantees intact.

## Competitors / reference practice
- IBM blockchain and Hyperledger Fabric use "schema layering" rather than in-place upgrades.
- Confluent Schema Registry (Avro/Protobuf/JSON Schema) demonstrates compatibility-mode configuration; useful reference.
- Government records-management practices (NARA, DoD 5015.2) favor versioned schemas with preservation copies.
- Microsoft Purview and AWS Glue Data Catalog use metadata layering to avoid rewriting underlying assets.

## Regulatory and legal considerations
- Once written, an evidence manifest tied to a legal hold or regulator export cannot be altered or normalized destructively.
- Adapter-based expansion is preferred over in-place retroactive transforms.
  - Any retroactive rewrite requires an explicit governance event, an override flag, and a new attestation chain.
- Retain an unmodified original manifest payload plus a promoted reader view.

## Recommended policy structure
1. Classification: read compatibility once, evaluate once, execute transforms inline.
2. Compatibility API contract:
   - `reader_can_parse_original` -> direct passthrough
   - `reader_needs_canonical_view` -> apply adapter only
   - `reader_requires_promoted_record` -> create generated promoted form

### Key parameters
- `min_compatibility` required by read path
- `max_compatibility` provided by current schema
- `breaking_compatibility_override` flag for manual override with audit trail
- stability-tag at durable scope: experimental -> supported -> deprecated -> frozen

## Migration patterns
- Read-compat first, then write-compat, then soft breaking changes.
- Preflight compatibility gate before release.
- Evidence-store store procedures must validate compatibility before persisting new envelope forms.

## New subtopics introduced
- `worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:schema-evolution-and-compatibility-policy:compatibility-mode-as-code` -- HIGH
- `worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:schema-evolution-and-compatibility-policy:worm-safe-adapter-registry-and-immutability-gate` -- HIGH
- `worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:schema-evolution-and-compatibility-policy:cross-region-compatibility-flagger-and-preflight-gate` -- HIGH
- `worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:schema-evolution-and-compatibility-policy:version-promotion-and-retention-override-workflow` -- MEDIUM
- `worm-adapter-multi-region-replication:dual-write-evidence-manifest:schema-and-serialization:schema-evolution-and-compatibility-policy:schema-version-ui-and-audit-narrative` -- MEDIUM
