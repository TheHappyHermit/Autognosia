"""Research script for TMR papers using multiple APIs"""
import subprocess, json, os

def run(cmd, timeout=15):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
    return r.stdout.strip(), r.returncode

print("=" * 80)
print("CROSSREF API - targeted memory reactivation")
print("=" * 80)
out, rc = run('curl -s -o /tmp/cr_tmr.json "https://api.crossref.org/works?query.target=targeted+memory+reactivation&rows=15&select=title,author,published-print,container-title,DOI,cited-by,published&mailto=josh@example.com" && cat /tmp/cr_tmr.json')
print(out[:3000])

print("\n" + "=" * 80)
print("CROSSREF API - sleep memory consolidation")
print("=" * 80)
out2, rc2 = run('curl -s -o /tmp/cr_sleep.json "https://api.crossref.org/works?query.target=sleep+memory+consolidation+reactivation&rows=15&select=title,author,published-print,container-title,DOI,cited-by,published&mailto=josh@example.com" && cat /tmp/cr_sleep.json')
print(out2[:3000])

print("\n" + "=" * 80)
print("PUBMED API - targeted memory reactivation")
print("=" * 80)
out3, rc3 = run('curl -s -o /tmp/pubmed_tmr.xml "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&term=targeted+memory+reactivation[TITLE-ABSTRACT]&retmax=20" && cat /tmp/pubmed_tmr.xml')
print(out3[:2000])

# Get the PMIDs from PubMed
import re
pmids = re.findall(r'"IdList":\[(.*?)\]', out3)
if pmids:
    pmid_list = pmids[0].split(',')
    pmid_list = [p.strip().strip('"') for p in pmid_list if p.strip()]
    print(f"\nPMC/PMID list: {pmid_list}")
    
    if pmid_list:
        # Fetch detailed info for top 10
        pmid_str = ','.join(pmid_list[:10])
        out4, rc4 = run(f'curl -s -o /tmp/pubmed_details.xml "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={pmid_str}&rettype=xml&retmode=xml" && cat /tmp/pubmed_details.xml')
        print(out4[:5000])
