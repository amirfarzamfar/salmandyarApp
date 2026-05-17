namespace Salmandyar.Application.Services.Authentication.Dtos;

public record ResetPasswordRequest(string Identifier, string Token, string NewPassword);