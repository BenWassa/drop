/**
 * Test App Loader
 * Single entry point that loads all app modules in the correct order for tests
 */

import { Store } from '../../src/store.js';
import '../../src/scoring.js';
import '../../src/ui.js';
import '../../src/backup.js';
import '../../src/install.js';
import '../../src/analytics.js';
import '../../src/app.js';

// Ensure testHooks are available
if (typeof window !== 'undefined') {
  window.DropApp = window.DropApp || {};
  
  // Expose test hooks if app.js hasn't already
  if (!window.DropApp.testHooks) {
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
}
