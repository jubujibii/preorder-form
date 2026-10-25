// ใช้ร่วมกันทั้ง server และหน้าเว็บ (ห้ามพึ่งพาไฟล์อื่น)

function formatSatang(satang) {
  const sign = satang < 0 ? '-' : '';
  const n = Math.abs(Math.round(satang));
  const baht = Math.floor(n / 100);
  const cents = String(n % 100).padStart(2, '0');
  return sign + baht + '.' + cents;
}

// เบอร์ไทย 9-10 หลักขึ้นต้น 0 (รับ +66 / 66 นำหน้า); ไม่ถูกต้องคืน null
function normalizePhone(raw) {
  var s = String(raw == null ? '' : raw).replace(/[\s\-().]/g, '');
  if (/^\+66\d+$/.test(s)) s = '0' + s.slice(3);
  else if (/^66\d{9}$/.test(s)) s = '0' + s.slice(2);
  return /^0\d{8,9}$/.test(s) ? s : null;
}

var THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

// วันที่แบบไทยสั้น เวลาไทย (UTC+7) ปี พ.ศ. เช่น 13 เม.ย. 2569
function formatThaiDate(date) {
  var d = new Date(date.getTime() + 7 * 3600000);
  return d.getUTCDate() + ' ' + THAI_MONTHS_SHORT[d.getUTCMonth()] + ' ' + (d.getUTCFullYear() + 543);
}

