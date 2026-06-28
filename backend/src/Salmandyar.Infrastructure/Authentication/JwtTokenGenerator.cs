using System.IdentityModel.Tokens.Jwt;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Salmandyar.Application.Common.Interfaces.Authentication;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Infrastructure.Authentication;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public JwtTokenGenerator(
        IConfiguration configuration,
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _configuration = configuration;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<string> GenerateTokenAsync(User user, IList<string> roles)
    {
        var jwtSecret = _configuration["JwtSettings:Secret"]
            ?? throw new InvalidOperationException("JwtSettings:Secret is missing.");
        var expiryMinutesRaw = _configuration["JwtSettings:ExpiryMinutes"] ?? "60";
        if (!double.TryParse(expiryMinutesRaw, NumberStyles.Number, CultureInfo.InvariantCulture, out var expiryMinutes))
        {
            expiryMinutes = 60;
        }

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id), // Use standard NameIdentifier
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.GivenName, user.FirstName),
            new(JwtRegisteredClaimNames.FamilyName, user.LastName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        foreach (var permission in await GetEffectivePermissionsAsync(user, roles))
        {
            claims.Add(new Claim(Permissions.ClaimType, permission));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiry = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<List<string>> GetEffectivePermissionsAsync(User user, IEnumerable<string> roles)
    {
        var permissionSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var roleName in roles.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
            {
                continue;
            }

            var claims = await _roleManager.GetClaimsAsync(role);
            foreach (var claim in claims.Where(x => x.Type == Permissions.ClaimType && !string.IsNullOrWhiteSpace(x.Value)))
            {
                permissionSet.Add(claim.Value);
            }
        }

        var userClaims = await _userManager.GetClaimsAsync(user);
        foreach (var claim in userClaims.Where(x => x.Type == Permissions.ClaimType && !string.IsNullOrWhiteSpace(x.Value)))
        {
            permissionSet.Add(claim.Value);
        }

        return permissionSet.OrderBy(x => x).ToList();
    }
}
