using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.ServiceCatalog.Dtos;

public record ServiceDefinitionDto(
    int Id,
    string Title,
    ServiceCategory Category,
    string Description,
    bool IsActive
);

public record CreateServiceDefinitionDto(
    string Title,
    ServiceCategory Category,
    string Description,
    bool IsActive
);

public record UpdateServiceDefinitionDto(
    string Title,
    ServiceCategory Category,
    string Description,
    bool IsActive
);
