---
name: playwright
description: Use when OpenCode needs to verify GUI/web interface rendering, test browser interactions, validate forms/buttons/layouts, run visual regression tests, or ensure a web app works correctly before delivery. Browser automation via Playwright for verification and testing.
metadata:
  hermes:
    tags: [browser, testing, verification, gui, web, automation, visual-regression, e2e]
---

# Playwright — GUI Verification & Testing

## What is Playwright

Playwright is a Node.js library for browser automation. It can launch Chromium, Firefox, or WebKit, navigate pages, interact with elements, take screenshots, and verify behavior. For the coder agent, it's the **primary tool for verifying that GUI work is production-ready** before handing it back to OpenCode or the main agent.

## When to Use Playwright

Use Playwright when:
- **Any web UI work is completed** — verify it renders correctly in a real browser
- **Forms or interactive elements** — test that buttons, inputs, and clicks work
- **Layout verification** — confirm responsive design at different viewports
- **Data rendering** — verify live data loads and displays correctly
- **Error checking** — confirm no console errors, missing images, or broken layouts
- **Visual regression** — compare screenshots before/after changes
- **Multi-step flows** — test complete user journeys (login → dashboard → action)

## Critical: Playwright is MANDATORY for GUI Work

**Whenever OpenCode completes work that has ANY graphical user interface (web pages, dashboards, admin panels, etc.), the coder agent MUST use Playwright to verify the interface before declaring the task complete.**

This is NOT optional. Syntax checks are insufficient. A page can have perfect syntax but broken rendering.

## Workflow

### Step 1: Start the server (if needed)
```bash
cd <project> && npm start &
# or
cd <project> && python3 -m http.server 8080 &
```

### Step 2: Create a Playwright verification script
```javascript
// verify-ui.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test at multiple viewports
  const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' }
  ];
  
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: `screenshot-${vp.name}.png`, fullPage: true });
    
    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Verify key elements exist
    const header = await page.locator('header, nav, h1').count();
    const mainContent = await page.locator('main, .main, #app').count();
    
    console.log(`${vp.name}: header=${header}, main=${mainContent}, errors=${errors.length}`);
  }
  
  await browser.close();
})();
```

### Step 3: Run and analyze
```bash
node verify-ui.js
```

### Step 4: Verify results
- Screenshots saved → view them with vision_analyze
- No console errors
- All expected elements present
- Live data is rendering (not placeholder text)
- Responsive layout works

## Playwright Quick Reference

### Installation
```bash
npm install playwright
npx playwright install chromium  # one-time browser install
```

### Common patterns

**Navigate and wait:**
```javascript
await page.goto('http://localhost:8080');
await page.waitForLoadState('networkidle');  // wait for all requests
await page.waitForSelector('#app');          // wait for specific element
```

**Click and interact:**
```javascript
await page.click('button[type="submit"]');
await page.fill('input[name="email"]', 'test@example.com');
await page.selectOption('select#country', 'US');
```

**Verify elements:**
```javascript
await page.locator('h1').waitFor();
const text = await page.locator('.title').textContent();
const count = await page.locator('.card').count();
const visible = await page.locator('.modal').isVisible();
```

**Take screenshots:**
```javascript
await page.screenshot({ path: 'full.png', fullPage: true });
await page.locator('.dashboard').screenshot({ path: 'dashboard.png' });
```

**Check for errors:**
```javascript
const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
```

**Evaluate JavaScript in page:**
```javascript
const data = await page.evaluate(() => {
  return document.querySelectorAll('.card').length;
});
```

## Integration with OpenCode Workflow

When OpenCode completes a GUI task:
1. OpenCode writes the code to the scratch workspace
2. Coder agent reads the files, runs syntax checks
3. **Coder agent uses Playwright to verify the GUI renders correctly**
4. Coder agent takes screenshots and verifies:
   - Page loads without errors
   - All expected elements are visible
   - Live data is rendering (not mock data)
   - Forms and buttons are functional
   - Responsive design works
5. Only after Playwright verification passes → deliver to main agent

## Dashboard-Specific Verification

For the Command Deck dashboard (10.1.1.37:8088), verify:
- All sections render (hero stats, service grid, agent panels, etc.)
- Live data is loading from API endpoints
- WebSocket indicator appears
- Collapsible panels work
- Search functionality works
- No console errors
- Responsive at mobile/tablet/desktop

## Troubleshooting

- **Page won't load**: Check if server is running, verify URL
- **Element not found**: Check if JS is rendering content (may need `waitForSelector`)
- **Console errors**: Could be CORS, missing files, or JS errors
- **Blank page**: Usually means JS error or missing root element
- **Timeout**: Increase timeout or check if API is responding
