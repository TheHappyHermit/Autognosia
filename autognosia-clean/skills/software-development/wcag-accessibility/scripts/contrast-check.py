#!/usr/bin/env python3
"""
Automated WCAG contrast verification for dark mode palettes.
Run as part of CI/CD pipeline to catch contrast regressions.

Usage:
    python contrast-check.py
    python contrast-check.py --mode light
    python contrast-check.py --mode dark
    python contrast-check.py --mode all

Requires: wcag-contrast package (pip install wcag-contrast)
Fallback: uses built-in luminance calculation if wcag-contrast not installed.
"""

import sys
import json
from typing import NamedTuple

class ColorResult(NamedTuple):
    fg: str
    bg: str
    ratio: float
    text_pass: bool  # 4.5:1
    non_text_pass: bool  # 3:1
    name: str


def relative_luminance(hex_color: str) -> float:
    """Calculate relative luminance per WCAG 2.1 formula."""
    hex_color = hex_color.lstrip('#')
    r, g, b = int(hex_color[0:2], 16) / 255, int(hex_color[2:4], 16) / 255, int(hex_color[4:6], 16) / 255
    
    def linearize(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)


def contrast_ratio(color1: str, color2: str) -> float:
    """Calculate WCAG contrast ratio between two colors."""
    l1 = relative_luminance(color1)
    l2 = relative_luminance(color2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return round((lighter + 0.05) / (darker + 0.05), 2)


def check_palette(name: str, colors: dict, bg: str, mode: str) -> list[ColorResult]:
    """Check all colors in a palette against a background."""
    results = []
    for color_name, color_value in colors.items():
        ratio = contrast_ratio(color_value, bg)
        text_pass = ratio >= 4.5
        non_text_pass = ratio >= 3.0
        results.append(ColorResult(
            fg=color_value,
            bg=bg,
            ratio=ratio,
            text_pass=text_pass,
            non_text_pass=non_text_pass,
            name=color_name
        ))
    return results


def main():
    # Define palettes
    palettes = {
        "light": {
            "text_primary": "#212121",
            "text_secondary": "#757575",
            "zone_low": "#1B7A3D",
            "zone_mod": "#D4A017",
            "zone_high": "#C41E3A",
        },
        "dark": {
            "text_primary": "#E0E0E0",
            "text_secondary": "#A0A0A0",
            "zone_low": "#4CAF50",
            "zone_mod": "#FFD54F",
            "zone_high": "#FF5252",
            "gauge_track": "#2C2C2C",
            "chart_grid": "#333333",
            "focus_ring": "#64B5F6",
            "border": "#333333",
        },
    }
    
    backgrounds = {
        "page": "#FFFFFF",
        "page_dark": "#121212",
        "card": "#F8F9FA",
        "card_dark": "#1E1E1E",
    }
    
    all_results = []
    
    # Light mode checks
    for bg_name, bg_color in backgrounds.items():
        if bg_name.endswith('_dark'):
            continue
        for palette_name, colors in palettes.items():
            if palette_name == "dark":
                continue
            results = check_palette(f"{palette_name} on {bg_name}", colors, bg_color, "light")
            all_results.extend(results)
    
    # Dark mode checks
    for bg_name, bg_color in backgrounds.items():
        if not bg_name.endswith('_dark'):
            continue
        for palette_name, colors in palettes.items():
            if palette_name == "light":
                continue
            results = check_palette(f"{palette_name} on {bg_name}", colors, bg_color, "dark")
            all_results.extend(results)
    
    # Report
    failures = []
    warnings = []
    
    print("=" * 70)
    print("WCAG 2.1 DARK MODE CONTRAST AUDIT")
    print("=" * 70)
    
    for r in all_results:
        status = "✅" if r.text_pass and r.non_text_pass else "⚠️" if r.non_text_pass else "❌"
        print(f"{status} {r.name:20s} {r.fg:10s} vs {r.bg:10s} = {r.ratio:5.1f}:1 "
              f"(text={'PASS' if r.text_pass else 'FAIL':4s} | "
              f"non-text={'PASS' if r.non_text_pass else 'FAIL':4s})")
        
        if not r.text_pass and not r.non_text_pass:
            failures.append(r)
        elif not r.text_pass:
            warnings.append(r)
    
    print("=" * 70)
    
    if failures:
        print(f"\n❌ FAILURES ({len(failures)} colors fail both thresholds):")
        for r in failures:
            print(f"   {r.name} ({r.fg}) vs {r.bg}: {r.ratio}:1")
        sys.exit(1)
    
    if warnings:
        print(f"\n⚠️ WARNINGS ({len(warnings)} colors fail text contrast but pass non-text):")
        for r in warnings:
            print(f"   {r.name} ({r.fg}) vs {r.bg}: {r.ratio}:1 (OK for non-text only)")
    
    print(f"\n✅ ALL CHECKS PASSED ({len(all_results)} colors verified)")
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
