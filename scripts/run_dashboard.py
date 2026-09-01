#!/usr/bin/env python3
"""
Launcher script for the Autognosia Command Deck Dashboard.

Usage:
  python3 scripts/run_dashboard.py [--port 8088] [--host 127.0.0.1]
"""

import sys
import argparse
from pathlib import Path

# Add scripts directory to path
SCRIPTS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS_DIR))

import dashboard_server

def main():
    parser = argparse.ArgumentParser(description="Launch Autognosia Command Deck")
    parser.add_argument("--port", type=int, default=8088, help="Port to bind dashboard (default: 8088)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host interface (default: 127.0.0.1)")
    args = parser.parse_args()

    dashboard_server.run(host=args.host, port=args.port)

if __name__ == "__main__":
    main()
