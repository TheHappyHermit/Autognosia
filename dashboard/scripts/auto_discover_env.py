#!/usr/bin/env python3
"""
Autognosia Command Deck — Automated Local System Environment Discovery
Enables Hermes Agent and administrators to automatically detect running local services,
extract existing credentials, and configure .env non-destructively.
"""

import os
import sys
import json
import socket
import argparse
from pathlib import Path
from typing import Dict, Any, List

DASHBOARD_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = DASHBOARD_DIR.parent
AUTOGNOSIA_HOME = Path(os.environ.get("AUTOGNOSIA_HOME", str(Path.home() / ".autognosia")))
ROOT_ENV_FILE = REPO_ROOT / ".env"
DASHBOARD_ENV_FILE = DASHBOARD_DIR / ".env"

# Ensure dashboard is on sys.path to import integrations_backend
if str(DASHBOARD_DIR) not in sys.path:
    sys.path.insert(0, str(DASHBOARD_DIR))

try:
    import integrations_backend
except ImportError:
    integrations_backend = None


def is_port_open(host: str, port: int, timeout: float = 0.6) -> bool:
    """Check if a TCP port is open and accepting connections."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            return s.connect_ex((host, port)) == 0
    except Exception:
        return False


def probe_local_services() -> Dict[str, Any]:
    """Probe standard homelab ports on localhost and LAN."""
    services = {}

    probes = [
        ("uptimekuma", "http://localhost:3001", "localhost", 3001, "UPTIME_KUMA_URL"),
        ("godseye", "http://localhost:5173", "localhost", 5173, "GODS_EYE_URL"),
        ("searxng", "http://127.0.0.1:8080", "127.0.0.1", 8080, "SEARXNG_URL"),
        ("n8n", "http://127.0.0.1:5678", "127.0.0.1", 5678, "N8N_URL"),
        ("pgvector", "postgresql://postgres:postgres@localhost:5432/autognosia", "localhost", 5432, "PG_URL"),
        ("homeassistant_local", "http://localhost:8123", "localhost", 8123, "HASS_URL"),
        ("homeassistant_lan", "http://10.1.1.13:8123", "10.1.1.13", 8123, "HASS_URL"),
        ("immich", "http://localhost:2283", "localhost", 2283, "IMMICH_URL"),
        ("audiobookshelf", "http://localhost:13378", "localhost", 13378, "AUDIOBOOKSHELF_URL"),
        ("seer", "http://localhost:5055", "localhost", 5055, "SEER_URL"),
        ("deerflow", "http://localhost:8000", "localhost", 8000, "DEERFLOW_URL"),
        ("vane_or_openwebui", "http://localhost:3000", "localhost", 3000, "OPENWEBUI_URL"),
        ("hermes_gateway", "http://127.0.0.1:8642", "127.0.0.1", 8642, "HERMES_GATEWAY_URL"),
    ]

    for s_name, default_url, host, port, env_var in probes:
        open_st = is_port_open(host, port)
        services[s_name] = {
            "name": s_name,
            "port": port,
            "host": host,
            "url": default_url,
            "open": open_st,
            "env_var": env_var
        }

    return services


def extract_hermes_credentials() -> Dict[str, str]:
    """Inspect local Hermes configuration files to extract known API keys."""
    creds = {}

    local_app_data = os.environ.get("LOCALAPPDATA")
    candidates = []
    if local_app_data:
        candidates.append(Path(local_app_data) / "hermes")
    candidates.append(Path.home() / ".hermes")

    for h_dir in candidates:
        if not h_dir.exists():
            continue

        # Check auth.json
        auth_file = h_dir / "auth.json"
        if auth_file.exists():
            try:
                data = json.loads(auth_file.read_text(encoding="utf-8"))
                providers = data.get("providers", {})
                for prov, p_data in providers.items():
                    key = p_data.get("api_key") or p_data.get("token")
                    if key:
                        if prov in ("openrouter", "openai", "anthropic"):
                            creds[f"{prov.upper()}_API_KEY"] = key
            except Exception:
                pass

        # Check .env
        env_file = h_dir / ".env"
        if env_file.exists():
            try:
                lines = env_file.read_text(encoding="utf-8").splitlines()
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if v and ("KEY" in k or "TOKEN" in k):
                            creds[k] = v
            except Exception:
                pass

    return creds


def run_auto_discovery(dry_run: bool = False, custom_vars: Dict[str, str] = None) -> Dict[str, Any]:
    """
    Execute full discovery protocol and synchronize with .env files.
    """
    services = probe_local_services()
    creds = extract_hermes_credentials()

    updates = {}

    # Map detected open services to environment variables
    for s_info in services.values():
        if s_info["open"]:
            updates[s_info["env_var"]] = s_info["url"]

    # Special handling for Uptime Kuma defaults
    if services.get("uptimekuma", {}).get("open"):
        updates["UPTIME_KUMA_URL"] = "http://localhost:3001"
        updates["UPTIME_KUMA_SLUG"] = "default"

    # Merge extracted Hermes credentials
    for k, v in creds.items():
        if k in ("ELEVENLABS_API_KEY", "HERMES_API_KEY", "API_SERVER_KEY"):
            updates[k] = v

    # Merge custom overrides
    if custom_vars:
        for k, v in custom_vars.items():
            updates[k] = v

    applied_files = []
    if not dry_run and updates and integrations_backend:
        for env_file in [ROOT_ENV_FILE, DASHBOARD_ENV_FILE]:
            try:
                integrations_backend.sync_env_file(env_file, updates)
                applied_files.append(str(env_file))
            except Exception as e:
                print(f"Warning: could not update {env_file}: {e}")

    return {
        "status": "ok",
        "dry_run": dry_run,
        "discovered_services": {k: v for k, v in services.items() if v["open"]},
        "all_probed_services": services,
        "extracted_credentials_count": len(creds),
        "updates_applied": updates,
        "files_updated": applied_files
    }


def main():
    parser = argparse.ArgumentParser(description="Auto-discover local services and configure .env")
    parser.add_argument("--dry-run", action="store_true", help="Probe services without modifying .env files")
    parser.add_argument("--set", action="append", help="Set environment variable (e.g. --set KEY=VALUE)")
    args = parser.parse_args()

    custom_vars = {}
    if args.set:
        for item in args.set:
            if "=" in item:
                k, v = item.split("=", 1)
                custom_vars[k.strip()] = v.strip()

    result = run_auto_discovery(dry_run=args.dry_run, custom_vars=custom_vars)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
