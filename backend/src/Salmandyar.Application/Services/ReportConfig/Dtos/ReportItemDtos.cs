namespace Salmandyar.Application.Services.ReportConfig.Dtos;

public record ReportItemDto(int Id, int CategoryId, string Title, string DefaultValue, int? ParentId, int Order, bool IsActive, List<ReportItemDto> SubItems);

public record CreateReportItemDto(int CategoryId, string Title, string DefaultValue, int? ParentId, int Order);

public record UpdateReportItemDto(string Title, string DefaultValue, int Order, bool IsActive);
