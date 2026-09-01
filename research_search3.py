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

# More targeted searches for AI routing and additional cognitive models
searches = [
    ("Shenhav 2017 Nature Neuroscience", "Shenhav 2017 Nature Neuroscience exact"),
    ("Frömer 2021 expected value of control", "Frömer 2021 EVC"),
    ("Lieder 2018 cognitive effort reinforcement learning", "Lieder 2018 RL cognitive effort"),
    ("Musslick 2015 rational mechanism mental effort", "Musslick 2015"),
    ("Cognitive control cost-benefit decision", "Cognitive control cost-benefit"),
    ("AI agent model selection routing", "AI agent model selection routing"),
    ("LLM routing compute cost", "LLM routing compute cost"),
    ("mixture of experts routing", "Mixture of experts routing"),
    ("adaptive compute allocation reasoning", "Adaptive compute allocation"),
    ("cognitive effort hyperbolic discounting", "Cognitive effort hyperbolic discounting"),
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