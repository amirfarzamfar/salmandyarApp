using Microsoft.Extensions.DependencyInjection;
using Salmandyar.Application.Services.Authentication;
using FluentValidation;
using Salmandyar.Application.DTOs.Assignments;

namespace Salmandyar.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        
        // Validators
        services.AddScoped<IValidator<CreateAssignmentDto>, CreateAssignmentDtoValidator>();
        
        return services;
    }
}
