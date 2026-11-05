// =====================================================================
//  Rasoi Royale (Sample) — customer app (phone-first PWA). Demo mode.
// =====================================================================
import { BRAND, STATUS_LABEL } from './data.js';
import { db } from './store.js';
import { icon, vegMark, esc, rs, branchOpen, toast, hm, fmtTime, footerLine } from './ui.js';
import { T, setLang, getLang } from './i18n.js';

const IMG = (n) => `./assets/food/${n}.webp`;
const LS = { cart: 'rr_cart_v1', codes: 'rr_my_codes_v1', coupon: 'rr_coupon_v1' };
const jget = (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } };
const jset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

let S = null;               // store state snapshot
const ui = {
  tab: 'home', cat: 'all', veg: 'all', q: '', fav: false, branchId: null,
  mode: 'delivery', table: '', cart: jget(LS.cart, []), coupon: jget(LS.coupon, ''), openSheet: null, orderCode: null, lastMsg: '',
  name: '', phone: '', address: '', couponMsg: '',
};
const app = document.getElementById('app');

// ---------- URL: ?b=branch&t=table (table QR) ----------
(function readUrl() {
  const p = new URLSearchParams(location.search);
  if (p.get('b')) ui.branchId = p.get('b');
  if (p.get('t')) { ui.table = p.get('t').slice(0, 4); ui.mode = 'dinein'; }
})();

const branch = () => S.branches.find((b) => b.id === ui.branchId) || S.branches[0];
const itemById = (id) => S.items.find((i) => i.id === id);
const isFav = (id) => S.favs.includes(id);

function lineTotal(line) {
  const it = itemById(line.id); if (!it) return 0;
  const size = (it.sizes || []).find((s) => s.label === line.size);
  const addons = (it.addons || []).filter((a) => (line.addons || []).includes(a.name));
  const unit = it.price + (size ? size.add : 0) + addons.reduce((n, a) => n + a.price, 0);
  return unit * line.qty;
}
function unitPrice(line) { return lineTotal({ ...line, qty: 1 }); }
function bill() {
  const subtotal = ui.cart.reduce((n, l) => n + lineTotal(l), 0);
  const c = S.coupons.find((x) => x.code === ui.coupon);
  let discount = 0, freeDel = false, couponErr = '';
  if (c && subtotal > 0) {
    if (subtotal < c.min) couponErr = `${c.code}: ${rs(c.min)} ke upar ka order chahiye`;
    else if (c.type === 'pct') discount = Math.min(c.cap, Math.round(subtotal * c.value / 100));
    else if (c.type === 'flat') discount = Math.min(c.cap, subtotal);
    else if (c.type === 'delivery') freeDel = true;
  }
  const delivery = ui.mode === 'delivery' && subtotal > 0 && !(freeDel || subtotal >= BRAND.freeDeliveryAbove) ? (S.settings.deliveryFee ?? BRAND.deliveryFee) : 0;
  const taxable = Math.max(0, subtotal - discount);
  const gst = Math.round(taxable * (S.settings.gstPct ?? 5) / 100);
  return { subtotal, discount, delivery, gst, total: taxable + gst + delivery, couponErr, freeDel };
}
const cartCount = () => ui.cart.reduce((n, l) => n + l.qty, 0);
function saveCart() { jset(LS.cart, ui.cart); jset(LS.coupon, ui.coupon); }

// ---------- main render ----------
function render() {
  if (!S) return;
  const b = branch(); const open = branchOpen(b);
  const body = ui.tab === 'home' ? home(b, open) : ui.tab === 'menu' ? menu() : ui.tab === 'cart' ? cart(b) : ui.tab === 'orders' ? orders() : more();
  app.innerHTML = `
    <header class="top">
      <div class="brand">
        <span class="logo" aria-hidden="true">${BRAND.logoLetter}</span>
        <div class="brandtxt"><b>${esc(BRAND.name)}</b><small>${esc(T('sampleTag'))}</small></div>
      </div>
      <button class="branchbtn" data-act="branch" aria-label="${esc(T('branch'))}">${icon('store')}<span>${esc(b.name)}</span>${icon('arrow', 'chev')}</button>
    </header>
    <main class="screen" id="screen">${body}</main>
    <nav class="bottomnav" aria-label="Main">
      ${navBtn('home', 'home', T('navHome'))}
      ${navBtn('menu', 'menu', T('navMenu'))}
      ${navBtn('cart', 'cart', T('navCart'), cartCount())}
      ${navBtn('orders', 'orders', T('navOrders'))}
      ${navBtn('more', 'more', T('navMore'))}
    </nav>
    ${sheet()}
    <div class="footline">${esc(footerLine())}</div>`;
}
const navBtn = (id, ic, label, n = 0) => `<button class="${ui.tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}" aria-current="${ui.tab === id}">${icon(ic)}<span>${esc(label)}</span>${n ? `<em>${n}</em>` : ''}</button>`;

function home(b, open) {
  const cats = S.categories;
  const cards = S.offers.map((o) => `
    <article class="offer" style="background:${o.color}">
      <span class="tag">${esc(o.tag)}</span>
      <h3>${esc(o.title)}</h3>
      <p>${esc(o.sub)}</p>
      <button class="ghost" data-act="copy" data-code="${esc(o.coupon)}">${esc(T('copyCode'))}: <b>${esc(o.coupon)}</b></button>
    </article>`).join('');
  const hrs = `${b.open}–${b.close}`;
  const mapHref = S.integrations.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapQuery)}`;
  const waNum = S.integrations.whatsapp || '';
  const reorder = S.lastOrder && S.lastOrder.items?.length ? `<section class="card reorder"><div><b>${esc(T('lastTime'))}</b><p>${S.lastOrder.items.map((i) => esc(i.name)).slice(0, 3).join(', ')}</p></div><button class="pill" data-act="reorder" data-code="${esc(S.lastOrder.code)}">${esc(T('reorder'))}</button></section>` : '';
  return `
    <section class="hero">
      <img src="${IMG('hero-nonveg')}" alt="" width="1200" height="675" fetchpriority="high">
      <div class="herotxt">
        <span class="status ${open ? 'open' : 'closed'}"><i></i>${open ? esc(T('openNow')) : esc(T('closedNow'))}</span>
        <h1>${esc(T('heroHead'))}</h1>
        <p>${esc(b.name)} · ${esc(T('hours'))} ${hrs}</p>
      </div>
      <small class="photonote">${esc(T('samplePhotos'))}</small>
    </section>
    <section class="quick" aria-label="${esc(T('quick'))}">
      <a class="qa" href="tel:${esc(b.phone.replace(/\s/g, ''))}">${icon('phone')}<span>${esc(T('call'))}</span></a>
      <a class="qa" href="${esc(mapHref)}" target="_blank" rel="noopener">${icon('map')}<span>${esc(T('route'))}</span></a>
      <a class="qa" href="${waNum ? `https://wa.me/${esc(waNum)}?text=${encodeURIComponent(T('waHi') + ' ' + b.name)}` : '#'}" ${waNum ? 'target="_blank" rel="noopener"' : 'data-act="nowa"'}>${icon('chat')}<span>WhatsApp</span></a>
      <button class="qa" data-act="share">${icon('share')}<span>${esc(T('share'))}</span></button>
    </section>
    ${reorder}
    <section class="block"><div class="sechead"><h2>${esc(T('offers'))}</h2><small>${esc(T('samplePhotos'))}</small></div>
      <div class="rail">${cards}</div></section>
    <section class="block"><div class="sechead"><h2>${esc(T('categories'))}</h2></div>
      <div class="catgrid">${cats.map((c) => `
        <button class="catcard" data-act="cat" data-cat="${c.id}">
          <img loading="lazy" src="${IMG(c.img)}" alt="" width="600" height="600">
          <span>${esc(lang(c))}</span>
        </button>`).join('')}</div></section>
    <section class="block assist"><button class="rowbtn" data-act="assist">${icon('sparkle')}<span><b>${esc(T('askTitle'))}</b><small>${esc(T('askSub'))}</small></span>${icon('arrow', 'chev')}</button></section>`;
}
const lang = (c) => (getLang() === 'english' ? c.name : c.hi || c.name);

function menu() {
  const list = filtered();
  return `
    <section class="menuhead">
      <h1>${esc(T('menuTitle'))}</h1>
      <label class="search">${icon('search')}<input id="q" type="search" placeholder="${esc(T('search'))}" value="${esc(ui.q)}" autocomplete="off"></label>
      <div class="chips" role="group" aria-label="${esc(T('filters'))}">
        <button class="chip ${ui.veg === 'all' ? 'on' : ''}" data-act="veg" data-v="all">${esc(T('all'))}</button>
        <button class="chip ${ui.veg === 'veg' ? 'on' : ''}" data-act="veg" data-v="veg">${vegMark(true)} ${esc(T('veg'))}</button>
        <button class="chip ${ui.veg === 'nonveg' ? 'on' : ''}" data-act="veg" data-v="nonveg">${vegMark(false)} ${esc(T('nonveg'))}</button>
        <button class="chip ${ui.fav ? 'on' : ''}" data-act="favonly">${icon('heart')} ${esc(T('favs'))}</button>
      </div>
      <div class="chips cats" role="group" aria-label="${esc(T('categories'))}">
        <button class="chip ${ui.cat === 'all' ? 'on' : ''}" data-act="cat" data-cat="all">${esc(T('all'))}</button>
        ${S.categories.map((c) => `<button class="chip ${ui.cat === c.id ? 'on' : ''}" data-act="cat" data-cat="${c.id}">${esc(lang(c))}</button>`).join('')}
      </div>
    </section>
    <div id="items" class="items">${itemList(list)}</div>`;
}
function filtered() {
  const q = ui.q.trim().toLowerCase();
  return S.items.filter((i) => (ui.cat === 'all' || i.cat === ui.cat)
    && (ui.veg === 'all' || (ui.veg === 'veg') === i.veg)
    && (!ui.fav || isFav(i.id))
    && (!q || (i.name + ' ' + i.hi + ' ' + i.desc).toLowerCase().includes(q)));
}
function itemList(list) {
  if (!list.length) return `<p class="empty">${esc(T('noItems'))}</p>`;
  return list.map((i) => {
    const inCart = ui.cart.filter((l) => l.id === i.id).reduce((n, l) => n + l.qty, 0);
    return `
    <article class="item">
      <button class="itemtap" data-act="open" data-id="${i.id}" aria-label="${esc(i.name)}">
        <div class="itxt">
          ${vegMark(i.veg)}
          <h3>${esc(getLang() === 'english' ? i.name : i.hi || i.name)}</h3>
          <p>${esc(i.desc)}</p>
          <b class="price">${rs(i.price)}${i.sizes ? ' <small>+</small>' : ''}</b>
          ${i.best ? `<span class="best">${icon('star')} ${esc(T('bestseller'))}</span>` : ''}
        </div>
        <div class="ithumb"><img loading="lazy" src="${IMG(i.img)}" alt="" width="600" height="600"></div>
      </button>
      <div class="iact">
        <button class="favbtn ${isFav(i.id) ? 'on' : ''}" data-act="fav" data-id="${i.id}" aria-label="${esc(T('favs'))}">${icon(isFav(i.id) ? 'heartFill' : 'heart')}</button>
        ${inCart ? stepper(i.id, inCart) : `<button class="addbtn" data-act="${i.sizes || i.addons ? 'open' : 'quickadd'}" data-id="${i.id}">${esc(T('add'))}</button>`}
      </div>
    </article>`;
  }).join('');
}
const stepper = (id, n) => `<div class="stepper"><button data-act="dec" data-id="${id}" aria-label="-">${icon('minus')}</button><span>${n}</span><button data-act="inc" data-id="${id}" aria-label="+">${icon('plus')}</button></div>`;

function cart(b) {
  if (!ui.cart.length) return `
    <section class="emptycart"><img src="${IMG('masala-chai')}" alt="" width="600" height="600"><h1>${esc(T('cartEmpty'))}</h1><p>${esc(T('cartEmptySub'))}</p>
    <button class="pill big" data-act="tab" data-tab="menu">${esc(T('goMenu'))}</button></section>`;
  const c = bill();
  const lines = ui.cart.map((l, idx) => {
    const it = itemById(l.id); if (!it) return '';
    const extra = [l.size && l.size !== 'Regular' ? l.size : '', ...(l.addons || [])].filter(Boolean).join(' · ');
    return `<div class="line"><div><b>${esc(it.name)}</b>${extra ? `<small>${esc(extra)}</small>` : ''}<small>${rs(unitPrice(l))}</small></div>
      <div class="linectl">${stepperLine(idx, l.qty)}<span>${rs(lineTotal(l))}</span></div></div>`;
  }).join('');
  const modes = [['delivery', 'bike', T('delivery')], ['pickup', 'bag', T('pickup')], ['dinein', 'table', T('dineIn')]];
  return `
    <section class="cartwrap">
      <h1>${esc(T('yourOrder'))}</h1>
      <div class="card">${lines}</div>
      <div class="card">
        <div class="seg" role="radiogroup" aria-label="${esc(T('howGet'))}">
          ${modes.map(([v, ic, l]) => `<button role="radio" aria-checked="${ui.mode === v}" class="${ui.mode === v ? 'on' : ''}" data-act="mode" data-m="${v}">${icon(ic)}<span>${esc(l)}</span></button>`).join('')}
        </div>
        ${ui.mode === 'dinein' ? `<label class="field">${esc(T('tableNo'))}<input id="table" inputmode="numeric" maxlength="4" value="${esc(ui.table)}" placeholder="5"></label>` : ''}
        ${ui.mode === 'delivery' ? `<label class="field">${esc(T('address'))}<textarea id="addr" rows="2" placeholder="${esc(T('addrPh'))}">${esc(ui.address)}</textarea></label>` : ''}
        <div class="two">
          <label class="field">${esc(T('name'))}<input id="cname" autocomplete="name" value="${esc(ui.name)}"></label>
          <label class="field">${esc(T('phone'))}<input id="cphone" inputmode="tel" autocomplete="tel" value="${esc(ui.phone)}" placeholder="98xxxxxxxx"></label>
        </div>
      </div>
      <div class="card coupon">
        <div class="couponrow"><input id="coupon" placeholder="${esc(T('couponPh'))}" value="${esc(ui.coupon)}" aria-label="${esc(T('coupon'))}"><button class="pill" data-act="applycoupon">${esc(T('apply'))}</button></div>
        <p class="hint">${c.couponErr ? esc(c.couponErr) : ui.couponMsg ? esc(ui.couponMsg) : esc(T('couponHint'))}</p>
      </div>
      <div class="card bill">
        <div><span>${esc(T('subtotal'))}</span><b>${rs(c.subtotal)}</b></div>
        ${c.discount ? `<div class="ok"><span>${esc(T('discount'))} (${esc(ui.coupon)})</span><b>− ${rs(c.discount)}</b></div>` : ''}
        ${c.freeDel ? `<div class="ok"><span>${esc(T('delivery'))}</span><b>${esc(T('free'))}</b></div>` : ui.mode === 'delivery' ? `<div><span>${esc(T('deliveryFee'))}</span><b>${c.delivery ? rs(c.delivery) : esc(T('free'))}</b></div>` : ''}
        <div><span>GST ${S.settings.gstPct ?? 5}% (sample)</span><b>${rs(c.gst)}</b></div>
        <div class="total"><span>${esc(T('total'))}</span><b>${rs(c.total)}</b></div>
        <small class="pay">${esc(T('payNote'))}</small>
      </div>
      <button class="cta" data-act="place" ${c.subtotal ? '' : 'disabled'}>${esc(T('placeOrder'))} · ${rs(c.total)}</button>
      <button class="cta alt" data-act="wa">${icon('chat')} ${esc(T('waOrder'))}</button>
      <button class="link" data-act="clear">${esc(T('clearCart'))}</button>
    </section>`;
}
const stepperLine = (idx, n) => `<div class="stepper sm"><button data-act="decl" data-i="${idx}" aria-label="-">${icon('minus')}</button><span>${n}</span><button data-act="incl" data-i="${idx}" aria-label="+">${icon('plus')}</button></div>`;

function tracker(order) {
  const steps = order.mode === 'delivery' ? ['received', 'accepted', 'cooking', 'ready', 'out', 'delivered'] : ['received', 'accepted', 'cooking', 'ready', 'delivered'];
  const cur = order.status;
  const idx = steps.indexOf(cur);
  const cancelled = cur === 'cancelled';
  return `
    <section class="tracker">
      <div class="tkhead"><span class="code">${esc(order.code)}</span><small>${esc(fmtTime(order.createdAt))}</small></div>
      <div class="ticket">
        <div class="tkmsg">${cancelled ? esc(T('cancelled')) : esc(msgFor(cur, order.mode))}</div>
        <ol class="steps">${steps.map((s, i) => `<li class="${cancelled ? '' : i < idx ? 'done' : i === idx ? 'now' : ''}"><i>${i < idx || cur === 'delivered' ? icon('check') : ''}</i><span>${esc(STATUS_LABEL[s])}</span></li>`).join('')}</ol>
        <div class="tkitems">${order.items.map((i) => `<div><span>${i.qty} × ${esc(i.name)}${i.size && i.size !== 'Regular' ? ` (${esc(i.size)})` : ''}</span><b>${rs(i.lineTotal)}</b></div>`).join('')}
          <div class="tkline"><span>${esc(T('total'))}</span><b>${rs(order.total)}</b></div>
          <small>${esc(modeLabel(order))}</small></div>
      </div>
      <div class="row2">
        <button class="pill" data-act="reorderOrder" data-code="${esc(order.code)}">${esc(T('reorder'))}</button>
        <a class="pill ghost-l" href="${S.integrations.whatsapp ? `https://wa.me/${esc(S.integrations.whatsapp)}?text=${encodeURIComponent(order.code + ' — ' + T('helpMsg'))}` : '#'}" ${S.integrations.whatsapp ? 'target="_blank" rel="noopener"' : 'data-act="nowa"'}>${icon('chat')} ${esc(T('help'))}</a>
      </div>
      <button class="link" data-act="tab" data-tab="orders">${esc(T('backOrders'))}</button>
    </section>`;
}
const msgFor = (s, mode) => ({
  received: T('mRecv'), accepted: T('mAcc'), cooking: T('mCook'), ready: mode === 'delivery' ? T('mReadyD') : T('mReadyP'), out: T('mOut'), delivered: T('mDone'),
}[s] || '');
const modeLabel = (o) => ({ delivery: 'Delivery' + (o.address ? ': ' + o.address : ''), pickup: 'Pickup (counter)', dinein: `Dine-in · Table ${o.table || '-'}` }[o.mode] || '');

function orders() {
  const codes = jget(LS.codes, []);
  const list = S.orders.filter((o) => codes.includes(o.code));
  if (ui.orderCode) { const o = S.orders.find((x) => x.code === ui.orderCode); if (o) return tracker(o); }
  if (!list.length) return `<section class="emptycart"><img src="${IMG('samosa')}" alt="" width="600" height="600"><h1>${esc(T('noOrders'))}</h1><p>${esc(T('noOrdersSub'))}</p><button class="pill big" data-act="tab" data-tab="menu">${esc(T('goMenu'))}</button></section>`;
  return `<section class="cartwrap"><h1>${esc(T('navOrders'))}</h1>${list.map((o) => `
    <button class="card orderrow" data-act="track" data-code="${esc(o.code)}">
      <div><b>${esc(o.code)}</b><small>${esc(fmtTime(o.createdAt))} · ${o.items.length} items · ${rs(o.total)}</small></div>
      <span class="st ${o.status}">${esc(STATUS_LABEL[o.status] || o.status)}</span>
    </button>`).join('')}</section>`;
}

function more() {
  return `
    <section class="cartwrap">
      <h1>${esc(T('navMore'))}</h1>
      <div class="card">
        <button class="rowbtn" data-act="assist">${icon('sparkle')}<span><b>${esc(T('askTitle'))}</b><small>${esc(T('askSub'))}</small></span>${icon('arrow', 'chev')}</button>
        <button class="rowbtn" data-act="favonly">${icon('heart')}<span><b>${esc(T('favs'))}</b><small>${S.favs.length} ${esc(T('saved'))}</small></span>${icon('arrow', 'chev')}</button>
        <button class="rowbtn" data-act="branch">${icon('store')}<span><b>${esc(T('branch'))}</b><small>${esc(branch().name)} · ${esc(branch().area)}</small></span>${icon('arrow', 'chev')}</button>
      </div>
      <div class="card">
        <div class="sechead"><h2>${esc(T('language'))}</h2></div>
        <div class="seg">
          <button class="${getLang() === 'hinglish' ? 'on' : ''}" data-act="lang" data-l="hinglish">Hinglish</button>
          <button class="${getLang() === 'english' ? 'on' : ''}" data-act="lang" data-l="english">English</button>
        </div>
      </div>
      <div class="card about">
        <h2>${esc(T('aboutTitle'))}</h2>
        <p>${esc(T('aboutText'))}</p>
        <p class="hint">${esc(T('sampleNote'))}</p>
      </div>
    </section>`;
}

// ---------- bottom sheets (branch picker, item customiser, assistant) ----------
let sheetItem = null; // {id, size, addons:[], qty}
function sheet() {
  if (!ui.openSheet) return '';
  let inner = '';
  if (ui.openSheet === 'branch') {
    inner = `<h2>${esc(T('pickBranch'))}</h2>` + S.branches.map((b) => `
      <button class="rowbtn branchrow ${b.id === branch().id ? 'on' : ''}" data-act="setbranch" data-id="${b.id}">${icon('store')}<span><b>${esc(b.name)}</b><small>${esc(b.area)} · ${esc(T('hours'))} ${b.open}–${b.close}</small></span><em class="status ${branchOpen(b) ? 'open' : 'closed'}"><i></i>${branchOpen(b) ? esc(T('openNow')) : esc(T('closedNow'))}</em></button>`).join('');
  } else if (ui.openSheet === 'item' && sheetItem) {
    const it = itemById(sheetItem.id); if (!it) return '';
    const size = (it.sizes || []).find((s) => s.label === sheetItem.size) || { add: 0 };
    const add = (it.addons || []).filter((a) => sheetItem.addons.includes(a.name)).reduce((n, a) => n + a.price, 0);
    const unit = it.price + size.add + add;
    inner = `
      <img class="sheetimg" src="${IMG(it.img)}" alt="" width="600" height="600">
      <div class="sheettxt"><h2>${vegMark(it.veg)} ${esc(it.name)}</h2><p>${esc(it.desc)}</p></div>
      ${it.sizes ? `<fieldset><legend>${esc(T('size'))}</legend>${it.sizes.map((s) => `<label class="opt"><input type="radio" name="size" value="${esc(s.label)}" ${sheetItem.size === s.label ? 'checked' : ''} data-act="size"><span>${esc(s.label)}</span><b>${s.add ? (s.add > 0 ? '+' : '') + rs(s.add) : rs(it.price)}</b></label>`).join('')}</fieldset>` : ''}
      ${it.addons ? `<fieldset><legend>${esc(T('addons'))}</legend>${it.addons.map((a) => `<label class="opt"><input type="checkbox" value="${esc(a.name)}" ${sheetItem.addons.includes(a.name) ? 'checked' : ''} data-act="addon"><span>${esc(a.name)}</span><b>+${rs(a.price)}</b></label>`).join('')}</fieldset>` : ''}
      <div class="sheetbar">${stepperSheet(sheetItem.qty)}<button class="cta" data-act="addsheet">${esc(T('addFor'))} ${rs(unit * sheetItem.qty)}</button></div>`;
  } else if (ui.openSheet === 'assist') {
    inner = `<h2>${esc(T('askTitle'))}</h2><p class="hint">${esc(T('assistNote'))}</p>
      <div class="chips wrapchips">${['Kab khula hai?', 'Delivery hai?', 'Coupon kya hai?', 'Veg kya hai?', 'Order kaise track karun?', 'Payment kaise hota hai?'].map((q) => `<button class="chip" data-act="askq" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
      <div id="answers" class="answers">${ui.lastMsg ? esc(ui.lastMsg) : ''}</div>
      <form id="askform" class="askform"><input id="askin" placeholder="${esc(T('askPh'))}" autocomplete="off"><button class="pill">${esc(T('send'))}</button></form>`;
  }
  return `<div class="scrim" data-act="closesheet"></div><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(T('close'))}"><button class="sheetx" data-act="closesheet" aria-label="${esc(T('close'))}">${icon('x')}</button>${inner}</section>`;
}
const stepperSheet = (n) => `<div class="stepper"><button data-act="qdec" aria-label="-">${icon('minus')}</button><span>${n}</span><button data-act="qinc" aria-label="+">${icon('plus')}</button></div>`;

// ---------- rule-based assistant (honest: fixed answers, not AI) ----------
function answer(q) {
  const t = q.toLowerCase(); const b = branch(); const c = bill();
  if (/khula|open|time|kab|timing|band/.test(t)) return `${b.name}: ${T('hours')} ${b.open}–${b.close}. ${branchOpen(b) ? T('openNow') : T('closedNow')}.`;
  if (/deliver|radius|ghar|bhej/.test(t)) return `${T('deliveryAns')} (${b.radiusKm} km). ${rs(BRAND.freeDeliveryAbove)} ${T('freeAbove')}.`;
  if (/coupon|offer|discount|code|off/.test(t)) return S.coupons.map((x) => `${x.code}: ${x.label} (${T('minOrder')} ${rs(x.min)})`).join('\n');
  if (/veg|non|chicken|mutton/.test(t)) return T('vegAns');
  if (/track|status|kahan|order/.test(t)) return T('trackAns');
  if (/pay|upi|cash|card/.test(t)) return T('payAns');
  if (/total|bill|gst|price|kitna|rate/.test(t)) return `${T('billAns')} ${rs(c.total)}.`;
  return T('unknownAns');
}

// ---------- actions ----------
function setCart(next) { ui.cart = next; saveCart(); render(); }
function addLine(id, opts = {}) {
  const it = itemById(id); if (!it) return;
  const size = opts.size ?? (it.sizes ? it.sizes[0].label : null);
  const addons = opts.addons ?? [];
  const key = JSON.stringify([id, size, [...addons].sort()]);
  const i = ui.cart.findIndex((l) => JSON.stringify([l.id, l.size, [...(l.addons || [])].sort()]) === key);
  const next = [...ui.cart];
  if (i >= 0) next[i] = { ...next[i], qty: next[i].qty + (opts.qty || 1) };
  else next.push({ id, size, addons, qty: opts.qty || 1 });
  setCart(next);
  toast(T('added'));
}

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act;
  if (el.tagName === 'A' && a !== 'nowa') return;
  e.preventDefault();
  switch (a) {
    case 'tab': ui.tab = el.dataset.tab; ui.openSheet = null; if (ui.tab !== 'orders') ui.orderCode = null; render(); window.scrollTo(0, 0); break;
    case 'branch': ui.openSheet = 'branch'; render(); break;
    case 'setbranch': ui.branchId = el.dataset.id; ui.openSheet = null; render(); break;
    case 'closesheet': ui.openSheet = null; render(); break;
    case 'cat': ui.cat = el.dataset.cat; ui.tab = 'menu'; ui.openSheet = null; render(); break;
    case 'veg': ui.veg = el.dataset.v; render(); break;
    case 'favonly': ui.fav = !ui.fav; ui.tab = 'menu'; ui.openSheet = null; render(); break;
    case 'fav': { const v = await db.toggleFav(el.dataset.id); S.favs = v; render(); break; }
    case 'quickadd': addLine(el.dataset.id); render(); break;
    case 'open': sheetItem = { id: el.dataset.id, size: (itemById(el.dataset.id).sizes || [{}])[0].label || null, addons: [], qty: 1 }; ui.openSheet = 'item'; render(); break;
    case 'size': sheetItem.size = el.value; render(); break;
    case 'addon': { const n = el.value; sheetItem.addons = el.checked ? [...sheetItem.addons, n] : sheetItem.addons.filter((x) => x !== n); render(); break; }
    case 'qinc': sheetItem.qty++; render(); break;
    case 'qdec': sheetItem.qty = Math.max(1, sheetItem.qty - 1); render(); break;
    case 'addsheet': addLine(sheetItem.id, { size: sheetItem.size, addons: sheetItem.addons, qty: sheetItem.qty }); ui.openSheet = null; render(); break;
    case 'inc': addLine(el.dataset.id); render(); break;
    case 'dec': { const i = ui.cart.findIndex((l) => l.id === el.dataset.id); if (i >= 0) { const n = [...ui.cart]; n[i].qty > 1 ? n[i] = { ...n[i], qty: n[i].qty - 1 } : n.splice(i, 1); setCart(n); } else render(); break; }
    case 'incl': { const n = [...ui.cart]; n[+el.dataset.i] = { ...n[+el.dataset.i], qty: n[+el.dataset.i].qty + 1 }; setCart(n); break; }
    case 'decl': { const n = [...ui.cart]; const i = +el.dataset.i; if (n[i].qty > 1) n[i] = { ...n[i], qty: n[i].qty - 1 }; else n.splice(i, 1); setCart(n); break; }
    case 'clear': ui.cart = []; ui.coupon = ''; saveCart(); render(); break;
    case 'mode': ui.mode = el.dataset.m; render(); break;
    case 'applycoupon': { const v = (document.getElementById('coupon')?.value || '').trim().toUpperCase(); ui.coupon = v; const ok = S.coupons.some((x) => x.code === v); ui.couponMsg = v ? (ok ? `${v} lagaya` : 'Ye code abhi nahi hai (sample)') : ''; saveCart(); render(); break; }
    case 'copy': try { await navigator.clipboard.writeText(el.dataset.code); toast(`${el.dataset.code} copy ho gaya`); } catch { toast(el.dataset.code); } break;
    case 'share': {
      const url = location.origin + location.pathname.replace(/[^/]*$/, '');
      if (navigator.share) { try { await navigator.share({ title: BRAND.sampleName, url }); } catch {} }
      else { try { await navigator.clipboard.writeText(url); toast(T('linkCopied')); } catch { toast(url); } }
      break;
    }
    case 'nowa': toast(T('noWa')); break;
    case 'reorder': reorderCode(el.dataset.code); break;
    case 'reorderOrder': reorderCode(el.dataset.code); break;
    case 'track': ui.orderCode = el.dataset.code; render(); break;
    case 'assist': ui.openSheet = 'assist'; ui.lastMsg = ''; render(); break;
    case 'askq': ask(el.dataset.q); break;
    case 'lang': setLang(el.dataset.l); render(); break;
    case 'place': await placeOrder(); break;
    case 'wa': waOrder(); break;
  }
});
document.addEventListener('submit', (e) => { if (e.target.id === 'askform') { e.preventDefault(); ask(document.getElementById('askin').value); } });
document.addEventListener('input', (e) => { if (e.target.id === 'q') { ui.q = e.target.value; const list = document.getElementById('items'); if (list) list.innerHTML = itemList(filtered()); } });
document.addEventListener('change', (e) => { if (e.target.id === 'table') ui.table = e.target.value.replace(/\D/g, '').slice(0, 4); if (e.target.id === 'addr') ui.address = e.target.value; if (e.target.id === 'cname') ui.name = e.target.value; if (e.target.id === 'cphone') ui.phone = e.target.value; });
document.addEventListener('focusout', (e) => { if (e.target.id === 'table') ui.table = e.target.value.replace(/\D/g, '').slice(0, 4); if (e.target.id === 'addr') ui.address = e.target.value; if (e.target.id === 'cname') ui.name = e.target.value; if (e.target.id === 'cphone') ui.phone = e.target.value; });

function ask(q) {
  if (!q || !q.trim()) return;
  ui.lastMsg = `${q.trim()}\n→ ${answer(q.trim())}`;
  const box = document.getElementById('answers'); if (box) box.textContent = ui.lastMsg;
  const inp = document.getElementById('askin'); if (inp) inp.value = '';
}
function reorderCode(code) {
  const o = S.orders.find((x) => x.code === code) || (S.lastOrder && S.lastOrder.code === code ? S.lastOrder : null);
  if (!o) return toast(T('noOrders'));
  const next = [...ui.cart];
  for (const i of o.items) { if (!itemById(i.id)) continue; const key = JSON.stringify([i.id, i.size, [...(i.addons || [])].sort()]); const at = next.findIndex((l) => JSON.stringify([l.id, l.size, [...(l.addons || [])].sort()]) === key); if (at >= 0) next[at] = { ...next[at], qty: next[at].qty + i.qty }; else next.push({ id: i.id, size: i.size, addons: i.addons || [], qty: i.qty }); }
  ui.cart = next; saveCart(); ui.tab = 'cart'; ui.orderCode = null; render(); toast(T('reorderDone'));
}

async function placeOrder() {
  const c = bill();
  const name = (document.getElementById('cname')?.value || ui.name || '').trim();
  const phone = (document.getElementById('cphone')?.value || ui.phone || '').replace(/\D/g, '');
  const address = (document.getElementById('addr')?.value || ui.address || '').trim();
  const table = (document.getElementById('table')?.value || ui.table || '').trim();
  if (!name) return toast(T('needName'));
  if (!/^\d{10}$/.test(phone.slice(-10)) || phone.length < 10) return toast(T('needPhone'));
  if (ui.mode === 'delivery' && address.length < 8) return toast(T('needAddr'));
  if (ui.mode === 'dinein' && !table) return toast(T('needTable'));
  ui.name = name; ui.phone = phone; ui.address = address; ui.table = table;
  const payload = {
    branchId: branch().id, branchName: branch().name, mode: ui.mode, table: ui.mode === 'dinein' ? table : '', address: ui.mode === 'delivery' ? address : '',
    items: ui.cart.map((l) => { const it = itemById(l.id); return { id: l.id, name: it.name, qty: l.qty, size: l.size, addons: l.addons || [], lineTotal: lineTotal(l) }; }),
    subtotal: c.subtotal, discount: c.discount, coupon: c.discount ? ui.coupon : '', delivery: c.delivery, gst: c.gst, total: c.total,
    customer: { name, phone }, payment: 'Counter / sample (no real payment)', source: 'app',
  };
  const order = await db.createOrder(payload);
  const codes = jget(LS.codes, []); jset(LS.codes, [order.code, ...codes].slice(0, 30));
  postWebhooks(order);
  ui.cart = []; ui.coupon = ''; ui.couponMsg = ''; saveCart();
  ui.orderCode = order.code; ui.tab = 'orders';
  S = await db.state();
  render(); window.scrollTo(0, 0);
  toast(T('placed'));
}

async function postWebhooks(order) {
  const body = JSON.stringify({ source: 'rasoi-royale-demo', brand: BRAND.sampleName, order: { code: order.code, createdAt: order.createdAt, mode: order.mode, branch: order.branchName, table: order.table, address: order.address, items: order.items, subtotal: order.subtotal, discount: order.discount, delivery: order.delivery, gst: order.gst, total: order.total, customer: order.customer } });
  for (const url of [S.integrations.sheetWebhook, S.integrations.posWebhook]) {
    if (!url || !/^https:\/\//.test(url)) continue;
    try { await fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body }); } catch { /* demo: a failed webhook does not block the order */ }
  }
}

function waText() {
  const c = bill();
  const lines = ui.cart.map((l) => { const it = itemById(l.id); const extra = [l.size && l.size !== 'Regular' ? l.size : '', ...(l.addons || [])].filter(Boolean).join(', '); return `${l.qty} x ${it.name}${extra ? ' (' + extra + ')' : ''} — ${rs(lineTotal(l))}`; });
  return [`${BRAND.sampleName} — order`, `Branch: ${branch().name}`, `Mode: ${ui.mode}${ui.mode === 'dinein' && ui.table ? ' (table ' + ui.table + ')' : ''}`, ...lines, `Total: ${rs(c.total)} (GST incl.)`, ui.address ? `Address: ${ui.address}` : '', ui.name ? `Name: ${ui.name}` : '', ui.phone ? `Phone: ${ui.phone}` : ''].filter(Boolean).join('\n');
}
function waOrder() {
  if (!ui.cart.length) return;
  const num = S.integrations.whatsapp;
  if (!num) return toast(T('noWa'));
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(waText())}`, '_blank', 'noopener');
}

// ---------- live status for the open tracker + other tabs ----------
let lastSig = '';
db.subscribe(async () => { S = await db.state(); const sig = JSON.stringify(S); if (sig !== lastSig) { lastSig = sig; if (!document.activeElement?.matches?.('input,textarea')) render(); } });
setInterval(async () => { if (ui.tab !== 'orders' || !ui.orderCode) return; const st = await db.state(); const sig = JSON.stringify(st); if (sig !== lastSig) { lastSig = sig; S = st; render(); } }, 1500);

// service worker (offline shell) — registered only on https / localhost
if ('serviceWorker' in navigator && /^https:|localhost/.test(location.origin)) navigator.serviceWorker.register('./sw.js').catch(() => {});

(async function boot() {
  S = await db.state();
  if (!ui.branchId) ui.branchId = S.branches[0].id;
  render();
})();
