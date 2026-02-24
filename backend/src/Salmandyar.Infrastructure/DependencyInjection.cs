using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Salmandyar.Application.Common.Interfaces.Authentication;
using Salmandyar.Application.Common.Interfaces.Identity;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Domain.Entities;
using Salmandyar.Application.Services.ServiceCatalog;
using Salmandyar.Infrastructure.Services;
using Salmandyar.Infrastructure.Identity;
using Salmandyar.Infrastructure.Authentication;
using Salmandyar.Infrastructure.Services.Notifications;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Infrastructure.Persistence;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Infrastructure.Services.Settings;
using Salmandyar.Application.Services.Assignments;
using Salmandyar.Infrastructure.Services.Assignments;
using Salmandyar.Application.Services.Users;
using Salmandyar.Infrastructure.Services.Users;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Infrastructure.Services.Assessments;
using Salmandyar.Application.Services.UserEvaluations;
using Salmandyar.Infrastructure.Services.UserEvaluations;
using Salmandyar.Application.Services.Medications;
using Salmandyar.Infrastructure.Services.Medications;

namespace Salmandyar.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddIdentity<User, IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders()
            .AddErrorDescriber<PersianIdentityErrorDescriber>();

        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
        services.AddScoped<Salmandyar.Application.Services.ReportConfig.IReportConfigurationService, Salmandyar.Infrastructure.Services.ReportConfigurationService>();
        services.AddScoped<Salmandyar.Application.Services.NursingReports.INursingReportService, Salmandyar.Infrastructure.Services.NursingReportService>();
        
        // User Management
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IAuditLogService, AuditLogService>();

        // Settings
        services.AddScoped<INotificationSettingsService, NotificationSettingsService>();

        // Assignments
        services.AddScoped<ICareAssignmentService, CareAssignmentService>();

        // Assessment Module
        services.AddScoped<IAssessmentService, AssessmentService>();
        services.AddScoped<IMatchingService, MatchingService>();
        services.AddScoped<IAssessmentAssignmentService, AssessmentAssignmentService>();
        services.AddScoped<IAssessmentReportService, AssessmentReportService>();

        // User Evaluation Module
        services.AddScoped<IUserEvaluationService, UserEvaluationService>();
        services.AddScoped<IUserEvaluationAssignmentService, UserEvaluationAssignmentService>();

        // Notifications
        services.AddScoped<INotificationService, LoggerNotificationService>();
        services.AddScoped<IUserNotificationService, UserNotificationService>();

        // Medications
        services.AddScoped<IMedicationService, MedicationService>();

        // Background Services
        services.AddHostedService<Salmandyar.Infrastructure.BackgroundServices.ReminderBackgroundService>();
        services.AddHostedService<Salmandyar.Infrastructure.BackgroundServices.MedicationBackgroundService>();

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = configuration["JwtSettings:Issuer"],
                ValidAudience = configuration["JwtSettings:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(configuration["JwtSettings:Secret"]!))
            };
        });

        return services;
    }
}
