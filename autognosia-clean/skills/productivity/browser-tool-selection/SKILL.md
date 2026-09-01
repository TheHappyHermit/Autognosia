---
name: browser-tool-selection
description: Decision framework for choosing between Playwright and Browser Use for web automation tasks
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [browser, automation, playwright, browser-use, decision-framework]
    related_skills: [github-auth, google-auth]
---

# Browser Tool Selection Framework

This skill helps decide which browser automation tool to use for web tasks. This machine has SEVEN different browser access methods — knowing all of them prevents getting stuck when one fails.

## Available Browser Methods (in priority order)

### 1. Playwright (Python) — MOST RELIABLE
- **Status**: ✅ Working
- **Command**: `python3 -c "from playwright.sync_api import sync_playwright; ..."`
- **Browser**: Bundled Chromium (no system deps)
- **Best for**: Dashboards, local services, screenshots, form filling, testing
- **Docs**: `references/api.md`

### 2. Browser Use (CLI) — AI-DRIVEN
- **Status**: ✅ Working (with running Chromium)
- **Command**: `browser-use <<'PY' ... PY`
- **Best for**: Complex multi-step workflows, reasoning about pages
- **Note**: Requires Chromium running with `--remote-debugging-port` or `BU_CDP_URL` set
- **Docs**: `references/browser-use.md`

### 3. CamoFox (Docker) — ANTI-DETECTION
- **Status**: ✅ Running on `127.0.0.1:9377`
- **Container**: `autognosia-camofox`
- **Best for**: Bot detection evasion, CAPTCHAs, human-like browsing, cookie import
- **Docs**: `references/camofox.md`

### 4. Firecrawl (Docker) — SCRAPE & SEARCH
- **Status**: ✅ Running on `127.0.0.1:3002`
- **Container**: `firecrawl-stack-firecrawl-api-1`
- **Best for**: Converting pages to markdown, web search via SearXNG, crawling
- **Note**: Cannot scrape localhost URLs (blocked by design)
- **Docs**: `references/firecrawl.md`

### 5. System Chromium (snap) — DIRECT
- **Status**: ✅ Available at `/usr/bin/chromium-browser`
- **Best for**: Quick headless page loads, `chromium-browser --dump-dom`
- **Note**: AppArmor warnings are cosmetic

### 6. System Brave — DIRECT
- **Status**: ✅ Available at `/usr/bin/brave-browser`
- **Best for**: Playwright with Brave engine

### 7. Computer Use (CUA) — DESKTOP
- **Status**: ❌ No DISPLAY (headless server)
- **Note**: Only works on desktop with X11/Wayland

## Decision Matrix

Use **Playwright** when:

✅ **Task requires precise control**
- Exact element positioning needed
- Specific DOM manipulation required
- Need to intercept/modify network requests
- Taking precise screenshots or videos
- Testing specific UI states

✅ **Task is repetitive and predictable**
- Same steps repeated many times
- Known, stable website structure
- Simple form filling or navigation
- Data extraction from consistent layouts

✅ **Environment constraints**
- Offline or restricted network
- Need for maximum performance
- Limited external dependencies acceptable
- Resource-constrained environment

✅ **Technical requirements**
- Need for multiple browser contexts
- Complex iframe handling
- File upload/download with specific paths
- Custom headers or authentication flows

Use **Browser Use** when:

✅ **Task requires reasoning and adaptation**
- Complex, multi-step workflows
- Unpredictable or changing website UIs
- Need to handle unexpected pop-ups/dialogs
- Natural language task specification
- When the AI needs to figure out "how" to accomplish goal

✅ **Task involves decision making**
- Choosing between multiple options
- Interpreting page content to decide next steps
- Handling ambiguous interfaces
- Adapting to A/B test variations

✅ **Development speed priority**
- Rapid prototyping of web interactions
- Less time spent on selector maintenance
- Built-in error handling and retries
- Natural language debugging

✅ **Agent-like behavior needed**
- Task requires memory of previous steps
- Need to handle login flows automatically
- Working with CAPTCHAs or bot detection (with proxies)
- Complex navigation patterns

## Hybrid Approach Guidelines

1. **Start with Browser Use for exploration**
   - Use to understand website structure and flows
   - Identify pain points and complex interactions
   - Generate initial automation scripts

2. **Switch to Playwright for production**
   - Once workflow is understood, implement with Playwright
   - Add precise error handling and logging
   - Optimize for performance and reliability
   - Create reusable components/functions

3. **Use Browser Use for maintenance**
   - When websites change, use Browser Use to rediscover flows
   - Update Playwright selectors based on new understanding
   - Handle A/B testing variations dynamically

## Implementation Examples

### Playwright Example (Precise Control)
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto("https://example.com/login")
    
    # Precise control
    page.fill('input[name="email"]', "user@example.com")
    page.fill('input[name="password"]', "secret")
    page.click('button[type="submit"]:has-text("Log In")')
    
    # Wait for specific condition
    page.wait_for_selector('.dashboard-welcome', timeout=5000)
    
    # Extract specific data
    stats = page.query_selector_all('.stat-value')
    data = [stat.inner_text() for stat in stats]
    
    browser.close()
```

### Browser Use Example (AI-Driven)
```bash
# Using browser-use CLI
browser-use "Login to example.com, navigate to dashboard, and extract all statistics"
```

Or programmatically:
```python
from browser_use import Agent

agent = Agent(
    task="Login to example.com, navigate to dashboard, and extract all statistics",
    llm="gpt-4"  # or local model
)
result = await agent.run()
```

## Validation Steps

After choosing a tool, verify by:

1. **Playwright**: Can you achieve the task with <20 lines of clear, maintainable code?
2. **Browser Use**: Does the natural language task description adequately capture the complexity?
3. **Hybrid**: Would starting with Browser Use to explore, then switching to Playwright save time?

## Troubleshooting

| Issue | Recommended Tool | Why |
|-------|------------------|-----|
| Selectors breaking frequently | Browser Use | AI adapts to UI changes |
| Need exact pixel positioning | Playwright | Fine-grained control required |
| Complex decision trees | Browser Use | Built-in reasoning capabilities |
| High-frequency scraping | Playwright | Lower overhead, better performance |
| Working with new/unfamiliar sites | Browser Use | Faster exploration and understanding |
| Production reliability critical | Playwright | More predictable, easier to debug |
| Bot detection / CAPTCHA | CamoFox | Anti-detection stealth engine |
| Need markdown from webpage | Firecrawl | Purpose-built extraction |
| Localhost URL scraping | Playwright / CamoFox | Firecrawl blocks local URLs |
| Need to search the web | Firecrawl | Has SearXNG search integration |

## Integration with Hermes

This agent can:
1. Use `browser_*` tools for Playwright-based automation (Playwright is default)
2. Use `terminal` tool to run `browser-use` commands (needs running Chromium)
3. Use `terminal` tool to curl CamoFox API (port 9377) for anti-detection
4. Use `terminal` tool to curl Firecrawl API (port 3002) for scraping/searching
5. Combine all four in complex workflows
6. Switch between tools based on real-time feedback

**When in doubt, use Playwright** — it's the most reliable, has the best debugging, and works for localhost URLs. Use CamoFox when sites block automation. Use Firecrawl for clean markdown extraction. Use Browser Use for exploratory multi-step tasks.