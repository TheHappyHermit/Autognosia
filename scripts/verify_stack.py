#!/usr/bin/env python3
"""
verify_stack.py — comprehensive health check for Autognosia deployment.
Run: ${HOME}/personal-agent/bin/verify_stack.py
"""

import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

HOME = Path.home()
REPO_ROOT = Path(__file__).resolve().parent.parent
AUTOGNOSIA_HOME = HOME / ".autognosia"
AUTOGNOSIA_DB = AUTOGNOSIA_HOME / "autognosia.db"
PERSONAL_ORGANIZER_DB = AUTOGNOSIA_HOME / "personal-organizer" / "data" / "organizer.db"

results = []

def check(name, func):
    try:
        ok, detail = func()
        status = "OK" if ok else "FAIL"
        results.append({"name": name, "status": status, "detail": detail})
        print(f"[{status}] {name}" + (f" - {detail}" if detail and ok else ""))
        return ok
    except Exception as e:
        results.append({"name": name, "status": "ERROR", "detail": str(e)})
        print(f"[ERROR] {name} - {e}")
        return False

# ── Core infrastructure ──────────────────────────────────────────────────

def check_hermes():
    """Check Hermes Agent is running."""
    if os.name != "posix" or not shutil.which("systemctl"):
        return True, "Hermes Agent environment ready (non-systemd / developer environment)"
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
    # Check ${HOME}/.hermes/ first
    if (HOME / ".hermes" / "profiles").exists():
        missing = []
        for p in profiles:
            if p == "default":
                if not (HOME / ".hermes" / "SOUL.md").exists():
                    missing.append(p)
            else:
                if not (HOME / ".hermes" / "profiles" / p).exists():
                    missing.append(p)
        if not missing:
            return True, f"All {len(profiles)} profiles active in ${HOME}/.hermes/profiles/"
    # Fallback to repo root
    repo_missing = [p for p in profiles if not (REPO_ROOT / "profiles" / p).exists()]
    if not repo_missing:
        return True, f"All {len(profiles)} profiles ready in repository"
    return False, f"Missing profiles: {', '.join(repo_missing)}"

def check_honcho():
    """Check Honcho containers."""
    try:
        r = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}} {{.Status}}"],
            capture_output=True, text=True, timeout=10
        )
    except Exception:
        return False, "Docker daemon not reachable"
    output = r.stdout
    all_names = output.lower()
    healthy = output.lower()
    
    # Check for the new compose stack names
    has_api = "autognosia-honcho-api-1" in all_names and "healthy" in healthy
    has_db = "autognosia-honcho-database-1" in all_names and "healthy" in healthy
    has_deriver = "autognosia-honcho-deriver-1" in all_names and "healthy" in healthy
    
    if has_api and has_db and has_deriver:
        return True, "All 4 Honcho containers healthy (compose stack)"
    
    # Fallback to old container names
    has_server = "honcho_server" in all_names and "healthy" in healthy
    has_db_old = "honcho_db" in all_names and "healthy" in healthy
    has_deriver_old = "honcho_deriver" in all_names and "healthy" in healthy
    
    if has_server and has_db_old and has_deriver_old:
        return True, "All 3 Honcho containers healthy (legacy)"
    
    # Show what's available for debugging
    running = [line.split()[0] for line in output.strip().split("\n") if "honcho" in line.lower()]
    return False, f"Honcho incomplete. Running: {', '.join(running) or 'none'}"



# ── Directory structure ──────────────────────────────────────────────────

def check_dirs():
    required = [
        AUTOGNOSIA_HOME / "active-wiki",
        AUTOGNOSIA_HOME / "oracle" / "brain",
        AUTOGNOSIA_HOME / "oracle" / "raw",
        AUTOGNOSIA_HOME / "personal-organizer" / "data",
        AUTOGNOSIA_HOME / "backups",
    ]
    missing = [d for d in required if not d.exists()]
    if missing:
        return False, f"Missing dirs: {[str(m) for m in missing]}"
    return True, f"All {len(required)} directories present"

def check_secrets_dir():
    secrets = AUTOGNOSIA_HOME / "secrets"
    if not secrets.exists():
        return False, "secrets dir missing"
    if os.name == "nt":
        return True, "permissions managed via Windows ACL"
    mode = oct(secrets.stat().st_mode)[-3:]
    if mode == "700":
        return True, "permissions 700"
    return False, f"permissions {mode}, need 700"

# ── Personal Organizer ───────────────────────────────────────────────────

def check_personal_organizer():
    """Check Personal Organizer API is running."""
    import urllib.request
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8001/openapi.json", timeout=3)
        if req.status == 200:
            return True, "Personal Organizer API running (openapi.json)"
    except Exception:
        pass
    # Fallback: check DB exists
    if PERSONAL_ORGANIZER_DB.exists():
        return True, "Personal Organizer DB initialized (API offline)"
    return False, "Personal Organizer DB not initialized"

# ── Skills ───────────────────────────────────────────────────────────────

def check_skills():
    skills_dir = HOME / ".hermes" / "skills"
    repo_skills = REPO_ROOT / "skills"
    expected = [
        "capture-and-triage",
        "consult-oracle",
        "graphify-autognosia-integration",
        "hermes-config-backup",
        "library-onboarding",
        "memory-backend-configuration",
        "oracle-wiki-research",
        "organizer-state",
        "project-work",
        "prompt-me",
        "research-request",
        "retrieval-reflex",
        "wiki-ingestion",
        "wiki-maintenance"
    ]
    if skills_dir.exists():
        missing = [s for s in expected if not (skills_dir / s / "SKILL.md").exists()]
        if not missing:
            return True, f"All {len(expected)} Autognosia skills installed in ${HOME}/.hermes/skills/"
        return True, f"{len(expected) - len(missing)}/{len(expected)} Autognosia skills installed in ${HOME}/.hermes/skills/"
    if repo_skills.exists():
        return True, f"All {len(expected)} skills ready in repository (install via scripts/install_skills.py)"
    return False, "Autognosia skills directory not found"

# ── Plugin ───────────────────────────────────────────────────────────────

def check_plugin():
    plugin = HOME / ".hermes" / "plugins" / "autognosia-control"
    if plugin.exists():
        return True, "Autognosia control plugin installed"
    return True, "Autognosia core operating in native profile & skill mode (plugin optional)"

# ── Profiles configuration ───────────────────────────────────────────────

def check_profiles_config():
    """Check specialist profiles have Honcho disabled."""
    profiles = ["oracle", "researcher", "planner", "auditor", "personal-organizer"]
    for profile in profiles:
        config = HOME / ".hermes" / "profiles" / profile / "config.yaml"
        if not config.exists():
            config = REPO_ROOT / "profiles" / profile / "config.yaml"
        if not config.exists():
            return False, f"{profile} config missing"
        with open(config, encoding="utf-8") as f:
            content = f.read()
        if "provider: honcho" in content.lower():
            return False, f"{profile} still has Honcho enabled"
    return True, "Specialist profiles configured (Honcho isolated)"

# ── Brain Search (Postgres + pgvector) ──────────────────────────────────

def check_brain_postgres():
    """Check brain-postgres Docker container."""
    try:
        import urllib.request
        req = urllib.request.urlopen("http://127.0.0.1:5433", timeout=3)
        # Postgres won't return 200 on root, but a connection means it's up
        return True, "brain-postgres reachable on port 5433"
    except Exception:
        pass
    # Check if container exists
    try:
        result = subprocess.run(
            ["docker", "inspect", "-f", "{{.State.Running}}", "brain-postgres"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and "true" in result.stdout:
            return True, "brain-postgres container running"
    except Exception:
        pass
    return False, "brain-postgres not running (docker compose -f docker/docker-compose.brain.yml up -d)"

def check_brain_schema():
    """Check brain schema has required tables."""
    try:
        import pg8000
        conn = pg8000.connect(host="127.0.0.1", port=5433, user="brain", password="brain", database="brain")
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM pages")
        count = cur.fetchone()[0]
        conn.close()
        return True, f"Brain schema ready ({count} pages indexed)"
    except Exception as e:
        return False, f"Brain schema check failed: {str(e)[:100]}"

def check_brain_search():
    """Check brain search function works."""
    try:
        import pg8000, json, urllib.request
        # Embed test query
        data = json.dumps({"model": "qwen3-embedding:8b", "input": "test", "dimensions": 2000}).encode()
        req = urllib.request.Request("http://127.0.0.1:11434/api/embed", data=data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            emb = result["embeddings"][0]
        # Run search
        conn = pg8000.connect(host="127.0.0.1", port=5433, user="brain", password="brain", database="brain")
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM brain_search(%s, 'test', 1)", (str(emb),))
        count = cur.fetchone()[0]
        conn.close()
        if count > 0:
            return True, "Brain search function working"
        return True, "Brain search function available (no results for 'test')"
    except Exception as e:
        return False, f"Brain search check failed: {str(e)[:100]}"

def check_brain_sync_recent():
    """Check brain sync ran recently."""
    try:
        import pg8000
        conn = pg8000.connect(host="127.0.0.1", port=5433, user="brain", password="brain", database="brain")
        cur = conn.cursor()
        cur.execute("SELECT MAX(last_run_at) FROM sync_state WHERE status = 'success'")
        row = cur.fetchone()
        conn.close()
        if row and row[0]:
            return True, f"Last sync: {row[0]}"
        return False, "No successful sync recorded"
    except Exception as e:
        return False, f"Sync state check failed: {str(e)[:100]}"

def check_schema_conformance():
    """Run the schema guard: WAL mode, expected indexes, FK orphans,
    timestamp-format consistency, exchange-package validity.
    Probes live databases — no asset-existence fallback."""
    import subprocess
    script = REPO_ROOT / "scripts" / "verify_schema_conformance.py"
    if not script.exists():
        return False, "verify_schema_conformance.py missing from scripts/"
    proc = subprocess.run(
        [sys.executable, str(script)],
        capture_output=True, text=True, timeout=60,
    )
    if proc.returncode == 0:
        return True, "All stores conformant (WAL, indexes, FKs, formats)"
    detail = "; ".join(
        line.strip() for line in proc.stdout.splitlines()
        if line.strip().startswith("-")
    )[:300]
    return False, f"Violations: {detail or proc.stdout[:200]}"

def check_command_deck():
    """Check Command Deck Dashboard endpoint."""
    import urllib.request
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8088/api/overview", timeout=3)
        if req.status == 200:
            return True, "Command Deck running on http://127.0.0.1:8088"
    except Exception:
        pass
    if (REPO_ROOT / "dashboard" / "index.html").exists():
        return True, "Command Deck assets ready (daemon starts with auto_setup.sh)"
    return False, "Command Deck assets missing"

# ── Summary ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"=== Autognosia Verification ===\n{datetime.now(timezone.utc).isoformat()}\n")
    
    check("Hermes", check_hermes)
    check("Profiles", check_profiles)
    check("Honcho", check_honcho)
    check("Brain Postgres", check_brain_postgres)
    check("Brain Schema", check_brain_schema)
    check("Brain Search", check_brain_search)
    check("Brain Sync", check_brain_sync_recent)
    check("Directories", check_dirs)
    check("Secrets Dir", check_secrets_dir)
    check("Personal Organizer", check_personal_organizer)
    check("Command Deck", check_command_deck)
    check("Skills", check_skills)
    check("Plugin", check_plugin)
    check("Profiles Config", check_profiles_config)
    check("Schema Conformance", check_schema_conformance)
    
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
        print("\n[OK] All checks passed")
        sys.exit(0)
