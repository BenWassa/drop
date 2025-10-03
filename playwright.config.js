import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual regression tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './docs/tests',
  testMatch: 'visual.test.js',
  
  /* Maximum time one test can run */
  timeout: 30 * 1000,
  
  /* Fail the build on CI if you accidentally left test.only */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.BASE_URL,
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 800 }
      },
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },
    
    /* Optional: Desktop testing */
    // {
    //   name: 'Desktop Chrome',
    //   use: { 
    //     ...devices['Desktop Chrome'],
    //     viewport: { width: 412, height: 915 }
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'docs/tests/test-results/',
  
  /* Snapshot path template */
  snapshotPathTemplate: '{testDir}/screenshots/{testFilePath}/{arg}{ext}',
});
