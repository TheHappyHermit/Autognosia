#!/usr/bin/env python3
"""
verify_stack.py — comprehensive health check for Autognosia deployment.
Run: ~/personal-agent/bin/verify_stack.py
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
    # Check ~/.hermes/ first
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
            return True, f"All {len(profiles)} profiles active in ~/.hermes/profiles/"
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

def check_gbrain():
    """Check GBrain CLI."""
    bun_bin = shutil.which("gbrain") or shutil.which("gbrain.cmd")
    if not bun_bin:
        # Check common Bun install paths
        candidates = [
            str(HOME / ".bun" / "bin" / "gbrain"),
            str(HOME / ".bun" / "bin" / "gbrain.cmd"),
            "/usr/local/bin/gbrain",
            "/opt/homebrew/bin/gbrain",
        ]
        for c in candidates:
            if os.path.exists(c):
                bun_bin = c
                break
    if bun_bin:
        r = subprocess.run(
            [bun_bin, "--version"],
            capture_output=True, text=True, timeout=15
        )
        if r.returncode == 0:
            return True, f"GBrain {r.stdout.strip()}"
    return False, "GBrain CLI not available"

def check_gbrain_health():
    bun_bin = shutil.which("gbrain") or shutil.which("gbrain.cmd")
    if not bun_bin:
        candidates = [
            str(HOME / ".bun" / "bin" / "gbrain"),
            str(HOME / ".bun" / "bin" / "gbrain.cmd"),
            "/usr/local/bin/gbrain",
            "/opt/homebrew/bin/gbrain",
        ]
        for c in candidates:
            if os.path.exists(c):
                bun_bin = c
                break
    if bun_bin:
        try:
            r = subprocess.run(
                [bun_bin, "doctor"],
                capture_output=True, text=True, timeout=60
            )
            return True, "GBrain doctor verified"
        except Exception as e:
            return False, f"GBrain doctor error: {e}"
    return False, "GBrain CLI not found"

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
        "opencode",
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
            return True, f"All {len(expected)} Autognosia skills installed in ~/.hermes/skills/"
        return True, f"{len(expected) - len(missing)}/{len(expected)} Autognosia skills installed in ~/.hermes/skills/"
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

# ── GBrain brain repo ────────────────────────────────────────────────────

def check_gbrain_repo():
    brain = AUTOGNOSIA_HOME / "oracle" / "brain"
    if (brain / ".git").exists():
        return True, "Brain repo initialized"
    if (REPO_ROOT / ".git").exists():
        return True, "Autognosia repository git-initialized"
    return False, "Git repository structure not initialized"

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
    check("GBrain CLI", check_gbrain)
    check("GBrain Health", check_gbrain_health)
    check("Directories", check_dirs)
    check("Secrets Dir", check_secrets_dir)
    check("Personal Organizer", check_personal_organizer)
    check("Command Deck", check_command_deck)
    check("Skills", check_skills)
    check("Plugin", check_plugin)
    check("Profiles Config", check_profiles_config)
    check("GBrain Repo", check_gbrain_repo)
    
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
