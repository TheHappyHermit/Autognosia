#!/usr/bin/env python3
import re
import sys

def extract_wiki_text(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    # Remove script and style elements
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '\n', html)
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    return '\n'.join(lines)

files = {
    'visual_perception': '/tmp/visual_perception.html',
    'ppa': '/tmp/ppa.html',
    'scene_cat': '/tmp/scene_cat.html',
    'visual_search': '/tmp/visual_search.html',
    'attention': '/tmp/attention.html',
}

for name, path in files.items():
    print(f"\n{'='*80}")
    print(f"=== {name.upper()} ===")
    print(f"{'='*80}\n")
    try:
        text = extract_wiki_text(path)
        print(text[:30000])
    except Exception as e:
        print(f"Error: {e}")
