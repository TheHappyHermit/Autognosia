#!/usr/bin/env python3
"""
Daily usage report for Autognosia.

Tracks token usage, API calls, and costs across all providers.
Works with any provider configuration (Ollama, LM Studio, OpenRouter, etc.).

Usage:
  python3 scripts/daily_usage_report.py
"""

import os
import json
import sys
from datetime import datetime, timedelta

AUTOGNOSIA_HOME = os.environ.get("AUTOGNOSIA_HOME", os.path.expanduser("~/.autognosia"))
LOGS_DIR = os.path.join(AUTOGNOSIA_HOME, "logs")
USAGE_DB = os.environ.get("USAGE_DB", os.path.join(AUTOGNOSIA_HOME, "personal-organizer", "data", "usage.json"))

def load_usage():
    """Load usage data from JSON file."""
    if os.path.exists(USAGE_DB):
        try:
            with open(USAGE_DB, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"daily": [], "total_tokens": 0, "total_cost": 0.0}

def save_usage(data):
    """Save usage data to JSON file."""
    os.makedirs(os.path.dirname(USAGE_DB), exist_ok=True)
    with open(USAGE_DB, "w") as f:
        json.dump(data, f, indent=2)

def estimate_cost(tokens, provider="unknown"):
    """Estimate cost based on provider and token count."""
    # Free/local providers
    free_providers = ["ollama", "local", "lm-studio", "custom:local"]
    if provider.lower() in free_providers:
        return 0.0
    # Default estimate (very rough)
    return tokens * 0.000001  # ~$0.001 per 1000 tokens as placeholder

def generate_report():
    """Generate daily usage report."""
    today = datetime.now().strftime("%Y-%m-%d")
    usage = load_usage()

    # Check for today's entry
    today_entry = None
    for entry in usage.get("daily", []):
        if entry.get("date") == today:
            today_entry = entry
            break

    if not today_entry:
        today_entry = {
            "date": today,
            "tokens": 0,
            "api_calls": 0,
            "cost": 0.0,
            "providers": {}
        }
        usage["daily"].append(today_entry)

        # Keep only last 30 days
        if len(usage["daily"]) > 30:
            usage["daily"] = usage["daily"][-30:]

    # Check common log locations for recent activity
    log_files = []
    if os.path.exists(LOGS_DIR):
        for f in os.listdir(LOGS_DIR):
            if f.endswith(".log") and "usage" in f.lower():
                log_files.append(os.path.join(LOGS_DIR, f))

    report_lines = [
        f"=== Daily Usage Report - {today} ===",
        f"  Tokens today: {today_entry.get('tokens', 0):,}",
        f"  API calls today: {today_entry.get('api_calls', 0):,}",
        f"  Estimated cost: ${today_entry.get('cost', 0.0):.4f}",
    ]

    if usage.get("total_tokens", 0) > 0:
        report_lines.append(f"  Lifetime tokens: {usage['total_tokens']:,}")

    report = "\n".join(report_lines)
    save_usage(usage)
    return report

def main():
    try:
        report = generate_report()
        if report:
            print(report)
        return 0
    except Exception as e:
        print(f"[ERROR] Usage report failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
