namespace Salmandyar.Application.Services.Authentication.Dtos;

public record RegisterRequest(
    string FirstName,
    string LastName,
    string? Email,
    string PhoneNumber,
    string Password,
    string Role);
