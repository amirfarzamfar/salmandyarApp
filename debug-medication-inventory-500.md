# Debug Session: medication-inventory-500

Status: OPEN

## Symptoms
- ثبت دارو با خطای `Request failed with status code 500` مواجه می‌شود.
- سرویس پس‌زمینه دارو با خطای SQL روی ستون‌های جدید موجودی fail می‌شود.
- پنل بیمار دارای دسترسی ثبت کاردکس باید امکان ویرایش دارو هم داشته باشد.
- UI افزودن داروی جدید در لپ‌تاپ از صفحه بیرون می‌زند و اسکرول مناسب ندارد.

## Hypotheses
1. مایگریشن جدید مدیریت موجودی ساخته شده ولی روی دیتابیس فعلی apply نشده و EF دارد ستون‌هایی را query می‌کند که هنوز در SQL Server وجود ندارند.
2. مسیر ثبت دارو بعد از `SaveChanges` وارد کوئری/لود مجددی می‌شود که به‌خاطر نبود ستون‌های جدید، قبل از بازگشت پاسخ `500` می‌دهد.
3. پنل بیمار در فرانت هنوز `readOnly` یا callbackهای ویرایش را برای لیست داروها غیرفعال نگه می‌دارد، نه اینکه بک‌اند مانع ویرایش باشد.
4. مودال/ویزارد افزودن دارو روی viewport لپ‌تاپ `max-height` و `overflow-y` مناسب ندارد، بنابراین محتوا از صفحه بیرون می‌زند.
5. علاوه بر apply نشدن migration، ممکن است background service قبل از migrate شدن دیتابیس بالا بیاید و خطا را به‌صورت مداوم تکرار کند.

## Current Evidence
- لاگ SQL: `Invalid column name 'AppliedInventoryQuantity'`, `AlertLowStockAdmin`, `DoseQuantity`, ...
- خطا در `MedicationBackgroundService` هنگام اجرای `SendRemindersAsync`.

## Next Steps
- ری‌استارت بک‌اند در حال اجرا تا باینری جدید با اسکیمای اصلاح‌شده همگام شود
- تست ثبت دارو و تست ویرایش دارو از پنل بیمار
- تایید نهایی کاربر برای بستن سشن دیباگ

## Findings
- `Program.cs` در startup `Database.MigrateAsync()` را صدا می‌زند، اما دیتابیس روی migration قدیمی `20260602100000_EnforceUniquePatientProfileDocuments` گیر کرده بود.
- علت گیرکردن migration قدیمی: ستون `UploadedDocuments.DocumentType` از نوع مناسب برای ایندکس نبود؛ با محدودکردن به `nvarchar(100)` و اعمال SQL مستقیم، migration unblock شد.
- migration جدید موجودی دارو نیز روی دیتابیس دستی و idempotent اعمال شد و ستون‌های `DoseQuantity` و `AppliedInventoryQuantity` و جداول تاریخچه ایجاد شدند.
- در پنل بیمار، لیست داروها عملاً با `readOnly` رندر می‌شد؛ این رفتار اصلاح شد تا کاربر دارای دسترسی کاردکس بتواند ویرایش کند، ولی حذف و مدیریت موجودی دستی همچنان برای او غیرفعال بماند.
- UI ویزارد دارو و مودال‌های وابسته برای لپ‌تاپ به `max-height` و `overflow-y-auto` مناسب مجهز شد.
