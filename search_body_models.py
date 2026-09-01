#!/usr/bin/env python3
"""Search for computational body schema models using web scraping."""
import urllib.request
import urllib.parse
import re
import json
import time

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
    # Find all result blocks
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

def search_arxiv(query, num_results=10):
    """Search arXiv for papers."""
    url = 'https://arxiv.org/search/?searchtype=all&query=' + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode('utf-8', errors='replace')
            return parse_arxiv_results(html, num_results)
    except Exception as e:
        return [{'error': str(e)}]

def parse_arxiv_results(html, num_results):
    """Parse arXiv search results."""
    results = []
    # Find result entries
    entries = re.findall(r'<li class="arxiv-result">(.*?)</li>', html, re.DOTALL)
    for entry in entries[:num_results]:
        title_match = re.search(r'<p class="title[^"]*">(.*?)</p>', entry, re.DOTALL)
        link_match = re.search(r'<a[^>]*href="(https://arxiv.org/abs/[^"]*)"[^>]*>', entry)
        snippet_match = re.search(r'<p class="abstract[^"]*">(.*?)</p>', entry, re.DOTALL)
        meta_match = re.search(r'<p class="authors">(.*?)</p>', entry, re.DOTALL)
        
        title = re.sub(r'<[^>]+>', '', title_match.group(1)) if title_match else ''
        url = link_match.group(1) if link_match else ''
        snippet = re.sub(r'<[^>]+>', '', snippet_match.group(1)) if snippet_match else ''
        meta = re.sub(r'<[^>]+>', '', meta_match.group(1)) if meta_match else ''
        
        results.append({
            'title': title.strip(),
            'url': url,
            'snippet': snippet.strip()[:300],
            'meta': meta.strip()[:200]
        })
    return results

# Main searches
print("=" * 80)
print("SEARCH 1: Bayesian body model proprioception")
print("=" * 80)
results = search_scholar("Bayesian body model proprioception", 10)
for r in results:
    if 'error' not in r:
        print(f"\n{r['title']}")
        print(f"  URL: {r['url']}")
        print(f"  Meta: {r['meta']}")
        print(f"  Snippet: {r['snippet'][:200]}")
    else:
        print(f"  Error: {r['error']}")

print("\n" + "=" * 80)
print("SEARCH 2: predictive coding body ownership")
print("=" * 80)
results = search_scholar("predictive coding body ownership rubber hand", 10)
for r in results:
    if 'error' not in r:
        print(f"\n{r['title']}")
        print(f"  URL: {r['url']}")
        print(f"  Meta: {r['meta']}")
        print(f"  Snippet: {r['snippet'][:200]}")
    else:
        print(f"  Error: {r['error']}")

print("\n" + "=" * 80)
print("SEARCH 3: forward model proprioception motor control")
print("=" * 80)
results = search_scholar("forward model proprioception motor control Wolpert", 10)
for r in results:
    if 'error' not in r:
        print(f"\n{r['title']}")
        print(f"  URL: {r['url']}")
        print(f"  Meta: {r['meta']}")
        print(f"  Snippet: {r['snippet'][:200]}")
    else:
        print(f"  Error: {r['error']}")

print("\n" + "=" * 80)
print("SEARCH 4: body schema neural network model")
print("=" * 80)
results = search_scholar("body schema neural network model embodiment", 10)
for r in results:
    if 'error' not in r:
        print(f"\n{r['title']}")
        print(f"  URL: {r['url']}")
        print(f"  Meta: {r['meta']}")
        print(f"  Snippet: {r['snippet'][:200]}")
    else:
        print(f"  Error: {r['error']}")

print("\n" + "=" * 80)
print("SEARCH 5: free energy principle body representation")
print("=" * 80)
results = search_scholar("free energy principle body representation self", 10)
for r in results:
    if 'error' not in r:
        print(f"\n{r['title']}")
        print(f"  URL: {r['url']}")
        print(f"  Meta: {r['meta']}")
        print(f"  Snippet: {r['snippet'][:200]}")
    else:
        print(f"  Error: {r['error']}")