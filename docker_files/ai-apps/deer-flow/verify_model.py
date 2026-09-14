#!/usr/bin/env python3
"""Verify DeerFlow config and test model connectivity."""
import yaml
import urllib.request
import json

config_path = '/home/josh434/docker_files/ai-apps/deer-flow/config.yaml'

# 1. Read and display config
with open(config_path) as f:
    config = yaml.safe_load(f)

print('=== Config Models ===')
for m in config['models']:
    print(f'  name={m["name"]}')
    print(f'  display_name={m["display_name"]}')
    print(f'  use={m["use"]}')
    print(f'  model={m["model"]}')
    if 'base_url' in m:
        print(f'  base_url={m["base_url"]}')
    if 'api_key' in m:
        print(f'  api_key={m["api_key"]}')
    print()

# 2. Test connectivity to the V100 model endpoint
print('=== Connectivity Test ===')
base_url = 'http://10.1.1.10:8080/v1'
try:
    r = urllib.request.urlopen(f'{base_url}/models', timeout=10)
    data = json.loads(r.read())
    models = [m['id'] for m in data.get('data', [])]
    print(f'llama.cpp models available: {models}')
except Exception as e:
    print(f'llama.cpp endpoint failed: {e}')

# 3. Test auth pattern that LangChain would use
print()
print('=== LangChain ChatOpenAI Auth Test ===')
# ChatOpenAI sends api_key in the HTTP header as Authorization: Bearer <key>
# For llama.cpp with no auth, any non-empty key should work or the server ignores it
try:
    req = urllib.request.Request(f'{base_url}/chat/completions', 
        data=json.dumps({
            'model': 'Qwen3.6-35B-A3B-Q4_K_M.gguf',
            'messages': [{'role': 'user', 'content': 'Say hello in 5 words'}],
            'max_tokens': 10
        }).encode(),
        headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer local-llm'
        })
    r = urllib.request.urlopen(req, timeout=30)
    response = json.loads(r.read())
    print(f'Chat completion response: {json.dumps(response, indent=2)[:500]}')
except Exception as e:
    print(f'Chat completion failed: {e}')

print()
print('=== Verification Complete ===')
