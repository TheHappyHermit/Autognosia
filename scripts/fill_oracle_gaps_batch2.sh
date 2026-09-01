#!/usr/bin/env bash
# Oracle Knowledge Expansion — batch 2
exec python3 "$(dirname "$0")/fill_oracle_gaps.py" --batch 2 --limit 1 "$@"
