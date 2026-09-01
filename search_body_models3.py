#!/usr/bin/env python3
"""Extract paper details from arXiv and other sources."""
import urllib.request
import urllib.parse
import re
import json

def get_arxiv_details(arxiv_id):
    """Get paper details from arXiv."""
    url = f"https://export.arxiv.org/api/query?id_list={arxiv_id}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        xml = resp.read().decode('utf-8')
    title_match = re.search(r'<title>(.*?)</title>', xml)
    summary_match = re.search(r'<summary>(.*?)</summary>', xml, re.DOTALL)
    authors_match = re.findall(r'<name>(.*?)</name>', xml)
    return {
        'title': re.sub(r'<[^>]+>', '', title_match.group(1)) if title_match else '',
        'authors': [re.sub(r'<[^>]+>', '', a) for a in authors_match],
        'summary': re.sub(r'<[^>]+>', '', summary_match.group(1)) if summary_match else '',
    }

# arXiv IDs from search results
arxiv_ids = ['1805.03104', '1806.06809', '1906.10184', '2112.08948']
for aid in arxiv_ids:
    print(f"\n=== arXiv: {aid} ===")
    try:
        details = get_arxiv_details(aid)
        print(f"Title: {details['title']}")
        print(f"Authors: {', '.join(details['authors'])}")
        print(f"Summary: {details['summary'][:500]}")
    except Exception as e:
        print(f"Error: {e}")

# Also try to get details from Semantic Scholar API
import json

def semantic_scholar(title):
    """Query Semantic Scholar API."""
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={urllib.parse.quote(title)}&limit=2&fields=title,authors,year,abstract,citationCount,externalIds"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data.get('data', [])
    except Exception as e:
        return [{'error': str(e)}]

papers = [
    "Bayesian body model proprioception",
    "predictive coding body ownership rubber hand illusion",
    "forward model proprioception sensorimotor",
    "free energy principle body representation",
]
for p in papers:
    print(f"\n=== Semantic Scholar: {p} ===")
    results = semantic_scholar(p)
    for r in results:
        if 'error' not in r:
            print(f"Title: {r.get('title','?')}")
            print(f"Authors: {[a.get('name','?') for a in r.get('authors',[])]}")
            print(f"Year: {r.get('year','?')}")
            print(f"Citations: {r.get('citationCount','?')}")
            print(f"Abstract: {r.get('abstract','')[:300]}")
        else:
            print(f"Error: {r['error']}")