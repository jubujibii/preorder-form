(function () {
  'use strict';
  var CFG = window.APP_CONFIG || {};
  var params = new URLSearchParams(location.search);
  var MOCK = params.get('mock') === '1';
  var OA_URL = 'https://line.me/R/ti/p/@841hdioo';
  var OA_ID = '@841hdioo';
  var MAX_QTY = 99;
  var app = document.getElementById('app');
  var memberEl = document.getElementById('member');

  var S = {
    screen: 'loading', products: [], memberCode: '', qty: {}, friend: true, friendUnknown: false, lineName: '',
    busy: false, open: {}, openMy: {}, myTab: '', myMore: false, pending: { count: 0, totalSatang: 0 }, payDetail: {}, slipBusy: '', slipErr: {}, confirmCancel: '', edit: null, refreshing: false, notice: '', error: '', fieldErrors: {}, form: { recipientName: '', phone: '', address: '', oldCode: '' },
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
    var res;
    if (p.action === 'bootstrap') res = { ok: true, registered: mockDb.registered, memberCode: mockDb.registered ? mockDb.member : undefined, products: products, pendingPay: params.get('pay') === '1' ? { count: 2, totalSatang: 83000 } : { count: 0, totalSatang: 0 } };
    else if (p.action === 'register') { mockDb.registered = true; res = { ok: true, memberCode: mockDb.member }; }
    else if (p.action === 'placeOrder') {
      if (params.get('fail') === '1') { params.delete('fail'); res = { ok: false, error: 'server_error', message: 'x' }; }
      else { mockDb.orders = mockDb.orders.concat(p.lines.map(function (l) { return { productId: l.productId, option: l.option, qty: l.qty, status: 'รับออเดอร์', at: new Date().toISOString() }; })); res = { ok: true, goodsTotalSatang: p.lines.reduce(function (s, l) { var pr = products.filter(function (x) { return x.productId === l.productId; })[0]; return s + pr.priceThb * l.qty * 100; }, 0) }; }
    } else if (p.action === 'myOrders') {
      res = { ok: true, orders: mockDb.orders.map(function (l) { return { preorderCode: '090426', productId: l.productId, productName: l.productId === '090426-P01' ? 'ที่นอนแมวทรงโดนัท' : 'ของเล่นกระดิ่งปลาทูน่า', option: l.option, qty: l.qty, status: l.status || 'รับออเดอร์', priceThb: l.productId === '090426-P01' ? 66 : 58, at: l.at || null, canCancel: (l.status || 'รับออเดอร์') === 'รับออเดอร์' }; }),
        billing: [{ preorderCode: '090426', orderNo: '090426-012', round1: { totalSatang: 14400, paid: false, slipAt: mockDb.slip[1] || null }, round2: null }] };
      if (params.get('refund')) {
        res.billing[0].round1 = { totalSatang: 54000, paid: true, slipAt: null };
        res.orders.push({ preorderCode: '090426', productId: 'x1', productName: 'ที่นอนแมวทรงโดนัท', option: 'ฟ้า', qty: 2, status: 'คืนเงิน', priceThb: 66, at: '2026-10-25T01:00:00Z', canCancel: false },
          { preorderCode: '090426', productId: 'x2', productName: 'อาหารแมว', option: 'ไก่', qty: 1, status: 'คืนเงิน', priceThb: 55, at: '2026-10-25T01:00:00Z', canCancel: false },
          { preorderCode: '090426', productId: 'x3', productName: 'ที่นอนแมวทรงโดนัท', option: 'ชมพู', qty: 3, status: 'ยกเลิก', priceThb: 66, at: '2026-10-25T01:00:00Z', canCancel: false });
        res.billing[0].refund = params.get('refund') === 'paid' ? { paid: true, amountSatang: 18700, at: '2026-10-26T03:00:00Z' } : { paid: false, amountSatang: 18700, at: null };
      }
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
    memberEl.hidden = !S.memberCode;
    memberEl.textContent = S.memberCode;
    var fn = SCREENS[S.screen] || SCREENS.error;
    app.innerHTML = fn();
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
    return '<div class="paybanner" role="status"><div class="pb-txt"><strong>มียอดค้างชำระ ' + baht(p.totalSatang) + '</strong><span>' + p.count + ' รายการ · โอนแล้วแนบสลิปได้ในหน้าออเดอร์ของฉัน</span></div>' +
      '<button type="button" class="btn pb-btn" data-act="my">ดูและชำระ</button></div>';
  }
  var CHAT_ICON = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 6h22a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H15l-6 5v-5H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM10 13h12M10 18h7"/></svg>';

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
      var html = payBanner() + '<div class="titlerow"><h1>สั่งพรีออเดอร์</h1><div class="title-actions"><button type="button" class="refresh" data-act="my">ออเดอร์ของฉัน</button><button type="button" class="refresh" data-act="refresh"' + (S.refreshing ? ' disabled' : '') + '>' + (S.refreshing ? 'กำลังโหลด…' : '↻ รีเฟรช') + '</button></div></div>' +
        (S.notice ? '<p class="notice" role="status">' + esc(S.notice) + '</p>' : '') +
        '<p class="price-note" role="note">ยอดที่แสดงเป็น <b>ค่าสินค้าเท่านั้น</b> ยังไม่รวมค่าส่งและค่านำเข้า</p>' + errBanner();
      // เรียงตามเวลาปิดรับ (ปิดก่อนขึ้นก่อน) ถ้าปิดพร้อมกันเรียงตามรหัสพรี
      groups.sort(function (a, b) {
        var d = new Date(a.closeAt).getTime() - new Date(b.closeAt).getTime();
        return d || String(a.code).localeCompare(String(b.code), 'th', { numeric: true });
      });
      groups.forEach(function (g) {
        html += '<details class="group" data-code="' + esc(g.code) + '"' + (S.open[g.code] ? ' open' : '') + '><summary><span class="g-title">Lot ' + esc(g.code) + '</span>' +
          '<span class="g-meta">ปิดรับ ' + esc(closeText(g.closeAt)) + '</span><span class="g-cnt" data-cnt="' + esc(g.code) + '"></span></summary><ul class="items">';
        g.items.forEach(function (p) {
          var opts = p.options.length ? p.options : [''];
          html += '<li class="item"><div class="item-top">' + (p.imageUrl ? '<img class="pimg" src="' + esc(p.imageUrl) + '" alt="' + esc(p.name) + '" loading="lazy" referrerpolicy="no-referrer">' : '') + '<div class="item-head"><span class="name">' + esc(p.name) + '</span><span class="price">' + baht(p.priceThb * 100) + '</span></div></div><div class="variants">';
          opts.forEach(function (o) {
            var k = qtyKey(p.productId, o), q = S.qty[k] || 0;
            html += '<div class="variant' + (q ? ' has' : '') + '" data-k="' + esc(k) + '"><span>' + (o ? esc(o) : 'จำนวน') + '</span>' +
              '<span class="stepper"><button type="button" data-act="dec" data-k="' + esc(k) + '" aria-label="ลด ' + esc(p.name + ' ' + o) + '"' + (q <= 0 ? ' disabled' : '') + '>−</button>' +
              '<output aria-live="off">' + q + '</output>' +
              '<button type="button" data-act="inc" data-k="' + esc(k) + '" aria-label="เพิ่ม ' + esc(p.name + ' ' + o) + '"' + (q >= MAX_QTY ? ' disabled' : '') + '>+</button></span></div>';
          });
          html += '</div></li>';
        });
        html += '</ul></details>';
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
      var html = '<h1>ออเดอร์ของฉัน</h1>' + errBanner();
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
          '<span class="tile-txt"><span class="tile-label">' + esc(labelOf[k]) + '</span>' + (big && dueSatang > 0 ? '<span class="tile-sub">ต้องโอน ' + baht(dueSatang) + '</span>' : '') + '</span></button>';
      }
      var refundPending = typeof pendingRefundCount === 'function' ? pendingRefundCount(merged, d.billing) : 0;
      var moreOpen = S.myMore;
      html += '<section class="mybuy"><div class="mybuy-head"><strong>การซื้อของฉัน</strong><button type="button" class="linkbtn more-link" data-act="more-tabs" aria-expanded="' + moreOpen + '">ดูเพิ่มเติม ' + (moreOpen ? '▴' : '›') + (!moreOpen && refundPending > 0 ? '<span class="chip-n">' + refundPending + '</span>' : '') + '</button></div>' +
        '<div role="tablist">' + tile('pay', true) + '<div class="tiles">' + tile('new') + tile('ship') + tile('inbound') + '</div></div>' +
        (moreOpen ? '<div class="more-tabs">' + MORE_TAB_KEYS.map(function (k) {
          return '<button type="button" role="tab" class="chip' + (S.myTab === k ? ' active' : '') + '" aria-selected="' + (S.myTab === k) + '" data-act="tab" data-tab="' + k + '">' + esc(labelOf[k]) + (k === 'refund' && refundPending > 0 ? '<span class="chip-n">' + refundPending + '</span>' : '') + '</button>';
        }).join('') + '</div>' : '') + '</section>';
      var shown = filterMyOrders(merged, d.billing, S.myTab);
      function renderGroups(list) {
        var html = '';
        var codes = newestFirstCodes(list);
        var shown = list;
      codes.forEach(function (code) {
        var mine = shown.filter(function (o) { return o.preorderCode === code; });
        var live = mine.filter(function (o) { return o.status !== 'ยกเลิก'; });
        var dead = mine.filter(function (o) { return o.status === 'ยกเลิก'; });
        var pieces = (live.length ? live : mine).reduce(function (n, o) { return n + o.qty; }, 0);
        html += '<details class="group" data-scope="my" data-code="' + esc(code) + '"' + ((S.openMy[code] === undefined ? (S.myTab === 'pay' || S.myTab === 'refund') : S.openMy[code]) ? ' open' : '') + '><summary><span class="g-title">Lot ' + esc(code) + '</span><span class="g-meta">' + pieces + ' ชิ้น</span></summary>';
        var b = d.billing.filter(function (x) { return x.preorderCode === code; })[0];
        if (b && live.length && (S.myTab === 'all' || S.myTab === 'pay')) {
          html += '<div class="billbox"><div class="order-no"><span class="muted">เลขออเดอร์</span><strong>' + esc(b.orderNo) + '</strong></div>';
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
                html += '<p class="small muted pay-note">โอนแล้ว แนบสลิปที่นี่ได้เลย</p>' +
                  '<label class="btn slip-btn' + (busy ? ' is-busy' : '') + '">' + (busy ? '<span class="spin"></span>กำลังส่งสลิป…' : '📎 แนบสลิป') + inp + '</label>';
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
          if (multi && !sameAsPrev) html += '<div class="prod-head">' + esc(o.productName) + '</div>';
          if (S.myTab === 'all' && live.length && dead.length && idx === live.length) html += '<div class="cancelled-head">ยกเลิกแล้ว · ไม่นับในยอดด้านบน</div>';
          var ck = qtyKey(o.productId, o.option);
          var working = S.busy && ((S.edit && S.edit.k === ck) || S.confirmCancel === ck);
          var unit = o.priceThb != null ? o.priceThb : null;
          var badgeTxt = (o.status === 'รับออเดอร์' || S.myTab !== 'all') ? '' : '<span class="badge">' + esc(o.status) + '</span>';
          html += '<div class="my-line' + (working ? ' saving' : '') + (o.status === 'ยกเลิก' ? ' is-cancelled' : '') + (multi ? ' in-cluster' : '') + '">' +
            '<div class="line-name">' + (multi ? '<span class="opt-tag alone">' + esc(o.option) + '</span> <span class="unit-inline">' + (unit != null ? baht(unit * 100) + ' × ' + o.qty : '× ' + o.qty) + '</span>' : esc(o.productName) + (o.option ? ' <span class="opt-tag">' + esc(o.option) + '</span>' : '')) + '</div>' +
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
      var empty = '<p class="muted center empty">ไม่มีรายการในหัวข้อนี้</p>';
      html += '<h2 class="tab-title"><span class="tab-dot"></span>' + esc(labelOf[S.myTab] || 'ทั้งหมด') + '</h2>';
      if (S.myTab === 'new') html += '<p class="small muted sec-note">รับออเดอร์แล้ว ร้านจะแจ้งยอดที่ต้องโอนทางแชท LINE เมื่อปิดพรี</p>';
      if (S.myTab === 'pay') {
        // รอตรวจสอบ (แนบสลิปแล้ว) วางต่อจากที่ต้องชำระในหน้าเดียวกัน ไม่รวมในตัวเลขของที่ต้องชำระ
        var waiting = filterMyOrders(merged, d.billing, 'verify');
        html += shown.length ? renderGroups(shown) : (waiting.length ? '<p class="muted center empty">ไม่มียอดที่ต้องชำระ</p>' : empty);
        if (waiting.length) html += '<h2 class="tab-title"><span class="tab-dot wait"></span>รอตรวจสอบ</h2><p class="small muted sec-note">แนบสลิปแล้ว รอร้านตรวจสอบยอด</p>' + renderGroups(waiting);
      } else if (S.myTab === 'ship' && shown.length) {
        // ที่ต้องจัดส่ง แยกหัวข้อตามสถานะ เรียงใกล้ถึงมือลูกค้าที่สุดก่อน: แพ็กแล้ว > ถึงไทย > ออกจากจีน > สั่งของแล้ว
        [['แพ็กแล้ว', 'แพ็กแล้ว รอจัดส่ง', 'ร้านแพ็กของแล้ว กำลังจะส่งถึงคุณ', 'ok'], ['ถึงไทย', 'ถึงไทยแล้ว', 'ของถึงไทยแล้ว รอร้านแพ็กและส่ง', 'ok'], ['ออกจากจีน', 'ออกจากจีนแล้ว', 'ของออกจากจีน กำลังเดินทางมาไทย', 'wait'], ['สั่งของแล้ว', 'สั่งของแล้ว', 'ร้านสั่งของจากจีนแล้ว รอของออกจากจีน', 'wait']].forEach(function (g) {
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
    var row = app.querySelector('.variant[data-k="' + k.replace(/"/g, '\\"') + '"]');
    if (row) {
      row.classList.toggle('has', q > 0);
      row.querySelector('output').textContent = q;
      row.querySelector('[data-act=dec]').disabled = q <= 0;
      row.querySelector('[data-act=inc]').disabled = q >= MAX_QTY;
    }
    refreshTotal();
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
    S.my = null; S.myTab = ''; S.myMore = false;
    if (linkTab && ORDER_TABS.some(function (t) { return t.key === linkTab; })) { S.myTab = linkTab; S.myMore = MORE_TAB_KEYS.indexOf(linkTab) >= 0; }
    linkTab = ''; S.edit = null; S.confirmCancel = ''; setScreen('my');
    api('myOrders').then(function (res) {
      if (!res.ok) throw new Error('server:' + (res.error || 'unknown'));
      S.my = res; render();
    }).catch(function (e) { S.error = 'โหลดออเดอร์ไม่สำเร็จ ลองใหม่อีกครั้ง (รหัส: ' + String((e && e.message) || e || 'unknown').slice(0, 80) + ')'; S.my = { orders: [], billing: [] }; try { render(); } catch (e2) { /* ไม่ให้ error ซ้อน */ } });
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
    if (registered) refreshTotal();
  }

  function recheckFriend() {
    return L.getFriendship().then(function (f) { S.friend = !!f.friendFlag; S.friendUnknown = false; }, function () { S.friend = true; S.friendUnknown = true; });
  }

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

  app.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-act]');
    if (!t) return;
    var act = t.getAttribute('data-act');
    if (act === 'inc') bump(t.getAttribute('data-k'), 1);
    else if (act === 'dec') bump(t.getAttribute('data-k'), -1);
    else if (act === 'submit') submitOrder();
    else if (act === 'more') loadBootstrap().catch(function () {}).then(function () { setScreen('order'); refreshTotal(); });
    else if (act === 'refresh') refreshProducts();
    else if (act === 'more-tabs') { S.myMore = !S.myMore; keepScroll(); }
    else if (act === 'pay-detail') { var pc = t.getAttribute('data-code'); S.payDetail[pc] = !S.payDetail[pc]; keepScroll(); }
    else if (act === 'tab') { S.myTab = t.getAttribute('data-tab'); if (MORE_TAB_KEYS.indexOf(S.myTab) >= 0) S.myMore = true; S.edit = null; S.confirmCancel = ''; render(); }
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
    else if (act === 'recheck') recheckFriend().then(function () { gateAfterBootstrap(!!S.memberCode); });
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
