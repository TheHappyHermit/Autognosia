#!/usr/bin/env python3
"""
Rebuild Oracle search index from Active Wiki.

This script rebuilds the Oracle search index by scanning the Active Wiki
and updating the Oracle brain directory with any new or modified pages.
"""

import os
import shutil
import subprocess
from datetime import datetime

AUTOGNOSIA_HOME = os.path.expanduser("${HOME}/.autognosia")
ACTIVE_WIKI = os.path.join(AUTOGNOSIA_HOME, "active-wiki")
ORACLE_BRAIN = os.path.join(AUTOGNOSIA_HOME, "oracle", "brain")
ORACLE_RAW = os.path.join(AUTOGNOSIA_HOME, "oracle", "raw")

def ensure_dirs():
    os.makedirs(ORACLE_BRAIN, exist_ok=True)
    os.makedirs(ORACLE_RAW, exist_ok=True)

def get_wiki_files():
    """Get all markdown files from Active Wiki."""
    files = []
    for root, dirs, filenames in os.walk(ACTIVE_WIKI):
        for fn in filenames:
            if fn.endswith(".md"):
                files.append(os.path.join(root, fn))
    return files

def rebuild_index():
    """Rebuild Oracle index from Active Wiki."""
    ensure_dirs()
    
    wiki_files = get_wiki_files()
    if not wiki_files:
        print("No wiki files found")
        return
    
    # Copy new/modified files to Oracle brain
    copied = 0
    for src in wiki_files:
        rel_path = os.path.relpath(src, ACTIVE_WIKI)
        dst = os.path.join(ORACLE_BRAIN, rel_path)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        
        # Copy if file is newer or doesn't exist
        if not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst):
            shutil.copy2(src, dst)
            copied += 1
    
    # Log the rebuild
    log_file = os.path.join(AUTOGNOSIA_HOME, "oracle", "rebuild-log.md")
    with open(log_file, "a") as f:
        f.write(f"{datetime.now().isoformat()}: Rebuilt index, copied {copied} files\n")
    
    print(f"Oracle index rebuilt: {copied} files copied")

if __name__ == "__main__":
    rebuild_index()
