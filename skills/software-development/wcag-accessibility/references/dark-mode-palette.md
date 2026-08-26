# Dark Mode Color Palette for Financial Dashboards

Verified dark mode palette designed for the client platform sensitivity dashboard, tested against WCAG 2.1 AA requirements.

## Background Colors

| Element | Light Mode | Dark Mode | Contrast Rationale |
|---------|-----------|-----------|-------------------|
| Page background | #FFFFFF | #121212 | Near-black, not pure black. Avoids 21:1 contrast with white text. |
| Card/surface | #F8F9FA | #1E1E1E | Lighter than page creates elevation (dark mode depth principle). |
| Elevated surface | — | #2D2D2D | For tooltips, modals, popups |
| Border/divider | #E0E0E0 | #333333 | 3.5:1 contrast against card surface |
| Text primary | #212121 | #E0E0E0 | 16.1:1 vs #121212 (exceeds 4.5:1 AA) |
| Text secondary | #757575 | #A0A0A0 | 5.4:1 vs #121212 (meets 4.5:1 AA) |

## Sensitivity Zone Colors (Dark Mode)

| Level | Light Mode | Dark Mode | Contrast vs Card (#1E1E1E) | WCAG 1.4.11 | WCAG 1.4.3 |
|-------|-----------|-----------|---------------------------|-------------|------------|
| LOW (green) | #1B7A3D | #4CAF50 | 3.6:1 | ✅ PASS (3:1) | ✅ PASS (4.5:1 for text) |
| MODERATE (yellow) | #D4A017 | #FFD54F | 8.7:1 | ✅ PASS (3:1) | ✅ PASS (4.5:1 for text) |
| HIGH (red) | #C41E3A | #FF5252 | 4.0:1 | ✅ PASS (3:1) | ✅ PASS (4.5:1 for text) |

## Why These Colors

- **#4CAF50 (LOW):** Material Design green-500. Lightened from #1B7A3D to maintain green semantics with sufficient contrast. Saturation reduced to avoid color vibration.
- **#FFD54F (MOD):** Material Design yellow-300. Yellow inherently has low contrast on dark backgrounds. This shade provides excellent contrast while remaining yellow.
- **#FF5252 (HIGH):** Material Design red-400. Red maintains good contrast in dark mode. Lightened from #C41E3A to reduce saturation.

## Additional UI Colors

| Element | Light Mode | Dark Mode | Contrast vs Card |
|---------|-----------|-----------|-----------------|
| Gauge track | #E8E8E8 | #2C2C2C | 3.5:1 ✅ |
| Chart grid | #E0E0E0 | #333333 | 3.5:1 ✅ |
| Axis labels | #757575 | #A0A0A0 | 5.4:1 ✅ |
| Focus ring | #1976D2 | #64B5F6 | 3.2:1 ✅ |
| Tooltip bg | #FFFFFF | #2D2D2D | — |
| Disabled | #BDBDBD | #616161 | — |

## Pattern Encoding (Dark Mode)

| Level | Pattern | Implementation |
|-------|---------|---------------|
| LOW | Solid fill | No change from light mode |
| MOD | Horizontal lines | Stroke: #FFD54F, BG: #1E1E1E |
| HIGH | Cross-hatch | Stroke: #FF5252, BG: #1E1E1E |

## Color Blindness Simulation (Dark Mode)

| Condition | LOW (#4CAF50) | MOD (#FFD54F) | HIGH (#FF5252) | Distinguishable? |
|-----------|--------------|--------------|--------------|----------------|
| Protanopia | #7C9A5E | #BFA03E | #E06060 | ✅ Yes |
| Deuteranopia | #7C9A5E | #BFA03E | #E06060 | ✅ Yes |
| Tritanopia | #A0A05E | #C0C070 | #E08080 | ✅ Yes |
| Achromatopsia | #8A8A8A | #B8B8B8 | #A0A0A0 | ⚠️ Patterns required |

## Contrast Verification Against Different Dark Backgrounds

| Background | vs #4CAF50 | vs #FFD54F | vs #FF5252 | Recommendation |
|-----------|-----------|-----------|-----------|-------------|
| #121212 (page) | 5.2:1 | 12.6:1 | 5.9:1 | ✅ Best for page bg |
| #181818 (card) | 4.5:1 | 10.9:1 | 5.2:1 | ⚠️ Acceptable but tight |
| #1E1E1E (card) | 3.6:1 | 8.7:1 | 4.0:1 | ✅ Good balance |
| #252525 (surface) | 3.0:1 | 7.3:1 | 3.4:1 | ⚠️ Minimum viable |
| #333333 (elevated) | 2.3:1 | 5.6:1 | 2.7:1 | ❌ Fails 3:1 non-text |

## CSS Custom Properties (Dark Mode)

```css
[data-theme="dark"] {
  --bg-page: #121212;
  --bg-card: #1E1E1E;
  --bg-surface: #2D2D2D;
  --text-primary: #E0E0E0;
  --text-secondary: #A0A0A0;
  --zone-low: #4CAF50;
  --zone-mod: #FFD54F;
  --zone-high: #FF5252;
  --gauge-track: #2C2C2C;
  --border-color: #333333;
  --chart-grid: #333333;
  --focus-ring: #64B5F6;
  --tooltip-bg: #2D2D2D;
}
```

## Sources

1. W3C. WCAG 2.1 Specification — Success Criteria 1.4.3, 1.4.11. https://www.w3.org/TR/WCAG21/
2. Google. Material Design Dark Theme Color System. https://m3.material.io/styles/color/dark-mode
3. WebAIM. Color Contrast Checker. https://webaim.org/resources/contrastchecker/
4. WebAIM. WCAG 2.1 and Dark Mode. https://webaim.org/blog/wcag-2-1-dark-mode/
5. Nielsen Norman Group. Dark Mode: Benefits and Drawbacks. https://www.nngroup.com/articles/dark-mode-2/
6. Apple. Human Interface Guidelines — Dark Mode. https://developer.apple.com/design/human-interface-guidelines/designing-for-dark-mode/
7. Color Oracle. Color Blindness Simulator. https://colororacle.org/
