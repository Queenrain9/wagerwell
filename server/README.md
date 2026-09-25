# WAGERWELL Provider Server

This folder is the server-side bridge between the static WAGERWELL portal and contracted game providers.

## Current state

- The browser-side provider bridge is implemented.
- An Evolution adapter exists behind `POST /api/game/launch`.
- The adapter is intentionally **disabled until operator credentials and the current OSS launch schema are supplied**.
- No Evolution secret is stored in GitHub Pages.
- The built-in WAGERWELL games remain the fallback provider.

## Run locally

```bash
cd server
npm install
cp .env.example .env
npm start
```

Then set `window.WAGERWELL_PROVIDER.backendBase` to the deployed HTTPS origin and switch `mode` to `"evolution"`.

## Production integration step

Evolution's current One Stop Shop launch and wallet/callback contracts are customer documentation. When those documents are available, edit only `providers/evolution.js` to map WAGERWELL's normalized launch request to the exact contracted schema. Do not expose API keys or wallet secrets to the browser.
