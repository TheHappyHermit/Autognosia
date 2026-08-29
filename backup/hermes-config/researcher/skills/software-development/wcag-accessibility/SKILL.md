---
name: wcag-accessibility
description: Systematic approach to auditing and ensuring WCAG 2.1 AA compliance for web applications, with emphasis on financial dashboards, dark mode accessibility, color palette design, and competitive accessibility analysis.
tags: [wcag, accessibility, dark-mode, color-palette, contrast, audit, a11y]
---

# WCAG Accessibility Audit

Systematic approach to auditing and ensuring WCAG 2.1 AA compliance for web applications, with emphasis on financial dashboards and data visualization.

## When to Use

- Designing or auditing dark mode themes for accessibility compliance
- Building color-coded data visualizations (sensitivity dashboards, charts, gauges)
- Conducting accessibility competitive analysis of financial software platforms
- Implementing automated accessibility testing in CI/CD
- Designing color palettes that work across light and dark modes
- Planning screen reader alternatives for visual content

## Core Methodology

### 1. WCAG Criteria Mapping

Map all relevant WCAG 2.1 AA criteria to the feature:

| Criterion | Name | Requirement | Applies to |
|-----------|------|-------------|------------|
| 1.4.3 | Contrast (Minimum) | Text: 4.5:1 ratio | All text labels |
| 1.4.6 | Contrast (Enhanced) | Text: 7:1 ratio | Critical financial data (recommended) |
| 1.4.11 | Non-text Contrast | UI components: 3:1 | Gauge borders, chart lines, zone fills |
| 1.4.13 | Content on Hover/Focus | Hover/focus doesn't destroy | Interactive tooltips |
| 1.4.4/1.4.13 | Resize Text | Up to 200% without loss | Responsive behavior |
| 1.4.10 | Re-flow | Single-column at 320px | Mobile viewport |
| 1.4.12 | Text Spacing | User-adjustable | CSS custom properties |

### 2. Dark Mode Contrast Problem

**Key principle:** Dark mode is NOT inverted light mode. Colors must be adjusted for dark backgrounds to maintain WCAG contrast while preserving color semantics.

**Common failure pattern:** Light-mode colors used directly on dark backgrounds fail WCAG 2.1 AA. Example: #1B7A3D (green) has 2.7:1 contrast on #1E1E1E — below the 3:1 non-text minimum.

**Design principles:**
1. Never use pure black (#000000) — use near-black (#121212, #181818)
2. Lighten dark-mode colors proportionally to maintain contrast
3. Maintain color semantics (green=calm, red=urgent) even when lightened
4. Reduce saturation by 10-20% in dark mode to avoid color vibration
5. Use surface elevation (lighter = higher) for depth in dark mode

### 3. Color Palette Design Process

1. Start with light-mode palette and its semantic meaning
2. Calculate required lightening for target dark background
3. Verify all colors meet WCAG thresholds:
   - Text: ≥ 4.5:1 against page background
   - Non-text (zone fills, gauge, chart): ≥ 3:1 against card background
4. Adjust for color blindness simulation (protanopia, deuteranopia, tritanopia, achromatopsia)
5. Add pattern encoding as fallback for total color blindness

### 4. Competitive Accessibility Analysis

When evaluating competitor accessibility:
- Check for published accessibility reports or WCAG audits
- Verify dark mode support and its accessibility status
- Test with screen readers (NVDA, VoiceOver)
- Check color blindness simulation
- Note gaps as competitive advantages

### 5. Automated Testing Stack

Three-layer approach covering 95%+ of WCAG violations:
1. **axe-core** — component-level precision (~60% coverage)
2. **Pa11y** — SPA page-level coverage (~50% coverage)
3. **Lighthouse CI** — trend tracking (~40% coverage)
4. **contrast-check** — design token level (100% of defined tokens)

## Reference Files

- `references/dark-mode-palette.md` — Verified dark mode color palettes with WCAG contrast ratios
- `references/competitive-a11y.md` — Competitive accessibility analysis methodology
- `scripts/contrast-check.py` — Automated WCAG contrast verification script

## Pitfalls

- **Never assume dark mode inherits light mode contrast** — always recalculate for the dark background
- **Yellow inherently has low contrast on dark backgrounds** — requires significant lightening
- **Pure black backgrounds cause excessive contrast** with white text (21:1) — use near-black
- **No automated tool catches 100% of WCAG violations** — supplement with manual testing
- **Color semantics must be preserved** — a green that passes contrast but looks "urgent" defeats its purpose
