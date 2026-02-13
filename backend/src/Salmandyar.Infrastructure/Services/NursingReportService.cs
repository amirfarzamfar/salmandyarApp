using Salmandyar.Application.Services.NursingReports;
using Salmandyar.Application.Services.NursingReports.Dtos;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

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

    public async Task<List<NursingReportDto>> GetReportsByAuthorAsync(string authorId)
    {
        return await _context.NursingReports
            .Include(r => r.CareRecipient)
            .Where(r => r.AuthorId == authorId)
            .OrderByDescending(r => r.CreatedAt)
            .ThenByDescending(r => r.Id)
            .Select(r => new NursingReportDto
            {
                Id = r.Id,
                CareRecipientId = r.CareRecipientId,
                PatientName = r.CareRecipient != null ? $"{r.CareRecipient.FirstName} {r.CareRecipient.LastName}" : "ناشناس",
                Shift = r.Shift,
                Content = r.Content,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }
}
