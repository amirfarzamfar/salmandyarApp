using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class PatientService : IPatientService
{
    private readonly ApplicationDbContext _context;

    public PatientService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PatientListDto>> GetAllPatientsAsync()
    {
        return await _context.CareRecipients
            .Include(p => p.ResponsibleNurse)
            .Select(p => new PatientListDto(
                p.Id,
                p.FirstName,
                p.LastName,
                CalculateAge(p.DateOfBirth),
                p.PrimaryDiagnosis,
                p.CurrentStatus,
                (int)p.CareLevel,
                p.ResponsibleNurse != null ? $"{p.ResponsibleNurse.FirstName} {p.ResponsibleNurse.LastName}" : null
            ))
            .ToListAsync();
    }

    public async Task<PatientDto?> GetPatientByIdAsync(int id)
    {
        var p = await _context.CareRecipients
            .Include(p => p.ResponsibleNurse)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return null;

        return new PatientDto(
            p.Id,
            p.FirstName,
            p.LastName,
            p.DateOfBirth,
            p.PrimaryDiagnosis,
            p.CurrentStatus,
            (int)p.CareLevel,
            p.ResponsibleNurseId,
            p.ResponsibleNurse != null ? $"{p.ResponsibleNurse.FirstName} {p.ResponsibleNurse.LastName}" : null,
            p.MedicalHistory,
            p.Needs,
            p.Address
        );
    }

    public async Task<List<VitalSignDto>> GetVitalSignsAsync(int patientId)
    {
        return await _context.VitalSigns
            .Where(v => v.CareRecipientId == patientId)
            .Include(v => v.Recorder)
            .OrderByDescending(v => v.MeasuredAt)
            .Select(v => new VitalSignDto(
                v.Id,
                v.RecordedAt,
                v.MeasuredAt,
                v.IsLateEntry,
                v.DelayReason,
                v.Note,
                v.Recorder != null ? $"{v.Recorder.FirstName} {v.Recorder.LastName}" : "Unknown",
                v.SystolicBloodPressure,
                v.DiastolicBloodPressure,
                v.MeanArterialPressure,
                v.PulseRate,
                v.RespiratoryRate,
                v.BodyTemperature,
                v.OxygenSaturation,
                v.GlasgowComaScale
            ))
            .ToListAsync();
    }

    public async Task AddVitalSignAsync(string recorderId, CreateVitalSignDto dto)
    {
        // Calculate MAP
        var map = (double)(dto.SystolicBloodPressure + 2 * dto.DiastolicBloodPressure) / 3;

        // Check for late entry logic (e.g. > 1 hour difference)
        var isLate = false;
        if (DateTime.UtcNow.Subtract(dto.MeasuredAt).TotalMinutes > 60 && string.IsNullOrEmpty(dto.DelayReason))
        {
             isLate = true; // Flag it, even if reason is missing (though frontend should enforce reason)
        }
        else if (DateTime.UtcNow.Subtract(dto.MeasuredAt).TotalMinutes > 60)
        {
            isLate = true;
        }

        var entity = new VitalSign
        {
            CareRecipientId = dto.CareRecipientId,
            RecorderId = recorderId,
            RecordedAt = DateTime.UtcNow,
            MeasuredAt = dto.MeasuredAt,
            IsLateEntry = isLate,
            DelayReason = dto.DelayReason,
            Note = dto.Note,
            SystolicBloodPressure = dto.SystolicBloodPressure,
            DiastolicBloodPressure = dto.DiastolicBloodPressure,
            MeanArterialPressure = Math.Round(map, 1),
            PulseRate = dto.PulseRate,
            RespiratoryRate = dto.RespiratoryRate,
            BodyTemperature = dto.BodyTemperature,
            OxygenSaturation = dto.OxygenSaturation,
            GlasgowComaScale = dto.GlasgowComaScale
        };

        _context.VitalSigns.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task<List<CareServiceDto>> GetCareServicesAsync(int patientId)
    {
        return await _context.CareServices
            .Where(s => s.CareRecipientId == patientId)
            .Include(s => s.Performer)
            .Include(s => s.ServiceDefinition)
            .OrderByDescending(s => s.PerformedAt)
            .Select(s => new CareServiceDto(
                s.Id,
                s.PerformedAt,
                s.Performer != null ? $"{s.Performer.FirstName} {s.Performer.LastName}" : "Unknown",
                s.PerformerId,
                s.ServiceDefinitionId,
                s.ServiceDefinition.Title,
                s.ServiceDefinition.Category,
                s.Status,
                s.StartTime,
                s.EndTime,
                s.Description,
                s.Notes
            ))
            .ToListAsync();
    }

    public async Task AddCareServiceAsync(string performerId, CreateCareServiceDto dto)
    {
        // Use provided PerformerId if available (for Admin override), otherwise use logged-in user
        var finalPerformerId = !string.IsNullOrEmpty(dto.PerformerId) ? dto.PerformerId : performerId;

        // Validation: EndTime > StartTime
        if (dto.StartTime.HasValue && dto.EndTime.HasValue && dto.EndTime < dto.StartTime)
        {
            throw new ArgumentException("End time cannot be before start time");
        }

        // Validation: Overlap check for the same Performer
        if (dto.StartTime.HasValue && dto.EndTime.HasValue)
        {
            var overlap = await _context.CareServices
                .AnyAsync(s => s.PerformerId == finalPerformerId && 
                               s.StartTime.HasValue && s.EndTime.HasValue &&
                               s.StartTime < dto.EndTime && s.EndTime > dto.StartTime);
            
            if (overlap)
            {
                throw new InvalidOperationException("This performer has an overlapping service at this time.");
            }
        }

        var entity = new CareService
        {
            CareRecipientId = dto.CareRecipientId,
            PerformerId = finalPerformerId,
            ServiceDefinitionId = dto.ServiceDefinitionId,
            PerformedAt = dto.PerformedAt,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            Description = dto.Description,
            Notes = dto.Notes,
            Status = CareServiceStatus.Planned,
            CreatedAt = DateTime.UtcNow
        };

        _context.CareServices.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task<int> UpdateCareServiceAsync(int serviceId, UpdateCareServiceDto dto)
    {
        var service = await _context.CareServices.FindAsync(serviceId);
        if (service == null) throw new KeyNotFoundException($"Service with ID {serviceId} not found.");

        // Determine the effective PerformerId (new one if provided, else existing)
        var effectivePerformerId = !string.IsNullOrEmpty(dto.PerformerId) ? dto.PerformerId : service.PerformerId;

        // Validation: EndTime > StartTime
        if (dto.StartTime.HasValue && dto.EndTime.HasValue && dto.EndTime < dto.StartTime)
        {
            throw new ArgumentException("End time cannot be before start time");
        }

        // Validation: Overlap check for the effective Performer (excluding current service)
        if (dto.StartTime.HasValue && dto.EndTime.HasValue)
        {
            var overlap = await _context.CareServices
                .AnyAsync(s => s.PerformerId == effectivePerformerId && 
                               s.Id != serviceId && // Exclude self
                               s.StartTime.HasValue && s.EndTime.HasValue &&
                               s.StartTime < dto.EndTime && s.EndTime > dto.StartTime);
            
            if (overlap)
            {
                throw new InvalidOperationException("This performer has an overlapping service at this time.");
            }
        }

        if (!string.IsNullOrEmpty(dto.PerformerId)) service.PerformerId = dto.PerformerId;
        service.ServiceDefinitionId = dto.ServiceDefinitionId;
        service.PerformedAt = dto.PerformedAt;
        service.StartTime = dto.StartTime;
        service.EndTime = dto.EndTime;
        service.Description = dto.Description;
        service.Notes = dto.Notes;
        service.Status = dto.Status;
        service.UpdatedAt = DateTime.UtcNow;

        _context.CareServices.Update(service);
        await _context.SaveChangesAsync();
        
        return service.CareRecipientId;
    }

    public async Task<int> DeleteCareServiceAsync(int serviceId)
    {
        var service = await _context.CareServices.FindAsync(serviceId);
        if (service == null) throw new KeyNotFoundException($"Service with ID {serviceId} not found.");

        var careRecipientId = service.CareRecipientId;
        _context.CareServices.Remove(service);
        await _context.SaveChangesAsync();
        
        return careRecipientId;
    }

    public async Task<List<NursingReportDto>> GetNursingReportsAsync(int patientId)
    {
        return await _context.NursingReports
            .Where(r => r.CareRecipientId == patientId)
            .Include(r => r.Author)
            .OrderByDescending(r => r.CreatedAt)
            .ThenByDescending(r => r.Id)
            .Select(r => new NursingReportDto(
                r.Id,
                r.CreatedAt,
                r.Author != null ? $"{r.Author.FirstName} {r.Author.LastName}" : "Unknown",
                r.Shift,
                r.Content
            ))
            .ToListAsync();
    }

    public async Task AddNursingReportAsync(string authorId, CreateNursingReportDto dto)
    {
        var entity = new NursingReport
        {
            CareRecipientId = dto.CareRecipientId,
            AuthorId = authorId,
            CreatedAt = DateTime.UtcNow,
            Shift = dto.Shift,
            Content = dto.Content
        };

        _context.NursingReports.Add(entity);
        await _context.SaveChangesAsync();
    }

    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }
}
