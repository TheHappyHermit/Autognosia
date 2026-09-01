#!/usr/bin/env python3
"""
Email & Communications Triage Bridge for Autognosia.
Loads triaged email packages from:
- ${HOME}/.autognosia/exchange/email/ (incoming JSON/Webhook payloads)
- Local inbox cache
Extracts high-priority messages, action items, detected deadlines, and sender context.
"""

import os
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any

AUTOGNOSIA_HOME = Path(os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia")))
EMAIL_DIR = AUTOGNOSIA_HOME / "exchange" / "email"
EMAIL_CACHE_FILE = EMAIL_DIR / "inbox_cache.json"

def ensure_email_dir():
    EMAIL_DIR.mkdir(parents=True, exist_ok=True)

def get_triaged_emails() -> List[Dict[str, Any]]:
    """Retrieve prioritized email triage stream with extracted action items."""
    ensure_email_dir()
    
    # If custom cache exists, load it
    if EMAIL_CACHE_FILE.exists():
        try:
            with open(EMAIL_CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # No email feed has populated the cache yet; an empty list is returned.
    return []

def save_triaged_emails(emails: List[Dict[str, Any]]):
    ensure_email_dir()
    with open(EMAIL_CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(emails, f, indent=2)

if __name__ == "__main__":
    emails = get_triaged_emails()
    print(f"Total triaged communications: {len(emails)}")
    for em in emails:
        print(f" - [{em['priority'].upper()}] {em['sender']}: {em['subject']}")
        for act in em.get("extracted_action_items", []):
            print(f"    * Action: {act['task']} (Due: {act['due']})")
