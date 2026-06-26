namespace Salmandyar.Application.Services.Authentication.Dtos;

public class VerifyOtpLoginRequest
{
    public string Identifier { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}
