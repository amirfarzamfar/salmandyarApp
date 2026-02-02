using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.ReportConfig;
using Salmandyar.Application.Services.ReportConfig.Dtos;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class ReportConfigurationService : IReportConfigurationService
{
    private readonly ApplicationDbContext _context;

    public ReportConfigurationService(ApplicationDbContext context)
    {
        _context = context;
    }

    // Categories
    public async Task<List<ReportCategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _context.ReportCategories
            .AsNoTracking()
            .Include(c => c.Items)
            .ThenInclude(i => i.SubItems)
            .Where(c => !c.IsDeleted)
            .OrderBy(c => c.Order)
            .ToListAsync();

        return categories.Select(MapCategoryToDto).ToList();
    }

    public async Task<ReportCategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _context.ReportCategories
            .Include(c => c.Items)
            .ThenInclude(i => i.SubItems)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        return category == null ? null : MapCategoryToDto(category);
    }

    public async Task<ReportCategoryDto> CreateCategoryAsync(CreateReportCategoryDto dto)
    {
        try 
        {
            var category = new ReportCategory
            {
                Title = dto.Title,
                Order = dto.Order,
                IsActive = dto.IsActive,
                Items = new List<ReportItem>()
            };

            _context.ReportCategories.Add(category);
            await _context.SaveChangesAsync();

            return MapCategoryToDto(category);
        }
        catch (Exception ex)
        {
            // Log the exception details here if you have a logger
            Console.WriteLine($"Error in CreateCategoryAsync: {ex.Message}");
            throw;
        }
    }

    public async Task<ReportCategoryDto?> UpdateCategoryAsync(int id, UpdateReportCategoryDto dto)
    {
        var category = await _context.ReportCategories.FindAsync(id);
        if (category == null || category.IsDeleted) return null;

        category.Title = dto.Title;
        category.Order = dto.Order;
        category.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return MapCategoryToDto(category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _context.ReportCategories.FindAsync(id);
        if (category == null || category.IsDeleted) return false;

        category.IsDeleted = true;
        // Also soft delete items? Maybe not necessary for now, but good practice.
        // For simplicity, we just mark category as deleted.
        
        await _context.SaveChangesAsync();
        return true;
    }

    // Items
    public async Task<ReportItemDto?> GetItemByIdAsync(int id)
    {
        var item = await _context.ReportItems
            .Include(i => i.SubItems)
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted);

        return item == null ? null : MapItemToDto(item);
    }

    public async Task<ReportItemDto> CreateItemAsync(CreateReportItemDto dto)
    {
        var item = new ReportItem
        {
            CategoryId = dto.CategoryId,
            Title = dto.Title,
            DefaultValue = dto.DefaultValue,
            ParentId = dto.ParentId,
            Order = dto.Order,
            IsActive = true
        };

        _context.ReportItems.Add(item);
        await _context.SaveChangesAsync();

        return MapItemToDto(item);
    }

    public async Task<ReportItemDto?> UpdateItemAsync(int id, UpdateReportItemDto dto)
    {
        var item = await _context.ReportItems.FindAsync(id);
        if (item == null || item.IsDeleted) return null;

        item.Title = dto.Title;
        item.DefaultValue = dto.DefaultValue;
        item.Order = dto.Order;
        item.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return MapItemToDto(item);
    }

    public async Task<bool> DeleteItemAsync(int id)
    {
        var item = await _context.ReportItems.FindAsync(id);
        if (item == null || item.IsDeleted) return false;

        item.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    // Mappers
    private static ReportCategoryDto MapCategoryToDto(ReportCategory c)
    {
        var items = c.Items ?? new List<ReportItem>();
        return new ReportCategoryDto(
            c.Id,
            c.Title,
            c.Order,
            c.IsActive,
            items.Where(i => i.ParentId == null && !i.IsDeleted)
                   .OrderBy(i => i.Order)
                   .Select(MapItemToDto)
                   .ToList()
        );
    }

    private static ReportItemDto MapItemToDto(ReportItem i)
    {
        var subItems = i.SubItems ?? new List<ReportItem>();
        // Map only one level of sub-items to avoid accidental deep recursion/cycles
        var subItemDtos = subItems.Where(s => !s.IsDeleted)
                                  .OrderBy(s => s.Order)
                                  .Select(s => new ReportItemDto(
                                      s.Id,
                                      s.CategoryId,
                                      s.Title,
                                      s.DefaultValue,
                                      s.ParentId,
                                      s.Order,
                                      s.IsActive,
                                      new List<ReportItemDto>() // do not recurse further
                                  ))
                                  .ToList();

        return new ReportItemDto(
            i.Id,
            i.CategoryId,
            i.Title,
            i.DefaultValue,
            i.ParentId,
            i.Order,
            i.IsActive,
            subItemDtos
        );
    }
}
