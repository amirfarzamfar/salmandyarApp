using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Infrastructure.Persistence;

public static class DbInitializer
{
    private static DateTime UtcDate(int year, int month, int day) =>
        DateTime.SpecifyKind(new DateTime(year, month, day), DateTimeKind.Utc);

    public static async Task SeedAsync(
        ApplicationDbContext context,
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        bool seedRoles,
        bool seedAdminUser,
        bool seedServiceDefinitions,
        bool seedSampleData,
        SeedAdminUserOptions adminOptions)
    {
        var systemRoles = new[]
        {
            Roles.Admin,
            Roles.SuperAdmin,
            Roles.Manager,
            Roles.Supervisor,
            Roles.Nurse,
            Roles.AssistantNurse,
            Roles.Physiotherapist,
            Roles.ElderlyCareAssistant,
            Roles.Elderly,
            Roles.Patient,
            Roles.PatientFamily
        };

        if (seedRoles || seedAdminUser)
        {
            foreach (var role in systemRoles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        if (seedAdminUser &&
            !string.IsNullOrWhiteSpace(adminOptions.Email) &&
            !string.IsNullOrWhiteSpace(adminOptions.PhoneNumber) &&
            !string.IsNullOrWhiteSpace(adminOptions.Password))
        {
            var adminUser = await userManager.FindByNameAsync(adminOptions.PhoneNumber)
                ?? await userManager.Users.FirstOrDefaultAsync(u =>
                    u.PhoneNumber == adminOptions.PhoneNumber ||
                    u.Email == adminOptions.Email);

            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = adminOptions.PhoneNumber,
                    Email = adminOptions.Email,
                    FirstName = string.IsNullOrWhiteSpace(adminOptions.FirstName) ? "مدیر" : adminOptions.FirstName,
                    LastName = string.IsNullOrWhiteSpace(adminOptions.LastName) ? "سیستم" : adminOptions.LastName,
                    PhoneNumber = adminOptions.PhoneNumber,
                    EmailConfirmed = true,
                    IsActive = true
                };
                var createResult = await userManager.CreateAsync(adminUser, adminOptions.Password);
                if (!createResult.Succeeded)
                {
                    throw new InvalidOperationException($"ساخت کاربر SuperAdmin انجام نشد: {string.Join(", ", createResult.Errors.Select(x => x.Description))}");
                }
            }
            else
            {
                adminUser.UserName = adminOptions.PhoneNumber;
                adminUser.Email = adminOptions.Email;
                adminUser.PhoneNumber = adminOptions.PhoneNumber;
                adminUser.FirstName = string.IsNullOrWhiteSpace(adminOptions.FirstName) ? adminUser.FirstName : adminOptions.FirstName;
                adminUser.LastName = string.IsNullOrWhiteSpace(adminOptions.LastName) ? adminUser.LastName : adminOptions.LastName;
                adminUser.EmailConfirmed = true;
                adminUser.IsActive = true;

                var updateResult = await userManager.UpdateAsync(adminUser);
                if (!updateResult.Succeeded)
                {
                    throw new InvalidOperationException($"به‌روزرسانی کاربر SuperAdmin انجام نشد: {string.Join(", ", updateResult.Errors.Select(x => x.Description))}");
                }

                var passwordValid = await userManager.CheckPasswordAsync(adminUser, adminOptions.Password);
                if (!passwordValid)
                {
                    var hasPassword = await userManager.HasPasswordAsync(adminUser);
                    IdentityResult passwordResult;

                    if (hasPassword)
                    {
                        var resetToken = await userManager.GeneratePasswordResetTokenAsync(adminUser);
                        passwordResult = await userManager.ResetPasswordAsync(adminUser, resetToken, adminOptions.Password);
                    }
                    else
                    {
                        passwordResult = await userManager.AddPasswordAsync(adminUser, adminOptions.Password);
                    }

                    if (!passwordResult.Succeeded)
                    {
                        throw new InvalidOperationException($"تنظیم رمز عبور کاربر SuperAdmin انجام نشد: {string.Join(", ", passwordResult.Errors.Select(x => x.Description))}");
                    }
                }
            }

            var currentRoles = await userManager.GetRolesAsync(adminUser);
            var rolesToRemove = currentRoles
                .Where(role => !string.Equals(role, Roles.SuperAdmin, StringComparison.OrdinalIgnoreCase))
                .ToArray();

            if (rolesToRemove.Length > 0)
            {
                var removeRolesResult = await userManager.RemoveFromRolesAsync(adminUser, rolesToRemove);
                if (!removeRolesResult.Succeeded)
                {
                    throw new InvalidOperationException($"حذف نقش‌های اضافی کاربر SuperAdmin انجام نشد: {string.Join(", ", removeRolesResult.Errors.Select(x => x.Description))}");
                }
            }

            if (!await userManager.IsInRoleAsync(adminUser, Roles.SuperAdmin))
            {
                var roleResult = await userManager.AddToRoleAsync(adminUser, Roles.SuperAdmin);
                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException($"اختصاص نقش SuperAdmin انجام نشد: {string.Join(", ", roleResult.Errors.Select(x => x.Description))}");
                }
            }
        }

        // Seed Services
        if (seedServiceDefinitions && !context.ServiceDefinitions.Any())
        {
            var services = new List<ServiceDefinition>
            {
                new ServiceDefinition { Code = "INJECTION", Title = "تزریقات", Category = ServiceCategory.Nursing, Description = "تزریق عضلانی یا وریدی" },
                new ServiceDefinition { Code = "WOUND", Title = "پانسمان", Category = ServiceCategory.Nursing, Description = "تعویض پانسمان زخم" },
                new ServiceDefinition { Code = "SUCTION", Title = "ساکشن", Category = ServiceCategory.Nursing, Description = "ساکشن ترشحات تنفسی" },
                new ServiceDefinition { Code = "DOCTOR", Title = "ویزیت پزشک عمومی", Category = ServiceCategory.Medical, Description = "معاینه عمومی بیمار" },
                new ServiceDefinition { Code = "PHYSIO", Title = "فیزیوتراپی", Category = ServiceCategory.Rehabilitation, Description = "تمرینات حرکتی و فیزیوتراپی" },
                new ServiceDefinition { Code = "ELDER", Title = "سالمندیار", Category = ServiceCategory.PersonalCare, Description = "مراقبت تخصصی از سالمند در منزل" },
                new ServiceDefinition { Code = "ICU", Title = "پرستار ICU در منزل", Category = ServiceCategory.Nursing, Description = "مراقبت‌های ویژه و ICU در منزل" },
                new ServiceDefinition { Code = "CATHETER", Title = "تعویض سوند", Category = ServiceCategory.Nursing, Description = "تعویض سوند ادراری" }
            };
            context.ServiceDefinitions.AddRange(services);
            await context.SaveChangesAsync();
        }

        if (seedServiceDefinitions && !context.AssessmentForms.Any(f => f.Workflow == AssessmentFormWorkflow.HomeCareRequest))
        {
            var icuService = await context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Code == "ICU");
            var physioService = await context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Code == "PHYSIO");
            var elderService = await context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Code == "ELDER");

            var forms = new List<AssessmentForm>();

            if (icuService != null)
            {
                var form = new AssessmentForm
                {
                    Code = "home-care-icu-v1",
                    Title = "ویزارد درخواست پرستار ICU در منزل",
                    Description = "ثبت مرحله‌ای نیازهای بیمار ICU، تجهیزات، زمان و مدارک",
                    Type = AssessmentType.PatientFamily,
                    TargetTypesJson = "[17,18]",
                    Workflow = AssessmentFormWorkflow.HomeCareRequest,
                    Version = 1,
                    IsActive = true,
                    IsDefault = true,
                    ServiceDefinitionId = icuService.Id,
                    IntroTitle = "درخواست مراقبت ویژه در منزل",
                    IntroDescription = "این فرم برای بیماران ICU، تراکئوستومی، ونتیلاتور و مراقبت‌های ویژه طراحی شده است.",
                    EstimatedDurationMinutes = 12,
                    Questions = new List<AssessmentQuestion>
                    {
                        new() { Order = 0, QuestionKey = "patient_relationship", PageKey = "patient", PageTitle = "شناخت بیمار", Text = "درخواست برای چه کسی است؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("خودم", "پدر", "مادر", "همسر", "فرزند", "فرد دیگر") },
                        new() { Order = 1, QuestionKey = "patient_status", PageKey = "patient", PageTitle = "شناخت بیمار", Text = "وضعیت بیمار چیست؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("منزل", "بیمارستان", "ICU", "CCU", "بعد از عمل", "توانبخشی") },
                        new() { Order = 2, QuestionKey = "service_reason", PageKey = "patient", PageTitle = "شناخت بیمار", Text = "دلیل اصلی درخواست چیست؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("مراقبت ICU", "مراقبت بعد از ترخیص", "مدیریت دارو", "پانسمان", "سایر") },
                        new() { Order = 3, QuestionKey = "icu_equipment", PageKey = "icu-needs", PageTitle = "نیازهای تخصصی ICU", Text = "کدام تجهیزات یا شرایط را دارد؟", Type = QuestionType.MultiSelect, IsRequired = true, Options = BuildOptions("ونتیلاتور", "تراکئوستومی", "PEG", "سوند", "اکسیژن", "زخم بستر") },
                        new() { Order = 4, QuestionKey = "consciousness_level", PageKey = "icu-needs", PageTitle = "نیازهای تخصصی ICU", Text = "سطح هوشیاری بیمار را توضیح دهید", Type = QuestionType.ShortAnswer, IsRequired = true, Placeholder = "مثال: پاسخ‌گو به صدا" },
                        new() { Order = 5, QuestionKey = "priority_factor", PageKey = "priority", PageTitle = "اولویت بیمار", Text = "مهم‌ترین معیار انتخاب نیرو چیست؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("قیمت مناسب", "نزدیک‌ترین نیرو", "باتجربه‌ترین نیرو", "جنسیت", "سابقه ICU") },
                        new() { Order = 6, QuestionKey = "start_date", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "تاریخ شروع", Type = QuestionType.Date, IsRequired = true },
                        new() { Order = 7, QuestionKey = "start_time", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "ساعت شروع", Type = QuestionType.Time, IsRequired = true },
                        new() { Order = 8, QuestionKey = "city", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "شهر", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 9, QuestionKey = "address", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "آدرس", Type = QuestionType.LongAnswer, IsRequired = true },
                        new() { Order = 10, QuestionKey = "floor", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "طبقه", Type = QuestionType.ShortAnswer, IsRequired = false },
                        new() { Order = 11, QuestionKey = "has_elevator", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "آسانسور دارد؟", Type = QuestionType.Switch, IsRequired = true },
                        new() { Order = 12, QuestionKey = "home_conditions", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "شرایط منزل", Type = QuestionType.LongAnswer, IsRequired = false },
                        new() { Order = 13, QuestionKey = "medical_documents", PageKey = "documents", PageTitle = "مدارک پزشکی", Text = "مدارک پزشکی مرتبط", Type = QuestionType.File, IsRequired = false, AllowMultipleFiles = true, MaxFiles = 6 },
                        new() { Order = 14, QuestionKey = "contact_first_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 15, QuestionKey = "contact_last_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام خانوادگی", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 16, QuestionKey = "contact_mobile", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "شماره موبایل", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 17, QuestionKey = "preferred_contact_method", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "روش ارتباط ترجیحی", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("تماس", "واتساپ", "پیامک", "چت داخل برنامه") },
                        new() { Order = 18, QuestionKey = "contact_time_preference", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "زمان مناسب تماس", Type = QuestionType.ShortAnswer, IsRequired = false }
                    }
                };
                forms.Add(form);
                icuService.DefaultForm = form;
            }

            if (physioService != null)
            {
                var form = new AssessmentForm
                {
                    Code = "home-care-physio-v1",
                    Title = "ویزارد درخواست فیزیوتراپی در منزل",
                    Description = "ارزیابی داینامیک نیازهای حرکتی و توانبخشی بیمار",
                    Type = AssessmentType.PatientFamily,
                    TargetTypesJson = "[17,18]",
                    Workflow = AssessmentFormWorkflow.HomeCareRequest,
                    Version = 1,
                    IsActive = true,
                    IsDefault = true,
                    ServiceDefinitionId = physioService.Id,
                    IntroTitle = "درخواست فیزیوتراپی در منزل",
                    IntroDescription = "برای انتخاب دقیق‌تر فیزیوتراپیست، لطفاً شرایط حرکتی بیمار را ثبت کنید.",
                    EstimatedDurationMinutes = 9,
                    Questions = new List<AssessmentQuestion>
                    {
                        new() { Order = 0, QuestionKey = "patient_relationship", PageKey = "patient", PageTitle = "شناخت بیمار", Text = "درخواست برای چه کسی است؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("خودم", "پدر", "مادر", "همسر", "فرزند", "فرد دیگر") },
                        new() { Order = 1, QuestionKey = "patient_status", PageKey = "patient", PageTitle = "شناخت بیمار", Text = "وضعیت بیمار چیست؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("منزل", "بعد از عمل", "توانبخشی", "بعد از ترخیص") },
                        new() { Order = 2, QuestionKey = "movement_problem", PageKey = "physio", PageTitle = "ارزیابی حرکتی", Text = "مشکل حرکتی اصلی", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 3, QuestionKey = "affected_limb", PageKey = "physio", PageTitle = "ارزیابی حرکتی", Text = "عضو درگیر", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 4, QuestionKey = "session_count", PageKey = "physio", PageTitle = "ارزیابی حرکتی", Text = "تعداد جلسات موردنیاز", Type = QuestionType.Number, IsRequired = true, MinValue = 1, MaxValue = 60 },
                        new() { Order = 5, QuestionKey = "walking_ability", PageKey = "physio", PageTitle = "ارزیابی حرکتی", Text = "توانایی راه رفتن", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("مستقل", "با واکر", "با کمک فرد دیگر", "عدم توانایی") },
                        new() { Order = 6, QuestionKey = "priority_factor", PageKey = "priority", PageTitle = "اولویت بیمار", Text = "مهم‌ترین معیار انتخاب نیرو چیست؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("باتجربه‌ترین نیرو", "نزدیک‌ترین نیرو", "قیمت مناسب", "جنسیت") },
                        new() { Order = 7, QuestionKey = "start_date", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "تاریخ شروع", Type = QuestionType.Date, IsRequired = true },
                        new() { Order = 8, QuestionKey = "city", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "شهر", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 9, QuestionKey = "address", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "آدرس", Type = QuestionType.LongAnswer, IsRequired = true },
                        new() { Order = 10, QuestionKey = "contact_first_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 11, QuestionKey = "contact_last_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام خانوادگی", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 12, QuestionKey = "contact_mobile", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "شماره موبایل", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 13, QuestionKey = "preferred_contact_method", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "روش ارتباط ترجیحی", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("تماس", "واتساپ", "پیامک", "چت داخل برنامه") }
                    }
                };
                forms.Add(form);
                physioService.DefaultForm = form;
            }

            if (elderService != null)
            {
                var form = new AssessmentForm
                {
                    Code = "home-care-elder-v1",
                    Title = "ویزارد درخواست سالمندیار",
                    Description = "ارزیابی سطح وابستگی سالمند و نوع مراقبت موردنیاز",
                    Type = AssessmentType.PatientFamily,
                    TargetTypesJson = "[17,18]",
                    Workflow = AssessmentFormWorkflow.HomeCareRequest,
                    Version = 1,
                    IsActive = true,
                    IsDefault = true,
                    ServiceDefinitionId = elderService.Id,
                    IntroTitle = "درخواست سالمندیار در منزل",
                    IntroDescription = "برای انتخاب مناسب‌ترین سالمندیار، سطح وابستگی و فعالیت‌های روزمره بیمار را ثبت کنید.",
                    EstimatedDurationMinutes = 8,
                    Questions = new List<AssessmentQuestion>
                    {
                        new() { Order = 0, QuestionKey = "patient_relationship", PageKey = "patient", PageTitle = "شناخت بیمار", Text = "درخواست برای چه کسی است؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("پدر", "مادر", "همسر", "فرد دیگر") },
                        new() { Order = 1, QuestionKey = "dependency_level", PageKey = "elder", PageTitle = "ارزیابی سالمندی", Text = "میزان وابستگی سالمند", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("کم", "متوسط", "زیاد", "کامل") },
                        new() { Order = 2, QuestionKey = "care_shift_type", PageKey = "elder", PageTitle = "ارزیابی سالمندی", Text = "نوع مراقبت موردنیاز", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("ساعتی", "روزانه", "شبانه", "شبانه‌روزی") },
                        new() { Order = 3, QuestionKey = "adl_activities", PageKey = "elder", PageTitle = "ارزیابی سالمندی", Text = "فعالیت‌های روزمره نیازمند کمک", Type = QuestionType.MultiSelect, IsRequired = true, Options = BuildOptions("غذا خوردن", "حمام", "لباس پوشیدن", "جابجایی", "مصرف دارو", "همراهی و هم‌صحبتی") },
                        new() { Order = 4, QuestionKey = "priority_factor", PageKey = "priority", PageTitle = "اولویت بیمار", Text = "مهم‌ترین معیار انتخاب نیرو چیست؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("سابقه سالمندی", "قیمت مناسب", "جنسیت", "نزدیک‌ترین نیرو") },
                        new() { Order = 5, QuestionKey = "start_date", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "تاریخ شروع", Type = QuestionType.Date, IsRequired = true },
                        new() { Order = 6, QuestionKey = "city", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "شهر", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 7, QuestionKey = "address", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "آدرس", Type = QuestionType.LongAnswer, IsRequired = true },
                        new() { Order = 8, QuestionKey = "has_elevator", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "آسانسور دارد؟", Type = QuestionType.Switch, IsRequired = true },
                        new() { Order = 9, QuestionKey = "contact_first_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 10, QuestionKey = "contact_last_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام خانوادگی", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 11, QuestionKey = "contact_mobile", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "شماره موبایل", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 12, QuestionKey = "preferred_contact_method", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "روش ارتباط ترجیحی", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("تماس", "واتساپ", "پیامک", "چت داخل برنامه") }
                    }
                };
                forms.Add(form);
                elderService.DefaultForm = form;
            }

            if (forms.Count > 0)
            {
                context.AssessmentForms.AddRange(forms);
                await context.SaveChangesAsync();
            }
        }

        if (seedServiceDefinitions)
        {
            var injectionService = await context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Code == "INJECTION");
            if (injectionService != null && !await context.AssessmentForms.AnyAsync(f => f.Code == "home-care-injection-v1"))
            {
                var injectionForm = new AssessmentForm
                {
                    Code = "home-care-injection-v1",
                    Title = "ویزارد درخواست تزریقات در منزل",
                    Description = "فرم پیش‌فرض ثبت درخواست تزریقات برای تست جریان کامل Home Care",
                    Type = AssessmentType.PatientFamily,
                    TargetTypesJson = "[17,18]",
                    Workflow = AssessmentFormWorkflow.HomeCareRequest,
                    Version = 1,
                    IsActive = true,
                    IsDefault = injectionService.DefaultFormId == null,
                    ServiceDefinitionId = injectionService.Id,
                    IntroTitle = "درخواست تزریقات در منزل",
                    IntroDescription = "اطلاعات پایه بیمار، زمان مراجعه و مدارک مرتبط را ثبت کنید.",
                    EstimatedDurationMinutes = 6,
                    Questions = new List<AssessmentQuestion>
                    {
                        new() { Order = 0, QuestionKey = "patient_relationship", PageKey = "patient", PageTitle = "شناخت بیمار", Text = "درخواست برای چه کسی است؟", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("خودم", "پدر", "مادر", "همسر", "فرزند", "فرد دیگر") },
                        new() { Order = 1, QuestionKey = "injection_type", PageKey = "service", PageTitle = "نوع خدمت", Text = "نوع تزریق موردنیاز", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("عضلانی", "وریدی", "زیرجلدی", "سایر") },
                        new() { Order = 2, QuestionKey = "doctor_order", PageKey = "service", PageTitle = "نوع خدمت", Text = "آیا نسخه یا دستور پزشک دارید؟", Type = QuestionType.Switch, IsRequired = true },
                        new() { Order = 3, QuestionKey = "start_date", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "تاریخ شروع", Type = QuestionType.Date, IsRequired = true },
                        new() { Order = 4, QuestionKey = "start_time", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "ساعت حضور", Type = QuestionType.Time, IsRequired = true },
                        new() { Order = 5, QuestionKey = "city", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "شهر", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 6, QuestionKey = "address", PageKey = "schedule", PageTitle = "زمان و مکان", Text = "آدرس", Type = QuestionType.LongAnswer, IsRequired = true },
                        new() { Order = 7, QuestionKey = "medical_documents", PageKey = "documents", PageTitle = "مدارک پزشکی", Text = "نسخه یا مدارک مرتبط", Type = QuestionType.File, IsRequired = false, AllowMultipleFiles = true, MaxFiles = 4 },
                        new() { Order = 8, QuestionKey = "contact_first_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 9, QuestionKey = "contact_last_name", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "نام خانوادگی", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 10, QuestionKey = "contact_mobile", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "شماره موبایل", Type = QuestionType.ShortAnswer, IsRequired = true },
                        new() { Order = 11, QuestionKey = "preferred_contact_method", PageKey = "contact", PageTitle = "اطلاعات تماس", Text = "روش ارتباط ترجیحی", Type = QuestionType.MultipleChoice, IsRequired = true, Options = BuildOptions("تماس", "واتساپ", "پیامک", "چت داخل برنامه") }
                    }
                };

                context.AssessmentForms.Add(injectionForm);
                await context.SaveChangesAsync();

                if (injectionService.DefaultFormId == null)
                {
                    injectionService.DefaultFormId = injectionForm.Id;
                    injectionService.UpdatedAt = DateTime.UtcNow;
                    await context.SaveChangesAsync();
                }
            }
        }

        if (seedServiceDefinitions && !context.AssessmentForms.Any(f => f.Workflow == AssessmentFormWorkflow.GuestServiceRequest))
        {
            var guestRequestForm = new AssessmentForm
            {
                Code = "guest-service-request-v1",
                Title = "ویزارد ثبت درخواست بدون ثبت‌نام",
                Description = "ثبت سریع درخواست خدمت بدون نیاز به ساخت حساب کاربری",
                Type = AssessmentType.PatientFamily,
                TargetTypesJson = "[17,18]",
                Workflow = AssessmentFormWorkflow.GuestServiceRequest,
                Version = 1,
                IsActive = true,
                IsDefault = true,
                IntroTitle = "ثبت درخواست بدون ثبت‌نام",
                IntroDescription = "چند سؤال کوتاه و ضروری؛ در کمتر از یک دقیقه.",
                EstimatedDurationMinutes = 1,
                Questions = new List<AssessmentQuestion>
                {
                    new()
                    {
                        Order = 0,
                        QuestionKey = "service_type",
                        PageKey = "service",
                        PageTitle = "نوع خدمت",
                        Text = "نوع خدمت موردنظر چیست؟",
                        Type = QuestionType.MultipleChoice,
                        IsRequired = true,
                        Tags = new List<string> { "service_type" },
                        Options = BuildOptions("پرستار", "مراقب سالمند", "مراقب کودک", "تزریقات", "پانسمان", "سرم", "مراقبت بعد از جراحی", "ویزیت", "سایر")
                    },
                    new()
                    {
                        Order = 1,
                        QuestionKey = "recipient_relationship",
                        PageKey = "recipient",
                        PageTitle = "برای چه کسی",
                        Text = "خدمت برای چه کسی است؟",
                        Type = QuestionType.MultipleChoice,
                        IsRequired = true,
                        Options = BuildOptions("خودم", "پدر", "مادر", "همسر", "فرزند", "سایر")
                    },
                    new()
                    {
                        Order = 2,
                        QuestionKey = "recipient_status",
                        PageKey = "recipient",
                        PageTitle = "وضعیت کلی",
                        Text = "وضعیت کلی فرد چگونه است؟",
                        Type = QuestionType.MultipleChoice,
                        IsRequired = true,
                        Options = BuildOptions("خوب", "نیاز به کمک در راه رفتن", "بستری در منزل", "مراقبت ویژه")
                    },
                    new()
                    {
                        Order = 3,
                        QuestionKey = "urgency",
                        PageKey = "priority",
                        PageTitle = "فوریت",
                        Text = "میزان فوریت چقدر است؟",
                        Type = QuestionType.MultipleChoice,
                        IsRequired = true,
                        Tags = new List<string> { "urgency" },
                        Options = BuildOptions("همین امروز", "تا فردا", "این هفته", "زمان دلخواه")
                    },
                    new()
                    {
                        Order = 4,
                        QuestionKey = "duration",
                        PageKey = "priority",
                        PageTitle = "مدت خدمت",
                        Text = "مدت تقریبی خدمت چقدر است؟",
                        Type = QuestionType.MultipleChoice,
                        IsRequired = true,
                        Options = BuildOptions("یک بار", "چند روز", "یک هفته", "بلندمدت")
                    },
                    new()
                    {
                        Order = 5,
                        QuestionKey = "city",
                        PageKey = "location",
                        PageTitle = "شهر",
                        Text = "شهر یا محل ارائه خدمت را وارد کنید",
                        Type = QuestionType.ShortAnswer,
                        IsRequired = true,
                        Tags = new List<string> { "city" },
                        Placeholder = "مثال: تهران، کرج..."
                    },
                    new()
                    {
                        Order = 6,
                        QuestionKey = "short_description",
                        PageKey = "details",
                        PageTitle = "توضیحات",
                        Text = "توضیح کوتاه (اختیاری)",
                        Type = QuestionType.LongAnswer,
                        IsRequired = false,
                        Placeholder = "اگر نکته‌ای هست، کوتاه بنویسید..."
                    },
                    new()
                    {
                        Order = 7,
                        QuestionKey = "contact_first_name",
                        PageKey = "contact",
                        PageTitle = "اطلاعات تماس",
                        Text = "نام",
                        Type = QuestionType.ShortAnswer,
                        IsRequired = true,
                        Tags = new List<string> { "contact_first_name" },
                        Placeholder = "نام"
                    },
                    new()
                    {
                        Order = 8,
                        QuestionKey = "contact_last_name",
                        PageKey = "contact",
                        PageTitle = "اطلاعات تماس",
                        Text = "نام خانوادگی",
                        Type = QuestionType.ShortAnswer,
                        IsRequired = true,
                        Tags = new List<string> { "contact_last_name" },
                        Placeholder = "نام خانوادگی"
                    },
                    new()
                    {
                        Order = 9,
                        QuestionKey = "contact_mobile",
                        PageKey = "contact",
                        PageTitle = "اطلاعات تماس",
                        Text = "شماره موبایل",
                        Type = QuestionType.ShortAnswer,
                        IsRequired = true,
                        Tags = new List<string> { "contact_mobile" },
                        Placeholder = "مثال: 0912xxxxxxx"
                    }
                }
            };

            context.AssessmentForms.Add(guestRequestForm);
            await context.SaveChangesAsync();
        }

        if (!seedSampleData)
        {
            return;
        }

        var nursePhone = "09123456789";
        var nurseUser = await userManager.FindByNameAsync(nursePhone);
        if (nurseUser == null)
        {
            nurseUser = new User
            {
                UserName = nursePhone,
                Email = "nurse@example.com",
                FirstName = "سارا",
                LastName = "محمدی",
                PhoneNumber = nursePhone,
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(nurseUser, "Password123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(nurseUser, "Nurse");
            }
        }

        // Seed Patient (CareRecipient)
        if (!context.CareRecipients.Any())
        {
            var patient = new CareRecipient
            {
                FirstName = "احمد",
                LastName = "رضایی",
                DateOfBirth = UtcDate(1951, 3, 21),
                PrimaryDiagnosis = "دیابت نوع ۲",
                CurrentStatus = "Stable",
                CareLevel = CareLevel.Level2, // 6h
                ResponsibleNurseId = nurseUser?.Id,
                Address = "تهران، خیابان ولیعصر",
                MedicalHistory = "سابقه فشار خون بالا",
                Needs = "نیاز به کمک در راه رفتن"
            };
            context.CareRecipients.Add(patient);
            await context.SaveChangesAsync();
        }

        // Seed Additional Nurses
        var nurse2 = await userManager.FindByNameAsync("09120000002");
        if (nurse2 == null)
        {
            nurse2 = new User { UserName = "09120000002", Email = "nurse2@example.com", FirstName = "مریم", LastName = "کاظمی", PhoneNumber = "09120000002", EmailConfirmed = true };
            await userManager.CreateAsync(nurse2, "Password123!");
            await userManager.AddToRoleAsync(nurse2, "Nurse");
        }

        var nurse3 = await userManager.FindByNameAsync("09120000003");
        if (nurse3 == null)
        {
            nurse3 = new User { UserName = "09120000003", Email = "nurse3@example.com", FirstName = "زهرا", LastName = "حسینی", PhoneNumber = "09120000003", EmailConfirmed = true };
            await userManager.CreateAsync(nurse3, "Password123!");
            await userManager.AddToRoleAsync(nurse3, "Nurse");
        }

        // Seed Additional Patient
        var patient2 = context.CareRecipients.FirstOrDefault(p => p.FirstName == "فاطمه");
        if (patient2 == null)
        {
            patient2 = new CareRecipient
            {
                FirstName = "فاطمه",
                LastName = "اکبری",
                DateOfBirth = UtcDate(1945, 6, 15),
                PrimaryDiagnosis = "آلزایمر",
                CurrentStatus = "Stable",
                CareLevel = CareLevel.Level3,
                Address = "تهران، شهرک غرب",
                MedicalHistory = "فراموشی خفیف",
                Needs = "مراقبت ۲۴ ساعته"
            };
            context.CareRecipients.Add(patient2);
            await context.SaveChangesAsync();
        }

        // Seed Assignments
        if (!context.CareAssignments.Any())
        {
            var nurse1 = await userManager.FindByNameAsync("09123456789");
            var patient1 = context.CareRecipients.First(p => p.FirstName == "احمد");

            if (nurse1 != null && nurse2 != null && nurse3 != null)
            {
                var assignments = new List<CareAssignment>
                {
                    new CareAssignment
                    {
                        Id = Guid.NewGuid(),
                        PatientId = patient1.Id,
                        CaregiverId = nurse1.Id,
                        AssignmentType = AssignmentType.ShiftBased,
                        ShiftSlot = ShiftSlot.Morning,
                        StartDate = DateTimeOffset.UtcNow.Date.AddDays(1).AddHours(8).ToUniversalTime(),
                        EndDate = DateTimeOffset.UtcNow.Date.AddDays(1).AddHours(14).ToUniversalTime(),
                        Status = AssignmentStatus.Active,
                        IsPrimaryCaregiver = true,
                        CreatedAt = DateTimeOffset.UtcNow,
                        CreatedBy = "System"
                    },
                    new CareAssignment
                    {
                        Id = Guid.NewGuid(),
                        PatientId = patient1.Id,
                        CaregiverId = nurse2.Id,
                        AssignmentType = AssignmentType.ShiftBased,
                        ShiftSlot = ShiftSlot.Evening,
                        StartDate = DateTimeOffset.UtcNow.Date.AddDays(1).AddHours(16).ToUniversalTime(),
                        EndDate = DateTimeOffset.UtcNow.Date.AddDays(1).AddHours(22).ToUniversalTime(),
                        Status = AssignmentStatus.Active,
                        IsPrimaryCaregiver = false,
                        CreatedAt = DateTimeOffset.UtcNow,
                        CreatedBy = "System"
                    },
                    new CareAssignment
                    {
                        Id = Guid.NewGuid(),
                        PatientId = patient2.Id,
                        CaregiverId = nurse3.Id,
                        AssignmentType = AssignmentType.TwentyFourHour,
                        ShiftSlot = ShiftSlot.None,
                        StartDate = DateTimeOffset.UtcNow.Date.AddDays(2).ToUniversalTime(),
                        EndDate = DateTimeOffset.UtcNow.Date.AddDays(3).ToUniversalTime(),
                        Status = AssignmentStatus.Active,
                        IsPrimaryCaregiver = true,
                        CreatedAt = DateTimeOffset.UtcNow,
                        CreatedBy = "System"
                    }
                };
                context.CareAssignments.AddRange(assignments);
                await context.SaveChangesAsync();
            }
        }
        // Seed Nursing Reports
        if (!context.NursingReports.Any())
        {
            var nurse1 = await userManager.FindByNameAsync("09123456789");
            var patient1 = await context.CareRecipients.FirstOrDefaultAsync(p => p.FirstName == "احمد");

            if (nurse1 != null && patient1 != null)
            {
                var reports = new List<NursingReport>
                {
                    new NursingReport
                    {
                        CareRecipientId = patient1.Id,
                        AuthorId = nurse1.Id,
                        Shift = "Morning",
                        Content = "بیمار وضعیت پایداری داشت. علائم حیاتی در محدوده نرمال بود. داروهای صبحگاهی مصرف شد.",
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new NursingReport
                    {
                        CareRecipientId = patient1.Id,
                        AuthorId = nurse1.Id,
                        Shift = "Evening",
                        Content = "بیمار کمی احساس ضعف داشت. فشار خون کنترل شد (۱۲۰/۸۰). استراحت کافی داشت.",
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    }
                };
                context.NursingReports.AddRange(reports);
                await context.SaveChangesAsync();
            }
        }
    }

    private static List<AssessmentOption> BuildOptions(params string[] items) =>
        items.Select((item, index) => new AssessmentOption
        {
            Text = item,
            ScoreValue = index,
            Order = index
        }).ToList();
}

public sealed record SeedAdminUserOptions(
    string? Email,
    string? PhoneNumber,
    string? Password,
    string? FirstName,
    string? LastName);
