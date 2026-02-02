namespace Salmandyar.Application.Services.ReportConfig.Dtos;

public record ReportCategoryDto(int Id, string Title, int Order, bool IsActive, List<ReportItemDto> Items);

public record CreateReportCategoryDto(string Title, int Order, bool IsActive = true);

public record UpdateReportCategoryDto(string Title, int Order, bool IsActive);
