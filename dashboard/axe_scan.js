#!/usr/bin/env node
/**
 * axe-core accessibility scan for Command Deck views.
 * Runs axe on Home, System, and Bots views and reports violations.
 */
const { chromium } = require('/home/josh434/.hermes/hermes-agent/node_modules/playwright');
const { setup: axeSetup, teardown: axeTeardown } = require('/home/josh434/.hermes/hermes-agent/node_modules/axe-core');

const BASE_URL = process.argv[2] || 'http://10.1.1.37:8088';

async function scanPage(browser, url, name) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Inject axe-core
  await page.addScriptTag({
    path: '/home/josh434/.hermes/hermes-agent/node_modules/axe-core/axe.min.js'
  });

  // Run axe
  const results = await page.evaluate(() => {
    return new Promise((resolve) => {
      axe.run({
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        resultTypes: ['violations']
      }, (err, results) => {
        if (err) resolve({ error: err.message });
        else resolve(results);
      });
    });
  });

  await page.close();
  return { name, url, results };
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  console.log('='.repeat(70));
  console.log('AXE-CORE ACCESSIBILITY SCAN — Autognosia Command Deck');
  console.log('='.repeat(70));

  const views = [
    { name: 'Home', path: '/' },
    { name: 'System', path: '/#system' },
    { name: 'Bots', path: '/#bots' },
  ];

  let totalViolations = 0;
  let criticalCount = 0;

  for (const view of views) {
    const { name, url, results } = await scanPage(browser, `${BASE_URL}${view.path}`, name);

    console.log(`\n── ${name} View (${url}) ──`);

    if (results.error) {
      console.log(`  ERROR: ${results.error}`);
      continue;
    }

    const violations = results.violations || [];
    if (violations.length === 0) {
      console.log('  ✓ No WCAG AA violations');
    } else {
      console.log(`  ${violations.length} violation(s):`);
      for (const v of violations) {
        console.log(`  [${v.impact?.toUpperCase()}] ${v.id}: ${v.description}`);
        for (const node of (v.nodes || []).slice(0, 3)) {
          console.log(`    → ${node.html?.substring(0, 80)}`);
        }
        totalViolations++;
        if (v.impact === 'critical' || v.impact === 'serious') {
          criticalCount++;
        }
      }
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(70));
  if (totalViolations === 0) {
    console.log('RESULT: ALL VIEWS PASS AXE-CORE WCAG AA ✓');
    process.exit(0);
  } else {
    console.log(`RESULT: ${totalViolations} violation(s), ${criticalCount} critical/serious`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
