# Simple GSheets Offline App

This small static app lets you create simple "goals" entries offline and sync them to a Google Sheet via a Google Apps Script web endpoint.

Files:
- `index.html` — UI
- `main.js` — offline queue and sync logic
- `config.js` — set `GSA_ENDPOINT` after deploying the Apps Script
- `sw.js` — service worker to cache app assets
- `apps-script.gs` — Apps Script to deploy as web app
- `manifest.json` — PWA manifest

Quick setup:

1. Create a Google Sheet and add a sheet named `goals` with headers in row 1: `title`, `note`, `ts`.
2. Open the script editor (Extensions → Apps Script), paste the contents of `apps-script.gs` and save.
3. Deploy → New deployment → Select "Web app". Set "Execute as" to "Me" and "Who has access" to "Anyone" (or as you prefer). Copy the Web App URL.
4. Edit `config.js` and set `APP_CONFIG.GSA_ENDPOINT` to the Web App URL.
5. Host the static folder `simple/gsheets-offline/` on Vercel/GitHub Pages or open `index.html` locally (CORS will block sync if the endpoint requires cross-origin unless Apps Script is deployed to allow it).

Notes on offline behavior:
- New items are stored in `localStorage` until synced.
- When the browser regains network connectivity the app will attempt to sync automatically.
- The service worker caches app files for offline loading.

Note: this folder now contains the fuller "drop-lite" scaffold (IndexedDB outbox, Background Sync, richer Apps Script `Code.gs`).
Quick mapping of filenames:
- `main.js` — IndexedDB-based client with `entries` + `outbox` stores and batch sync logic.
- `sw.js` — service worker with cache and `sync-outbox` background sync handler.
- `apps-script.gs` — full `Code.gs` (replace `SPREADSHEET_ID` and `API_KEY` before deploying).

Update `config.js`:

 - Set `APP_CONFIG.SCRIPT_URL` to your Apps Script Web App URL.
 - Set `APP_CONFIG.API_KEY` to match `API_KEY` in `apps-script.gs`.


Security & permissions:
- Apps Script deployments with "Anyone" allow unauthenticated POSTs. If your sheet is sensitive, consider adding an API key check or restricting access.

Next steps:
- Add pull/fetch logic to display remote rows.
- Add simple conflict resolution and sync status UI.
- Add export/import functionality for backups.

Publishing to GitHub Pages
-------------------------

There are two easy ways to publish this static folder with GitHub Pages.

1) Publish from the `docs/` folder on the `main` branch
	- Copy the contents of `simple/gsheets-offline/` into a top-level `docs/` folder.
	- Commit and push to `main`.
	- In your repository Settings → Pages, set the source to `main` branch and `/docs` folder.
	- The site will be available at `https://<your-user>.github.io/<repo>/`.

	Example commands (run from repository root):

	```bash
	rm -rf docs
	mkdir -p docs
	cp -R simple/gsheets-offline/* docs/
	git add docs
	git commit -m "chore: publish simple/gsheets-offline to docs for GitHub Pages" || true
	git push
	```

2) Publish with `gh-pages` npm package (branch-based)
	- Useful if you want the published site on a separate `gh-pages` branch.
	- Install and run from project root:

	```bash
	npm install --no-save gh-pages
	npx gh-pages -d simple/gsheets-offline -b gh-pages
	```

Local testing and CORS notes
---------------------------
- To test locally, use a static server rather than opening the file directly. Example:

  ```bash
  # Python 3
  cd simple/gsheets-offline
  python3 -m http.server 8000
  # or with node
  npx http-server -c-1
  ```

- Apps Script CORS: when you deploy the Apps Script web app, it will allow cross-origin requests from pages served by GitHub Pages. If you encounter CORS errors for POSTs, double-check your Apps Script deployment settings and that you're using the Web App URL in `config.js`.

- If you want me to publish the folder to `docs/` and push a commit for you, say "Please publish to GitHub Pages" and I'll create the `docs/` copy and commit it.

