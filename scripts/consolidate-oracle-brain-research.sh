#!/usr/bin/env bash
set -euo pipefail

export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

SRC="$HOME/.autognosia/oracle/brain/research"
DST="$HOME/.autognosia/active-wiki/research"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
fi

shopt -s nullglob

# --- Validation ---
if [ ! -d "$SRC" ]; then
    echo "ERROR: Source directory does not exist: $SRC" >&2
    exit 1
fi

if [ "$DRY_RUN" = false ]; then
    mkdir -p "$DST" || {
        echo "ERROR: Cannot create destination directory: $DST" >&2
        exit 1
    }
fi

# --- Counters ---
moved=0
skipped=0
errors=0

echo "Consolidating oracle-brain/research/ → active-wiki/research/"
if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] No files will be moved."
fi
echo "Source:      $SRC"
echo "Destination: $DST"
echo ""

# --- Process files ---
for src_file in "$SRC"/*; do
    # Skip non-regular files (directories, etc.)
    if [ ! -f "$src_file" ]; then
        continue
    fi

    base=$(basename "$src_file")

    # Skip hidden files
    if [[ "$base" == .* ]]; then
        echo "SKIPPED (hidden): $base"
        skipped=$((skipped + 1))
        continue
    fi

    dst_file="$DST/$base"

    # Skip if destination already has anything at that path (file, dir, or symlink)
    if [ -e "$dst_file" ] || [ -L "$dst_file" ]; then
        echo "SKIPPED (already exists): $base"
        skipped=$((skipped + 1))
        continue
    fi

    # Move or report
    if [ "$DRY_RUN" = true ]; then
        echo "WOULD MOVE: $base"
        moved=$((moved + 1))
    else
        if mv "$src_file" "$dst_file"; then
            echo "MOVED: $base"
            moved=$((moved + 1))
        else
            echo "ERROR: Failed to move $base" >&2
            errors=$((errors + 1))
        fi
    fi
done

# --- Report ---
echo ""
echo "=== Consolidation Report ==="
echo "Source:      $SRC"
echo "Destination: $DST"
echo ""
echo "Files moved:   $moved"
echo "Files skipped: $skipped"
echo "Errors:        $errors"
echo ""

# Final state
if [ "$DRY_RUN" = false ]; then
    src_remaining=$(find "$SRC" -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
    dst_total=$(find "$DST" -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "Remaining in source: $src_remaining files"
    echo "Total in destination: $dst_total files"
fi

if [ "$errors" -gt 0 ]; then
    echo ""
    echo "WARNING: $errors file(s) failed to move." >&2
    exit 1
fi

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "Dry run complete. Run without --dry-run to move files."
else
    echo "Consolidation complete."
fi
exit 0
