#!/usr/bin/env python3
"""
Research script for Body Schema and Proprioceptive Body Models
This script searches PubMed for relevant papers and extracts citation details
"""
import urllib.request
import urllib.parse
import json
import time
import re
import xml.etree.ElementTree as ET

def search_pubmed(query, retmax=10):
    """Search PubMed and return list of PMIDs"""
    encoded_query = urllib.parse.quote(query)
    url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term={encoded_query}&retmode=json&retmax={retmax}'
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            return data.get('esearchresult', {}).get('idlist', [])
    except Exception as e:
        print(f"Error searching for '{query}': {e}")
        return []

def get_paper_details(pmid):
    """Get full citation details for a PMID"""
    url = f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={pmid}&retmode=xml'
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = response.read().decode()
            return data
    except Exception as e:
        print(f"Error fetching PMID {pmid}: {e}")
        return None

def extract_citation(xml_data):
    """Extract citation details from PubMed XML"""
    try:
        root = ET.fromstring(xml_data)
        article = root.find('.//Article')
        
        # Authors
        authors = []
        for author in article.findall('.//Author'):
            last = author.find('LastName')
            first = author.find('ForeName')
            if last is not None and first is not None:
                authors.append(f"{last.text} {first.text[0]}")
        
        # Title
        title = article.find('ArticleTitle')
        title_text = title.text if title is not None else 'N/A'
        
        # Journal
        journal = article.find('.//Journal/Title')
        journal_text = journal.text if journal is not None else 'N/A'
        
        # Year
        year = article.find('.//JournalIssue/PubDate/Year')
        if year is None:
            year = article.find('.//PubDate/Year')
        year_text = year.text if year is not None else 'N/A'
        
        # Volume, Issue, Pages
        volume = article.find('.//JournalIssue/Volume')
        issue = article.find('.//JournalIssue/Issue')
        pages = article.find('.//MedlinePgn')
        
        # DOI
        doi = None
        for aid in root.findall('.//ArticleId'):
            if aid.get('IdType') == 'doi':
                doi = aid.text
                break
        
        # Abstract
        abstract = root.find('.//AbstractText')
        abstract_text = abstract.text if abstract is not None else 'N/A'
        
        return {
            'authors': authors,
            'title': title_text,
            'journal': journal_text,
            'year': year_text,
            'volume': volume.text if volume is not None else 'N/A',
            'issue': issue.text if issue is not None else 'N/A',
            'pages': pages.text if pages is not None else 'N/A',
            'doi': doi,
            'abstract': abstract_text[:500] if abstract_text and len(abstract_text) > 500 else abstract_text
        }
    except Exception as e:
        return {'error': str(e)}

# Search for key papers
search_queries = {
    'peripersonal_space_review': 'peripersonal+space+review+AND+2018:2025[dp]',
    'body_schema_review': 'body+schema+review+AND+2018:2025[dp]',
    'body_representation_review': 'body+representation+review+AND+2018:2025[dp]',
    'tool_use_body_schema_review': 'tool+use+body+schema+review+AND+2018:2025[dp]',
    'rubber_hand_illusion_review': 'rubber+hand+illusion+review+AND+2018:2025[dp]',
    'body_schema_body_image': 'body+schema+body+image+distinction',
    'peripersonal_space_definition': 'peripersonal+space+definition+neural+basis',
    'Haggard_body_schema': 'Haggard+body+schema+review',
    'Wolpert_body_schema': 'Wolpert+body+schema+forward+model',
    'Bays_body_schema': 'Bays+Wolpert+body+schema',
    'Graziano_peripersonal': 'Graziano+peripersonal+space',
    'Rizzolatti_peripersonal': 'Rizzolatti+peripersonal+space',
    'Holmes_Spence_peripersonal': 'Holmes+Spence+peripersonal+space',
    'Maravita_Iriki': 'Maravita+Iriki+body+schema+tool',
    'Berti_Frassinetti': 'Berti+Frassinetti+tool+use+body+schema',
    'Cardinali_tool_use': 'Cardinali+tool+use+body+schema',
    'Carlson_tool_use': 'Carlson+tool+use+body+schema',
    'Gallagher_body_schema': 'Gallagher+body+schema+body+image',
    'Longo_body_schema': 'Longo+Haggard+body+schema',
    'Lush_rubber_hand': 'Lush+rubber+hand+illusion+demand+characteristics',
}

print("Searching PubMed for body schema and peripersonal space papers...")
results = {}
for name, query in search_queries.items():
    ids = search_pubmed(query, retmax=5)
    results[name] = ids
    print(f"{name}: {ids}")
    time.sleep(0.3)

# Collect all unique PMIDs
all_pmids = set()
for ids in results.values():
    all_pmids.update(ids)

print(f"\nTotal unique PMIDs to fetch: {len(all_pmids)}")

# Fetch details for all papers
papers = {}
for pmid in all_pmids:
    xml_data = get_paper_details(pmid)
    if xml_data:
        citation = extract_citation(xml_data)
        citation['pmid'] = pmid
        papers[pmid] = citation
    time.sleep(0.3)

# Output results
print("\n" + "="*80)
print("BODY SCHEMA AND PROPRIOCEPTIVE BODY MODELS - RESEARCH RESULTS")
print("="*80)

for search_name, pmids in results.items():
    print(f"\n{'='*80}")
    print(f"SEARCH: {search_name.upper()}")
    print(f"{'='*80}")
    for pmid in pmids:
        if pmid in papers:
            p = papers[pmid]
            print(f"\n  PMID: {pmid}")
            print(f"  Authors: {', '.join(p.get('authors', [])[:3])}{' et al.' if len(p.get('authors', [])) > 3 else ''}")
            print(f"  Title: {p.get('title', 'N/A')}")
            print(f"  Journal: {p.get('journal', 'N/A')}")
            print(f"  Year: {p.get('year', 'N/A')}")
            print(f"  Volume: {p.get('volume', 'N/A')}")
            print(f"  Issue: {p.get('issue', 'N/A')}")
            print(f"  Pages: {p.get('pages', 'N/A')}")
            print(f"  DOI: {p.get('doi', 'N/A')}")
            if p.get('abstract') and p['abstract'] != 'N/A':
                print(f"  Abstract: {p['abstract'][:300]}...")

# Save to file
output_file = '/home/<USER>/body_schema_research_results.json'
with open(output_file, 'w') as f:
    json.dump({'searches': results, 'papers': {str(k): v for k, v in papers.items()}}, f, indent=2)

print(f"\n\nResults saved to: {output_file}")