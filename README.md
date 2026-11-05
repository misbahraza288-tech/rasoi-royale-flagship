# Rasoi Royale (Sample) — restaurant ordering app + admin panel

A fictional multi-branch Indian restaurant brand, built as a **sample** to show what a flagship ordering app can look like for a restaurant with several branches.

- **Customer app** (phone-first PWA): `./`
- **Admin panel**: `./admin/` (demo PIN is shown on its login page)
- **Docs**: [docs/KNOWLEDGE.md](docs/KNOWLEDGE.md) (what is in it, how it works) · [docs/TEMPLATE.md](docs/TEMPLATE.md) (rebrand for a new client) · [docs/BACKEND-NEXT.md](docs/BACKEND-NEXT.md) (what a real backend needs)

> **Demo mode.** No real payments, no real server. Data lives in the browser (localStorage) of the device that uses it. The brand, menu, prices, hours, offers, staff, phone numbers and photos are all sample values. Photos are AI-generated food images and are labelled as samples in the app.

## Run it locally

Any static server works (no build step):

    python3 -m http.server 8080
    # customer: http://localhost:8080/   admin: http://localhost:8080/admin/

Test (headless Chromium, Python Playwright):

    python3 tests/e2e.py http://localhost:8080/ [screenshot_dir]

## Layout

    index.html            customer app shell
    admin/index.html      admin panel shell (route /admin/)
    css/app.css           customer styles (light, no glass, line icons)
    css/admin.css         admin styles
    js/data.js            SAMPLE brand, branches, categories, items, offers, coupons, staff, roles
    js/store.js           data layer: one `db` object, localStorage adapter (see BACKEND-NEXT)
    js/app.js             customer app
    js/admin.js           admin panel
    js/ui.js              icons, money, IST time helpers, toast
    js/i18n.js            Hinglish / English labels
    vendor/qrcode.js      QR generator (qrcode-generator 1.4.4, MIT), used by the admin only
    assets/food/*.webp    sample food photos (AI-generated, labelled as samples)
    sw.js, manifest.webmanifest, icons/icon.svg   offline shell + install

## Comparison with the Kanak Cafe v3 app (honest)

Kanak Cafe v3 is a single-restaurant app with a real-looking hero, quick actions, offers, photo categories and a bottom bar, and it is the simpler and tighter product for one shop. This flagship sample goes further on structure: three branches with their own timings and open switch, a dine-in table QR flow, a live order tracker that the admin moves through statuses, coupons with a GST line, staff roles with permission toggles, branch-wise stock, reports and CSV, a bill and KOT print view, and an integrations page for WhatsApp, maps, delivery-app links and order webhooks. What it does not yet match: it has no real backend (Kanak's data is also browser-local), its photos are generated rather than the owner's, its sample menu is an estimate, and it is untested on real phones and with real staff. Those gaps are listed in docs/KNOWLEDGE.md.

## Third-party and assets

Vendored `vendor/qrcode.js` (qrcode-generator 1.4.4, MIT, see `vendor/LICENSE-qrcode-generator.txt`). Food photos are generated for this sample; replace them with the client's own before real use.
