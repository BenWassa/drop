/**
 * Visual Regression Test Harness using Playwright
 * 
 * Usage:
 *   1. Install Playwright: npm install -D @playwright/test
 *   2. Run tests: npm run test:visual
 *   3. Update baselines: npm run test:visual -- --update-snapshots
 * 
 * This script captures screenshots and compares against baseline images.
 * Run manually when making intentional UI changes.
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

// Configuration
const BASE_URL = process.env.BASE_URL || `file://${path.resolve(__dirname, '../index.html')}`;
const VIEWPORT_WIDTH = 360;
const VIEWPORT_HEIGHT = 800;

test.describe('Visual Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
    
    // Navigate to app
    await page.goto(BASE_URL);
    
    // Wait for loading overlay to disappear (if present)
    const loadingOverlay = page.locator('#loading-overlay');
    if (await loadingOverlay.isVisible()) {
      await loadingOverlay.waitFor({ state: 'hidden', timeout: 10000 });
    }
    
    // Wait for fonts to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500); // Additional buffer for animations
  });

  test('Home page - header and score grid', async ({ page }) => {
    // Ensure we're on the home page
    const homePage = page.locator('[data-page="home"].active');
    await expect(homePage).toBeVisible();
    
    // Capture screenshot of header + main grid
    const header = page.locator('.app-header');
    const mainGrid = page.locator('.main-grid');
    
    await expect(header).toBeVisible();
    await expect(mainGrid).toBeVisible();
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'home-page.png'),
      fullPage: false
    });
    
    // Compare against baseline
    await expect(page).toHaveScreenshot('home-page-baseline.png', {
      maxDiffPixels: 100
    });
  });

  test('Vision page layout', async ({ page }) => {
    // Navigate to vision page
    const visionBtn = page.locator('[data-page="vision"]');
    await visionBtn.click();
    
    // Wait for page transition
    await page.waitForTimeout(300);
    
    const visionPage = page.locator('[data-page="vision"].active');
    await expect(visionPage).toBeVisible();
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'vision-page.png'),
      fullPage: true
    });
    
    await expect(page).toHaveScreenshot('vision-page-baseline.png', {
      maxDiffPixels: 100
    });
  });

  test('Gratitude page layout', async ({ page }) => {
    // Navigate to gratitude page
    const gratitudeBtn = page.locator('[data-page="gratitude"]');
    await gratitudeBtn.click();
    
    // Wait for page transition
    await page.waitForTimeout(300);
    
    const gratitudePage = page.locator('[data-page="gratitude"].active');
    await expect(gratitudePage).toBeVisible();
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'gratitude-page.png'),
      fullPage: true
    });
    
    await expect(page).toHaveScreenshot('gratitude-page-baseline.png', {
      maxDiffPixels: 100
    });
  });

  test('Sleep overlay appearance', async ({ page }) => {
    // Click sleep card to open overlay
    const sleepCard = page.locator('[data-domain="sleep"].card');
    await sleepCard.click();
    
    // Wait for overlay animation
    await page.waitForTimeout(400);
    
    const sleepOverlay = page.locator('#sleep-overlay.active');
    await expect(sleepOverlay).toBeVisible();
    
    // Take screenshot
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'sleep-overlay.png'),
      fullPage: false
    });
    
    await expect(page).toHaveScreenshot('sleep-overlay-baseline.png', {
      maxDiffPixels: 100
    });
  });

  test('Fitness overlay appearance', async ({ page }) => {
    // Click fitness card to open overlay
    const fitnessCard = page.locator('[data-domain="fitness"].card');
    await fitnessCard.click();
    
    // Wait for overlay animation
    await page.waitForTimeout(400);
    
    const fitnessOverlay = page.locator('#fitness-overlay.active');
    await expect(fitnessOverlay).toBeVisible();
    
    await expect(page).toHaveScreenshot('fitness-overlay-baseline.png', {
      maxDiffPixels: 100
    });
  });

  test('Score circles with different values', async ({ page }) => {
    // This test verifies visual consistency of score rendering
    const scoresGrid = page.locator('.scores-grid');
    await expect(scoresGrid).toBeVisible();
    
    // Check all score circles are rendered
    const scoreCircles = page.locator('.score-circle');
    await expect(scoreCircles).toHaveCount(4);
    
    // Take focused screenshot of scores
    await scoresGrid.screenshot({
      path: path.join(__dirname, 'screenshots', 'score-circles.png')
    });
  });

  test('Navigation bar focus states', async ({ page }) => {
    // Focus on home button
    const homeBtn = page.locator('[data-page="home"]');
    await homeBtn.focus();
    
    // Wait for focus styles
    await page.waitForTimeout(100);
    
    // Capture footer with focused element
    const footer = page.locator('.app-footer');
    await footer.screenshot({
      path: path.join(__dirname, 'screenshots', 'nav-focus.png')
    });
  });

  test('Progress bars on gratitude page', async ({ page }) => {
    // Navigate to gratitude page
    const gratitudeBtn = page.locator('[data-page="gratitude"]');
    await gratitudeBtn.click();
    await page.waitForTimeout(300);
    
    // Find progress bars
    const progressBars = page.locator('.progress-row');
    await expect(progressBars.first()).toBeVisible();
    
    // Screenshot the scoreboard card
    const scoreboard = page.locator('.insight-card--scoreboard');
    if (await scoreboard.isVisible()) {
      await scoreboard.screenshot({
        path: path.join(__dirname, 'screenshots', 'progress-bars.png')
      });
    }
  });
});

test.describe('Accessibility Visual Tests', () => {
  
  test('High contrast mode compatibility', async ({ page, browserName }) => {
    // Skip on webkit (Safari doesn't support forced-colors)
    test.skip(browserName === 'webkit', 'High contrast not supported on WebKit');
    
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
    await page.goto(BASE_URL);
    
    // Wait for loading
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('high-contrast-mode.png', {
      maxDiffPixels: 200
    });
  });

  test('Focus indicators are visible', async ({ page }) => {
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
    await page.goto(BASE_URL);
    
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // First focusable element
    await page.waitForTimeout(100);
    
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'focus-first-element.png')
    });
    
    await page.keyboard.press('Tab'); // Second element
    await page.waitForTimeout(100);
    
    await page.screenshot({
      path: path.join(__dirname, 'screenshots', 'focus-second-element.png')
    });
  });
});

// Helper to create screenshots directory if it doesn't exist
const fs = require('fs');
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}
