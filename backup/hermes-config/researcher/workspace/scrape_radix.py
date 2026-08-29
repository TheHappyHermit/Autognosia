import json, urllib.request

def scrape(url):
    payload = json.dumps({"url": url, "formats": ["markdown"]}).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:3002/v1/scrape",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            if data.get("success"):
                md = data["data"]["markdown"]
                return md
            else:
                return f"[ERROR: {data.get('error', 'unknown')}]"
    except Exception as e:
        return f"[EXCEPTION: {e}]"

# Try v1 first
print("=== v1 scrape ===")
print(scrape("https://www.radix-ui.com/colors/docs/palette-composition/scales"))
