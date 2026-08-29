# Competitive Accessibility Analysis for Financial Software

Methodology for auditing competitor accessibility — dark mode support, WCAG compliance, and screen reader compatibility.

## Platform Audit Results (as of 2026-05)

| Platform | Dark Mode? | Published WCAG Audit | Screen Reader Support | Color Blindness Support | Notes |
|----------|-----------|---------------------|----------------------|------------------------|-------|
| eMoney Advisor | ❌ No | No | Partial | No | Largest market share, no dark mode |
| RightCapital | ⚠️ Beta | No | Partial | No | Dark mode in beta as of 2025 |
| MoneyGuidePro | ⚠️ Limited | No | Partial | No | Basic dark mode, no audit |
| Orion (Charles River) | ⚠️ Limited | Partial | Partial | No | Dark mode for internal use only |
| Tamarack (Plannerix) | ❌ No | No | Partial | No | No dark mode |
| Addepar | ✅ Yes | Partial | Partial | No | Most mature dark mode, partial a11y |
| Black Diamond (BlackRock) | ⚠️ Limited | No | Partial | No | Basic dark mode |
| Salesforce FSC | ✅ Yes | Partial | Good | No | Theming engine supports dark mode |

## Competitive Gaps Identified

1. **Zero competitors have published dark mode accessibility audits** — WealthForge can own this space
2. **Most lack dark mode entirely** — eMoney, Tamarack, MoneyGuidePro have no dark mode
3. **No competitor addresses color blindness** for their financial visualizations
4. **No competitor provides screen reader equivalents for data visualizations** (chart data tables)
5. **No competitor has automated accessibility testing in CI/CD**

## Audit Methodology

### Manual Testing Checklist

1. **System dark mode detection** — Toggle OS preference, verify automatic switch
2. **User theme override** — Click theme toggle, verify persistence across sessions
3. **Text contrast** — WebAIM Contrast Checker, all text ≥ 4.5:1 on page bg
4. **Non-text contrast** — WebAIM Contrast Checker, all UI ≥ 3:1 on card bg
5. **Color blindness simulation** — Stark/Figma plugin, verify zones distinguishable in all modes
6. **Screen reader test** — NVDA (Windows) / VoiceOver (macOS), all elements announced correctly
7. **Keyboard navigation** — Tab through all interactive elements, logical order, visible focus
8. **Zoom to 200%** — Browser zoom, no content loss or overlap
9. **Touch target size** — Measure with browser devtools, all interactive elements ≥ 44x44 CSS px
10. **Pattern encoding** — Print dashboard to PDF, patterns distinguishable without color

### Automated Testing Stack

| Tool | What It Tests | Dark Mode Support | Coverage |
|------|--------------|------------------|----------|
| axe-core | WCAG violations in DOM | ✅ Yes | ~60% of WCAG |
| Pa11y | Page-level accessibility | ✅ Yes | ~50% of WCAG |
| Lighthouse CI | Performance + a11y | ✅ Yes | ~40% of WCAG |
| contrast-check | Design token contrast | ✅ Yes | 100% of tokens |
| Playwright a11y | Visual regression + a11y | ✅ Yes | ~65% of WCAG |

## Key Takeaways for WealthForge

1. Dark mode accessibility is a **differentiator** — no competitor has published an audit
2. Color-blind accessible financial visualizations are **uniquely underserved**
3. Screen reader chart alternatives are the **biggest gap** across all platforms
4. Automated a11y testing in CI/CD is **owned by no competitor**
5. WCAG compliance documentation is a **trust signal** for enterprise buyers

## Sources

1. W3C. WCAG 2.1 Specification. https://www.w3.org/TR/WCAG21/
2. WebAIM. WCAG 2.1 Checklist. https://webaim.org/standards/wcag/checklist/
3. WebAIM. Screen Reader User Survey (2024). https://webaim.org/projects/screenreader_survey9/
4. EcomBack. 2025 Mid-Year ADA Website Lawsuit Report. https://www.ecomback.com/ada-website-lawsuits-recap-report/2025-mid-year-ada-website-lawsuit-report
5. European Commission. European Accessibility Act (2019/882). https://eur-lex.europa.eu/eli/reg/2019/882
6. GSA. Section 508 Standards. https://www.section508.gov/
7. DOJ. ADA Title III and Digital Accessibility. https://www.ada.gov/law-and-regs/digital/
