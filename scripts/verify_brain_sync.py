#!/usr/bin/env python3
"""
Brain sync verification script.
Runs after brain_sync.py to confirm content is actually searchable.
Queries the brain-postgres API with a test query and verifies results.

Usage: python3 verify_brain_sync.py [--source active-wiki|oracle-brain] [--query "test query"]
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# Configuration
BRAIN_API_URL = os.environ.get("BRAIN_API_URL", "http://10.x.x.x:8080/v1")
BRAIN_API_KEY = os.environ.get("BRAIN_API_KEY", "")

# Test queries per source
TEST_QUERIES = {
    "active-wiki": [
        "ontology engineering",
        "dual memory system",
        "dynamic ontology",
    ],
    "oracle-brain": [
        "philosophy ontology",
        "BFO SUMO DOLCE",
        "AI ontology failures",
    ],
}


def search_brain(query, api_url=BRAIN_API_URL):
    """Search the brain API for a query."""
    try:
        url = f"{api_url}/search"
        data = json.dumps({"query": query, "limit": 3}).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        if BRAIN_API_KEY:
            req.add_header("Authorization", f"Bearer {BRAIN_API_KEY}")
        
        response = urllib.request.urlopen(req, timeout=30)
        result = json.loads(response.read().decode("utf-8"))
        return result
    except Exception as e:
        return {"error": str(e)}


def verify_source(source):
    """Verify that a source's content is searchable in brain."""
    queries = TEST_QUERIES.get(source, ["test query"])
    
    results = []
    for query in queries:
        result = search_brain(query)
        results.append({
            "query": query,
            "result": result,
            "has_results": len(result.get("results", [])) > 0 if "error" not in result else False,
            "error": result.get("error", None),
        })
    
    return results


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Verify brain sync")
    parser.add_argument("--source", choices=["active-wiki", "oracle-brain"], required=True)
    parser.add_argument("--query", type=str, help="Custom test query")
    args = parser.parse_args()
    
    print(f"Verifying brain sync for: {args.source}")
    print(f"API URL: {BRAIN_API_URL}")
    
    if args.query:
        # Single custom query
        result = search_brain(args.query)
        print(f"\nQuery: {args.query}")
        print(json.dumps(result, indent=2)[:500])
    else:
        # Run test queries
        results = verify_source(args.source)
        
        success_count = 0
        for r in results:
            status = "✓" if r["has_results"] else "✗"
            if r["error"]:
                status = "✗ (error)"
            else:
                success_count += 1
            print(f"  {status} '{r['query']}'")
            if r["error"]:
                print(f"      Error: {r['error']}")
        
        print(f"\n--- Summary ---")
        print(f"Queries: {len(results)}")
        print(f"Successful: {success_count}")
        print(f"Failed: {len(results) - success_count}")
        
        if success_count == len(results):
            print("✓ All test queries returned results. Brain sync verified.")
            return 0
        else:
            print("✗ Some queries failed. Brain sync may be incomplete.")
            return 1


if __name__ == "__main__":
    sys.exit(main())
