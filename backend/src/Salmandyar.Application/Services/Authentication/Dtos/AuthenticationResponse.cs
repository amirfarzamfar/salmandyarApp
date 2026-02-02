namespace Salmandyar.Application.Services.Authentication.Dtos;

public record AuthenticationResponse(
    string Id,
    string FirstName,
    string LastName,
    string Email,
    string Role,
    string Token
);
