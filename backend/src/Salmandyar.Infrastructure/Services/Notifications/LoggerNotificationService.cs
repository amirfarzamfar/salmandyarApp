using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Notifications;

public class LoggerNotificationService : INotificationService
{
    private readonly ILogger<LoggerNotificationService> _logger;
    private readonly INotificationSettingsService _settingsService;
    private readonly ApplicationDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public LoggerNotificationService(
        ILogger<LoggerNotificationService> logger,
        INotificationSettingsService settingsService,
        ApplicationDbContext context,
        IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _settingsService = settingsService;
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    public async Task SendSmsAsync(string phoneNumber, string message, NotificationSendContext? context = null)
    {
        var settings = await _settingsService.GetSettingsEntityAsync();
        var eventConfig = await ResolveEventConfigurationAsync(context?.EventKey);
        var provider = string.IsNullOrWhiteSpace(settings.SmsProvider) ? "LogOnly" : settings.SmsProvider;
        var sendContext = BuildContext(context, eventConfig);

        if (!settings.SmsEnabled)
        {
            await LogAsync(sendContext, NotificationDeliveryChannel.Sms, NotificationDeliveryStatus.Skipped, provider, phoneNumber, null, message, "کانال پیامک غیرفعال است.");
            return;
        }

        if (eventConfig is { IsEnabled: false } || eventConfig is { SendSms: false })
        {
            await LogAsync(sendContext, NotificationDeliveryChannel.Sms, NotificationDeliveryStatus.Skipped, provider, phoneNumber, null, message, "ارسال پیامک برای این رویداد غیرفعال است.");
            return;
        }

        try
        {
            var normalizedProvider = provider.Trim().ToLowerInvariant();
            switch (normalizedProvider)
            {
                case "logonly":
                case "logger":
                    _logger.LogInformation("SMS LOGONLY | Provider={Provider} | To={PhoneNumber} | Message={Message}", provider, phoneNumber, message);
                    break;
                case "kavenegar":
                    await SendKavenegarSmsAsync(settings, phoneNumber, message);
                    break;
                case "smsir":
                case "sms.ir":
                    await SendSmsIrSmsAsync(settings, phoneNumber, message);
                    break;
                case "melipayamak":
                case "meli-payamak":
                case "meli payamak":
                    await SendMelipayamakSmsAsync(settings, phoneNumber, message);
                    break;
                case "ghasedak":
                case "ghasedaksms":
                    await SendGhasedakSmsAsync(settings, phoneNumber, message);
                    break;
                case "twilio":
                    await SendTwilioSmsAsync(settings, phoneNumber, message);
                    break;
                case "generic":
                    await SendGenericSmsAsync(settings, phoneNumber, message);
                    break;
                default:
                    throw new InvalidOperationException($"SMS provider '{settings.SmsProvider}' is not supported.");
            }

            await LogAsync(sendContext, NotificationDeliveryChannel.Sms, NotificationDeliveryStatus.Succeeded, provider, phoneNumber, null, message, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMS delivery failed for {PhoneNumber}", phoneNumber);
            await LogAsync(sendContext, NotificationDeliveryChannel.Sms, NotificationDeliveryStatus.Failed, provider, phoneNumber, null, message, ex.Message);
            throw;
        }
    }

    public async Task SendEmailAsync(string email, string subject, string body, NotificationSendContext? context = null)
    {
        var settings = await _settingsService.GetSettingsEntityAsync();
        var eventConfig = await ResolveEventConfigurationAsync(context?.EventKey);
        var provider = $"{settings.SmtpHost}:{settings.SmtpPort}";
        var sendContext = BuildContext(context, eventConfig);

        if (!settings.EmailEnabled)
        {
            await LogAsync(sendContext, NotificationDeliveryChannel.Email, NotificationDeliveryStatus.Skipped, provider, email, subject, body, "کانال ایمیل غیرفعال است.");
            return;
        }

        if (eventConfig is { IsEnabled: false } || eventConfig is { SendEmail: false })
        {
            await LogAsync(sendContext, NotificationDeliveryChannel.Email, NotificationDeliveryStatus.Skipped, provider, email, subject, body, "ارسال ایمیل برای این رویداد غیرفعال است.");
            return;
        }

        try
        {
            if (string.IsNullOrWhiteSpace(settings.SmtpHost))
            {
                throw new InvalidOperationException("SMTP Host تنظیم نشده است.");
            }

            using var mailMessage = new MailMessage
            {
                Subject = subject,
                Body = body,
                IsBodyHtml = LooksLikeHtml(body),
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8
            };

            mailMessage.To.Add(email);

            var fromAddress = string.IsNullOrWhiteSpace(settings.EmailFromAddress)
                ? settings.SmtpUser
                : settings.EmailFromAddress;

            if (string.IsNullOrWhiteSpace(fromAddress))
            {
                throw new InvalidOperationException("آدرس فرستنده ایمیل تنظیم نشده است.");
            }

            mailMessage.From = string.IsNullOrWhiteSpace(settings.EmailFromName)
                ? new MailAddress(fromAddress)
                : new MailAddress(fromAddress, settings.EmailFromName, Encoding.UTF8);

            if (!string.IsNullOrWhiteSpace(settings.EmailReplyTo))
            {
                mailMessage.ReplyToList.Add(settings.EmailReplyTo);
            }

            using var client = new SmtpClient(settings.SmtpHost, settings.SmtpPort)
            {
                EnableSsl = settings.SmtpUseSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = Math.Max(settings.EmailTimeoutSeconds, 5) * 1000,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(settings.SmtpUser, settings.SmtpPassword)
            };

            await client.SendMailAsync(mailMessage);
            await LogAsync(sendContext, NotificationDeliveryChannel.Email, NotificationDeliveryStatus.Succeeded, provider, email, subject, body, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email delivery failed for {Email}", email);
            await LogAsync(sendContext, NotificationDeliveryChannel.Email, NotificationDeliveryStatus.Failed, provider, email, subject, body, ex.Message);
            throw;
        }
    }

    private async Task SendKavenegarSmsAsync(NotificationSettings settings, string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(settings.SmsApiKey))
        {
            throw new InvalidOperationException("Kavenegar API Key تنظیم نشده است.");
        }

        var sender = string.IsNullOrWhiteSpace(settings.SmsSenderNumber) ? string.Empty : settings.SmsSenderNumber;
        var baseUrl = string.IsNullOrWhiteSpace(settings.SmsBaseUrl)
            ? "https://api.kavenegar.com"
            : settings.SmsBaseUrl.Trim().TrimEnd('/');
        var endpoint = $"{baseUrl}/v1/{settings.SmsApiKey}/sms/send.json?receptor={Uri.EscapeDataString(phoneNumber)}&sender={Uri.EscapeDataString(sender)}&message={Uri.EscapeDataString(message)}";
        var client = _httpClientFactory.CreateClient(nameof(LoggerNotificationService));
        using var response = await client.GetAsync(endpoint);
        await EnsureSuccessAsync(response, "Kavenegar");
    }

    private async Task SendSmsIrSmsAsync(NotificationSettings settings, string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(settings.SmsApiKey))
        {
            throw new InvalidOperationException("SMS.ir API Key تنظیم نشده است.");
        }

        if (string.IsNullOrWhiteSpace(settings.SmsSenderNumber))
        {
            throw new InvalidOperationException("شماره خط ارسال SMS.ir تنظیم نشده است.");
        }

        var baseUrl = string.IsNullOrWhiteSpace(settings.SmsBaseUrl)
            ? "https://api.sms.ir"
            : settings.SmsBaseUrl.Trim().TrimEnd('/');

        var client = _httpClientFactory.CreateClient(nameof(LoggerNotificationService));
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v1/send/bulk")
        {
            Content = JsonContent.Create(new
            {
                lineNumber = settings.SmsSenderNumber,
                messageText = message,
                mobiles = new[] { phoneNumber }
            })
        };

        request.Headers.Add("X-API-KEY", settings.SmsApiKey);

        using var response = await client.SendAsync(request);
        await EnsureSuccessAsync(response, "SMS.ir");
    }

    private async Task SendMelipayamakSmsAsync(NotificationSettings settings, string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(settings.SmsUsername) || string.IsNullOrWhiteSpace(settings.SmsPassword))
        {
            throw new InvalidOperationException("نام کاربری یا رمز عبور ملی‌پیامک تنظیم نشده است.");
        }

        if (string.IsNullOrWhiteSpace(settings.SmsSenderNumber))
        {
            throw new InvalidOperationException("شماره خط ارسال ملی‌پیامک تنظیم نشده است.");
        }

        var baseUrl = string.IsNullOrWhiteSpace(settings.SmsBaseUrl)
            ? "https://rest.payamak-panel.com/api"
            : settings.SmsBaseUrl.Trim().TrimEnd('/');

        var client = _httpClientFactory.CreateClient(nameof(LoggerNotificationService));
        using var response = await client.PostAsync(
            $"{baseUrl}/SendSMS/SendSMS",
            JsonContent.Create(new
            {
                username = settings.SmsUsername,
                password = settings.SmsPassword,
                to = phoneNumber,
                from = settings.SmsSenderNumber,
                text = message,
                isFlash = false
            }));

        await EnsureSuccessAsync(response, "Melipayamak");
    }

    private async Task SendGhasedakSmsAsync(NotificationSettings settings, string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(settings.SmsApiKey))
        {
            throw new InvalidOperationException("Ghasedak API Key تنظیم نشده است.");
        }

        var baseUrl = string.IsNullOrWhiteSpace(settings.SmsBaseUrl)
            ? "https://api.ghasedak.me"
            : settings.SmsBaseUrl.Trim().TrimEnd('/');

        var formData = new Dictionary<string, string>
        {
            ["receptor"] = phoneNumber,
            ["message"] = message
        };

        if (!string.IsNullOrWhiteSpace(settings.SmsSenderNumber))
        {
            formData["linenumber"] = settings.SmsSenderNumber;
        }

        var client = _httpClientFactory.CreateClient(nameof(LoggerNotificationService));
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v2/sms/send/simple")
        {
            Content = new FormUrlEncodedContent(formData)
        };

        request.Headers.Add("apikey", settings.SmsApiKey);

        using var response = await client.SendAsync(request);
        await EnsureSuccessAsync(response, "Ghasedak");
    }

    private async Task SendTwilioSmsAsync(NotificationSettings settings, string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(settings.SmsUsername) || string.IsNullOrWhiteSpace(settings.SmsApiSecret))
        {
            throw new InvalidOperationException("Twilio Account SID یا Auth Token تنظیم نشده است.");
        }

        if (string.IsNullOrWhiteSpace(settings.SmsSenderNumber))
        {
            throw new InvalidOperationException("شماره فرستنده Twilio تنظیم نشده است.");
        }

        var baseUrl = string.IsNullOrWhiteSpace(settings.SmsBaseUrl)
            ? "https://api.twilio.com/2010-04-01"
            : settings.SmsBaseUrl.Trim().TrimEnd('/');
        var endpoint = $"{baseUrl}/Accounts/{settings.SmsUsername}/Messages.json";
        var client = _httpClientFactory.CreateClient(nameof(LoggerNotificationService));
        var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{settings.SmsUsername}:{settings.SmsApiSecret}"));
        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["To"] = phoneNumber,
                ["From"] = settings.SmsSenderNumber,
                ["Body"] = message
            })
        };

        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authToken);
        using var response = await client.SendAsync(request);
        await EnsureSuccessAsync(response, "Twilio");
    }

    private async Task SendGenericSmsAsync(NotificationSettings settings, string phoneNumber, string message)
    {
        if (string.IsNullOrWhiteSpace(settings.SmsBaseUrl))
        {
            throw new InvalidOperationException("آدرس API پیامک تنظیم نشده است.");
        }

        var client = _httpClientFactory.CreateClient(nameof(LoggerNotificationService));
        using var request = new HttpRequestMessage(HttpMethod.Post, settings.SmsBaseUrl)
        {
            Content = JsonContent.Create(new
            {
                to = phoneNumber,
                from = settings.SmsSenderNumber,
                message,
                username = settings.SmsUsername,
                sandbox = settings.SmsSandboxMode
            })
        };

        if (!string.IsNullOrWhiteSpace(settings.SmsApiKey))
        {
            request.Headers.Add("X-API-KEY", settings.SmsApiKey);
        }

        if (!string.IsNullOrWhiteSpace(settings.SmsApiSecret))
        {
            request.Headers.Add("X-API-SECRET", settings.SmsApiSecret);
        }

        if (!string.IsNullOrWhiteSpace(settings.SmsUsername) && !string.IsNullOrWhiteSpace(settings.SmsPassword))
        {
            var authToken = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{settings.SmsUsername}:{settings.SmsPassword}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authToken);
        }

        using var response = await client.SendAsync(request);
        await EnsureSuccessAsync(response, "GenericSms");
    }

    private static bool LooksLikeHtml(string body)
    {
        return body.Contains("<html", StringComparison.OrdinalIgnoreCase)
            || body.Contains("<body", StringComparison.OrdinalIgnoreCase)
            || body.Contains(MediaTypeNames.Text.Html, StringComparison.OrdinalIgnoreCase);
    }

    private async Task EnsureSuccessAsync(HttpResponseMessage response, string provider)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var body = await response.Content.ReadAsStringAsync();
        throw new InvalidOperationException($"{provider} response {(int)response.StatusCode}: {body}");
    }

    private async Task<Salmandyar.Application.DTOs.Settings.NotificationEventConfigurationDto?> ResolveEventConfigurationAsync(string? eventKey)
    {
        if (string.IsNullOrWhiteSpace(eventKey) ||
            eventKey.Equals(NotificationEventKeys.Generic, StringComparison.OrdinalIgnoreCase) ||
            eventKey.StartsWith("test_", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return await _settingsService.GetEventConfigurationAsync(eventKey);
    }

    private static NotificationSendContext BuildContext(NotificationSendContext? context, Salmandyar.Application.DTOs.Settings.NotificationEventConfigurationDto? eventConfig)
    {
        return new NotificationSendContext
        {
            EventKey = string.IsNullOrWhiteSpace(context?.EventKey) ? NotificationEventKeys.Generic : context.EventKey,
            EventDisplayName = !string.IsNullOrWhiteSpace(context?.EventDisplayName)
                ? context.EventDisplayName
                : eventConfig?.DisplayName ?? "رویداد اعلان",
            RecipientUserId = context?.RecipientUserId,
            PatientId = context?.PatientId,
            ReferenceId = context?.ReferenceId,
            Severity = context?.Severity,
            Link = context?.Link
        };
    }

    private async Task LogAsync(
        NotificationSendContext context,
        NotificationDeliveryChannel channel,
        NotificationDeliveryStatus status,
        string provider,
        string recipient,
        string? subject,
        string message,
        string? errorMessage)
    {
        _context.NotificationDeliveryLogs.Add(new NotificationDeliveryLog
        {
            CreatedAtUtc = DateTime.UtcNow,
            EventKey = string.IsNullOrWhiteSpace(context.EventKey) ? NotificationEventKeys.Generic : context.EventKey,
            EventDisplayName = string.IsNullOrWhiteSpace(context.EventDisplayName) ? "رویداد اعلان" : context.EventDisplayName,
            Channel = channel,
            Status = status,
            Provider = provider,
            Recipient = recipient,
            RecipientUserId = context.RecipientUserId,
            Subject = subject,
            Message = message,
            ErrorMessage = errorMessage,
            PatientId = context.PatientId,
            ReferenceId = context.ReferenceId,
            Severity = context.Severity,
            Link = context.Link
        });

        await _context.SaveChangesAsync();
    }
}
