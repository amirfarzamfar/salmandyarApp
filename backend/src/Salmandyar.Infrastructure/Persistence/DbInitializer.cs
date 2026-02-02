using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
    {
        // Seed Roles
        var roles = new[] { "Admin", "SuperAdmin", "Manager", "Supervisor", "Nurse", "AssistantNurse", "Physiotherapist", "ElderlyCareAssistant", "Elderly", "Patient", "PatientFamily" };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        // Seed Admin User
        var adminEmail = "admin@salmandyar.com";
        var adminPhone = "09120000000";
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);
        if (adminUser == null)
        {
            adminUser = new User
            {
                UserName = adminPhone,
                Email = adminEmail,
                FirstName = "مدیر",
                LastName = "سیستم",
                PhoneNumber = adminPhone,
                EmailConfirmed = true,
                IsActive = true
            };
            await userManager.CreateAsync(adminUser, "Admin123!");
        }

        // Ensure roles are assigned
        if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
            await userManager.AddToRoleAsync(adminUser, "Admin");
        if (!await userManager.IsInRoleAsync(adminUser, "SuperAdmin"))
            await userManager.AddToRoleAsync(adminUser, "SuperAdmin");

        // Seed Nurse
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
                DateOfBirth = new DateTime(1951, 3, 21),
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

        // Seed Services
        if (!context.ServiceDefinitions.Any())
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
                DateOfBirth = new DateTime(1945, 6, 15),
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
    }
}
