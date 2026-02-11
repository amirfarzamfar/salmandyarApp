using Salmandyar.Application.Common.Interfaces.Authentication;
using Salmandyar.Application.Common.Interfaces.Identity;
using Salmandyar.Application.Services.Authentication.Dtos;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.Authentication;

public class AuthenticationService : IAuthenticationService
{
    private readonly IIdentityService _identityService;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthenticationService(IIdentityService identityService, IJwtTokenGenerator jwtTokenGenerator)
    {
        _identityService = identityService;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthenticationResponse> RegisterAsync(RegisterRequest request)
    {
        if (!string.IsNullOrEmpty(request.Email))
        {
            var existingUserByEmail = await _identityService.GetUserByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                throw new Exception("کاربری با این ایمیل قبلاً ثبت نام کرده است.");
            }
        }

        var existingUserByPhone = await _identityService.GetUserByIdentifierAsync(request.PhoneNumber);
        if (existingUserByPhone != null)
        {
            throw new Exception("کاربری با این شماره تلفن قبلاً ثبت نام کرده است.");
        }

        var user = new User
        {
            UserName = request.PhoneNumber, // Use phone number as username
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber
        };

        var (success, errors) = await _identityService.CreateUserAsync(user, request.Password, request.Role);
        if (!success)
        {
            throw new Exception($"ثبت‌نام با خطا مواجه شد: {string.Join(", ", errors)}");
        }

        var token = _jwtTokenGenerator.GenerateToken(user, new[] { request.Role });

        return new AuthenticationResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email ?? string.Empty,
            user.PhoneNumber ?? string.Empty,
            request.Role,
            token
        );
    }

    public async Task<AuthenticationResponse> LoginAsync(LoginRequest request)
    {
        var user = await _identityService.GetUserByIdentifierAsync(request.Identifier);
        if (user == null)
        {
            throw new Exception("نام کاربری یا رمز عبور اشتباه است.");
        }

        var isValidPassword = await _identityService.CheckPasswordAsync(user, request.Password);
        if (!isValidPassword)
        {
            throw new Exception("نام کاربری یا رمز عبور اشتباه است.");
        }

        var roles = await _identityService.GetUserRolesAsync(user);
        var token = _jwtTokenGenerator.GenerateToken(user, roles);

        return new AuthenticationResponse(
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            roles.FirstOrDefault() ?? string.Empty,
            token
        );
    }

    public async Task ChangePasswordAsync(ChangePasswordRequest request)
    {
        var user = await _identityService.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            throw new Exception("کاربر یافت نشد.");
        }

        var (success, errors) = await _identityService.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!success)
        {
            throw new Exception($"تغییر رمز عبور با خطا مواجه شد: {string.Join(", ", errors)}");
        }
    }
}
