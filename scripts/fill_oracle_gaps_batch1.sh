#!/usr/bin/env bash
# Oracle Knowledge Expansion — batch 1
exec python3 "$(dirname "$0")/fill_oracle_gaps.py" --batch 1 --limit 1 "$@"
