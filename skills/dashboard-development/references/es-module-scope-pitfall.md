# ES Module Scope Pitfall

## Problem
When `app-core.js` uses `export function escapeHtml()`, the function is an ES module export — NOT a global. Other modules that call `escapeHtml()` as a global throw `ReferenceError`.

## Symptom Chain
1. `ReferenceError: escapeHtml is not defined` in fetch calls
2. Errors bubble through `Promise.all()` in `refreshAllData()`
3. `await this.refreshAllData()` throws, breaking `init()`
4. `initViewRouting()` NEVER runs → no click handlers attached
5. Sidebar links don't work, views don't switch

## Fix
```javascript
// In app-core.js, after the export:
window.escapeHtml = escapeHtml;
```

## Prevention
- Always add `window.escapeHtml = escapeHtml;` when using ES module exports
- Wrap `Promise.all` fetches with `.catch()` to isolate failures
- Test sidebar click handlers after any refactor of `init()`
