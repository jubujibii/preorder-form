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
    if (index[k] === undefined) { index[k] = out.length; out.push({ preorderCode: r.preorderCode, productId: r.productId, productName: r.productName, option: r.option, status: r.status, priceThb: r.priceThb, canCancel: !!r.canCancel, at: r.at || null, qty: 0 }); }
    out[index[k]].qty += r.qty;
    if (r.at && (!out[index[k]].at || r.at > out[index[k]].at)) out[index[k]].at = r.at;
  });
  return out;
}

// เรียงจากใหม่ไปเก่า (ไม่มีเวลาไว้ท้ายสุด; เวลาเท่ากันคงลำดับเดิม)
function sortNewestFirst(lines) {
  return lines.map(function (l, i) { return { l: l, i: i }; }).sort(function (a, b) {
    var x = a.l.at || '', y = b.l.at || '';
    if (x !== y) return x < y ? 1 : -1;
    return a.i - b.i;
  }).map(function (e) { return e.l; });
}

// รหัสพรีเรียงตามออเดอร์ล่าสุดของพรีนั้น (ใหม่ไปเก่า)
function newestFirstCodes(lines) {
  var codes = [];
  sortNewestFirst(lines).forEach(function (l) { if (codes.indexOf(l.preorderCode) < 0) codes.push(l.preorderCode); });
  return codes;
}

// แท็บในหน้า "ออเดอร์ของฉัน" (จัดกลุ่มจากสถานะรายการในชีต; ที่ต้องชำระดูจากยอดที่ร้านแจ้งแล้วแต่ยังไม่จ่าย)
var ORDER_TABS = [
  { key: 'all', label: 'ทั้งหมด' }, { key: 'pay', label: 'ที่ต้องชำระ' }, { key: 'verify', label: 'รอตรวจสอบ' }, { key: 'new', label: 'รอแจ้งยอด' },
  { key: 'ship', label: 'ที่ต้องจัดส่ง' }, { key: 'inbound', label: 'ที่ต้องได้รับ' }, { key: 'done', label: 'สำเร็จ' },
  { key: 'refund', label: 'คืนเงิน' }, { key: 'cancel', label: 'ยกเลิก' },
];
// 4 แท็บหลักแสดงเป็นไอคอนด้านบน (ที่ต้องชำระเด่นสุด); ที่เหลือซ่อนไว้ใต้ "ดูเพิ่มเติม"
var MAIN_TAB_KEYS = ['pay', 'new', 'ship', 'inbound'];
var MORE_TAB_KEYS = ['all', 'done', 'refund', 'cancel'];
var ORDER_TAB_BY_STATUS = {
  'รับออเดอร์': 'new', 'สั่งของแล้ว': 'ship', 'ออกจากจีน': 'ship', 'ถึงไทย': 'ship', 'แพ็กแล้ว': 'ship',
  'ส่งแล้ว': 'inbound', 'สำเร็จ': 'done', 'คืนเงิน': 'refund', 'ยกเลิก': 'cancel',
};

function orderTabOf(status) {
  return Object.prototype.hasOwnProperty.call(ORDER_TAB_BY_STATUS, status) ? ORDER_TAB_BY_STATUS[status] : 'new';
}

// สถานะการชำระรายพรี: pay = มีรอบที่แจ้งยอดแล้วแต่ยังไม่จ่ายและยังไม่แนบสลิป; verify = ที่ค้างทั้งหมดแนบสลิปแล้ว รอร้านตรวจ
function paymentStateByPreorder(billing) {
  var out = {};
  billing.forEach(function (b) {
    var open = [b.round1, b.round2].filter(function (r) { return r && !r.paid; });
    if (!open.length) return;
    out[b.preorderCode] = open.some(function (r) { return !r.slipAt; }) ? 'pay' : 'verify';
  });
  return out;
}

function unpaidPreorders(billing) {
  var st = paymentStateByPreorder(billing), out = {};
  Object.keys(st).forEach(function (k) { out[k] = true; });
  return out;
}

function filterMyOrders(lines, billing, tab) {
  if (tab === 'all') return sortNewestFirst(lines);
  var st = paymentStateByPreorder(billing);
  return sortNewestFirst(lines).filter(function (l) {
    // รายการอยู่แท็บเดียว: พรีที่มียอดค้าง (และรายการยังไม่ยกเลิก/คืนเงิน) อยู่ "ที่ต้องชำระ" หรือ "รอตรวจสอบ" เท่านั้น
    var live = l.status !== 'ยกเลิก' && l.status !== 'คืนเงิน';
    var pay = live ? st[l.preorderCode] : undefined;
    if (tab === 'pay' || tab === 'verify') return pay === tab;
    return !pay && lineTab(l, billing) === tab;
  });
}

// แท็บของรายการ: ชำระรอบ 1 แล้วแต่ร้านยังไม่ได้กด "สั่งของแล้ว" (ยังเป็นรับออเดอร์) ไม่ควรอยู่ "รอแจ้งยอด" -> ไปที่ต้องจัดส่ง (หัวข้อ "ชำระแล้ว รอร้านสั่งของ")
function lineTab(l, billing) {
  if (l.status === 'รับออเดอร์') {
    var b = billing.filter(function (x) { return x.preorderCode === l.preorderCode; })[0];
    if (b && b.round1 && b.round1.paid) return 'ship';
  }
  return orderTabOf(l.status);
}

// ตัวเลขบนแท็บ = จำนวนออเดอร์ (พรี) ที่อยู่ในแท็บนั้น ไม่ใช่จำนวนชิ้น
function tabCounts(lines, billing) {
  var out = {};
  ORDER_TABS.forEach(function (t) {
    var seen = {};
    filterMyOrders(lines, billing, t.key).forEach(function (l) { seen[l.preorderCode] = true; });
    out[t.key] = Object.keys(seen).length;
  });
  return out;
}

// จำนวนออเดอร์ (พรี) ที่มีรายการ "คืนเงิน" และร้านยังไม่ได้โอนคืน (ใช้โชว์ตัวเลขบนแท็บคืนเงิน หายไปเมื่อคืนครบ)
function pendingRefundCount(lines, billing) {
  var seen = {};
  lines.forEach(function (l) {
    if (l.status !== 'คืนเงิน') return;
    var b = billing.filter(function (x) { return x.preorderCode === l.preorderCode; })[0];
    if (!(b && b.refund && b.refund.paid)) seen[l.preorderCode] = true;
  });
  return Object.keys(seen).length;
}

// ยอดค้างชำระจากข้อมูลบิลของหน้า "ออเดอร์ของฉัน" (ไม่นับรอบที่แนบสลิปแล้ว)
function pendingPayment(billing) {
  var count = 0, total = 0;
  billing.forEach(function (b) {
    [b.round1, b.round2].forEach(function (r) { if (r && !r.paid && !r.slipAt) { count++; total += r.totalSatang; } });
  });
  return { count: count, totalSatang: total };
}

// ลิงก์เปิดแชท LINE OA ของร้าน (เพื่อนของร้านจะเข้าแชท 1:1 ทันที ไม่มีข้อความพิมพ์ให้)
function adminChatUrl(oaBasicId) {
  return 'https://line.me/R/ti/p/' + encodeURIComponent(oaBasicId);
}

