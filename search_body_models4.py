#!/usr/bin/env python3
"""Comprehensive search for body schema computational models."""
import urllib.request
import urllib.parse
import re
import json
import subprocess

def semantic_scholar(title):
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={urllib.parse.quote(title)}&limit=2&fields=title,authors,year,abstract,citationCount,externalIds"
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (ResearchBot/1.0)',
        'Accept': 'application/json'
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            return data.get('data', [])
    except Exception as e:
        return [{'error': str(e)}]

def pubmed_search(term):
    """Search PubMed for papers."""
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={urllib.parse.quote(term)}&retmax=5&retmode=json"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            ids = data.get('esearchresult', {}).get('idlist', [])
            return ids
    except Exception as e:
        return []

def pubmed_extract(pmids):
    """Extract details for specific PubMed IDs."""
    ids = ','.join(str(p) for p in pmids)
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={ids}&retmode=json"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            results = []
            for pid in pmids:
                if pid in data.get('result', {}):
                    r = data['result'][pid]
                    results.append({
                        'title': str(r.get('title', '')),
                        'authors': str(r.get('authors', '')),
                        'year': str(r.get('pubdate', '')),
                        'journal': str(r.get('source', '')),
                    })
            return results
    except Exception as e:
        return [{'error': str(e)}]

# Run searches
print("=" * 80)
print("COMPREHENSIVE BODY SCHEMA COMPUTATIONAL MODELS RESEARCH")
print("=" * 80)

# === Semantic Scholar queries ===
queries = [
    "body schema predictive processing robot",
    "body ownership predictive coding rubber hand illusion",
    "forward model proprioception Bayesian estimation",
    "free energy principle body representation self",
    "Bayesian body model embodiment robotics",
    "sensorimotor body estimation predictive coding",
    "proprioceptive forward model cerebellum",
    "body schema computational neuroscience review",
    "active inference body ownership interoception",
    "multisensory body perception predictive coding",
]

all_results = []
for q in queries:
    print(f"\n--- Semantic Scholar: {q} ---")
    results = semantic_scholar(q)
    for r in results:
        if 'error' not in r:
            all_results.append(r)
            print(f"Title: {r.get('title','?')}")
            print(f"Authors: {[a.get('name','?') for a in r.get('authors',[])]}")
            print(f"Year: {r.get('year','?')}, Citations: {r.get('citationCount','?')}")
            abstract = r.get('abstract', '')
            print(f"Abstract: {abstract[:300]}...")
            print("---")

# === PubMed searches ===
print("\n" + "=" * 80)
print("PUBMED SEARCHES")
print("=" * 80)

pubmed_terms = [
    "body schema computational model",
    "proprioceptive forward model",
    "predictive coding body ownership",
    "Bayesian body representation",
    "free energy principle self body",
]

for term in pubmed_terms:
    print(f"\n--- PubMed: {term} ---")
    ids = pubmed_search(term)
    print(f"Found {len(ids)} IDs: {ids}")
    if ids:
        details = pubmed_extract(ids)
        for d in details:
            print(d)

# Write all results to file for reference
with open('/home/<USER>/body_schema_findings_raw.json', 'w') as f:
    json.dump(all_results, f, indent=2)
print(f"\n\nSaved {len(all_results)} results to body_schema_findings_raw.json")
