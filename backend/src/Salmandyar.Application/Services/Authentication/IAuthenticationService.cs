using Salmandyar.Application.Services.Authentication.Dtos;

namespace Salmandyar.Application.Services.Authentication;

public interface IAuthenticationService
{
    Task<AuthenticationResponse> RegisterAsync(RegisterRequest request);
    Task<AuthenticationResponse> LoginAsync(LoginRequest request);
    Task ChangePasswordAsync(ChangePasswordRequest request);
}
