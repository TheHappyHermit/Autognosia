# Recovering missing research from checked-off AGENDA.md items

## Trigger
Checked-off IDs in `AGENDA.md` have no entry in the canonical `RESEARCH.md`, `USED_RESEARCH.md`, or the append sidecar file. This means a cron wrote an abbreviated summary to cron output but never made it into the live accumulator.

## Locator
1. Extract the missing topic IDs from `AGENDA.md` (the `[✅]` lines).
2. Search cron output directories for the exact topic ID string.
3. Match each missing ID to one or more cron output files.
4. Read the cron output file around the ID match and extract the report block.

## Write-back
1. Read the canonical accumulator without `offset`/`limit`.
2. Use temp-file append: write extracted content to `/tmp/<stable_name>.md`, then append with shell redirection.
3. Do not write to `USED_RESEARCH.md`. Do not overwrite `RESEARCH.md`.

## Verification
- After append: `grep -n '<topic_id>' /path/to/RESEARCH.md`
- State sanity: `grep -c '\[⏳\]'` and `grep -c '\[✅\]'`
- Preserve the legacy output directory if additional historical runs may still contain unrecovered entries.
