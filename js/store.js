// =====================================================================
//  Data layer. The app talks ONLY to `db` (async methods below).
//  Today: localStorage adapter ("demo mode", one browser only).
//  Later: a Supabase (or any server) adapter with the same methods. See docs/BACKEND-NEXT.md.
// =====================================================================
import { SEED, STATUSES } from './data.js';

const KEY = 'rr_flagship_demo_v1';
const listeners = new Set();
let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...SEED(), ...JSON.parse(raw) } : SEED();
  } catch { cache = SEED(); }
  return cache;
}
function persist(state) {
  cache = state;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked: keep in memory */ }
  listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } });
}
// another tab changed the demo data → refresh cache and tell listeners
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { cache = null; const s = load(); listeners.forEach((fn) => fn(s)); }
  });
}

const clone = (x) => JSON.parse(JSON.stringify(x));
const now = () => new Date().toISOString();

export const localAdapter = {
  name: 'local-demo',
  async getState() { return clone(load()); },
  async mutate(fn) { const s = clone(load()); const out = await fn(s); persist(s); return out; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  async reset() { persist(SEED()); },
};

// ---------- the one surface the app uses ----------
export function makeDb(adapter = localAdapter) {
  const db = {
    adapter: adapter.name,
    async state() { return adapter.getState(); },
    subscribe(fn) { return adapter.subscribe(fn); },

    async updateSettings(patch) { return adapter.mutate((s) => { s.settings = { ...s.settings, ...patch }; return s.settings; }); },
    async updateIntegrations(patch) { return adapter.mutate((s) => { s.integrations = { ...s.integrations, ...patch }; return s.integrations; }); },
    async saveItem(item) {
      return adapter.mutate((s) => {
        const i = s.items.findIndex((x) => x.id === item.id);
        if (i >= 0) s.items[i] = { ...s.items[i], ...item }; else s.items.push({ id: item.id || 'i-' + Date.now().toString(36), ...item });
        return item.id;
      });
    },
    async deleteItem(id) { return adapter.mutate((s) => { s.items = s.items.filter((x) => x.id !== id); }); },
    async saveBranch(b) { return adapter.mutate((s) => { const i = s.branches.findIndex((x) => x.id === b.id); if (i >= 0) s.branches[i] = { ...s.branches[i], ...b }; else s.branches.push(b); }); },
    async saveCategory(c) { return adapter.mutate((s) => { const i = s.categories.findIndex((x) => x.id === c.id); if (i >= 0) s.categories[i] = { ...s.categories[i], ...c }; else s.categories.push(c); }); },
    async saveOffer(o) { return adapter.mutate((s) => { const i = s.offers.findIndex((x) => x.id === o.id); if (i >= 0) s.offers[i] = { ...s.offers[i], ...o }; else s.offers.push(o); }); },
    async saveCoupon(c) { return adapter.mutate((s) => { const i = s.coupons.findIndex((x) => x.code === c.code); if (i >= 0) s.coupons[i] = { ...s.coupons[i], ...c }; else s.coupons.push(c); }); },
    async deleteCoupon(code) { return adapter.mutate((s) => { s.coupons = s.coupons.filter((x) => x.code !== code); }); },
    async saveStaff(p) { return adapter.mutate((s) => { const i = s.staff.findIndex((x) => x.id === p.id); if (i >= 0) s.staff[i] = { ...s.staff[i], ...p }; else s.staff.push({ id: 'st-' + Date.now().toString(36), ...p }); }); },
    async deleteStaff(id) { return adapter.mutate((s) => { s.staff = s.staff.filter((x) => x.id !== id); }); },
    async toggleFav(id) { return adapter.mutate((s) => { s.favs = s.favs.includes(id) ? s.favs.filter((x) => x !== id) : [...s.favs, id]; return s.favs; }); },

    // place an order from the customer app; returns the order
    async createOrder(payload) {
      return adapter.mutate((s) => {
        s.settings.orderCounter = (s.settings.orderCounter || 1000) + 1;
        const no = s.settings.orderCounter;
        const order = {
          id: 'o-' + no, number: no, code: 'RR' + no, createdAt: now(), updatedAt: now(),
          status: 'received', history: [{ s: 'received', at: now() }],
          ...payload,
        };
        s.orders.unshift(order);
        s.lastOrder = { code: order.code, id: order.id, items: order.items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, size: i.size, addons: i.addons })), mode: order.mode, branchId: order.branchId };
        // loyalty (sample): points on subtotal after discount
        const c = s.customers?.[order.customer.phone] || {};
        s.customers = s.customers || {};
        s.customers[order.customer.phone] = { name: order.customer.name, phone: order.customer.phone, points: (c.points || 0) + Math.floor(order.total / 10), orders: (c.orders || 0) + 1, spent: (c.spent || 0) + order.total, lastAt: now() };
        return order;
      });
    },
    async setStatus(id, status) {
      if (!STATUSES.includes(status)) throw new Error('bad status');
      return adapter.mutate((s) => {
        const o = s.orders.find((x) => x.id === id);
        if (!o) return null;
        o.status = status; o.updatedAt = now(); o.history = [...(o.history || []), { s: status, at: now() }];
        return o;
      });
    },
    // generic write for admin screens (same adapter, same listeners)
    async mutate(fn) { return adapter.mutate(fn); },
    async listOrders() { const s = await adapter.getState(); return s.orders; },
    async getOrder(id) { const s = await adapter.getState(); return s.orders.find((x) => x.id === id) || null; },
  };
  return db;
}

export const db = makeDb(localAdapter);
export const DEFAULT_ORDER_STATUS_STEPS = ['received', 'accepted', 'cooking', 'ready', 'out', 'delivered'];
