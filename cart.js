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

