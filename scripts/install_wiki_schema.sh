#!/usr/bin/env bash
# Install the canonical wiki schema into both wikis.
# Run this after cloning the autognosia repo (or any time you want to sync).
# This is idempotent — only overwrites if the wiki exists.
#
# Usage: bash scripts/install_wiki_schema.sh [AUTOGNOSIA_ROOT]
#
# If no argument is given, it guesses common locations:
#   ~/.autognosia/active-wiki/
#   ~/.autognosia/oracle/brain/

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SCHEMA_FILE="$REPO_DIR/docs/schemas/SCHEMA.md"

if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "ERROR: $SCHEMA_FILE not found. Are you running from the autognosia checkout?" >&2
  exit 1
fi

# Resolve wiki root (accept argument or guess)
WIKI_ROOT="${1:-}"
if [[ -z "$WIKI_ROOT" ]]; then
  # Try common locations
  if [[ -d "$HOME/.autognosia/active-wiki" ]]; then
    WIKI_ROOT="$HOME/.autognosia"
  else
    echo "NOTE: No wiki found. Specify path manually: $0 /path/to/autognosia"
    echo "       Will not write anything."
    exit 0
  fi
fi

ACTIVE_WIKI="$WIKI_ROOT/active-wiki/SCHEMA.md"
ORACLE_BRAIN="$WIKI_ROOT/oracle/brain/SCHEMA.md"

echo "Installing $SCHEMA_FILE → Active Wiki: $ACTIVE_WIKI"
mkdir -p "$(dirname "$ACTIVE_WIKI")"
cp "$SCHEMA_FILE" "$ACTIVE_WIKI"
echo "  ✓ Active Wiki updated (or created)"

echo "Installing $SCHEMA_FILE → Oracle Brain: $ORACLE_BRAIN"
mkdir -p "$(dirname "$ORACLE_BRAIN")"
cp "$SCHEMA_FILE" "$ORACLE_BRAIN"
echo "  ✓ Oracle Brain updated (or created)"

# Also update the root index.md files to declare okf_version
for idx in "$WIKI_ROOT/active-wiki/index.md" "$WIKI_ROOT/oracle/brain/index.md"; do
  if [[ -f "$idx" ]]; then
    if ! grep -q 'okf_version' "$idx"; then
      # Insert okf_version line after the opening ---
      sed -i 's/^---$/---\nokf_version: "0.2"/' "$idx" 2>/dev/null || \
        sed -i '1s/^---$/---\nokf_version: "0.2"/' "$idx"
      echo "  ✓ $idx — okf_version declared"
    else
      echo "  ℹ $idx — okf_version already present"
    fi
  fi
done

echo ""
echo "Done. Both wikis now use the canonical OKF v0.2 schema."
echo "To update later: run this script again after editing schemas/wiki-schema.md in the repo."
