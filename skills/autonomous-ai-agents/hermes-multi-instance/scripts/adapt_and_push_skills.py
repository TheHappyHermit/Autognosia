#!/usr/bin/env python3
"""Adapt desktop Hermes skills to agent-VM (cortex) paths and stage them for push.

Usage:  python adapt_and_push_skills.py [extra_skill_dir ...]
        (defaults to the seven verified desktop-only skills; pass extra relative
         dirs under the local skills root to include more)

Writes an adapted tree to <tempdir>/cortex_skills_push, prints how many files
changed, then verifies no Windows paths remain. Push with:

    cd /tmp/cortex_skills_push   # MSYS view of C:\\tmp\\cortex_skills_push
    tar -cf - . | ssh -i ~/.ssh/id_ed25519_agent_server <username>@10.1.1.37 \
        "mkdir -p ~/.hermes/skills/research ~/.hermes-cortex/incoming && tar -xf - -C ~/.hermes/skills/"

Windows notes: run with `python` (no python3 on this box). MSYS /tmp maps to
C:\\tmp, so the tree lands at C:\\tmp\\cortex_skills_push.
"""
import os
import re
import shutil
import sys
import tempfile

SRC = os.path.join(os.path.expanduser("~"), "AppData", "Local", "hermes", "skills")
DST = os.path.join(tempfile.gettempdir(), "cortex_skills_push")

# (pattern, replacement) — order matters: longest/most specific first.
RULES = [
    (r"C:\\Hermes\\Oracle\\Vault", "$HOME/.autognosia/oracle/brain"),
    (r"/c/Hermes/Oracle/Vault", "$HOME/.autognosia/oracle/brain"),
    (r"C:\\Hermes\\LLM_WIKI", "$HOME/.autognosia/active-wiki"),
    (r"/c/Hermes/LLM_WIKI", "$HOME/.autognosia/active-wiki"),
    (r"C:\\Hermes\\Oracle\\Incoming", "$HOME/.hermes-cortex/incoming"),
    (r"/c/Hermes/Backups/Daily/", "~/backups/"),
    (r"~/AppData/Local/hermes/logs/", "~/.hermes/logs/"),
    (r"~/AppData/Local/hermes/cron/jobs.json", "~/.hermes/cron/jobs.json"),
    (r"~/AppData/Local/hermes/state\.db", "~/state.db"),  # e.g. emergency .bak globs
    (r"C:\\Hermes\\.hermes.md", "~/.hermes-cortex/SYSTEM-RULES.md"),
]

DEFAULT_DIRS = [
    "oracle-query",
    "research/llm-wiki-commands",
    "research/oracle-entity-creation",
    "research/oracle-wiki-research-pipeline",
    "research/wiki-maintenance-hermes",
    "hermes-troubleshooting",  # includes nested cron-job-management skill
]


def main() -> None:
    dirs = list(sys.argv[1:] or DEFAULT_DIRS)
    if os.path.exists(DST):
        shutil.rmtree(DST)

    changed = total = 0
    for d in dirs:
        s = os.path.join(SRC, d)
        t = os.path.join(DST, d)
        if not os.path.isdir(s):
            print(f"SKIP (not found locally): {d}")
            continue
        for root, _, files in os.walk(s):
            rel = os.path.relpath(root, s)
            outdir = t if rel == "." else os.path.join(t, rel)
            os.makedirs(outdir, exist_ok=True)
            for f in files:
                p = os.path.join(root, f)
                with open(p, "r", encoding="utf-8") as fh:
                    text = fh.read()
                orig = text
                for pat, rep in RULES:
                    text = re.sub(pat, rep, text)
                if text != orig:
                    changed += 1
                total += 1
                with open(os.path.join(outdir, f), "w", encoding="utf-8") as fh:
                    fh.write(text)

    print(f"staged {total} files ({changed} adapted) -> {DST}")
    print("Next: grep -rnE 'C:\\\\Hermes|/c/Hermes|AppData' <tree>  # expect no output")


if __name__ == "__main__":
    main()
