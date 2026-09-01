#!/usr/bin/env python3
"""Autognosia DB integrity checker - runs PRAGMA integrity, FK checks, schema validation."""
import sqlite3
import os
import json
from datetime import datetime, timezone

def utcnow():
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

def check_db(path, label):
    print(f'=== {label} ===')
    print(f'  Path: {path}')
    print(f'  Size: {os.path.getsize(path)} bytes')
    if not os.path.exists(path):
        print(f'  ERROR: Not found')
        return
    
    conn = sqlite3.connect(path)
    conn.execute('PRAGMA foreign_keys = ON')
    c = conn.cursor()
    
    # Integrity
    result = c.execute('PRAGMA integrity_check').fetchone()
    integrity_ok = result[0] == 'ok'
    print(f'  Integrity: {"PASS" if integrity_ok else "FAIL"} ({result[0]})')
    
    # Foreign keys
    fk_violations = c.execute('PRAGMA foreign_key_check').fetchall()
    print(f'  Foreign keys: {"PASS" if not fk_violations else "FAIL (" + str(len(fk_violations)) + " violations)"}')
    if fk_violations:
        for v in fk_violations:
            print(f'    Table={v[0]}, RowID={v[1]}, Parent={v[2]}, FKID={v[3]}')
    
    # Tables
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in c.fetchall()]
    print(f'  Tables ({len(tables)}): {", ".join(sorted(tables))}')
    
    # Row counts
    for t in tables:
        try:
            c.execute(f'SELECT count(*) FROM "{t}"')
            count = c.fetchone()[0]
            print(f'    {t}: {count} rows')
        except Exception as e:
            print(f'    {t}: ERROR - {e}')
    
    # Schema
    print(f'  Schema:')
    c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL")
    for row in c.fetchall():
        print(f'    {row[0]}')
    
    conn.close()
    print()

# Check all database locations
from pathlib import Path
home = Path.home()
check_db(str(home / '.autognosia' / 'autognosia.db'), 'autognosia.db (.autognosia)')
check_db(str(home / '.hermes' / 'autognosia.db'), 'autognosia.db (.hermes)')
check_db(str(home / '.autognosia' / 'personal-organizer' / 'data' / 'organizer.db'), 'organizer.db (personal-organizer)')
check_db(str(home / '.autognosia' / 'backups' / 'organizer.db'), 'organizer.db (backups)')
