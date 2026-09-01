#!/usr/bin/env bash
# Oracle Knowledge Expansion — batch 3
exec python3 "$(dirname "$0")/fill_oracle_gaps.py" --batch 3 --limit 1 "$@"
