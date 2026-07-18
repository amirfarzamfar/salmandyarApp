using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
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
                new ServiceDefinition { Title = "تزریقات", Category = ServiceCategory.Nursing, Description = "تزریق عضلانی یا وریدی" },
                new ServiceDefinition { Title = "پانسمان", Category = ServiceCategory.Nursing, Description = "تعویض پانسمان زخم" },
                new ServiceDefinition { Title = "ساکشن", Category = ServiceCategory.Nursing, Description = "ساکشن ترشحات تنفسی" },
                new ServiceDefinition { Title = "ویزیت پزشک عمومی", Category = ServiceCategory.Medical, Description = "معاینه عمومی بیمار" },
                new ServiceDefinition { Title = "فیزیوتراپی", Category = ServiceCategory.Rehabilitation, Description = "تمرینات حرکتی و فیزیوتراپی" },
                new ServiceDefinition { Title = "حمام بیمار", Category = ServiceCategory.PersonalCare, Description = "کمک در استحمام بیمار" },
                new ServiceDefinition { Title = "تعویض سوند", Category = ServiceCategory.Nursing, Description = "تعویض سوند ادراری" }
            };
            context.ServiceDefinitions.AddRange(services);
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
}

public sealed record SeedAdminUserOptions(
    string? Email,
    string? PhoneNumber,
    string? Password,
    string? FirstName,
    string? LastName);
