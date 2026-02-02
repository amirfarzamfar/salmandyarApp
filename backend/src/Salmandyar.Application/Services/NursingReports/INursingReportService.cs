using Salmandyar.Application.Services.NursingReports.Dtos;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Application.Services.NursingReports;

public interface INursingReportService
{
    Task<NursingReport> CreateReportAsync(string authorId, SubmitNursingReportDto dto);
    // Add other methods if needed (GetReports, etc.)
}
