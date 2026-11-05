# Knowledge: what this sample is and how it works

## Honest status (read this first)
- **Demo mode.** The app stores everything in the browser (localStorage). A second phone or laptop does not see the orders. Real multi-device ordering needs the backend in [BACKEND-NEXT.md](BACKEND-NEXT.md).
- **No real payments.** The payment line says "pay at the counter". The UPI field in Integrations is saved but no payment link is generated yet.
- **Sample everything.** Brand "Rasoi Royale (Sample)" is fictional. Branch names and areas are sample. Phone numbers are placeholders in the 9000000000 range. Menu prices are sample estimates. Hours, offers, staff and customer rows are sample.
- **No invented ratings, reviews or stats.** The dashboard numbers come from orders on this browser and are labelled SAMPLE where they are demo data.
- **Photos.** Food photos are AI-generated and labelled "Sample photos" on the customer home and in the admin. Replace them with the client's own photos before any real use.
- **Assistant.** "Sawaal puchein" is a rule-based list of fixed answers. It is not AI and says so.

## Customer app (index.html)
- **Home:** branch selector (3 sample branches), open/closed pill from the branch's own hours (IST) and its open switch, hero, quick actions (Call, Raasta, WhatsApp, Share), reorder card for the last order, offers rail with copyable sample codes, category cards, assistant entry.
- **Menu:** search, Veg / Non-veg / Favourites filter, category chips, item cards with photo, veg mark, bestseller tag, favourite heart, add or stepper. Items hidden in admin or out of stock for the chosen branch are not shown.
- **Item sheet:** size choice (price delta), add-ons, quantity; add to cart.
- **Cart:** lines with steppers; coupon (ROYAL10 = 10% up to ₹150 over ₹299; FIRST50 = ₹50 off over ₹299; FREEDEL = free delivery over ₹499); delivery / pickup / dine-in; table number for dine-in (from QR `?t=`); address for delivery; name and mobile; bill with GST line (sample rate in Settings); "Order place karein" creates an order; "WhatsApp pe order" opens wa.me with the formatted order (no order record is created for that path).
- **Tracker:** per-order ticket: code, status steps (Received, Accepted, Cooking, Ready, Out for delivery for delivery orders, Delivered), items, total, reorder, help.
- **Orders:** this browser's orders with live status.
- **More:** branch, assistant, favourites, language (Hinglish default / English), about line with the sample notice.
- **Table QR:** `?b=<branch id>&t=<table>` opens dine-in mode with the table filled in.

## Admin panel (admin/)
- **Login:** PIN. Demo PINs are shown on the login page in the demo notice only: owner 4321, manager 1111, cashier 2222, kitchen 3333. The owner PIN changes in Settings; staff PINs in Staff.
- **Dashboard:** today's orders, revenue (cancelled excluded), open orders, average, top items, status counts, branch open/closed. Sample orders can be generated and removed (tagged SAMPLE).
- **Orders board:** columns by status. New orders flash, and play a two-tone alert and vibrate (on devices that support it). Accept / Reject, Cooking, Ready, Rider / Delivered. Status changes show on the customer tracker in the same browser.
- **Kitchen:** big-font tickets for accepted and cooking orders.
- **Menu:** price, category, veg and show switches inline; branch-wise stock; add, edit (name, Hinglish name, price, category, photo asset or https photo URL, description, veg, bestseller, hidden), delete.
- **Categories, Offers & coupons:** rename, Hinglish name, cover photo; banner offer text and coupon values (percent / rupees / free delivery, cap, minimum).
- **Branches:** open/closed switch, area, phone placeholder, delivery radius, opening and closing time, map search text.
- **Staff & roles:** owner, manager, cashier, kitchen; permission matrix per role (owner always has everything).
- **Customers:** from this browser's orders; CSV download. Loyalty points are sample (1 point per ₹10).
- **Reports:** daily and weekly tables with CSV download.
- **QR & bills:** QR sheet per branch and table count (print); bill and KOT print views (thermal-style, print CSS).
- **Integrations:** WhatsApp business number, Google Maps link, UPI ID (saved, not used yet), Google Sheet / webhook URL and POS webhook URL (order JSON is POSTed, no-cors, https only), Zomato, Swiggy, Dunzo, Instagram, Facebook. The customer app uses WhatsApp, maps and the webhooks; the other links are stored for later.
- **Settings:** owner PIN, GST %, delivery fee, backup download (JSON), demo reset.

## Data model (js/data.js, js/store.js)
- `brand`, `branches[]`, `categories[]`, `items[]` (`cat`, `price`, `veg`, `img`, `sizes[]`, `addons[]`, `best`, `hidden`), `offers[]`, `coupons[]`, `staff[]`, `rolePerms`, `stock{branchId:{itemId:bool}}`, `settings`, `integrations`, `orders[]` (`status`, `history[]`, `items[]`, totals, customer), `customers{}`, `favs[]`.
- Order statuses: received → accepted → cooking → ready → out (delivery only) → delivered; cancelled from received.

## Known gaps
- Single browser only (no shared backend). Two tabs on one device do sync through the storage event.
- Item sizes and add-ons are shown from the seed data; they are not editable in the admin yet.
- Admin PINs are stored in the demo data (no hashing). Fine for a sample; a real build uses server-side auth.
- Not tested on real phones, real printers, real WhatsApp, or with real staff.
- Service worker caches the shell; bump the cache name in sw.js on each release.

## How it was tested
- `tests/e2e.py` (headless Chromium, 390x844, Playwright): first-load weight, no horizontal overflow on home, menu, cart and admin pages, veg filter, item add-on and quantity, coupon, order placed, admin sees the order, accept and cooking and out and delivered move the customer tracker, admin price edit, add and delete item, integrations save, wrong PIN refused, no console errors.
- Not covered by the test: the QR print sheet, bill print, CSV download, webhooks reaching a real endpoint, sound on a real device.
