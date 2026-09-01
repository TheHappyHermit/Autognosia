# Functional Completeness Checklist

When reviewing any dashboard/frontend work (by OpenCode, Coder, or manually), a feature is NOT complete until ALL layers are wired:

## The Three-Layer Rule

For any view/panel/section, verify:

1. **HTML exists** — `view-section` with correct `id` and content structure
2. **Data fetch exists** — `fetchXxx()` function that calls the API endpoint
3. **Render wired** — `showView()` calls the fetch, fetch populates the DOM

Common false-positives:
- ✗ HTML exists + API returns 200 + sidebar link works → INCOMPLETE (no data flow)
- ✗ fetch function exists + render exists → INCOMPLETE (showView doesn't call it)
- ✗ showView calls fetch → INCOMPLETE (fetch doesn't populate the DOM)
- ✅ All three linked → COMPLETE

## Verification Commands

```bash
# 1. HTML structure
grep -c 'view-section' index.html        # should match number of views
grep -c 'data-view=' index.html          # should match sidebar links

# 2. Data flow
grep 'showView' app-core.js | grep -c 'fetch'    # showView must call fetch
grep 'async fetch' app-core.js                     # fetch functions exist
grep 'render' app-core.js                          # render functions exist

# 3. Full flow test
curl http://localhost:PORT/api/xxx | python3 -m json.tool  # API works
# Then verify in browser: navigate to view, check data appears
```

## Common Missing Pieces

- `app-services.js` may have service data but no homelab data (or vice versa)
- New view sections may have static HTML but no dynamic rendering
- `showView()` may handle routing but forget to trigger data loads for new views
- `renderXxx()` may exist but target the wrong DOM element IDs
- API responses may change shape (nested objects, arrays) without updating render logic
