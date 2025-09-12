// Playwright config for local smoke tests
const { devices } = require('@playwright/test');

module.exports = {
  timeout: 60000,
  use: {
    headless: true,
    viewport: { width: 375, height: 812 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  webServer: {
    command: 'python -m http.server 8000',
    port: 8000,
    timeout: 120000,
    reuseExistingServer: false,
  },
};
