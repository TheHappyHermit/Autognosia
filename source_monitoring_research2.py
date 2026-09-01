import urllib.request
import json
import urllib.parse
import time

base_url = "https://api.semanticscholar.org/graph/v1/paper/search"

params = urllib.parse.urlencode({
    "query": "source monitoring review memory",
    "limit": 20,
    "fields": "title,authors,year,venue,abstract,citationCount,externalIds"
})
url = f"{base_url}?{params}"

print("Querying Semantic Scholar...")
try:
    with urllib.request.urlopen(url, timeout=10) as response:
        data = json.loads(response.read())
        papers = data.get("data", [])
        print(f"Found {len(papers)} papers")
        for i, p in enumerate(papers[:20]):
            title = p.get("title", "N/A")
            authors = [a.get("name", "") for a in p.get("authors", [])]
            year = p.get("year", "N/A")
            venue = p.get("venue", "N/A")
            cites = p.get("citationCount", "N/A")
            abstract = p.get("abstract", "")[:300] if p.get("abstract") else "No abstract"
            print(f"\n--- {i+1}. [{year}] {title} ---")
            print(f"    Authors: {', '.join(authors[:5])}")
            print(f"    Journal: {venue} (citations: {cites})")
            print(f"    Abstract: {abstract}...")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
    if hasattr(e, 'read'):
        print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
