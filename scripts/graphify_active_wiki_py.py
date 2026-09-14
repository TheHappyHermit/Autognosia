#!/usr/bin/env python3
"""Graphify Active Wiki Ingestion — sets env vars and runs graphify CLI as subprocess.

Why subprocess instead of direct import:
graphify's CLI entry point (main/dispatch_command) is tightly coupled to
argparse and sys.exit. The reliable pattern is to set os.environ then
subprocess-run the graphify CLI — this matches what refresh_graphify.py does
and what worked in the earlier successful run.
"""

import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime, timezone

# Set env vars BEFORE launching graphify
os.environ['OPENAI_BASE_URL'] = 'http://10.1.1.10:8080/v1'
os.environ['OPENAI_API_KEY'] = 'local-llm'
os.environ['OPENAI_MODEL'] = 'Qwen3.6-35B-A3B-Q4_K_M.gguf'
os.environ['GRAPHIFY_DISABLE_THINKING'] = '1'
os.environ['GRAPHIFY_MAX_OUTPUT_TOKENS'] = '131072'
os.environ['GRAPHIFY_MAX_RETRIES'] = '0'
os.environ['GRAPHIFY_API_TIMEOUT'] = '900'

ACTIVE_WIKI = Path('/home/josh434/.autognosia/active-wiki')
LOG_DIR = Path('/home/josh434/.autognosia/logs')
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / 'graphify-active-wiki.log'

print(f"[graphify-active-wiki-py] Started at {datetime.now(timezone.utc).isoformat()}")
print(f"[graphify-active-wiki-py] Source: {ACTIVE_WIKI}")
print(f"[graphify-active-wiki-py] Token budget: 5000 | Concurrency: 1 | API timeout: 900s")
print(f"[graphify-active-wiki-py] Max output tokens: 131072 | Max retries: 0")
print(f"[graphify-active-wiki-py] Backend: openai (explicit)")
print()

# Run graphify extract as subprocess
result = subprocess.run(
    [
        'graphify', 'extract', 'research',
        '--token-budget', '5000',
        '--max-concurrency', '1',
        '--api-timeout', '900',
        '--no-cluster',
        '--no-gitignore',
        '--force',
        '--backend', 'openai',
    ],
    cwd=str(ACTIVE_WIKI),
    capture_output=True,
    text=True,
    timeout=7200,
)

# Rotate log if too large (10 MB cap)
if LOG_FILE.exists() and LOG_FILE.stat().st_size > 10 * 1024 * 1024:
    LOG_FILE.rename(LOG_FILE.with_suffix('.log.1'))

# Append to log (not overwrite — preserve history across runs)
log_content = []
log_content.append(f"=== graphify-active-wiki run started: {datetime.now(timezone.utc).isoformat()} ===")
log_content.append(f"Source: {ACTIVE_WIKI}")
log_content.append(f"Token budget: 5000 | Concurrency: 1 | API timeout: 900s")
log_content.append(f"Max output tokens: 131072 | Max retries: 0 | Backend: openai")
log_content.append("")
log_content.append(f"STDOUT:\n{result.stdout}")
if result.stderr:
    log_content.append(f"STDERR:\n{result.stderr}")
log_content.append(f"Return code: {result.returncode}")
log_content.append(f"=== graphify-active-wiki run finished: {datetime.now(timezone.utc).isoformat()} ===")
log_content.append("")

with open(LOG_FILE, 'a') as f:
    f.write('\n'.join(log_content) + '\n')

# Also print to stdout
for line in log_content:
    print(line)

print(f"\n[graphify-active-wiki-py] Finished with exit code: {result.returncode}")

# Quick stats
try:
    g = json.loads(open(ACTIVE_WIKI / 'graphify-out' / 'graph.json').read())
    m = json.loads(open(ACTIVE_WIKI / 'graphify-out' / 'manifest.json').read())
    print(f"nodes={len(g.get('nodes',[]))} edges={len(g.get('edges',[]))} hyperedges={len(g.get('hyperedges',[]))} sources={len(g.get('extracted_sources',[]))}")
    print(f"manifest entries={len(m)}")
    print(f"input_tokens={g.get('input_tokens')} output_tokens={g.get('output_tokens')}")
except Exception as e:
    print(f"Could not read graph stats: {e}")

sys.exit(result.returncode)
