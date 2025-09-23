# Drop Webapp Tests

This directory contains automated tests for the Drop webapp.

## Running Tests

1. Start a local HTTP server:
   ```bash
   python -m http.server 8000
   ```

2. Open `http://localhost:8000/tests/tests.html` in your browser

## Test Types

- **Smoke Tests**: Verify app loads and basic elements exist
- **Unit Tests**: Test individual functions (getClientId, saveReflection, exportToCSV)
- **Integration Tests**: Test UI interactions (navigation, button clicks, form submissions)

## Test Framework

Uses [QUnit](https://qunitjs.com/) - a lightweight JavaScript testing framework that runs in the browser, requiring no build tools or Node.js.

## Adding New Tests

Edit `tests.html` to add new test cases. The file includes:
- Mock setup for IndexedDB, localStorage, and DOM elements
- Test fixtures for common UI elements
- Helper functions for testing app functionality