# Debug Session: app-start-failure

- Status: OPEN
- StartedAtUtc: 2026-06-26
- Scope: بررسی علت اجرا نشدن backend و frontend

## Symptoms

- Backend اجرا نمی‌شود.
- Frontend اجرا نمی‌شود.

## Initial Hypotheses

1. تنظیمات محیطی یا connection string/backend secretها نامعتبر است و API در startup fail می‌شود.
2. پورت، آدرس API، یا dependencyهای فرانت‌اند/بک‌اند با env فعلی سازگار نیست و dev server هنگام startup خطا می‌دهد.
3. migration یا اتصال PostgreSQL باعث crash یا block شدن startup بک‌اند شده است.
4. یکی از تغییرات اخیر در notification system باعث exception در startup/runtime اولیه شده است.
5. خطا از business logic نیست و از فرآیند اجرا، working directory، یا command اشتباه ناشی می‌شود.

## Evidence Log

- Pending

## Fixes

- Pending

## Verification

- Pending
