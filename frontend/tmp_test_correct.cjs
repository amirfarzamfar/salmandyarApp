const DateObject = require('react-date-object').default;
const persianCalendar = require('react-date-object/calendars/persian').default;
const persianFaLocale = require('react-date-object/locales/persian_fa').default;

console.log('=== Test DateObject native conversion (CORRECT approach) ===');
console.log('');

console.log('Test 1: Create a Persian date and get the native JS Date (Gregorian)');
const dateObj1 = new DateObject({
  calendar: persianCalendar,
  locale: persianFaLocale,
  year: 1405,
  month: 6,
  day: 14,
  hour: 9,
  minute: 0,
});

console.log('  Input Jalali: 1405/06/14 09:00');
console.log('  dateObj.toDate() (this should be a Gregorian Date object):', dateObj1.toDate());
console.log('  .toDate().toISOString() =', dateObj1.toDate().toISOString());
console.log('  .toDate().getFullYear() =', dateObj1.toDate().getFullYear(), '(expect 2026)');
console.log('  .format() (persian) =', dateObj1.format('YYYY/MM/DD HH:mm'));

const year1 = dateObj1.toDate().getUTCFullYear();
if (year1 === 2026) {
  console.log('  ✅ CORRECT! Gregorian year = 2026');
  const d = dateObj1.toDate();
  console.log('     Full Gregorian date (UTC):', d.getUTCFullYear() + '-' + String(d.getUTCMonth()+1).padStart(2,'0') + '-' + String(d.getUTCDate()).padStart(2,'0'));
  console.log('     Expected approx: 2026-09-04');
} else if (year1 >= 2040) {
  console.log('  ❌ STILL WRONG! year >= 2040');
} else {
  console.log('  Year =', year1);
}

console.log('');
console.log('Test 2: Nowruz 1405 (1405/01/01)');
const dateObj2 = new DateObject({
  calendar: persianCalendar,
  locale: persianFaLocale,
  year: 1405,
  month: 1,
  day: 1,
});
const d2 = dateObj2.toDate();
console.log('  .toDate() ISO =', d2.toISOString());
console.log('  Expected: 2026-03-20 or 2026-03-21 (Nowruz)');
if (d2.getUTCFullYear() === 2026 && d2.getUTCMonth() + 1 === 3) {
  console.log('  ✅ CORRECT! March 2026 Nowruz');
}

console.log('');
console.log('Test 3: Reverse - take a known Gregorian date and convert via Intl API to Jalali components to verify');
const knownGregorian = new Date(Date.UTC(2026, 2, 21, 0, 0, 0)); // March 21, 2026 UTC = Nowruz 1405
console.log('  Input Gregorian: 2026-03-21');
console.log('  UTC ISO =', knownGregorian.toISOString());
// Use Intl to extract Jalali components
const faIntl = new Intl.DateTimeFormat('en-US-u-ca-persian', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  timeZone: 'UTC',
});
const parts = faIntl.formatToParts(knownGregorian);
const yearPart = parts.find(p => p.type === 'year');
const monthPart = parts.find(p => p.type === 'month');
const dayPart = parts.find(p => p.type === 'day');
console.log('  Intl Persian components:', yearPart.value + '/' + monthPart.value + '/' + dayPart.value);
console.log('  Expected 1405/01/01 for Nowruz');

console.log('');
console.log('Test 4: Convert 2026-08-29 (today) to Jalali using Intl (expect 1405/06/08)');
const todayG = new Date(Date.UTC(2026, 7, 29, 12, 0, 0));
const partsT = faIntl.formatToParts(todayG);
const yT = partsT.find(p => p.type === 'year').value;
const mT = partsT.find(p => p.type === 'month').value;
const dT = partsT.find(p => p.type === 'day').value;
console.log('  Intl result:', yT + '/' + mT + '/' + dT);
