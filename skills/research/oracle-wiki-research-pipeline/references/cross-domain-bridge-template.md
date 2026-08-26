# Cross-Domain Bridge Document Template

Validated structure for bridge documents connecting two domains in the Oracle vault.

## File Location

`$HOME/.autognosia/oracle/brain\Cross-Domain\DomainA-and-DomainB.md`

## Structure (≤12KB)

```markdown
# Domain A × Domain B: A Cross-Domain Bridge

> **Status:** Cross-Domain Bridge Document | **Created:** YYYY-MM-DD
> **Scope:** One-line description of what the bridge covers

---

## 1. Introduction
- What Domain A is (2-3 sentences)
- What Domain B is (2-3 sentences)
- Convergence point: why these two fields should talk (1 paragraph)

---

## 2. [First Core Question]
### 2.1 The Challenge / Background
### 2.2 Key Methods or Approaches
### 2.3 Practical Pipeline or Protocol

---

## 3. [Second Core Question]
### 3.1 The Logical Structure
### 3.2 What the Evidence Means
### 3.3 Key Findings or Data Points

---

## 4. [Third Core Question — Technical Intersection]
### 4.1 Theoretical Connection
### 4.2 Why X doesn't work as Y
### 4.3 Concrete Measurement Proposal
### 4.4 Limitations

---

## 5. [Fourth Core Question — Testing / Validation]
### 5.1 Most Promising Approach
### 5.2 Concrete Testing Protocol
### 5.3 What Would Count as Evidence

---

## 6. [Critiques / Limitations]
### 6.1 Critique 1 — **Critique:** ... **Response:** ... **Assessment:** ...
### 6.2 Critique 2 — (same format)
### 6.3 Critique 3 — (same format)
...

---

## 7. Research Agenda
1-6 numbered items with bold title and one-line description

---

## Key References
- Author (Year). "Title." Source.
...

---

*Oracle wiki cross-domain research. Last verified: YYYY-MM-DD.*
```

## Writing Rules

1. **No TOC** — saves ~400 chars; section headers are scannable enough
2. **Critique format** — Each critique gets three inline labels: **Critique:**, **Response:**, **Assessment:** (compact but complete)
3. **Research agenda** — 6-7 items max, each bold title + one-line description
4. **References** — 8-10 key sources, one line each
5. **Front matter** — Status line + created date + scope description
6. **Size discipline** — First drafts run 13-16KB; trim by cutting biographical fluff, merging sections, and using inline formats instead of multi-line lists
7. **Verify size** — `wc -c` after writing; use `patch` to trim if over 12KB

## Research Sources for Bridges

- Read existing vault content in both domains (index.md + deep dive files)
- Use web_search for current research (or arXiv API fallback)
- Cross-reference papers cited in both domains
- Look for explicit intersection papers (search both domain keywords together)
