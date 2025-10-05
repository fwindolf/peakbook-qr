import { chromium } from '@playwright/test';

const pages = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/peaks', name: 'Peaks' },
  { path: '/peaks/new', name: 'New Peak' },
  { path: '/translations', name: 'Translations' },
  { path: '/translations/config', name: 'Translation Config' },
  { path: '/qr-codes', name: 'QR Codes' },
  { path: '/moderation', name: 'Moderation' },
  { path: '/analytics', name: 'Analytics' },
];

async function checkPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n🔍 Checking all admin pages...\n');

  const results = [];

  for (const route of pages) {
    try {
      const response = await page.goto(`http://localhost:3002${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 10000,
      });

      const status = response?.status() || 0;
      const success = status >= 200 && status < 400;

      // Check for common error indicators
      const hasError = await page.locator('text=/error|Error|404|500/i').count() > 0;

      results.push({
        name: route.name,
        path: route.path,
        status,
        success: success && !hasError,
        error: hasError ? 'Error message found on page' : null,
      });

      console.log(
        `${success && !hasError ? '✅' : '❌'} ${route.name.padEnd(20)} (${route.path}) - Status: ${status}`
      );
    } catch (error) {
      results.push({
        name: route.name,
        path: route.path,
        status: 0,
        success: false,
        error: error.message,
      });

      console.log(`❌ ${route.name.padEnd(20)} (${route.path}) - Error: ${error.message}`);
    }
  }

  await browser.close();

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary: ${successful}/${pages.length} pages working`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');

  if (failed > 0) {
    console.log('Failed pages:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.name} (${r.path}): ${r.error || `Status ${r.status}`}`);
      });
    console.log('');
  }

  process.exit(failed > 0 ? 1 : 0);
}

checkPages().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
