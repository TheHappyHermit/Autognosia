const { chromium } = require('/home/josh434/.hermes/hermes-agent/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:8088', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Check theme
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`Theme: ${theme}`);
  
  // Check agents
  await page.click('.sidebar-link[data-view="agents"]');
  await page.waitForTimeout(1000);
  
  const agentsText = await page.evaluate(() => document.getElementById('agents-grid')?.innerText);
  console.log(`Agents text: ${agentsText?.substring(0, 100)}`);
  
  const agentsHTML = await page.evaluate(() => document.getElementById('agents-grid')?.innerHTML?.substring(0, 200));
  console.log(`Agents HTML: ${agentsHTML}`);
  
  // Toggle theme
  await page.click('#theme-toggle');
  await page.waitForTimeout(500);
  
  const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log(`After toggle: ${newTheme}`);
  
  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`Body bg: ${bodyBg}`);

  console.log(`Errors: ${errors.length}`);
  errors.forEach(e => console.log(`ERR: ${e}`));

  await page.screenshot({ path: 'final-agents.png', fullPage: false });
  await browser.close();
})();
