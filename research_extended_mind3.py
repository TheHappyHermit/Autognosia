#!/usr/bin/env python3
"""Research tool using Wikipedia API and CrossRef"""
import urllib.request
import urllib.parse
import json
import sys
import time

def wikipedia_search(query, limit=10):
    """Search Wikipedia for results"""
    base = "https://en.wikipedia.org/w/api.php"
    params = urllib.parse.urlencode({
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": limit,
        "format": "json",
        "srwhat": "text"
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

def wikipedia_get(query, max_pages=5):
    """Get full text of top Wikipedia pages"""
    base = "https://en.wikipedia.org/w/api.php"
    params = urllib.parse.urlencode({
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": max_pages * 2,
        "format": "json",
        "srprop": "",
        "srinterwikimap": "0",
        "srwhat": "text"
    })
    url = f"{base}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "HermesResearch/1.0"})
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode())
    
    titles = [item["title"] for item in data.get("query", {}).get("search", [])]
    if not titles:
        return []
    
    # Fetch page content
    pages_param = urllib.parse.urlencode({
        "action": "query",
        "titles": "|".join(titles[:max_pages]),
        "prop": "extracts|categories",
        "explaintext": "true",
        "format": "json"
    })
    time.sleep(0.5)
    url = f"{base}?{pages_param}"
    req = urllib.request.Request(url, headers={"User-Agent": "HermesResearch/1.0"})
    resp = urllib.request.urlopen(req, timeout=10)
    data = json.loads(resp.read().decode())
    pages = data.get("query", {}).get("pages", {})
    
    results = []
    for page_id, page in pages.items():
        results.append({
            "title": page.get("title", ""),
            "url": f"https://en.wikipedia.org/wiki/{urllib.parse.quote(page.get('title', ''))}",
            "extract": page.get("extract", "")[:3000],
            "categories": [c.get("title", "").replace("Category:", "") for c in page.get("categories", [])]
        })
    return results

def crossref_search(query, limit=10):
    """Search CrossRef for scholarly works"""
    base = "https://api.crossref.org/works"
    params = urllib.parse.urlencode({
        "query": query,
        "rows": limit,
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
        if item.get("published-print", {}).get("date-parts", [[None]])[0][0]:
            year = item["published-print"]["date-parts"][0][0]
        elif item.get("published-online", {}).get("date-parts", [[None]])[0][0]:
            year = item["published-online"]["date-parts"][0][0]
        
        results.append({
            "title": title,
            "url": url_out,
            "description": abstract[:300] if len(abstract) > 300 else (abstract or "No abstract available"),
            "authors": authors,
            "year": year,
            "citations": item.get("is-referenced-by-count", 0)
        })
    return results

# Define searches
searches = [
    ("1. Extended mind thesis Clark Chalmers 1998", "extended mind thesis Clark Chalmers"),
    ("2. Cognitive offloading transactive memory teams", "cognitive offloading transactive memory teams"),
    ("3. Kirsh Parisy cognitive criteria extended mind", "Kirsh Parisy extended mind criteria"),
    ("4. Extended mind criticism replication debate", "extended mind criticism Adams Aizawa"),
    ("5. Computational models extended cognition", "computational models extended cognition"),
    ("6. Extended mind recent review 2020 2021 2022 2023", "extended mind review recent"),
    ("7. Cognitive offloading smartphone memory transactive", "cognitive offloading smartphone memory"),
    ("8. Extended mind AI cognitive architecture", "extended mind AI cognitive architecture"),
]

for label, query in searches:
    print(f"\n{'='*80}")
    print(f"SEARCH: {label}")
    print(f"Query: {query}")
    print(f"{'='*80}")
    
    # Wikipedia search
    print("\n  [Wikipedia Search]")
    wiki_results = wikipedia_search(query, limit=8)
    for i, r in enumerate(wiki_results, 1):
        print(f"\n  {i}. Title: {r['title']}")
        print(f"     URL: {r['url']}")
        print(f"     Snippet: {r['description'][:300]}")
    if not wiki_results:
        print("  No results.")
    
    # Wikipedia full pages (top 3)
    print("\n  [Wikipedia Full Pages]")
    wiki_pages = wikipedia_get(query, max_pages=3)
    for i, r in enumerate(wiki_pages, 1):
        print(f"\n  {i}. {r['title']}")
        print(f"     URL: {r['url']}")
        print(f"     Extract: {r['extract'][:500]}...")
        print(f"     Categories: {', '.join(r['categories'][:10])}")
    if not wiki_pages:
        print("  No pages found.")
    
    # CrossRef
    print("\n  [CrossRef]")
    cr_results = crossref_search(query, limit=8)
    for i, r in enumerate(cr_results, 1):
        print(f"\n  {i}. Title: {r['title']}")
        print(f"     URL: {r['url']}")
        print(f"     Authors: {r['authors']} ({r['year']})")
        print(f"     Citations: {r['citations']}")
        print(f"     Desc: {r['description'][:300]}")
    if not cr_results:
        print("  No results.")
    
    print()
