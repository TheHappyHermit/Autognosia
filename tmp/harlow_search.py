#!/usr/bin/env python3
import urllib.request
import re

url = "https://en.wikipedia.org/wiki/Harry_Harlow"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8')

# Extract content from article body
content = re.sub(r'<[^>]+>', ' ', html)
content = re.sub(r'\s+', ' ', content).strip()

# Find sections about learning set
for term in ['learning set', 'learning-to-learn', 'oddity', 'discrimination', 'Formation of Learning Sets']:
    idx = content.lower().find(term.lower())
    if idx >= 0:
        start = max(0, idx-200)
        end = min(len(content), idx+800)
        print(f'=== Around "{term}" ===')
        print(content[start:end])
        print()

# Also search for the key paper
for term in ['Formation of Learning Sets', '1949', 'Psychological Review']:
    idx = content.lower().find(term.lower())
    if idx >= 0:
        start = max(0, idx-100)
        end = min(len(content), idx+500)
        print(f'=== Paper ref "{term}" ===')
        print(content[start:end])
        print()
