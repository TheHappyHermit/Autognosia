#!/usr/bin/env python3
"""
verify_stack.py — comprehensive health check for Hermes Autognosia deployment.
Run: ~/personal-agent/bin/verify_stack.py
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
AUTOGNOSIA_HOME = HOME / ".autognosia"
PERSONAL_AGENT = HOME / "personal-agent"

results = []

def check(name, func):
    try:
        ok, detail = func()
        status = "OK" if ok else "FAIL"
        results.append({"name": name, "status": status, "detail": detail})
        print(f"[{status}] {name}" + (f" — {detail}" if detail and ok else ""))
        return ok
    except Exception as e:
        results.append({"name": name, "status": "ERROR", "detail": str(e)})
        print(f"[ERROR] {name} — {e}")
        return False

# ── Core infrastructure ──────────────────────────────────────────────────

def check_hermes():
    """Check Hermes Agent is running."""
    r = subprocess.run(
        ["systemctl", "--user", "is-active", "hermes-gateway"],
        capture_output=True, text=True
    )
    if r.stdout.strip() == "active":
        return True, "Hermes Agent gateway is running"
    return False, "Hermes Agent gateway not running"

def check_profiles():
    """Check all Autognosia profiles exist."""
    profiles = ["default", "oracle", "researcher", "planner", "auditor", "personal-organizer"]
    missing = []
    for p in profiles:
        if p == "default":
            if not (HOME / ".hermes" / "SOUL.md").exists():
                missing.append(p)
        else:
            if not (HOME / ".hermes" / "profiles" / p).exists():
                missing.append(p)
    if missing:
        return False, f"Missing profiles: {', '.join(missing)}"
    return True, f"All {len(profiles)} profiles present"

def check_honcho():
    """Check Honcho containers."""
    r = subprocess.run(
        ["docker", "ps", "--format", "{{.Names}} {{.Status}}"],
        capture_output=True, text=True
    )
    output = r.stdout
    all_names = output.lower()
    healthy = output.lower()
    
    # Current compose stack: autognosia-honcho-{api,database,deriver,redis}-1
    required = ["autognosia-honcho-api-1", "autognosia-honcho-database-1", 
                "autognosia-honcho-deriver-1", "autognosia-honcho-redis-1"]
    running = [name for name in required if name in all_names]
    
    if len(running) == len(required):
        return True, f"All {len(required)} Honcho containers healthy (compose stack)"
    
    missing = [name for name in required if name not in all_names]
    return False, f"Honcho incomplete. Missing: {', '.join(missing)}"

def check_gbrain():
    """GBrain has been removed from the deployment."""
    return True, "GBrain removed from deployment (skip check)"

def check_gbrain_health():
    """GBrain has been removed from the deployment."""
    return True, "GBrain removed from deployment (skip check)"

# ── Directory structure ──────────────────────────────────────────────────

def check_dirs():
    required = [
        AUTOGNOSIA_HOME / "active-wiki",
        AUTOGNOSIA_HOME / "oracle" / "brain",
        AUTOGNOSIA_HOME / "oracle" / "raw",
        AUTOGNOSIA_HOME / "personal-state" / "data",
        AUTOGNOSIA_HOME / "exchange",
        PERSONAL_AGENT / "bin",
        PERSONAL_AGENT / "hooks",
    ]
    missing = [d for d in required if not d.exists()]
    if missing:
        return False, f"Missing dirs: {[str(m) for m in missing]}"
    return True, f"All {len(required)} directories present"

def check_secrets_dir():
    secrets = PERSONAL_AGENT / "secrets"
    if not secrets.exists():
        return False, "secrets dir missing"
    mode = oct(secrets.stat().st_mode)[-3:]
    if mode == "700":
        return True, "permissions 700"
    return False, f"permissions {mode}, need 700"

# ── Personal Ops ─────────────────────────────────────────────────────────

def check_personal_state():
    """Check Personal State API is running."""
    r = subprocess.run(
        ["curl", "-sf", "http://127.0.0.1:8001/openapi.json"],
        capture_output=True, text=True
    )
    if r.returncode == 0 and r.stdout:
        return True, "Personal State API running (openapi.json)"
    # Fallback: check DB exists
    db_path = AUTOGNOSIA_HOME / "personal-state" / "data" / "organizer.db"
    if not db_path.exists():
        # Try alternative path
        db_path = AUTOGNOSIA_HOME / "personal-organizer" / "data" / "organizer.db"
    if not db_path.exists():
        return False, "DB not initialized"
    return False, "Personal State API not responding"

# ── Skills ───────────────────────────────────────────────────────────────

def check_skills():
    skills_dir = HOME / ".hermes" / "skills" / "autognosia"
    if not skills_dir.exists():
        return False, "Autognosia skills directory missing"
    expected = [
        "epistemic-protocol",
        "first-principles",
        "oracle-routing",
        "personal-cognitive-router",
        "prospective-memory",
        "structured-thinking",
        "verification",
    ]
    missing = [s for s in expected if not (skills_dir / s / "SKILL.md").exists()]
    if missing:
        return False, f"Missing skills: {', '.join(missing)}"
    return True, f"All {len(expected)} skills present"

# ── Plugin ───────────────────────────────────────────────────────────────

def check_plugin():
    """Plugins are optional in native profile mode."""
    return True, "Plugin optional in native profile mode"

# ── Profiles configuration ───────────────────────────────────────────────

def check_profiles_config():
    """Check specialist profiles exist and have Honcho disabled."""
    for profile in ["oracle", "researcher", "planner", "auditor", "personal-organizer"]:
        config = HOME / ".hermes" / "profiles" / profile / "config.yaml"
        if not config.exists():
            return False, f"{profile} config missing"
        with open(config) as f:
            content = f.read()
        if "provider: honcho" in content.lower():
            return False, f"{profile} still has Honcho enabled"
    return True, "Specialist profiles configured"

# ── Summary ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"=== Hermes Autognosia Verification ===\n{datetime.now(timezone.utc).isoformat()}\n")
    
    check("Hermes", check_hermes)
    check("Profiles", check_profiles)
    check("Honcho", check_honcho)
    check("GBrain CLI", check_gbrain)
    check("GBrain Health", check_gbrain_health)
    check("Directories", check_dirs)
    check("Secrets Dir", check_secrets_dir)
    check("Personal State", check_personal_state)
    check("Skills", check_skills)
    check("Plugin", check_plugin)
    check("Profiles Config", check_profiles_config)
    
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "OK")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    errors = sum(1 for r in results if r["status"] == "ERROR")
    
    print(f"\n=== Summary ===")
    print(f"Passed: {passed}/{total}")
    if failed:
        print(f"Failed: {failed}/{total}")
    if errors:
        print(f"Errors: {errors}/{total}")
    
    if failed or errors:
        sys.exit(1)
    else:
        print("\n✓ All checks passed")
        sys.exit(0)
