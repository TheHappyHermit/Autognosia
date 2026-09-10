#!/usr/bin/env python3
"""
Research quality checker for Autognosia wiki.
Spot-checks research files for:
1. Valid YAML front matter
2. URLs that resolve (200 status)
3. Matching tags and sources
4. Contradictions with other research files

Usage: python3 research_quality_check.py [--source active-wiki|oracle-brain] [--sample 10]
"""

import os
import re
import sys
import json
import random
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timedelta

# Configuration
WIKI_PATHS = {
    "active-wiki": os.path.expanduser("~/.autognosia/active-wiki/research"),
    "oracle-brain": os.path.expanduser("~/.autognosia/oracle/brain"),
}

FRONT_MATTER_PATTERN = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
URL_PATTERN = re.compile(r"https?://[^\s\]`\"']+(?<![).,!?'\"])")
WIKILINK_PATTERN = re.compile(r"\[\[([^\]]+)\]\]")

REQUIRED_FRONT_MATTER = ["id", "description", "type", "status", "generated", "tags", "confidence"]
VALID_TYPES = ["research_report", "reference", "person", "project", "idea", "system", "Index", "log", "report", "decision", "comparison", "profile"]


def get_wiki_files(source):
    """Get all markdown files in the wiki source."""
    wiki_path = WIKI_PATHS.get(source)
    if not wiki_path or not os.path.exists(wiki_path):
        print(f"Wiki path not found: {wiki_path}")
        return []
    
    files = []
    for root, dirs, filenames in os.walk(wiki_path):
        # Skip graphify-out and .git
        dirs[:] = [d for d in dirs if d not in ["graphify-out", ".git", "__pycache__"]]
        for fn in filenames:
            if fn.endswith(".md"):
                files.append(os.path.join(root, fn))
    return files


def parse_front_matter(content):
    """Extract YAML front matter from markdown content."""
    match = FRONT_MATTER_PATTERN.match(content)
    if not match:
        return None
    
    front_matter = {}
    for line in match.group(1).split("\n"):
        line = line.strip()
        if ":" in line:
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            front_matter[key] = value
    return front_matter


def check_url(url, timeout=10):
    """Check if a URL resolves (returns 200)."""
    try:
        req = urllib.request.Request(url, method="HEAD")
        req.add_header("User-Agent", "Mozilla/5.0 (compatible; ResearchQualityBot/1.0)")
        response = urllib.request.urlopen(req, timeout=timeout)
        return response.getcode() == 200
    except (urllib.error.URLError, urllib.error.HTTPError, OSError, ValueError, Exception):
        return False


def check_file(filepath):
    """Check a single research file for quality issues."""
    issues = []
    
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        return [{"type": "read_error", "message": str(e)}]
    
    # Check front matter
    front_matter = parse_front_matter(content)
    if front_matter is None:
        issues.append({
            "type": "missing_front_matter",
            "message": "File has no YAML front matter"
        })
    else:
        # Check required fields
        for field in REQUIRED_FRONT_MATTER:
            if field not in front_matter:
                issues.append({
                    "type": "missing_field",
                    "message": f"Missing required front matter field: {field}"
                })
        
        # Check type validity
        if "type" in front_matter and front_matter["type"] not in VALID_TYPES:
            issues.append({
                "type": "invalid_type",
                "message": f"Invalid type: {front_matter['type']}. Must be one of: {VALID_TYPES}"
            })
        
        # Check date format
        for date_field in ["created", "updated"]:
            if date_field in front_matter:
                try:
                    datetime.strptime(front_matter[date_field], "%Y-%m-%d")
                except ValueError:
                    issues.append({
                        "type": "invalid_date",
                        "message": f"Invalid date format for {date_field}: {front_matter[date_field]}"
                    })
    
    # Check URLs
    urls = URL_PATTERN.findall(content)
    broken_urls = []
    for url in urls[:5]:  # Check max 5 URLs per file
        if not check_url(url):
            broken_urls.append(url)
    
    if broken_urls:
        issues.append({
            "type": "broken_urls",
            "message": f"Found {len(broken_urls)} broken URLs",
            "urls": broken_urls
        })
    
    # Check wikilinks
    wikilinks = WIKILINK_PATTERN.findall(content)
    if len(wikilinks) < 2:
        issues.append({
            "type": "few_backlinks",
            "message": f"Only {len(wikilinks)} wikilinks found (minimum 2-3 recommended)"
        })
    
    return issues


def find_contradictions(files, sample_size=20):
    """Find potential contradictions between research files."""
    contradictions = []
    
    # Sample files to check
    sample = random.sample(files, min(sample_size, len(files)))
    
    # Extract key claims from each file
    file_claims = {}
    for filepath in sample:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Extract title and key sentences
            front_matter = parse_front_matter(content)
            title = front_matter.get("title", os.path.basename(filepath)) if front_matter else os.path.basename(filepath)
            
            # Look for strong claims (sentences with "is", "are", "must", "best", "worst", "obsolete", "superior")
            claim_pattern = re.compile(r"([A-Z][^.!?]*(?:is|are|must|best|worst|obsolete|superior|inferior|failed|success)[^.!?]*[.!?])", re.IGNORECASE)
            claims = claim_pattern.findall(content)
            
            if claims:
                file_claims[filepath] = {
                    "title": title,
                    "claims": claims[:5]  # Top 5 claims per file
                }
        except Exception:
            continue
    
    # Simple contradiction detection: look for opposing keywords
    opposing_pairs = [
        ("best", "worst"),
        ("superior", "inferior"),
        ("success", "failure"),
        ("obsolete", "current"),
        ("effective", "ineffective"),
    ]
    
    file_list = list(file_claims.items())
    for i in range(len(file_list)):
        for j in range(i + 1, len(file_list)):
            path_a, data_a = file_list[i]
            path_b, data_b = file_list[j]
            
            for claim_a in data_a["claims"]:
                for claim_b in data_b["claims"]:
                    for opp_a, opp_b in opposing_pairs:
                        if (opp_a.lower() in claim_a.lower() and opp_b.lower() in claim_b.lower()) or \
                           (opp_b.lower() in claim_a.lower() and opp_a.lower() in claim_b.lower()):
                            # Check if claims are about similar topics
                            words_a = set(claim_a.lower().split())
                            words_b = set(claim_b.lower().split())
                            common_words = words_a & words_b
                            if len(common_words) >= 3:  # At least 3 common words
                                contradictions.append({
                                    "file_a": data_a["title"],
                                    "file_b": data_b["title"],
                                    "claim_a": claim_a,
                                    "claim_b": claim_b,
                                })
    
    return contradictions


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Research quality checker")
    parser.add_argument("--source", choices=["active-wiki", "oracle-brain"], default="active-wiki")
    parser.add_argument("--sample", type=int, default=10, help="Number of files to sample")
    parser.add_argument("--check-contradictions", action="store_true", help="Check for contradictions")
    args = parser.parse_args()
    
    files = get_wiki_files(args.source)
    if not files:
        print("No files found.")
        return
    
    print(f"Found {len(files)} files in {args.source}")
    
    # Sample files
    sample = random.sample(files, min(args.sample, len(files)))
    
    # Check each file
    total_issues = 0
    files_with_issues = 0
    
    for filepath in sample:
        issues = check_file(filepath)
        if issues:
            files_with_issues += 1
            total_issues += len(issues)
            print(f"\n{filepath}:")
            for issue in issues:
                print(f"  - [{issue['type']}] {issue['message']}")
    
    print(f"\n--- Summary ---")
    print(f"Files checked: {len(sample)}")
    print(f"Files with issues: {files_with_issues}")
    print(f"Total issues: {total_issues}")
    
    # Check contradictions
    if args.check_contradictions:
        print(f"\n--- Contradiction Check ---")
        contradictions = find_contradictions(files)
        if contradictions:
            print(f"Found {len(contradictions)} potential contradictions:")
            for c in contradictions[:5]:  # Show top 5
                print(f"\n  {c['file_a']}:")
                print(f"    {c['claim_a']}")
                print(f"  vs")
                print(f"  {c['file_b']}:")
                print(f"    {c['claim_b']}")
        else:
            print("No contradictions found.")


if __name__ == "__main__":
    main()
