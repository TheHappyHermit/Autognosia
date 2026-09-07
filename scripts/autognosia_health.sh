#!/usr/bin/env bash
# Daily health check for Hermes Cortex
set -euo pipefail

echo "=== Daily Health Check ==="
echo "Time: $(date)"

# Verify stack
if bash ~/personal-agent/verify_stack.py 2>&1; then
  echo "✓ Verification passed"
else
  echo "✗ Verification failed — see output above"
  exit 1
fi

# Check GBrain
export PATH="$HOME/.bun/bin:$PATH"
if gbrain doctor 2>&1 | grep -q "Overall health"; then
  echo "✓ GBrain healthy"
else
  echo "✗ GBrain has issues"
fi

# Check Personal Ops
if python3 ~/personal-agent/personal_ops.py health 2>&1 | grep -q '"ok"'; then
  echo "✓ Personal Ops healthy"
else
  echo "✗ Personal Ops has issues"
fi

echo "=== Health check complete ==="
