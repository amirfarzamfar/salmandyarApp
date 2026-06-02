using Salmandyar.API.Hubs;
using Salmandyar.Application;
using Salmandyar.Infrastructure;
using Salmandyar.Infrastructure.Persistence;
using Salmandyar.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Salmandyar.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

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

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        await context.Database.MigrateAsync();
        
        await DbInitializer.SeedAsync(context, userManager, roleManager);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

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
