#!/usr/bin/env python3
"""append_research.py — WealthForge Deep Research cron append helper.

Appends a researched markdown entry to RESEARCH.md (both the
Documents/Hermes-Vault copy and the Projects copy, to keep the two
divergent inodes reconciled) and marks the source AGENDA item
`[⏳]` -> `[✅]`, optionally inserting new `[⏳]` subtopics inline.

Usage:
  python3 append_research.py --topic <topic_id> --title "<title>" \
      --file /tmp/research_entry.md [--new-subtopics "<raw markdown>"]
"""
import argparse
import os
import re
import sys

AGENDA = "/home/josh434/Documents/Hermes-Vault/wealthforge-roadmap/AGENDA.md"
EMPLOYEE_AGENDA = "/home/josh434/Documents/Hermes-Vault/wealthforge-roadmap/EMPLOYEE-ROLES-RESEARCH.md"
RESEARCH_PATHS = [
    "/home/josh434/Documents/Hermes-Vault/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md",
    "/home/josh434/Projects/wealthforge-ai-local/knowledge_base/research_outcomes/RESEARCH.md",
]


def append_to_research(paths, title, body):
    for p in paths:
        if not os.path.exists(p):
            print(f"WARN: RESEARCH.md not found, skipping: {p}", file=sys.stderr)
            continue
        with open(p, "a", encoding="utf-8") as f:
            f.write("\n\n---\n\n")
            f.write(f"# {title}\n\n")
            f.write(body)
        print(f"appended to {p} ({os.path.getsize(p)} bytes)")


def mark_agenda(topic, new_subtopics):
    for agenda_path in (AGENDA, EMPLOYEE_AGENDA):
        if not os.path.exists(agenda_path):
            continue
        with open(agenda_path, "r", encoding="utf-8") as f:
            s = f.read()
        # Support both plain (`[⏳] topic `) and bold (`[⏳] **topic**`)
        # marker formats, plus the parenthetical `(topic` variant used when
        # subtopics are appended inline.
        candidates = [
            ("[⏳] " + topic + " ", "[✅] " + topic + " "),
            ("[⏳] " + topic + "(", "[✅] " + topic + "("),
            ("[⏳] **" + topic + "**", "[✅] **" + topic + "**"),
            ("[⏳] **" + topic + "**(", "[✅] **" + topic + "**("),
        ]
        matched = False
        for old, new in candidates:
            if old in s:
                s = s.replace(old, new, 1)
                matched = True
                break
        if not matched:
            continue

        if new_subtopics:
            marker = "[✅] " + topic + "("
            idx = s.find(marker)
            if idx != -1:
                rest = s[idx:]
                m = re.search(r"\), (\[⏳\])", rest)
                if m:
                    insert_at = idx + m.start() + len("), ")
                    s = s[:insert_at] + "— New subtopics: " + new_subtopics + ". " + s[insert_at:]
                else:
                    s = s.rstrip() + "\n- New subtopics from " + topic + ": " + new_subtopics + "\n"
            else:
                s = s.rstrip() + "\n- New subtopics from " + topic + ": " + new_subtopics + "\n"

        with open(agenda_path, "w", encoding="utf-8") as f:
            f.write(s)
        print(f"marked {agenda_path} item [✅] and inserted subtopics (if any); {os.path.getsize(agenda_path)} bytes")
        return
    raise SystemExit(f"ERROR: topic not found in any agenda: {topic}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--topic", required=True)
    ap.add_argument("--title", required=True)
    ap.add_argument("--file", required=True)
    ap.add_argument("--new-subtopics", default="")
    args = ap.parse_args()

    with open(args.file, "r", encoding="utf-8") as f:
        body = f.read()

    append_to_research(RESEARCH_PATHS, args.title, body)
    mark_agenda(args.topic, args.new_subtopics)
    print("DONE")


if __name__ == "__main__":
    main()
