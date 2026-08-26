---
name: gbrain-repair
description: Diagnose and repair GBrain YAML frontmatter failures — systematic categorization of the 5 corruption classes and automated repair script.
category: devops
version: 1.0.0
---

# GBrain Frontmatter Repair

Diagnose and repair GBrain sink failures caused by YAML frontmatter corruption in `$HOME/.autognosia/oracle/brain/` Markdown wiki files.

## When to Use

- `gbrain doctor` reports `sync_failures` count > 0
- `gbrain sync` shows files being skipped due to parsing errors
- `gbrain frontmatter validate` reports YAML errors
- GBrain is failing to ingest or index specific files

## Step 1: Diagnose

```bash
gbrain doctor
gbrain sync --full
gbrain frontmatter validate $HOME/.autognosia/oracle/brain
```

The doctor output shows **sync_failures count** and **sink** errors. The validate output lists specific files with error classes.

## Step 2: Categorize Failures

GBrain YAML frontmatter failures fall into **5 classes** (see `references/gbrain-failure-patterns.md` for detailed examples):

### Class 1: Unquoted colons in title
YAML parser treats the colon as a key-value separator.
```yaml
title: "Title: With Colons"    # FIX
```

### Class 2: Broken YAML sequences (unquoted parentheticals)
Wikilink followed by unquoted parenthetical text breaks the list entry.
```yaml
# FAILS
- [[page-name]] (imported reference, same domain)
# FIX
- "[[page-name]] (imported reference, same domain)"
```

### Class 3: Missing frontmatter delimiters
File has body content but no `---` frontmatter block at the top. Insert a complete frontmatter block before the body.

### Class 4: Slug/path mismatches
Slug field is a bare name instead of the path-derived slug.
```yaml
slug: neural-circuits/Synfire-Chains-Coherent-Neural-Patterns   # FIX
```

### Class 5: Already fixed
Files patched in a prior pass — verify before reworking.

## Step 3: Automated Repair

For each category, write a targeted Python fixer script (see reference file for before/after examples).

**Pitfall**: Don't use a Python heredoc (`python3 << 'EOF'`) if the YAML content contains `---` — it conflicts with Python's triple-quote parsing. Use `python3 -c "..."` or write a temp script file instead.

## Step 4: Verify

```bash
gbrain frontmatter validate $HOME/.autognosia/oracle/brain
gbrain sync --full
```

Both should show zero errors. The doctor's sync failure log only clears after a successful sync — re-run sync after fixes to clear stale state.

## References

- See `references/gbrain-failure-patterns.md` for detailed examples of all 5 failure classes with before/after YAML diffs
