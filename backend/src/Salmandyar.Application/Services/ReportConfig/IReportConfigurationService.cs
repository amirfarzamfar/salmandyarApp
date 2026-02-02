using Salmandyar.Application.Services.ReportConfig.Dtos;

namespace Salmandyar.Application.Services.ReportConfig;

public interface IReportConfigurationService
{
    // Categories
    Task<List<ReportCategoryDto>> GetAllCategoriesAsync();
    Task<ReportCategoryDto?> GetCategoryByIdAsync(int id);
    Task<ReportCategoryDto> CreateCategoryAsync(CreateReportCategoryDto dto);
    Task<ReportCategoryDto?> UpdateCategoryAsync(int id, UpdateReportCategoryDto dto);
    Task<bool> DeleteCategoryAsync(int id);

    // Items
    Task<ReportItemDto?> GetItemByIdAsync(int id);
    Task<ReportItemDto> CreateItemAsync(CreateReportItemDto dto);
    Task<ReportItemDto?> UpdateItemAsync(int id, UpdateReportItemDto dto);
    Task<bool> DeleteItemAsync(int id);
}
