using Salmandyar.Application.Services.Authentication.Dtos;

namespace Salmandyar.Application.Services.Authentication;

public interface IAuthenticationService
{
    Task<AuthenticationResponse> RegisterAsync(RegisterRequest request);
    Task<AuthenticationResponse> LoginAsync(LoginRequest request);
    Task RequestOtpLoginAsync(RequestOtpLoginRequest request);
    Task<AuthenticationResponse> VerifyOtpLoginAsync(VerifyOtpLoginRequest request);
    Task ChangePasswordAsync(ChangePasswordRequest request);
    Task<string> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
}
