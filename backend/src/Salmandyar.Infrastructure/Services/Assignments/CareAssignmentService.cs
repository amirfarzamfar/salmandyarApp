using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assignments;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.Services.Assignments;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;
using System.Text.Json;

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

    public async Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto dto, string? currentUserId = null)
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
            CreatedBy = currentUserId ?? "System" 
        };

        _context.CareAssignments.Add(assignment);

        _context.AuditLogs.Add(new AuditLog
        {
            UserId = currentUserId,
            Action = "Create",
            EntityName = "CareAssignment",
            EntityId = assignment.Id.ToString(),
            Details = JsonSerializer.Serialize(new { NewValue = assignment })
        });

        await _context.SaveChangesAsync();

        return await MapToDto(assignment);
    }

    public async Task<AssignmentDto> UpdateAssignmentAsync(Guid id, UpdateAssignmentDto dto, string? currentUserId = null)
    {
        var assignment = await _context.CareAssignments.FindAsync(id);
        if (assignment == null) throw new KeyNotFoundException("تخصیص یافت نشد.");

        var oldValue = JsonSerializer.Serialize(new { 
            assignment.PatientId, 
            assignment.CaregiverId, 
            assignment.AssignmentType, 
            assignment.ShiftSlot, 
            assignment.StartDate, 
            assignment.EndDate, 
            assignment.IsPrimaryCaregiver, 
            assignment.Notes 
        });

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

        var newValue = JsonSerializer.Serialize(new { 
            assignment.PatientId, 
            assignment.CaregiverId, 
            assignment.AssignmentType, 
            assignment.ShiftSlot, 
            assignment.StartDate, 
            assignment.EndDate, 
            assignment.IsPrimaryCaregiver, 
            assignment.Notes 
        });

        _context.AuditLogs.Add(new AuditLog
        {
            UserId = currentUserId,
            Action = "Update",
            EntityName = "CareAssignment",
            EntityId = assignment.Id.ToString(),
            Details = JsonSerializer.Serialize(new { OldValue = oldValue, NewValue = newValue })
        });

        await _context.SaveChangesAsync();
        return await MapToDto(assignment);
    }

    public async Task UpdateAssignmentStatusAsync(Guid id, UpdateAssignmentStatusDto dto, string? currentUserId = null)
    {
        var assignment = await _context.CareAssignments.FindAsync(id);
        if (assignment == null) throw new KeyNotFoundException("تخصیص یافت نشد.");

        var oldStatus = assignment.Status;
        assignment.Status = dto.Status;
        assignment.LastModifiedAt = DateTimeOffset.UtcNow;
        
        _context.AuditLogs.Add(new AuditLog
        {
            UserId = currentUserId,
            Action = "UpdateStatus",
            EntityName = "CareAssignment",
            EntityId = assignment.Id.ToString(),
            Details = JsonSerializer.Serialize(new { OldStatus = oldStatus.ToString(), NewStatus = dto.Status.ToString() })
        });

        await _context.SaveChangesAsync();
    }

    public async Task<List<AssignmentDto>> GetCalendarAsync(DateTimeOffset start, DateTimeOffset end, int? patientId = null, string? caregiverId = null, AssignmentStatus? status = null)
    {
        var query = _context.CareAssignments
            .Include(a => a.Patient)
            .Include(a => a.Caregiver)
            .Where(a => a.StartDate < end && (a.EndDate ?? DateTimeOffset.MaxValue) > start);

        if (patientId.HasValue)
            query = query.Where(a => a.PatientId == patientId);

        if (!string.IsNullOrEmpty(caregiverId))
            query = query.Where(a => a.CaregiverId == caregiverId);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

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

    public async Task<PagedResponse<AssignmentDto>> GetAssignmentsPagedAsync(int pageNumber, int pageSize, DateTimeOffset? start, DateTimeOffset? end, string? search, int? patientId = null, string? caregiverId = null, AssignmentStatus? status = null)
    {
        var query = _context.CareAssignments
            .Include(a => a.Patient)
            .Include(a => a.Caregiver)
            .AsQueryable();

        if (start.HasValue)
            query = query.Where(a => (a.EndDate ?? DateTimeOffset.MaxValue) >= start.Value);
            
        if (end.HasValue)
            query = query.Where(a => a.StartDate <= end.Value);

        if (patientId.HasValue)
            query = query.Where(a => a.PatientId == patientId);

        if (!string.IsNullOrEmpty(caregiverId))
            query = query.Where(a => a.CaregiverId == caregiverId);

        if (status.HasValue)
            query = query.Where(a => a.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();
            query = query.Where(a => 
                (a.Patient.FirstName + " " + a.Patient.LastName).Contains(search) ||
                (a.Caregiver.FirstName + " " + a.Caregiver.LastName).Contains(search) ||
                (a.Notes != null && a.Notes.Contains(search)));
        }

        var totalCount = await query.CountAsync();

        var assignments = await query
            .OrderByDescending(a => a.StartDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<AssignmentDto>
        {
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize,
            Items = assignments.Select(a => new AssignmentDto
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
            }).ToList()
        };
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
