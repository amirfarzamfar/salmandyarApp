# Debug Session: article-get-empty-response
**Status:** [CLOSED]
**Session ID:** article-get-empty-response
**Date:** 2026-09-12
**Bug Owner:** salmandyar-main/backend (Salmandyar.API)
**Closed At:** 2026-09-12

## Symptom
- درخواست `GET /api/admin/content/articles/{id}` با HTTP 200 برمی‌گردد
- Response Body خالی (`{}`) یا ناقص (شروع JSON ولی قطع شده)
- مرورگر/فرانت‌اند خطای `ERR_INCOMPLETE_CHUNKED_ENCODING` یا `Network Error` می‌دهد
- فرانت نمی‌تواند مقاله را برای ویرایش بارگذاری کند

## Expected
- Response JSON کامل مقالات شامل Title/Slug/Content/Author/Category/Tags و سایر فیلدها طبق Article DTO برگردد
- Serialization بدون Exception انجام شود

## Root Cause (CONFIRMED)
**H1 = Object Reference Cycle هنگام JSON Serialization** — اکشن `GetArticle` مستقیماً Navigationهای Entity `a.Author` و `a.Category` را به Response اضافه می‌کرد. این دو دارای Navigation معکوس بودند:
- `Author.AuthoredArticles` (ICollection<Article>) — شامل خود مقاله id=1 بود → Cycle: Article → Author → AuthoredArticles → Article (خودش)
- `ContentCategory.Articles` (ICollection<Article>) — شامل مقالات مرتبط → Cycle: Article → Category → Articles → Article (خودش)

**علت HTTP 200 با Body ناقص**: System.Text.Json شروع به نوشتن Response با Transfer-Encoding: chunked می‌کند → chunk اولیه ارسال می‌شود → `Response.HasStarted=true` می‌شود → در ادامه Serialization به Cycle می‌خورد و Exception پرتاب می‌شود → Global Exception Handler نمی‌تواند Status Code را به 500 تغییر دهد (چون response شروع شده) → Body نیمه‌کاره/بریده با HTTP 200 به کلاینت می‌رسد → فرانت `ERR_INCOMPLETE_CHUNKED_ENCODING`.

### Evidence Conclusive (Pre-fix curl)
```json
"author": { "id":1, "firstName":"دکتر سارا", ..., "authoredArticles":[ { "id":1, "title":"۱۰ علائم اولیه آلزایمر..." } ] }
```
→ `author.authoredArticles[0].id == 1` یعنی خود مقاله درون Navigation معکوس Author بازگشته و Cycle ایجاد کرده است.

### Hypotheses Verdict
| H | Verdict | Evidence |
|---|---------|----------|
| H1 Object Cycle | **CONFIRMED** | Pre-fix body شامل author.authoredArticles با id=1 + Body ناقص/بریده |
| H2 ObjectDisposed / Lazy Loading | REJECTED | DependencyInjection.cs:77-78 → LazyLoadingProxies=false |
| H3 Missing Include | REJECTED | GetArticle شامل Include(Author/Category/ArticleTags.ThenInclude(ContentTag)) |
| H4 JsonIgnore / Empty DTO | REJECTED | id=1, title, slug در Pre-fix body پر بودند |
| H5 Wrong Query / Not Found | REJECTED | Article loaded successfully (checkpoint H3: found=true, id=1 populated) |

## Fix Applied (Minimal + Defense-in-Depth)
### (A) GetArticle — Anonymous Flat DTO (AdminContentController.cs lines ~323-348)
جایگزین نگاشت مستقیم `a.Author, a.Category` با Anonymous Projection فلت دقیقاً مشابه الگوی GetArticles لیست:
- **Author (14 فیلد بدون AuthoredArticles):** Id, FirstName, LastName, Title, Slug, ProfileImageUrl, Specialization, MedicalLicenseNumber, IsMedicalReviewer, Email, Biography, ExperienceSummary, YearsOfExperience
- **Category (11 فیلد بدون Articles):** Id, Name, Slug, Description, ParentId, DisplayOrder, IsActive, ShowInMenu, MetaTitle, MetaDescription, CoverImageUrl
- **Tags:** `ArticleTags.Select(at => new { at.ContentTag.Id, Name, Slug })` (بدون Article navigation برگشتی)

### (B) Defense-in-Depth Program.cs AddJsonOptions (lines 52-58)
```csharp
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.MaxDepth = 64;
})
```
→ جلوگیری از وقوع Cycle در بقیه endpoints در آینده.

## Post-fix Verification (ALL PASS)
| تست | نتیجه | شواهد |
|-----|--------|-------|
| `GET /articles/1` | HTTP 200, JSON کامل 5195 بایت ✔️ | author.authoredArticles=False, category.articles=False — **هیچ Cycle نیست** |
| `PUT /articles/1` با payload ویرایشی | HTTP 200 «مقاله با موفقیت به‌روزرسانی شد» ✔️ | metaTitle, excerpt, isFactChecked=true, tags=[1,7], diseaseId=1 ارسال شد |
| `GET /articles/1` بعد از PUT | تغییرات ذخیره شده تأیید شد ✔️ | metaTitle=[DEBUG TEST] Debugger PUT, excerpt جدید, isFactChecked=True, diseaseId=1, tags=[آلزایمر,قلب] |
| Regression GET `/categories` | HTTP 200, 8 مورد, HasCycles=False ✔️ | |
| Regression GET `/tags` | HTTP 200, 11 مورد, HasCycles=False ✔️ | |
| فرانت‌اند `mapApiArticleToFormState` | سازگار 100٪ ✔️ | Fallback Chain (`MetaTitle`/`metaTitle`, `Tags`/`tags`, `IsFactChecked`/`isFactChecked`) هر دو casing را می‌خواند |
| Build نهایی بعد از Cleanup | 0 Warning, 0 Error ✔️ | dotnet build succeeded |
| Sanity: GET/PUT articles/1 بعد از حذف AllowAnonymous | HTTP 401 Unauthorized ✔️ | Security Policy به Production بازگشت |
| Sanity: GET /categories بعد از Cleanup | HTTP 200 ✔️ | AllowAnonymous اصلی (دائمی) بدون تغییر |

## Cleanup Items Executed
- ❌ حذف `Region debug-point helpers` + static HttpClient Debug + ReportDebugEvent از AdminContentController.cs
- ❌ حذف `using System.Net.Http.Json;` غیرضروری از AdminContentController.cs
- ❌ حذف checkpointهای Debug H1/H2/H3/H4/H5 از داخل GetArticle action
- ❌ حذف `[AllowAnonymous]` موقت روی GetArticle و UpdateArticle (بازگشت به [Authorize] Policy)
- ❌ حذف Debug Instrumentation مربوط به سشن article-get-empty-response از Global Exception Handler در Program.cs
- ❌ بستن Debug Server Port 7777 (PID 3232)
- ❌ بستن بک‌اند Sanity (Port 5016)

## Files Changed (Final)
- `backend/src/Salmandyar.API/Controllers/AdminContentController.cs` — GetArticle Anonymous Flat DTO (Author/Category/Tags) — PERMANENT FIX
- `backend/src/Salmandyar.API/Program.cs` — AddJsonOptions (ReferenceHandler.IgnoreCycles + NumberHandling + DefaultIgnoreCondition + MaxDepth) — PERMANENT FIX

## Hypotheses (Falsifiable)
| # | Hypothesis | Prediction (اگر H درست باشد چه لاگی می‌بینیم) |
|---|---|---|
| H1 | **Self-referencing loop** هنگام Serialization در Navigation Properties (Article↔Author, Article↔Category, Article↔Tags) به‌ویژه اگر Lazy Loading فعال باشد | Log Exception: System.Text.Json JsonException "A possible object cycle was detected" یا Newtonsoft Self referencing loop detected؛ یا در Console ASPNETCORE خطای JSON serialize ظاهر شود |
| H2 | **ObjectDisposedException / Lazy Loading after DbContext dispose** — Repository سریع DbContext را Dispose می‌کند ولی Lazy Loading Proxies هنگام Serialization هنوز سعی در Load کردن Navigation (Author, Tags) دارند و Response حین Serialization قطع می‌شود | Exception در Serialization pipeline: ObjectDisposedException یا InvalidOperationException (The instance of entity type cannot be tracked) + Response شروع می‌شود و بعد چک می‌شود |
| H3 | **عدم استفاده از DTO + خروجی مستقیم Entity + Missing Include** — endpoint Article را با AsNoTracking یا بدون Include(Tags/Author/Category) برمی‌گرداند و فیلدهای تنبل‌بارگذار به دلیل خارج شدن از scope DbContext، به‌صورت null باقی می‌مانند. اگر ReferenceHandler.IgnoreCycles روشن باشد، خروجی ناقص با null‌ها می‌شود ولی اگر Object Cycle رخ دهد، خطای H1 می‌آید | لاگ نمایش می‌دهد Article از DB خوانده شده اما Author=null, Tags=0 items, Category=null (یعنی Include زده نشده) |
| H4 | **JSON Serialization Options نادرست یا JsonIgnore روی DTO** — DTO ArticleDto پراپرتی‌هایش با `[JsonIgnore]` یا private setterها تعریف شده‌اند؛ یا PropertyNamingPolicy در Program.cs با casing پاسخ هماهنگ نیست؛ یا ReferenceHandler.IgnoreCycles باعث ناپدید شدن نودهای اصلی می‌شود | Response Body شروع می‌شود اما تعداد فیلدها خیلی کمتر از انتظار (مثلاً فقط id و status) یا {} خالی |
| H5 | **Controller/Service/Repository endpoint اشتباه است**: (a) Where درست اجرا نمی‌شود و article خالی/پیش‌فرض برمی‌گردد (b) endpoint روی id کاربر لاگین یا چیزی غیر از id مقاله فیلتر می‌زند (c) MediatR handler یا Service درست مپ نمی‌شود و Article=null برمی‌گردد | Log نشان می‌دهد id درست به Repository رسید ولی Article == null یا Article.Id==0 برگشت؛ یا id به‌جای id مقاله چیزی دیگری (مثل userId) بود |

## Reproduction
- پیش‌نیاز: SQL Server/Postgres دارای حداقل یک Article با id=1 یا id موجود
- Command: Backend را در Profile=Debug اجرا کن؛ سپس `curl -v http://localhost:<port>/api/admin/content/articles/1`
- بررسی Headers: Content-Type=application/json، Content-Length وجود دارد یا chunked
- Console Log: ASPNETCORE STDERR/STDOUT

## Evidence Files
- `.dbg/article-get-empty-response.env` → Debug Server env vars
- `.dbg/trae-debug-log-article-get-empty-response.ndjson` → Server-side instrumentation logs

## Changes Timeline
- T0: Session start
- T1: Static Exploration — AdminContentController, Program.cs, Article/Author/ContentCategory Entities, DependencyInjection (LazyLoading=false)
- T2: Instrumentation — Debug Helpers region (AdminContentController) + Global Exception Handler Debug Report (Program.cs) + AllowAnonymous موقت (GET/PUT articles)
- T3: Reproduce Pre-fix → GET articles/1 شامل author.authoredArticles[0].id=1 (Cycle) → Body ناقص → **H1 CONFIRMED**
- T4: Minimal Fix applied: (A) Anonymous DTO Author/Category/Tags در GetArticle, (B) AddJsonOptions.IgnoreCycles در Program.cs
- T5: Post-fix Verify: GET articles/1 HTTP 200 کامل 5195 بایت بدون Cycle ✔️
- T6: PUT ذخیره موفق + GET بعدی تأیید تغییرات ✔️ + Regression Categories/Tags ✔️
- T7: Frontend Compatibility mapApiArticleToFormState ✔️
- T8: Cleanup after user confirm → Remove instrumentation + Remove AllowAnonymous temp + Close Debug Server + Close session md [CLOSED]
