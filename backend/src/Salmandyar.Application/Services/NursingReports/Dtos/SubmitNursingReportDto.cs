namespace Salmandyar.Application.Services.NursingReports.Dtos;

public record SubmitNursingReportDto(
    int CareRecipientId,
    string Shift,
    string Content, // The generated text
    List<SubmitReportItemDto> Items
);

public record SubmitReportItemDto(
    int ItemId,
    bool IsChecked,
    string Value // The text value for this item
);
