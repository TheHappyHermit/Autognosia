#!/usr/bin/env python3
"""Dump selected brain source pages with per-file char caps for synthesis reading."""
import sys, os, re

BRAIN = "/home/<USER>/.autognosia/oracle/brain"

def dump(domain_files, cap=1800):
    for domain, files in domain_files:
        for f in files:
            p = os.path.join(BRAIN, domain, f if f.endswith(".md") else f + ".md")
            print(f"\n===== {domain}/{f} =====")
            if not os.path.exists(p):
                print("!! MISSING"); continue
            txt = open(p, encoding="utf-8", errors="ignore").read()
            # strip OKF frontmatter
            if txt.startswith("---"):
                end = txt.find("---", 3)
                if end != -1:
                    txt = txt[end+3:]
            # collapse the imported banner
            txt = re.sub(r"> Imported from.*?\n", "", txt)
            txt = txt.strip()
            if len(txt) > cap:
                txt = txt[:cap] + "\n...[TRUNCATED]"
            print(txt)

if __name__ == "__main__":
    import json
    spec = json.loads(sys.argv[1])
    cap = int(sys.argv[2]) if len(sys.argv) > 2 else 1800
    dump([(d, fs) for d, fs in spec], cap)
