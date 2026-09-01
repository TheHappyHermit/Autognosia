#!/bin/bash
curl -s "http://127.0.0.1:8080/search?q=$1&format=json" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for r in d.get('results', [])[:5]:
    print(f'  URL: {r[\"url\"]}')
    print(f'  Title: {r.get(\"title\",\"\")}')
    print(f'  Content: {r.get(\"content\",\"\")[:300]}')
    print()
"
