using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.ServiceCatalog;
using Salmandyar.Application.Services.ServiceCatalog.Dtos;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class ServiceCatalogService : IServiceCatalogService
{
    private readonly ApplicationDbContext _context;

    public ServiceCatalogService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceDefinitionDto>> GetAllAsync()
    {
        return await _context.ServiceDefinitions
            .OrderBy(s => s.Title)
            .Select(s => new ServiceDefinitionDto(
                s.Id,
                s.Title,
                s.Category,
                s.Description,
                s.IsActive
            ))
            .ToListAsync();
    }

    public async Task<ServiceDefinitionDto?> GetByIdAsync(int id)
    {
        var s = await _context.ServiceDefinitions.FindAsync(id);
        if (s == null) return null;

        return new ServiceDefinitionDto(
            s.Id,
            s.Title,
            s.Category,
            s.Description,
            s.IsActive
        );
    }

    public async Task CreateAsync(CreateServiceDefinitionDto dto)
    {
        var entity = new ServiceDefinition
        {
            Title = dto.Title,
            Category = dto.Category,
            Description = dto.Description,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.ServiceDefinitions.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(int id, UpdateServiceDefinitionDto dto)
    {
        var entity = await _context.ServiceDefinitions.FindAsync(id);
        if (entity == null) throw new Exception("Service not found");

        entity.Title = dto.Title;
        entity.Category = dto.Category;
        entity.Description = dto.Description;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        // Soft delete: just deactive
        await ToggleActiveAsync(id);
    }

    public async Task ToggleActiveAsync(int id)
    {
        var entity = await _context.ServiceDefinitions.FindAsync(id);
        if (entity == null) throw new Exception("Service not found");

        entity.IsActive = !entity.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
