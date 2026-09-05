# Full-Viewport Grid Layout Pattern

The correct way to build a dashboard that fills the browser viewport with sidebar, header, and scrollable content area.

## The Grid Structure

```css
.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width, 200px) 1fr;
  grid-template-rows: var(--header-height) 1fr;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
}
```

## Grid Areas

```css
/* Sidebar: spans full height in column 1 */
.sidebar {
  grid-area: 1 / 1 / 3 / 2;
  display: flex;
  flex-direction: column;
}

/* Header: top right */
.app-header {
  grid-area: 1 / 2 / 2 / 3;
  display: flex;
  align-items: center;
}

/* View sections: bottom right, scrollable */
.view-section {
  grid-area: 2 / 2 / 3 / 3;
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
  display: none;
  flex-direction: column;
}

.view-section.active {
  display: flex;
}
```

## Why NOT position: fixed?

`position: fixed` removes elements from document flow. The grid content area doesn't account for the header's height, so it renders underneath it. Views end up at y=1000+ pixels (way below viewport), making them invisible and unclickable.

**Symptom:** `bounding_box` in Playwright shows `y: 1086` in a 900px viewport.

## Flex Child Layouts

For views that contain a sidebar + panel (like bots page with agent list + chat):

```css
.bots-view {
  display: flex;
  width: 100%;
  flex: 1;        /* fill remaining parent space */
  min-height: 0;  /* REQUIRED for flex overflow to work */
  overflow: hidden;
}

.bots-sidebar {
  width: 260px;
  min-width: 260px;
}

.bots-chat-panel {
  flex: 1;
  min-width: 0;
}
```

**Critical:** `min-height: 0` on flex children. Without it, flex items won't shrink below their content size, breaking overflow.

## Verification Checklist

After implementing grid layout:
1. `bounding_box` of `.bots-view` or `.view-section` should have `y` within viewport height
2. All interactive elements should be clickable without `force: true`
3. Console errors should be zero (check via Playwright `page.on('pageerror')`)
4. Views should switch correctly when clicking sidebar links
