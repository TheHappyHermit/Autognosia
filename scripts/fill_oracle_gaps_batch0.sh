#!/usr/bin/env bash
# Oracle Knowledge Expansion — batch 0
exec python3 "$(dirname "$0")/fill_oracle_gaps.py" --batch 0 --limit 1 "$@"
