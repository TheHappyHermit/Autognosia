---
name: cortex-verification
description: Verification contracts — deterministic first, auditor last, reality over narration.
---

# Autognosia Verification

## Verification Hierarchy

1. **Deterministic machine check** — command succeeds, file exists, health endpoint responds
2. **Authoritative external state** — database readback, API response, container health
3. **Build/test/checksum** — tests pass, checksums match
4. **Database/API readback** — write value, read it back
5. **Evidence comparison** — compare multiple sources
6. **Auditor judgment** — last resort for ambiguous evaluation

## Verification Contract Template

```
Action: <what>
Postconditions:
- <observed fact 1>
- <observed fact 2>
- <api/database check>
- <no unexpected changes>
```

## Reality Over Narration
A command succeeding does not mean success. Verify against reality:
- Container healthy, not just started
- Database writes read back correctly
- Backup actually restores
- API actually returns expected data

## Experience Recording
After meaningful operations, record:
- task_class, route, skill used, outcome, verified, session_id
- Not the full transcript — just metadata
