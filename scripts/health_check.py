#!/usr/bin/env python3
"""
Health check for Autognosia services.

Verifies:
- Docker containers are running and healthy
- Database integrity (organizer.db and autognosia.db)
- Disk space
- Service connectivity
"""

import os
from pathlib import Path
import subprocess
import sqlite3
import sys
import urllib.request
import urllib.error
from datetime import datetime

AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia"))

SERVICES = [
    ("honcho-api", "http://127.0.0.1:8000/health"),
    ("personal-organizer-api", "http://127.0.0.1:8001/health"),
    ("searxng-core", "http://127.0.0.1:8080/healthz"),
]

DB_PATHS = [
    os.path.join(AUTOGNOSIA_HOME, "personal-organizer", "data", "organizer.db"),
    os.path.join(AUTOGNOSIA_HOME, "autognosia.db"),
]

def check_docker():
    """Check Docker containers."""
    print("=== Docker Services ===")
    try:
        result = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}\t{{.Status}}"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            print(result.stdout.strip() if result.stdout.strip() else "No running containers found.")
            return True
        else:
            print(f"Docker check notice: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"Docker check skipped/failed: {e}")
        return False

def check_services():
    """Check service health endpoints."""
    print("\n=== Service Health ===")
    all_ok = True
    for name, url in SERVICES:
        try:
            req = urllib.request.urlopen(url, timeout=5)
            status = req.getcode()
            print(f"  [OK] {name}: HTTP {status}")
        except urllib.error.HTTPError as e:
            print(f"  [WARN] {name}: HTTP {e.code}")
            all_ok = False
        except Exception as e:
            if name == "searxng-core":
                print(f"  [SKIP] {name}: not deployed locally (may use external SearXNG)")
                continue
            else:
                print(f"  [DOWN] {name}: {e}")
                all_ok = False
    return all_ok

def check_databases():
    """Check database integrity."""
    print("\n=== Database Integrity ===")
    all_ok = True
    for db_path in DB_PATHS:
        if not os.path.exists(db_path):
            print(f"  DB not found (may need init script): {db_path}")
            continue
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.execute("PRAGMA integrity_check")
            result = cursor.fetchone()
            conn.close()
            status = "OK" if result and result[0] == "ok" else f"FAIL: {result}"
            print(f"  [{status}] {os.path.basename(db_path)}")
            if status != "OK":
                all_ok = False
        except Exception as e:
            print(f"  [ERROR] {os.path.basename(db_path)}: {e}")
            all_ok = False
    return all_ok

def check_disk():
    """Check disk space."""
    print("\n=== Disk Space ===")
    try:
        result = subprocess.run(
            ["df", "-h", AUTOGNOSIA_HOME] if os.name != 'nt' else ["powershell", "-Command", "Get-PSDrive C | Select-Object Used,Free"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            print(result.stdout.strip())
        else:
            print(f"Disk check error: {result.stderr.strip()}")
    except Exception as e:
        print(f"Disk check failed: {e}")

def main():
    print(f"Autognosia Health Check: {datetime.now().isoformat()}")
    check_docker()
    svc_ok = check_services()
    db_ok = check_databases()
    check_disk()
    return 0 if (db_ok and svc_ok) else 1

if __name__ == "__main__":
    sys.exit(main())
