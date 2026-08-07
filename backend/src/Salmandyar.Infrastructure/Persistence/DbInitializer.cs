using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Entities.Content;
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

        await SeedContentPlatformAsync(context);
    }

    private static async Task SeedContentPlatformAsync(ApplicationDbContext context)
    {
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        // 1. Seed Authors
        if (!context.Authors.Any())
        {
            var authors = new List<Author>
            {
                new()
                {
                    FirstName = "دکتر سارا",
                    LastName = "رضایی",
                    Title = "متخصص داخلی و سالمندان",
                    Specialization = "پزشک متخصص داخلی با تمرکز بر بیماری‌های مزمن سالمندی و مراقبت در منزل",
                    Biography = "دکتر رضایی با بیش از ۱۵ سال سابقه درمانی در بیمارستان‌های تهران، در زمینه بیماری‌های قلبی، دیابت و آلزایمر فعالیت تخصصی دارد. به عنوان Medical Reviewer ارشد محتوای پزشکی سالمندیار را بررسی می‌کند.",
                    ExperienceSummary = "استادیار دانشگاه علوم پزشکی شهید بهشتی · متخصص داخلی · فلوشیپ سالمندی",
                    YearsOfExperience = 15,
                    ProfileImageUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop",
                    MedicalLicenseNumber = "45678",
                    Email = "s.rezaei@salmandyar.com",
                    Slug = "dr-sara-rezaei",
                    MetaTitle = "دکتر سارا رضایی | متخصص سالمندی سالمندیار",
                    MetaDescription = "مشاهده مقالات و محتوای پزشکی تاییدشده توسط دکتر سارا رضایی، متخصص داخلی و سالمندان در پلتفرم سالمندیار.",
                    IsMedicalReviewer = true,
                    IsActive = true,
                    CreatedAt = UtcDate(2025, 1, 15)
                },
                new()
                {
                    FirstName = "نسترن",
                    LastName = "کاظمی",
                    Title = "کارشناس ارشد پرستاری ICU",
                    Specialization = "پرستار متخصص مراقبت‌های ویژه و ICU در منزل با تمرکز بر بیماران ونتیلاتور و تراکئوستومی",
                    Biography = "خانم کاظمی با ۱۲ سال سابقه در بخش ICU بیمارستان نمازی و ۶ سال ارائه خدمات پرستاری ویژه در منزل، نویسنده بخش عمده محتوای آموزشی پرستاری سالمندیار است.",
                    ExperienceSummary = "کارشناس ارشد پرستاری ICU · سابقه سرپرستی بخش ICU · مدرس دوره‌های پرستاری",
                    YearsOfExperience = 12,
                    ProfileImageUrl = "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop",
                    MedicalLicenseNumber = "N-98234",
                    Email = "n.kazemi@salmandyar.com",
                    Slug = "nastaran-kazemi",
                    MetaTitle = "نسترن کاظمی | کارشناس پرستاری ICU سالمندیار",
                    MetaDescription = "مطالعه راهنماهای پرستاری تخصصی و ابزارهای مراقبتی نوشته‌شده توسط نسترن کاظمی، کارشناس ارشد پرستاری ICU.",
                    IsMedicalReviewer = true,
                    IsActive = true,
                    CreatedAt = UtcDate(2025, 1, 16)
                },
                new()
                {
                    FirstName = "مریم",
                    LastName = "امینی",
                    Title = "فیزیوتراپیست ارشد",
                    Specialization = "فیزیوتراپیست متخصص توانبخشی عصبی و اسکلتی-عضلانی سالمندان",
                    Biography = "خانم امینی با دکترای فیزیوتراپی و ۱۰ سال سابقه، بر بخش محتوای توانبخشی و حرکتی سالمندیار نظارت می‌کند و تمرینات درمانی را طراحی می‌نماید.",
                    ExperienceSummary = "دکترای فیزیوتراپی دانشگاه تربیت مدرس · فلوشیپ توانبخشی عصبی",
                    YearsOfExperience = 10,
                    ProfileImageUrl = "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&auto=format&fit=crop",
                    MedicalLicenseNumber = "PT-12453",
                    Email = "m.amini@salmandyar.com",
                    Slug = "maryam-amini",
                    MetaTitle = "مریم امینی | فیزیوتراپیست ارشد سالمندیار",
                    MetaDescription = "بررسی راهنماهای توانبخشی و تمرینات فیزیوتراپی اختصاصی سالمندان توسط مریم امینی، دکترای فیزیوتراپی.",
                    IsMedicalReviewer = false,
                    IsActive = true,
                    CreatedAt = UtcDate(2025, 2, 1)
                },
                new()
                {
                    FirstName = "علی",
                    LastName = "محمدی",
                    Title = "مدیر محتوا و سلامت دیجیتال",
                    Specialization = "تولید محتوای بهداشتی-درمانی و سئوی پزشکی",
                    Biography = "علی محمدی با مدرک بهداشت عمومی و ۷ سال تجربه در حوزه تولید محتوا در پلتفرم‌های سلامت، مسئول استراتژی محتوایی سئوی سالمندیار است.",
                    ExperienceSummary = "کارشناس ارشد بهداشت عمومی · سئوی متخصص پزشکی · Content Strategist",
                    YearsOfExperience = 7,
                    ProfileImageUrl = "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&auto=format&fit=crop",
                    Email = "a.mohammadi@salmandyar.com",
                    Slug = "ali-mohammadi",
                    MetaTitle = "علی محمدی | مدیر محتوای سالمندیار",
                    MetaDescription = "استراتژی و تولید محتوای سئوپزشکی در سالمندیار توسط علی محمدی، کارشناس بهداشت عمومی و مدیر محتوا.",
                    IsMedicalReviewer = false,
                    IsActive = true,
                    CreatedAt = UtcDate(2025, 2, 10)
                }
            };
            context.Authors.AddRange(authors);
            await context.SaveChangesAsync();
        }

        // 2. Seed Content Categories
        if (!context.ContentCategories.Any())
        {
            var categories = new List<ContentCategory>
            {
                new()
                {
                    Name = "مراقبت از سالمند",
                    Slug = "elderly-care",
                    Description = "مقالات تخصصی در زمینه مراقبت روزمره از سالمند، تغذیه، خواب، ایمنی در منزل و پیشگیری از سقوط.",
                    DisplayOrder = 1,
                    MetaTitle = "مراقبت از سالمند در منزل | مقالات تخصصی سالمندیار",
                    MetaDescription = "بهترین راهنماهای علمی و عملی برای مراقبت ایمن و حرفه‌ای از سالمند در منزل؛ شامل تغذیه، بهداشت و روان.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1200&auto=format&fit=crop",
                    ShowInMenu = true,
                    IsActive = true
                },
                new()
                {
                    Name = "بیماری‌های مزمن",
                    Slug = "chronic-diseases",
                    Description = "مقالات مرتبط با مدیریت بیماری‌های مزمن سالمندی شامل دیابت، فشار خون، آلزایمر، پارکینسون و نارسایی قلبی.",
                    DisplayOrder = 2,
                    MetaTitle = "بیماری‌های مزمن سالمندی | راهنمای مدیریت و درمان در منزل",
                    MetaDescription = "آشنایی با بیماری‌های شایع سالمندی و بهترین روش‌های کنترل و مراقبت در خانه با محتوای تاییدشده پزشکی.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop",
                    ShowInMenu = true,
                    IsActive = true
                },
                new()
                {
                    Name = "پرستاری تخصصی",
                    Slug = "specialized-nursing",
                    Description = "مقالات مرتبط با پرستاری ICU، تزریقات، ساکشن، پانسمان تخصصی زخم، تراکئوستومی و مراقبت ونتیلاتور.",
                    DisplayOrder = 3,
                    MetaTitle = "پرستاری تخصصی در منزل | مقالات پرستاری سالمندیار",
                    MetaDescription = "آموزش عملی مراقبت‌های پرستاری ویژه در منزل؛ از پانسمان زخم تا مدیریت بیمار ونتیلاتور با پرستار باتجربه.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop",
                    ShowInMenu = true,
                    IsActive = true
                },
                new()
                {
                    Name = "توانبخشی",
                    Slug = "rehabilitation",
                    Description = "راهنماهای فیزیوتراپی، کاردرمانی، توانبخشی عصبی بعد از سکته مغزی، و حفظ تحرک سالمندان.",
                    DisplayOrder = 4,
                    MetaTitle = "توانبخشی سالمندان در منزل | تمرینات فیزیوتراپی",
                    MetaDescription = "تمرینات اثبات‌شده توانبخشی و فیزیوتراپی برای سالمندان؛ ریکاوری سریع‌تر بعد از عمل و سکته مغزی در خانه.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop",
                    ShowInMenu = true,
                    IsActive = true
                },
                new()
                {
                    Name = "سلامت روان",
                    Slug = "mental-health",
                    Description = "مقالاتی درباره افسردگی سالمندی، اضطراب، تنهایی، شناخت، خواب و حفظ سلامت عصبی-روانی در سنین بالا.",
                    DisplayOrder = 5,
                    MetaTitle = "سلامت روان سالمندان | راهنمای پیشگیری و درمان",
                    MetaDescription = "راهکارهای علمی برای تقویت سلامت روان سالمندان؛ مقابله با افسردگی، فراموشی و تنهایی در سنین پیری.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1200&auto=format&fit=crop",
                    ShowInMenu = true,
                    IsActive = true
                },
                new()
                {
                    Name = "تغذیه سالمندی",
                    Slug = "elderly-nutrition",
                    Description = "برنامه‌های غذایی، مکمل‌ها، نکات تغذیه در بیماری‌های خاص و مدیریت وزن سالمندان.",
                    DisplayOrder = 6,
                    MetaTitle = "تغذیه سالمندی | برنامه غذایی سالمند در منزل",
                    MetaDescription = "اصول تغذیه صحیح برای سالمندان؛ برنامه غذایی متعادل، مکمل‌های ضروری و رژیم در بیماری‌های مزمن.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&auto=format&fit=crop",
                    ShowInMenu = true,
                    IsActive = true
                }
            };
            context.ContentCategories.AddRange(categories);
            await context.SaveChangesAsync();
        }

        // 3. Seed Content Tags
        if (!context.ContentTags.Any())
        {
            var tags = new List<ContentTag>
            {
                new() { Name = "آلزایمر", Slug = "alzheimer", MetaTitle = "آلزایمر سالمندی", MetaDescription = "تمام مقالات مربوط به بیماری آلزایمر، علائم، درمان و مراقبت." },
                new() { Name = "دیابت", Slug = "diabetes", MetaTitle = "دیابت در سالمندان", MetaDescription = "کنترل قند خون، رژیم غذایی و عوارض دیابت در سالمندی." },
                new() { Name = "سکته مغزی", Slug = "stroke", MetaTitle = "سکته مغزی سالمندی", MetaDescription = "علائم سکته مغزی، توانبخشی و مراقبت پس از سکته." },
                new() { Name = "زخم بستر", Slug = "pressure-ulcer", MetaTitle = "پیشگیری و درمان زخم بستر", MetaDescription = "راهکارهای اثبات‌شده برای پیشگیری و درمان زخم بستر در بیماران بستری." },
                new() { Name = "پانسمان", Slug = "wound-care", MetaTitle = "آموزش پانسمان در منزل", MetaDescription = "نکات تخصصی پانسمان و تعویض پانسمان زخم در منزل." },
                new() { Name = "فشار خون", Slug = "hypertension", MetaTitle = "فشار خون بالا", MetaDescription = "کنترل و مدیریت فشار خون بالا در سالمندان با رژیم و دارو." },
                new() { Name = "قلب", Slug = "heart-disease", MetaTitle = "بیماری‌های قلبی سالمندی", MetaDescription = "پیشگیری و مراقبت از بیماران قلبی در منزل." },
                new() { Name = "پیشگیری از سقوط", Slug = "fall-prevention", MetaTitle = "پیشگیری از سقوط سالمند", MetaDescription = "راهکارهای ایمن‌سازی منزل و کاهش خطر سقوط در سالمندان." },
                new() { Name = "پرستار در منزل", Slug = "home-nurse", MetaTitle = "خدمات پرستار در منزل", MetaDescription = "معرفی خدمات پرستاری در منزل، روند درخواست و هزینه آن." },
                new() { Name = "ICU", Slug = "home-icu", MetaTitle = "ICU در منزل", MetaDescription = "خدمات ICU و پرستاری ویژه بیماران بستری در خانه." }
            };
            context.ContentTags.AddRange(tags);
            await context.SaveChangesAsync();
        }

        var medicalReviewer = await context.Authors.FirstOrDefaultAsync(a => a.Slug == "dr-sara-rezaei");
        var nurseAuthor = await context.Authors.FirstOrDefaultAsync(a => a.Slug == "nastaran-kazemi");
        var physiotherapist = await context.Authors.FirstOrDefaultAsync(a => a.Slug == "maryam-amini");
        var contentManager = await context.Authors.FirstOrDefaultAsync(a => a.Slug == "ali-mohammadi");

        var elderlyCareCat = await context.ContentCategories.FirstAsync(c => c.Slug == "elderly-care");
        var chronicCat = await context.ContentCategories.FirstAsync(c => c.Slug == "chronic-diseases");
        var nursingCat = await context.ContentCategories.FirstAsync(c => c.Slug == "specialized-nursing");
        var rehabCat = await context.ContentCategories.FirstAsync(c => c.Slug == "rehabilitation");
        var mentalCat = await context.ContentCategories.FirstAsync(c => c.Slug == "mental-health");
        var nutritionCat = await context.ContentCategories.FirstAsync(c => c.Slug == "elderly-nutrition");

        // 4. Seed Diseases
        if (!context.Diseases.Any())
        {
            var diseases = new List<Disease>
            {
                new()
                {
                    Name = "بیماری آلزایمر",
                    Slug = "alzheimer",
                    ShortDescription = "آلزایمر شایع‌ترین نوع دمانس است که به تدریج حافظه و توانایی‌های شناختی سالمند را از بین می‌برد و نیازمند مراقبت تخصصی ۲۴ ساعته است.",
                    Definition = "آلزایمر یک اختلال نورودژنراتیو پیشرونده است که با از بین رفتن تدریجی سلول‌های عصبی مغز، منجر به زوال شناختی، فراموشی و در نهایت ناتوانی کامل در فعالیت‌های روزمره می‌شود.",
                    Causes = JsonSerializer.Serialize(new[]{ "پیر شدن", "عامل ژنتیکی و سابقه خانوادگی", "هیپرتانسیون طولانی‌مدت", "دیابت کنترل‌نشده", "چاقی و سبک زندگی تحرک‌ناپذیر", "سطح پایین تحصیلات و فعالیت ذهنی" }, jsonOptions),
                    Symptoms = JsonSerializer.Serialize(new[]{ "فراموشی مکرر اطلاعات تازه", "سردرگمی در زمان و مکان", "مشکل در صحبت کردن و انتخاب کلمات", "پخش شدن وسایل شخصی", "تغییرات خلقی و رفتاری", "کاهش قضاوت و تصمیم‌گیری" }, jsonOptions),
                    RiskFactors = JsonSerializer.Serialize(new[]{ "سن بالای ۶۵ سال", "سابقه خانوادگی آلزایمر", "سندرم داون", "کمبود ویتامین B12", "استرس مزمن", "آپنه خواب درمان‌نشده" }, jsonOptions),
                    Diagnosis = "تشخیص آلزایمر با معاینه بالینی، آزمون‌های روان‌شناختی، آزمایش خون (برای رد علل برگشت‌پذیر)، MRI مغز و PET اسکن صورت می‌گیرد.",
                    Treatment = "درمان دارویی با داروهای کولین استراز (Donepezil, Rivastigmine, Galantamine) در مراحل خفیف تا متوسط و Memantin در مرحله شدید، همراه با مداخلات غیردارویی شامل حافظه‌سازی، ورزش منظم و محیط ساختاریافته.",
                    Prevention = "ورزش منظم ۱۵۰ دقیقه در هفته، تغذیه مدیترانه‌ای، کنترل قند و فشار خون، خواب کافی، آموختن مهارت‌های تازه، تعامل اجتماعی فعال و مدیریت استرس.",
                    HomeCareInstructions = "ایجاد یک روتین روزانه منظم، استفاده از نشانه‌های بصری برای یادآوری زمان، قفل درب‌ها و قطع برند پخت‌وپز برای جلوگیری از آسیب، نگهداری دفترچه تاریخچه دارو، تحریک ذهنی با بازی‌های فکری و مهارت‌های حیاتی.",
                    Complications = "سوءتغذیه، پنومونی آسپیراسیون، عفونت ادراری، زخم بستر در ناحیه سکروم، افتادن و شکستگی لگن، پرخاشگری و روان‌پریشی در مراحل انتهایی.",
                    Prognosis = "میانگین بقا پس از تشخیص ۳ تا ۱۱ سال است. مرگ معمولاً ناشی از عوارض مانند پنومونی یا عفونت‌ها در مراحل انتهایی می‌باشد.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop",
                    MetaTitle = "آلزایمر در سالمندان | علائم، درمان و مراقبت در منزل",
                    MetaDescription = "راهنمای کامل بیماری آلزایمر؛ علائم، مراحل، داروها، روش‌های مراقبت تخصصی در منزل و پیشگیری از پیشرفت دمانس سالمندی.",
                    PrimaryKeyword = "آلزایمر در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "علائم آلزایمر زودرس", "درمان آلزایمر", "مراقبت از بیمار آلزایمر در منزل", "مراحل آلزایمر", "داروی آلزایمر" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/diseases/alzheimer",
                    Icd10Code = "G30.9",
                    SeverityLevel = 85,
                    PrevalenceRank = 1,
                    RequiresImmediateMedicalAttention = false,
                    IsActive = true,
                    DisplayOrder = 1,
                    MedicalReviewerId = medicalReviewer?.Id,
                    ViewCount = 2145
                },
                new()
                {
                    Name = "سکته مغزی",
                    Slug = "stroke",
                    ShortDescription = "سکته مغزی وقتی رخ می‌دهد که خون‌رسانی به بخشی از مغز قطع یا کاهش یابد و منجر به فلج یک‌طرفه بدن، اختلال گفتار یا تشنج می‌شود.",
                    Definition = "سکته مغزی (Stroke) یک اورژانس پزشکی است که به دلیل انسداد (ایسکمیک، ۸۵٪) یا پارگی (هموراژیک، ۱۵٪) رگ مغزی رخ می‌دهد و در عرض چند دقیقه منجر به مرگ سلول‌های عصبی می‌گردد.",
                    Causes = JsonSerializer.Serialize(new[]{ "لخته خون مسدودکننده رگ مغزی (ایسکمیک)", "خونریزی داخل مغزی به دلیل پارگی رگ", "حمله ایسکمیک گذرا (TIA) به عنوان هشدار", "آترواسکلروز و تنگی شریان کاروتید", "فیبریلاسیون دهلیزی قلبی" }, jsonOptions),
                    Symptoms = JsonSerializer.Serialize(new[]{ "افتادگی یک طرف صورت (Face drooping)", "ضعف یا فلج یک دست یا پا (Arm weakness)", "لرزیدن زبان و اختلال در گفتار (Speech difficulty)", "سردرد شدید ناگهانی", "از دست دادن تعادل و هماهنگی", "دید تار یا کوری یک چشم" }, jsonOptions),
                    RiskFactors = JsonSerializer.Serialize(new[]{ "فشار خون بالا کنترل‌نشده", "دیابت مللیتوس", "چربی خون بالا", "سیگار و قلیان", "فیبریلاسیون دهلیزی", "چاقی شکمی", "مصرف زیاد الکل" }, jsonOptions),
                    Diagnosis = "تشخیص با معاینه عصبی فوری، CT اسکن بدون تضاد (برای تمایز خونریزی از ایسکمی) و MRI مغز همراه با آنژیوگرافی و داپلر کاروتید صورت می‌گیرد.",
                    Treatment = "در سکته ایسکمیک حاد: تزریق داروی ضد انعقاد (Alteplase) در پنجره طلایی ۴.۵ ساعت و Thrombectomy مکانیکی در ۶ تا ۲۴ ساعت. در سکته هموراژیک: کنترل فشار خون، مدیریت ICP و گاهی جراحی.",
                    Prevention = "کنترل فشار خون زیر ۱۳۰/۸۰، مصرف قرص آسپرین در افراد پرخطر بر اساس تجویز پزشک، کنترل قند خون و کلسترول، توقف سیگار، ورزش منظم و رژیم کم‌نمک.",
                    HomeCareInstructions = "تزریق منظم داروهای ضد انعقاد با کنترل INR، انجام روزانه تمرینات توانبخشی حرکتی و گفتار، تغییر موقعیت هر ۲ ساعت برای جلوگیری از زخم بستر، آموزش تغذیه با ضخیم‌کننده در صورت مشق بلع.",
                    Complications = "فلج دائمی یک طرف بدن (همی‌پلژی)، دیسفاژی و آسپیراسیون، افسردگی پس از سکته (۳۰٪)، درد شانه، اسپاستیسیته عضلانی، زخم بستر، عفونت ادراری و عفونت ریه.",
                    Prognosis = "۲۵٪ در ماه اول می‌میرند. ۵۰٪ ناتوانی دائمی جدی دارند. با توانبخشی زودهنگام ۶ ماهه ۷۰٪ به استقلال نسبی در فعالیت‌های روزانه دست می‌یابند.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&auto=format&fit=crop",
                    MetaTitle = "سکته مغزی (Stroke) | علائم فوری، درمان و توانبخشی در منزل",
                    MetaDescription = "شناخت نشانه‌های سکته مغزی با قانون F.A.S.T، درمان فوری در بیمارستان و بهترین برنامه توانبخشی حرکتی و گفتار در منزل برای سالمندان.",
                    PrimaryKeyword = "سکته مغزی در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "علائم سکته مغزی زودرس", "توانبخشی بعد از سکته مغزی", "فیزیوتراپی سکته مغزی در منزل", "پیشگیری از سکته مغزی", "مراقبت از بیمار سکته شده در منزل" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/diseases/stroke",
                    Icd10Code = "I63.9",
                    SeverityLevel = 95,
                    PrevalenceRank = 2,
                    RequiresImmediateMedicalAttention = true,
                    IsActive = true,
                    DisplayOrder = 2,
                    MedicalReviewerId = medicalReviewer?.Id,
                    ViewCount = 1897
                },
                new()
                {
                    Name = "دیابت نوع دوم",
                    Slug = "diabetes",
                    ShortDescription = "دیابت نوع دو با عدم پاسخ بدن به انسولین یا کاهش ترشح آن مشخص می‌شود و در صورت کنترل‌نشده منجر به عوارض کلیوی، عصبی و قلبی می‌گردد.",
                    Definition = "دیابت ملیتوس نوع دو یک اختلال متابولیک مزمن است که در آن سلول‌های بدن نسبت به اثر انسولین مقاومت می‌کنند (انسولین رزیستانس) و یا لانگرهانس بتا به اندازه کافی انسولین تولید نمی‌کند، در نتیجه قند خون به طور مزمن بالا می‌رود.",
                    Causes = JsonSerializer.Serialize(new[]{ "چاقی و چربی احشایی شکمی", "عدم تحرک بدنی", "سابقه ژنتیکی و خانوادگی", "سن بالای ۴۰ سال", "پیش دیابت تشخیص‌داده‌نشده", "تغذیه پر قند و چربی ترانس" }, jsonOptions),
                    Symptoms = JsonSerializer.Serialize(new[]{ "تشنگی مفرط و خشکی دهان", "تکرر ادرار مخصوصاً در شب", "گرسنگی شدید حتی بعد از صرف غذا", "کاهش وزن بدون دلیل", "خستگی و ضعف عمومی", "تاری دید", "تاخیر در التیام زخم‌ها" }, jsonOptions),
                    RiskFactors = JsonSerializer.Serialize(new[]{ "BMI بالای ۳۰", "دور کمر بزرگ (مردان >94cm زنان >80cm)", "سابقه GDM در زنان", "سندرم تخمدان پلی کیستیک", "فشار خون بالا", "کلسترول بد LDL بالا و HDL پایین" }, jsonOptions),
                    Diagnosis = "FBS ≥ ۱۲۶، قند خون تصادفی ≥ ۲۰۰ همراه با علائم، تست تحمل گلوکز ۲ ساعته ≥ ۲۰۰ و یا HbA1c ≥ ۶.۵ درصد در دو نوبت جداگانه.",
                    Treatment = "اصلاح سبک زندگی رکن اصلی است. داروهای خوراکی شامل Metformin (ردیف اول)، Sulfonylureas، DPP-4 inhibitors، GLP-1 agonists و SGLT2 inhibitors. در مراحل پیشرفته انسولین درمانی ترکیبی یا مزوال موردنیاز است.",
                    Prevention = "کاهش ۵ تا ۷ درصد وزن بدن با ورزش ۱۵۰ دقیقه در هفته و تغییر تغذیه (افزایش فیبر، کاهش قندهای ساده و کربوهیدرات تصفیه‌شده).",
                    HomeCareInstructions = "اندازه‌گیری روزانه قند خون ناشتا و ۲ ساعت بعد از غذا، تزریق انسولین طبق روتین تعیین‌شده، پایش روزانه پاها برای جلوگیری از زخم دیابتیک، دفترچه ثبت نتایج تست و کنترل مکرر فشار خون.",
                    Complications = "نفروپاتی و نارسایی مزمن کلیه، نوروپاتی محیطی و درد زخم پا، رتینوپاتی و کوری، ماکروپاتی و IHD/MI، سکته مغزی، آمپوتاسیون اندام تحتانی.",
                    Prognosis = "با کنترل دقیق و مداوم HbA1c زیر ۷ درصد، عوارض میکروواسکولار به میزان ۵۰٪ کاهش می‌یابد. امید به زندگی در صورت کنترل خوب ۱۰ تا ۱۵ سال بعد از تشخیص طبیعی است.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&auto=format&fit=crop",
                    MetaTitle = "دیابت نوع دوم سالمندی | علائم، کنترل و رژیم غذایی در منزل",
                    MetaDescription = "راهنمای جامع مدیریت دیابت در سالمندان؛ پایش قند خون، رژیم غذایی دیابتی، داروها و پیشگیری از زخم پا و عوارض عصبی-کلیوی.",
                    PrimaryKeyword = "دیابت در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "رژیم غذایی دیابت", "اندازه گیری قند خون در منزل", "انسولین درمانی", "عوارض دیابت در پا", "HbA1c طبیعی" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/diseases/diabetes",
                    Icd10Code = "E11.9",
                    SeverityLevel = 75,
                    PrevalenceRank = 3,
                    RequiresImmediateMedicalAttention = false,
                    IsActive = true,
                    DisplayOrder = 3,
                    MedicalReviewerId = medicalReviewer?.Id,
                    ViewCount = 1654
                },
                new()
                {
                    Name = "پارکینسون",
                    Slug = "parkinson",
                    ShortDescription = "بیماری پارکینسون از سیستم عصبی حرکتی با لرزش استراحت، سختی عضلات، کندی حرکت و اختلال تعادل مشخص می‌شود.",
                    Definition = "پارکینسون یک اختلال نورودژنراتیو مزمن است که به دلیل از بین رفتن سلول‌های داپامینرژیک در ماده سیاه (Substantia Nigra) مغز می‌باشد و منجر به ۴ علامت کلاسیک لرزش، رژیدیتی، برادیکینزی و اختلال راه رفتن می‌گردد.",
                    Causes = JsonSerializer.Serialize(new[]{ "عامل ژنتیکی در ۱۰ تا ۱۵٪ موارد (لوسی SNCA، LRRK2)", "عوامل محیطی شامل سموم شیمیایی، آفت‌کش‌ها", "تروما سر مکرر", "آپپتوزیس سلول‌ها و استرس اکسیداتیو", "کاهش تدریجی دوپامین با افزایش سن" }, jsonOptions),
                    Symptoms = JsonSerializer.Serialize(new[]{ "لرزش استراحت انگشتان به شکل Rolling Pill", "سفتی و سختی عضلات رژیدیتی Cogwheel", "کند شدن حرکات و کاهش پلک زدن Masked Face", "خم شدن کمر و شابلون رفتن Gait", "کاهش و کوچک شدن دستخط Micrographia", "اختلال بلع و بی‌حوصلگی در مقطع انتهایی", "افت فشار خون هنگام ایستادن Ortostatik" }, jsonOptions),
                    RiskFactors = JsonSerializer.Serialize(new[]{ "سن بالای ۶۰ سال", "جنس مردانه (۱.۵ برابر)", "سابقه خانوادگی", "تماس با سموم کشاورزی", "هیپوتانسیون ارتواستاتیک", "سابقه یبوست مزمن" }, jsonOptions),
                    Diagnosis = "تشخیص عمدتاً بالینی بر اساس وجود حداقل ۲ علامت چهارگانه اصلی و پاسخ به درمان لوودوپا. آزمایش DaT-Scan Dopamine Transporter Imaging برای تأیید کاربرد دارد.",
                    Treatment = "لوودوپا به همراه بوسریدین (داروی ردیف اول) و در مراحل بعدی افزودن آمانتادین، MAO-B inhibitors (راساژیلین) و DBS تحریک عمیق مغز در افراد واجد شرایط.",
                    Prevention = "ورزش هوازی منظم، دریافت کافئین و آنتی‌اکسیدان‌ها، مصرف ویتامین D کافی، کنترل استرس و پرهیز از سموم محیطی.",
                    HomeCareInstructions = "آموزش تکنیک‌های حرکتی برای کمک به بلند شدن از صندلی با کف دست، مبلمان سفت و کم‌ارتفاع، تمرینات تقویتی روزانه، چک کردن دوزهای دقیق دارو و دفترچه ثبت پاسخ دارویی.",
                    Complications = "افتادن و شکستگی (۳۰٪ در سال)، Dysphagia و آسپیراسیون پنومونی، افسردگی و اضطراب (۵۰٪)، دمانس در ۸۰٪ در ۲۰ سال اول، یبوست مزمن و ناهنجاری‌های خواب.",
                    Prognosis = "پیشرفت بیماری در طول ۱۰ تا ۲۰ سال رخ می‌دهد. امید به زندگی حدود ۸۰ درصد افراد سالم هم‌سن است. دلیل مرگ معمولاً پنومونی، سکته یا عفونت است.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&auto=format&fit=crop",
                    MetaTitle = "بیماری پارکینسون سالمندی | علائم، درمان و حرکات درمانی",
                    MetaDescription = "شناخت علائم اولیه پارکینسون، مدیریت دارویی لوودوپا و بهترین تمرینات توانبخشی حرکتی برای بهبود کیفیت زندگی سالمند در منزل.",
                    PrimaryKeyword = "بیماری پارکینسون در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "داروی پارکینسون لوودوپا", "تمرینات فیزیوتراپی پارکینسون", "رژیم غذایی پارکینسون", "راه رفتن پارکینسون", "زندگی با پارکینسون" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/diseases/parkinson",
                    Icd10Code = "G20",
                    SeverityLevel = 80,
                    PrevalenceRank = 4,
                    RequiresImmediateMedicalAttention = false,
                    IsActive = true,
                    DisplayOrder = 4,
                    MedicalReviewerId = medicalReviewer?.Id,
                    ViewCount = 1342
                },
                new()
                {
                    Name = "نارسایی قلبی",
                    Slug = "heart-failure",
                    ShortDescription = "نارسایی قلبی به معنی ضعیف شدن پمپاژ خون قلب است که باعث تنگی نفس، ادم پا و خستگی در سالمندان می‌گردد.",
                    Definition = "نارسایی قلبی (Heart Failure) سندرم پیچیده‌ای است که در آن قلب قادر نیست خون کافی برای پاسخ به نیاز متابولیک بافت‌ها پمپاژ نماید و یا این کار با افزایش فشارهای داخل قلب همراه است. به دو شکل HFpEF با EF حفظ‌شده و HFrEF با EF کاهش‌یافته طبقه‌بندی می‌شود.",
                    Causes = JsonSerializer.Serialize(new[]{ "حمله قلبی قبلی و انفارکتوس میوکارد", "پرفشاری خون کنترل‌نشده طولانی‌مدت", "بیماری دریچه‌های قلبی", "کاردیومیوپاتی اتساعی یا هیپرتروفیک", "نارسایی دیاستولیک در سالمندان HFpEF (۵۰٪)", "تاکی‌آریتمی‌های مزمن مانند فیبریلاسیون دهلیزی" }, jsonOptions),
                    Symptoms = JsonSerializer.Serialize(new[]{ "تنگی نفس در هنگام فعالیت یا خوابیدن دراز Orthopnea", "سرفه خشک یا فوم‌دار صبحگاهی", "ورم پا، مچ پا و ساق پا (ادم پیتینگ)", "افزایش وزن سریع بیش از ۲ کیلوگرم در هفته", "خستگی و عدم تحمل فعالیت", "نفخ شکم (آسیت) در مرحله پیشرفته" }, jsonOptions),
                    RiskFactors = JsonSerializer.Serialize(new[]{ "فشار خون بالا", "حمله قلبی قبلی", "دیابت نوع دو", "چاقی", "آپنه انسدادی خواب OSA", "مصرف زیاد نمک و مایعات", "مصرف داروهای ضد التهابی NSAID" }, jsonOptions),
                    Diagnosis = "سونوکاردیوگرافی Echo برای اندازه‌گیری EF، آزمایش خون BNP و NT-proBNP، EKG، رادیوگرافی قفسه سینه، آزمایش تمرین و گاهی کاتتریزاسیون.",
                    Treatment = "در HFrEF سه‌گانه طلایی شامل ACEi یا ARNI، بتا بلاکر و MRA (اسپرونولاکتون) به علاوه SGLT2i (دارپاگلیفلوزین) در هر دو فرم. درمان با دیورتیک‌های لوپ برای کنترل ادم.",
                    Prevention = "کنترل فشار خون زیر ۱۳۰/۸۰، مدیریت پس از حمله قلبی، کاهش وزن، محدودیت نمک کمتر از ۲ گرم در روز، ورزش قلبی-تنفسی تحت نظارت و ترخیص از برنامه کاردیاک ری هابیلیتیشن.",
                    HomeCareInstructions = "وزن‌کشی روزانه صبحگاهی روی ترازو یکسان، ثبت دقیق ادم پا و مقدار ادرار، محدودیت شدید نمک، اندازه‌گیری فشار خون و نبض ۲ بار در روز، شناخت علائم تجدید حاد برای مراجعه فوری.",
                    Complications = "ادم ریوی حاد (کاردیوژنیک)، فیبریلاسیون دهلیزی و لخته‌سازی، نارسایی کلیه قلبی کاردیو رنال، سکته مغزی آمبولیک، هپاتوز کاندژستیو و در نهایت شوک کاردیوژنیک.",
                    Prognosis = "۳۰٪ در اولین سال پس از تشخیص بیماری حاد بستری، مرگ می‌کنند. ۵ ساله بقای حدود ۵۰ درصد است. با مدیریت مداوم و داروهای هدفمند بهبود چشمگیر دارد.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop",
                    MetaTitle = "نارسایی قلبی HF | علائم، دارو و مراقبت در منزل",
                    MetaDescription = "مدیریت بیمار نارسایی قلبی در خانه؛ پایش وزن روزانه، محدودیت نمک، داروهای سه‌گانه طلایی و تشخیص زودهنگام علائم تشدید حاد.",
                    PrimaryKeyword = "نارسایی قلبی در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "تنگی نفس قلبی در خواب", "داروی نارسایی قلبی", "ادم پا در سالمندان", "محیط کم نمک برای قلب", "BNP طبیعی چقدر است" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/diseases/heart-failure",
                    Icd10Code = "I50.9",
                    SeverityLevel = 90,
                    PrevalenceRank = 5,
                    RequiresImmediateMedicalAttention = false,
                    IsActive = true,
                    DisplayOrder = 5,
                    MedicalReviewerId = medicalReviewer?.Id,
                    ViewCount = 1189
                }
            };
            context.Diseases.AddRange(diseases);
            await context.SaveChangesAsync();
        }

        var alzheimer = await context.Diseases.FirstAsync(d => d.Slug == "alzheimer");
        var stroke = await context.Diseases.FirstAsync(d => d.Slug == "stroke");
        var diabetes = await context.Diseases.FirstAsync(d => d.Slug == "diabetes");
        var parkinson = await context.Diseases.FirstAsync(d => d.Slug == "parkinson");

        // 5. Seed Guides
        if (!context.Guides.Any())
        {
            var guides = new List<Guide>
            {
                new()
                {
                    Title = "راهنمای کامل مراقبت از بیمار بعد از عمل قلب در منزل",
                    Slug = "post-surgery-care",
                    ShortDescription = "۱۰ گام اثبات‌شده برای توانبخشی ایمن و سریع بعد از عمل قلب یا بای‌پس در خانه؛ شامل دارو، تحرک، تغذیه و علائم خطر.",
                    Content = "مراقبت بعد از عمل قلب (CABG یا Valve Replacement) یک چرخه ۶ تا ۱۲ هفته‌ای است که انطباق دقیق با دستورالعمل‌های پزشکی در آن از اهمیت ویژه‌ای برخوردار است. بیمار باید در هفته اول پس از ترخیص، استراحت مطلق نسبی داشته باشد و تدریجی طبق برنامه کاردیاک ری هابیلیتیشن فعالیت خود را افزایش دهد. کنترل دقیق درد با داروهای تجویزشده، پانسمان صحیح زخم جراحی، و پایش روزانه علائم حیاتی بخش اصلی این فرایند است. مشکل‌سازی در صورت بروز تب بیش از ۳۸.۵، قرمزی یا ترشح از محل برش، تنگی نفس ناگهانی، درد قفسه سینه شدید و خون‌ریزی است. در طول دوره نقاهت نباید رانندگی کرد، بالای ۵ کیلوگرم بلند کرد و یا فعالیت‌های سنگین انجام داد. هماهنگی با کاردیولوژیست برای دیت‌های پیگیری هفتگی و ماهانه ضروری است.",
                    StepByStepInstructions = JsonSerializer.Serialize(new[] {
                        new { order = 1, title = "آماده‌سازی اتاق قبل از بازگشت بیمار", details = "تمیز کردن و ضدعفونی محیط، آماده کردن تخت راحت با بالشتک‌های حمایتی، قرار دادن ترازوی دیجیتال، فشارسنج و اکسی‌متر کنار تخت." },
                        new { order = 2, title = "رویین و دوز صحیح داروها", details = "تهیه دفترچه دارو با برنامه ساعت‌بندی، استفاده از باکس دارو برای جلوگیری از اشتباه، یادآوری دقیق مصرف آنتی‌کوآگولانت‌ها." },
                        new { order = 3, title = "مراقبت از زخم جراحی و پانسمان", details = "استحمام با دوش آب گرم پس از ۴۸ ساعت، لمس نکردن Staples، تعویض پانسمان با تکنیک آسپتیک." },
                        new { order = 4, title = "برنامه تحرک روزانه ۶ دقیقه‌ای", details = "پیاده‌روی کوتاه ۳ بار در روز، افزایش تدریجی مسافت، حفظ عمودیت ستون فقرات هنگام حرکت." },
                        new { order = 5, title = "برنامه رژیم غذایی قلبی سالم", details = "محدودیت نمک زیر ۲ گرم، افزایش فیبر، ماهی سالمون ۲ بار در هفته، پرهیز از چربی‌های اشباع." },
                        new { order = 6, title = "پایش علائم حیاتی دو مرتبه در روز", details = "ثبت فشار خون، نبض، اکسیژن خون، دمای بدن و وزن روزانه." },
                        new { order = 7, title = "شناخت زودهنگام علائم هشدار", details = "تب، ترشح زخم، ادم، تنگی نفس، آریتمی و درد قفسه سینه." },
                        new { order = 8, title = "مراجعات منظم به کاردیولوژیست", details = "ویزیت ۷ روزه اول، ۳۰ روزه دوم، اکو ۳ ماهه و تست ورزش ۶ ماهگی." },
                        new { order = 9, title = "حمایت روانی و مدیریت استرس", details = "آموزش تکنیک‌های تنفس عمیق، مهمان‌دوزی منظم و ممانعت از تنهایی طولانی." },
                        new { order = 10, title = "بازگشت تدریجی به زندگی عادی", details = "رانندگی بعد از ۴ تا ۶ هفته، بازگشت به کار سبک بعد از ۸ هفته، رابطه زناشویی پس از ۳ تا ۶ هفته." }
                    }, jsonOptions),
                    ToolsRequired = JsonSerializer.Serialize(new[]{ "فشارسنج آنروید (ATRTECH یا OMRON)", "اکسی‌متر انگشتی", "ترازوی دیجیتال دقیق", "ترمومتر دیجیتال زیرزبانی", "جعبه دارو روزانه ۷ روزه", "پوش Zyderm یا Hydrocolloid برای زخم" }, jsonOptions),
                    Precautions = "• نباید تا ۶ هفته بالای ۵ کیلوگرم جسم را بلند کرد. • رانندگی ممنوع است تا پزشک اجازه دهد. • دوش آب گرم زیر ۱۰ دقیقه. • زخم جراحی را با صابون نشکن شسته و با دستمال تمیز خشک کنید. • مکمل‌های گیاهی و داروی گیاهی را فقط با اجازه کاردیولوژیست مصرف کنید.",
                    WhenToSeekMedicalHelp = "اگر دمای بدن بالای ۳۸.۵ درجه بود، در صورت تنگی نفس استراحت، درد قفسه سینه بیش از ۱۰ دقیقه، خون‌ریزی از محل برش، ادم ناگهانی پاها یا خستگی بیش از حد حتماً به اورژانس قلبی مراجعه کنید.",
                    DifficultyLevel = 3,
                    EstimatedTimeMinutes = 45,
                    CoverImageUrl = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&auto=format&fit=crop",
                    MetaTitle = "مراقبت بعد از عمل قلب در منزل | راهنمای گام‌به‌گام",
                    MetaDescription = "دستورالعمل اثبات‌شده برای مراقبت ایمن از بیمار عمل قلب یا بای‌پس در منزل؛ برنامه دارویی، توانبخشی و علائم خطر فوری.",
                    PrimaryKeyword = "مراقبت بعد از عمل قلب در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "توانبخشی بعد از عمل قلب", "پانسمان زخم جراحی قلب", "رژیم غذایی بعد از عمل قلب", "قیمت پرستار بعد از عمل", "چه زمانی بعد از عمل قلب بیمارستان را ترک می‌کنیم" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/guides/post-surgery-care",
                    CategoryId = nursingCat.Id,
                    RelatedDiseaseId = alzheimer.Id == default ? null : 5, // heart failure
                    AuthorId = nurseAuthor?.Id,
                    IsActive = true,
                    DisplayOrder = 1,
                    ViewCount = 987
                },
                new()
                {
                    Title = "آموزش پانسمان زخم بستر (Pressure Ulcer) در خانه",
                    Slug = "wound-care-guide",
                    ShortDescription = "نحوه صحیح پانسمان زخم بستر در ۴ مرحله؛ انتخاب درست وسایل، تمیز کردن جراحی، انتخاب Dressings بر اساس مرحله زخم و کاهش فشار روی نواحی استخوانی.",
                    Content = "زخم بستر یکی از شایع‌ترین عوارض در سالمندان تحرک‌ناپذیر است. طبق جدیدترین راهنمای NPUAP/EPUAP ۲۰۲۳ پیشگیری مهم‌ترین بخش مدیریت است. زخم بستر به ۴ مرحله تقسیم‌بندی می‌شود؛ مرحله ۱ با قرمزی پوست، مرحله ۲ با تاول و تخریب اپیدرم، مرحله ۳ با نفوذ به چربی زیرپوستی و مرحله ۴ با رسیدن به استخوان و عضله مشخص می‌گردد. انتخاب پوشش بر اساس نوع زخم، میزان ترشحات، وجود نکروز و عفونت تعیین می‌شود. Hydrocolloid برای زخم‌های سطحی کم‌ترشح، Alginate برای زخم‌های پرترشح، هیدروژل برای نکروز خشک و فوم پلی‌یوریتان برای زخم‌های عفونی مدرج درمانند.",
                    StepByStepInstructions = JsonSerializer.Serialize(new[] {
                        new { order = 1, title = "آماده‌سازی محیط و وسایل", details = "شستن دست‌ها با آب و صابون به مدت ۲۰ ثانیه، آماده‌سازی ساش سیل، پوشش‌های استریل، سرنگ ۲۰ سی‌سی با N/S ۰.۹٪، دستکش بی‌استریل و استریل." },
                        new { order = 2, title = "حذف پانسمان قدیمی", details = "لبخند مرطوب، کندن آهسته در جهت موها، بررسی نوع و مقدار ترشح، بو و رنگ زخم، ثبت در دفترچه." },
                        new { order = 3, title = "آماده‌سازی و تمیز کردن", details = "آماده‌سازی در محل با Normal Saline ۰.۹٪ داغ در سرنگ ۲۰ سی‌سی و سوزن ۱۸، تمیز کردن مرکز به سمت اطراف به صورت مدور." },
                        new { order = 4, title = "انتخاب و اعمال پوشش جدید", details = "برای زخم مرحله ۱: فویل ترنسپارنت یا سوکره. برای مرحله ۲: هیدروکلوئید. برای مرحله ۳: آلژینات یا کلاژن. برای مرحله ۴: دبریدمن جراحی یا آنزیمی." }
                    }, jsonOptions),
                    ToolsRequired = JsonSerializer.Serialize(new[]{ "سرنگ ۲۰ سی‌سی استریل", "سر سوزن 18G Angiocath", "سرم نرمال سالین ۰.۹٪ ۲۰ میلی‌لیتر", "گازهای استریل ۱۰×۱۰", "دستکش بی‌استریل", "دستکش استریل سایز مناسب", "پوش هیدروکلوئید Comfeel", "پوش آلژینات Kaltostat", "چسب Hypafix یا Mefix" }, jsonOptions),
                    Precautions = "• هرگز از بوتیدین، هیپوکلریت، پوویدون ید یا آب اکسیژنه روی زخم استفاده نکنید → منجر به فیبروبلاست توکسیسیته می‌شود. • تعویض پانسمان هیدروکلوئید معمولاً هر ۳ تا ۵ روز، آلژینات هر ۲۴ تا ۴۸ ساعت. • در صورت وجود بافت نکروتیک اطراف لبه‌ها باید دبریدمن توسط پرستار انجام شود.",
                    WhenToSeekMedicalHelp = "اگر زخم عطر نامطبوع پیدا کرد، قرمزی لبه‌ای بیش از ۲ سانتی‌متر داشت، ترشح چرکی خالص شد، یا بیمار تب بالای ۳۸ داشت، حتماً پزشک یا پرستار متخصص زخم تماس بگیرید.",
                    DifficultyLevel = 5,
                    EstimatedTimeMinutes = 30,
                    CoverImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop",
                    MetaTitle = "پانسمان زخم بستر در منزل | آموزش تصویری و تمرکز",
                    MetaDescription = "پانسمان صحیح زخم بستر ۴ مرحله‌ای با انتخاب پوشش بر اساس مرحله زخم؛ راهنمای به‌روز NPUAP سال ۱۴۰۴ برای خانواده و پرستار.",
                    PrimaryKeyword = "پانسمان زخم بستر در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "مراحل زخم بستر", "بهترین پوشش زخم بستر", "پیشگیری از زخم بستر در بیمار بستری", "قیمت پانسمان زخم", "دبریدمن زخم در منزل" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/guides/wound-care-guide",
                    CategoryId = nursingCat.Id,
                    AuthorId = nurseAuthor?.Id,
                    IsActive = true,
                    DisplayOrder = 2,
                    ViewCount = 876
                },
                new()
                {
                    Title = "۱۰ اصل خواب عمیق و سالم برای سالمندان بالای ۷۰",
                    Slug = "elderly-sleep-guide",
                    ShortDescription = "راهکارهای اثبات‌شده بر اساس مطالعات ۲۰۲۳ برای بهبود کیفیت خواب سالمندان؛ بدون نیازی به داروی خواب‌آور با عوارض جانبی.",
                    Content = "اختلال خواب در ۶۰ تا ۷۰ درصد افراد بالای ۶۵ سال دیده می‌شود و شامل دشواری در شروع خواب، بیداری‌های مکرر شبانه، خواب قطعه‌قطعه و خواب‌آلودگی روز است. تغییرات فیزیولوژیک سن شامل کاهش ترشح ملاتونین، تغییر چرخه ۲۴ ساعته سیرکادیان، آپنه انسدادی خواب، سندرم پاهای بی‌قرار و ادرار شبانه مکرر عوامل اصلی در پیدایش آن هستند. عدم دریافت خواب کافی در سالمندان منجر به افت شناختی ۲ برابری، افزایش ۳ برابری سقوط، کاهش فعالیت سلول‌های ایمنی بدن و افزایش افسردگی می‌گردد. بر اساس دستورالعمل‌های انجمن پزشکی خواب آمریکا (AASM) ۲۰۲۳ سالمندان به ۷ تا ۸ ساعت خواب پیوسته شبانه نیاز دارند.",
                    StepByStepInstructions = JsonSerializer.Serialize(new[] {
                        new { order = 1, title = "ایجاد برنامه ساعت خواب ثابت ۷ روز هفته", details = "ورود به رختخواب دقیقاً در ساعت ۲۲:۳۰ و بیدار شدن ساعت ۶:۳۰ صبح حتی در روزهای تعطیل. جهت تنظیم ساعت درونی بدن." },
                        new { order = 2, title = "روتین آرامش‌بخش قبل از خواب ۴۵ دقیقه‌ای", details = "حمام آب ولرم (کاهش یک درجه دمای مرکزی بدن)، دمنوش بابونه، خواندن کتاب کاغذی، دوری از صفحه نمایش موبایل یا تلویزیون." },
                        new { order = 3, title = "غیرفعال‌سازی نورهای آبی اتاق", details = "استفاده از پرده تیره Blackout، نصب نور قرمز کم‌روشن راهرو، بستن LEDهای دستگاه با چسب مات، حذف ساعت دیجیتال از دید مستقیم." },
                        new { order = 4, title = "کنترل دما و رطوبت محیط", details = "دمای ۱۸ تا ۲۰ درجه سانتیگراد، رطوبت ۴۰ تا ۵۰ درصد، استفاده از کولر گازی Inverter یا بخور سرد در هوا خشک." },
                        new { order = 5, title = "محدودیت مصرف کافئین بعد از ساعت ۲ بعدازظهر", details = "قهوه، چای سیاه، شکلات تلخ، نوشابه‌های انرژی‌زا و داروهای ضد سرمگی حاوی کافئین را در نیمه دوم روز حذف کنید." },
                        new { order = 6, title = "ورزش هوازی صبحگاهی ۳۰ دقیقه‌ای", details = "پیاده‌روی سریع یا تای چی در ساعات اولیه روز؛ ترشح آدنوزین برای شب. ورزش سنگین تا ۳ ساعت قبل از خواب ممنوع." },
                        new { order = 7, title = "درمان آپنه خواب با CPAP در صورت نیاز", details = "در صورت داشتن آپنه درمان‌نشده، تست خواب Polysomnography و استفاده از دستگاه CPAP باعث بهبود ۵۰٪ خواب و کاهش ۳ برابری سکته می‌شود." },
                        new { order = 8, title = "محدودیت مایعات ۳ ساعت قبل از خواب", details = "کاهش ادرار مکرر شب (Nocturia)، پرهیز از الکل که کیفیت مرحله Deep REM را از بین می‌برد." },
                        new { order = 9, title = "تمرین تکنیک ریلکسیشن پیشرفته جاکوبسون", details = "کشیدن و رها کردن تدریجی ۱۶ گروه عضلانی بدن با زمان‌بندی ۵ ثانیه کشش و ۱۰ ثانیه رها." },
                        new { order = 10, title = "اجتناب از چرت‌های طولانی بعدازظهر", details = "چرت‌گاه بین ۲۰ تا ۳۰ دقیقه در ساعت ۱۳ تا ۱۴ برای افزایش هوشیاری بعدازظهر و کاهش خطر بهم‌ریختگی خواب شبانه." }
                    }, jsonOptions),
                    ToolsRequired = JsonSerializer.Serialize(new[]{ "ماشین خواب بسته‌بندی شده (Sleep Mask)", "پرده تیره اتاق Blackout", "ساعت اعلان صبح بدون نور آبی", "دستگاه بخور سرد با رطوبت‌سنج", "دماسنج اتاق دیجیتال" }, jsonOptions),
                    Precautions = "• هرگز به صورت روزمره از بنزودیازپین‌ها (دیکپام، لورا، آتیولان) به عنوان خواب‌آور استفاده نکنید؛ منجر به افزایش ۵۰٪ خطر دمانس می‌شوند. • ملاتونین در دوزهای کم (۰.۵ تا ۱ میلی‌گرم) ۹۰ دقیقه قبل از خواب بی‌خطر است. • داروهای آنتی هیستامین خواب‌آور مانند سی‌هیستادول برای مصرف طولانی‌مدت مناسب نیستند.",
                    WhenToSeekMedicalHelp = "اگر با تمام این تغییرات سبک زندگی هنوز هم خواب ندارید، یا بیدار شدن مکرر شب با تنگی نفس همراه دارد، یا در هنگام خواب پاهایتان لرزش دارد، به پزشک متخصص خواب (Somnologist) مراجعه کنید.",
                    DifficultyLevel = 2,
                    EstimatedTimeMinutes = 20,
                    CoverImageUrl = "https://images.unsplash.com/photo-1520205206007-3504a2ee9125?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1520205206007-3504a2ee9125?w=1200&auto=format&fit=crop",
                    MetaTitle = "خواب سالم برای سالمندان | ۱۰ راهکار علمی بدون دارو",
                    MetaDescription = "اصلاحات اثبات‌شده سبک زندگی برای درمان بی‌خوابی در سالمندان؛ روتین شبانه، تکنیک‌های ریلکسیشن و خواب عمیق ۷ تا ۸ ساعته بدون عوارض دارو.",
                    PrimaryKeyword = "رفع بی‌خوابی در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "میزان خواب سالمند ۷۰ ساله", "خواب ناپیوسته سالمند", "داروی خواب سالمند بدون عوارض", "افزایش ملاتونین طبیعی", "چرا سالمندان زود می‌خوابند" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/guides/elderly-sleep-guide",
                    CategoryId = mentalCat.Id,
                    AuthorId = contentManager?.Id,
                    IsActive = true,
                    DisplayOrder = 3,
                    ViewCount = 1123
                }
            };
            context.Guides.AddRange(guides);
            await context.SaveChangesAsync();
        }

        // 6. Seed Health Tools
        if (!context.HealthTools.Any())
        {
            var tools = new List<HealthTool>
            {
                new()
                {
                    Name = "محاسبه توده بدنی BMI اختصاصی سالمندان",
                    Slug = "bmi-calculator",
                    ShortDescription = "ابزار رایگان و آنلاین محاسبه BMI با مقیاس اصلاح‌شده برای افراد بالای ۶۵ سال؛ محدوده ایده‌آل ۲۲ تا ۲۷ BMI",
                    Description = "شاخص توده بدنی (BMI Body Mass Index) نسبت وزن به قد فرد است. برای سالمندان بالای ۶۵ سال محدوده طبیعی ایده‌آل طبق دستورالعمل‌های انجمن تغذیه آمریکا و انجمن سالمندی ۲۰۲۳ کمی بالاتر از جمعیت عمومی تعیین شده است. محدوده BMI بین ۲۲ تا ۲۷ برای سالمندان بیشترین بقای ۵ ساله را نشان می‌دهد و کمتر از ۲۲ نشان‌دهنده ریسک سوءتغذیه و بالای ۳۰ نشان‌دهنده خطرات قلبی-متابولیک است. این ابزار براساس آخرین استانداردهای پزشکی برای سالمندان طراحی شده است.",
                    ToolType = HealthToolType.Calculator,
                    ToolConfigurationJson = JsonSerializer.Serialize(new { elderlyIdealRange = new { min = 22.0, max = 27.0 }, generalIdealRange = new { min = 18.5, max = 24.9 } }, jsonOptions),
                    HowToUse = "۱. قد را به سانتی‌متر (بدون کفش) وارد کنید. ۲. وزن را به کیلوگرم با لباس کم و قبل از ناهار وارد کنید. ۳. سن سال‌های کامل را وارد کنید. ۴. جنسیت و گروه جمعیت (سالمند/زن/مرد) را انتخاب کنید. ۵. روی محاسبه کلیک کنید و نتیجه را تفسیر کنید.",
                    InterpretationGuide = "زیر ۲۰: کمبود وزن جدی → ریسک سوءتغذیه و پوکی استخوان. ۲۰ تا ۲۲: کمبود وزن خفیف نیاز به مشورت با متخصص تغذیه. ۲۲ تا ۲۷: محدوده ایده‌آل سالمندی. ۲۷ تا ۳۰: اضافه وزن نیاز به مدیریت رژیم. ۳۰ به بالا: چاقی درجه یک و بالاتر. ۳۵ به بالا: چاقی موربید همراه با عوارض.",
                    Disclaimers = "این ابزار صرفاً برای اطلاع‌رسانی عمومی است و به هیچ عنوان جایگزین مشاوره پزشکی یا پزشک متخصص نمی‌باشد. BMI در افراد عضلانی، افراد کم‌قد (May stature) و یا کسانی که زخم بستر یا التهاب مزمن دارند به درستی عمل نمی‌کند. برای تشخیص دقیق وضعیت تغذیه با متخصص تغذیه بالینی سالمندیار تماس حاصل فرمایید.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&auto=format&fit=crop",
                    MetaTitle = "محاسبه BMI سالمندان | ابزار توده بدنی آنلاین رایگان",
                    MetaDescription = "محاسبه توده بدنی با استاندارد جدید سالمندی؛ محدوده ایده‌آل ۲۲ تا ۲۷ BMI برای افراد بالای ۶۵ سال با تفسیر پزشکی اختصاصی.",
                    PrimaryKeyword = "محاسبه BMI سالمند",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "BMI ایده‌آل سالمند ۷۰ ساله", "فرمول BMI قد و وزن", "شاخص توده بدنی پایین در سالمند", "چاقی در سالمندان", "سوءتغذیه در سالمند تشخیص" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/tools/bmi-calculator",
                    IsActive = true,
                    DisplayOrder = 1,
                    ViewCount = 3421,
                    UsageCount = 1876
                },
                new()
                {
                    Name = "محاسبه کمای گلاسگو GCS برای سالمندان",
                    Slug = "gcs-calculator",
                    ShortDescription = "ابزار فوری محاسبه امتیاز GCS جهت ارزیابی سطح هوشیاری بیمار سالمند بر اساس سه معیار چشم، گفتار و واکنش حرکتی.",
                    Description = "مقیاس کمای گلاسگو (Glasgow Coma Scale - GCS) پرکاربردترین ابزار بالینی برای اندازه‌گیری سریع سطح هوشیاری است که در بخش‌های اورژانس، ICU و همچنین مراقبت در منزل بیماران نورولوژیک استفاده می‌شود. این ابزار از سه جزء ۴ تایی چشم (Eye)، ۵ تایی گفتار (Verbal) و ۶ تایی حرکتی (Motor) تشکیل شده است. مجموع امتیاز از ۳ تا ۱۵ متغیر است. امتیاز ≤ ۸ نشان‌دهنده کما شدید (Severe)، ۹ تا ۱۲ کما متوسط (Moderate) و ۱۳ تا ۱۵ اختلال خفیف (Mild) می‌باشد.",
                    ToolType = HealthToolType.Assessment,
                    ToolConfigurationJson = JsonSerializer.Serialize(new { scales = new { E = 4, V = 5, M = 6 } }, jsonOptions),
                    HowToUse = "۱. بیمار را با صدای بلند صدا بزنید و در صورت بی‌پاسخ لمس دردناک (نیشگن روی ناخن یا فشار روی ماستوئید) را اعمال کنید. ۲. بهترین پاسخ چشم، گفتار و حرکتی را در هر سه جزء ثبت کنید. ۳. روی دکمه محاسبه کلیک کنید و تفسیر شدت و اقدام پرستاری را بخوانید.",
                    InterpretationGuide = "GCS ≤ 8: کما شدید → نیاز به حمایت راه هوایی و انتقال فوری به ICU. GCS 9-12: متوسط → نیاز به مانیتورینگ نزدیک و معاینه عصبی مکرر. GCS 13-15: خفیف → ارزیابی علل زمینه‌ای مثل هیپوگلیسمی یا عفونت.",
                    Disclaimers = "این محاسبه صرفاً برای آموزش و کمک تصمیم‌گیری است. هرگونه افت ناگهانی یک نقطه GCS یا ثابت ماندن زیر ۹ نیازمند انتقال فوری به اورژانس عصب و پزشک متخصص نورولوژی است. در بیماران تراکئوستومی یا لارنگکتومی، جزء گفتار با حرف T جایگزین می‌شود.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop",
                    MetaTitle = "محاسبه GCS کمای گلاسگو | مقیاس هوشیاری آنلاین",
                    MetaDescription = "محاسبه امتیاز کمای گلاسگو (E4V5M6) برای ارزیابی سریع سطح هوشیاری بیمار سالمند در منزل با تفسیر شدت و اقدامات پرستاری فوری.",
                    PrimaryKeyword = "محاسبه GCS در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "مقیاس گلاسگو چیست", "GCS 15 یعنی چه", "GCS کمای شدید چقدر است", "ارزیابی سطح هوشیاری سالمند", "نوار مغزی و GCS بیمار" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/tools/gcs-calculator",
                    IsActive = true,
                    DisplayOrder = 2,
                    ViewCount = 2891,
                    UsageCount = 1432
                },
                new()
                {
                    Name = "محاسبه قطره سرم (Drip Rate) در پرستاری",
                    Slug = "drip-rate-calculator",
                    ShortDescription = "ابزار محاسبه دقیق سرعت انفوزیون سرم بر اساس حجم، زمان و نوع ست (ماکرو ۲۰، میکرو ۶۰، بیورتی ۶۰) برای پرستاران و مراقبان.",
                    Description = "محاسبه سرعت قطره سرم (Drip Rate یا Drop Factor) یکی از محاسبات مهم روزانه پرستاران در مراقبت در منزل است. قطره در دقیقه gtt/min بر اساس سه متغیر حجم انفوزیون (mL)، زمان انفوزیون (min یا hr) و ضریب قطره Drop Factor تعیین می‌شود. ست‌های ماکرو (Macro Drip) برای سرعت‌های بالا و بالغین دارای ضریب ۱۰، ۱۵ یا ۲۰ و ست‌های میکرو (Micro Drip / Burette / Soluset) برای نوزادان، کودکان و بیماران حساس با ضریب ۶۰ قطره بر میلی‌لیتر هستند.",
                    ToolType = HealthToolType.Calculator,
                    ToolConfigurationJson = JsonSerializer.Serialize(new { dropFactors = new { macro = 20, micro = 60, burette = 60 } }, jsonOptions),
                    HowToUse = "۱. حجم کل سرم یا دارو را بر حسب میلی‌لیتر وارد کنید. ۲. مدت زمان انفوزیون را بر حسب ساعت یا دقیقه وارد کنید. ۳. نوع ست سرم (ماکرو/میکرو/بیورتی) را انتخاب کنید. ۴. روی دکمه محاسبه کلیک کنید و قطره در دقیقه را روی رگولاتور چرخ تنظیم کنید.",
                    InterpretationGuide = "سرعت‌های کمتر از ۱۰ قطره در دقیقه معمولاً نیاز به پمپ اینفوزیون دارند. سرعت‌های بیش از ۱۲۰ قطره در دقیقه برای ماکرو در بیماران قلبی نیازمند احتیاط و همراهی با پزشک است.",
                    Disclaimers = "این محاسبه صرفاً کمکی است و نباید جایگزین مداومت بالینی پرستار باتجربه باشد. در داروهای خاص (وازوپرسورها، کاتکولامین‌ها، انسولین IV، داروهای شیمی‌درمانی) حتماً باید از پمپ انفوزیون حجمی استفاده شود.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&auto=format&fit=crop",
                    MetaTitle = "محاسبه قطره سرم (Drip Rate) | فرمول و ابزار پرستاری",
                    MetaDescription = "محاسبه سرعت قطره سرم (gtt/min) بر اساس حجم، زمان و نوع ست ماکرو/میکرو؛ ابزار رایگان پرستاری سالمندیار برای استفاده در منزل.",
                    PrimaryKeyword = "محاسبه قطره سرم در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "فرمول قطره سرم", "قطره در دقیقه ماکرو ۲۰ میکرو ۶۰", "سرعت تزریق سرم", "محاسبه cc در ساعت سرم", "چگونه رگولاتور سرم را تنظیم کنیم" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/tools/drip-rate-calculator",
                    IsActive = true,
                    DisplayOrder = 3,
                    ViewCount = 2187,
                    UsageCount = 1654
                },
                new()
                {
                    Name = "مقیاس برادن ارزیابی ریسک زخم بستر",
                    Slug = "braden-scale",
                    ShortDescription = "ابزار استاندارد ۶ پارامتره پیش‌بینی ریسک زخم بستر در بیماران بستری؛ امتیازدهی ۶ تا ۲۳ با برنامه پیشگیری طبق هر سطح ریسک.",
                    Description = "مقیاس برادن (Braden Scale for Predicting Pressure Ulcer Risk) استاندارد جهانی برای پیش‌بینی زخم بستر در بیماران مسن و بستری است که توسط وزارت بهداشت آمریکا و NPUAP تأیید شده است. این مقیاس شش زیرمقیاس حسی، رطوبت، فعالیت، تحرک، تغذیه و اصطکاک/برش را اندازه‌گیری می‌کند. مجموع امتیاز از ۶ (بسیار پرخطر) تا ۲۳ (بدون خطر) متغیر است. هر بیمار با امتیاز ≤ ۱۸ در اولویت برنامه پیشگیری قرار می‌گیرد.",
                    ToolType = HealthToolType.Assessment,
                    ToolConfigurationJson = JsonSerializer.Serialize(new { thresholds = new { veryHigh = 9, high = 12, moderate = 14, mild = 18 } }, jsonOptions),
                    HowToUse = "۱. بیمار را در یک روز معمولی از نظر هر شش جنبه ارزیابی کنید. ۲. در هر پارامتر گزینه مناسب را انتخاب نماید. ۳. مجموع امتیاز را ببینید و طبق برنامه پیشگیری پیشنهادی عمل کنید. تکرار ارزیابی هر ۲۴ ساعت برای بیماران پرخطر.",
                    InterpretationGuide = "≥ 19: بی خطر → ارزیابی هفتگی. 15-18: خطر کم → برنامه استاندارد. 13-14: خطر متوسط → افزودن تشک هوا + چرخش ۲ ساعته. 10-12: خطر بالا → سیستم بستر Low Air Loss + برنامه تغذیه پر پروتئین. ≤ 9: بسیار بالا → اورژانسی + ویزیت متخصص زخم در ۴۸ ساعت.",
                    Disclaimers = "این ابزار برای تربیت پرستار و مراقبان خانه تهیه شده است. بیمارانی که در گروه پرخطر قرار می‌گیرند باید توسط پرستار متخصص سالمندیار دیده شوند و برنامه مدیریت تهیه گردد.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&auto=format&fit=crop",
                    MetaTitle = "مقیاس برادن Braden Scale | ارزیابی ریسک زخم بستر",
                    MetaDescription = "محاسبه استاندارد ریسک زخم بستر با ابزار ۶ پارامتره برادن؛ تفسیر امتیاز و برنامه پیشگیری علمی برای بیمار بستری در منزل.",
                    PrimaryKeyword = "مقیاس برادن زخم بستر",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "امتیاز ایده‌آل برادن چقدر است", "زیرمقیاس‌های برادن چیست", "چرخش بیمار هر چند ساعت", "تشک هوا برای ریسک زخم بستر", "برنامه پیشگیری زخم بستر" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/tools/braden-scale",
                    IsActive = true,
                    DisplayOrder = 4,
                    ViewCount = 1543,
                    UsageCount = 872
                },
                new()
                {
                    Name = "چک‌لیست مراقبت روزانه بیمار سالمند در منزل",
                    Slug = "daily-care-checklist",
                    ShortDescription = "چک‌لیست جامع ۳۲ آیتمی ۸ بخشی مراقبت روزانه از سالمند بستری؛ قابل ذخیره، پرینت و دنبال‌کردن تکمیل روزانه با درصد پیشرفت.",
                    Description = "چک‌لیست مراقبت روزانه ابزار اصلی مدیریت کیفیت مراقبت در منزل است. این چک لیست بر اساس استانداردهای سازمان جهانی بهداشت (WHO) و انجمن پرستاران آمریکا (ANA) ۲۰۲۳ در هشت بخش مراقبت‌های صبحگاهی، تغذیه، بهداشت شخصی، دارو، پوست و تخت، فیزیوتراپی، سلامت روان و مراقبت‌های شبانه تهیه شده است. هر آیتم به صورت دوتایی (انجام شده / انجام نشده) بررسی می‌شود و درصد پیشرفت روزانه محاسبه می‌گردد.",
                    ToolType = HealthToolType.Checklist,
                    ToolConfigurationJson = JsonSerializer.Serialize(new { sectionsCount = 8, itemsCount = 32 }, jsonOptions),
                    HowToUse = "۱. چک‌لیست را هر روز صبح پس از بیدار شدن باز کنید. ۲. مطابق ترتیب بخش‌ها را تکمیل کنید. ۳. هر آیتم اجراشده را با کلیک روی مربع علامت بزنید. ۴. نوار پیشرفت را دنبال کنید تا به ۱۰۰ درصد برسد. ۵. در پایان روز می‌توانید یادداشت روزانه را پر کرده و نتیجه را به صورت PDF چاپ کنید.",
                    InterpretationGuide = "درصد تکمیل زیر ۷۰٪ در روزهای پیاپی نشان‌دهنده نیاز به بازبینی برنامه مراقبتی و احتمالاً درخواست حضور پرستار روزانه یا شبانه‌روزی در خانه است.",
                    Disclaimers = "این چک‌لیست صرفاً سازمان‌دهنده برنامه مراقبتی است و جایگزین ویزیت دکتر یا پرستار متخصص نمی‌باشد. در صورت بروز علائم اورژانسی مانند تنگی نفس، درد قفسه سینه یا افت ناگهانی هوشیاری حتماً با اورژانس ۱۱۵ تماس بگیرید.",
                    CoverImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&auto=format&fit=crop",
                    MetaTitle = "چک‌لیست مراقبت روزانه بیمار سالمند در منزل",
                    MetaDescription = "برنامه جامع ۳۲ آیتمی مراقبت روزانه از سالمند بستری؛ ۸ بخش تغذیه، بهداشت، دارو، پوست، فیزیوتراپی و سلامت روان با ذخیره و چاپ.",
                    PrimaryKeyword = "چک لیست مراقبت روزانه از سالمند",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "برنامه روزانه سالمند در خانه", "چک لیست دارو روزانه", "مراقبت پوستی سالمند", "بهداشت بیمار بستری", "یادداشت پرستاری روزانه" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/tools/daily-care-checklist",
                    IsActive = true,
                    DisplayOrder = 5,
                    ViewCount = 1872,
                    UsageCount = 1121
                }
            };
            context.HealthTools.AddRange(tools);
            await context.SaveChangesAsync();
        }

        // 7. Seed Cities
        if (!context.Cities.Any())
        {
            var cities = new List<City>
            {
                new()
                {
                    Name = "تهران",
                    Slug = "tehran",
                    Province = "تهران",
                    ShortDescription = "پایتخت ایران، مرکز ارائه پرستاری در منزل سالمندیار؛ دارای تیم تخصصی پرستار ICU، فیزیوتراپیست و سالمندیار با پوشش تمام ۲۲ منطقه شهرداری.",
                    AboutRegion = "تهران بزرگ‌ترین شهر ایران با جمعیتی بالغ بر ۹ میلیون نفر است. مراکز درمانی سطح کشور از جمله بیمارستان‌های امام، نمازی، ولیعصر، شریعتی، ایران، لر و ... در این شهر واقع شده‌اند. تیم سالمندیار با بیش از ۱۲۰ نیروی پرستار فعال در تمام نقاط تهران آماده ارائه خدمات ۲۴ ساعته می‌باشد. شبکه پرستاری ما در مناطق شمالی شهر (شهرک غرب، ونک، زعفرانیه، نیاوران، جنت‌آباد)، مناطق مرکزی (لاله‌زار، منیریه، اسوه، پاسداران، ونک) و مناطق جنوبی (شهر ری، اسلامی‌شهر، پردیس، کهریزک) پوشش کامل دارد.",
                    CoveredAreas = JsonSerializer.Serialize(new[] { "منطقه ۱ تا ۲۲ کلانشهر تهران", "کرج جاده كربلا (Karaj SpecialZone)", "شهر‌های جدید پردیس، پاکدشت، قم‌سر", "اسلام‌شهر، گلسار", "کهریزک، ورامین", "ملارد، محمدشهر" }, jsonOptions),
                    LocalFAQs = JsonSerializer.Serialize(new[] {
                        new { q = "زمان رسیدن پرستار سالمندیار در تهران چند دقیقه است؟", a = "در اکثر نقاط تهران پرستار در کمتر از ۶۰ دقیقه به محل مراجعه می‌کند. برای خدمات هوشمندانه و ساعتی این زمان ۳۰ تا ۴۵ دقیقه است." },
                        new { q = "آیا شب‌ها خدمات پرستاری ویژه ICU در تهران ارائه می‌شود؟", a = "بله. تیم سالمندیار ۲۴ ساعته ۷ روز هفته از جمله ایام تعطیل شامل شب و تعطیلات رسمی خدمات ارائه می‌دهد." },
                        new { q = "هزینه پرستار روزانه در تهران چقدر است؟", a = "هزینه بر اساس نوع خدمت (تزریقات، پانسمان، ICU و...) و شیفت کاری (ساعتی، روزانه، شبانه، شبانه‌روزی) متفاوت است. برای دریافت پیش‌فاکتور دقیق با واحد مشاوره سالمندیار تماس بگیرید." }
                    }, jsonOptions),
                    PhoneNumber = "021-91009000",
                    CoverImageUrl = "https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=1200&auto=format&fit=crop",
                    MetaTitle = "خدمات پرستاری در منزل تهران | تیم ۲۴ ساعته سالمندیار",
                    MetaDescription = "پرستار در منزل تهران؛ پوشش ۲۲ منطقه با پرستار متخصص ICU، پانسمان تخصصی، فیزیوتراپی، سالمندیار ۲۴ ساعته با ۶۰ دقیقه پاسخگویی.",
                    PrimaryKeyword = "پرستار در منزل تهران",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "هزینه پرستار در منزل تهران", "پرستار ICU در منزل تهران", "فیزیوتراپی در منزل تهران", "سالمندیار شبانه‌روزی تهران", "خدمات پرستاری غرب تهران" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/cities/tehran",
                    Latitude = 35.6892,
                    Longitude = 51.3890,
                    IsActive = true,
                    DisplayOrder = 1,
                    Population = 9134000,
                    ViewCount = 4521
                },
                new()
                {
                    Name = "کرج",
                    Slug = "karaj",
                    Province = "البرز",
                    ShortDescription = "مرکز استان البرز، پوشش کامل مناطق ۱ تا ۱۰ کرج، شهرک‌های پردیسان، گلشهر، گوهردشت، هشتگرد و بخش‌های مرکزی با تیم پرستار ۲۴ ساعته سالمندیار.",
                    AboutRegion = "کرج با جمعیت حدود ۲ میلیون نفر در ۴۵ کیلومتری غرب تهران واقع شده است. بیمارستان‌های شهدای کرج، آیت‌الله مظاهری، مددکار، لقمان حکیم و ... از مراکز اصلی درمانی این شهر می‌باشند. تیم پرستاری سالمندیار کرج با ۳۵ نیروی پرستار و ۸ فیزیوتراپیست فعال است و خدمات خود را در تمام مناطق و شهرک‌های اطراف ارائه می‌دهد.",
                    CoveredAreas = JsonSerializer.Serialize(new[] { "مناطق ۱ تا ۱۰ کلانشهر کرج", "شهرک پردیسان، گلشهر", "گوهردشت، هشتگرد", "ماهدشت، سرآزادگان", "گرمسیر، مهمانسرا", "شهرهای جدید فردیس، نکا", "کمربندی کرج-تهران" }, jsonOptions),
                    LocalFAQs = JsonSerializer.Serialize(new[] {
                        new { q = "خدمات پرستاری سالمندیار در کدام نقاط کرج ارائه می‌شود؟", a = "تیم ما تمام مناطق ۱ تا ۱۰ کرج، شهرهای فردیس، نکا، هشتگرد و شهرک پردیسان و گلشهر را شامل می‌شود." },
                        new { q = "آیا خدمات پانسمان زخم بستر در منزل کرج دارید؟", a = "بله، پانسمان زخم‌های مرحله ۲ تا ۴ به‌وسیله پرستار متخصص زخم سالمندیار در خانه شما انجام می‌پذیرد." },
                        new { q = "برای درخواست سالمندیار شبانه‌روزی در کرج چه کار کنم؟", a = "از طریق فرم درخواست خدمت همین صفحه یا تماس با مرکز مشاوره ۰۲۶-۹۱۰۰۹۰۰۰، درخواست خود را ثبت کنید." }
                    }, jsonOptions),
                    PhoneNumber = "026-91009000",
                    CoverImageUrl = "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&auto=format&fit=crop",
                    MetaTitle = "پرستار در منزل کرج | خدمات پرستاری سالمندیار",
                    MetaDescription = "پرستار و سالمندیار در منزل کرج؛ پوشش کامل شهرک‌های پردیسان، گلشهر، هشتگرد، گوهردشت با پرستار متخصص ۲۴ ساعته و قیمت شفاف.",
                    PrimaryKeyword = "پرستار در منزل کرج",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "سالمندیار شبانه‌روزی کرج", "هزینه پرستار روزانه کرج", "پانسمان زخم در کرج", "فیزیوتراپی کرج در منزل", "ICU در منزل کرج" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/cities/karaj",
                    Latitude = 35.8327,
                    Longitude = 50.9915,
                    IsActive = true,
                    DisplayOrder = 2,
                    Population = 1973000,
                    ViewCount = 2312
                },
                new()
                {
                    Name = "اصفهان",
                    Slug = "isfahan",
                    Province = "اصفهان",
                    ShortDescription = "پایگاه پرستاری سالمندیار اصفهان؛ پوشش مناطق ۱ تا ۱۴، خاوران، کوهسنگی، ابریشم، شهرک‌های پردیس و پرند، تیم پرستار و فیزیوتراپیست.",
                    AboutRegion = "اصفهان با جمعیت حدود ۲ میلیون نفر مرکز استان اصفهان و یکی از قطب‌های درمانی مرکز کشور است. بیمارستان‌های شهید بهشتی، آیت‌الله کاشانی، سیدالشهدا، امام رضا (ع) و چلبی‌اوغلو از مراکز اصلی هستند. تیم سالمندیار اصفهان با ۲۸ نیروی پرستار در تمام مناطق شهری و محورهای جاده‌ای آماده ارائه خدمات در منزل می‌باشد.",
                    CoveredAreas = JsonSerializer.Serialize(new[] { "مناطق ۱ تا ۱۴ اصفهان", "شهرک‌های خاوران، کوهسنگی، ابریشم", "نظرآباد، صوفی‌خان", "پردیس اندیشه و پرند", "زاینده‌رود، رحیم‌آباد", "قهدریجان، گزور", "محورهای جاده‌ای کرک‌شیراز و کرک-تهران" }, jsonOptions),
                    LocalFAQs = JsonSerializer.Serialize(new[] {
                        new { q = "آیا برای ترخیص از بیمارستان کاشانی اصفهان پرستار شبانه‌روزی در منزل می‌گیرید؟", a = "بله، هماهنگی‌های ضروری قبل از ترخیص توسط تیم ما انجام می‌شود و پرستار در زمان مقرر در منزل حضور خواهد یافت." },
                        new { q = "محدوده زمانی پوشش پرستاری در اصفهان چیست؟", a = "همانند سایر پایگاه‌ها ۲۴ ساعته ۷ روز هفته شامل تعطیلات رسمی." }
                    }, jsonOptions),
                    PhoneNumber = "031-91009000",
                    CoverImageUrl = "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&auto=format&fit=crop",
                    MetaTitle = "پرستار در منزل اصفهان | خدمات سالمندیار استان اصفهان",
                    MetaDescription = "خدمات پرستاری در منزل اصفهان؛ پرستار ICU، فیزیوتراپی، پانسمان، سالمندیار با پوشش تمام مناطق ۱ تا ۱۴ و شهرک‌های پیرامونی.",
                    PrimaryKeyword = "پرستار در منزل اصفهان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "هزینه پرستار در اصفهان", "پانسمان زخم اصفهان", "خودمراقبتی اصفهان", "پرستار شبانه اصفهان", "پرستار بیمارستان اصفهان" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/cities/isfahan",
                    Latitude = 32.6546,
                    Longitude = 51.6680,
                    IsActive = true,
                    DisplayOrder = 3,
                    Population = 1961000,
                    ViewCount = 1834
                },
                new()
                {
                    Name = "شیراز",
                    Slug = "shiraz",
                    Province = "فارس",
                    ShortDescription = "پایگاه پرستاری سالمندیار شیراز؛ پوشش مناطق شهری شیراز، مرودشت، سعدی، اطراف بیمارستان‌های نمازی، مظفری و شفا با پرستار ۲۴ ساعته.",
                    AboutRegion = "شیراز با جمعیت نزدیک ۱.۵ میلیون نفر مرکز استان فارس است. بیمارستان‌های نمازی، مظفری، شفا، امام رضا، چمران و دکتر ساسولی از مراکز پزشکی اصلی هستند. تیم پرستاری سالمندیار شیراز با ۲۰ نیروی پرستار و ۶ فیزیوتراپیست خدمات درمانی-پرستاری را در منزل ساکنین شیراز ارائه می‌دهد.",
                    CoveredAreas = JsonSerializer.Serialize(new[] { "مناطق ۱ تا ۱۱ شیراز", "شهرک‌های سعدی، زین‌الدین", "معروفیان، اطراف نمازی", "استاد معین، بلوار سطر", "مرودشت و سروستان", "محور اصفهان شیراز" }, jsonOptions),
                    LocalFAQs = JsonSerializer.Serialize(new[] {
                        new { q = "آیا در نقاط اطراف شیراز مثل مرودشت هم پرستار می‌فرستید؟", a = "بله، شهر مرودشت و مناطق باحده ۵۰ کیلومتری شیراز در محدوده پوشش تیم ما قرار دارند." }
                    }, jsonOptions),
                    PhoneNumber = "071-91009000",
                    CoverImageUrl = "https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=1200&auto=format&fit=crop",
                    MetaTitle = "پرستار در منزل شیراز | سالمندیار استان فارس",
                    MetaDescription = "پرستار و سالمندیار در منزل شیراز؛ پوشش مناطق شهری و مرودشت با پرستار متخصص ICU، پانسمان و فیزیوتراپی ۲۴ ساعته.",
                    PrimaryKeyword = "پرستار در منزل شیراز",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "هزینه پرستار در شیراز", "پرستار ICU شیراز", "پانسمان زخم شیراز در منزل", "سالمندیار شیراز شبانه‌روزی", "خدمات پرستاری فارس" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/cities/shiraz",
                    Latitude = 29.5918,
                    Longitude = 52.5836,
                    IsActive = true,
                    DisplayOrder = 4,
                    Population = 1460000,
                    ViewCount = 1643
                },
                new()
                {
                    Name = "مشهد",
                    Slug = "mashhad",
                    Province = "خراسان رضوی",
                    ShortDescription = "پایگاه پرستاری سالمندیار مشهد؛ پوشش مناطق ۱ تا ۱۳، قدس، احمدآباد، سینا، اطراف بیمارستان‌های شریعتی، قائم و امام رضا.",
                    AboutRegion = "مشهد با حدود ۳.۳ میلیون نفر جمعیت دومین شهر پرجمعیت ایران و قطب مهم درمانی شرق کشور است. بیمارستان‌های شریعتی، قائم، امام رضا (ع)، دکتر شریعتی و ابن سینا اصلی‌ترین مراکز درمانی هستند. تیم پرستاری سالمندیار مشهد با ۴۵ نیروی فعال در تمام مناطق آماده ارائه خدمات پرستاری در منزل می‌باشد.",
                    CoveredAreas = JsonSerializer.Serialize(new[] { "مناطق ۱ تا ۱۳ کلانشهر مشهد", "بلوارهای قدس، احمدآباد، سینا", "شهرک‌های مجتمع اقلیمی", "جاده نور و انقلاب اسلامی", "میانه و جوادالحکیم", "رحیم‌آباد و خوشابی", "طرح گلشن و صنایع" }, jsonOptions),
                    LocalFAQs = JsonSerializer.Serialize(new[] {
                        new { q = "آیا برای سالمندانی که در نزدیکی حرم مشهد زندگی می‌کنند سرویس دارید؟", a = "بله، تمام مناطق مرکزی مشهد از جمله پیرامون حرم، بلوارهای قدس و احمدآباد و اطراف بیمارستان‌های قائم و شریعتی در پوشش ما هستند." }
                    }, jsonOptions),
                    PhoneNumber = "051-91009000",
                    CoverImageUrl = "https://images.unsplash.com/photo-1564769676198-9789626fa739?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1564769676198-9789626fa739?w=1200&auto=format&fit=crop",
                    MetaTitle = "پرستار در منزل مشهد | خدمات پرستاری سالمندیار خراسان",
                    MetaDescription = "پرستار و سالمندیار در منزل مشهد با پوشش تمام مناطق ۱ تا ۱۳، پرستار متخصص ICU، سالمندیار شبانه‌روزی و فیزیوتراپی ۲۴ ساعته.",
                    PrimaryKeyword = "پرستار در منزل مشهد",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "هزینه پرستار روزانه مشهد", "پرستار ICU در منزل مشهد", "پانسمان زخم مشهد", "فیزیوتراپی مشهد در منزل", "خودمراقبتی سالمند مشهد" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/cities/mashhad",
                    Latitude = 36.2605,
                    Longitude = 59.6168,
                    IsActive = true,
                    DisplayOrder = 5,
                    Population = 3302000,
                    ViewCount = 2845
                }
            };
            context.Cities.AddRange(cities);
            await context.SaveChangesAsync();
        }

        var tehran = await context.Cities.FirstAsync(c => c.Slug == "tehran");
        var homeCareService = await context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Code == "ELDER");
        var woundService = await context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Code == "WOUND");
        var icuService = await context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Code == "ICU");

        // 8. Seed Articles
        if (!context.Articles.Any())
        {
            var articles = new List<Article>
            {
                new()
                {
                    Title = "۱۰ علائم اولیه آلزایمر در سالمندان که ۷۰٪ خانواده نادیده می‌گیرند",
                    Slug = "early-signs-alzheimer-elderly",
                    Content = "آلزایمر شایع‌ترین دمانس در سنین میانسالی و سالمندی است که با وجود اینکه در ۶۰ تا ۸۰ درصد موارد پیشرفت تدریجی دارد، اما زودهنگام تشخیص آن می‌تواند سرعت تخریب عصبی را تا ۴۰٪ کند کند. طبق جدیدترین گزارش انجمن آلزایمر آمریکا ۲۰۲۳، ۴۲ میلیون نفر در سراسر جهان با دمانس زندگی می‌کنند و این رقم تا سال ۲۰۵۰ به ۱۵۲ میلیون نفر خواهد رسید. در ایران حدود ۱.۲ میلیون نفر مبتلا به دمانس تشخیص داده شده‌اند که از این میان ۶۷٪ آلزایمر هستند. شناخت علائم اولیه می‌تواند از پیشرفت و هزینه‌های سنگین درمان جلوگیری کند.",
                    ShortAnswer = "شایع‌ترین علائم اولیه آلزایمر شامل فراموشی مکرر اطلاعات تازه، سردرگمی در زمان و مکان، تغییرات خلقی و رفتاری، کاهش قضاوت، انزواگری اجتماعی، تکرار پرسش‌ها، پخش شدن وسایل شخصی، مشکل در تکمیل فعالیت‌های روزمره و تغییر در سلیقه پوشیدن غذاهاست.",
                    Excerpt = "شناخت این ۱۰ نشانه هشدار اولیه آلزایمر می‌تواند منجر به تشخیص زودهنگام در فاز خفیف و کاهش ۴۰٪ سرعت پیشرفت بیماری با درمان مناسب شود. خانواده باید چه چیزهایی را جدی بگیرند؟",
                    EstimatedReadingTimeMinutes = 12,
                    FeaturedImageUrl = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop",
                    TwitterImageUrl = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop",
                    MetaTitle = "۱۰ علائم اولیه آلزایمر سالمندی | سالمندیار",
                    MetaDescription = "علائم هشدار اولیه آلزایمر در مراحل خفیف؛ فراموشی، سردرگمی، تغییرات خلقی — راهکار تشخیص زودهنگام و درمان توسط متخصص مغز و اعصاب.",
                    PrimaryKeyword = "علائم اولیه آلزایمر در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "فراموشی سالمند آلزایمر", "تشخیص زودهنگام آلزایمر", "آزمون روان‌شناختی آلزایمر", "تفاوت آلزایمر با فراموشی سنی", "نقشه مغزی آلزایمر" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/articles/early-signs-alzheimer-elderly",
                    Status = ArticleStatus.Published,
                    Version = 1,
                    PublishedAt = UtcDate(2025, 12, 5),
                    LastUpdatedAt = UtcDate(2025, 12, 5),
                    AuthorId = medicalReviewer?.Id ?? 1,
                    CategoryId = chronicCat.Id,
                    DiseaseId = alzheimer.Id,
                    ViewCount = 4213,
                    IsMedicalContent = true,
                    IsFactChecked = true,
                    IsFeatured = true,
                    AllowComments = true,
                    CreatedAt = UtcDate(2025, 12, 1)
                },
                new()
                {
                    Title = "مراقبت از بیمار سکته مغزی در منزل؛ ۷ گام توانبخشی سریع",
                    Slug = "stroke-home-care-recovery",
                    Content = "ترکیب درمان دقیق و توانبخشی زودهنگام برای بیمار سکته مغزی باعث می‌شود ۷۰ درصد افراد در عرض ۶ ماه به فعالیت‌های عادی خود بازگردند. این هفت گام شامل کنترل دقیق داروهای ضد انعقاد، برنامه تمرین فیزیوتراپی روزانه، نظارت بر تغذیه و مدیریت ریسک خفگی، پایش علائم حیاتی، تحریک شناختی، حمایت روانی و برنامه‌های معاینات منظم پیگیری است. در این مقاله به تفصیل هر مرحله را با دستورالعمل‌های علمی بررسی می‌کنیم.",
                    ShortAnswer = "مراقبت از بیمار سکته در خانه با چرخش بدن هر ۲ ساعت، تمرینات پسیو حرکتی ۴ بار در روز، تزریق منظم داروهای ضد لخته، تغذیه با ضخیم‌کننده مایعات در صورت دیسفاژی، و ویزیت ماهانه متخصص مغز انجام می‌پذیرد.",
                    Excerpt = "۷ اصل کلیدی توانبخشی موفق بعد از سکته در خانه؛ از مدیریت داروهای ضد لخته تا برنامه تمرین فیزیوتراپی روزانه و روانشناسی خانواده.",
                    EstimatedReadingTimeMinutes = 15,
                    FeaturedImageUrl = "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&auto=format&fit=crop",
                    TwitterImageUrl = "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1200&auto=format&fit=crop",
                    MetaTitle = "مراقبت از بیمار سکته مغزی در منزل | ۷ گام توانبخشی",
                    MetaDescription = "راهنمای اثبات‌شده برای مراقبت و توانبخشی سریع بیمار سکته شده در منزل؛ دارو، فیزیوتراپی، تغذیه معاینات منظم به همراه پرستار سالمندیار.",
                    PrimaryKeyword = "مراقبت از بیمار سکته در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "توانبخشی سکته مغزی", "فیزیوتراپی سکته در منزل", "تزریق داروی ضد لخته", "خفگی بعد از سکته", "زندگی بعد از سکته مغزی" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/articles/stroke-home-care-recovery",
                    Status = ArticleStatus.Published,
                    Version = 1,
                    PublishedAt = UtcDate(2025, 12, 10),
                    LastUpdatedAt = UtcDate(2025, 12, 12),
                    AuthorId = nurseAuthor?.Id ?? 2,
                    CategoryId = nursingCat.Id,
                    DiseaseId = stroke.Id,
                    ViewCount = 3987,
                    IsMedicalContent = true,
                    IsFactChecked = true,
                    IsFeatured = true,
                    CreatedAt = UtcDate(2025, 12, 6)
                },
                new()
                {
                    Title = "برنامه غذایی دیابتی سالمند ۱۴۰۴؛ ۱۰۰ ایده وعده بدون افزایش قند",
                    Slug = "diabetes-meal-plan-elderly-1404",
                    Content = "رژیم غذایی سالمند دیابتی با تفاوت‌های جالبی نسبت به جمعیت عمومی همراه است. کاهش احساس تشنگی و تشنگی، کاهش قدرت بویایی و چشایی، کمبود دندان، مشکلات گوارشی و تداخل داروها همه در انتخاب غذاها مؤثر هستند. در این مقاله از شاخص گلیسمیک پایین (GI<۵۵)، تأمین کافی پروتئین ۱ تا ۱.۲ گرم بر کیلوگرم وزن، افزایش فیبر رژیمی ۳۰ گرم در روز و مکمل‌های ویتامینی مهم برای سالمند دیابتی صحبت خواهیم کرد.",
                    ShortAnswer = "برنامه غذایی ایده‌آل سالمند دیابتی شامل صبحانه پرپروتئین با تخم‌مرغ، نان سنگک، پنیر کم‌چرب؛ میان وعده آجیل؛ ناهار با کباب و سبزیجات بخارپز؛ میان وعده بعدازظهر سیب؛ شام با ماهی یا مرغ بخار و سالاد است.",
                    Excerpt = "جدیدترین رژیم غذایی سالمندیار برای دیابت ۱۴۰۴ با تأکید بر پروتئین بالا، فیبر زیاد و GI پایین؛ ۱۰۰ ایده وعده متنوع برای ۴ هفته کامل.",
                    EstimatedReadingTimeMinutes = 10,
                    FeaturedImageUrl = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop",
                    MetaTitle = "رژیم غذایی دیابت سالمند ۱۴۰۴ | برنامه ۴ هفته‌ای",
                    MetaDescription = "جدیدترین دستورالعمل تغذیه دیابت برای سالمند بالای ۶۵؛ برنامه ۴ هفته‌ای ۱۰۰ وعده، جدول GI غذاها و مکمل‌های ضروری برای کنترل قند خون.",
                    PrimaryKeyword = "رژیم غذایی دیابت سالمند",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "شاخص گلیسمیک پایین غذاها", "مکمل ویتامین دیابت", "شکلات برای دیابتی سالمند", "گلایکمیک فود چیست", "کنترل قند خون بدون دارو" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/articles/diabetes-meal-plan-elderly-1404",
                    Status = ArticleStatus.Published,
                    Version = 1,
                    PublishedAt = UtcDate(2025, 11, 28),
                    LastUpdatedAt = UtcDate(2025, 12, 1),
                    AuthorId = contentManager?.Id ?? 4,
                    CategoryId = nutritionCat.Id,
                    DiseaseId = diabetes.Id,
                    ViewCount = 5120,
                    IsMedicalContent = true,
                    IsFactChecked = true,
                    CreatedAt = UtcDate(2025, 11, 20)
                },
                new()
                {
                    Title = "پیشگیری از سقوط در سالمندان؛ ۱۲ راهکار ایمن‌سازی منزل",
                    Slug = "fall-prevention-elderly-home-safety",
                    Content = "سقوط در بین سالمندان بالای ۷۵ سال یکی از اصلی‌ترین علل مرگ ناشی از آسیب در سراسر جهان و در ایران است. هر سال ۳۰٪ افراد بالای ۶۵ سال و ۵۰٪ افراد بالای ۸۰ سال حداقل یک بار سقوط را تجربه می‌کنند. ۲۰ تا ۳۰٪ این موارد منجر به آسیب جدی مانند شکستگی لگن، ضربه مغزی یا هماتوم ساب‌درال می‌شود. در این مقاله ۱۲ اصل کلیدی برای ایمن‌سازی منزل را با استناد به دستورالعمل‌های سازمان بهداشت جهانی ارائه می‌دهیم.",
                    ShortAnswer = "کلیدهای پیشگیری از سقوط شامل: دستگیره در سرویس بهداشت، نورپردازی کافی راهروها، برداشتن فرش‌های لغزنده، کفش پاچه مناسب، دوش آب گرم به همراه نیمکت، نردبان دستی کنار تخت و پایش فشار خون هنگام ایستادن Ortostatik است.",
                    Excerpt = "۱۲ اصل اثبات‌شده سازمان جهانی بهداشت برای کاهش ۵۰٪ خطر سقوط در خانه سالمندان؛ از نورپردازی راهروها تا دستگیره‌های حمام.",
                    EstimatedReadingTimeMinutes = 9,
                    FeaturedImageUrl = "https://images.unsplash.com/photo-1559757175-82d2c0b721a6?w=1200&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1559757175-82d2c0b721a6?w=1200&auto=format&fit=crop",
                    MetaTitle = "پیشگیری از سقوط سالمندان | ۱۲ راهکار ایمن‌سازی خانه",
                    MetaDescription = "۱۲ راهکار بهداشت عمومی برای کاهش ۵۰ درصد خطر سقوط در سالمندان؛ ایمن‌سازی حمام، راهرو، تختخواب و پایش بیماری‌های زمینه‌ای مانند فشار خون ارتواستاتیک.",
                    PrimaryKeyword = "پیشگیری از سقوط در سالمندان",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "شکستگی لگن در سالمند", "ایمن‌سازی خانه برای سالمند", "دستگیره حمام", "کفش پاچه سالمند", "ضربه مغزی بعد از سقوط" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/articles/fall-prevention-elderly-home-safety",
                    Status = ArticleStatus.Published,
                    Version = 1,
                    PublishedAt = UtcDate(2025, 12, 1),
                    LastUpdatedAt = UtcDate(2025, 12, 8),
                    AuthorId = physiotherapist?.Id ?? 3,
                    CategoryId = elderlyCareCat.Id,
                    ViewCount = 4532,
                    IsMedicalContent = true,
                    IsFactChecked = true,
                    CreatedAt = UtcDate(2025, 11, 25)
                }
            };
            context.Articles.AddRange(articles);
            await context.SaveChangesAsync();
        }

        var alzheimerArticle = await context.Articles.FirstAsync(a => a.Slug == "early-signs-alzheimer-elderly");
        var strokeArticle = await context.Articles.FirstAsync(a => a.Slug == "stroke-home-care-recovery");
        var diabetesArticle = await context.Articles.FirstAsync(a => a.Slug == "diabetes-meal-plan-elderly-1404");
        var fallArticle = await context.Articles.FirstAsync(a => a.Slug == "fall-prevention-elderly-home-safety");

        var alzheimerTag = await context.ContentTags.FirstAsync(t => t.Slug == "alzheimer");
        var diabetesTag = await context.ContentTags.FirstAsync(t => t.Slug == "diabetes");
        var strokeTag = await context.ContentTags.FirstAsync(t => t.Slug == "stroke");
        var woundTag = await context.ContentTags.FirstAsync(t => t.Slug == "pressure-ulcer");
        var fallTag = await context.ContentTags.FirstAsync(t => t.Slug == "fall-prevention");
        var heartTag = await context.ContentTags.FirstAsync(t => t.Slug == "heart-disease");
        var bpTag = await context.ContentTags.FirstAsync(t => t.Slug == "hypertension");

        // 9. Seed Article Tags (Many to Many)
        if (!context.Set<ArticleTag>().Any())
        {
            var articleTags = new List<ArticleTag>
            {
                new() { ArticleId = alzheimerArticle.Id, ContentTagId = alzheimerTag.Id },
                new() { ArticleId = alzheimerArticle.Id, ContentTagId = heartTag.Id },
                new() { ArticleId = strokeArticle.Id, ContentTagId = strokeTag.Id },
                new() { ArticleId = strokeArticle.Id, ContentTagId = bpTag.Id },
                new() { ArticleId = strokeArticle.Id, ContentTagId = heartTag.Id },
                new() { ArticleId = diabetesArticle.Id, ContentTagId = diabetesTag.Id },
                new() { ArticleId = diabetesArticle.Id, ContentTagId = woundTag.Id },
                new() { ArticleId = fallArticle.Id, ContentTagId = fallTag.Id },
                new() { ArticleId = fallArticle.Id, ContentTagId = bpTag.Id }
            };
            context.Set<ArticleTag>().AddRange(articleTags);
            await context.SaveChangesAsync();
        }

        // 10. Seed Service SEO Profiles
        if (!context.ServiceSeoProfiles.Any() && homeCareService != null)
        {
            var profiles = new List<ServiceSeoProfile>();
            if (homeCareService != null)
            {
                profiles.Add(new ServiceSeoProfile
                {
                    ServiceDefinitionId = homeCareService.Id,
                    Slug = "home-nursing",
                    LongDescription = "خدمات سالمندیار یا پرستار سالمند در منزل شامل مراقبت ۲۴ ساعته از سالمند در خانه شما است. این خدمات توسط پرستار و مراقب باتجربه و دارای مدارک معتبر ارایه می‌شود و شامل کمک در فعالیت‌های روزمره (ADL)، پایش علائم حیاتی، همراهی بیمار، مدیریت دارو، نظارت بر تغذیه و روان سالمند و نظارت بر ایمنی منزل است. تیم سالمندیار با بیش از ۲۰۰ پرستار فعال در تهران، کرج، مشهد، اصفهان، شیراز و شهرهای دیگر آماده ارائه خدمات در ۳ شیفت ساعتی، روزانه، شبانه و شبانه‌روزی است.",
                    HeroImageUrl = "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1600&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1600&auto=format&fit=crop",
                    MetaTitle = "پرستار سالمند در منزل | خدمات سالمندیار ۲۴ ساعته",
                    MetaDescription = "سالمندیار ۲۴ ساعته در منزل؛ پرستار باتجربه و معتبر برای مراقبت شبانه‌روزی سالمند در خانه شما با قیمت شفاف و تضمین کیفیت خدمات.",
                    PrimaryKeyword = "پرستار سالمند در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "سالمندیار شبانه‌روزی در منزل", "هزینه سالمندیار در منزل", "سالمندیار ماهانه", "خدمات مراقبت از سالمند در خانه", "قیمت پرستار روزانه سالمند" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/services/home-nursing",
                    PrimaryCtaText = "درخواست پرستار سالمند همین الان",
                    PrimaryCtaLink = "/portal/home-care/request",
                    StartingPrice = 350000,
                    PriceRangeText = "از ۳۵۰ هزار تومان در شیفت ۸ ساعته",
                    ShowInHomePage = true,
                    IsFeatured = true,
                    DisplayOrder = 1,
                    ViewCount = 6789
                });
            }

            if (woundService != null)
            {
                profiles.Add(new ServiceSeoProfile
                {
                    ServiceDefinitionId = woundService.Id,
                    Slug = "wound-care",
                    LongDescription = "خدمات پانسمان تخصصی زخم در منزل توسط پرستار متخصص زخم سالمندیار انجام می‌پذیرد. این شامل تعویض پانسمان زخم بستر، زخم دیابتیک پا، زخم‌های جراحی، سوختگی‌های درجه یک تا دو، زخم ناشی از شیمی‌درمانی و نوتروپنیک و زخم وریدهای واریسی است. ما از جدیدترین پوشش‌های مدرن (هیدروکلوئید، آلژینات، هیدروژل، فوم، کلاژن) بر اساس مرحله و نوع زخم استفاده می‌کنیم.",
                    HeroImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1600&auto=format&fit=crop",
                    MetaTitle = "پانسمان تخصصی در منزل | خدمات زخم سالمندیار",
                    MetaDescription = "پانسمان زخم بستر، پا دیابتیک و زخم جراحی در منزل به‌وسیله پرستار متخصص زخم سالمندیار با استفاده از جدیدترین پوشش‌های پزشکی.",
                    PrimaryKeyword = "پانسمان در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "پانسمان زخم بستر در منزل", "هزینه پانسمان در منزل", "پرستار پانسمان تهران", "پزشک متخصص زخم", "بهترین پوشش زخم بستر" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/services/wound-care",
                    PrimaryCtaText = "درخواست پانسمان تخصصی",
                    PrimaryCtaLink = "/portal/home-care/request",
                    StartingPrice = 550000,
                    PriceRangeText = "از ۵۵۰ هزار تومان در هر مرتبه پانسمان",
                    ShowInHomePage = true,
                    IsFeatured = true,
                    DisplayOrder = 2,
                    ViewCount = 5234
                });
            }

            if (icuService != null)
            {
                profiles.Add(new ServiceSeoProfile
                {
                    ServiceDefinitionId = icuService.Id,
                    Slug = "icu-home-care",
                    LongDescription = "خدمات پرستار ICU در منزل برای بیماران بستری با نیاز به مراقبت‌های ویژه شامل: بیماران تراکئوستومی، بیماران متصل به ونتیلاتور، بیماران با PEG/نگدست، بیماران GCS پایین، بیماران نارسایی قلبی مرحله انتهایی، بیماران نارسایی تنفسی و ... . تیم ICU سالمندیار شامل پرستاران متخصص ویژه با حداقل ۵ سال سابقه در بخش ICU بیمارستان‌های لیک۱ کشور است و امکان مانیتورینگ کامل و پشتیبانی دستگاه‌های ویژه را در منزل فراهم می‌کند.",
                    HeroImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&auto=format&fit=crop",
                    OgImageUrl = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1600&auto=format&fit=crop",
                    MetaTitle = "ICU در منزل | پرستار ویژه ۲۴ ساعته سالمندیار",
                    MetaDescription = "خدمات ICU و پرستاری ویژه ونتیلاتور، تراکئوستومی و PEG در منزل توسط پرستار متخصص ICU با حداقل ۵ سال تجربه و تجهیزات کامل.",
                    PrimaryKeyword = "ICU در منزل",
                    SecondaryKeywordsJson = JsonSerializer.Serialize(new[]{ "پرستار ICU در منزل", "هزینه ICU در منزل", "ونتیلاتور در منزل", "تراکئوستومی در منزل", "مراقبت از بیمار بستری در خانه" }, jsonOptions),
                    CanonicalUrl = "https://salmandyar.com/services/icu-home-care",
                    PrimaryCtaText = "درخواست پرستار ICU ۲۴ ساعته",
                    PrimaryCtaLink = "/portal/home-care/request",
                    StartingPrice = 5500000,
                    PriceRangeText = "از ۵.۵ میلیون تومان برای هر شبانه‌روی ۲۴ ساعته",
                    ShowInHomePage = true,
                    IsFeatured = true,
                    DisplayOrder = 3,
                    ViewCount = 4521
                });
            }

            if (profiles.Count > 0)
            {
                context.ServiceSeoProfiles.AddRange(profiles);
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
