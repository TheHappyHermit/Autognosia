import requests
import json

# Try v2 API first
for version, url in [("v2", "http://127.0.0.1:3002/v2/scrape"), ("v1", "http://127.0.0.1:3002/v1/scrape")]:
    try:
        if version == "v2":
            resp = requests.post(url, json={"url": "https://opencode.ai/docs/agents/"}, timeout=30)
        else:
            resp = requests.post(url, json={"url": "https://opencode.ai/docs/agents/", "formats": ["markdown"]}, timeout=30)
        data = resp.json()
        if data.get('success') and 'data' in data:
            content = data['data'].get('markdown', '')
            print(f"=== {version} API SUCCESS - {len(content)} chars ===")
            with open('/tmp/agents_clean.txt', 'w') as f:
                f.write(content)
            break
        else:
            print(f"{version} returned: {json.dumps(data, indent=2)[:200]}")
    except Exception as e:
        print(f"{version} error: {e}")
