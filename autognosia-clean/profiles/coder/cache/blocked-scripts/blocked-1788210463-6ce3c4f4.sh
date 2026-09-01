#!/bin/bash
# Auto-saved by Hermes: this command exceeded the inline command
# parser limit and was blocked from direct execution. Review it,
# then run it via: bash /home/josh434/.hermes/profiles/coder/cache/blocked-scripts/blocked-1788210463-6ce3c4f4.sh
cd /tmp/oc-dashboard-20260831T210053Z && grep -n "</main>\|</div>" index.html | sed -n 1,5p; echo "===STRUCTURE==="; awk 'NR>=79 && NR<=420' index.html | grep -n "^    <\|^      <section\|</main>\|<div class=\"app-content" | head -30; echo "===LAYOUT 285-310==="; sed -n 285,310p layout.css
