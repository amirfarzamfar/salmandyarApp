# [OPEN] Debug Session: guest-request-submit-error

## Summary
- Symptom: ثبت «درخواست خدمت بدون نیاز به ثبت‌نام» در لندینگ هنگام Submit خطا می‌دهد.
- Expected: درخواست بدون خطا ثبت شود و پیام موفقیت نمایش داده شود.
- Scope: Landing Page → بخش Guest Request.

## Hypotheses (Falsifiable)
- A) Payload/validation: داده‌های ارسالی با مدل بک‌اند نمی‌خواند (missing/invalid fields) و 400 برمی‌گردد.
- B) Routing/endpoint: فرانت به endpoint اشتباه یا مسیر/proxy نامعتبر می‌زند (404/405).
- C) Auth/CORS: درخواست به دلیل CORS یا هدرهای امنیتی/Origin در مرورگر بلاک می‌شود.
- D) Server error: بک‌اند 500 می‌دهد (Exception هنگام ساخت GuestRequest).
- E) UI state: فرانت قبل از تکمیل request state را اشتباه مدیریت می‌کند (double-submit / race) و خطا می‌سازد.

## Evidence Plan
- Instrumentation در لحظه submit:
  - route/URL, method, payload keys
  - status code + response body (truncate)
  - fetch/network error details (name/message)
  - traceId برای هر submit

## Progress Log
- [ ] Start debug server
- [ ] Add instrumentation logs (frontend)
- [ ] Reproduce and collect pre-fix logs
- [ ] Analyze evidence → confirm hypothesis
- [ ] Apply minimal fix
- [ ] Verify with post-fix logs

