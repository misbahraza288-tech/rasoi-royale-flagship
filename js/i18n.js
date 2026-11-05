// Hinglish / English labels. Default: Hinglish (Misbah's preference for sample demos). Toggle on More.
const DICT = {
  hinglish: {
    sampleTag: 'Sample demo · Dhanbad', branch: 'Branch', navHome: 'Home', navMenu: 'Menu', navCart: 'Cart', navOrders: 'Orders', navMore: 'More',
    openNow: 'Abhi khula hai', closedNow: 'Abhi band hai', heroHead: 'Swaad jo royal lage', hours: 'Timing', samplePhotos: 'Sample photos — aapke asli photos se badlenge',
    quick: 'Quick actions', call: 'Call karein', route: 'Raasta', share: 'Share', lastTime: 'Pichli baar bhi yahi mangaya tha?', reorder: 'Dubara mangwayein',
    offers: 'Aaj ke offers', categories: 'Categories', copyCode: 'Code copy', askTitle: 'Sawaal puchein', askSub: 'Fixed jawab, AI nahi',
    menuTitle: 'Menu', search: 'Dish dhoondhein…', filters: 'Filter', all: 'Sab', veg: 'Veg', nonveg: 'Non-veg', favs: 'Favourites',
    noItems: 'Is filter mein kuch nahi mila.', bestseller: 'Bestseller', add: 'Add', cartEmpty: 'Cart khali hai', cartEmptySub: 'Menu se kuch chuniye.', goMenu: 'Menu dekhein',
    yourOrder: 'Aapka order', howGet: 'Kaise lenge?', delivery: 'Delivery', pickup: 'Pickup', dineIn: 'Table par', tableNo: 'Table number', address: 'Address',
    addrPh: 'Ghar / flat, landmark', name: 'Naam', phone: 'Mobile', couponPh: 'Coupon code', coupon: 'Coupon', apply: 'Apply', couponHint: 'Sample codes: ROYAL10, FIRST50, FREEDEL',
    subtotal: 'Subtotal', discount: 'Discount', deliveryFee: 'Delivery', free: 'Free', total: 'Total', payNote: 'Demo mode: koi real payment nahi hota. Counter par pay karein.',
    placeOrder: 'Order place karein', waOrder: 'WhatsApp pe order bhejein', clearCart: 'Cart khali karein', cancelled: 'Ye order cancel ho gaya.',
    mRecv: 'Order mil gaya, restaurant confirm kar raha hai.', mAcc: 'Restaurant ne order accept kar liya.', mCook: 'Aapka khana ban raha hai.',
    mReadyD: 'Khana ready hai, delivery partner ke liye.', mReadyP: 'Khana ready hai, counter par le lijiye.', mOut: 'Rasta mein hai.', mDone: 'Mil gaya. Mazaa lijiye!',
    helpMsg: 'mujhe madad chahiye', help: 'Madad', backOrders: 'Saare orders', noOrders: 'Abhi koi order nahi', noOrdersSub: 'Order karenge to yahan status dikhega.',
    saved: 'saved', language: 'Bhasha', aboutTitle: 'Ye kya hai?', aboutText: 'Ye Rasoi Royale ka sample order app hai: branch, menu, cart, order status aur WhatsApp order. Aapke restaurant ke naam, photos aur menu ke saath aisa hi ban sakta hai.',
    sampleNote: 'Sample brand, sample menu, sample prices, sample photos. Real payment, real server aur real ratings yahan nahi hain.',
    pickBranch: 'Branch chuniye', size: 'Size', addons: 'Extra', addFor: 'Add karein', assistNote: 'Ye rule-based assistant hai: kuch fixed jawab. AI nahi.',
    askPh: 'Sawaal likhiye…', send: 'Puchhein', close: 'Band karein', deliveryAns: 'Delivery is branch ke 4 km ke andar, ya jaise branch ka radius hai', freeAbove: 'par delivery free hai',
    minOrder: 'min', vegAns: 'Menu mein Veg / Non-veg ka filter upar hai. Har dish par veg ka nishan bhi hai.', trackAns: 'Orders tab mein aapke order ka live status dikhega (Naya, Accept, Ban raha hai, Ready, Rasta mein).',
    payAns: 'Demo mein real payment nahi hota. Counter par pay karein. Asli app mein UPI link yahan aayega.', billAns: 'Aapka total abhi', unknownAns: 'Ye sawaal mere paas fixed jawab mein nahi hai. WhatsApp par restaurant se poochh sakte hain.',
    linkCopied: 'Link copy ho gaya', noWa: 'WhatsApp number abhi set nahi hai (sample).', reorderDone: 'Cart mein daal diya.',
    needName: 'Naam likhiye', needPhone: 'Sahi mobile number likhiye', needAddr: 'Poora address likhiye', needTable: 'Table number likhiye', placed: 'Order mil gaya! Status dekhiye.', added: 'Cart mein daal diya', waHi: 'Namaste, order karna hai —',
  },
  english: {
    sampleTag: 'Sample demo · Dhanbad', branch: 'Branch', navHome: 'Home', navMenu: 'Menu', navCart: 'Cart', navOrders: 'Orders', navMore: 'More',
    openNow: 'Open now', closedNow: 'Closed now', heroHead: 'Royal taste, every day', hours: 'Hours', samplePhotos: 'Sample photos — will be replaced with your own',
    quick: 'Quick actions', call: 'Call', route: 'Directions', share: 'Share', lastTime: 'Order your last meal again?', reorder: 'Reorder',
    offers: 'Today’s offers', categories: 'Categories', copyCode: 'Copy code', askTitle: 'Ask a question', askSub: 'Fixed answers, not AI',
    menuTitle: 'Menu', search: 'Search dishes…', filters: 'Filter', all: 'All', veg: 'Veg', nonveg: 'Non-veg', favs: 'Favourites',
    noItems: 'Nothing matches this filter.', bestseller: 'Bestseller', add: 'Add', cartEmpty: 'Your cart is empty', cartEmptySub: 'Pick something from the menu.', goMenu: 'See menu',
    yourOrder: 'Your order', howGet: 'How will you get it?', delivery: 'Delivery', pickup: 'Pickup', dineIn: 'Dine-in', tableNo: 'Table number', address: 'Address',
    addrPh: 'House / flat, landmark', name: 'Name', phone: 'Mobile', couponPh: 'Coupon code', coupon: 'Coupon', apply: 'Apply', couponHint: 'Sample codes: ROYAL10, FIRST50, FREEDEL',
    subtotal: 'Subtotal', discount: 'Discount', deliveryFee: 'Delivery', free: 'Free', total: 'Total', payNote: 'Demo mode: no real payment. Pay at the counter.',
    placeOrder: 'Place order', waOrder: 'Send order on WhatsApp', clearCart: 'Clear cart', cancelled: 'This order was cancelled.',
    mRecv: 'Order received, the restaurant is confirming.', mAcc: 'The restaurant accepted your order.', mCook: 'Your food is being cooked.',
    mReadyD: 'Ready, waiting for the delivery partner.', mReadyP: 'Ready, please collect at the counter.', mOut: 'On the way.', mDone: 'Delivered. Enjoy!',
    helpMsg: 'I need help', help: 'Help', backOrders: 'All orders', noOrders: 'No orders yet', noOrdersSub: 'Your order status will show here.',
    saved: 'saved', language: 'Language', aboutTitle: 'What is this?', aboutText: 'A sample ordering app: branch, menu, cart, live order status and WhatsApp ordering. It can be built the same way with your name, photos and menu.',
    sampleNote: 'Sample brand, sample menu, sample prices, sample photos. No real payments, no live server, no real ratings here.',
    pickBranch: 'Pick a branch', size: 'Size', addons: 'Extras', addFor: 'Add for', assistNote: 'This is a rule-based assistant with fixed answers. Not AI.',
    askPh: 'Type a question…', send: 'Ask', close: 'Close', deliveryAns: 'Delivery within this branch’s radius', freeAbove: 'delivery is free',
    minOrder: 'min', vegAns: 'Use the Veg / Non-veg filter on the menu. Each dish shows its veg mark.', trackAns: 'The Orders tab shows live status (Received, Accepted, Cooking, Ready, On the way).',
    payAns: 'Demo mode has no real payment. Pay at the counter. A real app would show a UPI link here.', billAns: 'Your total right now is', unknownAns: 'I don’t have a fixed answer for that. Please ask the restaurant on WhatsApp.',
    linkCopied: 'Link copied', noWa: 'WhatsApp number not set yet (sample).', reorderDone: 'Added to cart.',
    needName: 'Please enter your name', needPhone: 'Please enter a valid mobile number', needAddr: 'Please enter a full address', needTable: 'Please enter a table number', placed: 'Order received! See its status.', added: 'Added to cart', waHi: 'Hello, I want to order —',
  },
};
let lang = (() => { try { return localStorage.getItem('rr_lang') || 'hinglish'; } catch { return 'hinglish'; } })();
export const getLang = () => lang;
export function setLang(l) { lang = DICT[l] ? l : 'hinglish'; try { localStorage.setItem('rr_lang', lang); } catch {} }
export function T(k) { return (DICT[lang] && DICT[lang][k]) || (DICT.english[k]) || k; }
export { DICT };
