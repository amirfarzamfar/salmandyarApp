namespace Salmandyar.Application.Services.Authentication.Dtos;

public class RequestOtpLoginRequest
{
    public string Identifier { get; set; } = string.Empty;
    public string Channel { get; set; } = string.Empty;
}
