using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Common.Interfaces.Authentication;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Authentication;

public class OtpLoginChallengeStore : IOtpLoginChallengeStore
{
    private readonly ApplicationDbContext _context;

    public OtpLoginChallengeStore(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> HasRecentActiveChallengeAsync(string userId, string channel, DateTime cooldownThresholdUtc)
    {
        return await _context.OtpLoginChallenges.AnyAsync(challenge =>
            challenge.UserId == userId &&
            challenge.DeliveryChannel == channel &&
            challenge.ConsumedAtUtc == null &&
            challenge.ExpiresAtUtc >= cooldownThresholdUtc &&
            challenge.SentAtUtc >= cooldownThresholdUtc);
    }

    public async Task UpsertChallengeAsync(
        string userId,
        string identifier,
        string channel,
        string codeHash,
        int maxAttempts,
        DateTime sentAtUtc,
        DateTime expiresAtUtc)
    {
        var activeChallenges = await _context.OtpLoginChallenges
            .Where(challenge =>
                challenge.UserId == userId &&
                challenge.DeliveryChannel == channel &&
                challenge.ConsumedAtUtc == null &&
                challenge.ExpiresAtUtc >= sentAtUtc)
            .ToListAsync();

        foreach (var challenge in activeChallenges)
        {
            challenge.ConsumedAtUtc = sentAtUtc;
        }

        _context.OtpLoginChallenges.Add(new OtpLoginChallenge
        {
            UserId = userId,
            Identifier = identifier,
            DeliveryChannel = channel,
            CodeHash = codeHash,
            AttemptCount = 0,
            MaxAttempts = maxAttempts,
            CreatedAtUtc = sentAtUtc,
            SentAtUtc = sentAtUtc,
            ExpiresAtUtc = expiresAtUtc
        });

        await _context.SaveChangesAsync();
    }

    public async Task<bool> VerifyChallengeAsync(
        string userId,
        string identifier,
        string channel,
        string codeHash,
        DateTime nowUtc)
    {
        var challenge = await _context.OtpLoginChallenges
            .Where(item =>
                item.UserId == userId &&
                item.Identifier == identifier &&
                item.DeliveryChannel == channel &&
                item.ConsumedAtUtc == null)
            .OrderByDescending(item => item.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (challenge == null)
        {
            return false;
        }

        if (challenge.ExpiresAtUtc < nowUtc || challenge.AttemptCount >= challenge.MaxAttempts)
        {
            challenge.ConsumedAtUtc = nowUtc;
            await _context.SaveChangesAsync();
            return false;
        }

        if (!string.Equals(challenge.CodeHash, codeHash, StringComparison.Ordinal))
        {
            challenge.AttemptCount += 1;
            if (challenge.AttemptCount >= challenge.MaxAttempts)
            {
                challenge.ConsumedAtUtc = nowUtc;
            }

            await _context.SaveChangesAsync();
            return false;
        }

        challenge.AttemptCount += 1;
        challenge.ConsumedAtUtc = nowUtc;
        await _context.SaveChangesAsync();
        return true;
    }
}
