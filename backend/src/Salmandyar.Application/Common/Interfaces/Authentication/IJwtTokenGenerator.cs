using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Common.Interfaces.Authentication;

public interface IJwtTokenGenerator
{
    Task<string> GenerateTokenAsync(User user, IList<string> roles);
}
