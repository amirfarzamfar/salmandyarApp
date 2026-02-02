using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Common.Interfaces.Identity;

public interface IIdentityService
{
    Task<(bool Success, string[] Errors)> CreateUserAsync(User user, string password, string role);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByIdentifierAsync(string identifier);
    Task<bool> CheckPasswordAsync(User user, string password);
    Task<IList<string>> GetUserRolesAsync(User user);
}
