---
name: gbrain-failure-patterns
---

# GBrain Sink Failure Patterns

## Class 1: Unquoted Colons in Title

YAML parser treats the colon in the title as a key-value separator.

```yaml
# FAILS — colon breaks YAML parsing
title: DragonOS: Platform and Compliance Notes

# FIXED — quote the title
title: "DragonOS: Platform and Compliance Notes"
```

## Class 2: Broken YAML Sequences (Unquoted Parentheticals)

A wikilink followed by unquoted parenthetical text breaks the YAML list entry. The parser sees the opening `(` as a flow mapping start.

```yaml
# FAILS — unquoted parenthetical after wikilink
sources:
  - [[dragon-os-compliance-report]] (imported reference, same domain)
  - [[dragon-os-software]] (imported reference, same domain)

# FIXED — quote the entire list entry
sources:
  - "[[dragon-os-compliance-report]] (imported reference, same domain)"
  - "[[dragon-os-software]] (imported reference, same domain)"
```

## Class 3: Missing Frontmatter Delimiters

File has body content but no `---` frontmatter block at the top. GBrain cannot parse metadata.

```yaml
# FAILS — no frontmatter at all
# Body starts immediately
Neural oscillations are rhythmic brain activity patterns...

# FIXED — insert complete frontmatter block
---
title: Neural Oscillations and Brain Waves
tags: [neuroscience, oscillations]
created_at: 2026-08-15T10:00:00Z
---

Neural oscillations are rhythmic brain activity patterns...
```

## Class 4: Slug/Path Mismatches

Slug field is a bare name instead of the path-derived slug. GBrain validates that the slug matches the file path.

```yaml
# FAILS — bare name instead of path-derived slug
slug: Synfire-Chains-Coherent-Neural-Patterns
---

# FIXED — slug matches directory path + filename
slug: neural-circuits/Synfire-Chains-Coherent-Neural-Patterns
---
```

## Class 5: Single-Line Frontmatter Breakage

Title is quoted but subsequent frontmatter fields are on the same line or malformed, causing parser failure.

```yaml
# FAILS — all frontmatter on one line, parser can't separate fields
---title: "Olfactory Processing" tags: [olfaction] sources: [[olfaction]]---

# FIXED — proper multi-line frontmatter
---
title: "Olfactory Processing"
tags: [olfaction]
sources:
  - "[[olfaction]]"
---
```

## Repair Script Template

For batch-fixing files within a category, use a Python script:

```python
import os, re

base = '$HOME/.autognosia/oracle/brain'

# For Class 2 (unquoted parentheticals):
for root, dirs, files in os.walk(base):
    for fname in files:
        if not fname.endswith('.md'):
            continue
        path = os.path.join(root, fname)
        with open(path) as f:
            content = f.read()
        
        # Replace unquoted parenthetical list entries
        content = re.sub(
            r'(- \[\[[\w-]+\]\])\s+\([^\)]+\)',
            r'"\1 \2"',  # quoted
            content
        )
        
        with open(path, 'w') as f:
            f.write(content)
```
