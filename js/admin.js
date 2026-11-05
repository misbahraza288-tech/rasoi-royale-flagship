// =====================================================================
//  Rasoi Royale (Sample) — admin panel. Route: /admin/ . Demo mode (this browser only).
// =====================================================================
import { BRAND, ROLE_PERMS, STATUSES, STATUS_LABEL, DEFAULT_INTEGRATIONS } from './data.js';
import { db } from './store.js';
import { icon, esc, rs, branchOpen, istDay, fmtTime, fmtDate, minutesAgo, toast, vegMark } from './ui.js';

const SESS = 'rr_admin_session_v1';
const ROLE_PIN_DEFAULT = { manager: '1111', cashier: '2222', kitchen: '3333' };
const SECTIONS = [
  ['dashboard', 'Dashboard', 'chart'], ['orders', 'Orders', 'board'], ['kitchen', 'Kitchen', 'kitchen'], ['menu', 'Menu', 'menu'],
  ['categories', 'Categories', 'tag'], ['offers', 'Offers & coupons', 'receipt'], ['branches', 'Branches', 'store'], ['staff', 'Staff', 'key'],
  ['customers', 'Customers', 'users'], ['reports', 'Reports', 'download'], ['qr', 'QR & bills', 'qr'], ['integrations', 'Integrations', 'link'], ['settings', 'Settings', 'settings'],
];
const SECTION_LABEL = Object.fromEntries(SECTIONS.map(([k, l]) => [k, l]));
const $ = (s, r = document) => r.querySelector(s);
const root = document.getElementById('admin');

let S = null;
let session = (() => { try { return JSON.parse(sessionStorage.getItem(SESS)); } catch { return null; } })();
let view = 'dashboard';
let soundOn = true;
let audioCtx = null;
let seenOrderIds = null;
let drawer = null;   // {type:'item'|'confirm', data}
const UI = { menuQ: '', rep: 'daily', qrb: null, qrn: 6 };

const perms = (role) => role === 'owner' ? SECTIONS.map((s) => s[0]) : (S?.rolePerms?.[role] || ROLE_PERMS[role] || []);
const can = (sec) => session && perms(session.role).includes(sec);
const pinFor = (role) => role === 'owner' ? S.settings.adminPin : (S.staff.find((x) => x.role === role && x.pin)?.pin || ROLE_PIN_DEFAULT[role]);
const branchName = (id) => S.branches.find((b) => b.id === id)?.name || id;
const todayKey = () => istDay(new Date().toISOString());

function note(msg) { toast(msg, 2600); }

// ---------- login ----------
function loginView() {
  return `
  <div class="login">
    <div class="brandrow" style="justify-content:center;margin-bottom:14px"><i style="width:36px;height:36px;border-radius:10px;background:var(--acc);color:#fff;display:grid;place-items:center;font-style:normal;font-weight:700">R</i> <b style="margin-left:8px;font-size:18px">${esc(BRAND.name)} · Admin</b></div>
    <div class="card">
      <div class="demo"><b>Demo notice.</b> Ye sample admin hai. Koi real server nahi, koi real payment nahi. Data isi browser mein rehta hai.<br>
        Demo PIN — owner: <b>${esc(S.settings.adminPin)}</b> · manager: <b>1111</b> · cashier: <b>2222</b> · kitchen: <b>3333</b>. Owner PIN Settings mein badal sakte hain.</div>
      <form id="loginform">
        <label class="f">PIN<input id="pin" class="pin" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="····" required></label>
        <button class="btn pri" style="width:100%;margin-top:12px;min-height:46px">Login</button>
      </form>
    </div>
    <p class="foot"><a href="../" style="color:var(--m)">← Customer app</a></p>
  </div>`;
}

// ---------- shell ----------
function shell(body) {
  const nav = SECTIONS.filter(([k]) => can(k)).map(([k, l, ic]) => `<button class="${view === k ? 'on' : ''}" data-nav="${k}" aria-current="${view === k}">${icon(ic)}<span>${esc(l)}</span></button>`).join('');
  return `
  <aside class="side" aria-label="Admin sections">
    <div class="brandrow"><i>R</i><span>Admin <small class="muted">sample</small></span></div>
    ${nav}
    <div class="spacer"></div>
    <button data-act="logout">${icon('logout')}<span>Logout (${esc(session.role)})</span></button>
  </aside>
  <main class="main" id="main">${body}
    <p class="foot">Demo mode · sample menu, prices, orders and photos · no real payments, no live server until a backend is connected (see docs/BACKEND-NEXT.md).</p>
  </main>
  ${drawer ? drawerView() : ''}`;
}

function render() {
  if (!S) return;
  if (!session) { root.innerHTML = loginView(); return; }
  if (!can(view)) view = perms(session.role)[0] || 'orders';
  const body = { dashboard, orders, kitchen, menu, categories, offers, branches, staff, customers, reports, qr, integrations, settings }[view]();
  root.innerHTML = shell(body);
  // keep scroll-stable on mobile
  afterRender();
}

// ---------- DASHBOARD ----------
function dashboard() {
  const today = S.orders.filter((o) => istDay(o.createdAt) === todayKey());
  const live = today.filter((o) => o.status !== 'cancelled');
  const rev = live.reduce((n, o) => n + o.total, 0);
  const open = S.orders.filter((o) => ['received', 'accepted', 'cooking', 'ready', 'out'].includes(o.status)).length;
  const top = topItems(today.length ? today : S.orders);
  const byStatus = STATUSES.map((s) => [s, S.orders.filter((o) => o.status === s).length]);
  return `
  <h1>Dashboard <span class="sample">SAMPLE NUMBERS</span></h1>
  <div class="kpis">
    <div class="kpi"><small>Aaj ke orders</small><b>${today.length}</b></div>
    <div class="kpi"><small>Aaj ka revenue (cancel chhod ke)</small><b>${rs(rev)}</b></div>
    <div class="kpi"><small>Abhi open orders</small><b>${open}</b></div>
    <div class="kpi"><small>Average order</small><b>${live.length ? rs(rev / live.length) : '—'}</b></div>
  </div>
  <div class="grid2">
    <div class="card"><h2>Top items ${today.length ? '(aaj)' : '(sample / sab)'}</h2>
      ${top.length ? `<table><tbody>${top.map(([n, q, amt]) => `<tr><td>${esc(n)}</td><td class="muted">${q} pcs</td><td style="text-align:right">${rs(amt)}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">Abhi koi order nahi. Neeche se sample orders bana sakte hain.</p>'}
    </div>
    <div class="card"><h2>Status</h2>
      <table><tbody>${byStatus.map(([s, n]) => `<tr><td><span class="pillst ${s}">${esc(STATUS_LABEL[s])}</span></td><td style="text-align:right">${n}</td></tr>`).join('')}</tbody></table>
      <div class="row" style="margin-top:12px">
        <button class="btn" data-act="seedsamples">Sample orders banayein (demo)</button>
        <button class="btn bad" data-act="clearsamples">Sample orders hatayein</button>
      </div>
      <p class="muted">Sample orders sirf is browser mein, 'SAMPLE' tag ke saath bante hain.</p>
    </div>
  </div>
  <div class="card"><h2>Branches abhi</h2>
    <table><thead><tr><th>Branch</th><th>Timing</th><th>Status</th></tr></thead><tbody>
    ${S.branches.map((b) => `<tr><td>${esc(b.name)}</td><td>${esc(b.open)}–${esc(b.close)}</td><td>${b.manualOpen && branchOpen(b) ? '<span class="pillst delivered">Open</span>' : '<span class="pillst cancelled">Closed</span>'}</td></tr>`).join('')}
    </tbody></table></div>`;
}
function topItems(list) {
  const m = new Map();
  for (const o of list) { if (o.status === 'cancelled') continue; for (const i of o.items) { const k = i.name; const v = m.get(k) || [0, 0]; m.set(k, [v[0] + i.qty, v[1] + i.lineTotal]); } }
  return [...m.entries()].map(([n, [q, a]]) => [n, q, a]).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

// ---------- ORDERS BOARD ----------
const NEXT = {
  received: [['accepted', 'Accept', 'ok'], ['cancelled', 'Reject', 'bad']],
  accepted: [['cooking', 'Cooking shuru', 'pri']],
  cooking: [['ready', 'Ready', 'pri']],
  ready: [['out', 'Rider ko diya', 'pri'], ['delivered', 'Diya / khatam', 'ok']],
  out: [['delivered', 'Delivered', 'ok']],
};
function ticketHtml(o, showNext = true) {
  const acts = (NEXT[o.status] || []).filter(([s]) => !(s === 'out' && o.mode !== 'delivery') && !(s === 'delivered' && o.mode === 'delivery' && o.status === 'ready' && false));
  return `
  <div class="ticket ${o.status === 'received' ? 'new' : ''}" data-id="${esc(o.id)}">
    <div class="row" style="justify-content:space-between"><span class="code">${esc(o.code)}</span><small class="muted">${minutesAgo(o.createdAt)} min · ${esc(fmtTime(o.createdAt))}</small></div>
    <div class="muted">${esc(o.mode === 'delivery' ? 'Delivery' : o.mode === 'pickup' ? 'Pickup' : 'Table ' + (o.table || '-'))} · ${esc(o.customer?.name || '')} ${esc(o.customer?.phone ? '· ' + o.customer.phone : '')}</div>
    ${o.address ? `<div class="muted">${esc(o.address)}</div>` : ''}
    <ul>${o.items.map((i) => `<li>${i.qty} × ${esc(i.name)}${i.size && i.size !== 'Regular' ? ' (' + esc(i.size) + ')' : ''}${(i.addons || []).length ? ' + ' + esc(i.addons.join(', ')) : ''}</li>`).join('')}</ul>
    <div class="row" style="justify-content:space-between"><b>${rs(o.total)}</b><span class="pillst ${o.status}">${esc(STATUS_LABEL[o.status])}</span></div>
    ${showNext ? `<div class="acts" style="margin-top:8px">${acts.map(([s, l, k]) => `<button class="btn sm ${k}" data-act="status" data-id="${esc(o.id)}" data-to="${s}">${esc(l)}</button>`).join('')}
      <button class="btn sm" data-act="bill" data-id="${esc(o.id)}">Bill / KOT</button></div>` : ''}
  </div>`;
}
function orders() {
  const cols = ['received', 'accepted', 'cooking', 'ready', 'out', 'delivered'];
  const live = S.orders.filter((o) => cols.includes(o.status) && !(o.status === 'delivered' && minutesAgo(o.updatedAt) > 120));
  return `
  <div class="row" style="justify-content:space-between;margin-bottom:8px">
    <h1 style="margin:0">Live orders</h1>
    <div class="row">
      <label class="sw"><input type="checkbox" id="soundtog" ${soundOn ? 'checked' : ''}><span></span>Alert sound</label>
      <button class="btn" data-act="testsound">Test alert</button>
    </div>
  </div>
  <p class="muted">Naya order aate hi sound aur vibration. Accept ya Reject dabayein. Customer app par status apne aap badalta hai (same browser, demo).</p>
  <div class="board">
    ${cols.map((c) => { const list = live.filter((o) => o.status === c); return `<section class="col"><h2><span>${esc(STATUS_LABEL[c])}</span><span>${list.length}</span></h2>${list.map((o) => ticketHtml(o)).join('') || '<p class="muted">—</p>'}</section>`; }).join('')}
  </div>
  <div class="card" style="margin-top:14px"><h2>Cancelled / recent</h2>
    <div class="tw"><table><thead><tr><th>Code</th><th>Time</th><th>Mode</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>
    ${S.orders.slice(0, 25).map((o) => `<tr><td>${esc(o.code)}</td><td>${esc(fmtDate(o.createdAt))} ${esc(fmtTime(o.createdAt))}</td><td>${esc(o.mode)}</td><td>${rs(o.total)}</td><td><span class="pillst ${o.status}">${esc(STATUS_LABEL[o.status])}</span></td><td><button class="btn sm" data-act="bill" data-id="${esc(o.id)}">Bill</button></td></tr>`).join('') || '<tr><td colspan="6" class="muted">Abhi koi order nahi.</td></tr>'}
    </tbody></table></div></div>`;
}

// ---------- KITCHEN ----------
function kitchen() {
  const list = S.orders.filter((o) => ['accepted', 'cooking'].includes(o.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return `<h1>Kitchen display</h1><p class="muted">Bade font, bina scroll ke. Ticket ready hone par dabayein.</p>
  <div class="kds">${list.map((o) => `<div class="ticket" style="font-size:18px"><div class="row" style="justify-content:space-between"><b style="font-size:22px">${esc(o.code)}</b><span>${minutesAgo(o.createdAt)} min</span></div>
    <div class="muted">${esc(o.mode === 'delivery' ? 'Delivery' : o.mode === 'pickup' ? 'Pickup' : 'Table ' + (o.table || '-'))}</div>
    <ul style="font-size:18px">${o.items.map((i) => `<li><b>${i.qty} ×</b> ${esc(i.name)}${i.size && i.size !== 'Regular' ? ' (' + esc(i.size) + ')' : ''}</li>`).join('')}</ul>
    <div class="acts">${o.status === 'accepted' ? `<button class="btn pri" data-act="status" data-id="${esc(o.id)}" data-to="cooking">Shuru</button>` : ''}<button class="btn ok" data-act="status" data-id="${esc(o.id)}" data-to="ready">Ready</button></div></div>`).join('') || '<p class="muted">Abhi kitchen mein kuch nahi.</p>'}</div>`;
}

// ---------- MENU ----------
function menu() {
  const q = (UI.menuQ || '').toLowerCase();
  const rows = S.items.filter((i) => !q || (i.name + ' ' + i.desc).toLowerCase().includes(q));
  return `
  <div class="row" style="justify-content:space-between"><h1 style="margin:0">Menu manager <span class="sample">SAMPLE</span></h1>
    <div class="row"><input id="menuq" placeholder="Dish search" style="width:200px" value="${esc(UI.menuQ || '')}"><button class="btn pri" data-act="newitem">+ Naya item</button></div></div>
  <p class="muted">Price, veg, photo, hide aur branch-wise stock yahin. Customer app par turant dikhta hai.</p>
  <div class="card tw"><table><thead><tr><th></th><th>Item</th><th>Category</th><th>Price ₹</th><th>Veg</th><th>Show</th><th>Stock per branch</th><th></th></tr></thead><tbody>
  ${rows.map((i) => `<tr data-row="${esc(i.id)}">
    <td><img class="thumb" src="../assets/food/${esc(i.img)}.webp" alt="" width="44" height="44" loading="lazy"></td>
    <td><b>${esc(i.name)}</b><div class="muted">${esc(i.desc).slice(0, 60)}</div></td>
    <td><select data-field="cat" data-id="${esc(i.id)}" style="min-width:120px">${S.categories.map((c) => `<option value="${c.id}" ${c.id === i.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></td>
    <td><input type="number" min="0" data-field="price" data-id="${esc(i.id)}" value="${i.price}" style="width:90px"></td>
    <td><label class="sw"><input type="checkbox" data-field="veg" data-id="${esc(i.id)}" ${i.veg ? 'checked' : ''}><span></span></label></td>
    <td><label class="sw"><input type="checkbox" data-field="show" data-id="${esc(i.id)}" ${i.hidden ? '' : 'checked'}><span></span></label></td>
    <td>${S.branches.map((b) => `<label class="chk" style="margin:2px 0"><input type="checkbox" data-stock="${esc(b.id)}" data-id="${esc(i.id)}" ${S.stock?.[b.id]?.[i.id] === false ? '' : 'checked'}> ${esc(b.name)}</label>`).join('')}</td>
    <td><div class="row"><button class="btn sm" data-act="edititem" data-id="${esc(i.id)}">Edit</button><button class="btn sm bad" data-act="delitem" data-id="${esc(i.id)}">Hatao</button></div></td>
  </tr>`).join('') || '<tr><td colspan="8" class="muted">Koi item nahi.</td></tr>'}
  </tbody></table></div>`;
}

// ---------- CATEGORIES ----------
function categories() {
  return `<h1>Categories</h1>
  <div class="card tw"><table><thead><tr><th>Name</th><th>Hindi / Hinglish</th><th>Cover photo</th><th>Items</th><th></th></tr></thead><tbody>
  ${S.categories.map((c) => `<tr><td><input data-cat="name" data-id="${esc(c.id)}" value="${esc(c.name)}"></td><td><input data-cat="hi" data-id="${esc(c.id)}" value="${esc(c.hi || '')}"></td>
    <td><input data-cat="img" data-id="${esc(c.id)}" value="${esc(c.img || '')}" placeholder="file name (food asset)"></td>
    <td>${S.items.filter((i) => i.cat === c.id).length}</td>
    <td><div class="row"><button class="btn sm" data-act="savecat" data-id="${esc(c.id)}">Save</button><button class="btn sm bad" data-act="delcat" data-id="${esc(c.id)}">Hatao</button></div></td></tr>`).join('')}
  </tbody></table></div>
  <div class="card"><h2>Naya category</h2><div class="grid3"><input id="newcatname" placeholder="Name"><input id="newcathi" placeholder="Hinglish name"><button class="btn pri" data-act="addcat">Add</button></div></div>`;
}

// ---------- OFFERS ----------
function offers() {
  return `<h1>Offers & coupons <span class="sample">SAMPLE</span></h1>
  <div class="card"><h2>Home banner offers</h2><div class="tw"><table><thead><tr><th>Title</th><th>Sub line</th><th>Code</th><th></th></tr></thead><tbody>
  ${S.offers.map((o) => `<tr><td><input data-off="title" data-id="${esc(o.id)}" value="${esc(o.title)}"></td><td><input data-off="sub" data-id="${esc(o.id)}" value="${esc(o.sub)}"></td><td><input data-off="coupon" data-id="${esc(o.id)}" value="${esc(o.coupon)}" style="width:110px"></td>
    <td><div class="row"><button class="btn sm" data-act="saveoff" data-id="${esc(o.id)}">Save</button></div></td></tr>`).join('')}
  </tbody></table></div></div>
  <div class="card"><h2>Coupons</h2><div class="tw"><table><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Max off ₹</th><th>Min order ₹</th><th></th></tr></thead><tbody>
  ${S.coupons.map((c) => `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.type)}</td><td><input type="number" data-cpn="value" data-code="${esc(c.code)}" value="${c.value}" style="width:80px"></td><td><input type="number" data-cpn="cap" data-code="${esc(c.code)}" value="${c.cap}" style="width:90px"></td><td><input type="number" data-cpn="min" data-code="${esc(c.code)}" value="${c.min}" style="width:90px"></td>
    <td><div class="row"><button class="btn sm" data-act="savecpn" data-code="${esc(c.code)}">Save</button><button class="btn sm bad" data-act="delcpn" data-code="${esc(c.code)}">Hatao</button></div></td></tr>`).join('')}
  </tbody></table></div>
  <div class="grid3" style="margin-top:12px"><input id="ncode" placeholder="CODE" style="text-transform:uppercase"><select id="ntype"><option value="pct">% off</option><option value="flat">₹ off</option><option value="delivery">Free delivery</option></select><button class="btn pri" data-act="addcpn">Coupon banayein</button></div></div>`;
}

// ---------- BRANCHES ----------
function branches() {
  return `<h1>Branches</h1><p class="muted">Open/Closed switch se customer app par status badalta hai. Timing IST mein.</p>
  ${S.branches.map((b) => `<div class="card" data-branch="${esc(b.id)}"><div class="row" style="justify-content:space-between"><h2 style="margin:0">${esc(b.name)}</h2>
    <label class="sw"><input type="checkbox" data-br="manualOpen" data-id="${esc(b.id)}" ${b.manualOpen ? 'checked' : ''}><span></span>${b.manualOpen ? 'Orders chal rahe' : 'Band'}</label></div>
    <div class="grid3" style="margin-top:12px">
      <label class="f">Area<input data-br="area" data-id="${esc(b.id)}" value="${esc(b.area)}"></label>
      <label class="f">Phone (placeholder)<input data-br="phone" data-id="${esc(b.id)}" value="${esc(b.phone)}"></label>
      <label class="f">Delivery radius (km)<input type="number" min="0" data-br="radiusKm" data-id="${esc(b.id)}" value="${b.radiusKm}"></label>
      <label class="f">Khulta<input type="time" data-br="open" data-id="${esc(b.id)}" value="${esc(b.open)}"></label>
      <label class="f">Band hota<input type="time" data-br="close" data-id="${esc(b.id)}" value="${esc(b.close)}"></label>
      <label class="f">Map search text<input data-br="mapQuery" data-id="${esc(b.id)}" value="${esc(b.mapQuery || '')}"></label>
    </div>
    <div class="row" style="margin-top:10px"><button class="btn pri sm" data-act="savebranch" data-id="${esc(b.id)}">Save branch</button></div></div>`).join('')}`;
}

// ---------- STAFF ----------
function staff() {
  const sections = SECTIONS.map(([k, l]) => k);
  const rp = (role) => S.rolePerms?.[role] || ROLE_PERMS[role] || [];
  return `<h1>Staff & roles</h1>
  <div class="card tw"><table><thead><tr><th>Naam</th><th>Role</th><th>Phone (placeholder)</th><th>PIN</th><th></th></tr></thead><tbody>
  ${S.staff.map((p) => `<tr><td><input data-st="name" data-id="${esc(p.id)}" value="${esc(p.name)}"></td>
    <td><select data-st="role" data-id="${esc(p.id)}">${['owner', 'manager', 'cashier', 'kitchen'].map((r) => `<option ${r === p.role ? 'selected' : ''}>${r}</option>`).join('')}</select></td>
    <td><input data-st="phone" data-id="${esc(p.id)}" value="${esc(p.phone || '')}"></td>
    <td><input data-st="pin" data-id="${esc(p.id)}" value="${esc(p.pin || '')}" placeholder="${p.role === 'owner' ? 'owner PIN Settings mein' : ROLE_PIN_DEFAULT[p.role] || ''}" style="width:100px" inputmode="numeric" maxlength="6"></td>
    <td><div class="row"><button class="btn sm" data-act="savestaff" data-id="${esc(p.id)}">Save</button><button class="btn sm bad" data-act="delstaff" data-id="${esc(p.id)}">Hatao</button></div></td></tr>`).join('')}
  </tbody></table></div>
  <div class="card"><h2>Naya staff</h2><div class="grid3"><input id="nsname" placeholder="Naam"><select id="nsrole"><option>manager</option><option>cashier</option><option>kitchen</option></select><button class="btn pri" data-act="addstaff">Add</button></div></div>
  <div class="card tw"><h2>Permissions (kya kaun dekh/chala sakta hai)</h2>
  <table><thead><tr><th>Section</th>${['owner', 'manager', 'cashier', 'kitchen'].map((r) => `<th>${r}</th>`).join('')}</tr></thead><tbody>
  ${sections.map((k) => `<tr><td>${esc(SECTION_LABEL[k])}</td>${['owner', 'manager', 'cashier', 'kitchen'].map((r) => `<td><input type="checkbox" data-perm="${r}" data-sec="${k}" ${r === 'owner' || rp(r).includes(k) ? 'checked' : ''} ${r === 'owner' ? 'disabled' : ''}></td>`).join('')}</tr>`).join('')}
  </tbody></table><div class="row" style="margin-top:10px"><button class="btn pri" data-act="saveperms">Permissions save</button><button class="btn" data-act="resetperms">Default par wapas</button></div>
  <p class="muted">Owner ko hamesha sab dikhta hai. Ye settings is browser ke demo data mein save hoti hain.</p></div>`;
}

// ---------- CUSTOMERS ----------
function customers() {
  const list = Object.values(S.customers || {}).sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));
  return `<div class="row" style="justify-content:space-between"><h1 style="margin:0">Customers</h1><button class="btn" data-act="csvcust">CSV download</button></div>
  <p class="muted">Sirf is browser ke orders se bane hain. Loyalty points sample (₹10 par 1 point).</p>
  <div class="card tw"><table><thead><tr><th>Naam</th><th>Phone</th><th>Orders</th><th>Spent</th><th>Points</th><th>Last</th></tr></thead><tbody>
  ${list.map((c) => `<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${c.orders}</td><td>${rs(c.spent)}</td><td>${c.points}</td><td>${c.lastAt ? esc(fmtDate(c.lastAt)) : '—'}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">Abhi koi customer nahi.</td></tr>'}
  </tbody></table></div>`;
}

// ---------- REPORTS ----------
function periodRows(kind) {
  const live = S.orders.filter((o) => o.status !== 'cancelled');
  const map = new Map();
  const keyOf = (iso) => {
    if (kind === 'daily') return istDay(iso);
    const d = new Date(iso); const day = (d.getUTCDay() + 6) % 7; const mon = new Date(d.getTime() - day * 864e5); return 'W ' + istDay(mon.toISOString());
  };
  for (const o of live) { const k = keyOf(o.createdAt); const v = map.get(k) || { n: 0, r: 0 }; v.n++; v.r += o.total; map.set(k, v); }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([k, v]) => ({ k, n: v.n, r: v.r, avg: v.n ? v.r / v.n : 0 }));
}
function reports() {
  const kind = UI.rep || 'daily';
  const rows = periodRows(kind);
  return `<div class="row" style="justify-content:space-between"><h1 style="margin:0">Reports <span class="sample">SAMPLE + aapke demo orders</span></h1>
    <div class="row"><select id="rep" style="width:auto"><option value="daily" ${kind === 'daily' ? 'selected' : ''}>Daily</option><option value="weekly" ${kind === 'weekly' ? 'selected' : ''}>Weekly</option></select><button class="btn" data-act="csvrep">CSV download</button></div></div>
  <div class="card tw"><table><thead><tr><th>${kind === 'daily' ? 'Din' : 'Hafta (Monday se)'}</th><th>Orders</th><th>Revenue</th><th>Average</th></tr></thead><tbody>
  ${rows.map((r) => `<tr><td>${esc(r.k)}</td><td>${r.n}</td><td>${rs(r.r)}</td><td>${rs(r.avg)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Abhi data nahi. Dashboard se sample orders banayein.</td></tr>'}
  </tbody></table></div>`;
}

// ---------- QR & BILLS ----------
function qrSvg(text) {
  if (typeof qrcode !== 'function') return '<p class="muted">QR library load nahi hui</p>';
  const q = qrcode(0, 'M'); q.addData(text); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}
function appBase() { return new URL('../', location.href).href; }
function qrCells(branchId, tables) {
  const b = S.branches.find((x) => x.id === branchId) || S.branches[0];
  const cells = [];
  for (let t = 1; t <= tables; t++) {
    const url = `${appBase()}?b=${encodeURIComponent(b.id)}&t=${t}`;
    cells.push(`<div class="qrcell">${qrSvg(url)}<div><b>${esc(b.name)}</b> · Table ${t}</div><div class="muted" style="word-break:break-all;font-size:11px">${esc(url)}</div></div>`);
  }
  return cells.join('');
}
function qr() {
  const bid = UI.qrb || S.branches[0].id; const n = UI.qrn || 6;
  return `<h1>QR & bills</h1>
  <div class="card"><h2>Table QR (dine-in)</h2>
    <div class="grid3"><label class="f">Branch<select id="qrb">${S.branches.map((b) => `<option value="${b.id}" ${b.id === bid ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></label>
      <label class="f">Tables<input id="qrn" type="number" min="1" max="40" value="${n}"></label>
      <div class="row" style="align-items:flex-end"><button class="btn pri" data-act="qrprint">Print QR sheet</button></div></div>
    <p class="muted">QR scan karte hi customer app dine-in mode mein table number ke saath khulta hai. Print ke liye browser ka print dialog khulega.</p>
    <div class="qrgrid" style="margin-top:12px">${qrCells(bid, n)}</div></div>
  <div class="card"><h2>Bill / KOT</h2><p class="muted">Kisi bhi order ke saamne <b>Bill / KOT</b> dabayein: thermal-printer jaisa bill print hoga. Sample orders par bhi chalega.</p>
    <div class="row"><select id="billpick" style="max-width:340px">${S.orders.slice(0, 30).map((o) => `<option value="${o.id}">${esc(o.code)} · ${rs(o.total)} · ${esc(STATUS_LABEL[o.status])}</option>`).join('')}</select>
    <button class="btn" data-act="billpick">Bill print</button><button class="btn" data-act="kotpick">KOT print</button></div></div>`;
}
function billHtml(o, kot = false) {
  const pr = S.settings;
  const lines = o.items.map((i) => `<div class="r"><span>${i.qty} ${esc(i.name)}${i.size && i.size !== 'Regular' ? ' (' + esc(i.size) + ')' : ''}</span><span>${kot ? '' : rs(i.lineTotal)}</span></div>`).join('');
  if (kot) return `<div class="billbox"><b>KOT · ${esc(o.code)}</b><br>${esc(fmtTime(o.createdAt))} · ${esc(o.mode)}${o.table ? ' · Table ' + esc(o.table) : ''}<hr>${lines}<hr>${o.items.length ? '' : ''}Sample KOT</div>`;
  return `<div class="billbox"><b>${esc(BRAND.sampleName)}</b><br>${esc(branchName(o.branchId))}<br>${esc(fmtTime(o.createdAt))} · ${esc(o.code)}<hr>
    ${lines}<hr>
    <div class="r"><span>Subtotal</span><span>${rs(o.subtotal)}</span></div>
    ${o.discount ? `<div class="r"><span>Discount</span><span>- ${rs(o.discount)}</span></div>` : ''}
    ${o.delivery ? `<div class="r"><span>Delivery</span><span>${rs(o.delivery)}</span></div>` : ''}
    <div class="r"><span>GST ${pr.gstPct ?? 5}% (sample)</span><span>${rs(o.gst)}</span></div>
    <div class="r"><b>Total</b><b>${rs(o.total)}</b></div><hr>
    <div style="text-align:center">Sample bill. Demo mode, no real payment.</div></div>`;
}
function printHtml(html) {
  let pa = document.getElementById('printarea');
  if (!pa) { pa = document.createElement('div'); pa.id = 'printarea'; document.body.appendChild(pa); }
  pa.innerHTML = html;
  setTimeout(() => window.print(), 50);
}

// ---------- INTEGRATIONS ----------
function integrations() {
  const I = { ...DEFAULT_INTEGRATIONS, ...S.integrations };
  const field = (k, label, ph, hint = '') => `<label class="f">${esc(label)}<input data-int="${k}" value="${esc(I[k] || '')}" placeholder="${esc(ph)}">${hint ? `<small class="muted">${esc(hint)}</small>` : ''}</label>`;
  return `<h1>Integrations</h1>
  <p class="muted">Yahan jo daalenge, woh customer app mein use hota hai: WhatsApp button, Raasta (maps), order webhook. Abhi demo mode hai: sirf is browser mein save hota hai. Real number/link aap khud daalein. Placeholder koi real number nahi hai.</p>
  <div class="card grid2">
    ${field('whatsapp', 'WhatsApp business number', '91 + 10 digit (placeholder)', 'Sirf digits, country code ke saath. Customer ka WhatsApp order isi par aayega.')}
    ${field('mapsLink', 'Google Maps link', 'https://maps.app.goo.gl/…', 'Raasta button is link par jayega.')}
    ${field('upiId', 'UPI ID (payment)', 'name@bank (abhi sample: khali)', 'Demo mode mein payment nahi hota. Real link baad mein.')}
    ${field('sheetWebhook', 'Google Sheet / webhook URL (orders)', 'https://script.google.com/…', 'Har naye order par JSON POST hoga (https only).')}
    ${field('posWebhook', 'POS / billing software webhook URL', 'https://…', 'Billing software ka endpoint, agar hai.')}
    ${field('zomato', 'Zomato link', 'https://www.zomato.com/…')}
    ${field('swiggy', 'Swiggy link', 'https://www.swiggy.com/…')}
    ${field('dunzo', 'Dunzo link', 'https://…')}
    ${field('instagram', 'Instagram link', 'https://instagram.com/…')}
    ${field('facebook', 'Facebook link', 'https://facebook.com/…')}
  </div>
  <div class="row"><button class="btn pri" data-act="saveint">Save integrations</button><button class="btn" data-act="testwh">Webhook test bhejein</button></div>
  <p class="muted" style="margin-top:10px">Webhook test: ek sample JSON https URL par POST hoga (no-cors: response nahi dikhta). Galat URL ho to bhi app nahi ruk-ta.</p>`;
}

// ---------- SETTINGS ----------
function settings() {
  return `<h1>Settings</h1>
  <div class="card"><h2>Owner PIN badlein</h2><div class="grid3"><input id="npin" class="pin" inputmode="numeric" maxlength="6" placeholder="Naya PIN (4–6 digit)"><input id="npin2" class="pin" inputmode="numeric" maxlength="6" placeholder="Dobara likhein"><button class="btn pri" data-act="savepin">PIN save</button></div></div>
  <div class="card grid3"><label class="f">GST % (sample)<input id="gst" type="number" min="0" max="28" value="${S.settings.gstPct ?? 5}"></label>
    <label class="f">Delivery fee ₹ (sample)<input id="dfee" type="number" min="0" value="${S.settings.deliveryFee ?? 30}"></label>
    <div class="row" style="align-items:flex-end"><button class="btn pri" data-act="savebill">Save</button></div></div>
  <div class="card"><h2>Data</h2><div class="row"><button class="btn" data-act="backup">Backup (JSON) download</button><button class="btn bad" data-act="resetdemo">Demo data reset</button></div>
    <p class="muted">Reset se menu, orders aur settings sample par wapas. Ye browser ka data hatata hai.</p></div>
  <div class="card"><h2>Mode</h2><p class="muted">Demo mode (localStorage). Real backend jodne ka plan: docs/BACKEND-NEXT.md. Ye sample hai: naam, menu, photo, prices sab sample.</p></div>`;
}

// ---------- drawer (item editor) ----------
function drawerView() {
  if (drawer.type === 'item') {
    const it = drawer.data;
    return `<div class="drawer" data-act="closedrawer"><div class="panel">
      <div class="row" style="justify-content:space-between"><h2>${it.isNew ? 'Naya item' : 'Item edit'}</h2><button class="btn sm" data-act="closedrawer">Band</button></div>
      <div class="grid2">
        <label class="f">Naam<input id="di-name" value="${esc(it.name || '')}"></label>
        <label class="f">Hinglish naam<input id="di-hi" value="${esc(it.hi || '')}"></label>
        <label class="f">Price ₹ (sample)<input id="di-price" type="number" min="0" value="${it.price ?? ''}"></label>
        <label class="f">Category<select id="di-cat">${S.categories.map((c) => `<option value="${c.id}" ${c.id === it.cat ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <label class="f">Photo (food asset name, e.g. chicken-biryani)<input id="di-img" value="${esc(it.img || '')}"></label>
        <label class="f">Photo URL (optional, https)<input id="di-url" value="${esc(it.imgUrl || '')}" placeholder="https://…"></label>
      </div>
      <label class="f" style="margin-top:10px">Description<textarea id="di-desc" rows="2">${esc(it.desc || '')}</textarea></label>
      <div class="row" style="margin-top:12px"><label class="sw"><input id="di-veg" type="checkbox" ${it.veg ? 'checked' : ''}><span></span>Veg</label>
        <label class="sw"><input id="di-best" type="checkbox" ${it.best ? 'checked' : ''}><span></span>Bestseller</label>
        <label class="sw"><input id="di-hidden" type="checkbox" ${it.hidden ? 'checked' : ''}><span></span>Hidden (customer ko nahi dikhega)</label></div>
      <p class="muted">Sizes aur add-ons (Regular/Family, Extra raita) ka edit agli release mein; abhi ye sample item par chalte hain.</p>
      <div class="row" style="margin-top:14px"><button class="btn pri" data-act="saveitem">Save item</button></div>
    </div></div>`;
  }
  if (drawer.type === 'confirm') {
    return `<div class="drawer" data-act="closedrawer"><div class="panel"><h2>${esc(drawer.data.title)}</h2><p>${esc(drawer.data.text)}</p><div class="row"><button class="btn bad" data-act="confirmyes">Haan, karo</button><button class="btn" data-act="closedrawer">Nahi</button></div></div></div>`;
  }
  return '';
}

// ---------- alerts for new orders ----------
function alertNew(list) {
  const newOnes = list.filter((o) => o.status === 'received');
  const ids = new Set(newOnes.map((o) => o.id));
  if (seenOrderIds === null) { seenOrderIds = ids; return; }
  const fresh = [...ids].filter((id) => !seenOrderIds.has(id));
  seenOrderIds = ids;
  if (fresh.length) {
    if (soundOn) beep();
    if (navigator.vibrate) navigator.vibrate([250, 120, 250]);
    note(`Naya order ${fresh.length}: ${list.find((o) => o.id === fresh[0])?.code || ''}`);
    document.title = `(${newOnes.length}) Orders · Admin`;
  }
}
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    [0, 0.25].forEach((t) => {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.type = 'sine'; o.frequency.value = 880; g.gain.setValueAtTime(0.0001, audioCtx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + t + 0.2);
      o.connect(g); g.connect(audioCtx.destination); o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.22);
    });
  } catch { /* no audio: vibration and the toast still tell */ }
}

// ---------- actions ----------
async function setStatus(id, to) {
  const o = S.orders.find((x) => x.id === id);
  if (!o) return;
  await db.setStatus(id, to);
  note(`${o.code}: ${STATUS_LABEL[to]}`);
}
const val = (sel, r = document) => (r.querySelector(sel)?.value ?? '');
const chk = (sel, r = document) => !!r.querySelector(sel)?.checked;
const numv = (x, d = 0) => { const n = Number(x); return Number.isFinite(n) ? n : d; };

document.addEventListener('click', async (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) { view = nav.dataset.nav; drawer = null; render(); window.scrollTo(0, 0); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act; const id = el.dataset.id;
  if (a === 'closedrawer' && e.target !== el && !e.target.matches('.btn')) return;
  e.preventDefault();
  switch (a) {
    case 'logout': sessionStorage.removeItem(SESS); session = null; render(); break;
    case 'status': await setStatus(id, el.dataset.to); break;
    case 'bill': { const o = S.orders.find((x) => x.id === id); if (o) printHtml(billHtml(o)); break; }
    case 'billpick': { const o = S.orders.find((x) => x.id === $('#billpick').value); if (o) printHtml(billHtml(o)); break; }
    case 'kotpick': { const o = S.orders.find((x) => x.id === $('#billpick').value); if (o) printHtml(billHtml(o, true)); break; }
    case 'testsound': beep(); if (navigator.vibrate) navigator.vibrate([200]); break;
    case 'seedsamples': await seedSamples(); break;
    case 'clearsamples': await db.mutate((s) => { s.orders = s.orders.filter((o) => !o.sample); }); note('Sample orders hat gaye'); break;
    case 'newitem': drawer = { type: 'item', data: { isNew: true, cat: S.categories[0].id, price: 100, veg: true, img: 'veg-thali' } }; render(); break;
    case 'edititem': drawer = { type: 'item', data: { ...S.items.find((i) => i.id === id) } }; render(); break;
    case 'saveitem': await saveItemDrawer(); break;
    case 'delitem': drawer = { type: 'confirm', data: { title: 'Item hatayein?', text: 'Ye menu se hat jayega (demo data). Undo nahi hoga.', action: { kind: 'delitem', id } } }; render(); break;
    case 'delcat': drawer = { type: 'confirm', data: { title: 'Category hatayein?', text: 'Sirf tab hatega jab usme koi item na ho.', action: { kind: 'delcat', id } } }; render(); break;
    case 'delcpn': drawer = { type: 'confirm', data: { title: 'Coupon hatayein?', text: 'Coupon ' + el.dataset.code + ' ab kaam nahi karega.', action: { kind: 'delcpn', code: el.dataset.code } } }; render(); break;
    case 'delstaff': drawer = { type: 'confirm', data: { title: 'Staff hatayein?', text: 'Ye entry hat jayegi.', action: { kind: 'delstaff', id } } }; render(); break;
    case 'confirmyes': { const ac = drawer?.data?.action; drawer = null; await confirmAction(ac); break; }
    case 'closedrawer': drawer = null; render(); break;
    case 'savecat': await db.saveCategory({ id, name: val(`[data-cat="name"][data-id="${id}"]`), hi: val(`[data-cat="hi"][data-id="${id}"]`), img: val(`[data-cat="img"][data-id="${id}"]`) }); note('Category save'); break;
    case 'addcat': { const name = val('#newcatname').trim(); if (!name) return note('Naam likhein'); await db.saveCategory({ id: 'c-' + Date.now().toString(36), name, hi: val('#newcathi').trim() || name, img: 'veg-thali' }); note('Category add'); break; }
    case 'saveoff': await db.saveOffer({ id, title: val(`[data-off="title"][data-id="${id}"]`), sub: val(`[data-off="sub"][data-id="${id}"]`), coupon: val(`[data-off="coupon"][data-id="${id}"]`).toUpperCase() }); note('Offer save'); break;
    case 'savecpn': { const code = el.dataset.code; await db.saveCoupon({ code, value: numv(val(`[data-cpn="value"][data-code="${code}"]`)), cap: numv(val(`[data-cpn="cap"][data-code="${code}"]`)), min: numv(val(`[data-cpn="min"][data-code="${code}"]`)) }); note('Coupon save'); break; }
    case 'addcpn': { const code = val('#ncode').trim().toUpperCase().replace(/\s/g, ''); if (!code) return note('Code likhein'); const type = val('#ntype'); await db.saveCoupon({ code, type, value: type === 'delivery' ? 0 : 10, cap: type === 'pct' ? 100 : 50, min: 299, label: code }); note('Coupon add'); break; }
    case 'savebranch': await saveBranch(id); break;
    case 'savestaff': await db.saveStaff({ id, name: val(`[data-st="name"][data-id="${id}"]`), role: val(`[data-st="role"][data-id="${id}"]`), phone: val(`[data-st="phone"][data-id="${id}"]`), pin: val(`[data-st="pin"][data-id="${id}"]`).replace(/\D/g, '') }); note('Staff save'); break;
    case 'addstaff': { const name = val('#nsname').trim(); if (!name) return note('Naam likhein'); await db.saveStaff({ name, role: val('#nsrole'), phone: '', pin: '' }); note('Staff add'); break; }
    case 'saveperms': { const perm = {}; for (const r of ['manager', 'cashier', 'kitchen']) perm[r] = SECTIONS.map(([k]) => k).filter((k) => chk(`[data-perm="${r}"][data-sec="${k}"]`)); await db.mutate((s) => { s.rolePerms = perm; }); note('Permissions save'); break; }
    case 'resetperms': await db.mutate((s) => { s.rolePerms = null; }); note('Default permissions'); break;
    case 'savepin': { const a1 = val('#npin'), a2 = val('#npin2'); if (!/^\d{4,6}$/.test(a1)) return note('PIN 4–6 digit ka ho'); if (a1 !== a2) return note('Dono PIN same nahi hain'); await db.updateSettings({ adminPin: a1 }); note('Owner PIN badal gaya'); break; }
    case 'savebill': await db.updateSettings({ gstPct: numv(val('#gst'), 5), deliveryFee: numv(val('#dfee'), 30) }); note('Bill settings save'); break;
    case 'backup': downloadText('rasoi-royale-demo-backup.json', JSON.stringify(S, null, 2), 'application/json'); break;
    case 'resetdemo': drawer = { type: 'confirm', data: { title: 'Demo data reset?', text: 'Menu, orders, settings sab sample par wapas. Undo nahi.', action: { kind: 'reset' } } }; render(); break;
    case 'saveint': { const patch = {}; document.querySelectorAll('[data-int]').forEach((i) => { patch[i.dataset.int] = i.value.trim(); }); const bad = ['sheetWebhook', 'posWebhook'].filter((k) => patch[k] && !/^https:\/\//.test(patch[k])); if (bad.length) return note('Webhook https:// se shuru hona chahiye'); patch.whatsapp = patch.whatsapp.replace(/\D/g, ''); await db.updateIntegrations(patch); note('Integrations save'); break; }
    case 'testwh': {
      const urls = [S.integrations.sheetWebhook, S.integrations.posWebhook].filter((u) => u && /^https:\/\//.test(u));
      if (!urls.length) return note('Pehle https webhook URL save karein');
      for (const u of urls) { try { await fetch(u, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ test: true, source: 'rasoi-royale-demo', at: new Date().toISOString() }) }); } catch {} }
      note('Test bhej diya (response browser mein nahi dikhta)'); break;
    }
    case 'csvcust': downloadText('customers.csv', csv(Object.values(S.customers || {}), ['name', 'phone', 'orders', 'spent', 'points', 'lastAt']), 'text/csv'); break;
    case 'csvrep': { const k = UI.rep || 'daily'; downloadText(`${k}-report.csv`, csv(periodRows(k), ['k', 'n', 'r', 'avg']), 'text/csv'); break; }
    case 'qrprint': printHtml(`<div class="qrgrid">${qrCells(UI.qrb || S.branches[0].id, UI.qrn || 6)}</div>`); break;
    case 'logout2': break;
  }
});
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'loginform') return;
  e.preventDefault();
  const pin = val('#pin').replace(/\D/g, '');
  const role = ['owner', 'manager', 'cashier', 'kitchen'].find((r) => pinFor(r) === pin);
  if (!role) return note('PIN galat hai');
  session = { role, at: Date.now() }; sessionStorage.setItem(SESS, JSON.stringify(session));
  view = perms(role)[0]; render();
});
document.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.id === 'soundtog') { soundOn = t.checked; if (soundOn) beep(); return; }
  if (t.id === 'rep') { UI.rep = t.value; render(); return; }
  if (t.id === 'qrb') { UI.qrb = t.value; render(); return; }
  if (t.id === 'qrn') { UI.qrn = Math.max(1, Math.min(40, numv(t.value, 6))); render(); return; }
  if (t.dataset.field) {
    const id = t.dataset.id; const f = t.dataset.field;
    if (f === 'price') await db.saveItem({ id, price: numv(t.value, 0) });
    if (f === 'cat') await db.saveItem({ id, cat: t.value });
    if (f === 'veg') await db.saveItem({ id, veg: t.checked });
    if (f === 'show') await db.saveItem({ id, hidden: !t.checked });
    note('Save ho gaya'); return;
  }
  if (t.dataset.stock) { const bid = t.dataset.stock, iid = t.dataset.id; await db.mutate((s) => { s.stock = s.stock || {}; s.stock[bid] = { ...(s.stock[bid] || {}), [iid]: t.checked }; }); note('Stock update'); return; }
  if (t.dataset.br) { const id = t.dataset.id; const k = t.dataset.br; const v = k === 'manualOpen' ? t.checked : (k === 'radiusKm' ? numv(t.value, 3) : t.value); if (k === 'manualOpen') { await db.saveBranch({ id, manualOpen: v }); note(v ? 'Branch khul gaya (orders chalenge)' : 'Branch band'); } }
});
document.addEventListener('input', (e) => { if (e.target.id === 'menuq') { UI.menuQ = e.target.value; const pos = e.target.selectionStart; render(); const n = document.getElementById('menuq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } });

async function saveItemDrawer() {
  const d = drawer?.data; if (!d) return;
  const patch = { name: val('#di-name').trim(), hi: val('#di-hi').trim(), price: numv(val('#di-price'), 0), cat: val('#di-cat'), img: val('#di-img').trim() || 'veg-thali', imgUrl: val('#di-url').trim(), desc: val('#di-desc').trim(), veg: chk('#di-veg'), best: chk('#di-best'), hidden: chk('#di-hidden') };
  if (!patch.name) return note('Naam likhein');
  if (patch.imgUrl && !/^https:\/\//.test(patch.imgUrl)) return note('Photo URL https:// se ho');
  if (d.isNew) { await db.saveItem({ ...patch, id: 'i-' + Date.now().toString(36), sizes: null, addons: null }); }
  else await db.saveItem({ id: d.id, ...patch });
  drawer = null; note('Item save ho gaya'); render();
}
async function saveBranch(id) {
  const q = (k) => val(`[data-br="${k}"][data-id="${id}"]`);
  await db.saveBranch({ id, area: q('area'), phone: q('phone'), radiusKm: numv(q('radiusKm'), 3), open: q('open') || '11:00', close: q('close') || '23:00', mapQuery: q('mapQuery') });
  note('Branch save');
}
async function confirmAction(ac) {
  if (!ac) return;
  if (ac.kind === 'delitem') await db.deleteItem(ac.id);
  if (ac.kind === 'delcat') { const used = S.items.some((i) => i.cat === ac.id); if (used) return note('Is category mein items hain'); await db.mutate((s) => { s.categories = s.categories.filter((c) => c.id !== ac.id); }); }
  if (ac.kind === 'delcpn') await db.deleteCoupon(ac.code);
  if (ac.kind === 'delstaff') await db.deleteStaff(ac.id);
  if (ac.kind === 'reset') { await db.adapter.reset(); seenOrderIds = null; note('Demo data reset'); }
  note('Ho gaya');
}
async function seedSamples() {
  const names = [['Chicken Dum Biryani', 279], ['Butter Naan', 49], ['Paneer Tikka Sizzler', 259], ['Masala Chai', 39], ['Cold Coffee', 129], ['Veg Steamed Momos (8)', 129], ['Gulab Jamun (2 pcs)', 79], ['Chicken Kathi Roll', 159]];
  await db.mutate((s) => {
    const now = Date.now();
    for (let k = 0; k < 14; k++) {
      const pick = [0, 1, 2].map((x) => names[(k * 3 + x * 5) % names.length]);
      const items = pick.map(([n, p], idx) => ({ id: 'sample-' + k + idx, name: n, qty: 1 + ((k + idx) % 2), size: 'Regular', addons: [], lineTotal: p * (1 + ((k + idx) % 2)) }));
      const sub = items.reduce((n, i) => n + i.lineTotal, 0); const gst = Math.round(sub * 0.05); const total = sub + gst;
      const at = new Date(now - (k * 5.3 + 0.5) * 3600e3).toISOString();
      s.settings.orderCounter = (s.settings.orderCounter || 1000) + 1;
      const no = s.settings.orderCounter;
      const st = k < 3 ? ['received', 'accepted', 'cooking'][k] : k === 5 ? 'cancelled' : 'delivered';
      s.orders.unshift({ id: 'o-' + no, number: no, code: 'RR' + no, sample: true, createdAt: at, updatedAt: at, status: st, history: [{ s: 'received', at }], branchId: s.branches[k % s.branches.length].id, branchName: s.branches[k % s.branches.length].name, mode: ['delivery', 'pickup', 'dinein'][k % 3], table: k % 3 === 2 ? String(3 + k) : '', address: '', items, subtotal: sub, discount: 0, coupon: '', delivery: 0, gst, total, customer: { name: 'Sample customer ' + (k + 1), phone: '9000000' + String(100 + k) }, payment: 'Counter / sample' });
    }
    s.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  note('Sample orders bann gaye (SAMPLE tag ke saath)');
}
function csv(rows, cols) {
  const esc2 = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc2(r[c])).join(','))].join('\n');
}
function downloadText(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function afterRender() {
  const li = document.querySelector('.kds, .board');
  if (li && session?.role === 'kitchen') document.title = 'Kitchen · Admin';
}

// ---------- boot ----------
let lastSig = '';
// re-render only when the data really changed: a periodic full redraw swallows clicks on phones
function maybeRender(st) {
  const sig = JSON.stringify(st);
  if (sig === lastSig) return;
  lastSig = sig;
  if (!document.activeElement?.matches?.('input,select,textarea') && !drawer) render();
}
db.subscribe(async (st) => { S = st; alertNew(st.orders); maybeRender(st); });
(async function boot() {
  S = await db.state();
  alertNew(S.orders);
  // seed orders-seen so the first load does not alert on old orders
  seenOrderIds = new Set(S.orders.filter((o) => o.status === 'received').map((o) => o.id));
  if (session && !perms(session.role).length) { session = null; sessionStorage.removeItem(SESS); }
  lastSig = JSON.stringify(S);
  render();
})();
setInterval(async () => { if (!session) return; const st = await db.state(); S = st; alertNew(st.orders); maybeRender(st); }, 2000);
