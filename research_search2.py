import urllib.request
import json
import urllib.parse
import time

def search_openalex(query, limit=5):
    """Search OpenAlex API (no key required)"""
    encoded_query = urllib.parse.quote(query)
    url = f"https://api.openalex.org/works?search={encoded_query}&per-page={limit}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode())
            return data.get('results', [])
    except Exception as e:
        return f"Error: {e}"

def format_result(r):
    title = r.get('title', 'N/A')
    authors = [a.get('author', {}).get('display_name', '') for a in r.get('authorships', [])[:3]]
    year = r.get('publication_year', 'N/A')
    cited_by = r.get('cited_by_count', 'N/A')
    abstract_inv = r.get('abstract_inverted_index', {})
    if abstract_inv:
        words = []
        for word, positions in abstract_inv.items():
            for pos in positions:
                while len(words) <= pos:
                    words.append('')
                words[pos] = word
        abstract = ' '.join(words[:300])
    else:
        abstract = 'N/A'
    return f"Title: {title}\nAuthors: {authors}\nYear: {year}, Citations: {cited_by}\nAbstract: {abstract}..."

# More targeted searches
searches = [
    ("Shenhav 2017 expected value of control", "Shenhav 2017 EVC - exact"),
    ("Kool Shenhav Botvinick 2017 cognitive control cost-benefit", "Kool Shenhav Botvinick 2017"),
    ("Westbrook 2013 cognitive effort discounting ACC", "Westbrook 2013 cognitive effort"),
    ("Botvinick 2012 control costs", "Botvinick 2012 control costs"),
    ("economic discounting cognitive effort", "Economic discounting of effort"),
    ("AI model routing compute cost", "AI model routing compute cost"),
    ("speculative decoding reasoning cost", "Speculative decoding"),
    ("cognitive effort drift diffusion model", "Cognitive effort DDM"),
    ("neural efficiency cognitive effort", "Neural efficiency cognitive effort"),
    ("task demand control allocation", "Task demand control allocation"),
]

for query, label in searches:
    print(f"\n{'='*80}")
    print(f"SEARCH: {label}")
    print(f"{'='*80}")
    results = search_openalex(query, limit=5)
    if isinstance(results, list):
        for r in results[:3]:
            print(f"\n{format_result(r)}")
    else:
        print(results)
    time.sleep(3)