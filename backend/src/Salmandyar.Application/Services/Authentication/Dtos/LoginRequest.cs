namespace Salmandyar.Application.Services.Authentication.Dtos;

public record LoginRequest(
    string Identifier,
    string Password);
