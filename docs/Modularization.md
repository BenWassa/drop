# Modularization Guide (Screens)

This guide explains the minimal steps to move a screen out of `src/ui.js` and into a dedicated file under `src/screens/`. The goal is to keep the app single-page while making UI code modular and easier to maintain.

Design principles

- Each screen file owns only the DOM and event handlers for that screen.
- Shared state (the `state` object) and configuration (`CONFIG`) remain global.
- Screen modules register a setup function with the central registry in `src/ui.js`.
- Keep setup functions idempotent and avoid heavy synchronous work.

Example file structure

```
src/
└── screens/
    ├── commitments.js
    ├── presence.js
    └── gratitude.js
```

Minimal screen template

```js
// src/screens/example.js
(function(){
  function setup() {
    // render DOM elements for this screen
  }

  // expose any functions needed by inline handlers
  window.exampleAction = function() { ... }

  // register with the ScreenRegistry
  if (window.registerScreen) window.registerScreen('example-screen', setup);

  // optional: expose the setup function for manual calls
  window.populateExampleScreen = setup;
})();
```

Steps to move an existing screen

1. Create `src/screens/<screen>.js` and paste the screen-related functions (rendering and event handlers) into an IIFE.
2. Replace any direct DOM ids or selectors if needed.
3. Register the setup function with `window.registerScreen('<screen-id>', setup);`.
4. Add a `<script src="src/screens/<screen>.js"></script>` entry to `index.html` before `src/ui.js`.
5. Remove the original functions from `src/ui.js`.
6. Test the flow in the browser.

Lifecycle hooks (optional enhancement)

- You can expand the registry to accept `setup` and `teardown` hooks for screens that need cleanup:

```js
window.registerScreen('example-screen', { setup: setupFn, teardown: teardownFn });
```

- `showScreen` would then call teardown on the previous screen (if provided) and setup on the next screen.

Future improvements

- Convert to ES modules and use dynamic `import()` for lazy-loading screens on demand.
- Add automated unit tests for screen setup functions (mock DOM) using a lightweight test runner.
- Implement a small helper to manage event listeners to make teardown reliable.

*** End of Modularization guide
