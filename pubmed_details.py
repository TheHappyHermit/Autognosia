import urllib.request
import json
import time

# Get details for source monitoring papers
pids = [
    "42524861", "42198530", "41134641", "40942805", "40828944",
    "40707801", "40435205", "40294007", "39929061", "39619272",
    "39363118", "39315748", "39019949", "38406179", "38039688",
    "35124869", "34575237", "34063387", "32149045", "28375719"
]

for pid in pids:
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id={pid}&retmode=json"
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            data = json.loads(response.read())
            s = data.get('result', {}).get(str(pid), {})
            title = s.get('title', 'N/A')
            auths = s.get('author', 'N/A')
            journal = s.get('fulljournalname', 'N/A')
            pubdate = s.get('pubdate', 'N/A')
            elocation = s.get('elocationid', 'N/A')
            print(f"--- PMID {pid} ---")
            print(f"  Title: {title}")
            print(f"  Authors: {auths}")
            print(f"  Journal: {journal}")
            print(f"  Date: {pubdate}")
            print(f"  Epub: {elocation}")
            print()
    except Exception as e:
        print(f"PMID {pid} - Error: {e}")
        time.sleep(0.5)
    time.sleep(0.3)
