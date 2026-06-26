using System.IdentityModel.Tokens.Jwt;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Salmandyar.Application.Common.Interfaces.Authentication;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Infrastructure.Authentication;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user, IList<string> roles)
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
}
