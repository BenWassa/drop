/**
 * Test App Loader
 * Single entry point that loads all app modules for test environment
 * 
 * Store is an ES6 module, other files use global scope
 */

// Import Store as ES6 module and expose it globally
import { Store } from '../../src/store.js';

// Expose Store globally so other modules can access it
window.Store = Store;

// Immediately expose testHooks using Store
if (typeof window !== 'undefined') {
  window.DropApp = window.DropApp || {};
  
  window.DropApp.testHooks = {
    initStore: () => Store.init(),
    clearAllData: () => Store.clearAllData(),
    getState: () => JSON.parse(JSON.stringify(Store.state)),
    getDefaults: () => Store.cloneDefaults(),
    validateImport: (payload) => Store.validateImport(payload),
    merge: (payload) => Store.merge(payload),
    update: (key, value) => Store.update(key, value),
  };
}

// Load other source files as text and evaluate in global scope
async function loadTestApp() {
  try {
    const files = [
      '../../src/scoring.js',
      '../../src/ui.js',
      '../../src/backup.js',
      '../../src/install.js',
      '../../src/analytics.js',
    ];

    for (const file of files) {
      const response = await fetch(new URL(file, import.meta.url));
      const code = await response.text();
      // Evaluate in global scope using indirect eval
      (0, eval)(code);
    }

    // Load app.js specially - replace its import statement with global reference
    const appResponse = await fetch(new URL('../../src/app.js', import.meta.url));
    let appCode = await appResponse.text();
    
    // Replace the ES6 import with a reference to the global Store
    appCode = appCode.replace(
      /import\s*{\s*Store\s*}\s*from\s*['"]\.\/store\.js['"];?/,
      '// Store is already available globally'
    );
    
    // Evaluate the modified app.js
    (0, eval)(appCode);
    
  } catch (error) {
    console.error('Failed to load test app:', error);
  }
}

// Start loading
loadTestApp();
