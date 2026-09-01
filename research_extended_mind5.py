#!/usr/bin/env python3
"""Additional targeted searches with rate limiting"""
import urllib.request
import urllib.parse
import json
import time

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

# Additional targeted searches
searches = [
    ("Extended mind Sutton cognitive integration", "extended mind Sutton cognitive integration 2010"),
    ("Ward Snow cognitive offloading 2010", "Ward Snow cognitive offloading"),
    ("Barnes transactive memory Wegner", "transactive memory Wegner"),
    ("Menary extended cognition synthesis", "Menary extended cognition"),
    ("Rupert representation extended mind", "Rupert extended mind"),
    ("Clark boundaries of mind", "Andy Clark boundaries of mind"),
    ("Hutto Peeters extended mind 2018", "extended mind Hutto Peeters"),
    ("Wheeler reconstructing extended mind", "Wheeler reconstructing extended mind"),
]

for label, query in searches:
    print(f"\n{'='*80}")
    print(f"SEARCH: {label}")
    print(f"Query: {query}")
    print(f"{'='*80}")
    
    time.sleep(3)
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
