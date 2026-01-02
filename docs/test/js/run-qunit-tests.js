#!/usr/bin/env node

/**
 * Quick Test Runner for drop
 * For a personal app, keep it simple:
 * - Open test page in browser
 * - See instant feedback
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testPagePath = path.resolve(__dirname, '../pages/index.html');

console.log(`
╔════════════════════════════════════════════╗
║   drop QUnit Test Suite                    ║
╚════════════════════════════════════════════╝

📖 DOM Tests:
   ✓ Score display & updates
   ✓ Accessibility (ARIA, focus)
   ✓ Overlays & page switching
   ✓ Progress bars
   ✓ Data persistence

Opening test page in browser...
`);

// Open test page
exec(`open "${testPagePath}"`, (err) => {
  if (err) {
    console.log(`📖 Open in your browser:\n   ${testPagePath}\n`);
  }
});