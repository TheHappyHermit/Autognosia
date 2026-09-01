import urllib.request
import json
import urllib.parse
import time

def search_openalex(query, limit=5):
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

searches = [
    ("speculative decoding chain of thought verification", "Speculative Decoding"),
    ("LLM routing compute budget", "LLM Compute Budget"),
    ("adaptive computation language model", "Adaptive Computation LLM"),
    ("early exit language model", "Early Exit LLM"),
    ("test-time compute scaling reasoning", "Test-time Compute Scaling"),
    ("process reward model selection", "Process Reward Model Selection"),
    ("cognitive control switching task", "Cognitive Control Switching Task"),
    ("reinforcement learning metareasoning", "Reinforcement Learning Metareasoning"),
    ("Lieder rational metareasoning", "Lieder Rational Metareasoning"),
    ("cost-sensitive reasoning LLM", "Cost-Sensitive Reasoning LLM"),
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