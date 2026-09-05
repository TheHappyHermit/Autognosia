---
name: library-onboarding
description: Four-pass import process for Oracle knowledge files.
---

# Library Onboarding

Four-pass import process for knowledge files added to the Oracle Vault.

## ⚠️ Routing: Oracle vs Active Wiki

**Before any import, decide which tier the content belongs in:**

| Content type | Tier | Path |
|---|---|---|
| Specialist reference knowledge (technical, factual, domain-specific) | Oracle | `~/.autognosia/oracle/brain/` |
| Personal facts, preferences, projects, decisions | Active Wiki | `~/.autognosia/active-wiki/` |

**If content is mixed:** Split it — reference material to Oracle, personal context to Active Wiki with cross-reference links.

## Pass 1: Inventory

Scan incoming files to record:
- Path, file size, heading structure
- Existing frontmatter, links, citations
- Likely domain and page type
- Potential duplicates

## Pass 2: Structural Normalization

Without changing substantive knowledge:
- Add stable IDs with domain prefixes (e.g., `neuro-`, `ai-`, `phil-`, `psych-`)
- Add frontmatter per schema (title, created, updated, type, tags)
- Normalize filenames to lowercase kebab-case
- Normalize heading levels (one H1 per page)
- Add aliases
- Assign domains and page types
- Generate indexes
- Preserve wording and citations

## Pass 3: Split Oversized Files

Only split obvious multi-topic files over 200 lines:
- Preserve a map or redirect at the original location
- Split when file contains independently searchable subjects, different freshness requirements, or unrelated content

## Pass 4: Knowledge-Quality Review

Only after structural normalization:
- Identify contradictions
- Mark stale claims
- Flag missing provenance
- Merge duplicates carefully
- Add missing links
- Create comparison pages
- Create synthesis pages
- Submit verification questions to Researcher profile

## Important

- Never combine structural migration and substantive rewriting into one uncontrolled operation
- Do not fabricate provenance for AI-generated knowledge files
- Validate schema compliance before completing import
