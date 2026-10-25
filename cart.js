// คำนวณตะกร้า (ใช้ทั้งในหน้าเว็บและเทสต์) — ไม่พึ่งไฟล์อื่น
function cartSummary(cart, productsById) {
  var lines = [];
  var total = 0;
  cart.forEach(function (l) {
    if (!(l.qty > 0)) return;
    var p = productsById.get(l.productId);
    if (!p) throw new Error('ไม่พบสินค้า ' + l.productId);
    var lineSatang = p.priceThb * l.qty * 100;
    lines.push({ productId: l.productId, option: l.option, qty: l.qty, lineSatang: lineSatang });
    total += lineSatang;
  });
  return { lines: lines, totalSatang: total };
}

// รวมรายการที่เป็นของชิ้นเดียวกัน (พรี+สินค้า+ตัวเลือก+สถานะ) จากหลายออเดอร์ให้เป็นบรรทัดเดียว เรียงตามที่เจอก่อน
function mergeOrderLines(rows) {
  var out = [];
  var index = {};
  rows.forEach(function (r) {
    var k = JSON.stringify([r.preorderCode, r.productId, r.productName, r.option, r.status]);
    if (index[k] === undefined) { index[k] = out.length; out.push({ preorderCode: r.preorderCode, productId: r.productId, productName: r.productName, option: r.option, status: r.status, priceThb: r.priceThb, canCancel: !!r.canCancel, qty: 0 }); }
    out[index[k]].qty += r.qty;
  });
  return out;
}

// แท็บในหน้า "ออเดอร์ของฉัน" (จัดกลุ่มจากสถานะรายการในชีต; ที่ต้องชำระดูจากยอดที่ร้านแจ้งแล้วแต่ยังไม่จ่าย)
var ORDER_TABS = [
  { key: 'all', label: 'ทั้งหมด' }, { key: 'pay', label: 'ที่ต้องชำระ' }, { key: 'new', label: 'รับออเดอร์' },
  { key: 'ship', label: 'ที่ต้องจัดส่ง' }, { key: 'inbound', label: 'ที่ต้องได้รับ' }, { key: 'done', label: 'สำเร็จ' },
  { key: 'refund', label: 'คืนเงิน' }, { key: 'cancel', label: 'ยกเลิก' },
];
// 4 แท็บหลักแสดงเป็นไอคอนด้านบน (ที่ต้องชำระเด่นสุด); ที่เหลือซ่อนไว้ใต้ "ดูเพิ่มเติม"
var MAIN_TAB_KEYS = ['pay', 'new', 'ship', 'inbound'];
var MORE_TAB_KEYS = ['all', 'done', 'refund', 'cancel'];
var ORDER_TAB_BY_STATUS = {
  'รับออเดอร์': 'new', 'สั่งของแล้ว': 'ship', 'ถึงไทย': 'ship', 'แพ็กแล้ว': 'ship',
  'ส่งแล้ว': 'inbound', 'สำเร็จ': 'done', 'คืนเงิน': 'refund', 'ยกเลิก': 'cancel',
};

function orderTabOf(status) {
  return Object.prototype.hasOwnProperty.call(ORDER_TAB_BY_STATUS, status) ? ORDER_TAB_BY_STATUS[status] : 'new';
}

function unpaidPreorders(billing) {
  var out = {};
  billing.forEach(function (b) {
    if ((b.round1 && !b.round1.paid) || (b.round2 && !b.round2.paid)) out[b.preorderCode] = true;
  });
  return out;
}

function filterMyOrders(lines, billing, tab) {
  if (tab === 'all') return lines.slice();
  var unpaid = unpaidPreorders(billing);
  return lines.filter(function (l) {
    // รายการอยู่แท็บเดียว: ถ้าพรีนั้นมียอดค้างชำระ (และรายการยังไม่ยกเลิก/คืนเงิน) จะอยู่แท็บ "ที่ต้องชำระ" เท่านั้น
    var inPay = !!unpaid[l.preorderCode] && l.status !== 'ยกเลิก' && l.status !== 'คืนเงิน';
    if (tab === 'pay') return inPay;
    return !inPay && orderTabOf(l.status) === tab;
  });
}

function tabCounts(lines, billing) {
  var out = {};
  ORDER_TABS.forEach(function (t) {
    out[t.key] = filterMyOrders(lines, billing, t.key).reduce(function (n, l) { return n + l.qty; }, 0);
  });
  return out;
}

// ลิงก์เปิดแชท LINE OA ของร้านพร้อมข้อความที่พิมพ์ให้ล่วงหน้า (รูปแบบทางการของ LINE: /R/oaMessage/<OA id>/?<ข้อความ>)
function adminChatUrl(oaBasicId, memberCode, orderNos) {
  var nos = (orderNos || []).filter(Boolean);
  var text = 'สอบถามออเดอร์' + (nos.length ? ' ' + nos.join(', ') : '') + (memberCode ? ' (' + memberCode + ')' : '');
  return 'https://line.me/R/oaMessage/' + encodeURIComponent(oaBasicId) + '/?' + encodeURIComponent(text);
}

