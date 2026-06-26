namespace Salmandyar.Application.DTOs.Settings;

public class OtpLoginSettingsDto
{
    public bool IsEnabled { get; set; }
    public bool AllowSms { get; set; }
    public bool AllowEmail { get; set; }
    public int CodeLength { get; set; }
    public int CodeExpiryMinutes { get; set; }
    public int ResendCooldownSeconds { get; set; }
    public int MaxVerifyAttempts { get; set; }
}

public class UpdateOtpLoginSettingsDto
{
    public bool IsEnabled { get; set; }
    public bool AllowSms { get; set; }
    public bool AllowEmail { get; set; }
    public int CodeLength { get; set; }
    public int CodeExpiryMinutes { get; set; }
    public int ResendCooldownSeconds { get; set; }
    public int MaxVerifyAttempts { get; set; }
}
