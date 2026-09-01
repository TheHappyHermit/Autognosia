import json

files = [
    '/home/<USER>/.hermes/cache/spillover/call_8f8a901532724ad2a23fdcdb.txt',
    '/home/<USER>/.hermes/cache/spillover/call_e1c837cdb9ae44efb6a4a8c5.txt',
    '/home/<USER>/.hermes/cache/spillover/call_6c1d75837000453580c95699.txt'
]

all_results = []
for f in files:
    with open(f) as fh:
        raw = fh.read()
    data = json.loads(raw)
    items = json.loads(data['result']) if isinstance(data['result'], str) else data['result']
    for item in items:
        all_results.append({
            'slug': item.get('slug'),
            'page_id': item.get('page_id'),
            'title': item.get('title'),
            'type': item.get('type'),
            'chunk_text': item.get('chunk_text', '')
        })

# Deduplicate by slug
seen = set()
unique = []
for r in all_results:
    if r['slug'] not in seen:
        seen.add(r['slug'])
        unique.append(r)

print(f'Total unique pages found: {len(unique)}')
print()
for r in unique:
    print(f"Slug: {r['slug']}")
    print(f"  Title: {r['title']}")
    print(f"  Type: {r['type']}")
    print(f"  Chunk length: {len(r['chunk_text'])}")
    print()