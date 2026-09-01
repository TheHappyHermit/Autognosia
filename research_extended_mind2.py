#!/usr/bin/env python3
"""Research tool using open APIs: Wikipedia search, Semantic Scholar, and CrossRef"""
import urllib.request
import urllib.parse
import json
import sys

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
            "url": f"https://en.wikipedia.org/?curid={item.get('pageid', '')}",
            "description": item.get("snippet", "").replace("<[^>]+>", "")[:500],
            "type": "wikipedia"
        })
    return results

def semantic_scholar_search(query, limit=10):
    """Search Semantic Scholar API for academic papers"""
    base = "https://api.semanticscholar.org/graph/v1/paper/search"
    params = urllib.parse.urlencode({
        "query": query,
        "limit": limit,
        "fields": "title,authors,year,abstract,citationCount,externalIds",
        "timeout": 30000
    })
    url = f"{base}?{params}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "HermesResearch/1.0",
        "Accept": "application/json"
    })
    resp = urllib.request.urlopen(req, timeout=15)
    data = json.loads(resp.read().decode())
    results = []
    for item in data.get("data", []):
        authors = ", ".join(a.get("name", "") for a in item.get("authors", []))
        abstract = item.get("abstract", "")
        if abstract and len(abstract) > 200:
            abstract = abstract[:200] + "..."
        elif not abstract:
            abstract = "No abstract available"
        
        # Try to get a DOI URL
        external = item.get("externalIds", {})
        doi = external.get("DOI", "")
        url_out = f"https://doi.org/{doi}" if doi else f"https://www.semanticscholar.org/paper/{item.get('paperId', '')}"
        
        results.append({
            "title": item.get("title", ""),
            "url": url_out,
            "description": abstract,
            "type": "semantic_scholar",
            "authors": authors,
            "year": item.get("year", ""),
            "citations": item.get("citationCount", 0)
        })
    return results

def crossref_search(query, limit=10):
    """Search CrossRef for scholarly works"""
    base = "https://api.crossref.org/works"
    params = urllib.parse.urlencode({
        "query": query,
        "rows": limit,
        "select": "title,author,published-print,published-online,publisher,DOI,is-referenced-by-count",
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
        abstract = item.get("abstract", "No abstract available")
        
        results.append({
            "title": title,
            "url": url_out,
            "description": abstract[:300] if len(abstract) > 300 else abstract,
            "type": "crossref",
            "authors": authors,
            "year": item.get("published-print", {}).get("date-parts", [[None]])[0][0] or 
                     item.get("published-online", {}).get("date-parts", [[None]])[0][0] or "",
            "citations": item.get("is-referenced-by-count", 0)
        })
    return results

# Define searches
searches = [
    ("1. Extended mind thesis Clark Chalmers 1998", "extended mind thesis Clark Chalmers"),
    ("2. Cognitive offloading transactive memory teams", "cognitive offloading transactive memory teams"),
    ("3. Kirsh Parisy cognitive criteria extended mind", "Kirsh Parisy extended mind criteria"),
    ("4. Extended mind criticism Adams Aizawa", "extended mind criticism replication"),
    ("5. Computational models extended cognition", "computational models extended cognition"),
    ("6. Extended mind review", "extended mind review 2020 2021 2022 2023"),
    ("7. Cognitive offloading smartphone memory", "cognitive offloading smartphone memory transactive"),
    ("8. Extended mind AI cognitive architecture", "extended mind AI cognitive architecture"),
]

for label, query in searches:
    print(f"\n{'='*80}")
    print(f"SEARCH: {label}")
    print(f"Query: {query}")
    print(f"{'='*80}")
    
    # Try Semantic Scholar first (academic)
    print("\n  [Semantic Scholar]")
    ss_results = semantic_scholar_search(query, limit=10)
    for i, r in enumerate(ss_results, 1):
        print(f"\n  {i}. Title: {r['title']}")
        print(f"     URL: {r['url']}")
        print(f"     Authors: {r['authors']} ({r['year']})")
        print(f"     Citations: {r['citations']}")
        print(f"     Abstract: {r['description'][:250]}")
    if not ss_results:
        print("  No results.")
    
    # Try CrossRef
    print("\n  [CrossRef]")
    cr_results = crossref_search(query, limit=10)
    for i, r in enumerate(cr_results, 1):
        print(f"\n  {i}. Title: {r['title']}")
        print(f"     URL: {r['url']}")
        print(f"     Authors: {r['authors']} ({r['year']})")
        print(f"     Citations: {r['citations']}")
        print(f"     Description: {r['description'][:250]}")
    if not cr_results:
        print("  No results.")
    
    # Try Wikipedia
    print("\n  [Wikipedia]")
    wiki_results = wikipedia_search(query, limit=5)
    for i, r in enumerate(wiki_results, 1):
        print(f"\n  {i}. Title: {r['title']}")
        print(f"     URL: {r['url']}")
        print(f"     Snippet: {r['description'][:250]}")
    if not wiki_results:
        print("  No results.")
    
    print()
