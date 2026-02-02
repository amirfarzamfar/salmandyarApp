using Salmandyar.Application.Services.ServiceCatalog.Dtos;

namespace Salmandyar.Application.Services.ServiceCatalog;

public interface IServiceCatalogService
{
    Task<List<ServiceDefinitionDto>> GetAllAsync();
    Task<ServiceDefinitionDto?> GetByIdAsync(int id);
    Task CreateAsync(CreateServiceDefinitionDto dto);
    Task UpdateAsync(int id, UpdateServiceDefinitionDto dto);
    Task DeleteAsync(int id); // Soft delete or deactive
    Task ToggleActiveAsync(int id);
}
