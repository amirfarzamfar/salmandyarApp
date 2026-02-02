using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Common.Interfaces.Identity;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<User> _userManager;

    public IdentityService(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(bool Success, string[] Errors)> CreateUserAsync(User user, string password, string role)
    {
        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            return (false, result.Errors.Select(e => e.Description).ToArray());
        }

        var roleResult = await _userManager.AddToRoleAsync(user, role);
        if (!roleResult.Succeeded)
        {
            return (false, roleResult.Errors.Select(e => e.Description).ToArray());
        }

        return (true, Array.Empty<string>());
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email);
    }

    public async Task<User?> GetUserByIdentifierAsync(string identifier)
    {
        // Try by Email
        var user = await _userManager.FindByEmailAsync(identifier);
        if (user != null) return user;

        // Try by Phone
        return await _userManager.Users.FirstOrDefaultAsync(u => u.PhoneNumber == identifier);
    }

    public async Task<bool> CheckPasswordAsync(User user, string password)
    {
        return await _userManager.CheckPasswordAsync(user, password);
    }

    public async Task<IList<string>> GetUserRolesAsync(User user)
    {
        return await _userManager.GetRolesAsync(user);
    }
}
