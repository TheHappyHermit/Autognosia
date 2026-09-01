#!/usr/bin/env python3
"""Research tool with rate limiting between requests"""
import urllib.request
import urllib.parse
import json
import sys
import time

def wikipedia_search(query, limit=10):
    base = "https://en.wikipedia.org/w/api.php"
    params = urllib.parse.urlencode({
        "action": "query", "list": "search", "srsearch": query,
        "srlimit": limit, "format": "json", "srwhat": "text"
    })
    url = f"{base}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "HermesResearch/1.0"})
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode())
    results = []
    for item in data.get("query", {}).get("search", []):
        results.append({
            "title": item.get("title", ""),
            "url": f"https://en.wikipedia.org/wiki/{urllib.parse.quote(item.get('title', ''))}",
            "description": item.get("snippet", "").replace("<[^>]+>", "").replace("\n", " ")[:500]
        })
    return results

def crossref_search(query, limit=10):
    base = "https://api.crossref.org/works"
    params = urllib.parse.urlencode({
        "query": query, "rows": limit,
        "select": "title,author,published-print,published-online,publisher,DOI,is-referenced-by-count,abstract",
        "mailto": "research@example.com"
    })
    url = f"{base}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "HermesResearch/1.0 (research@example.com)"})
    resp = urllib.request.urlopen(req, timeout=15)
    data = json.loads(resp.read().decode())
    results = []
    for item in data.get("message", {}).get("items", []):
        title = item.get("title", [""])[0]
        authors = ", ".join(a.get("family", "") + " " + a.get("given", "") for a in item.get("author", []))
        doi = item.get("DOI", "")
        url_out = f"https://doi.org/{doi}" if doi else ""
        abstract = item.get("abstract", "")
        year = ""
        for source in ["published-print", "published-online"]:
            dp = item.get(source, {}).get("date-parts", [[None]])[0][0]
            if dp: year = str(dp); break
        results.append({
            "title": title, "url": url_out,
            "description": abstract[:300] if len(abstract) > 300 else (abstract or "No abstract available"),
            "authors": authors, "year": year, "citations": item.get("is-referenced-by-count", 0)
        })
    return results

searches = [
    ("5. Computational models extended cognition", "computational models extended cognition"),
    ("6. Extended mind recent review 2020-2023", "extended mind review recent 2020 2021 2022 2023"),
    ("7. Cognitive offloading smartphone memory", "cognitive offloading smartphone memory"),
    ("8. Extended mind AI cognitive architecture", "extended mind AI cognitive architecture"),
]

for label, query in searches:
    print(f"\n{'='*80}")
    print(f"SEARCH: {label}")
    print(f"Query: {query}")
    print(f"{'='*80}")
    
    time.sleep(2)
    print("\n  [Wikipedia Search]")
    try:
        wiki_results = wikipedia_search(query, limit=8)
        for i, r in enumerate(wiki_results, 1):
            print(f"\n  {i}. Title: {r['title']}")
            print(f"     URL: {r['url']}")
            print(f"     Snippet: {r['description'][:300]}")
        if not wiki_results: print("  No results.")
    except Exception as e:
        print(f"  Error: {e}")
    
    time.sleep(2)
    print("\n  [CrossRef]")
    try:
        cr_results = crossref_search(query, limit=8)
        for i, r in enumerate(cr_results, 1):
            print(f"\n  {i}. Title: {r['title']}")
            print(f"     URL: {r['url']}")
            print(f"     Authors: {r['authors']} ({r['year']})")
            print(f"     Citations: {r['citations']}")
            print(f"     Desc: {r['description'][:300]}")
        if not cr_results: print("  No results.")
    except Exception as e:
        print(f"  Error: {e}")
    
    print()
