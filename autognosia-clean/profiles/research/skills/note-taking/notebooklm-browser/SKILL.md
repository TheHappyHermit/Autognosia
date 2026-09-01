---
name: notebooklm-browser
description: Zero-dependency NotebookLM automation via browser tool and curl — no external pip packages. Uses Google's internal RPC endpoints with session cookies extracted from the browser.
---

# NotebookLM — Browser + Curl Skill

> **Zero-dependency approach** — uses only Hermes built-in tools (browser + curl). No third-party pip packages. No Playwright. No Chromium install.

## ⚠️ PREFERRED METHOD: Use `nlm-skill` instead
The `nlm-skill` skill (CLI/MCP approach via `notebooklm-mcp-cli`) is the **preferred modern method**. It provides:
- Built-in authentication management (`nlm login`)
- 43+ tools via MCP integration
- Content generation (audio, video, slides, quizzes, etc.)
- Research pipelines
- Cross-notebook queries

Use this browser-based skill only when `notebooklm-mcp-cli` is not installed or unavailable.

## What is NotebookLM?

Google NotebookLM (notebooklm.google.com) is an AI research tool. Upload sources (PDFs, URLs, YouTube, text, Google Docs) and get grounded, citation-backed answers from Gemini. Can also generate audio overviews (podcasts), quizzes, video explainers, slide decks, and more.

**No official public API exists.** All programmatic access requires reverse-engineering internal RPC endpoints.

## Why this approach?

| Approach | External Deps | Security | Reliability |
|----------|--------------|----------|-------------|
| notebooklm-py | pip package + Playwright + Chromium (~170MB) | Medium — third-party code | Medium — API may break |
| MCP servers | npm/Python packages | Medium — third-party code | Medium — API may break |
| **Browser + curl (this)** | **None** | **High — no external code** | **Medium — API may break** |

This skill is the safest option because:
- Zero external dependencies (no pip install, no npm install)
- No third-party code execution
- Fully transparent — every curl command is visible and auditable
- Uses only Hermes' built-in browser tool and curl

## Authentication

### Step 1: Log in to NotebookLM

```bash
browser_navigate(url="https://notebooklm.google.com")
browser_snapshot()
```

Verify you see your notebooks or a "Create new notebook" button. If you see a Google sign-in page, complete the login in the browser, then verify with another snapshot.

### Step 2: Extract session cookies

```python
# Get cookies from the browser session
cookies = browser_console(expression='document.cookie')
```

Save cookies to a file:
```bash
echo "$cookies" > /tmp/notebooklm_cookies.txt
```

### Step 3: Get CSRF token

```bash
CSRF=$(curl -s 'https://notebooklm.googleapis.com/_/NotebookUi/bootstrap' | grep -oP '"csrf_token":"[^"]+' | cut -d'"' -f4)
```

## API Endpoint

All requests go to:
```
https://notebooklm.googleapis.com/_/NotebookUi/batchexecute
```

### Required headers
- `Cookie`: Your NotebookLM session cookies
- `X-Goog-AuthUser`: Usually `0`
- `Content-Type`: `application/x-www-form-urlencoded`

### CSRF token
Pass as URL parameter: `at=<csrf_token>`

## Operations

### List Notebooks

```bash
CSRF=$(curl -s 'https://notebooklm.googleapis.com/_/NotebookUi/bootstrap' | grep -oP '"csrf_token":"[^"]+' | cut -d'"' -f4)
COOKIE=$(cat /tmp/notebooklm_cookies.txt)

curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=ListNotebooks&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"ListNotebooks": "[]"}' | python3 -m json.tool
```

### Create Notebook

```bash
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=CreateNotebook&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"CreateNotebook": "[\"My Notebook Title\"]"}'
```

### Add Source by URL

```bash
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=AddSource&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"AddSource": "[\"NOTEBOOK_ID\",\"URL\",\"https://example.com\"]"}'
```

### Add Source by File (PDF, TXT, etc.)

```bash
# First upload the file to get a source ID, then add it:
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=AddSource&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"AddSource": "[\"NOTEBOOK_ID\",\"FILE\",\"file.pdf\"]"}'
```

### Query Notebook

```bash
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=QueryNotebook&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"QueryNotebook": "[\"NOTEBOOK_ID\",\"Your question here\"]"}'
```

### Generate Audio Overview

```bash
# Starts async generation (returns immediately, 10-20 min to complete)
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=GenerateAudioOverview&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"GenerateAudioOverview": "[\"NOTEBOOK_ID\",\"\",false]"}'
```

### Check Audio Generation Status

```bash
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=GetAudioStatus&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"GetAudioStatus": "[\"NOTEBOOK_ID\"]"}'
```

### List Notebook Sources

```bash
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=GetNotebookContent&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"GetNotebookContent": "[\"NOTEBOOK_ID\"]"}' | python3 -m json.tool
```

### Remove Source from Notebook

```bash
curl -s "https://notebooklm.googleapis.com/_/NotebookUi/batchexecute?rpcids=RemoveSource&source=alloy-uptitle&sid=0&at=$CSRF" \
  -H "Cookie: $COOKIE" \
  -H "X-Goog-AuthUser: 0" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'FwK1wE={"RemoveSource": "[\"NOTEBOOK_ID\",\"SOURCE_ID\"]"}'
```

## Response Parsing

NotebookLM responses are wrapped in a JSON array. The actual data is in the first element, double-encoded as JSON string:

```python
import json

# Parse the response
raw = curl_output.strip()
# The response is wrapped: ['wr[123,{"result":"..."}]']
wrapper = json.loads(raw)
data_str = wrapper[0][1]['result'] if 'result' in wrapper[0][1] else wrapper[0][1]
result = json.loads(data_str)
print(json.dumps(result, indent=2))
```

## Session Management

### Cookie expiry
Google OAuth sessions typically last ~2 weeks. When calls fail with 401/403:
1. Navigate to notebooklm.google.com in the browser
2. Verify you're still logged in
3. If not, log in again
4. Re-extract cookies via `browser_console(expression='document.cookie')`

### CSRF token refresh
CSRF tokens expire with the session. Always fetch fresh:
```bash
CSRF=$(curl -s 'https://notebooklm.googleapis.com/_/NotebookUi/bootstrap' | grep -oP '"csrf_token":"[^"]+' | cut -d'"' -f4)
```

## Security Considerations

### Cookies = full Google account access
- Store cookies in a secure location (not committed to git)
- Never share or log cookie contents
- Rotate cookies when you suspect compromise

### No data stored locally
- All queries go to NotebookLM's servers
- No caching of sensitive data
- No local copies of your documents

### API stability
- Internal RPC endpoints may change without notice
- RPC IDs may be renamed or removed
- Always verify against browser DevTools Network tab when features break
- Google may add authentication requirements at any time

### Rate limiting
- Google may rate-limit rapid API calls
- Add delays between rapid operations (1-2 seconds)
- Heavy usage may trigger CAPTCHA or account restrictions

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401/403 errors | Session expired — re-login in browser, extract fresh cookies |
| Empty responses | CSRF token expired — re-fetch from bootstrap endpoint |
| RPC errors | RPC ID may have changed — check browser DevTools Network tab |
| SSL errors | Update curl CA certificates |
| JSON parse errors | Response may be wrapped — use the parsing pattern above |
| Source not appearing | Wait 5-10 seconds after AddSource, then verify with GetNotebookContent |

## Workflow Pattern

1. **Navigate to NotebookLM** → verify login with `browser_snapshot()`
2. **Extract cookies** → `browser_console(expression='document.cookie')`
3. **Get CSRF token** → curl bootstrap endpoint
4. **Execute RPC** → curl with cookies + CSRF + proper Content-Type
5. **Parse JSON** → unwrap the response wrapper, then parse inner JSON
6. **Handle async** → poll status for audio/video generation

## Dependencies

- **None** — uses only Hermes built-in tools
- **Browser tool** — for authentication and cookie extraction
- **curl** — for HTTP requests
- **python3** — for JSON parsing
- **Google account** — must be logged into notebooklm.google
