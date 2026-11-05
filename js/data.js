// =====================================================================
//  Rasoi Royale (Sample) — seed data. FICTIONAL sample brand.
//  Menu names, prices, hours, offers and staff here are SAMPLE values.
//  Phone numbers / UPI IDs below are placeholders (reserved 9000000000 range), not real.
//  To rebrand for a client: edit BRAND, BRANCHES, CATEGORIES, ITEMS, OFFERS, then see docs/TEMPLATE.md.
// =====================================================================
export const BRAND = {
  name: 'Rasoi Royale',
  tag: 'Swaad ka royal safar',
  sampleName: 'Rasoi Royale (Sample)',
  city: 'Dhanbad',
  logoLetter: 'R',
  gstPct: 5,
  deliveryFee: 30,
  freeDeliveryAbove: 499,
  loyaltyPerRupees: 10,      // 1 point per Rs 10 (sample)
  currency: '₹',
};

export const BRANCHES = [
  { id: 'br-bankmore', name: 'Bank More', area: 'Bank More, Dhanbad (sample)', phone: '+91 90000 00001', radiusKm: 4, open: '11:00', close: '23:30', manualOpen: true, mapQuery: 'Bank More Dhanbad' },
  { id: 'br-govindpur', name: 'Govindpur', area: 'Govindpur Road, Dhanbad (sample)', phone: '+91 90000 00002', radiusKm: 5, open: '11:00', close: '23:00', manualOpen: true, mapQuery: 'Govindpur Dhanbad' },
  { id: 'br-saraidhela', name: 'Saraidhela', area: 'Saraidhela, Dhanbad (sample)', phone: '+91 90000 00003', radiusKm: 3, open: '10:30', close: '22:30', manualOpen: true, mapQuery: 'Saraidhela Dhanbad' },
];

export const CATEGORIES = [
  { id: 'biryani', name: 'Biryani', hi: 'Biryani', img: 'chicken-biryani' },
  { id: 'kebab', name: 'Kebab & Tikka', hi: 'Kebab aur Tikka', img: 'chicken-tikka' },
  { id: 'curry', name: 'Curries & Thali', hi: 'Sabzi aur Thali', img: 'butter-chicken' },
  { id: 'breads', name: 'Breads', hi: 'Roti aur Naan', img: 'butter-naan' },
  { id: 'chinese', name: 'Chinese & Momos', hi: 'Chinese aur Momos', img: 'veg-momos' },
  { id: 'rolls', name: 'Rolls & Burgers', hi: 'Roll aur Burger', img: 'chicken-roll' },
  { id: 'pizza', name: 'Pizza & Pasta', hi: 'Pizza aur Pasta', img: 'pizza' },
  { id: 'snacks', name: 'Chaat & Snacks', hi: 'Chaat aur Snacks', img: 'pani-puri' },
  { id: 'drinks', name: 'Chai, Coffee & Shakes', hi: 'Chai, Coffee aur Shake', img: 'masala-chai' },
  { id: 'desserts', name: 'Mithai & Desserts', hi: 'Mithai aur Dessert', img: 'gulab-jamun' },
];

// veg: true = veg. price in rupees (SAMPLE). sizes: optional [{label, add}]. addons: optional [{name, price}]
export const ITEMS = [
  { id: 'i-chk-biryani', cat: 'biryani', name: 'Chicken Dum Biryani', hi: 'Chicken Dum Biryani', desc: 'Basmati, dum-cooked in a copper handi, raita aur salan ke saath', veg: false, price: 279, img: 'chicken-biryani', best: true, sizes: [{ label: 'Regular', add: 0 }, { label: 'Family (2 log)', add: 180 }], addons: [{ name: 'Extra raita', price: 30 }, { name: 'Extra salan', price: 40 }, { name: 'Boiled egg', price: 25 }] },
  { id: 'i-mut-biryani', cat: 'biryani', name: 'Mutton Dum Biryani', hi: 'Mutton Dum Biryani', desc: 'Slow-cooked mutton, kesar aur whole spices', veg: false, price: 349, img: 'mutton-biryani', sizes: [{ label: 'Regular', add: 0 }, { label: 'Family (2 log)', add: 220 }] },
  { id: 'i-veg-biryani', cat: 'biryani', name: 'Paneer Veg Biryani', hi: 'Paneer Veg Biryani', desc: 'Paneer, seasonal veg, saffron rice', veg: true, price: 239, img: 'paneer-tikka', addons: [{ name: 'Extra raita', price: 30 }] },
  { id: 'i-paneer-tikka', cat: 'kebab', name: 'Paneer Tikka Sizzler', hi: 'Paneer Tikka Sizzler', desc: 'Tandoor mein bhuna paneer, pyaaz aur capsicum ke saath', veg: true, price: 259, img: 'paneer-tikka', best: true },
  { id: 'i-chk-tikka', cat: 'kebab', name: 'Chicken Tikka Platter', hi: 'Chicken Tikka Platter', desc: 'Half plate: tikka, pyaaz, pudina chutney', veg: false, price: 299, img: 'chicken-tikka', sizes: [{ label: 'Half', add: 0 }, { label: 'Full', add: 150 }] },
  { id: 'i-seekh', cat: 'kebab', name: 'Seekh Kebab (4 pcs)', hi: 'Seekh Kebab (4 pcs)', desc: 'Mutton seekh, laccha pyaaz aur green chutney', veg: false, price: 219, img: 'seekh-kebab' },
  { id: 'i-butter-chk', cat: 'curry', name: 'Butter Chicken', hi: 'Butter Chicken', desc: 'Makhni gravy, tandoori chicken, naan ke saath', veg: false, price: 319, img: 'butter-chicken', best: true, addons: [{ name: 'Butter naan', price: 45 }, { name: 'Extra gravy', price: 60 }] },
  { id: 'i-paneer-masala', cat: 'curry', name: 'Paneer Butter Masala', hi: 'Paneer Butter Masala', desc: 'Kaju aur tomato gravy, malai ke saath', veg: true, price: 269, img: 'paneer-butter-masala', addons: [{ name: 'Butter naan', price: 45 }] },
  { id: 'i-dal', cat: 'curry', name: 'Dal Makhani', hi: 'Dal Makhani', desc: 'Dheemi aanch par raat bhar pakti, cream ke saath', veg: true, price: 219, img: 'dal-makhani' },
  { id: 'i-thali', cat: 'curry', name: 'Royal Veg Thali', hi: 'Royal Veg Thali', desc: 'Dal, sabzi, paneer, raita, roti, rice, mithai', veg: true, price: 329, img: 'veg-thali', best: true },
  { id: 'i-naan', cat: 'breads', name: 'Butter Naan', hi: 'Butter Naan', desc: 'Tandoor se seedha, makhan ke saath', veg: true, price: 49, img: 'butter-naan', sizes: [{ label: 'Single', add: 0 }, { label: '2 pcs', add: 45 }] },
  { id: 'i-roti', cat: 'breads', name: 'Tandoori Roti', hi: 'Tandoori Roti', desc: 'Atta, tandoor ki aanch', veg: true, price: 19, img: 'tandoori-roti' },
  { id: 'i-chole', cat: 'breads', name: 'Chole Bhature (2 pcs)', hi: 'Chole Bhature (2 pcs)', desc: 'Pindi chole, bhature, pyaaz, achaar', veg: true, price: 179, img: 'chole-bhature' },
  { id: 'i-veg-momo', cat: 'chinese', name: 'Veg Steamed Momos (8)', hi: 'Veg Steamed Momos (8)', desc: 'Steamed, red chutney ke saath', veg: true, price: 129, img: 'veg-momos', best: true, sizes: [{ label: 'Half (4)', add: -65 }, { label: 'Full (8)', add: 0 }] },
  { id: 'i-chk-momo', cat: 'chinese', name: 'Chicken Momos (8)', hi: 'Chicken Momos (8)', desc: 'Steamed ya fried, chutney ke saath', veg: false, price: 159, img: 'chicken-momos', addons: [{ name: 'Fried', price: 20 }] },
  { id: 'i-hakka', cat: 'chinese', name: 'Hakka Noodles', hi: 'Hakka Noodles', desc: 'Veg ya chicken, spring onion aur soy', veg: true, price: 169, img: 'hakka-noodles', addons: [{ name: 'Chicken', price: 60 }] },
  { id: 'i-manchurian', cat: 'chinese', name: 'Veg Manchurian (dry)', hi: 'Veg Manchurian (dry)', desc: 'Gravy ya dry', veg: true, price: 179, img: 'manchurian' },
  { id: 'i-spring', cat: 'chinese', name: 'Veg Spring Roll (4)', hi: 'Veg Spring Roll (4)', desc: 'Crispy, sweet chilli ke saath', veg: true, price: 119, img: 'spring-roll' },
  { id: 'i-kathi', cat: 'rolls', name: 'Chicken Kathi Roll', hi: 'Chicken Kathi Roll', desc: 'Paratha roll, egg aur pyaaz, sauce ke saath', veg: false, price: 159, img: 'chicken-roll', best: true },
  { id: 'i-veg-sand', cat: 'rolls', name: 'Grilled Veg Sandwich', hi: 'Grilled Veg Sandwich', desc: 'Cheese aur chutney, toast kiya hua', veg: true, price: 119, img: 'veg-sandwich' },
  { id: 'i-burger', cat: 'rolls', name: 'Cheese Burger', hi: 'Cheese Burger', desc: 'Chicken ya veg patty, cheese, lettuce', veg: false, price: 169, img: 'cheese-burger', addons: [{ name: 'Fries', price: 79 }] },
  { id: 'i-pizza', cat: 'pizza', name: 'Classic Cheese Pizza (medium)', hi: 'Classic Cheese Pizza (medium)', desc: 'Mozzarella, tomato, oregano', veg: true, price: 259, img: 'pizza', sizes: [{ label: 'Medium', add: 0 }, { label: 'Large', add: 150 }] },
  { id: 'i-pasta', cat: 'pizza', name: 'White Sauce Pasta', hi: 'White Sauce Pasta', desc: 'Creamy alfredo, garlic bread ke saath', veg: true, price: 229, img: 'pasta-alfredo' },
  { id: 'i-fries', cat: 'snacks', name: 'Peri Peri Fries', hi: 'Peri Peri Fries', desc: 'Crispy, masala aur mayo', veg: true, price: 119, img: 'fries' },
  { id: 'i-samosa', cat: 'snacks', name: 'Samosa Chaat (2 pcs)', hi: 'Samosa Chaat (2 pcs)', desc: 'Dahi, chutney, sev', veg: true, price: 79, img: 'samosa' },
  { id: 'i-panipuri', cat: 'snacks', name: 'Pani Puri (6)', hi: 'Pani Puri (6)', desc: 'Khatta pani, meetha chutney', veg: true, price: 69, img: 'pani-puri' },
  { id: 'i-chai', cat: 'drinks', name: 'Masala Chai', hi: 'Masala Chai', desc: 'Adrak aur elaichi wali', veg: true, price: 39, img: 'masala-chai' },
  { id: 'i-coffee', cat: 'drinks', name: 'Cold Coffee', hi: 'Cold Coffee', desc: 'Cream ke saath', veg: true, price: 129, img: 'cold-coffee' },
  { id: 'i-mango', cat: 'drinks', name: 'Mango Shake', hi: 'Mango Shake', desc: 'Alphonso-style pulp, chilled', veg: true, price: 139, img: 'mango-shake' },
  { id: 'i-juice', cat: 'drinks', name: 'Fresh Seasonal Juice', hi: 'Fresh Seasonal Juice', desc: 'Mausam ke hisaab se', veg: true, price: 99, img: 'fresh-juice' },
  { id: 'i-gulab', cat: 'desserts', name: 'Gulab Jamun (2 pcs)', hi: 'Gulab Jamun (2 pcs)', desc: 'Garam, rabdi ke saath', veg: true, price: 79, img: 'gulab-jamun' },
  { id: 'i-rasmalai', cat: 'desserts', name: 'Rasmalai (2 pcs)', hi: 'Rasmalai (2 pcs)', desc: 'Kesar, pista', veg: true, price: 109, img: 'rasmalai' },
  { id: 'i-cake', cat: 'desserts', name: 'Chocolate Truffle Slice', hi: 'Chocolate Truffle Slice', desc: 'Bakery se roz ka', veg: true, price: 119, img: 'chocolate-cake' },
  { id: 'i-mithai', cat: 'desserts', name: 'Mithai Box (500 g)', hi: 'Mithai Box (500 g)', desc: 'Assorted, gift pack available', veg: true, price: 449, img: 'mithai-box' },
];

export const OFFERS = [
  { id: 'of-1', title: 'Lunch combo: Biryani + Cold Drink', sub: 'Dopahar 12–3 baje (sample offer)', tag: 'SAMPLE', coupon: 'ROYAL10', color: '#f6e7e4' },
  { id: 'of-2', title: 'Pehla order par ₹50 off', sub: 'Minimum ₹299 ka order (sample)', tag: 'SAMPLE', coupon: 'FIRST50', color: '#f5efdc' },
  { id: 'of-3', title: 'Free delivery ₹499 se upar', sub: 'Sirf delivery order par (sample)', tag: 'SAMPLE', coupon: 'FREEDEL', color: '#e8f0ea' },
];

// Coupons: type 'pct' (percent off, capped) or 'flat' (rupees off) with minimum subtotal
export const COUPONS = [
  { code: 'ROYAL10', type: 'pct', value: 10, cap: 150, min: 299, label: '10% off (max ₹150)' },
  { code: 'FIRST50', type: 'flat', value: 50, cap: 50, min: 299, label: '₹50 off' },
  { code: 'FREEDEL', type: 'delivery', value: 0, cap: 0, min: 499, label: 'Free delivery' },
];

export const STAFF = [
  { id: 'st-1', name: 'Owner (sample)', role: 'owner', phone: '+91 90000 00010' },
  { id: 'st-2', name: 'Store manager (sample)', role: 'manager', phone: '+91 90000 00011' },
  { id: 'st-3', name: 'Cashier (sample)', role: 'cashier', phone: '+91 90000 00012' },
  { id: 'st-4', name: 'Kitchen (sample)', role: 'kitchen', phone: '+91 90000 00013' },
];

export const ROLE_PERMS = {
  owner: ['dashboard', 'orders', 'kitchen', 'menu', 'offers', 'branches', 'staff', 'customers', 'reports', 'qr', 'integrations', 'settings'],
  manager: ['dashboard', 'orders', 'kitchen', 'menu', 'offers', 'branches', 'customers', 'reports', 'qr'],
  cashier: ['dashboard', 'orders', 'qr'],
  kitchen: ['kitchen', 'orders'],
};

export const STATUSES = ['received', 'accepted', 'cooking', 'ready', 'out', 'delivered', 'cancelled'];
export const STATUS_LABEL = {
  received: 'Naya order', accepted: 'Accept hua', cooking: 'Ban raha hai', ready: 'Ready hai',
  out: 'Rasta mein', delivered: 'Mil gaya / khatam', cancelled: 'Cancel',
};

export const DEFAULT_INTEGRATIONS = {
  whatsapp: '',          // WhatsApp business number, digits with country code, e.g. 919000000000 (placeholder)
  mapsLink: '',
  zomato: '', swiggy: '', dunzo: '',
  upiId: '',             // payment UPI ID (sample: none set)
  sheetWebhook: '',      // Google Apps Script / Sheet webhook URL — orders POSTed here
  posWebhook: '',        // POS / billing software webhook URL
  instagram: '', facebook: '',
};

export const SEED = () => ({
  v: 1,
  brand: { ...BRAND },
  branches: structuredClone(BRANCHES),
  categories: structuredClone(CATEGORIES),
  items: structuredClone(ITEMS),
  offers: structuredClone(OFFERS),
  coupons: structuredClone(COUPONS),
  staff: structuredClone(STAFF),
  settings: { adminPin: '4321', lang: 'hinglish', sound: true, gstPct: 5, deliveryFee: 30, orderCounter: 1040, demoBanner: true },
  integrations: { ...DEFAULT_INTEGRATIONS },
  orders: [],
  favs: [],
  lastOrder: null,
});
