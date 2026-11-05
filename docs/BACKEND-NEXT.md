# Backend next: what replaces the demo data layer

The app talks to one object, `db` (js/store.js). Every screen calls `db.state()`, `db.createOrder()`, `db.setStatus()`, `db.saveItem()` and so on, and listens with `db.subscribe()`. Today `db` is backed by `localAdapter` (localStorage). To go live, write a second adapter with the same methods and swap it in `makeDb(...)`.

## What a real build needs
1. **Backend.** Supabase (Postgres + Realtime) fits this shape: tables for `branches`, `categories`, `items`, `item_stock` (branch x item), `offers`, `coupons`, `staff`, `orders` (+ `order_items`, `order_status_events`), `customers`, `integrations`, `settings`. Realtime subscriptions replace the storage-event listener.
2. **Auth.** Admin logins with Supabase Auth (email or phone OTP), roles from a `staff` table, row-level security so a kitchen login cannot read customer phone numbers. Drop the PIN.
3. **Orders.** Create the order server-side (price recomputed from the menu, coupon checked on the server, GST and delivery fee computed on the server). Never trust the client's totals.
4. **Payments.** UPI deep link or a payment gateway (Razorpay or Cashfree). Mark the order paid from the gateway webhook, not from the browser. Until then keep "pay at counter" and say so.
5. **Notifications.** WhatsApp Business API templates for "order received" and "out for delivery" (Meta approval needed). Telegram or push for the admin alert.
6. **Webhooks.** The Integrations page already holds the Google Sheet / POS URLs. Move the POST from the browser to a server function so the URL is not exposed to customers and retries are possible.
7. **Hosting.** Static front end (GitHub Pages or any CDN) + the backend. Keep the same paths: `/` for the customer app and `/admin/` for the panel.

## Adapter contract (what each method must do)
| method | returns | notes |
|---|---|---|
| `state()` | the whole snapshot | for the demo only; a real build loads per screen |
| `createOrder(payload)` | the order with `code`, `status: 'received'` | server computes totals |
| `setStatus(id, status)` | the order | status must follow the order flow |
| `saveItem / deleteItem / saveBranch / saveCategory / saveOffer / saveCoupon / deleteCoupon / saveStaff / deleteStaff` | promise | role-checked |
| `updateSettings / updateIntegrations` | promise | owner only |
| `toggleFav(id)` | favourites | per customer, keyed by phone or a login |
| `subscribe(fn)` | unsubscribe fn | fires on any change; realtime in the real build |

## Data that must not live in the repo
Real phone numbers, UPI IDs, Google Sheet or POS URLs, customer records, PINs, API keys. Keep them in the backend or in GitHub Secrets for any build step.

## Order of work (suggested)
1. Supabase project + schema + RLS. 2. Adapter with the same contract. 3. Admin login. 4. Server-side order creation and totals. 5. Payment link. 6. WhatsApp templates. 7. Load and offline tests on a real phone.
