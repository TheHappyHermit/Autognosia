#!/usr/bin/env python3
"""
WCAG AA Contrast Checker for Command Deck Design Tokens.
Parses oklch() values from tokens.css, converts via OKlab→sRGB, verifies ratios.
Pure Python math — no dependencies.
"""
import re
import sys
import math

def oklch_to_srgb(L, C, H):
    """Convert oklch to linear sRGB via OKlab, then apply gamma."""
    H_rad = math.radians(H)
    a = C * math.cos(H_rad)
    b = C * math.sin(H_rad)

    # OKlab → linear sRGB (cubed)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b

    # Cube to linear sRGB
    r_lin = l_ ** 3
    g_lin = m_ ** 3
    b_lin = s_ ** 3

    # Linear sRGB → display sRGB matrix
    r =  4.0767416621 * r_lin - 3.3077115913 * g_lin + 0.2309699292 * b_lin
    g = -1.2684380046 * r_lin + 2.6097574011 * g_lin - 0.3413193965 * b_lin
    b = -0.0041960863 * r_lin - 0.7034186147 * g_lin + 1.7076147010 * b_lin

    # Clamp
    r = max(0.0, min(1.0, r))
    g = max(0.0, min(1.0, g))
    b = max(0.0, min(1.0, b))

    # Gamma correct
    def gamma(c):
        if c <= 0.0031308:
            return 12.92 * c
        return 1.055 * (c ** (1.0 / 2.4)) - 0.055

    return gamma(r), gamma(g), gamma(b)

def relative_luminance(r, g, b):
    """WCAG relative luminance from linear (non-gamma-corrected) sRGB."""
    # First undo gamma to get linear
    def linearize(c):
        if c <= 0.04045:
            return c / 12.92
        return ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)

def contrast_ratio(l1, l2):
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def parse_oklch(s):
    m = re.match(r'oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*/\s*([\d.]+))?\s*\)', s)
    if not m:
        return None
    L = float(m.group(1))
    C = float(m.group(2))
    H = float(m.group(3))
    alpha = float(m.group(4)) if m.group(4) else 1.0
    return L, C, H, alpha

def parse_css_vars(path):
    tokens = {}
    with open(path) as f:
        for line in f:
            m = re.match(r'\s*(--[\w-]+)\s*:\s*(oklch\([^)]+\))\s*;', line)
            if m:
                parsed = parse_oklch(m.group(2))
                if parsed:
                    tokens[m.group(1)] = parsed
    return tokens

def get_luminance(token):
    L, C, H, alpha = token
    r, g, b = oklch_to_srgb(L, C, H)
    return relative_luminance(r, g, b)

def check_contrast(fg_token, bg_token, level='AA', size='normal'):
    fg_lum = get_luminance(fg_token)
    bg_lum = get_luminance(bg_token)
    ratio = contrast_ratio(fg_lum, bg_lum)
    if level == 'AA':
        threshold = 3.0 if size == 'large' else 4.5
    else:
        threshold = 4.5 if size == 'large' else 7.0
    return ratio, ratio >= threshold

def main():
    css_path = sys.argv[1] if len(sys.argv) > 1 else '/home/josh434/oc-work/dashboard-20260830T075510Z/tokens.css'
    tokens = parse_css_vars(css_path)

    print("=" * 70)
    print("WCAG AA CONTRAST REPORT — Autognosia Command Deck")
    print("=" * 70)

    surfaces = {
        '--bg-base (L0)': tokens.get('--bg-base'),
        '--surface-card (L2)': tokens.get('--surface-card'),
        '--surface-glass (L3@0.60)': tokens.get('--surface-glass'),
    }

    text = {
        '--text-1 (primary)': tokens.get('--text-1'),
        '--text-2 (secondary)': tokens.get('--text-2'),
        '--text-3 (meta/labels)': tokens.get('--text-3'),
    }

    status = {
        '--success': tokens.get('--success'),
        '--warning': tokens.get('--warning'),
        '--danger': tokens.get('--danger'),
        '--info': tokens.get('--info'),
        '--accent': tokens.get('--accent'),
    }

    failures = []

    print("\n── TEXT × SURFACE CONTRAST (AA normal ≥ 4.5:1) ──\n")
    print(f"{'Pair':<50} {'Ratio':>8} {'AA':>6}")
    print("-" * 70)

    for tname, ttok in text.items():
        if not ttok:
            continue
        for sname, stok in surfaces.items():
            if not stok:
                continue
            ratio, passes = check_contrast(ttok, stok, 'AA', 'normal')
            label = f"{tname} × {sname}"
            mark = "PASS" if passes else "FAIL"
            print(f"{label:<50} {ratio:>7.2f}:1 {mark:>6}")
            if not passes:
                failures.append((label, ratio, 4.5))

    print("\n── STATUS COLORS × SURFACE (non-text, AA ≥ 3:1) ──\n")
    print(f"{'Pair':<50} {'Ratio':>8} {'AA':>6}")
    print("-" * 70)

    card = surfaces.get('--surface-card (L2)')
    base = surfaces.get('--bg-base (L0)')
    for sname, stok in status.items():
        if not stok:
            continue
        for bg_name, bg_tok in [('L2 card', card), ('L0 base', base)]:
            if not bg_tok:
                continue
            ratio, passes = check_contrast(stok, bg_tok, 'AA', 'large')
            label = f"{sname} × {bg_name}"
            mark = "PASS" if passes else "FAIL"
            print(f"{label:<50} {ratio:>7.2f}:1 {mark:>6}")
            if not passes:
                failures.append((label, ratio, 3.0))

    print("\n" + "=" * 70)
    if failures:
        print(f"RESULT: {len(failures)} FAILURE(S)")
        for label, ratio, threshold in failures:
            print(f"  ✗ {label}: {ratio:.2f}:1 (need ≥ {threshold}:1)")
        sys.exit(1)
    else:
        print("RESULT: ALL PAIRS PASS WCAG AA ✓")
        sys.exit(0)

if __name__ == '__main__':
    main()
