---
name: mistral-ai-integration
description: Integrate Mistral AI into Python backends. Covers SDK version compatibility, JSON mode, and reliable response parsing.
---

# Mistral AI Integration

## SDK Version (Critical)

**Use `mistralai>=1.0.0,<2.0.0`**. Version 2.x is a Speakeasy-generated SDK with completely different import structure — `from mistralai import Mistral` fails with ImportError.

```bash
pip install 'mistralai>=1.0.0,<2.0.0'
```

## Basic Usage

```python
from mistralai import Mistral
import os

client = Mistral(api_key=os.environ.get("MISTRAL_API_KEY", ""))

response = client.chat.complete(
    model="mistral-medium-latest",
    messages=[
        {"role": "system", "content": "You are an analyst."},
        {"role": "user", "content": "Analyze this data..."},
    ],
    temperature=0.3,
    max_tokens=4000,
)

content = response.choices[0].message.content
```

## JSON Mode (Critical for Structured Output)

**Always use `response_format={"type": "json_object"}`** when you need structured JSON. Without it, the model wraps JSON in markdown fences AND embeds `**bold**` inside JSON string values, breaking `json.loads()`.

```python
response = client.chat.complete(
    model="mistral-medium-latest",
    messages=[
        {"role": "system", "content": 'Return JSON: {"summary": "string", "items": [...]}'},
        {"role": "user", "content": "Analyze..."},
    ],
    temperature=0.3,
    max_tokens=4000,
    response_format={"type": "json_object"},  # Forces valid JSON, no markdown
)

data = json.loads(response.choices[0].message.content)
```

## Robust Parser (Fallback)

If you can't use JSON mode:

```python
import json, re

def parse_mistral_response(content: str) -> dict:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass

    # Strip markdown fences
    cleaned = content.strip()
    if cleaned.startswith("```"):
        nl = cleaned.find("\n")
        if nl > 0: cleaned = cleaned[nl + 1:]
        if cleaned.rstrip().endswith("```"): cleaned = cleaned.rstrip()[:-3].rstrip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Regex extract first JSON object
    match = re.search(r'\{[\s\S]*\}', content)
    if match:
        try: return json.loads(match.group())
        except json.JSONDecodeError: pass

    # Strip markdown bold/italic and retry
    sanitized = re.sub(r'\*\*(.+?)\*\*', r'\1', content)
    sanitized = re.sub(r'\*(.+?)\*', r'\1', sanitized)
    if sanitized.startswith("```"):
        nl = sanitized.find("\n")
        if nl > 0: sanitized = sanitized[nl + 1:]
        if sanitized.rstrip().endswith("```"): sanitized = sanitized.rstrip()[:-3].rstrip()
    try: return json.loads(sanitized)
    except json.JSONDecodeError:
        match2 = re.search(r'\{[\s\S]*\}', sanitized)
        if match2:
            try: return json.loads(match2.group())
            except json.JSONDecodeError: pass

    return {"error": "Could not parse", "raw": content[:500]}
```

## System Prompt Best Practices

```
You are a quantitative analyst.

IMPORTANT: Respond with ONLY valid JSON. Do NOT use markdown formatting 
(no **bold**, no *italic*) inside JSON string values. Use plain text only.

Format: {"summary": "plain text", "items": [{"category": "...", "message": "..."}]}
```

Even with this, **still use `response_format={"type": "json_object"}`**.

## Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| `ImportError: cannot import name 'Mistral'` | mistralai 2.x | `pip install 'mistralai>=1.0.0,<2.0.0'` |
| JSON parse errors with `**bold**` | No JSON mode | Add `response_format={"type": "json_object"}` |
| Packages lost on Docker restart | pip install only | Add to `requirements.txt` before rebuild |
| API key empty in container | .env not loaded | Set in `.env`, then `docker stop/rm && docker compose up -d` |

## Docker Deployment Notes

### Package Persistence
Packages installed via `docker exec ... pip install` are **ephemeral** — they exist only in the container's writable layer and disappear on container recreation.

**Survives `docker restart`** but NOT `docker stop + docker rm + docker compose up`.

**Fix:** Always add packages to `requirements.txt` on the host, then rebuild:
```bash
# On host
echo "scipy>=1.12.0" >> /opt/the client platform-ai/backend/requirements.txt
echo "mistralai>=1.0.0,<2.0.0" >> /opt/the client platform-ai/backend/requirements.txt

# Rebuild (not just restart)
docker stop wf-api && docker rm wf-api
cd /opt/the client platform-ai && docker compose up -d api
```

**Quick fix (survives restarts but not rebuilds):**
```bash
docker exec wf-api pip install 'mistralai>=1.0.0,<2.0.0' scipy
docker restart wf-api  # packages survive this
```

### API Key Propagation
The `MISTRAL_API_KEY` is loaded from `.env` into the container at **creation time** (via docker-compose.yml `environment:`). If you update `.env` after the container was created:
```bash
# Option 1: Recreate container
docker stop wf-api && docker rm wf-api
docker compose up -d api

# Option 2: Set it manually in the running container (temporary)
docker exec -e MISTRAL_API_KEY=your_key wf-api python3 -c "..."
```
