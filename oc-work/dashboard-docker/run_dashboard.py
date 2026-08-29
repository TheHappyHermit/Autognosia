#!/usr/bin/env python3
"""
Launcher script for the Autognosia Command Deck Dashboard.

Usage:
  python3 run_dashboard.py [--port 8088] [--host 0.0.0.0]

Environment variables:
  DASHBOARD_PORT (default: 8088)
  WS_PORT (default: 8089)
  DASHBOARD_HOST (default: 0.0.0.0)
"""

import os
import sys
import argparse
from pathlib import Path

# Add scripts directory to path
SCRIPTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS_DIR))

import dashboard_server

def main():
    parser = argparse.ArgumentParser(description="Launch Autognosia Command Deck")
    parser.add_argument("--port", type=int, default=int(os.environ.get("DASHBOARD_PORT", 8088)), help="Dashboard port")
    parser.add_argument("--host", type=str, default=os.environ.get("DASHBOARD_HOST", "0.0.0.0"), help="Host interface")
    args = parser.parse_args()

    dashboard_server.run(host=args.host, port=args.port)

if __name__ == "__main__":
    main()
