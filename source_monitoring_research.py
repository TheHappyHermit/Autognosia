import urllib.request
import json

# Search PubMed for source monitoring reviews
url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=source+monitoring+review&retmax=30&sort=date&retmode=json"
with urllib.request.urlopen(url) as response:
    data = json.loads(response.read())

ids = data.get('esearchresult', {}).get('idlist', [])
print(f"Found {len(ids)} results")
for i, pid in enumerate(ids[:25]):
    print(f"{i+1}. PMID: {pid}")

# Now fetch details for top papers
for pid in ids[:10]:
    detail_url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pid}&retmode=json"
    with urllib.request.urlopen(detail_url) as response:
        detail = json.loads(response.read())
    summaries = detail.get('result', {}).get(str(pid), {})
    title = summaries.get('title', 'N/A')
    auths = summaries.get('author', 'N/A')
    journal = summaries.get('fulljournalname', 'N/A')
    pubdate = summaries.get('pubdate', 'N/A')
    print(f"\n--- PMID {pid} ---")
    print(f"Title: {title}")
    print(f"Authors: {auths}")
    print(f"Journal: {journal}")
    print(f"Date: {pubdate}")
