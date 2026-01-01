#!/usr/bin/env node

/**
 * QUnit Test Runner
 * Runs QUnit tests programmatically using Playwright
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runQUnitTests() {
  console.log('🚀 Starting QUnit tests...');

  let browser;
  let passed = 0;
  let failed = 0;
  let total = 0;

  try {
    // Launch browser
    browser = await chromium.launch({ headless: true });

    const page = await browser.newPage();

    // Listen for console messages to capture test results
    page.on('console', msg => {
      const text = msg.text();
      console.log(text);

      // Parse QUnit output
      if (text.includes('Tests completed')) {
        const match = text.match(/(\d+) passed, (\d+) failed/);
        if (match) {
          passed = parseInt(match[1]);
          failed = parseInt(match[2]);
          total = passed + failed;
        }
      }
    });

    // Navigate to test page
    const port = process.env.PORT || '59759'; // Use the port from dev server
    const testPageUrl = `http://localhost:${port}/testing/pages/index.html`;

    console.log(`📄 Loading test page: ${testPageUrl}`);
    await page.goto(testPageUrl, { waitUntil: 'networkidle' });

    // Wait for tests to complete
    await page.waitForFunction(
      () => window.QUnit && window.QUnit.done,
      { timeout: 30000 }
    );

    // Get final results
    const results = await page.evaluate(() => {
      return {
        passed: window.QUnit?.passed || 0,
        failed: window.QUnit?.failed || 0,
        total: (window.QUnit?.passed || 0) + (window.QUnit?.failed || 0)
      };
    });

    passed = results.passed;
    failed = results.failed;
    total = results.total;

    console.log(`\n📊 Test Results:`);
    console.log(`   Total: ${total}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ Tests failed!');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
    }

  } catch (error) {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runQUnitTests().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});