# Template: rebrand this for a new restaurant in minutes

Goal: a new client's sample (or real first version) from this repo in about 20–30 minutes, without touching the logic.

## 1. Copy and name
1. Copy the repo, rename it (e.g. `client-name-app`).
2. Search for `Rasoi Royale` and `Sample`. Replace in: `js/data.js` (BRAND, sampleName), `js/i18n.js` (sampleTag, aboutText), `index.html` (title, description), `manifest.webmanifest` (name, short_name), `README.md`.
3. Logo: `icons/icon.svg` (one letter now) and `BRAND.logoLetter` in `js/data.js`.
4. Colours: `--accent` and `--accent-2` in `css/app.css` and `css/admin.css` (one maroon today).

## 2. Branches
Edit `BRANCHES` in `js/data.js`: `id` (keep lowercase, no spaces), `name`, `area`, `phone`, `open`, `close` (IST, 24-hour), `radiusKm`, `mapQuery` (text used for the Raasta button when no maps link is set). Remove or add entries; keep at least one.

## 3. Menu
1. Edit `CATEGORIES` (id, name, hi, img = one of the food asset names).
2. Edit `ITEMS`: `cat`, `name`, `hi`, `desc`, `veg`, `price`, `img` (asset name), `best`, optional `sizes: [{label, add}]`, optional `addons: [{name, price}]`.
3. Photos: put the client's photos in `assets/food/` as `.webp`, ~600x600 for items and 1200x675 for heroes (under 90 KB each). Use the same file names or change `img`. Keep the "Sample photos" line until the photos are the client's.
4. Or do it in the admin: Menu manager, Categories, Offers. The admin writes to the browser's demo data, so for the client's real menu put it in `ITEMS` before you hand the link over.

## 4. Offers and coupons
`OFFERS` (home banner) and `COUPONS` (`code`, `type` pct|flat|delivery, `value`, `cap`, `min`) in `js/data.js`.

## 5. Staff and PINs
`STAFF` and `ROLE_PERMS` in `js/data.js`. Owner PIN default is `settings.adminPin` in `SEED()`. Change it before sharing the admin link.

## 6. Integrations
Fill in Integrations in the admin (WhatsApp number as digits with country code, maps link, webhook URL). For a default that every copy starts with, set `DEFAULT_INTEGRATIONS` in `js/data.js`.

## 7. Sample rules that must stay
- Keep the demo notice and the footer line (demo mode, no real payments).
- Do not put a real client's phone, UPI or email in the repo: use the Integrations page on their own device.
- Do not add ratings, reviews or stats that are not theirs.

## 8. Check, then publish
    python3 -m http.server 8080
    python3 tests/e2e.py http://localhost:8080/ shots/
Check the screenshots at 390x844. Then publish (GitHub Pages: Settings > Pages > main / root) and send the link.

## 9. When the client wants it live
Read [BACKEND-NEXT.md](BACKEND-NEXT.md): the data layer is one file (`js/store.js`), so a real backend replaces that file, not the screens.
