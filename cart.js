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
    var k = JSON.stringify([r.preorderCode, r.productName, r.option, r.status]);
    if (index[k] === undefined) { index[k] = out.length; out.push({ preorderCode: r.preorderCode, productName: r.productName, option: r.option, status: r.status, qty: 0 }); }
    out[index[k]].qty += r.qty;
  });
  return out;
}

