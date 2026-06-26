using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Settings;

public class NotificationSettingsService : INotificationSettingsService
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceProvider _serviceProvider;

    public NotificationSettingsService(ApplicationDbContext context, IServiceProvider serviceProvider)
    {
        _context = context;
        _serviceProvider = serviceProvider;
    }

    public async Task<NotificationSettingsDto> GetSettingsAsync()
    {
        var settings = await GetSettingsEntityAsync();
        return MapToDto(settings);
    }

    public async Task<NotificationSettingsDto> UpdateSettingsAsync(UpdateNotificationSettingsDto dto, string? updatedByUserId = null)
    {
        var settings = await GetSettingsEntityAsync();
        await ValidateUpdateAsync(dto, settings);

        settings.EmailEnabled = dto.EmailEnabled;
        settings.SmtpHost = dto.SmtpHost.Trim();
        settings.SmtpPort = dto.SmtpPort <= 0 ? 587 : dto.SmtpPort;
        settings.SmtpUser = dto.SmtpUser.Trim();
        settings.SmtpUseSsl = dto.SmtpUseSsl;
        settings.EmailFromAddress = dto.EmailFromAddress.Trim();
        settings.EmailFromName = dto.EmailFromName.Trim();
        settings.EmailReplyTo = dto.EmailReplyTo.Trim();
        settings.EmailTimeoutSeconds = Math.Clamp(dto.EmailTimeoutSeconds <= 0 ? 30 : dto.EmailTimeoutSeconds, 5, 300);

        if (dto.ClearSmtpPassword)
        {
            settings.SmtpPassword = string.Empty;
        }
        else if (!string.IsNullOrWhiteSpace(dto.SmtpPassword))
        {
            settings.SmtpPassword = dto.SmtpPassword;
        }

        settings.SmsEnabled = dto.SmsEnabled;
        settings.SmsProvider = NormalizeProvider(dto.SmsProvider);
        settings.SmsBaseUrl = dto.SmsBaseUrl.Trim();
        settings.SmsUsername = dto.SmsUsername.Trim();
        settings.SmsApiKey = dto.SmsApiKey.Trim();
        settings.SmsSenderNumber = dto.SmsSenderNumber.Trim();
        settings.SmsSandboxMode = dto.SmsSandboxMode;

        if (dto.ClearSmsPassword)
        {
            settings.SmsPassword = string.Empty;
        }
        else if (!string.IsNullOrWhiteSpace(dto.SmsPassword))
        {
            settings.SmsPassword = dto.SmsPassword;
        }

        if (dto.ClearSmsApiSecret)
        {
            settings.SmsApiSecret = string.Empty;
        }
        else if (!string.IsNullOrWhiteSpace(dto.SmsApiSecret))
        {
            settings.SmsApiSecret = dto.SmsApiSecret;
        }

        settings.EventConfigurationsJson = JsonSerializer.Serialize(
            NotificationEventCatalog.Normalize(dto.EventConfigurations),
            NotificationEventCatalog.JsonOptions);
        settings.UpdatedAt = DateTime.UtcNow;
        settings.UpdatedByUserId = updatedByUserId;

        await _context.SaveChangesAsync();
        return MapToDto(settings);
    }

    public async Task<NotificationEventConfigurationDto> GetEventConfigurationAsync(string eventKey)
    {
        var settings = await GetSettingsEntityAsync();
        return GetEventConfigurations(settings)
            .First(x => x.EventKey.Equals(eventKey, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<List<NotificationResolvedRecipientDto>> GetRoleRecipientsAsync(string eventKey)
    {
        var config = await GetEventConfigurationAsync(eventKey);
        if (config.RecipientRoles.Count == 0)
        {
            return new List<NotificationResolvedRecipientDto>();
        }

        var selectedRoles = new HashSet<string>(config.RecipientRoles, StringComparer.OrdinalIgnoreCase);

        return await _context.Users
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, ur.RoleId })
            .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.User, RoleName = r.Name! })
            .Where(x => selectedRoles.Contains(x.RoleName))
            .Select(x => new NotificationResolvedRecipientDto
            {
                UserId = x.User.Id,
                DisplayName = $"{x.User.FirstName} {x.User.LastName}".Trim(),
                PhoneNumber = x.User.PhoneNumber,
                Email = x.User.Email
            })
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<NotificationDeliveryLogDto>> GetDeliveryLogsAsync(int take = 200)
    {
        var normalizedTake = Math.Clamp(take, 1, 500);

        return await _context.NotificationDeliveryLogs
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(normalizedTake)
            .Select(x => new NotificationDeliveryLogDto
            {
                Id = x.Id,
                CreatedAtUtc = x.CreatedAtUtc,
                EventKey = x.EventKey,
                EventDisplayName = x.EventDisplayName,
                Channel = x.Channel,
                Status = x.Status,
                Provider = x.Provider,
                Recipient = x.Recipient,
                Subject = x.Subject,
                Message = x.Message,
                ErrorMessage = x.ErrorMessage,
                PatientId = x.PatientId,
                ReferenceId = x.ReferenceId,
                Severity = x.Severity,
                Link = x.Link
            })
            .ToListAsync();
    }

    public Task SendTestEmailAsync(NotificationTestMessageDto dto)
    {
        ValidateTestMessage(dto, requireSubject: true);
        var notificationService = _serviceProvider.GetRequiredService<INotificationService>();
        return notificationService.SendEmailAsync(
            dto.Destination,
            string.IsNullOrWhiteSpace(dto.Subject) ? "Test Email" : dto.Subject,
            dto.Message,
            new NotificationSendContext
            {
                EventKey = "test_email",
                EventDisplayName = "ارسال تست ایمیل"
            });
    }

    public Task SendTestSmsAsync(NotificationTestMessageDto dto)
    {
        ValidateTestMessage(dto, requireSubject: false);
        var notificationService = _serviceProvider.GetRequiredService<INotificationService>();
        return notificationService.SendSmsAsync(
            dto.Destination,
            dto.Message,
            new NotificationSendContext
            {
                EventKey = "test_sms",
                EventDisplayName = "ارسال تست پیامک"
            });
    }

    public async Task<NotificationSettings> GetSettingsEntityAsync()
    {
        var settings = await _context.NotificationSettings.FirstOrDefaultAsync();

        if (settings == null)
        {
            settings = new NotificationSettings
            {
                EventConfigurationsJson = JsonSerializer.Serialize(NotificationEventCatalog.GetDefaults(), NotificationEventCatalog.JsonOptions)
            };
            _context.NotificationSettings.Add(settings);
            await _context.SaveChangesAsync();
        }
        else if (string.IsNullOrWhiteSpace(settings.EventConfigurationsJson))
        {
            settings.EventConfigurationsJson = JsonSerializer.Serialize(NotificationEventCatalog.GetDefaults(), NotificationEventCatalog.JsonOptions);
            settings.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return settings;
    }

    private static List<NotificationEventConfigurationDto> GetEventConfigurations(NotificationSettings settings)
    {
        List<NotificationEventConfigurationDto>? configured = null;
        if (!string.IsNullOrWhiteSpace(settings.EventConfigurationsJson))
        {
            configured = JsonSerializer.Deserialize<List<NotificationEventConfigurationDto>>(settings.EventConfigurationsJson, NotificationEventCatalog.JsonOptions);
        }

        return NotificationEventCatalog.Normalize(configured);
    }

    private static NotificationSettingsDto MapToDto(NotificationSettings settings)
    {
        return new NotificationSettingsDto
        {
            EmailEnabled = settings.EmailEnabled,
            SmtpHost = settings.SmtpHost,
            SmtpPort = settings.SmtpPort,
            SmtpUser = settings.SmtpUser,
            SmtpUseSsl = settings.SmtpUseSsl,
            EmailFromAddress = settings.EmailFromAddress,
            EmailFromName = settings.EmailFromName,
            EmailReplyTo = settings.EmailReplyTo,
            EmailTimeoutSeconds = settings.EmailTimeoutSeconds <= 0 ? 30 : settings.EmailTimeoutSeconds,
            SmtpPasswordConfigured = !string.IsNullOrWhiteSpace(settings.SmtpPassword),
            SmsEnabled = settings.SmsEnabled,
            SmsProvider = settings.SmsProvider,
            SmsBaseUrl = settings.SmsBaseUrl,
            SmsUsername = settings.SmsUsername,
            SmsApiKey = settings.SmsApiKey,
            SmsSenderNumber = settings.SmsSenderNumber,
            SmsSandboxMode = settings.SmsSandboxMode,
            SmsPasswordConfigured = !string.IsNullOrWhiteSpace(settings.SmsPassword),
            SmsApiSecretConfigured = !string.IsNullOrWhiteSpace(settings.SmsApiSecret),
            UpdatedAt = settings.UpdatedAt,
            EventConfigurations = GetEventConfigurations(settings)
        };
    }

    private async Task ValidateUpdateAsync(UpdateNotificationSettingsDto dto, NotificationSettings currentSettings)
    {
        if (dto.SmtpPort is < 0 or > 65535)
        {
            throw new InvalidOperationException("پورت SMTP نامعتبر است.");
        }

        if (dto.EmailTimeoutSeconds != 0 && dto.EmailTimeoutSeconds is < 5 or > 300)
        {
            throw new InvalidOperationException("مهلت زمانی ایمیل باید بین 5 تا 300 ثانیه باشد.");
        }

        if (dto.EmailEnabled)
        {
            if (string.IsNullOrWhiteSpace(dto.SmtpHost))
            {
                throw new InvalidOperationException("برای فعال‌سازی ایمیل، مقدار SMTP Host الزامی است.");
            }

            if (dto.SmtpPort <= 0)
            {
                throw new InvalidOperationException("برای فعال‌سازی ایمیل، پورت SMTP باید معتبر باشد.");
            }

            var effectiveFromAddress = string.IsNullOrWhiteSpace(dto.EmailFromAddress)
                ? dto.SmtpUser
                : dto.EmailFromAddress;

            if (string.IsNullOrWhiteSpace(effectiveFromAddress) || !LooksLikeEmail(effectiveFromAddress))
            {
                throw new InvalidOperationException("برای فعال‌سازی ایمیل، آدرس فرستنده معتبر الزامی است.");
            }

            if (!string.IsNullOrWhiteSpace(dto.EmailReplyTo) && !LooksLikeEmail(dto.EmailReplyTo))
            {
                throw new InvalidOperationException("آدرس Reply-To معتبر نیست.");
            }
        }

        var normalizedProvider = NormalizeProvider(dto.SmsProvider);
        if (dto.SmsEnabled)
        {
            switch (normalizedProvider.ToLowerInvariant())
            {
                case "logonly":
                    break;
                case "kavenegar":
                    if (string.IsNullOrWhiteSpace(dto.SmsApiKey))
                    {
                        throw new InvalidOperationException("برای Kavenegar مقدار API Key الزامی است.");
                    }
                    break;
                case "smsir":
                case "sms.ir":
                    if (string.IsNullOrWhiteSpace(dto.SmsApiKey))
                    {
                        throw new InvalidOperationException("برای SMS.ir مقدار API Key الزامی است.");
                    }

                    if (string.IsNullOrWhiteSpace(dto.SmsSenderNumber))
                    {
                        throw new InvalidOperationException("برای SMS.ir شماره خط ارسال الزامی است.");
                    }
                    break;
                case "melipayamak":
                case "meli-payamak":
                case "meli payamak":
                    if (string.IsNullOrWhiteSpace(dto.SmsUsername))
                    {
                        throw new InvalidOperationException("برای ملی‌پیامک نام کاربری الزامی است.");
                    }

                    if (string.IsNullOrWhiteSpace(dto.SmsPassword) && string.IsNullOrWhiteSpace(currentSettings.SmsPassword) && !dto.ClearSmsPassword)
                    {
                        throw new InvalidOperationException("برای ملی‌پیامک رمز عبور الزامی است.");
                    }

                    if (dto.ClearSmsPassword)
                    {
                        throw new InvalidOperationException("پاک‌کردن رمز عبور در حالی که ملی‌پیامک فعال است مجاز نیست.");
                    }

                    if (string.IsNullOrWhiteSpace(dto.SmsSenderNumber))
                    {
                        throw new InvalidOperationException("برای ملی‌پیامک شماره خط ارسال الزامی است.");
                    }
                    break;
                case "ghasedak":
                case "ghasedaksms":
                    if (string.IsNullOrWhiteSpace(dto.SmsApiKey))
                    {
                        throw new InvalidOperationException("برای قاصدک مقدار API Key الزامی است.");
                    }
                    break;
                case "twilio":
                    if (string.IsNullOrWhiteSpace(dto.SmsUsername))
                    {
                        throw new InvalidOperationException("برای Twilio مقدار Account SID الزامی است.");
                    }

                    if (string.IsNullOrWhiteSpace(dto.SmsApiSecret) && string.IsNullOrWhiteSpace(currentSettings.SmsApiSecret) && !dto.ClearSmsApiSecret)
                    {
                        throw new InvalidOperationException("برای Twilio مقدار Auth Token الزامی است.");
                    }

                    if (dto.ClearSmsApiSecret)
                    {
                        throw new InvalidOperationException("پاک‌کردن Auth Token در حالی که Twilio فعال است مجاز نیست.");
                    }

                    if (string.IsNullOrWhiteSpace(dto.SmsSenderNumber))
                    {
                        throw new InvalidOperationException("برای Twilio شماره فرستنده الزامی است.");
                    }
                    break;
                case "generic":
                    if (string.IsNullOrWhiteSpace(dto.SmsBaseUrl) || !Uri.TryCreate(dto.SmsBaseUrl, UriKind.Absolute, out _))
                    {
                        throw new InvalidOperationException("برای Generic SMS آدرس Base URL معتبر الزامی است.");
                    }
                    break;
                default:
                    throw new InvalidOperationException("Provider پیامک انتخاب‌شده پشتیبانی نمی‌شود.");
            }
        }

        var normalizedEvents = NotificationEventCatalog.Normalize(dto.EventConfigurations);
        var validRoles = await _context.Roles
            .Select(x => x.Name!)
            .ToListAsync();
        var validRoleSet = new HashSet<string>(validRoles, StringComparer.OrdinalIgnoreCase);

        foreach (var eventConfig in normalizedEvents)
        {
            var invalidRoles = eventConfig.RecipientRoles
                .Where(role => !validRoleSet.Contains(role))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (invalidRoles.Count > 0)
            {
                throw new InvalidOperationException($"نقش‌های نامعتبر برای رویداد '{eventConfig.DisplayName}' مشخص شده‌اند: {string.Join(", ", invalidRoles)}");
            }

            var invalidEmails = eventConfig.AdditionalEmails
                .Where(email => !LooksLikeEmail(email))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (invalidEmails.Count > 0)
            {
                throw new InvalidOperationException($"در رویداد '{eventConfig.DisplayName}' یک یا چند ایمیل اضافی نامعتبر است.");
            }
        }
    }

    private static void ValidateTestMessage(NotificationTestMessageDto dto, bool requireSubject)
    {
        if (string.IsNullOrWhiteSpace(dto.Destination))
        {
            throw new InvalidOperationException("مقصد پیام تست الزامی است.");
        }

        if (requireSubject && string.IsNullOrWhiteSpace(dto.Subject))
        {
            throw new InvalidOperationException("موضوع ایمیل تست الزامی است.");
        }

        if (string.IsNullOrWhiteSpace(dto.Message))
        {
            throw new InvalidOperationException("متن پیام تست الزامی است.");
        }
    }

    private static string NormalizeProvider(string? provider)
    {
        return string.IsNullOrWhiteSpace(provider) ? "LogOnly" : provider.Trim();
    }

    private static bool LooksLikeEmail(string value)
    {
        try
        {
            _ = new System.Net.Mail.MailAddress(value);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
