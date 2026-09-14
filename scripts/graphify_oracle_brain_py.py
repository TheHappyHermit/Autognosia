#!/usr/bin/env python3
"""Graphify Oracle Brain Ingestion — sets env vars and runs graphify CLI as subprocess.

Modeled after graphify_active_wiki_py.py. Processes the Oracle Brain wiki
(~/.autognosia/oracle/brain/) and appends to the existing graph.json + manifest.json.

The Oracle Brain has ~1,558 tracked files in manifest.json. This wrapper:
- Sets env vars internally (OPENAI_BASE_URL, OPENAI_API_KEY, GRAPHIFY_*)
- Runs graphify extract with --force to re-scan all files
- Writes progress to ~/.autognosia/logs/graphify-oracle-brain.log
- Expected runtime: many hours (thousands of files across ~30K nodes)

Do NOT run this concurrently with the active wiki ingestion — they both hit
the same llama.cpp server. The cron schedule is set to 4 AM (after active wiki's
3 AM run) and the job is paused until the active wiki ingestion completes.
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

ORACLE_BRAIN = Path('/home/home_user/.autognosia/oracle/brain')
LOG_DIR = Path('/home/home_user/.autognosia/logs')
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOG_FILE = LOG_DIR / 'graphify-oracle-brain.log'

print(f"[graphify-oracle-brain-py] Started at {datetime.now(timezone.utc).isoformat()}")
print(f"[graphify-oracle-brain-py] Source: {ORACLE_BRAIN}")
print(f"[graphify-oracle-brain-py] Token budget: 5000 | Concurrency: 1 | API timeout: 900s")
print(f"[graphify-oracle-brain-py] Max output tokens: 131072 | Max retries: 0")
print(f"[graphify-oracle-brain-py] Backend: openai (explicit)")
print()

# Run graphify extract as subprocess
result = subprocess.run(
    [
        'graphify', 'extract',
        '--token-budget', '5000',
        '--max-concurrency', '1',
        '--api-timeout', '900',
        '--no-cluster',
        '--no-gitignore',
        '--force',
        '--backend', 'openai',
    ],
    cwd=str(ORACLE_BRAIN),
    env=os.environ,
    capture_output=True,
    text=True,
    timeout=7200,
)

# Rotate log if too large (10 MB cap)
if LOG_FILE.exists() and LOG_FILE.stat().st_size > 10 * 1024 * 1024:
    LOG_FILE.rename(LOG_FILE.with_suffix('.log.1'))

# Append to log (not overwrite — preserve history across runs)
log_content = []
log_content.append(f"=== graphify-oracle-brain run started: {datetime.now(timezone.utc).isoformat()} ===")
log_content.append(f"Source: {ORACLE_BRAIN}")
log_content.append(f"Token budget: 5000 | Concurrency: 1 | API timeout: 900s")
log_content.append(f"Max output tokens: 131072 | Max retries: 0 | Backend: openai")
log_content.append("")
log_content.append(f"STDOUT:\n{result.stdout}")
if result.stderr:
    log_content.append(f"STDERR:\n{result.stderr}")
log_content.append(f"Return code: {result.returncode}")
log_content.append(f"=== graphify-oracle-brain run finished: {datetime.now(timezone.utc).isoformat()} ===")
log_content.append("")

with open(LOG_FILE, 'a') as f:
    f.write('\n'.join(log_content) + '\n')

# Also print to stdout
for line in log_content:
    print(line)

print(f"\n[graphify-oracle-brain-py] Finished with exit code: {result.returncode}")

# Quick stats
try:
    g = json.loads(open(ORACLE_BRAIN / 'graphify-out' / 'graph.json').read())
    m = json.loads(open(ORACLE_BRAIN / 'graphify-out' / 'manifest.json').read())
    print(f"nodes={len(g.get('nodes',[]))} edges={len(g.get('edges',[]))} hyperedges={len(g.get('hyperedges',[]))} sources={len(g.get('extracted_sources',[]))}")
    print(f"manifest entries={len(m)}")
    if 'input_tokens' in g:
        print(f"input_tokens={g['input_tokens']} output_tokens={g['output_tokens']}")
except Exception as e:
    print(f"Could not read graph stats: {e}")

sys.exit(result.returncode)
