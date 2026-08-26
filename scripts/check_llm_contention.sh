#!/usr/bin/env bash
# Report llama.cpp slot occupancy without matching this script's own args.
set -u
echo "=== graphify processes (excluding this checker) ==="
if pgrep -f 'graphifyy/bin/python' >/dev/null 2>&1; then
  pgrep -af 'graphifyy/bin/python'
else
  echo "none"
fi
echo
echo "=== llama.cpp slots ==="
curl -s --max-time 15 "${LLAMA_HOST:-http://127.0.0.1:8080}/slots" -o /tmp/slots.json 2>/dev/null
python3 - <<'PY'
import json
try:
    d = json.load(open('/tmp/slots.json'))
except Exception as exc:
    print('could not read slots:', exc)
    raise SystemExit
busy = 0
for s in d:
    p = s.get('is_processing')
    if p:
        busy += 1
    print(f"  slot {s.get('id')}: is_processing={p} "
          f"prompt_tokens={s.get('n_prompt_tokens') or s.get('tokens_evaluated')}")
print(f"  BUSY: {busy} of {len(d)}")
PY
echo
echo "=== honcho deriver queue ==="
curl -s --max-time 15 "http://127.0.0.1:8000/v3/workspaces/${HONCHO_WORKSPACE:-default}/queue/status"
echo
