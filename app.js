(function () {
  'use strict';
  var CFG = window.APP_CONFIG || {};
  var params = new URLSearchParams(location.search);
  var MOCK = params.get('mock') === '1';
  var OA_URL = 'https://lin.ee/XYolAcG';
  var OA_ID = '@841hdioo';
  var OA_QR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" role="img" aria-label="QR code เพิ่มเพื่อน PRE2PET"><path fill="#fff" d="M0 0h33v33h-33z"/><path class="qrline" stroke="#000" d="M2 2.5h7m1 0h1m3 0h4m2 0h1m1 0h1m1 0h7m-29 1h1m5 0h1m2 0h2m4 0h1m1 0h2m3 0h1m5 0h1m-29 1h1m1 0h3m1 0h1m1 0h2m2 0h2m3 0h1m1 0h2m1 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m8 0h1m1 0h1m2 0h1m1 0h1m1 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m2 0h1m5 0h4m3 0h1m1 0h3m1 0h1m-29 1h1m5 0h1m1 0h2m2 0h3m3 0h1m1 0h1m1 0h1m5 0h1m-29 1h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7m-19 1h1m1 0h2m4 0h3m-21 1h1m1 0h1m3 0h2m1 0h2m2 0h1m1 0h2m1 0h1m1 0h1m2 0h1m2 0h1m1 0h1m-27 1h3m4 0h2m1 0h1m5 0h2m2 0h1m4 0h2m-29 1h3m1 0h6m3 0h3m1 0h1m1 0h1m4 0h3m1 0h1m-29 1h2m2 0h1m2 0h1m1 0h4m1 0h3m5 0h2m1 0h1m-21 1h5m1 0h1m1 0h2m1 0h1m1 0h1m1 0h1m1 0h2m4 0h1m-29 1h1m1 0h1m6 0h8m1 0h3m1 0h2m3 0h2m-28 1h2m2 0h2m4 0h1m3 0h1m1 0h4m2 0h1m4 0h1m-29 1h3m1 0h2m2 0h1m1 0h2m1 0h1m1 0h2m3 0h2m1 0h2m-24 1h1m1 0h1m2 0h1m2 0h2m2 0h1m2 0h1m1 0h2m2 0h2m4 0h1m-28 1h2m4 0h4m1 0h1m2 0h6m1 0h2m2 0h3m-29 1h3m2 0h2m5 0h4m1 0h3m2 0h1m1 0h2m2 0h1m-26 1h3m4 0h2m2 0h1m4 0h3m2 0h1m-25 1h2m1 0h2m1 0h1m2 0h2m1 0h3m1 0h1m1 0h1m1 0h6m1 0h1m-20 1h9m1 0h1m1 0h1m3 0h3m1 0h1m-29 1h7m1 0h1m1 0h1m4 0h3m2 0h1m1 0h1m1 0h1m3 0h1m-29 1h1m5 0h1m2 0h2m1 0h2m2 0h1m3 0h1m3 0h1m3 0h1m-29 1h1m1 0h3m1 0h1m2 0h2m1 0h2m1 0h2m1 0h8m1 0h2m-29 1h1m1 0h3m1 0h1m2 0h1m1 0h3m1 0h2m1 0h1m1 0h1m3 0h3m1 0h1m-29 1h1m1 0h3m1 0h1m1 0h1m3 0h1m2 0h7m2 0h1m2 0h2m-29 1h1m5 0h1m2 0h1m2 0h1m1 0h1m3 0h2m1 0h2m2 0h1m-26 1h7m1 0h2m6 0h1m3 0h1m4 0h1m2 0h1"/></svg>';
  var MAX_QTY = 99;
  var app = document.getElementById('app');
  var memberEl = document.getElementById('member');

  var S = {
    screen: 'loading', products: [], memberCode: '', qty: {}, friend: true, friendUnknown: false, lineName: '',
    busy: false, sheet: '', open: {}, cat: {}, openMy: {}, myTab: '', myMore: false, pending: { count: 0, totalSatang: 0 }, payDetail: {}, slipBusy: '', slipErr: {}, confirmCancel: '', edit: null, refreshing: false, notice: '', error: '', fieldErrors: {}, form: { recipientName: '', phone: '', address: '', oldCode: '' },
    requestId: null, requestKey: '', receipt: null, my: null,
  };

  // ---------- ตัวช่วย ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function baht(satang) {
    var s = formatSatang(satang);
    return '฿' + (s.slice(-3) === '.00' ? s.slice(0, -3) : s);
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function closeText(iso) {
    return new Date(iso).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' น.';
  }
  function qtyKey(productId, option) { return productId + '\u0001' + option; }
  function productsById() {
    var m = new Map();
    S.products.forEach(function (p) { m.set(p.productId, p); });
    return m;
  }
  function cartLines() {
    var out = [];
    S.products.forEach(function (p) {
      var opts = p.options.length ? p.options : [''];
      opts.forEach(function (o) {
        var q = S.qty[qtyKey(p.productId, o)] || 0;
        if (q > 0) out.push({ productId: p.productId, option: o, qty: q });
      });
    });
    return out;
  }

  // ---------- LIFF / API (มีโหมดจำลอง ?mock=1) ----------
  var L = window.liff;
  var mockDb = { registered: params.get('registered') === '1', orders: [], member: 'P2P-N00000', slip: {} };
  if (params.get('seed') === '1') mockDb.orders = [{ productId: '090426-P01', option: 'ฟ้า', qty: 10, status: 'รับออเดอร์', at: new Date().toISOString() }, { productId: '090426-P02', option: '', qty: 1, status: 'รับออเดอร์', at: new Date().toISOString() }, { productId: '090426-P01', option: 'เทา', qty: 1, status: 'รับออเดอร์', at: new Date().toISOString() }];
  if (MOCK) {
    L = {
      init: function () { return Promise.resolve(); }, isLoggedIn: function () { return true; }, login: function () {},
      getAccessToken: function () { return 'mock-token'; },
      isInClient: function () { return params.get('noshare') !== '1'; }, isApiAvailable: function () { return true; },
      shareTargetPicker: function (m) { console.log('shareTargetPicker', JSON.stringify(m)); window.__shared = m; return Promise.resolve({ status: 'success' }); },
      getProfile: function () { return Promise.resolve({ displayName: 'ลูกค้าทดสอบ' }); },
      getFriendship: function () { return params.get('friend') === '0' ? Promise.resolve({ friendFlag: false }) : params.get('friend') === 'err' ? Promise.reject(new Error('x')) : Promise.resolve({ friendFlag: true }); },
    };
  }
  function mockApi(p) {
    var closeAt = new Date(Date.now() + 5 * 86400000).toISOString();
    var products = params.get('empty') === '1' ? [] : [
      { productId: '090426-P01', preorderCode: '090426', name: 'ที่นอนแมวทรงโดนัท', priceThb: 66, options: ['ฟ้า', 'ชมพู', 'เทา'], closeAt: closeAt, imageUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#9ad1cc"/><text x="300" y="210" font-size="40" text-anchor="middle" fill="#134">รูปสินค้าตัวอย่าง</text></svg>') },
      { productId: '090426-P02', preorderCode: '090426', name: 'ของเล่นกระดิ่งปลาทูน่า', priceThb: 58, options: [], closeAt: closeAt, imageUrl: 'https://invalid.invalid/x.jpg' },
      { productId: '311226-P01', preorderCode: '311226-2', name: 'สินค้ารอบ 2', priceThb: 100, options: [], closeAt: closeAt },
      { productId: '311226-P00', preorderCode: '311226-1', name: 'สินค้ารอบ 1', priceThb: 90, options: [], closeAt: closeAt },
      { productId: '011126-P01', preorderCode: '011126', name: 'ปิดก่อน', priceThb: 50, options: [], closeAt: new Date(Date.now() + 2 * 86400000).toISOString() },
    ];
    if (params.get('desc') && products[0]) products[0].description = 'ผ้านุ่มหนา ซักเครื่องได้\nขนาด 60 × 45 ซม. เหมาะกับแมวน้ำหนักไม่เกิน 6 กก.\nสีอาจต่างจากภาพเล็กน้อย';
    if (params.get('optimg') && products[0]) products[0].optionImages = [products[0].imageUrl, '', products[0].imageUrl];
    var res;
    products.forEach(function (x) { x.category = /นอน/.test(x.name) ? 'ที่นอน' : /ของเล่น/.test(x.name) ? 'ของเล่น' : 'อาหาร'; });
    if (p.action === 'bootstrap') res = { ok: true, registered: mockDb.registered, memberCode: mockDb.registered ? mockDb.member : undefined, products: products, pendingPay: params.get('pay') === '1' ? { count: 2, totalSatang: 83000 } : { count: 0, totalSatang: 0 } };
    else if (p.action === 'register') { mockDb.registered = true; res = { ok: true, memberCode: mockDb.member }; }
    else if (p.action === 'placeOrder') {
      if (params.get('fail') === '1') { params.delete('fail'); res = { ok: false, error: 'server_error', message: 'x' }; }
      else { mockDb.orders = mockDb.orders.concat(p.lines.map(function (l) { return { productId: l.productId, option: l.option, qty: l.qty, status: 'รับออเดอร์', at: new Date().toISOString() }; })); res = { ok: true, goodsTotalSatang: p.lines.reduce(function (s, l) { var pr = products.filter(function (x) { return x.productId === l.productId; })[0]; return s + pr.priceThb * l.qty * 100; }, 0) }; }
    } else if (p.action === 'myOrders') {
      res = { ok: true, orders: mockDb.orders.map(function (l) { return { preorderCode: '090426', productId: l.productId, productName: l.productId === '090426-P01' ? 'ที่นอนแมวทรงโดนัท' : 'ของเล่นกระดิ่งปลาทูน่า', option: l.option, qty: l.qty, status: l.status || 'รับออเดอร์', priceThb: l.productId === '090426-P01' ? 66 : 58, imageUrl: l.productId === '090426-P01' && products[0] ? products[0].imageUrl : '', at: l.at || null, canCancel: (l.status || 'รับออเดอร์') === 'รับออเดอร์' }; }),
        billing: [{ preorderCode: '090426', orderNo: '090426-012', round1: { totalSatang: 14400, paid: false, slipAt: mockDb.slip[1] || null }, round2: null }], paymentInfo: 'ธนาคารตัวอย่าง\nเลขที่บัญชี 123-4-56789-0\nชื่อบัญชี ทดสอบ' };
      if (params.get('nobill')) res.billing = [];
      if (params.get('refund')) {
        res.billing[0].round1 = { totalSatang: 54000, paid: true, slipAt: null };
        res.orders.push({ preorderCode: '090426', productId: 'x1', productName: 'ที่นอนแมวทรงโดนัท', option: 'ฟ้า', qty: 2, status: 'คืนเงิน', priceThb: 66, at: '2026-10-25T01:00:00Z', canCancel: false },
          { preorderCode: '090426', productId: 'x2', productName: 'อาหารแมว', option: 'ไก่', qty: 1, status: 'คืนเงิน', priceThb: 55, at: '2026-10-25T01:00:00Z', canCancel: false },
          { preorderCode: '090426', productId: 'x3', productName: 'ที่นอนแมวทรงโดนัท', option: 'ชมพู', qty: 3, status: 'ยกเลิก', priceThb: 66, at: '2026-10-25T01:00:00Z', canCancel: false });
        res.billing[0].refund = params.get('refund') === 'paid' ? { paid: true, amountSatang: 18700, at: '2026-10-26T03:00:00Z' } : { paid: false, amountSatang: 18700, at: null };
      }
      res.orders.forEach(function (o) { if (!o.imageUrl && String(o.productName).indexOf('นอน') >= 0 && products[0]) o.imageUrl = products[0].imageUrl; });
    } else if (p.action === 'uploadSlip') {
      if (params.get('slipfail') === '1') res = { ok: false, error: 'server_error', message: 'x' };
      else { mockDb.slip[p.round] = new Date().toISOString(); res = { ok: true, slipAt: mockDb.slip[p.round] }; }
    } else if (p.action === 'cancelOrder') {
      var n = 0;
      mockDb.orders.forEach(function (l) { if (l.productId === p.productId && l.option === p.option && (l.status || 'รับออเดอร์') === 'รับออเดอร์') { l.status = 'ยกเลิก'; n++; } });
      res = { ok: true, cancelled: n };
    } else if (p.action === 'reduceOrder') {
      var lines = mockDb.orders.filter(function (l) { return l.productId === p.productId && l.option === p.option && (l.status || 'รับออเดอร์') === 'รับออเดอร์'; });
      var cur = lines.reduce(function (n, l) { return n + l.qty; }, 0), left = Math.max(0, cur - p.qty);
      for (var i = lines.length - 1; i >= 0 && left > 0; i--) { if (lines[i].qty <= left) { left -= lines[i].qty; lines[i].status = 'ยกเลิก'; } else { lines[i].qty -= left; left = 0; } }
      res = { ok: true, removed: Math.max(0, cur - p.qty), qty: Math.min(cur, p.qty) };
    } else res = { ok: false, error: 'bad_request', message: 'x' };
    return new Promise(function (r) { setTimeout(function () { r(res); }, params.get('slow') ? 1800 : 150); });
  }
  function api(action, body) {
    var payload = Object.assign({ action: action, accessToken: L.getAccessToken() }, body || {});
    var req = MOCK ? mockApi(payload) : fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) }).then(function (r) { return r.json(); });
    return req.then(function (res) {
      if (res && res.error === 'invalid_token' && !MOCK) { L.login(); return new Promise(function () {}); }
      return res;
    });
  }

  // ---------- หน้าจอ ----------
  function setScreen(name) { S.screen = name; S.error = ''; S.notice = ''; render(); window.scrollTo(0, 0); }

  function render() {
    document.body.setAttribute('data-screen', S.screen);
    memberEl.hidden = !S.memberCode;
    memberEl.textContent = S.memberCode;
    if (S.screen !== 'order' && S.sheet) closeSheet();
    var fn = SCREENS[S.screen] || SCREENS.error;
    app.innerHTML = fn();
    if (S.screen === 'order' || S.screen === 'my') app.insertAdjacentHTML('beforeend', tabbarHtml(S.screen));
    document.body.classList.remove('st-on');
    var hd = document.querySelector('header.top'); if (hd) document.documentElement.style.setProperty('--hdr-h', hd.offsetHeight + 'px');
    if (S.screen === 'order') { var sm = app.querySelector('.group > summary'); if (sm) document.documentElement.style.setProperty('--sum-h', sm.offsetHeight + 'px'); }
    var at = app.querySelector('.tab.active'), tb = app.querySelector('.tabs');
    if (at && tb) tb.scrollLeft = at.offsetLeft - (tb.clientWidth - at.offsetWidth) / 2;
  }

  function errBanner() {
    return S.error ? '<div class="notice bad" role="alert">' + esc(S.error) + '</div>' : '';
  }

  function adminBtn() {
    // ใช้ลิงก์ <a> ธรรมดา (LINE รับลิงก์ line.me/R/... จากการกดของผู้ใช้โดยตรง) เปิดแชทร้านโดยไม่มีข้อความให้
    return '<a class="btn block admin-btn" href="' + esc(adminChatUrl(OA_ID)) + '">' + CHAT_ICON + '<span>ติดต่อแอดมิน</span></a>';
  }
  var RECEIPT_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 4h14a2 2 0 0 1 2 2v21l-3-2-3 2-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2zM12 11h8M12 16h8M12 21h4"/></svg>';
  function myOrdersBtn() {
    return '<button type="button" class="btn block my-btn" data-act="my">' + RECEIPT_ICON + '<span>ดูออเดอร์ของฉัน</span></button>';
  }
  // แถบยอดค้างชำระบนหน้าสั่งของ: ใช้ข้อมูลจากหน้า "ออเดอร์ของฉัน" ถ้าโหลดไว้แล้ว (ล่าสุดกว่า) ไม่งั้นใช้ค่าจากตอนเปิดหน้า
  function payBanner() {
    var p = S.my && S.my.billing ? pendingPayment(S.my.billing) : S.pending;
    if (!p || !p.count) return '';
    return '<div class="paybanner" role="status"><div class="pb-card"><div class="pb-txt"><strong>มียอดค้างชำระ ' + baht(p.totalSatang) + '</strong><span>' + p.count + ' รายการ · โอนแล้วแนบสลิปได้ในหน้าออเดอร์ของฉัน</span></div>' +
      '<button type="button" class="btn pb-btn" data-act="my">ดูและชำระ</button></div></div>';
  }
  var REFRESH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"/></svg>';
  function refreshBtn(act, busy) {
    return '<button type="button" class="refresh ic' + (busy ? ' spin' : '') + '" data-act="' + act + '" aria-label="รีเฟรช"' + (busy ? ' disabled' : '') + '>' + REFRESH_ICON + '</button>';
  }
  var CHAT_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 6h22a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H15l-6 5v-5H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM10 13h12M10 18h7"/></svg>';

  // แถบกรองหมวดในแต่ละ Lot: แสดงเมื่อ Lot นั้นมีมากกว่า 1 หมวด (สินค้าที่ไม่ระบุหมวดนับเป็น "อื่น ๆ")
  function lotCategories(g) {
    var seen = [];
    g.items.forEach(function (p) { var c = p.category || 'อื่น ๆ'; if (seen.indexOf(c) < 0) seen.push(c); });
    return seen;
  }
  function catBar(g) {
    var cats = lotCategories(g);
    if (cats.length < 2) return '';
    var cur = S.cat[g.code] || '';
    var chip = function (val, label) { return '<button type="button" class="chip' + (cur === val ? ' active' : '') + '" data-act="cat" data-code="' + esc(g.code) + '" data-cat="' + esc(val) + '">' + esc(label) + '</button>'; };
    return '<div class="catbar" role="group" aria-label="กรองหมวดสินค้า">' + chip('', 'ทั้งหมด') + cats.map(function (c) { return chip(c, c); }).join('') + '</div>';
  }


  // ---------- การ์ดสินค้า / แผ่นรายละเอียด / ตราเหลือเวลา ----------
  var CLOCK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var BAG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8zM9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  // ตราเหลือเวลา แสดงเฉพาะ Lot ที่ใกล้ปิดรับ (ไม่เกิน 2 วัน): 24 ชม. ขึ้นไปนับเป็นวัน (ปัดลง) ต่ำกว่านั้นนับเป็นชั่วโมง (ปัดขึ้น)
  // ---------- แชร์สินค้า / Lot เข้ากลุ่ม (LINE share target picker) ----------
  var SHARE_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>';
  function canShare() {
    try { return !!(L.isInClient && L.isInClient()); } catch (_) { return false; } // โชว์ปุ่มเมื่อเปิดใน LINE; เช็กว่าใช้แชร์ได้จริงตอนกด
  }
  function shareBtn(act, attr, label) {
    return canShare() ? '<button type="button" class="share-btn" data-act="' + act + '" ' + attr + ' aria-label="' + label + '">' + SHARE_ICON + '</button>' : '';
  }
  function lotShareRow(code) {
    return canShare() ? '<div class="lot-share"><button type="button" class="share-pill" data-act="share-lot" data-code="' + esc(code) + '">' + SHARE_ICON + 'แชร์ Lot นี้</button></div>' : '';
  }
  function shareLink(q) { return 'https://liff.line.me/' + CFG.LIFF_ID + '?' + q; }
  // ข้อความเร่งปิดรับ: เหลือน้อยกว่า 48 ชม. เท่านั้น
  function urgencyText(iso) {
    var h = (new Date(iso).getTime() - Date.now()) / 36e5;
    if (!(h > 0) || h > 48) return '';
    return h < 24 ? 'เหลืออีกไม่ถึง ' + Math.max(1, Math.ceil(h)) + ' ชั่วโมง' : 'เหลืออีก ' + Math.floor(h / 24) + ' วัน';
  }
  function flexText(text, o) { var t = { type: 'text', text: text, wrap: true }; for (var k in o) t[k] = o[k]; return t; }
  function sharePick(messages, okMsg) {
    var ok = false;
    try { ok = !!(L.isApiAvailable && L.isApiAvailable('shareTargetPicker')); } catch (_) {}
    if (!ok) { toast('แชร์ยังใช้ไม่ได้ในแอป LINE รุ่นนี้ (ลองอัปเดต LINE)'); return; }
    L.shareTargetPicker(messages).then(function (r) { if (r && r.status === 'success') toast(okMsg); }).catch(function (e) { toast('แชร์ไม่สำเร็จ' + (e && e.message ? ' (' + String(e.message).slice(0, 40) + ')' : '')); });
  }
  function shareProduct(pid) {
    var p = productsById().get(pid);
    if (!p) return;
    var urgent = urgencyText(p.closeAt);
    var body = [flexText(p.name, { weight: 'bold', size: 'md' }), flexText(baht(p.priceThb * 100), { weight: 'bold', size: 'lg', color: '#C2472B', margin: 'sm' }),
      flexText('Lot ' + p.preorderCode + ' · ปิดรับ ' + closeText(p.closeAt), { size: 'xs', color: '#8C7A6D', margin: 'sm' })];
    if (urgent) body.push(flexText('⏰ ' + urgent, { size: 'sm', color: '#C2362B', weight: 'bold', margin: 'sm' }));
    var bubble = { type: 'bubble', body: { type: 'box', layout: 'vertical', contents: body }, footer: { type: 'box', layout: 'vertical', contents: [{ type: 'button', style: 'primary', color: '#E5704A', action: { type: 'uri', label: 'สั่งเลย', uri: shareLink('p=' + encodeURIComponent(pid)) } }] } };
    if (/^https:\/\//.test(p.imageUrl || '')) bubble.hero = { type: 'image', url: p.imageUrl, size: 'full', aspectRatio: '1:1', aspectMode: 'cover' };
    sharePick([{ type: 'flex', altText: p.name + ' ' + baht(p.priceThb * 100) + ' · สั่งเลยที่ PRE2PET', contents: bubble }], 'แชร์แล้ว ✓');
  }
  function shareLot(code) {
    var items = S.products.filter(function (p) { return p.preorderCode === code; });
    if (!items.length) return;
    var urgent = urgencyText(items[0].closeAt), shown = items.slice(0, 6);
    var rows = shown.map(function (p) {
      return { type: 'box', layout: 'horizontal', margin: 'sm', contents: [flexText(p.name, { size: 'sm', flex: 4 }), flexText(baht(p.priceThb * 100), { size: 'sm', align: 'end', flex: 2, color: '#C2472B' })] };
    });
    if (items.length > shown.length) rows.push(flexText('และอีก ' + (items.length - shown.length) + ' รายการ', { size: 'xs', color: '#8C7A6D', margin: 'sm' }));
    var body = [flexText('พรีออเดอร์ Lot ' + code, { weight: 'bold', size: 'lg' }), flexText('ปิดรับ ' + closeText(items[0].closeAt), { size: 'xs', color: '#8C7A6D', margin: 'sm' })];
    if (urgent) body.push(flexText('⏰ ใกล้ปิดแล้ว ' + urgent, { size: 'sm', color: '#C2362B', weight: 'bold', margin: 'md' }));
    body.push({ type: 'separator', margin: 'md' });
    var bubble = { type: 'bubble', body: { type: 'box', layout: 'vertical', contents: body.concat(rows) }, footer: { type: 'box', layout: 'vertical', contents: [{ type: 'button', style: 'primary', color: '#E5704A', action: { type: 'uri', label: 'ดูและสั่งเลย', uri: shareLink('lot=' + encodeURIComponent(code)) } }] } };
    sharePick([{ type: 'flex', altText: 'พรีออเดอร์ Lot ' + code + (urgent ? ' · ' + urgent : '') + ' · PRE2PET', contents: bubble }], 'แชร์ Lot แล้ว ✓');
  }
  // เปิดจากลิงก์ที่แชร์ (?p=รหัสสินค้า หรือ ?lot=รหัส Lot) -> กาง Lot นั้น / เปิดแผ่นสินค้า
  function linkParam(name) {
    var q = new URLSearchParams(location.search), st = q.get('liff.state');
    return q.get(name) || (st ? new URLSearchParams(st.replace(/^\?/, '')).get(name) : '') || '';
  }
  function openFromLink() {
    var pid = linkParam('p'), lot = linkParam('lot'), p = pid && productsById().get(pid);
    if (p) { S.open[p.preorderCode] = true; render(); openSheet(pid); return; }
    if (lot && S.products.some(function (x) { return x.preorderCode === lot; })) {
      S.open[lot] = true; render();
      var el = document.querySelector('details.group[data-code="' + (window.CSS && CSS.escape ? CSS.escape(lot) : lot) + '"]');
      if (el) el.scrollIntoView();
    }
  }

  function closeBadge(iso) {
    var h = (new Date(iso).getTime() - Date.now()) / 36e5;
    if (!(h > 0) || h > 48) return '';
    var hot = h < 24;
    return '<span class="g-badge' + (hot ? ' hot' : '') + '">' + CLOCK_ICON + (hot ? Math.max(1, Math.ceil(h)) + ' ชม.' : Math.floor(h / 24) + ' วัน') + '</span>';
  }
  // แถบเมนูล่าง ใช้ร่วมกันที่หน้าสั่งสินค้ากับหน้าออเดอร์ของฉัน (แท็บที่ตรงกับหน้านั้นไฮไลต์ แตะแล้วเลื่อนขึ้นบน)
  function tabbarHtml(active) {
    function tab(key, icon, label, act) {
      var on = key === active;
      return '<button type="button" class="tb' + (on ? ' on' : '') + '" data-act="' + (on ? 'top' : act) + '"' + (on ? ' aria-current="page"' : '') + '>' + icon + '<span>' + label + '</span></button>';
    }
    return '<nav class="tabbar" aria-label="เมนูหลัก">' + tab('order', BAG_ICON, 'สั่งสินค้า', 'more') + tab('my', RECEIPT_ICON, 'ออเดอร์ของฉัน', 'my') +
      '<a class="tb" href="' + esc(adminChatUrl(OA_ID)) + '">' + CHAT_ICON + '<span>ติดต่อร้าน</span></a></nav>';
  }
  function variantRow(p, o, oi, hasOptImg) {
    var k = qtyKey(p.productId, o), q = S.qty[k] || 0, oimg = (p.optionImages || [])[oi] || '';
    return '<div class="variant' + (q ? ' has' : '') + (oimg ? ' with-img' : '') + '" data-k="' + esc(k) + '" data-oi="' + oi + '"><span class="variant-name">' + (oimg ? '<img class="pimg opt-img" src="' + esc(oimg) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : (hasOptImg ? '<span class="opt-img opt-img-blank" aria-hidden="true"></span>' : '')) + (o ? esc(o) : 'จำนวน') + '</span>' +
      '<span class="stepper"><button type="button" data-act="dec" data-k="' + esc(k) + '" aria-label="ลด ' + esc(p.name + ' ' + o) + '"' + (q <= 0 ? ' disabled' : '') + '>−</button>' +
      '<output aria-live="off">' + q + '</output>' +
      '<button type="button" data-act="inc" data-k="' + esc(k) + '" aria-label="เพิ่ม ' + esc(p.name + ' ' + o) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button></span></div>';
  }
  function productCount(p) {
    return (p.options.length ? p.options : ['']).reduce(function (n, o) { return n + (S.qty[qtyKey(p.productId, o)] || 0); }, 0);
  }
  function cardHtml(p) {
    var opts = p.options.length ? p.options : [''], n = productCount(p), ctl;
    if (opts.length > 1) {
      ctl = '<span class="pc-btn">' + (n ? n + ' ชิ้น' : 'เลือก') + '</span>';
    } else {
      var k = qtyKey(p.productId, opts[0]), q = S.qty[k] || 0;
      ctl = '<button type="button" class="pc-add" data-act="inc" data-k="' + esc(k) + '" aria-label="เพิ่ม ' + esc(p.name) + '">+</button>' +
        '<span class="stepper pc-step variant' + (q ? ' has' : '') + '" data-k="' + esc(k) + '"><button type="button" data-act="dec" data-k="' + esc(k) + '" aria-label="ลด ' + esc(p.name) + '"' + (q <= 0 ? ' disabled' : '') + '>−</button>' +
        '<output aria-live="off">' + q + '</output><button type="button" data-act="inc" data-k="' + esc(k) + '" aria-label="เพิ่ม ' + esc(p.name) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button></span>';
    }
    return '<div class="pcard' + (n ? ' has' : '') + '" data-act="open-sheet" data-p="' + esc(p.productId) + '" role="button" tabindex="0" aria-label="ดูรายละเอียด ' + esc(p.name) + '">' +
      '<div class="pc-img">' + (p.imageUrl ? '<img class="pimg" src="' + esc(p.imageUrl) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '') + '</div>' +
      '<div class="pc-name">' + esc(p.name) + '</div>' +
      '<div class="pc-sub">' + (opts.length > 1 ? opts.length + ' ตัวเลือก' : '') + '</div>' +
      '<div class="pc-foot"><span class="pc-price">' + baht(p.priceThb * 100) + '</span>' + ctl + '</div></div>';
  }
  function sheetHtml(pid) {
    var p = productsById().get(pid);
    if (!p) return '';
    var opts = p.options.length ? p.options : [''], hasOptImg = (p.optionImages || []).some(Boolean);
    return '<div class="sheet-ov" data-act="close-sheet"><div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(p.name) + '" tabindex="-1" data-p="' + esc(pid) + '"><div class="sh-top"><div class="sheet-grip"></div>' +
      '<div class="sh-img"><div class="sh-img-in">' + (p.imageUrl ? '<img class="pimg" src="' + esc(p.imageUrl) + '" alt="' + esc(p.name) + '" referrerpolicy="no-referrer">' : '') + '</div><span class="sh-cap" id="sh-cap" hidden></span></div>' +
      '<div class="sh-head"><span class="name">' + esc(p.name) + '</span><span class="price">' + baht(p.priceThb * 100) + '</span>' + shareBtn('share-p', 'data-p="' + esc(pid) + '"', 'แชร์สินค้า') + '</div></div>' +
      '<div class="sh-meta">Lot ' + esc(p.preorderCode) + ' · ปิดรับ ' + esc(closeText(p.closeAt)) + closeBadge(p.closeAt) + '</div>' +
      (p.description ? '<details class="pdesc"><summary>รายละเอียดสินค้า</summary><p>' + esc(p.description) + '</p></details>' : '') +
      (opts.length > 1 ? '<p class="sh-hint">แตะตัวเลือกเพื่อดูรูป · เลือกได้หลายตัวเลือกพร้อมกัน</p>' : '') +
      '<div class="variants">' + opts.map(function (o, oi) { return variantRow(p, o, oi, hasOptImg); }).join('') + '</div>' +
      '<button type="button" class="btn primary block" data-act="close-sheet">เสร็จสิ้น</button></div></div>';
  }
  function openSheet(pid) {
    S.sheet = pid;
    var root = document.getElementById('sheet-root');
    if (!root) { root = document.createElement('div'); root.id = 'sheet-root'; document.body.appendChild(root); }
    root.innerHTML = sheetHtml(pid);
    document.body.classList.add('sheet-open');
    var sh = root.querySelector('.sheet');
    if (sh) sh.focus();
  }
  function closeSheet() {
    S.sheet = '';
    var root = document.getElementById('sheet-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('sheet-open');
  }
  // แตะแถวตัวเลือกในแผ่นรายละเอียด: เปลี่ยนรูปใหญ่เป็นรูปของตัวเลือกนั้น (ไม่มีรูปตัวเลือกก็กลับเป็นรูปหลัก)
  function showOptionImage(row) {
    var sh = row.closest('.sheet'), p = sh && productsById().get(sh.getAttribute('data-p'));
    if (!p) return;
    var oi = Number(row.getAttribute('data-oi')), src = (p.optionImages || [])[oi] || p.imageUrl || '';
    var box = sh.querySelector('.sh-img-in'), img = box.querySelector('img');
    if (src) {
      if (!img) { img = document.createElement('img'); img.className = 'pimg'; img.setAttribute('referrerpolicy', 'no-referrer'); box.appendChild(img); }
      img.style.display = ''; img.alt = p.name; img.src = src;
    } else if (img) img.style.display = 'none';
    Array.prototype.forEach.call(sh.querySelectorAll('.variant'), function (r) { r.classList.toggle('viewing', r === row); });
    var cap = sh.querySelector('#sh-cap'), name = (p.options || [])[oi] || '';
    cap.textContent = name; cap.hidden = !name || !(p.optionImages || [])[oi];
  }

  var SCREENS = {
    loading: function () { return '<p class="center muted">กำลังโหลด…</p>'; },

    error: function () {
      return '<h1>เปิดหน้านี้ไม่ได้</h1>' + errBanner() +
        '<p class="muted">ปิดหน้าต่างนี้แล้วเปิดลิงก์จาก LINE อีกครั้ง</p>' +
        '<button class="btn primary block" data-act="reload">ลองอีกครั้ง</button>';
    },

    friend: function () {
      return '<h1>เพิ่มเพื่อนร้านก่อนสั่ง</h1>' +
        '<p>ร้านต้องแจ้งยอดและเลขออเดอร์ทางแชท LINE ของร้าน ลูกค้าที่ยังไม่ได้เพิ่มเพื่อนจะไม่ได้รับข้อความ</p>' +
        '<div class="qr-box">' + OA_QR + '<p>สแกน QR ด้วยแอป LINE หรือค้นหา ID <b>' + OA_ID + '</b> แล้วกดเพิ่มเพื่อน</p></div>' +
        '<a class="btn primary block" href="' + OA_URL + '">เพิ่มเพื่อน PRE2PET</a>' +
        '<button class="btn block" data-act="recheck">เพิ่มเพื่อนแล้ว ตรวจอีกครั้ง</button>';
    },

    register: function () {
      var f = S.form, e = S.fieldErrors;
      function field(id, label, input, opt) {
        return '<label for="' + id + '">' + label + (opt ? ' <span class="opt">ไม่บังคับ</span>' : '') + '</label>' + input +
          (e[id] ? '<p class="err" id="' + id + '-err">' + esc(e[id]) + '</p>' : '');
      }
      function attrs(id) { return ' id="' + id + '" name="' + id + '"' + (e[id] ? ' class="invalid" aria-invalid="true" aria-describedby="' + id + '-err"' : ''); }
      return '<h1>ลงทะเบียนผู้รับ</h1>' +
        '<p class="muted">กรอกครั้งเดียว ครั้งต่อไปสั่งได้เลย ร้านใช้ข้อมูลนี้จัดส่งของให้คุณ</p>' + errBanner() +
        (S.friendUnknown ? '<div class="notice">เช็กสถานะเพื่อนไม่ได้ ถ้ายังไม่ได้เพิ่มเพื่อน <a href="' + OA_URL + '">เพิ่มเพื่อน PRE2PET</a> เพื่อรับแจ้งยอด</div>' : '') +
        '<form id="regform" novalidate>' +
        field('recipientName', 'ชื่อผู้รับ', '<input' + attrs('recipientName') + ' autocomplete="name" value="' + esc(f.recipientName) + '">') +
        field('phone', 'เบอร์โทร', '<input' + attrs('phone') + ' type="tel" inputmode="tel" autocomplete="tel" value="' + esc(f.phone) + '">') +
        field('address', 'ที่อยู่จัดส่ง', '<textarea' + attrs('address') + ' autocomplete="street-address">' + esc(f.address) + '</textarea>') +
        field('oldCode', 'รหัสสมาชิกเดิม', '<input' + attrs('oldCode') + ' value="' + esc(f.oldCode) + '">', true) +
        '<button class="btn primary block" type="submit"' + (S.busy ? ' disabled' : '') + '>' + (S.busy ? 'กำลังบันทึก…' : 'บันทึกและเริ่มสั่ง') + '</button>' +
        '</form>';
    },

    order: function () {
      if (S.products.length === 0) {
        return payBanner() + '<h1>ยังไม่มี Lot ที่เปิดรับ</h1><p class="muted">เมื่อร้านเปิด Lot ใหม่ รายการจะขึ้นที่หน้านี้</p>' +
          '<button class="btn block" data-act="refresh">รีเฟรชรายการ</button>' +
          myOrdersBtn();
      }
      var groups = [];
      S.products.forEach(function (p) {
        var g = groups.filter(function (x) { return x.code === p.preorderCode; })[0];
        if (!g) { g = { code: p.preorderCode, closeAt: p.closeAt, items: [] }; groups.push(g); }
        g.items.push(p);
      });
      var html = payBanner() + '<div class="titlerow"><h1>สั่งพรีออเดอร์</h1><div class="title-actions">' + refreshBtn('refresh', S.refreshing) + '</div></div>' +
        (S.notice ? '<p class="notice" role="status">' + esc(S.notice) + '</p>' : '') +
        '<p class="price-note" role="note">ยอดที่แสดงเป็น <b>ค่าสินค้าเท่านั้น</b> <span style="white-space:nowrap">ยังไม่รวมค่าส่ง</span><span style="white-space:nowrap">และค่านำเข้า</span></p>' + errBanner();
      // เรียงตามเวลาปิดรับ (ปิดก่อนขึ้นก่อน) ถ้าปิดพร้อมกันเรียงตามรหัสพรี
      groups.sort(function (a, b) {
        var d = new Date(a.closeAt).getTime() - new Date(b.closeAt).getTime();
        return d || String(a.code).localeCompare(String(b.code), 'th', { numeric: true });
      });
      groups.forEach(function (g) {
        html += '<details class="group" data-code="' + esc(g.code) + '"' + (S.open[g.code] ? ' open' : '') + '><summary><span class="g-title">Lot ' + esc(g.code) + '</span>' +
          '<span class="g-meta">ปิดรับ ' + esc(closeText(g.closeAt)) + '</span>' + closeBadge(g.closeAt) + '<span class="g-cnt" data-cnt="' + esc(g.code) + '"></span></summary>' + lotShareRow(g.code) + catBar(g) + '<div class="pgrid">';
        g.items.forEach(function (p) {
          if (S.cat[g.code] && (p.category || 'อื่น ๆ') !== S.cat[g.code]) return;
          html += cardHtml(p);
        });
        html += '</div></details>';
      });
      html +=
        '<div class="bar"><div class="bar-in"><div><div class="label">ค่าสินค้าเท่านั้น (ยังไม่รวมค่าส่ง)</div><strong id="total">฿0</strong></div>' +
        '<button class="btn primary" id="submit" data-act="submit" disabled>ส่งออเดอร์</button></div></div>';
      return html;
    },

    done: function () {
      var r = S.receipt;
      var rows = r.lines.map(function (l) {
        return '<div class="row"><span>' + esc(l.name) + (l.option ? ' (' + esc(l.option) + ')' : '') + ' × ' + l.qty + '</span><span>' + baht(l.lineSatang) + '</span></div>';
      }).join('');
      return '<h1>' + (r.replay ? 'ออเดอร์นี้ถูกบันทึกไว้แล้ว' : 'บันทึกออเดอร์แล้ว') + '</h1>' +
        '<p class="muted">ร้านจะแจ้งยอดรวมค่าส่งทางแชท LINE ของร้านเมื่อถึงรอบ</p>' +
        '<article class="ticket" aria-label="สรุปออเดอร์"><div class="small muted">รหัสสมาชิกของคุณ</div><div class="ticket-code">' + esc(S.memberCode) + '</div>' +
        '<dl>' + rows + '<div class="row total"><span>ค่าสินค้า</span><span>' + baht(r.totalSatang) + '</span></div></dl></article>' +
        '<button class="btn primary block" data-act="more">สั่งเพิ่ม</button>' +
        myOrdersBtn();
    },

    my: function () {
      var d = S.my;
      var html = '<h1 class="sr-only">ออเดอร์ของฉัน</h1>' + errBanner();
      if (!d) return html + '<p class="center muted">กำลังโหลด…</p>';
      if (!d.orders.length) return html + '<p class="muted">ยังไม่มีออเดอร์</p><button class="btn primary block" data-act="more">เริ่มสั่งของ</button>';
      var merged = mergeOrderLines(d.orders);
      var counts = tabCounts(merged, d.billing);
      if (!S.myTab) S.myTab = (counts.pay > 0 || counts.verify > 0) ? 'pay' : counts.new > 0 ? 'new' : counts.ship > 0 ? 'ship' : counts.inbound > 0 ? 'inbound' : 'all';
      var labelOf = {}; ORDER_TABS.forEach(function (t) { labelOf[t.key] = t.label; });
      var dueSatang = 0;
      d.billing.forEach(function (b) { [b.round1, b.round2].forEach(function (r) { if (r && !r.paid && !r.slipAt) dueSatang += r.totalSatang; }); });
      var ICONS = {
        pay: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 9h20a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9zm0 0 16-5v5M21 19h6v-4h-6a2 2 0 0 0 0 4z"/></svg>',
        new: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5h14a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm3 7h8M12 17h8M12 22h5"/></svg>',
        ship: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 11 16 5l12 6v12l-12 6-12-6V11zm0 0 12 6m0 12V17m12-6-12 6M10 8l12 6"/></svg>',
        inbound: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 7h16v15H3zM19 12h6l4 5v5h-10zM9 25a2.5 2.5 0 1 0 0-.01zM24 25a2.5 2.5 0 1 0 0-.01z"/></svg>',
      };
      function tile(k, big) {
        return '<button type="button" role="tab" class="tile' + (big ? ' tile-pay' : '') + (S.myTab === k ? ' active' : '') + '" aria-selected="' + (S.myTab === k) + '" data-act="tab" data-tab="' + k + '">' +
          '<span class="tile-ico">' + ICONS[k] + (counts[k] ? '<span class="tile-n">' + counts[k] + '</span>' : '') + '</span>' +
          '<span class="tile-txt"><span class="tile-label">' + esc(labelOf[k]) + '</span>' + (big && dueSatang > 0 ? '<span class="tile-sub">ต้องโอน <b>' + baht(dueSatang) + '</b></span>' : '') + '</span></button>';
      }
      var refundPending = typeof pendingRefundCount === 'function' ? pendingRefundCount(merged, d.billing) : 0;
      var moreOpen = S.myMore;
      html += '<section class="mybuy"><div class="mybuy-head"><strong>การซื้อของฉัน</strong>' + refreshBtn('refresh-my', S.refreshingMy) + '<button type="button" class="linkbtn more-link" data-act="more-tabs" aria-expanded="' + moreOpen + '">ดูเพิ่มเติม ' + (moreOpen ? '▴' : '›') + (!moreOpen && refundPending > 0 ? '<span class="chip-n">' + refundPending + '</span>' : '') + '</button></div>' +
        '<div role="tablist">' + tile('pay', true) + '<div class="tiles">' + tile('new') + tile('ship') + tile('inbound') + '</div></div>' +
        (moreOpen ? '<div class="more-tabs">' + MORE_TAB_KEYS.map(function (k) {
          return '<button type="button" role="tab" class="chip' + (S.myTab === k ? ' active' : '') + '" aria-selected="' + (S.myTab === k) + '" data-act="tab" data-tab="' + k + '">' + esc(labelOf[k]) + (k === 'refund' && refundPending > 0 ? '<span class="chip-n">' + refundPending + '</span>' : '') + '</button>';
        }).join('') + '</div>' : '') + '</section>' +
        '<nav class="stickytabs" role="tablist" aria-label="หมวดออเดอร์">' + ['pay', 'new', 'ship', 'inbound'].concat(MORE_TAB_KEYS).map(function (k) {
          var n = k === 'refund' ? refundPending : counts[k];
          return '<button type="button" role="tab" class="st' + (S.myTab === k ? ' active' : '') + '" aria-selected="' + (S.myTab === k) + '" data-act="tab" data-tab="' + k + '">' + esc(labelOf[k]) + (n ? '<span class="st-n">' + n + '</span>' : '') + '</button>';
        }).join('') + '</nav>';
      var shown = filterMyOrders(merged, d.billing, S.myTab);
      var STAGE_ORDER = ['pay', 'verify', 'new', 'ship', 'inbound', 'done', 'refund', 'cancel'];
      var payState = paymentStateByPreorder(d.billing);
      function stageOf(o) {
        var live = o.status !== 'ยกเลิก' && o.status !== 'คืนเงิน';
        return (live && payState[o.preorderCode]) || lineTab(o, d.billing);
      }
      // ป้ายสถานะบนหัวการ์ด Lot (แท็บทั้งหมด): เรียง "ต้องทำ" ก่อน จบแล้วท้ายสุด แสดงไม่แสดงจำนวน
      function stageTags(list, code) {
        var n = {};
        list.forEach(function (o) { n[stageOf(o)] = true; });
        var keys = STAGE_ORDER.filter(function (k) { return n[k]; });
        var open = !!(S.tagsOpen && S.tagsOpen[code]);
        var shownKeys = keys.length > 2 && !open ? keys.slice(0, 1) : keys;
        var chips = shownKeys.map(function (k) { return '<span class="stage s-' + k + '">' + esc(labelOf[k]) + '</span>'; }).join('');
        if (keys.length > 2) chips += '<button type="button" class="stage s-more" data-act="tags" data-code="' + esc(code) + '" aria-expanded="' + open + '" aria-label="' + (open ? 'ย่อสถานะ' : 'ดูสถานะทั้งหมด') + '">' + (open ? 'ย่อ' : '+' + (keys.length - 1)) + '</button>';
        return '<span class="g-tags' + (open && keys.length > 2 ? ' is-open' : '') + '">' + chips + '</span>';
      }
      function renderGroups(list) {
        var html = '';
        var codes = newestFirstCodes(list);
        var shown = list;
      codes.forEach(function (code) {
        var mine = shown.filter(function (o) { return o.preorderCode === code; });
        var live = mine.filter(function (o) { return o.status !== 'ยกเลิก'; });
        var dead = mine.filter(function (o) { return o.status === 'ยกเลิก'; });
        var pieces = (live.length ? live : mine).reduce(function (n, o) { return n + o.qty; }, 0);
        html += '<details class="group" data-scope="my" data-code="' + esc(code) + '"' + ((S.openMy[code] === undefined ? (S.myTab === 'pay' || S.myTab === 'refund') : S.openMy[code]) ? ' open' : '') + '><summary><span class="g-title">Lot ' + esc(code) + '</span><span class="g-meta">' + pieces + ' ชิ้น</span>' + (S.myTab === 'all' ? stageTags(mine, code) : '') + '</summary>';
        var b = d.billing.filter(function (x) { return x.preorderCode === code; })[0];
        if (b && live.length && (S.myTab === 'all' || S.myTab === 'pay')) {
          html += '<div class="billbox' + ((b.round1 || b.round2) && [b.round1, b.round2].every(function (r) { return !r || r.paid; }) ? ' all-paid' : '') + '"><div class="order-no"><span class="muted">เลขออเดอร์</span><strong>' + esc(b.orderNo) + '</strong></div>';
          [['รอบ 1', b.round1, 1], ['รอบ 2', b.round2, 2]].forEach(function (x) {
            var r = x[1];
            if (!r) return;
            var sk = code + '|' + x[2];
            var badge = r.paid ? '<span class="badge ok">จ่ายแล้ว</span>' : r.slipAt ? '<span class="badge warn">แจ้งโอนแล้ว</span>' : '<span class="badge">รอชำระ</span>';
            html += '<div class="pay-round"><div class="pay-top"><div class="pay-name">ยอดโอน' + x[0] + (x[2] === 1 ? '<small>ค่าสินค้า + ส่งจีน</small>' : '') + '</div>' + badge + '</div>' +
              '<div class="pay-amt">' + baht(r.totalSatang) + '</div>';
            if (!r.paid) {
              var busy = S.slipBusy === sk;
              if (S.slipErr[sk] && !busy) html += '<div class="slip-fail" role="alert"><strong>⚠ แนบสลิปไม่สำเร็จ</strong><span>' + esc(S.slipErr[sk]) + '</span><span class="small">สลิปยังไม่ถูกส่งถึงร้าน กดแนบสลิปอีกครั้ง หรือติดต่อแอดมิน</span></div>';
              var inp = '<input type="file" accept="image/*" hidden data-slip="' + esc(sk) + '"' + (busy ? ' disabled' : '') + '>';
              if (r.slipAt) {
                html += '<div class="slip-done">✓ ส่งสลิปแล้ว · รอร้านตรวจสอบ<small>' + esc(closeText(r.slipAt)) + '</small></div>' +
                  '<label class="slip-redo' + (busy ? ' is-busy' : '') + '">' + (busy ? '<span class="spin"></span>กำลังส่งสลิป…' : 'ส่งผิด? แนบสลิปใหม่') + inp + '</label>';
              } else {
                html += payInfoBox(d.paymentInfo) + '<p class="small muted pay-note">โอนแล้ว แนบสลิปที่นี่ได้เลย</p>' +
                  '<label class="btn slip-btn' + (busy ? ' is-busy' : '') + '">' + (busy ? '<span class="spin"></span>กำลังส่งสลิป…' : 'แนบสลิป') + inp + '</label>';
              }
            }
            html += '</div>';
          });
          html += '</div>';
        }
        var refLines = mine.filter(function (o) { return o.status === 'คืนเงิน'; });
        if (b && b.refund && refLines.length && (S.myTab === 'refund' || S.myTab === 'all')) {
          var refSum = refLines.reduce(function (n, o) { return n + (o.priceThb || 0) * o.qty * 100; }, 0);
          var refAmt = b.refund.amountSatang != null ? b.refund.amountSatang : refSum;
          html += '<div class="refundbox' + (b.refund.paid ? ' done' : '') + '"><div class="ref-order"><span>เลขออเดอร์</span><strong>' + esc(b.orderNo) + '</strong></div><div class="ref-top"><div><div class="ref-label">ยอดที่ร้านคืนให้</div><div class="ref-amt">' + baht(refAmt) + '</div></div>' +
            '<span class="badge ' + (b.refund.paid ? 'ok' : 'warn') + '">' + (b.refund.paid ? 'คืนเงินแล้ว' : 'รอร้านโอนคืน') + '</span></div>' +
            (b.refund.paid ? (b.refund.at ? '<div class="ref-note">คืนเงินเมื่อ ' + esc(closeText(b.refund.at)) + '</div>' : '') : '<div class="ref-note">ร้านค้าจะคืนเงินเข้าบัญชีที่แจ้งไว้ โดยวันที่คืนเงินจะแสดงที่นี่เมื่อดำเนินการแล้ว</div>') + '</div>';
        }
        function thumb(o) { var u = o.optionImageUrl || o.imageUrl; return u ? '<img class="pimg my-pimg" src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : ''; }
        // สินค้าเดียวกัน (คนละสี/ขนาด) ให้อยู่ติดกัน: เรียงกลุ่มสินค้าตามรายการล่าสุด แล้วในกลุ่มใหม่ไปเก่า
        function cluster(list) {
          var latest = {};
          list.forEach(function (o) { var t = o.at || ''; if (!latest[o.productId] || t > latest[o.productId]) latest[o.productId] = t; });
          return list.slice().sort(function (x, y) {
            if (x.productId !== y.productId) return latest[x.productId] < latest[y.productId] ? 1 : latest[x.productId] > latest[y.productId] ? -1 : (x.productId < y.productId ? -1 : 1);
            return (y.at || '') < (x.at || '') ? -1 : (y.at || '') > (x.at || '') ? 1 : 0;
          });
        }
        var ordered = S.myTab === 'all' ? cluster(live).concat(cluster(dead)) : cluster(mine);
        ordered.forEach(function (o, idx) {
          var sameAsPrev = idx > 0 && ordered[idx - 1].productId === o.productId && (idx !== live.length || S.myTab !== 'all');
          var multi = ordered.filter(function (x) { return x.productId === o.productId && (x.status === 'ยกเลิก') === (o.status === 'ยกเลิก'); }).length > 1 && !!o.option;
          if (multi && !sameAsPrev) html += '<div class="prod-head">' + thumb(o) + '<span>' + esc(o.productName) + '</span></div>';
          if (S.myTab === 'all' && live.length && dead.length && idx === live.length) html += '<div class="cancelled-head">ยกเลิกแล้ว · ไม่นับในยอดด้านบน</div>';
          var ck = qtyKey(o.productId, o.option);
          var working = S.busy && ((S.edit && S.edit.k === ck) || S.confirmCancel === ck);
          var unit = o.priceThb != null ? o.priceThb : null;
          var badgeTxt = S.myTab !== 'all' ? '' : '<span class="badge stage s-' + stageOf(o) + '">' + esc(o.status === 'รับออเดอร์' ? labelOf[stageOf(o)] : o.status) + '</span>';
          html += '<div class="my-line' + (working ? ' saving' : '') + (o.status === 'ยกเลิก' ? ' is-cancelled' : '') + (multi ? ' in-cluster' : '') + '">' +
            '<div class="line-name' + (!multi && (o.optionImageUrl || o.imageUrl) ? ' with-img' : '') + '">' + (multi ? '' : thumb(o)) + (multi ? (o.optionImageUrl ? '<img class="pimg opt-img" src="' + esc(o.optionImageUrl) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '') + '<span class="opt-tag alone">' + esc(o.option) + '</span> <span class="unit-inline">' + (unit != null ? baht(unit * 100) + ' × ' + o.qty : '× ' + o.qty) + '</span>' : '<span class="ln-txt">' + esc(o.productName) + (o.option ? ' <span class="opt-tag">' + esc(o.option) + '</span>' : '') + '</span>') + '</div>' +
            '<div class="line-right">' + (unit != null ? '<strong class="line-total">' + baht(unit * o.qty * 100) + '</strong>' : '') + badgeTxt + '</div>' +
            '<div class="line-unit">' + (multi ? '' : (unit != null ? baht(unit * 100) + ' × ' + o.qty : '× ' + o.qty)) + '</div>';
          if (o.canCancel && S.edit && S.edit.k === ck) {
            html += '<div class="edit-qty"><span>แก้จำนวน</span><span class="stepper"><button type="button" data-act="edit-dec" aria-label="ลดจำนวน"' + (S.busy || S.edit.qty <= 1 ? ' disabled' : '') + '>−</button><output>' + S.edit.qty + '</output><button type="button" data-act="edit-inc" aria-label="เพิ่มจำนวน"' + (S.busy || S.edit.qty >= o.qty ? ' disabled' : '') + '>+</button></span>' +
              '<div class="edit-btns"><button type="button" class="btn primary" data-act="edit-save" data-k="' + esc(ck) + '"' + (S.busy || S.edit.qty === o.qty ? ' disabled' : '') + '>' + (S.busy ? '<span class="spin"></span>กำลังบันทึก…' : 'บันทึก') + '</button><button type="button" class="btn" data-act="edit-cancel"' + (S.busy ? ' disabled' : '') + '>ปิด</button></div>' +
              '<p class="small muted">แก้ได้เฉพาะลดจำนวน ถ้าต้องการเพิ่ม ให้สั่งเพิ่มจากหน้าสั่งสินค้า</p></div>';
          } else if (o.canCancel && S.confirmCancel === ck) {
            html += '<div class="cancel-confirm"><span>ยกเลิกรายการนี้ใช่ไหม</span><button type="button" class="btn danger" data-act="cancel-yes" data-k="' + esc(ck) + '"' + (S.busy ? ' disabled' : '') + '>' + (S.busy ? '<span class="spin"></span>กำลังยกเลิก…' : 'ยืนยันยกเลิก') + '</button><button type="button" class="btn" data-act="cancel-no"' + (S.busy ? ' disabled' : '') + '>ไม่ยกเลิก</button></div>';
          } else if (o.canCancel) {
            html += '<div class="line-actions">' + (o.qty > 1 ? '<button type="button" class="linkbtn" data-act="edit-open" data-k="' + esc(ck) + '" data-qty="' + o.qty + '">แก้ไข</button>' : '') +
              '<button type="button" class="linkbtn danger-link" data-act="cancel-ask" data-k="' + esc(ck) + '">ยกเลิก</button></div>';
          }
          html += '</div>';
        });
        html += '</details>';
      });
        return html;
      }
      var emptyMsg = { pay: 'ไม่มียอดที่ต้องชำระ', verify: 'ไม่มีสลิปที่รอตรวจสอบ', 'new': 'ไม่มีออเดอร์ที่รอแจ้งยอด', ship: 'ยังไม่มีสินค้าที่อยู่ระหว่างสั่ง/จัดส่ง', inbound: 'ยังไม่มีพัสดุที่กำลังส่งถึงคุณ', done: 'ยังไม่มีออเดอร์ที่สำเร็จ', refund: 'ไม่มีรายการคืนเงิน', cancel: 'ไม่มีรายการที่ยกเลิก', all: 'ยังไม่มีออเดอร์ กดปุ่มด้านล่างเพื่อเริ่มสั่งได้เลย' };
      var empty = '<p class="muted center empty">' + esc(emptyMsg[S.myTab] || 'ไม่มีรายการในหัวข้อนี้') + '</p>';
      // แท็บที่แบ่งหัวข้อย่อยเอง (รอแจ้งยอด/ที่ต้องจัดส่ง) ไม่ต้องมีหัวข้อซ้อนกันสองชั้น
      if (!((S.myTab === 'new' || S.myTab === 'ship') && shown.length)) html += '<h2 class="tab-title"><span class="tab-dot"></span>' + esc(labelOf[S.myTab] || 'ทั้งหมด') + '</h2>';
      if (S.myTab === 'pay') {
        // รอตรวจสอบ (แนบสลิปแล้ว) วางต่อจากที่ต้องชำระในหน้าเดียวกัน ไม่รวมในตัวเลขของที่ต้องชำระ
        var waiting = filterMyOrders(merged, d.billing, 'verify');
        html += shown.length ? renderGroups(shown) : (waiting.length ? '<p class="muted center empty">ไม่มียอดที่ต้องชำระ</p>' : empty);
        if (waiting.length) html += '<h2 class="tab-title"><span class="tab-dot wait"></span>รอตรวจสอบ</h2><p class="small muted sec-note">แนบสลิปแล้ว รอร้านตรวจสอบยอด</p>' + renderGroups(waiting);
      } else if (S.myTab === 'new' && shown.length) {
        // รอแจ้งยอด แยกเป็นรอบ 1 (สั่งแล้ว รอร้านแจ้งยอดสินค้า+ส่งจีน) และรอบ 2 (ของถึงไทยแล้ว รอร้านแจ้งค่านำเข้า+ส่งไทย)
        [['round1', 'รอแจ้งยอดรอบ 1', 'รับออเดอร์แล้ว ร้านจะแจ้งยอดค่าสินค้า + ส่งจีนทางแชท LINE เมื่อปิดพรี', function (o) { return o.status !== 'ถึงไทย'; }],
         ['round2', 'รอแจ้งยอดรอบ 2', 'ของถึงไทยแล้ว ร้านจะแจ้งยอดค่านำเข้า + ส่งในไทยทางแชท LINE', function (o) { return o.status === 'ถึงไทย'; }]].forEach(function (g) {
          var part = shown.filter(g[3]);
          if (part.length) html += '<h2 class="tab-title"><span class="tab-dot wait"></span>' + g[1] + '</h2><p class="small muted sec-note">' + g[2] + '</p>' + renderGroups(part);
        });
      } else if (S.myTab === 'ship' && shown.length) {
        // ที่ต้องจัดส่ง แยกหัวข้อตามสถานะ เรียงใกล้ถึงมือลูกค้าที่สุดก่อน: แพ็กแล้ว > ถึงไทย > ออกจากจีน > สั่งของแล้ว
        [['แพ็กแล้ว', 'แพ็กแล้ว รอจัดส่ง', 'ร้านแพ็กของแล้ว กำลังจะส่งถึงคุณ', 'ok'], ['ถึงไทย', 'ถึงไทยแล้ว', 'ของถึงไทยแล้ว รอร้านแพ็กและส่ง', 'ok'], ['ออกจากจีน', 'ออกจากจีนแล้ว', 'ของออกจากจีน กำลังเดินทางมาไทย', 'wait'], ['สั่งของแล้ว', 'สั่งของแล้ว', 'ร้านสั่งของจากจีนแล้ว รอของออกจากจีน', 'wait'], ['รับออเดอร์', 'ชำระแล้ว รอร้านสั่งของ', 'ร้านได้รับยอดแล้ว และจะสั่งของจากจีนให้เมื่อรวมออเดอร์ครบ', 'wait']].forEach(function (g) {
          var part = shown.filter(function (o) { return o.status === g[0]; });
          if (part.length) html += '<h2 class="tab-title"><span class="tab-dot ' + g[3] + '"></span>' + g[1] + '</h2><p class="small muted sec-note">' + g[2] + '</p>' + renderGroups(part);
        });
      } else {
        html += shown.length ? renderGroups(shown) : empty;
      }
      return html + '<button class="btn block" data-act="more">กลับไปสั่งของ</button>' + adminBtn();
    },
  };

  // ---------- เหตุการณ์ ----------
  function refreshTotal() {
    var el = document.getElementById('total');
    if (!el) return;
    var sum = cartSummary(cartLines(), productsById());
    el.textContent = baht(sum.totalSatang);
    var counts = {};
    sum.lines.forEach(function (l) { var p = productsById().get(l.productId); if (p) counts[p.preorderCode] = (counts[p.preorderCode] || 0) + l.qty; });
    Array.prototype.forEach.call(app.querySelectorAll('[data-cnt]'), function (el) {
      var n = counts[el.getAttribute('data-cnt')] || 0;
      el.textContent = n ? 'เลือกแล้ว ' + n + ' ชิ้น' : '';
    });
    var btn = document.getElementById('submit');
    if (btn) btn.disabled = S.busy || sum.lines.length === 0 || !S.friend;
  }

  function bump(k, delta) {
    var q = Math.max(0, Math.min(MAX_QTY, (S.qty[k] || 0) + delta));
    S.qty[k] = q;
    // การ์ดในกริดกับแผ่นรายละเอียดอาจแสดงตัวเลือกเดียวกันพร้อมกัน จึงอัปเดตทุกแถวที่ตรงกัน
    Array.prototype.forEach.call(document.querySelectorAll('.variant[data-k="' + k.replace(/"/g, '\\"') + '"]'), function (row) {
      row.classList.toggle('has', q > 0);
      row.querySelector('output').textContent = q;
      row.querySelector('[data-act=dec]').disabled = q <= 0;
      row.querySelector('[data-act=inc]').disabled = q >= MAX_QTY;
    });
    var p = productsById().get(k.split('\u0001')[0]);
    if (p) {
      var n = productCount(p);
      Array.prototype.forEach.call(document.querySelectorAll('.pcard[data-p="' + p.productId.replace(/"/g, '\\"') + '"]'), function (card) {
        card.classList.toggle('has', n > 0);
        var b = card.querySelector('.pc-btn');
        if (b) b.textContent = n ? n + ' ชิ้น' : 'เลือก';
      });
    }
    refreshTotal();
  }

  // ไปหน้าสั่งสินค้าทันทีด้วยรายการที่มีอยู่ แล้วค่อยโหลดรายการใหม่เงียบ ๆ ด้านหลัง (ไม่ให้ค้างอยู่หน้าเดิมระหว่างรอเครือข่าย)
  function goOrder() {
    setScreen('order'); refreshTotal();
    loadBootstrap().then(function () {
      if (S.screen !== 'order') return;
      var y = window.scrollY; render(); window.scrollTo(0, y); refreshTotal();
    }).catch(function () {});
  }

  function loadBootstrap() {
    return api('bootstrap').then(function (res) {
      if (!res.ok) throw new Error(res.message || res.error);
      S.products = res.products;
      S.memberCode = res.memberCode || '';
      S.pending = res.pendingPay || { count: 0, totalSatang: 0 };
      return res;
    });
  }

  function submitOrder() {
    var lines = cartLines();
    if (!lines.length || S.busy) return;
    var key = JSON.stringify(lines);
    if (key !== S.requestKey) { S.requestKey = key; S.requestId = uuid(); } // รายการเดิม = ใช้ requestId เดิมซ้ำ
    S.busy = true; S.error = '';
    var btn = document.getElementById('submit');
    if (btn) { btn.disabled = true; btn.textContent = 'กำลังส่ง…'; }
    api('placeOrder', { requestId: S.requestId, lines: lines }).then(function (res) {
      S.busy = false;
      if (res.ok) {
        var byId = productsById();
        var sum = cartSummary(lines, byId);
        S.receipt = { replay: !!res.replay, totalSatang: res.goodsTotalSatang, lines: sum.lines.map(function (l) { return { name: byId.get(l.productId).name, option: l.option, qty: l.qty, lineSatang: l.lineSatang }; }) };
        S.qty = {}; S.requestKey = ''; S.requestId = null;
        return setScreen('done');
      }
      if (res.error === 'closed') { S.error = 'Lot นี้ปิดรับแล้ว ออเดอร์ของคุณยังไม่ถูกบันทึก'; return loadBootstrap().then(function () { render(); }); }
      if (res.error === 'not_registered') return setScreen('register');
      S.error = res.error === 'bad_request' ? (res.message || 'ข้อมูลไม่ถูกต้อง ตรวจรายการแล้วลองใหม่') : 'ส่งออเดอร์ไม่สำเร็จ กดส่งอีกครั้งได้ ระบบจะไม่บันทึกซ้ำ';
      render(); refreshTotal();
    }).catch(function () {
      S.busy = false;
      S.error = 'เชื่อมต่อไม่ได้ กดส่งอีกครั้งได้ ระบบจะไม่บันทึกซ้ำ';
      render(); refreshTotal();
    });
  }

  function submitRegister(form) {
    var v = { recipientName: form.recipientName.value.trim(), phone: form.phone.value.trim(), address: form.address.value.trim(), oldCode: form.oldCode.value.trim() };
    S.form = v;
    var e = {};
    if (!v.recipientName) e.recipientName = 'กรอกชื่อผู้รับ';
    if (!normalizePhone(v.phone)) e.phone = 'เบอร์โทรไม่ถูกต้อง ใช้ 9-10 หลัก ขึ้นต้นด้วย 0';
    if (v.address.length < 10) e.address = 'กรอกที่อยู่ให้ครบ (บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์)';
    if (v.oldCode.length > 30) e.oldCode = 'รหัสเดิมยาวเกินไป';
    S.fieldErrors = e;
    if (Object.keys(e).length) { render(); var first = app.querySelector('.invalid'); if (first) first.focus(); return; }
    S.busy = true; S.error = ''; render();
    api('register', Object.assign({ lineName: S.lineName }, v)).then(function (res) {
      S.busy = false;
      if (res.ok) { S.memberCode = res.memberCode; return setScreen('order'); }
      if (res.errors) S.fieldErrors = res.errors;
      S.error = res.errors ? 'ตรวจข้อมูลที่ทำเครื่องหมายไว้' : 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง';
      render();
    }).catch(function () { S.busy = false; S.error = 'เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง'; render(); });
  }

  function showMy() {
    var cached = S.my; // มีข้อมูลเดิมอยู่แล้วให้แสดงทันที แล้วโหลดใหม่เงียบ ๆ ข้างหลัง
    S.my = cached || null; S.myTab = ''; S.myMore = false;
    if (linkTab && ORDER_TABS.some(function (t) { return t.key === linkTab; })) { S.myTab = linkTab; S.myMore = MORE_TAB_KEYS.indexOf(linkTab) >= 0; }
    linkTab = ''; S.edit = null; S.confirmCancel = ''; setScreen('my');
    api('myOrders').then(function (res) {
      if (!res.ok) throw new Error('server:' + (res.error || 'unknown'));
      S.my = res; var y = window.scrollY; render(); if (cached) window.scrollTo(0, y);
    }).catch(function (e) { if (cached) return; S.error = 'โหลดออเดอร์ไม่สำเร็จ ลองใหม่อีกครั้ง (รหัส: ' + String((e && e.message) || e || 'unknown').slice(0, 80) + ')'; S.my = { orders: [], billing: [] }; try { render(); } catch (e2) { /* ไม่ให้ error ซ้อน */ } });
  }

  function cancelLine(k) {
    var parts = k.split('\u0001');
    S.busy = true; S.error = ''; render();
    api('cancelOrder', { productId: parts[0], option: parts[1] || '' }).then(function (res) {
      S.busy = false; S.confirmCancel = '';
      if (!res.ok) { S.error = res.message || 'ยกเลิกไม่สำเร็จ ลองใหม่อีกครั้ง'; } else toast('ยกเลิกรายการแล้ว ✓');
      return api('myOrders').then(function (m) { if (m.ok) S.my = m; });
    }).catch(function () { S.busy = false; S.error = 'เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง'; }).then(function () {
      var y = window.scrollY; render(); window.scrollTo(0, y);
    });
  }

  function saveEdit(k) {
    var parts = k.split('\u0001'), target = S.edit.qty;
    S.busy = true; S.error = ''; render();
    api('reduceOrder', { productId: parts[0], option: parts[1] || '', qty: target }).then(function (res) {
      S.busy = false;
      if (res.ok) { S.edit = null; toast('บันทึกแล้ว ✓'); } else S.error = res.message || 'แก้จำนวนไม่สำเร็จ ลองใหม่อีกครั้ง';
      return api('myOrders').then(function (m) { if (m.ok) S.my = m; });
    }).catch(function () { S.busy = false; S.error = 'เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง'; }).then(function () {
      var y = window.scrollY; render(); window.scrollTo(0, y);
    });
  }

  function copyText(txt, msg) {
    function ok() { toast(msg); }
    function fallback() {
      var t = document.createElement('textarea'); t.value = txt; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (_) { toast(txt); }
      document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback();
  }
  var COPY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
  function payInfoBox(info) {
    if (!info) return '';
    return '<div class="payinfo"><div class="pi-head">โอนเข้าบัญชี</div><div class="pi-txt">' + esc(info) + '</div><button type="button" class="pi-copy" data-act="copy-acct">' + COPY_ICON + 'คัดลอกเลขบัญชี</button></div>';
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = msg; el.className = 'show';
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.className = ''; }, 2600);
  }

  // ย่อรูปสลิปเป็น JPEG ด้านยาวไม่เกิน 1400px ให้ base64 ไม่เกิน ~1.2MB (ส่งผ่าน Apps Script ได้เร็วและเก็บใน Drive ไม่หนัก)
  function slipToJpegBase64(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var scale = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * scale)); c.height = Math.max(1, Math.round(img.naturalHeight * scale));
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        var q = 0.85, out = '';
        for (var i = 0; i < 5; i++) {
          out = c.toDataURL('image/jpeg', q).split(',')[1] || '';
          if (out.length <= 1200000) break;
          q -= 0.15;
        }
        if (!out || out.length > 1400000) return reject(new Error('too_big'));
        resolve(out);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('bad_image')); };
      img.src = url;
    });
  }

  function sendSlip(sk, file) {
    var parts = sk.split('|');
    S.slipBusy = sk; S.error = ''; delete S.slipErr[sk]; keepScroll();
    slipToJpegBase64(file).then(function (b64) {
      return api('uploadSlip', { preorderCode: parts[0], round: Number(parts[1]), image: b64 });
    }).then(function (res) {
      if (!res.ok) { var er = new Error(res.message || 'upload_failed'); er.code = res.error || 'unknown'; er.fromServer = true; throw er; }
      toast('ส่งสลิปแล้ว ✓ ร้านจะตรวจสอบ');
      return api('myOrders').then(function (m) { if (m.ok) { S.my = m } });
    }).catch(function (e) {
      var code = e && (e.code || (e instanceof TypeError ? 'network' : ''));
      S.slipErr[sk] = e && e.message === 'bad_image' ? 'เปิดรูปนี้ไม่ได้ ลองเลือกรูปสลิปอีกครั้ง' : e && e.message === 'too_big' ? 'รูปใหญ่เกินไป ลองแคปหน้าจอสลิปแล้วแนบใหม่' : 'เกิดข้อผิดพลาดจากระบบ' + (code ? ' (รหัส: ' + code + ')' : '');
      if (window.console) console.error('uploadSlip failed', e);
    }).then(function () { S.slipBusy = ''; keepScroll(); });
  }

  app.addEventListener('change', function (ev) {
    var t = ev.target;
    if (t && t.matches && t.matches('input[data-slip]') && t.files && t.files[0]) sendSlip(t.getAttribute('data-slip'), t.files[0]);
  });

  // แถบหมวดออเดอร์แบบลอย: โผล่เมื่อเลื่อนผ่านกล่อง "การซื้อของฉัน" ไปแล้ว
  function syncStickyTabs() {
    var mb = S.screen === 'my' ? document.querySelector('.mybuy') : null;
    document.body.classList.toggle('st-on', !!mb && mb.getBoundingClientRect().bottom < 0);
    var a = document.querySelector('.stickytabs .st.active');
    if (a && document.body.classList.contains('st-on')) { var bar = a.parentNode; bar.scrollLeft = a.offsetLeft - (bar.clientWidth - a.offsetWidth) / 2; }
  }
  window.addEventListener('scroll', syncStickyTabs, { passive: true });

  // เปลี่ยนหมวดแล้วพากลับไปที่สินค้าแรกของ Lot นั้น (ถ้าลูกค้าเลื่อนลงมาไกลแล้ว) ไม่ต้องเลื่อนขึ้นเอง
  function scrollToLotTop(code) {
    var g = Array.prototype.filter.call(document.querySelectorAll('details.group'), function (x) { return x.getAttribute('data-code') === code; })[0];
    var grid = g && g.querySelector('.pgrid'), bar = g && g.querySelector('.catbar'), sm = g && g.querySelector('summary');
    if (!grid) return;
    var hd = document.querySelector('header.top');
    var stick = (hd ? hd.offsetHeight : 0) + (sm ? sm.offsetHeight : 0) + (bar ? bar.offsetHeight : 0) + 6;
    var top = grid.getBoundingClientRect().top;
    if (top < stick) window.scrollTo(0, top + window.scrollY - stick);
  }

  function keepScroll() { var y = window.scrollY; render(); window.scrollTo(0, y); }

  // ลิงก์จากข้อความแจ้งยอด (?page=my) เปิดหน้า "ออเดอร์ของฉัน" ตรงๆ; LIFF อาจห่อพารามิเตอร์ไว้ใน liff.state
  function wantsMyPage() {
    var q = new URLSearchParams(location.search);
    var st = q.get('liff.state');
    if (st && new URLSearchParams(st.replace(/^\?/, '')).get('page') === 'my') return true;
    return q.get('page') === 'my';
  }

  // ?tab=refund ในลิงก์ข้อความ -> เปิดแท็บนั้นครั้งเดียว (ใช้ตอนเข้าจากลิงก์เท่านั้น)
  var linkTab = (function () {
    var q = new URLSearchParams(location.search);
    var st = q.get('liff.state');
    return q.get('tab') || (st ? new URLSearchParams(st.replace(/^\?/, '')).get('tab') : '') || '';
  })();

  function gateAfterBootstrap(registered) {
    if (!S.friend) return setScreen('friend');
    if (registered && wantsMyPage()) return showMy();
    setScreen(registered ? 'order' : 'register');
    if (registered) { refreshTotal(); openFromLink(); }
  }

  function recheckFriend() {
    return L.getFriendship().then(function (f) { S.friend = !!f.friendFlag; S.friendUnknown = false; }, function () { S.friend = true; S.friendUnknown = true; });
  }

  function refreshMy() {
    if (S.refreshingMy) return;
    S.refreshingMy = true; S.error = ''; render();
    api('myOrders').then(function (m) { if (m.ok) { S.my = m; toast('อัปเดตแล้ว ✓'); } else throw new Error('x'); })
      .catch(function () { S.error = 'รีเฟรชไม่สำเร็จ ลองใหม่อีกครั้ง'; })
      .then(function () { S.refreshingMy = false; var y = window.scrollY; render(); window.scrollTo(0, y); });
  }

  // ดึงหน้าจอลงเพื่อรีเฟรช (เฉพาะตอนอยู่บนสุดของหน้าสั่งของ/ออเดอร์ของฉัน)
  (function () {
    var y0 = null, dy = 0, ind = null;
    function reset() { y0 = null; dy = 0; if (ind) { ind.style.transform = 'translate(-50%,-60px)'; ind.style.opacity = '0'; } }
    document.addEventListener('touchstart', function (e) {
      if ((S.screen !== 'order' && S.screen !== 'my') || S.sheet || window.scrollY > 0 || e.touches.length !== 1) { y0 = null; return; }
      y0 = e.touches[0].clientY; dy = 0;
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (y0 === null) return;
      dy = e.touches[0].clientY - y0;
      if (dy <= 0 || window.scrollY > 0) { dy = 0; return; }
      if (!ind) { ind = document.createElement('div'); ind.className = 'ptr'; ind.innerHTML = REFRESH_ICON; document.body.appendChild(ind); }
      var p = Math.min(dy, 110) / 2;
      ind.style.opacity = String(Math.min(1, dy / 70));
      ind.style.transform = 'translate(-50%,' + (p - 40) + 'px) rotate(' + (dy * 3) + 'deg)';
    }, { passive: true });
    document.addEventListener('touchend', function () {
      var go = y0 !== null && dy > 70;
      reset();
      if (go) { if (S.screen === 'my') refreshMy(); else refreshProducts(); }
    }, { passive: true });
    document.addEventListener('touchcancel', reset, { passive: true });
  })();

  function refreshProducts() {
    if (S.refreshing) return;
    var before = productsById(), had = cartLines().length;
    S.refreshing = true; S.notice = ''; S.error = ''; render();
    loadBootstrap().then(function () {
      var added = 0;
      productsById().forEach(function (p, id) { if (!before.has(id)) added++; });
      var lost = had - cartLines().length;
      S.notice = (added ? 'มีสินค้าใหม่ ' + added + ' รายการ' : 'ไม่มีสินค้าใหม่') +
        (lost > 0 ? ' · สินค้า ' + lost + ' รายการในตะกร้าปิดรับแล้วจึงถูกเอาออก' : '');
    }).catch(function () { S.error = 'รีเฟรชไม่สำเร็จ ลองใหม่อีกครั้ง'; }).then(function () {
      S.refreshing = false;
      var y = window.scrollY; render(); window.scrollTo(0, y); refreshTotal();
    });
  }

  // รูปโหลดไม่ขึ้น (ลิงก์เสีย/ไม่ได้แชร์สาธารณะ) ให้ซ่อน ไม่ให้เห็นไอคอนรูปแตก
  app.addEventListener('error', function (ev) { if (ev.target && ev.target.classList && ev.target.classList.contains('pimg')) ev.target.style.display = 'none'; }, true);

  // จำสถานะเปิด/ปิดของแต่ละรอบพรี ไว้ใช้ตอนรีเฟรช/วาดหน้าใหม่
  app.addEventListener('toggle', function (ev) {
    var d = ev.target;
    if (d && d.classList && d.classList.contains('group')) (d.getAttribute('data-scope') === 'my' ? S.openMy : S.open)[d.getAttribute('data-code')] = d.open;
  }, true);

  var topBack = document.querySelector('[data-top-back]');
  if (topBack) topBack.addEventListener('click', function () { setScreen('order'); refreshTotal(); loadBootstrap().then(function () { if (S.screen === 'order') { render(); refreshTotal(); } }).catch(function () {}); });

  // แผ่นรายละเอียดสินค้าอยู่นอก #app (วาดหน้าใหม่แล้วไม่หาย) จึงมีตัวฟังเหตุการณ์ของตัวเอง
  document.addEventListener('click', function (ev) {
    var root = document.getElementById('sheet-root');
    if (!root || !root.contains(ev.target)) return;
    var row = ev.target.closest('.variant');
    if (row && !ev.target.closest('.stepper')) { showOptionImage(row); return; }
    var t = ev.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'share-p') shareProduct(t.getAttribute('data-p'));
    else if (act === 'inc') bump(t.getAttribute('data-k'), 1);
    else if (act === 'dec') bump(t.getAttribute('data-k'), -1);
    else if (act === 'close-sheet' && (!t.classList.contains('sheet-ov') || ev.target === t)) closeSheet();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && S.sheet) closeSheet();
    else if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList && ev.target.classList.contains('pcard')) { ev.preventDefault(); openSheet(ev.target.getAttribute('data-p')); }
  });

  app.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'share-lot') { ev.preventDefault(); shareLot(t.getAttribute('data-code')); }
    else if (act === 'tags') { ev.preventDefault(); var tc = t.getAttribute('data-code'); S.tagsOpen = S.tagsOpen || {}; S.tagsOpen[tc] = !S.tagsOpen[tc]; keepScroll(); }
    else if (act === 'open-sheet') openSheet(t.getAttribute('data-p'));
    else if (act === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else if (act === 'inc') bump(t.getAttribute('data-k'), 1);
    else if (act === 'dec') bump(t.getAttribute('data-k'), -1);
    else if (act === 'submit') submitOrder();
    else if (act === 'more') goOrder();
    else if (act === 'refresh') refreshProducts();
    else if (act === 'refresh-my') refreshMy();
    else if (act === 'copy-acct') { var pi = (S.my && S.my.paymentInfo) || ''; var m = pi.match(/\d[\d\- ]{6,}\d/); copyText(m ? m[0].replace(/[\s-]/g, '') : pi, m ? 'คัดลอกเลขบัญชีแล้ว ✓' : 'คัดลอกข้อมูลชำระเงินแล้ว ✓'); }
    else if (act === 'more-tabs') { S.myMore = !S.myMore; keepScroll(); }
    else if (act === 'pay-detail') { var pc = t.getAttribute('data-code'); S.payDetail[pc] = !S.payDetail[pc]; keepScroll(); }
    else if (act === 'cat') { var cc = t.getAttribute('data-code'); S.cat[cc] = t.getAttribute('data-cat') || ''; keepScroll(); scrollToLotTop(cc); }
    else if (act === 'tab') { var fromBar = !!t.closest('.stickytabs') && document.body.classList.contains('st-on'); S.myTab = t.getAttribute('data-tab'); if (MORE_TAB_KEYS.indexOf(S.myTab) >= 0) S.myMore = true; S.edit = null; S.confirmCancel = ''; render(); if (fromBar) { var mb = document.querySelector('.mybuy'); if (mb) window.scrollTo(0, mb.getBoundingClientRect().bottom + window.scrollY - 46); } syncStickyTabs(); }
    else if (act === 'edit-open') { S.confirmCancel = ''; S.edit = { k: t.getAttribute('data-k'), qty: Number(t.getAttribute('data-qty')) }; keepScroll(); }
    else if (act === 'edit-dec') { S.edit.qty = Math.max(1, S.edit.qty - 1); keepScroll(); }
    else if (act === 'edit-inc') { S.edit.qty += 1; keepScroll(); }
    else if (act === 'edit-cancel') { S.edit = null; keepScroll(); }
    else if (act === 'edit-save') saveEdit(t.getAttribute('data-k'));
    else if (act === 'cancel-ask') { S.edit = null; S.confirmCancel = t.getAttribute('data-k'); var y1 = window.scrollY; render(); window.scrollTo(0, y1); }
    else if (act === 'cancel-no') { S.confirmCancel = ''; var y2 = window.scrollY; render(); window.scrollTo(0, y2); }
    else if (act === 'cancel-yes') cancelLine(t.getAttribute('data-k'));
    else if (act === 'my') showMy();
    else if (act === 'reload') location.reload();
    else if (act === 'recheck') location.reload();
  });
  app.addEventListener('submit', function (ev) {
    if (ev.target.id === 'regform') { ev.preventDefault(); submitRegister(ev.target); }
  });

  // ---------- เริ่มทำงาน ----------
  function start() {
    var registered = false;
    return Promise.resolve(L.getProfile()).catch(function () { return {}; }).then(function (p) {
      S.lineName = (p && p.displayName) || '';
      return recheckFriend();
    }).then(function () {
      return loadBootstrap();
    }).then(function (res) {
      registered = res.registered;
      gateAfterBootstrap(registered);
    });
  }

  Promise.resolve(L.init({ liffId: CFG.LIFF_ID })).then(function () {
    if (!L.isLoggedIn()) { L.login(); return null; }
    return start();
  }).catch(function (e) {
    S.error = 'ไม่สามารถเริ่มระบบได้ (' + (e && e.message ? e.message : 'ไม่ทราบสาเหตุ') + ')';
    setScreen('error');
  });
})();
