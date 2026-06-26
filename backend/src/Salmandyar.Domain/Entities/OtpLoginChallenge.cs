namespace Salmandyar.Domain.Entities;

public class OtpLoginChallenge
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Identifier { get; set; } = string.Empty;
    public string DeliveryChannel { get; set; } = string.Empty;
    public string CodeHash { get; set; } = string.Empty;
    public int AttemptCount { get; set; }
    public int MaxAttempts { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? ConsumedAtUtc { get; set; }
    public DateTime SentAtUtc { get; set; }
}
