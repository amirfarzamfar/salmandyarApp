# Debug Session: medication-alert-missing
- **Status**: [OPEN]
- **Issue**: هشدار عدم ثبت مصرف دارو در پنل پرستار مسئول و پنل ادمین/سوپروایزر نمایش داده نمی‌شود.
- **Debug Server**: http://127.0.0.1:7777/event
- **Log File**: `.dbg/trae-debug-log-medication-alert-missing.ndjson`

## Reproduction Steps
1. یک دوز دارو را در وضعیت overdue قرار بده.
2. صبر کن تا `CheckMissedDosesAndEscalateAsync` اجرا شود یا آن را دستی اجرا کن.
3. با حساب پرستار مسئول، ادمین یا سوپروایزر وارد شو.
4. بررسی کن آیا عدد زنگوله، لیست اعلان‌ها یا بنر هشدار نمایش داده می‌شود یا نه.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | بک‌اند برای گیرنده‌های مورد انتظار اعلان ایجاد نمی‌کند. | High | Med | Pending |
| B | اعلان در API وجود دارد ولی `NotificationCenter` آن را fetch یا render نمی‌کند. | High | Low | Pending |
| C | رویداد realtime می‌رسد ولی listener آن را به refresh یا بنر تبدیل نمی‌کند. | Med | Low | Pending |
| D | `referenceId` یا `link` اعلان برای هشدار دارویی ناقص است و UI آن را نادیده می‌گیرد. | Med | Low | Pending |
| E | شرط‌های مربوط به نقش یا flagهای دارو باعث حذف پرستار/سوپروایزر از گیرنده‌ها می‌شود. | Med | Med | Pending |

## Log Evidence
- Pending
- Frontend instrumentation build شد.
- Backend build به‌خاطر lock شدن `Salmandyar.API` توسط پروسه‌ی در حال اجرا کامل نشد؛ لازم است API ری‌استارت شود تا instrumentation جدید فعال شود.
- لاگ‌های فرانت نشان دادند در `dashboard` اعلان‌ها fetch می‌شوند اما اعلان دارویی در داده‌ی کاربر مورد تست وجود ندارد؛ در `portal` همان اعلان‌ها موجود هستند.
- بررسی دیتابیس نشان داد بیمار `1007` در `CareRecipients` فاقد `ResponsibleNurseId` است اما در `CareAssignments` یک `PrimaryCaregiver` فعال از نقش `Nurse` دارد.
- بررسی دیتابیس نشان داد اعلان‌های دارویی برای `Admin` و حساب بیمار ذخیره شده‌اند، اما کاربر مورد تست پنل مدیریت نقش `Manager` دارد و در فیلتر گیرنده‌های دارو لحاظ نشده بود.
- بعد از fix دوم، بررسی دیتابیس نشان داد اعلان‌های `هشدار عدم ثبت مصرف دارو` برای `Manager` (`امیر فرزام`) و `Nurse` (`ناصر ربیعی`) با `ReferenceId`های دوزهای overdue ایجاد شده‌اند؛ بنابراین backfill داده با موفقیت انجام شده است.

## Verification Conclusion
- فرضیه `A` تایید شد: لیست گیرنده‌های بک‌اند ناقص بود.
- فرضیه `B` رد شد: UI و API اعلان در `dashboard` کار می‌کنند.
- فرضیه `E` تایید شد: اعلان دارویی باید از `CareAssignments` هم پرستار مسئول را پیدا کند و نقش `Manager` هم در پنل مدیریتی پوشش داده شود.
- fix دوم لازم بود چون اعلان فقط در `EscalationLevel.None` ساخته می‌شد و برای دوزهای قدیمیِ overdue به گیرنده‌های تازه‌اصلاح‌شده backfill انجام نمی‌شد.
