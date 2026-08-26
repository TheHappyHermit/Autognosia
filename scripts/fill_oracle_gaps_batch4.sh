#!/usr/bin/env bash
# Oracle Knowledge Expansion — batch 4
exec python3 "$(dirname "$0")/fill_oracle_gaps.py" --batch 4 --limit 1 "$@"
