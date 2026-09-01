#!/usr/bin/env python3
import urllib.request
import urllib.parse
import re
import html
import sys

def duckduckgo_search(query):
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote(query)}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
    )
    resp = urllib.request.urlopen(req, timeout=10)
    text = resp.read().decode("utf-8", errors="replace")
    results = []
    # Extract title
    titles = re.findall(r'<a class="result__a"[^>]*>(.*?)</a>', text, re.DOTALL)
    # Extract snippet
    snippets_raw = re.findall(r'<a class="result__snippet"[^>]*>(.*?)</a>', text, re.DOTALL)
    # Extract URLs
    urls = re.findall(r'uddg=([^&"]+)', text)
    
    for i in range(min(len(titles), len(snippets_raw), len(urls))):
        title = html.unescape(re.sub(r'<[^>]+>', '', titles[i])).strip()
        desc = html.unescape(re.sub(r'<[^>]+>', '', snippets_raw[i])).strip()
        url = urllib.parse.unquote(urls[i])
        results.append({
            "title": title,
            "url": url,
            "description": desc
        })
    return results

searches = {
    "1. Extended mind thesis Clark Chalmers 1998": "extended mind thesis Clark Chalmers 1998",
    "2. Cognitive offloading transactive memory teams": "cognitive offloading transactive memory teams",
    "3. Kirsh Parisy cognitive criteria extended mind": "Kirsh Parisy cognitive criteria extended mind",
    "4. Extended mind criticism replication debate": "extended mind criticism replication debate",
    "5. Computational models extended cognition": "computational models extended cognition",
    "6. Extended mind recent review 2020 2021 2022 2023": "extended mind review 2020 2021 2022 2023",
    "7. Cognitive offloading smartphone memory transactive": "cognitive offloading smartphone memory transactive",
    "8. Extended mind AI cognitive architecture": "extended mind AI cognitive architecture",
}

for label, query in searches.items():
    print(f"\n{'='*80}")
    print(f"SEARCH: {label}")
    print(f"Query: {query}")
    print(f"{'='*80}")
    results = duckduckgo_search(query)
    for i, r in enumerate(results, 1):
        print(f"\n  {i}. Title: {r['title']}")
        print(f"     URL: {r['url']}")
        print(f"     Desc: {r['description']}")
    if not results:
        print("  No results found.")
    print()
