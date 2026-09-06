const { chromium } = require('/home/josh434/.hermes/hermes-agent/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));
  page.on('console', msg => { if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text()); });
  await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.click('.sidebar-link[data-view="agents"]');
  await page.waitForTimeout(2000);
  const text = await page.evaluate(() => document.getElementById('agents-grid')?.innerText);
  console.log('AGENTS TEXT:', text?.substring(0, 200));
  await browser.close();
})();
