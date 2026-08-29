# FreshRSS API Endpoints - Real World Testing Notes

Based on actual testing of FreshRSS instance at https://freshrss.wineandgecko.com/api/

## Working Endpoints (200 OK)

| Endpoint | Method | Auth Required | Notes |
|----------|--------|---------------|-------|
| `/api/greader.php` | GET | No | Main API landing page |
| `/api/greader.php/accounts/ClientLogin` | POST | No | Authentication endpoint |
| `/api/greader.php/reader/api/0/user-info` | GET | Yes | Returns user information |
| `/api/greader.php/reader/api/0/stream/contents/*` | GET | Yes | Fetch articles from streams |
| `/api/greader.php/reader/api/0/edit-tag` | GET | Yes | Mark articles as read/starred |

## Limited/Not Implemented Endpoints (501)

| Endpoint | Method | Auth Required | Notes |
|----------|--------|---------------|-------|
| `/api/greader.php/reader/api/0/subscription/list` | GET | Yes | Returns 501 Not Implemented |
| `/api/greader.php/reader/api/0/unread-count` | GET | Yes | Returns 501 Not Implemented |
| `/api/greader.php/reader/api/0/tag/list` | GET | Yes | Likely 501 Not Implemented |

## Critical Requirements

### 1. Virtual Host Header
**ALL requests MUST include**: `Host: freshrss.wineandgecko.com`

Without this header, you will get:
- 301 redirect to HTTPS version (if accessing via IP)
- 404 errors or wrong virtual host served

### 2. IP + Host Header Combination
When accessing via IP address (10.1.1.10):
```bash
curl -vk -H "Host: freshrss.wineandgecko.com" https://10.1.1.10/api/greader.php
```

### 3. SSL Verification
The instance uses a self-signed certificate (TRAEFIK DEFAULT CERT), so:
- In browsers: You'll need to proceed past the warning
- In code: Set `verify=False` or add the cert to trusted store

## Working Python Pattern

```python
import requests

FRESHRSS_IP = "10.1.1.10"
FRESHRSS_HOST = "freshrss.wineandgecko.com"
FRESHRSS_URL = f"https://{FRESHRSS_IP}/api/greader.php"
USERNAME = "josh434"
API_PASSWORD = "J1234osh$"

def get_auth_token():
    resp = requests.post(
        f"{FRESHRSS_URL}/accounts/ClientLogin",
        data={"Email": USERNAME, "Passwd": API_PASSWORD, "service": "reader"},
        headers={"Host": FRESHRSS_HOST},
        verify=False,
        timeout=30
    )
    for line in resp.text.splitlines():
        if line.startswith("Auth="):
            return line[5:]
    raise ValueError("Auth failed")

def api_get(path, params=None):
    token = get_auth_token()
    return requests.get(
        f"{FRESHRSS_URL}{path}",
        params=params,
        headers={
            "Authorization": f"GoogleLogin auth={token}",
            "Host": FRESHRSS_HOST
        },
        verify=False,
        timeout=60
    )

# Usage
token = get_auth_token()
user_info = api_get("/reader/api/0/user-info")
articles = api_get(
    "/reader/api/0/stream/contents/user/-/state/com.google/reading-list",
    params={"n": 10, "output": "json", "r": "a"}
)
```

## Stream IDs Confirmed Working
- Reading list: `user/-/state/com.google/reading-list`
- Starred items: `user/-/state/com.google/starred`
- Label/tag: `user:/label/<label-name>`

## Content Handling Note
As with all FreshRSS instances, content fields are frequently truncated. Always:
1. Check `item.get("content", {}).get("content")` first
2. Fall back to `item.get("summary", {}).get("content")`
3. If both are short (< 100 chars), fetch the original URL for full content
