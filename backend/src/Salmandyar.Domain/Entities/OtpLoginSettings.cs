namespace Salmandyar.Domain.Entities;

public class OtpLoginSettings
{
    public int Id { get; set; }

    public bool IsEnabled { get; set; } = false;
    public bool AllowSms { get; set; } = true;
    public bool AllowEmail { get; set; } = true;

    public int CodeLength { get; set; } = 6;
    public int CodeExpiryMinutes { get; set; } = 5;
    public int ResendCooldownSeconds { get; set; } = 60;
    public int MaxVerifyAttempts { get; set; } = 5;
}
