const { test, expect } = require('@playwright/test');

test.describe('Onboarding smoke flows', () => {
  test('Direct Control path flows to confirmation and starts journey', async ({ page }) => {
    await page.goto('http://localhost:8000');
    // Click Direct Control
    await page.click('button:has-text("Direct Control")');
    // Wait for direct control screen
    await expect(page.locator('text=Direct Control — Configure Aspects')).toBeVisible();
    // Set fitness tiers
    await page.selectOption('#direct-fitness-cardio', 'high');
    await page.selectOption('#direct-fitness-strength', 'medium');
    await page.selectOption('#direct-fitness-skills', 'low');
    // Continue
    await page.click('#direct-continue');
    // Should be at confirmation
    await expect(page.locator('text=Your Quarter')).toBeVisible();
    // Begin journey
    await page.click('text=Begin Journey');
    // Presence screen should be visible
    await expect(page.locator('#presence-screen')).toBeVisible();
  });

  test('Identities path shows summary and continues', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('button:has-text("Domain Identities")');
    await expect(page.locator('text=Domain Identities — Review & Tweak')).toBeVisible();
    // Confirm and continue
    await page.click('#identities-continue');
    await expect(page.locator('text=Your Quarter')).toBeVisible();
  });

  test('Growth path flows to growth setup and continues', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.click('button:has-text("Growth Mode")');
    await expect(page.locator('text=Growth Mode — Tell us your current levels')).toBeVisible();
    // Fill some values
    await page.fill('#growth-cardio', '3');
    await page.fill('#growth-strength', '2');
    await page.fill('#growth-skills', '1');
    await page.click('#growth-continue');
    await expect(page.locator('text=Your Quarter')).toBeVisible();
  });
});
