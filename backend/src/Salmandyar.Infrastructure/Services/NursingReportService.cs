using Salmandyar.Application.Services.NursingReports;
using Salmandyar.Application.Services.NursingReports.Dtos;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class NursingReportService : INursingReportService
{
    private readonly ApplicationDbContext _context;

    public NursingReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<NursingReport> CreateReportAsync(string authorId, SubmitNursingReportDto dto)
    {
        var report = new NursingReport
        {
            CareRecipientId = dto.CareRecipientId,
            AuthorId = authorId,
            Shift = dto.Shift,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            Details = dto.Items.Select(i => new NursingReportDetail
            {
                ItemId = i.ItemId,
                IsChecked = i.IsChecked,
                Value = i.Value
            }).ToList()
        };

        _context.NursingReports.Add(report);
        await _context.SaveChangesAsync();

        return report;
    }
}
