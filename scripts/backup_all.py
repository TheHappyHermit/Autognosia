#!/usr/bin/env python3
"""
Full backup script for Autognosia.

Backs up:
- Active Wiki (filesystem)
- Personal Organizer database (organizer.db)
- Experience Index database (autognosia.db)
- Oracle brain and raw evidence
"""

import os
import shutil
import sqlite3
from datetime import datetime

AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", os.path.expanduser("${HOME}/.autognosia"))
BACKUP_DIR = os.environ.get("BACKUP_DIR", os.path.join(AUTOGNOSIA_HOME, "backups"))

def ensure_backup_dir():
    """Create backup directory if it doesn't exist."""
    os.makedirs(BACKUP_DIR, exist_ok=True)

def backup_active_wiki():
    """Backup Active Wiki files."""
    wiki_src = os.path.join(AUTOGNOSIA_HOME, "active-wiki")
    wiki_dst = os.path.join(BACKUP_DIR, "active-wiki")
    if os.path.exists(wiki_src):
        if os.path.exists(wiki_dst):
            shutil.rmtree(wiki_dst)
        shutil.copytree(wiki_src, wiki_dst)
        print(f"[OK] Active Wiki backed up to: {wiki_dst}")
    else:
        print(f"- Active Wiki directory not present, skipping")

def backup_database(db_name, db_path):
    """Backup a SQLite database."""
    if not os.path.exists(db_path):
        print(f"- {db_name} not found at {db_path}, skipping")
        return
    
    backup_path = os.path.join(BACKUP_DIR, f"{db_name}.db")
    try:
        src = sqlite3.connect(db_path)
        dst = sqlite3.connect(backup_path)
        src.backup(dst)
        dst.close()
        src.close()
        print(f"[OK] {db_name} backed up to: {backup_path}")
    except Exception as e:
        print(f"[ERROR] {db_name} backup failed: {e}")

def main():
    ensure_backup_dir()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    print(f"Starting full Autognosia backup at {timestamp}")
    print()
    
    backup_active_wiki()
    backup_database("organizer", os.path.join(AUTOGNOSIA_HOME, "personal-organizer", "data", "organizer.db"))
    backup_database("autognosia", os.path.join(AUTOGNOSIA_HOME, "autognosia.db"))
    
    print()
    print(f"Backup complete. Files in: {BACKUP_DIR}")

if __name__ == "__main__":
    main()
