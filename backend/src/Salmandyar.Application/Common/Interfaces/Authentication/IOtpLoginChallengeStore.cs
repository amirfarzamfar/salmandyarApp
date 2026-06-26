namespace Salmandyar.Application.Common.Interfaces.Authentication;

public interface IOtpLoginChallengeStore
{
    Task<bool> HasRecentActiveChallengeAsync(string userId, string channel, DateTime cooldownThresholdUtc);
    Task UpsertChallengeAsync(
        string userId,
        string identifier,
        string channel,
        string codeHash,
        int maxAttempts,
        DateTime sentAtUtc,
        DateTime expiresAtUtc);
    Task<bool> VerifyChallengeAsync(
        string userId,
        string identifier,
        string channel,
        string codeHash,
        DateTime nowUtc);
}
