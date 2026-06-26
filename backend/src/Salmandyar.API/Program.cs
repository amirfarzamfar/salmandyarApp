using Salmandyar.API.Hubs;
using Salmandyar.Application;
using Salmandyar.Infrastructure;
using Salmandyar.Infrastructure.Persistence;
using Salmandyar.Domain.Entities;
using System.Net;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Salmandyar.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
builder.Services.AddScoped<Salmandyar.Application.Services.Notifications.IRealtimeNotificationDispatcher, SignalRRealtimeNotificationDispatcher>();
builder.Services.AddHealthChecks();
builder.Services.AddProblemDetails();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = PatientProfileDocumentStorage.MaxUploadBytes;
});
builder.Services.AddControllers(options =>
{
    var provider = options.ModelBindingMessageProvider;
    provider.SetValueIsInvalidAccessor(fieldName => $"مقدار وارد شده برای {fieldName} نامعتبر است");
    provider.SetValueMustBeANumberAccessor(fieldName => $"مقدار وارد شده برای {fieldName} باید عدد باشد");
    provider.SetAttemptedValueIsInvalidAccessor((value, fieldName) => $"مقدار '{value}' برای {fieldName} نامعتبر است");
    provider.SetMissingBindRequiredValueAccessor(fieldName => $"فیلد {fieldName} الزامی است");
    provider.SetMissingKeyOrValueAccessor(() => "مقدار الزامی وارد نشده است");
    provider.SetValueMustNotBeNullAccessor(fieldName => $"فیلد {fieldName} نباید خالی باشد");
    provider.SetUnknownValueIsInvalidAccessor(fieldName => $"مقدار وارد شده برای {fieldName} نامعتبر است");
    provider.SetNonPropertyUnknownValueIsInvalidAccessor(() => "مقدار نامعتبر است");
    provider.SetNonPropertyValueMustBeANumberAccessor(() => "مقدار وارد شده باید عدد باشد");
    provider.SetNonPropertyAttemptedValueIsInvalidAccessor(value => $"مقدار '{value}' نامعتبر است");
}).AddDataAnnotationsLocalization();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value is { Errors.Count: > 0 })
            .ToDictionary(
                x => x.Key,
                x => x.Value!.Errors.Select(e => ToPersianModelError(e.ErrorMessage, x.Key)).ToArray());

        return new BadRequestObjectResult(new
        {
            error = "اطلاعات ارسالی نامعتبر است",
            errors
        });
    };
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

const string corsPolicyName = "AllowNextApp";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName,
        policy =>
        {
            var origins = (allowedOrigins is { Length: > 0 }
                ? allowedOrigins
                : builder.Environment.IsDevelopment()
                    ? ["http://localhost:3000", "http://localhost:3001"]
                    : [])
                .Select(origin => origin.Trim().TrimEnd('/'))
                .Where(origin => !string.IsNullOrWhiteSpace(origin))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            if (origins.Length > 0)
            {
                policy.WithOrigins(origins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            }
        });
});

var app = builder.Build();
var logger = app.Services.GetRequiredService<ILogger<Program>>();

var supportedCultures = new[]
{
    new CultureInfo("fa-IR"),
    new CultureInfo("en-US")
};

app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("fa-IR"),
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures
});

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        if (exception != null)
        {
            logger.LogError(exception, "Unhandled exception occurred while processing request {Path}", context.Request.Path);
        }

        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            error = builder.Environment.IsDevelopment() && exception != null
                ? exception.Message
                : "خطای داخلی سرور رخ داده است."
        });
    });
});

await ApplyStartupDatabaseTasksAsync(app, builder.Configuration, builder.Environment, logger);

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseForwardedHeaders();
app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();
app.MapHub<ServiceHub>("/serviceHub").RequireCors(corsPolicyName);
app.MapHub<NotificationHub>("/notificationHub").RequireCors(corsPolicyName);

app.Run();

static string ToPersianModelError(string message, string fieldName)
{
    if (string.IsNullOrWhiteSpace(message)) return "مقدار نامعتبر است";

    if (message.Contains("A non-empty request body is required", StringComparison.OrdinalIgnoreCase))
        return "بدنه درخواست نباید خالی باشد";

    if (message.Contains("The JSON value could not be converted", StringComparison.OrdinalIgnoreCase) ||
        message.Contains("could not be converted", StringComparison.OrdinalIgnoreCase))
        return "نوع یا فرمت مقدار ارسالی صحیح نیست";

    if (message.Contains("is required", StringComparison.OrdinalIgnoreCase))
        return $"فیلد {fieldName} الزامی است";

    if (message.Contains("must be a number", StringComparison.OrdinalIgnoreCase))
        return $"فیلد {fieldName} باید عدد باشد";

    return message;
}

static async Task ApplyStartupDatabaseTasksAsync(
    WebApplication app,
    IConfiguration configuration,
    IHostEnvironment environment,
    ILogger logger)
{
    var applyMigrations = configuration.GetValue("Database:ApplyMigrationsOnStartup", environment.IsDevelopment());
    var seedRoles = configuration.GetValue("Database:SeedRolesOnStartup", environment.IsDevelopment());
    var seedAdminUser = configuration.GetValue("Database:SeedAdminUserOnStartup", environment.IsDevelopment());
    var seedSampleData = configuration.GetValue("Database:SeedSampleDataOnStartup", environment.IsDevelopment());

    if (!applyMigrations && !seedRoles && !seedAdminUser && !seedSampleData)
    {
        logger.LogInformation("Automatic database startup tasks are disabled for environment {EnvironmentName}.", environment.EnvironmentName);
        return;
    }

    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        if (applyMigrations)
        {
            await dbContext.Database.MigrateAsync();
        }

        await DbInitializer.SeedAsync(
            dbContext,
            userManager,
            roleManager,
            seedRoles,
            seedAdminUser,
            seedSampleData,
            new SeedAdminUserOptions(
                configuration["Database:AdminUser:Email"],
                configuration["Database:AdminUser:PhoneNumber"],
                configuration["Database:AdminUser:Password"],
                configuration["Database:AdminUser:FirstName"],
                configuration["Database:AdminUser:LastName"]));
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "An error occurred while applying startup database tasks.");
        throw;
    }
}
