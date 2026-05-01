using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assignments;
using Salmandyar.Application.Services.Assignments;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Assignments;

public class CareAssignmentService : ICareAssignmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IValidator<CreateAssignmentDto> _validator;

    public CareAssignmentService(ApplicationDbContext context, IValidator<CreateAssignmentDto> validator)
    {
        _context = context;
        _validator = validator;
    }

    public async Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto dto)
    {
        var validationResult = await _validator.ValidateAsync(dto);
        if (!validationResult.IsValid)
        {
            throw new ValidationException(validationResult.Errors);
        }

        // Ensure StartDate is UTC
        var startDateUtc = dto.StartDate.ToUniversalTime();
        var endDateUtc = dto.EndDate?.ToUniversalTime();

        // 1. Prevent duplicate assignment for the same patient+caregiver in the same time window
        var duplicate = await _context.CareAssignments
            .FirstOrDefaultAsync(a => a.PatientId == dto.PatientId &&
                                      a.CaregiverId == dto.CaregiverId &&
                                      a.Status == AssignmentStatus.Active &&
                                      (endDateUtc == null || a.StartDate < endDateUtc) &&
                                      (a.EndDate == null || a.EndDate > startDateUtc) &&
                                      (
                                          a.AssignmentType != AssignmentType.ShiftBased ||
                                          dto.AssignmentType != AssignmentType.ShiftBased ||
                                          a.ShiftSlot == dto.ShiftSlot
                                      ));

        if (duplicate != null)
        {
            return await MapToDto(duplicate);
        }

        // 2. Active Primary Caregiver Check
        if (dto.IsPrimaryCaregiver)
        {
            var existingPrimaries = await _context.CareAssignments
                .Where(a => a.PatientId == dto.PatientId &&
                            a.CaregiverId != dto.CaregiverId &&
                            a.Status == AssignmentStatus.Active &&
                            a.IsPrimaryCaregiver &&
                            (endDateUtc == null || a.StartDate < endDateUtc) &&
                            (a.EndDate == null || a.EndDate > startDateUtc))
                .ToListAsync();

            foreach (var primary in existingPrimaries)
            {
                primary.IsPrimaryCaregiver = false;
                primary.LastModifiedAt = DateTimeOffset.UtcNow;
            }
        }

        var assignment = new CareAssignment
        {
            Id = Guid.NewGuid(),
            PatientId = dto.PatientId,
            CaregiverId = dto.CaregiverId,
            AssignmentType = dto.AssignmentType,
            ShiftSlot = dto.ShiftSlot,
            StartDate = startDateUtc,
            EndDate = endDateUtc,
            Status = AssignmentStatus.Active,
            IsPrimaryCaregiver = dto.IsPrimaryCaregiver,
            Notes = dto.Notes,
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedBy = "Admin" 
        };

        _context.CareAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return await MapToDto(assignment);
    }

    public async Task<AssignmentDto> UpdateAssignmentAsync(Guid id, UpdateAssignmentDto dto)
    {
        var assignment = await _context.CareAssignments.FindAsync(id);
        if (assignment == null) throw new KeyNotFoundException("تخصیص یافت نشد.");

        // Ensure StartDate is UTC
        var startDateUtc = dto.StartDate.ToUniversalTime();
        var endDateUtc = dto.EndDate?.ToUniversalTime();

        // 1. Prevent duplicate assignment for the same patient+caregiver in the same time window (excluding current)
        var duplicateConflict = await _context.CareAssignments
            .AnyAsync(a => a.Id != id &&
                           a.PatientId == dto.PatientId &&
                           a.CaregiverId == dto.CaregiverId &&
                           a.Status == AssignmentStatus.Active &&
                           (endDateUtc == null || a.StartDate < endDateUtc) &&
                           (a.EndDate == null || a.EndDate > startDateUtc) &&
                           (
                               a.AssignmentType != AssignmentType.ShiftBased ||
                               dto.AssignmentType != AssignmentType.ShiftBased ||
                               a.ShiftSlot == dto.ShiftSlot
                           ));

        if (duplicateConflict)
        {
            throw new InvalidOperationException("این تخصیص قبلاً در این بازه زمانی ثبت شده است.");
        }

        // 2. Active Primary Caregiver Check (Excluding current assignment)
        if (dto.IsPrimaryCaregiver)
        {
            var existingPrimaries = await _context.CareAssignments
                .Where(a => a.Id != id &&
                            a.PatientId == dto.PatientId &&
                            a.CaregiverId != dto.CaregiverId &&
                            a.Status == AssignmentStatus.Active &&
                            a.IsPrimaryCaregiver &&
                            (endDateUtc == null || a.StartDate < endDateUtc) &&
                            (a.EndDate == null || a.EndDate > startDateUtc))
                .ToListAsync();

            foreach (var primary in existingPrimaries)
            {
                primary.IsPrimaryCaregiver = false;
                primary.LastModifiedAt = DateTimeOffset.UtcNow;
            }
        }

        assignment.PatientId = dto.PatientId;
        assignment.CaregiverId = dto.CaregiverId;
        assignment.AssignmentType = dto.AssignmentType;
        assignment.ShiftSlot = dto.ShiftSlot;
        assignment.StartDate = startDateUtc;
        assignment.EndDate = endDateUtc;
        assignment.IsPrimaryCaregiver = dto.IsPrimaryCaregiver;
        assignment.Notes = dto.Notes;
        assignment.LastModifiedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();
        return await MapToDto(assignment);
    }

    public async Task UpdateAssignmentStatusAsync(Guid id, UpdateAssignmentStatusDto dto)
    {
        var assignment = await _context.CareAssignments.FindAsync(id);
        if (assignment == null) throw new KeyNotFoundException("تخصیص یافت نشد.");

        assignment.Status = dto.Status;
        assignment.LastModifiedAt = DateTimeOffset.UtcNow;
        
        await _context.SaveChangesAsync();
    }

    public async Task<List<AssignmentDto>> GetCalendarAsync(DateTimeOffset start, DateTimeOffset end, int? patientId = null, string? caregiverId = null)
    {
        var query = _context.CareAssignments
            .Include(a => a.Patient)
            .Include(a => a.Caregiver)
            .Where(a => a.StartDate < end && (a.EndDate ?? DateTimeOffset.MaxValue) > start);

        if (patientId.HasValue)
            query = query.Where(a => a.PatientId == patientId);

        if (!string.IsNullOrEmpty(caregiverId))
            query = query.Where(a => a.CaregiverId == caregiverId);

        var assignments = await query.ToListAsync();
        
        return assignments.Select(a => new AssignmentDto
        {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = $"{a.Patient.FirstName} {a.Patient.LastName}",
            CaregiverId = a.CaregiverId,
            CaregiverName = $"{a.Caregiver.FirstName} {a.Caregiver.LastName}",
            AssignmentType = a.AssignmentType,
            ShiftSlot = a.ShiftSlot,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            Status = a.Status,
            IsPrimaryCaregiver = a.IsPrimaryCaregiver,
            Notes = a.Notes,
            CreatedAt = a.CreatedAt
        }).ToList();
    }

    private async Task<AssignmentDto> MapToDto(CareAssignment a)
    {
        // Reload to get navigation properties
        await _context.Entry(a).Reference(x => x.Patient).LoadAsync();
        await _context.Entry(a).Reference(x => x.Caregiver).LoadAsync();

        return new AssignmentDto
        {
            Id = a.Id,
            PatientId = a.PatientId,
            PatientName = $"{a.Patient.FirstName} {a.Patient.LastName}",
            CaregiverId = a.CaregiverId,
            CaregiverName = $"{a.Caregiver.FirstName} {a.Caregiver.LastName}",
            AssignmentType = a.AssignmentType,
            ShiftSlot = a.ShiftSlot,
            StartDate = a.StartDate,
            EndDate = a.EndDate,
            Status = a.Status,
            IsPrimaryCaregiver = a.IsPrimaryCaregiver,
            Notes = a.Notes,
            CreatedAt = a.CreatedAt
        };
    }
}
