# طرح پیاده‌سازی ماژول خدمات (Service Module) - اصلاح شده

این طرح برای پیاده‌سازی کامل ماژول خدمات شامل «کاتالوگ سرویس‌ها» و «تخصیص خدمات به بیماران/سالمندان» (Care Recipients) تدوین شده است.

## ۱. تغییرات Backend (ASP.NET Core)

### ۱.۱. موجودیت‌ها (Entities)

* **ایجاد** **`ServiceDefinition`:**

  * کلاس جدید با فیلدهای: `Id` (Int), `Title`, `Category` (Enum), `DefaultDurationMinutes`, `IsActive`, `Description`.

* **بازنویسی** **`CareService`:**

  * تغییرات در موجودیت فعلی برای اتصال به `CareRecipient` (بیمار/سالمند):

    * افزودن `ServiceDefinitionId` (Foreign Key).

    * افزودن `Status` (Enum: Planned, Completed, Canceled).

    * افزودن `StartTime` و `EndTime`.

    * افزودن `Notes` (یادداشت‌های تکمیلی).

    * *نکته:* این موجودیت به `CareRecipient` متصل است که شامل همه انواع بیماران و سالمندان می‌شود.

### ۱.۲. DTOها و Validation

* ایجاد `ServiceDefinitionDto`, `CreateServiceDefinitionDto`.

* بروزرسانی `CareServiceDto` برای نمایش نام سرویس و وضعیت.

* پیاده‌سازی اعتبارسنجی (FluentValidation) برای جلوگیری از تداخل زمانی خدمات برای یک بیمار.

### ۱.۳. لایه سرویس و کنترلر

* **`ServiceDefinitionsController`:** مدیریت کاتالوگ (CRUD).

* **`CareServicesController`:** مدیریت تخصیص خدمات به بیماران.

### ۱.۴. دیتابیس

* ایجاد Migration جدید (`AddServiceModule`).

* بروزرسانی `DbInitializer` برای افزودن داده‌های اولیه.

***

## ۲. تغییرات Frontend (Next.js)

### ۲.۱. تعاریف و سرویس‌ها

* بروزرسانی `types` برای پشتیبانی از `ServiceDefinition` و وضعیت‌های جدید `CareService`.

* ایجاد سرویس کلاینت `service-catalog.service.ts`.

### ۲.۲. کامپوننت‌ها و صفحات

* **Service Catalog (مدیریت خدمات):**

  * مسیر: `/dashboard/services`

  * جدول لیست خدمات قابل ارائه در مرکز.

* **بروزرسانی سایدبار (`Sidebar.tsx`):**

  * افزودن دکمه «خدمات» (Services).

* **بروزرسانی پروفایل بیمار (`CareServicesTab.tsx`):**

  * امکان انتخاب خدمت از لیست تعریف شده برای بیمار/سالمند.

  * نمایش وضعیت انجام خدمت.

***

## ۳. مراحل اجرایی

1. **Backend:** ایجاد Entityها -> Migration -> Update Database.
2. **Backend:** پیاده‌سازی منطق و API.
3. **Frontend:** ایجاد صفحه مدیریت خدمات (Catalog).
4. **Frontend:** اتصال فرم ثبت خدمت در پروفایل بیمار به کاتالوگ جدید.

