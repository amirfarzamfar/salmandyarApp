using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Salmandyar.Application.Common.Interfaces;
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
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, IHostEnvironment environment)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
        }

        if (!environment.IsDevelopment() && connectionString.Contains("REPLACE_ME", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Production connection string must be provided via secure configuration.");
        }

        var jwtSecret = configuration["JwtSettings:Secret"];
        if (string.IsNullOrWhiteSpace(jwtSecret))
        {
            throw new InvalidOperationException("JwtSettings:Secret is not configured.");
        }

        if (jwtSecret.Length < 32)
        {
            throw new InvalidOperationException("JwtSettings:Secret must be at least 32 characters long.");
        }

        if (!environment.IsDevelopment() && jwtSecret.Contains("REPLACE_WITH_ENV_SECRET", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Production JWT secret must be provided via secure configuration.");
        }

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddIdentity<User, IdentityRole>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.User.RequireUniqueEmail = false;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
        })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders()
            .AddErrorDescriber<PersianIdentityErrorDescriber>();

        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IOtpLoginChallengeStore, OtpLoginChallengeStore>();
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<Salmandyar.Application.Services.PatientSelfServiceAccess.IPatientSelfServiceAccessService, PatientSelfServiceAccessService>();
        services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
        services.AddScoped<Salmandyar.Application.Services.ReportConfig.IReportConfigurationService, Salmandyar.Infrastructure.Services.ReportConfigurationService>();
        services.AddScoped<Salmandyar.Application.Services.NursingReports.INursingReportService, Salmandyar.Infrastructure.Services.NursingReportService>();
        
        // User Management
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IAuditLogService, AuditLogService>();

        // Settings
        services.AddScoped<INotificationSettingsService, NotificationSettingsService>();
        services.AddScoped<IOtpLoginSettingsService, OtpLoginSettingsService>();
        services.AddScoped<IMedicationAlertSettingsService, MedicationAlertSettingsService>();

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
        services.AddScoped<IPatientProfileService, PatientProfileService>();

        // Notifications
        services.AddScoped<INotificationService, LoggerNotificationService>();
        services.AddScoped<IRealtimeNotificationDispatcher, NoopRealtimeNotificationDispatcher>();
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
                ClockSkew = TimeSpan.FromMinutes(2),
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtSecret))
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrWhiteSpace(accessToken) &&
                        (path.StartsWithSegments("/notificationHub") ||
                         path.StartsWithSegments("/serviceHub")))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }
}
