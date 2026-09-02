function jalaliToGregorian(jy, jm, jd) {
  if (jy > 979) {
    let gy = 1600;
    jy -= 979;
    let days =
      365 * jy +
      Math.floor(jy / 33) * 8 +
      Math.floor(((jy % 33) + 3) / 4) +
      jd +
      (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186) -
      355666 +
      365236 -
      1595;
    gy += 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let gd = days + 1;
    const sal_a = [
      31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ];
    let gm = 0;
    for (gm = 0; gm < 12 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
    return [gy, gm + 1, gd];
  }
  return [0, 0, 0];
}

function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  if (gy > 1600) {
    let jy = 979;
    gy -= 1600;
    const g2 = gy % 4 === 0 ? 366 : 365;
    let days =
      365 * gy +
      Math.floor((gy + 3) / 4) -
      Math.floor((gy + 99) / 100) +
      Math.floor((gy + 399) / 400) +
      gd +
      g_d_m[gm - 1] -
      (g2 === 366 && gm > 2 ? 1 : 0);
    jy += 33 * Math.floor(days / 12053);
    days = days % 12053;
    jy += 4 * Math.floor(days / 1461);
    days = days % 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
  }
  return [0, 0, 0];
}

console.log('=== Dual Conversion Test ===');
console.log('');

console.log('Test A: Today 2026-08-29 Gregorian → Jalali (expect ~1405/06/08)');
const todayJ = gregorianToJalali(2026, 8, 29);
console.log('  Result:', todayJ[0] + '/' + String(todayJ[1]).padStart(2,'0') + '/' + String(todayJ[2]).padStart(2,'0'));

console.log('');
console.log('Test B: Today reverse → 1405/06/08 Jalali → Gregorian (expect 2026-08-29)');
const todayG = jalaliToGregorian(1405, 6, 8);
console.log('  Result:', todayG[0] + '-' + String(todayG[1]).padStart(2,'0') + '-' + String(todayG[2]).padStart(2,'0'));
if (todayG[0] === 2026) {
  console.log('  ✅ Year 2026 OK');
} else if (todayG[0] >= 2040) {
  console.log('  ❌ WRONG YEAR >= 2040! Algorithm is broken');
}

console.log('');
console.log('Test C: 1405/06/14 Jalali → Gregorian (expect ~2026-09-04)');
const testC = jalaliToGregorian(1405, 6, 14);
console.log('  Result:', testC[0] + '-' + String(testC[1]).padStart(2,'0') + '-' + String(testC[2]).padStart(2,'0'));

console.log('');
console.log('Test D: 1404/12/29 (leap year test, last year) Jalali → Gregorian');
const testD = jalaliToGregorian(1404, 12, 29);
console.log('  Result:', testD[0] + '-' + String(testD[1]).padStart(2,'0') + '-' + String(testD[2]).padStart(2,'0'));

console.log('');
console.log('=== ALGORITHM DEBUG ===');
console.log('The magic constants being used look suspicious:');
console.log('  - 355666 + 365236 - 1595 =', (355666 + 365236 - 1595));
console.log('This large offset is likely the source of the +22 year drift.');
console.log('');
console.log('Expected known conversions:');
console.log('  1 Farvardin 1405 (1405/01/01) = 2026-03-21 (Nowruz)');
const nowruz = jalaliToGregorian(1405, 1, 1);
console.log('  Actual from algorithm:', nowruz[0] + '-' + String(nowruz[1]).padStart(2,'0') + '-' + String(nowruz[2]).padStart(2,'0'));
