# Masjid Salaah Times Widget

Custom salaah times display for **Masjid ur Rahmah, Greenside, Johannesburg**.

Fetches live jamaat times from MasjidBoard Live API and renders a clean, responsive widget that can be embedded on any website.

## Live

- **Widget**: https://yusuf.kaka.co.za/masjid-salaah/
- **API Proxy**: https://masjid-salaah-api.yusufk.workers.dev/?id=greenside-rahmah

## Embed in WordPress

Paste into a **Custom HTML** widget or block:

```html
<iframe src="https://yusuf.kaka.co.za/masjid-salaah/" width="100%" height="380" style="border:none;border-radius:8px;max-width:420px;"></iframe>
```

Or use the inline version (no iframe) — copy the `<style>`, `<div>` and `<script>` from `index.html`.

## Architecture

```
index.html          → Static widget (GitHub Pages)
worker/index.js     → Cloudflare Worker CORS proxy
```

The CORS proxy is needed because masjidboardlive.com doesn't set `Access-Control-Allow-Origin` headers. The proxy caches responses for 5 minutes.

## Data Source

```
https://masjidboardlive.com/boards/api/board.php?greenside-rahmah
```

Returns JSON with adhaan/jamaat times, maintained by the masjid committee via the MasjidBoard Live app.

## Deploy

```bash
# Deploy CORS proxy worker
npx wrangler deploy

# Frontend deploys automatically via GitHub Pages on push to main
```
