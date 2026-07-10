# Debug Session: caregiver-profile-90
- **Status**: [OPEN]
- **Issue**: پروفایل استخدامی پرستار/سالمندیار با وجود تکمیل ظاهری همه مراحل روی 90 درصد می‌ماند و ثبت نهایی با پیام «برای تکمیل نهایی، تمام مراحل الزامی را تکمیل کنید.» شکست می‌خورد.
- **Debug Server**: pending
- **Log File**: .dbg/trae-debug-log-caregiver-profile-90.ndjson

## Reproduction Steps
1. ورود به مسیر تکمیل پروفایل استخدامی پرسنل درمانی
2. تکمیل همه مراحل قابل مشاهده در فرم
3. خالی گذاشتن بخش دوره‌ها و گواهینامه‌ها
4. تلاش برای ثبت نهایی
5. مشاهده ماندن درصد روی 90 و خطای ثبت نهایی

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | بک‌اند هنوز `certificates` را در محاسبه درصد و شرط تکمیل نهایی الزامی حساب می‌کند. | High | Low | Pending |
| B | بک‌اند برای رسیدن به 100 درصد به فیلد پنهان `PersonalPhotoUrl` وابسته است که در UI مرحله‌ای اعتبارسنجی نمی‌شود. | High | Low | Pending |
| C | هنگام ثبت نهایی، آخرین تغییرات فرم هنوز autosave نشده و endpoint داده قدیمی را بررسی می‌کند. | Medium | Medium | Pending |
| D | یکی از مدارک الزامی در فرانت تکمیل دیده می‌شود ولی در `RequiredDocumentTypes` بک‌اند هنوز ناقص است. | Medium | Medium | Pending |

## Log Evidence
- کد سرویس نشان می‌داد `CalculateCompletionPercentage` برای مرحله 1 علاوه بر فیلدهای UI به `PersonalPhotoUrl` هم وابسته است.
- همان متد برای مرحله 6 فقط در صورت `Certificates.Count > 0` امتیاز مرحله را کامل می‌کرد.
- در فرانت نیز `validateStep(6)` همچنان نبودن `certificates` را خطا می‌داد.
- پس از اعمال فیکس، `dotnet build backend/src/Salmandyar.API/Salmandyar.API.csproj -c Debug` با موفقیت build شد.
- پس از اعمال فیکس، `npm --prefix frontend run build` با موفقیت build شد.

## Verification Conclusion
- Hypothesis A: **Confirmed**. `certificates` هم در فرانت و هم در بک‌اند هنوز به‌عنوان شرط تکمیل حساب می‌شد.
- Hypothesis B: **Confirmed**. `PersonalPhotoUrl` یک الزام پنهان برای 100 درصد بود که در UI مرحله‌ای متناظر نداشت.
- Hypothesis C: **Not yet verified**. instrumentation برای بررسی race احتمالی autosave نگه داشته شد.
- Hypothesis D: **Not primary root cause** در بررسی ایستا؛ mismatch اصلی از `certificates` و `PersonalPhotoUrl` بود.

### Applied Fix
1. مرحله `دوره‌ها و گواهینامه‌ها` در فرانت اختیاری شد.
2. مرحله `دوره‌ها و گواهینامه‌ها` در محاسبه درصد بک‌اند اختیاری شد.
3. وابستگی پنهان `PersonalPhotoUrl` از محاسبه مرحله هویتی حذف شد.
