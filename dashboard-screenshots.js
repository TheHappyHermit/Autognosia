const { chromium } = require('playwright');
const path = require('path');
const http = require('http');

async function main() {
  // Wait for server to be ready
  const waitReady = () => new Promise((resolve, reject) => {
    const req = http.get('http://localhost:8093/health', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', (e) => {
      setTimeout(() => http.get('http://localhost:8093/health', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject), 2000);
    });
  });

  console.log('Waiting for server...');
  await new Promise(r => setTimeout(r, 3000));

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const views = [
    { name: 'dashboard', label: 'Dashboard' },
    { name: 'bots', label: 'Bots' },
    { name: 'calendar', label: 'Calendar' },
    { name: 'tasks', label: 'Tasks' },
    { name: 'services', label: 'Services' },
    { name: 'homelab', label: 'Home Lab' }
  ];

  const screenshots = [];

  for (const view of views) {
    console.log(`\n=== Navigating to ${view.label} ===`);
    
    // Navigate to the page
    await page.goto('http://localhost:8093', { waitUntil: 'networkidle' });
    
    // Click the sidebar link for this view
    await page.click(`.sidebar-link[data-view="${view.name}"]`);
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Take screenshot
    const screenshotPath = path.join(__dirname, `screenshot-${view.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    screenshots.push({ view: view.label, path: screenshotPath });
    console.log(`  Screenshot saved: ${screenshotPath}`);
    
    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Get page stats
    const stats = await page.evaluate(() => ({
      title: document.title,
      dataView: document.documentElement.getAttribute('data-theme'),
      serverCount: document.querySelectorAll('.server-card').length,
      hasThemeToggle: !!document.getElementById('theme-toggle'),
      bodyText: document.body.innerText.substring(0, 200)
    }));
    console.log(`  Title: ${stats.title}`);
    console.log(`  Theme: ${stats.dataView}`);
    console.log(`  Body preview: ${stats.bodyText.substring(0, 100)}...`);
  }

  // Also test dark mode
  console.log('\n=== Testing dark mode ===');
  await page.goto('http://localhost:8093', { waitUntil: 'networkidle' });
  await page.click('#theme-toggle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(__dirname, 'screenshot-dark-mode.png'), fullPage: false });
  console.log('  Dark mode screenshot saved');

  await browser.close();
  
  console.log('\n=== All screenshots ===');
  screenshots.forEach(s => console.log(`  ${s.view}: ${s.path}`));
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
