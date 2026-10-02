using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace Salmandyar.Infrastructure.Services.Contracts;

public interface IContractContentHasher
{
    string ComputeHash(string content, string? salt = null);
    string GenerateContractNumber(int assignmentId);
}

public class ContractContentHasher : IContractContentHasher
{
    private readonly string _globalSalt;

    public ContractContentHasher(IConfiguration configuration)
    {
        _globalSalt = configuration["ContractSigning:GlobalSalt"]
                      ?? "Salmandyar-Contract-Default-Global-Salt-2025-v1";
    }

    public string ComputeHash(string content, string? salt = null)
    {
        var combinedSalt = $"{_globalSalt}|{salt ?? string.Empty}";
        var data = Encoding.UTF8.GetBytes($"{combinedSalt}|{content ?? string.Empty}");
        var hashBytes = SHA256.HashData(data);
        var sb = new StringBuilder(hashBytes.Length * 2);
        foreach (var b in hashBytes)
        {
            sb.Append(b.ToString("x2"));
        }
        return sb.ToString();
    }

    public string GenerateContractNumber(int assignmentId)
    {
        var now = DateTime.UtcNow;
        return $"SAL-CTR-{now:yyyyMM}-{assignmentId:D6}";
    }
}
