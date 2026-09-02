#!/usr/bin/env python3
"""
Launcher script for the Autognosia Command Deck Dashboard.

Usage:
  python3 scripts/run_dashboard.py [--port 8088] [--host 127.0.0.1]

Environment variables:
  DASHBOARD_PORT (default: 8088)
  WS_PORT (default: 8089)
  DASHBOARD_HOST (default: 127.0.0.1)
"""

import sys
import argparse
from pathlib import Path

# Add repo root to path so we can import dashboard.dashboard_server
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

import dashboard.dashboard_server as dashboard_server

def main():
    parser = argparse.ArgumentParser(description="Launch Autognosia Command Deck")
    parser.add_argument("--port", type=int, default=int(os.environ.get("DASHBOARD_PORT", 8088)), help="Port to bind dashboard (default: 8088)")
    parser.add_argument("--host", type=str, default=os.environ.get("DASHBOARD_HOST", "127.0.0.1"), help="Host interface (default: 127.0.0.1)")
    args = parser.parse_args()

    dashboard_server.run(host=args.host, port=args.port)

if __name__ == "__main__":
    import os
    main()
