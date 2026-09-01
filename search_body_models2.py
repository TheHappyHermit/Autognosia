#!/usr/bin/env python3
"""Search for specific papers on body schema models."""
import urllib.request
import urllib.parse
import re
import json

def search_scholar(query, num_results=10):
    """Search Google Scholar for papers."""
    url = 'https://scholar.google.com/scholar?q=' + urllib.parse.quote(query) + '&hl=en&as_sdt=0%2C5'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode('utf-8', errors='replace')
            return parse_scholar_results(html, num_results)
    except Exception as e:
        return [{'error': str(e)}]

def parse_scholar_results(html, num_results):
    """Parse Google Scholar HTML results."""
    results = []
    blocks = re.findall(r'<div class="gs_r gs_or gs_scl"[^>]*>(.*?)</div>\s*</div>\s*</div>', html, re.DOTALL)
    if not blocks:
        blocks = re.findall(r'<div class="gs_r[^"]*"[^>]*>(.*?)</div>\s*</div>', html, re.DOTALL)
    
    for block in blocks[:num_results]:
        title_match = re.search(r'<h3 class="gs_rt"[^>]*>(.*?)</h3>', block, re.DOTALL)
        link_match = re.search(r'<a[^>]*href="([^"]*)"[^>]*>', block)
        snippet_match = re.search(r'<div class="gs_rs">(.*?)</div>', block, re.DOTALL)
        meta_match = re.search(r'<div class="gs_a">(.*?)</div>', block, re.DOTALL)
        
        title = re.sub(r'<[^>]+>', '', title_match.group(1)) if title_match else ''
        url = link_match.group(1) if link_match else ''
        snippet = re.sub(r'<[^>]+>', '', snippet_match.group(1)) if snippet_match else ''
        meta = re.sub(r'<[^>]+>', '', meta_match.group(1)) if meta_match else ''
        
        results.append({
            'title': title.strip(),
            'url': url,
            'snippet': snippet.strip(),
            'meta': meta.strip()
        })
    return results

# More specific searches
searches = [
    "Kilner Haggard 2004 motor perception Bayesian",
    "Tsakiris 2005 rubber hand illusion self-attribution",
    "Wolpert Ghahramani Jordan 1995 internal model sensorimotor",
    "Friston 2010 free energy principle brain",
    "Hoffmann 2010 body schema review robotics",
    "Lallee 2010 multi-modal convergence maps body schema",
    "Aymery 2014 Bayesian body model",
    "Friston 2012 free energy self",
    "Clark 2013 predictive coding body",
    "Seth 2013 active inference interoception"
]

for q in searches:
    print(f"\n{'='*80}")
    print(f"SEARCH: {q}")
    print('='*80)
    results = search_scholar(q, 5)
    for r in results:
        if 'error' not in r:
            print(f"\n{r['title']}")
            print(f"  URL: {r['url']}")
            print(f"  Meta: {r['meta']}")
            print(f"  Snippet: {r['snippet'][:250]}")
        else:
            print(f"  Error: {r['error']}")