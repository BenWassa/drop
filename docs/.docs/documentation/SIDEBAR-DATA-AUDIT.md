# Sidebar Data UI Audit (Legacy Data Approaches)

## Scope
Assess the settings sidebar ("Settings" side menu) data-management UI and related JS/CSS/modules that appear to reflect older data workflows (manual backup/import/clear).

## Findings (UI + Logic)
- Settings menu data-management section in HTML.
  - UI elements: `#auto-backup-toggle`, `#auto-backup-status`, `#settings-backup-restore-btn`, `#settings-backup-download-btn`, `#settings-import-btn`, `#settings-clear-btn`, `#settings-import-input`.
  - Location: `docs/index.html`.
- Settings menu bindings in UI layer.
  - Reads/writes auto-backup toggle, handles backup download/restore, import, clear.
  - Location: `docs/ui.js` (`UI.elements.settingsMenu` + `UI.bindSettingsMenu`).
- Auto-backup module inclusion and initialization.
  - Script tag: `docs/index.html` (`auto-backup.js`).
  - Init: `docs/app.js` (`AutoBackup.init()`), hooks: `docs/store.js` (`AutoBackup.handleStoreSave()`).
- Legacy backup module (File System Access API) present but not wired in.
  - `docs/backup.js` is not referenced in `docs/index.html` (currently dormant).
- Dead export/import controls (no HTML present).
  - `UI.elements.dataControls` in `docs/ui.js`, bound in `docs/app.js` (`export-data-btn`, `import-data-btn`).
  - No corresponding DOM elements found in `docs/index.html`.

## CSS Footprint
- `docs/styles.css` defines settings-only styles tied to auto-backup UI and database icons:
  - `.settings-field`, `.settings-label`, `.settings-helper-text` (only used by auto-backup toggle section).
  - `.icon-database-export`, `.icon-database-import`, `.icon-database-delete` (used by data-management buttons).

## Removal Candidates (If Retiring Legacy Data UI)
1) Remove the Settings "Data Management" section from `docs/index.html`.
2) Remove related settings-menu bindings and element references in `docs/ui.js`.
3) Remove unused `dataControls` wiring in `docs/ui.js` and `docs/app.js`.
4) Remove `auto-backup.js` script include and optional init/hook if AutoBackup is being retired.
5) Prune CSS tied solely to removed elements (settings field/helper text + database icon classes).
6) Keep `docs/backup.js` only if it is intentionally retained as dormant/legacy; otherwise it can be removed later.

## Notes
- The data import/export/clear flows are still supported in `docs/store.js`, but the UI layer is the only current entry point.
- If these UI flows are removed, consider adjusting any user-facing messages in `docs/store.js` that reference export/clear.

## Status (Cleanup Applied)
- Settings Data Management section removed from `docs/index.html`.
- Settings data-management bindings and `dataControls` wiring removed from `docs/ui.js` and `docs/app.js`.
- Auto-backup init hook removed from `docs/app.js` and save hook removed from `docs/store.js`.
- Auto-backup script tag removed from `docs/index.html`.
- Auto-backup module removed: `docs/auto-backup.js`.
- Settings data-management CSS and database icon classes removed from `docs/styles.css`.
