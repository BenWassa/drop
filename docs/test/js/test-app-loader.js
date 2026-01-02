/**
 * Test App Loader
 * Single entry point that loads all app modules for test environment
 * 
 * Wraps non-module files in the global scope and exposes testHooks
 */

// Store is a proper ES6 module
import { Store } from '../../src/store.js';

// Other files need to be loaded via fetch and evaluated in global scope
// to maintain their expected environment (they reference globals like Store, UI, etc)

async function loadTestApp() {
  try {
    // Load source files as text and evaluate them in global scope
    // This maintains the order and global scope behavior of the original app
    const files = [
      '../../src/scoring.js',
      '../../src/ui.js',
      '../../src/backup.js',
      '../../src/install.js',
      '../../src/analytics.js',
      '../../src/app.js',
    ];

    for (const file of files) {
      const response = await fetch(new URL(file, import.meta.url));
      const code = await response.text();
      // Evaluate in global scope
      eval(code);
    }

    // After app loads, ensure testHooks are set
    if (typeof window !== 'undefined' && window.DropApp) {
      // app.js should have created testHooks, but ensure they reference Store
      window.DropApp.testHooks = window.DropApp.testHooks || {
        initStore: () => Store.init(),
        clearAllData: () => Store.clearAllData(),
        getState: () => JSON.parse(JSON.stringify(Store.state)),
        getDefaults: () => Store.cloneDefaults(),
        validateImport: (payload) => Store.validateImport(payload),
        merge: (payload) => Store.merge(payload),
        update: (key, value) => Store.update(key, value),
      };
    }
  } catch (error) {
    console.error('Failed to load test app:', error);
  }
}

// Start loading
loadTestApp();
