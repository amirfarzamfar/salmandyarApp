using System.Text.Json;
using Salmandyar.Application.DTOs.Settings;
using Salmandyar.Domain.Constants;

namespace Salmandyar.Infrastructure.Services.Settings;

internal static class NotificationEventCatalog
{
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = false
    };

    public static List<NotificationEventConfigurationDto> GetDefaults() =>
    [
        new()
        {
            EventKey = NotificationEventKeys.ServiceReminder,
            DisplayName = "یادآوری خدمات",
            Description = "ارسال یادآوری زمان‌بندی‌شده خدمات و سرویس‌ها",
            IsEnabled = true,
            SendInApp = true,
            SendSms = true,
            SendEmail = true,
            InAppTitleTemplate = "یادآوری خدمت",
            InAppBodyTemplate = "{PatientName}: {ServiceTitle} در {ScheduledTime}",
            SmsTemplate = "یادآوری خدمت {ServiceTitle} برای {PatientName} در {ScheduledTime}. {Note}",
            EmailSubjectTemplate = "یادآوری خدمت {ServiceTitle}",
            EmailBodyTemplate = "برای بیمار {PatientName} خدمت {ServiceTitle} در {ScheduledTime} برنامه‌ریزی شده است. {Note}"
        },
        new()
        {
            EventKey = NotificationEventKeys.VitalSignDanger,
            DisplayName = "هشدار علائم حیاتی خطرناک",
            Description = "هشدارهای ناشی از محدوده یا روند خطرناک علائم حیاتی",
            IsEnabled = true,
            SendInApp = true,
            SendSms = false,
            SendEmail = true,
            InAppTitleTemplate = "هشدار علائم حیاتی",
            InAppBodyTemplate = "{PatientName}: {AlertTitles}",
            SmsTemplate = "هشدار علائم حیاتی برای {PatientName}: {AlertTitles}",
            EmailSubjectTemplate = "هشدار علائم حیاتی {PatientName}",
            EmailBodyTemplate = "برای بیمار {PatientName} هشدار علائم حیاتی ثبت شد: {AlertTitles}"
        },
        new()
        {
            EventKey = NotificationEventKeys.MedicationLowStock,
            DisplayName = "هشدار کمبود یا اتمام دارو",
            Description = "هشدار کاهش موجودی یا اتمام موجودی دارو",
            IsEnabled = true,
            SendInApp = true,
            SendSms = true,
            SendEmail = true,
            InAppTitleTemplate = "هشدار موجودی دارو",
            InAppBodyTemplate = "هشدار: موجودی داروی {MedicationName} برای {PatientName} به {CurrentStock} رسیده است.",
            SmsTemplate = "هشدار اتمام دارو: {MedicationName} برای {PatientName} به موجودی {CurrentStock} رسیده است.",
            EmailSubjectTemplate = "هشدار موجودی دارو - {MedicationName}",
            EmailBodyTemplate = "داروی {MedicationName} برای بیمار {PatientName} به موجودی {CurrentStock} رسیده است. آستانه هشدار {AlertThreshold} است."
        },
        new()
        {
            EventKey = NotificationEventKeys.MedicationMissedDose,
            DisplayName = "هشدار عدم ثبت مصرف دارو",
            Description = "هشدارهای ناشی از گذشت زمان مصرف دارو و عدم ثبت",
            IsEnabled = true,
            SendInApp = true,
            SendSms = false,
            SendEmail = true,
            InAppTitleTemplate = "هشدار عدم ثبت مصرف دارو",
            InAppBodyTemplate = "{PatientName}: مصرف {MedicationName} ساعت {ScheduledTime} ثبت نشده است.",
            SmsTemplate = "{PatientName}: مصرف {MedicationName} ساعت {ScheduledTime} ثبت نشده است.",
            EmailSubjectTemplate = "هشدار عدم ثبت مصرف دارو",
            EmailBodyTemplate = "برای بیمار {PatientName} مصرف داروی {MedicationName} در ساعت {ScheduledTime} ثبت نشده است."
        },
        new()
        {
            EventKey = NotificationEventKeys.AssessmentAssigned,
            DisplayName = "تخصیص ارزیابی",
            Description = "اعلان تخصیص آزمون یا ارزیابی جدید",
            IsEnabled = true,
            SendInApp = true,
            SendSms = false,
            SendEmail = false,
            InAppTitleTemplate = "ارزیابی جدید",
            InAppBodyTemplate = "{Message}",
            SmsTemplate = "{Message}",
            EmailSubjectTemplate = "{Title}",
            EmailBodyTemplate = "{Message}"
        },
        new()
        {
            EventKey = NotificationEventKeys.EvaluationAssigned,
            DisplayName = "تخصیص ارزیابی پرسنلی",
            Description = "اعلان تخصیص فرم ارزیابی پرسنلی یا سلامت",
            IsEnabled = true,
            SendInApp = true,
            SendSms = false,
            SendEmail = false,
            InAppTitleTemplate = "ارزیابی جدید",
            InAppBodyTemplate = "{Message}",
            SmsTemplate = "{Message}",
            EmailSubjectTemplate = "{Title}",
            EmailBodyTemplate = "{Message}"
        },
        new()
        {
            EventKey = NotificationEventKeys.OtpLogin,
            DisplayName = "ورود با رمز یکبار مصرف",
            Description = "ارسال OTP ورود",
            IsEnabled = true,
            SendInApp = false,
            SendSms = true,
            SendEmail = true,
            InAppTitleTemplate = string.Empty,
            InAppBodyTemplate = string.Empty,
            SmsTemplate = "{Message}",
            EmailSubjectTemplate = "{Title}",
            EmailBodyTemplate = "{Message}"
        },
        new()
        {
            EventKey = NotificationEventKeys.PasswordReset,
            DisplayName = "بازیابی رمز عبور",
            Description = "ارسال لینک یا کد بازیابی رمز عبور",
            IsEnabled = true,
            SendInApp = false,
            SendSms = true,
            SendEmail = true,
            InAppTitleTemplate = string.Empty,
            InAppBodyTemplate = string.Empty,
            SmsTemplate = "{Message}",
            EmailSubjectTemplate = "{Title}",
            EmailBodyTemplate = "{Message}"
        }
    ];

    public static List<NotificationEventConfigurationDto> Normalize(List<NotificationEventConfigurationDto>? configured)
    {
        var defaults = GetDefaults();
        var configuredByKey = (configured ?? new List<NotificationEventConfigurationDto>())
            .Where(x => !string.IsNullOrWhiteSpace(x.EventKey))
            .GroupBy(x => x.EventKey, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        return defaults.Select(def =>
        {
            if (!configuredByKey.TryGetValue(def.EventKey, out var current))
            {
                return def;
            }

            return new NotificationEventConfigurationDto
            {
                EventKey = def.EventKey,
                DisplayName = current.DisplayName ?? def.DisplayName,
                Description = current.Description ?? def.Description,
                IsEnabled = current.IsEnabled,
                SendInApp = current.SendInApp,
                SendSms = current.SendSms,
                SendEmail = current.SendEmail,
                RecipientRoles = current.RecipientRoles?.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? new List<string>(),
                AdditionalEmails = current.AdditionalEmails?.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? new List<string>(),
                AdditionalPhones = current.AdditionalPhones?.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).ToList() ?? new List<string>(),
                InAppTitleTemplate = string.IsNullOrWhiteSpace(current.InAppTitleTemplate) ? def.InAppTitleTemplate : current.InAppTitleTemplate,
                InAppBodyTemplate = string.IsNullOrWhiteSpace(current.InAppBodyTemplate) ? def.InAppBodyTemplate : current.InAppBodyTemplate,
                SmsTemplate = string.IsNullOrWhiteSpace(current.SmsTemplate) ? def.SmsTemplate : current.SmsTemplate,
                EmailSubjectTemplate = string.IsNullOrWhiteSpace(current.EmailSubjectTemplate) ? def.EmailSubjectTemplate : current.EmailSubjectTemplate,
                EmailBodyTemplate = string.IsNullOrWhiteSpace(current.EmailBodyTemplate) ? def.EmailBodyTemplate : current.EmailBodyTemplate
            };
        }).ToList();
    }
}
