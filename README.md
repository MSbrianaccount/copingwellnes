# RehabApp Webapp Package

This folder contains the static web version of RehabApp (assembled from `www/`) that can be uploaded to GitHub Pages or any static web host.

## Files Included
- `index.html`
- `app.js`
- `style.css`
- `style_react.css`
- `manifest.webmanifest`
- `service-worker.js`
- `assets/`
- `src/`
- `config/theme.json`

## Deploy to GitHub Pages (quick)
1. Create a new GitHub repository (or use an existing one).
2. Push this folder content to repository root (or `gh-pages` branch).
3. In repo settings, enable GitHub Pages and choose root (or `/docs`).
4. After deployment, open the published URL (e.g. `https://<user>.github.io/<repo>`).

## Run locally for quick test
From this folder:
```bash
python -m http.server 8085
```
Open `http://localhost:8085`.

## Create a PC Shortcut to Open the Web App
1. Right click on desktop → New → Shortcut.
2. For location, enter your deployed URL (like `https://<user>.github.io/<repo>`).
3. Name it `RehabApp` and finish.

Or use `.url` file content:

```ini
[InternetShortcut]
URL=https://<user>.github.io/<repo>
```

## Notes
- Data is stored in browser `localStorage`.
- SQLite/Electron-specific persistence is optional and ignored in plain web mode.
