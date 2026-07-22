using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.ServiceCatalog.Dtos;

public record ServiceDefinitionDto(
    int Id,
    string Code,
    string Title,
    ServiceCategory Category,
    string Description,
    bool IsActive,
    int? DefaultFormId
);

public record CreateServiceDefinitionDto(
    string Code,
    string Title,
    ServiceCategory Category,
    string Description,
    bool IsActive,
    int? DefaultFormId
);

public record UpdateServiceDefinitionDto(
    string Code,
    string Title,
    ServiceCategory Category,
    string Description,
    bool IsActive,
    int? DefaultFormId
);
