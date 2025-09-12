# drop - multi-page build

This folder contains a simplified multi-page build of the original single-page app. It's intended as a lightweight, easier-to-maintain structure.

Structure
- onboarding/ - onboarding flows (index, direct-control, domain-identities, growth-mode, confirmation)
- app/ - main application pages (index, gratitude, review, settings)
- css/style.css - shared styles
- js/lib - shared libraries (state, logic, config)
- js/onboarding.js - onboarding page logic
- js/app.js - main app page logic
- js/sample-data.js - helper to generate sample localStorage data

How to try locally
1. Open any `onboarding/*.html` or `app/*.html` in your browser (use the file:// protocol or a simple static server).
2. To populate sample data for testing, open the browser console on any page and run:

    generateSampleData();

3. Then open `app/index.html` to see the presence/dashboard pages (the app redirects to onboarding until onboardingComplete is set in localStorage).

Notes
- This is a lightweight scaffold. You can copy over full markup from the original `index.html` screens into each page as needed.
- The sample-data generator writes to `localStorage` using the key `dropState_v2`.
