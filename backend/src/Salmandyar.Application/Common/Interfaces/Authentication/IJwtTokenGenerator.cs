using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Common.Interfaces.Authentication;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, IList<string> roles);
}
