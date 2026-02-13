using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Medications;
using Salmandyar.Application.Services.Medications;
using Salmandyar.Domain.Entities.Medications;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Medications;

public class MedicationService : IMedicationService
{
    private readonly ApplicationDbContext _context;

    public MedicationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MedicationDto> AddMedicationAsync(CreateMedicationDto dto)
    {
        var medication = new PatientMedication
        {
            CareRecipientId = dto.CareRecipientId,
            Name = dto.Name,
            Form = dto.Form,
            Dosage = dto.Dosage,
            Route = dto.Route,
            FrequencyType = dto.FrequencyType,
            FrequencyDetail = dto.FrequencyDetail,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsPRN = dto.IsPRN,
            HighAlert = dto.HighAlert,
            Criticality = dto.Criticality,
            Instructions = dto.Instructions,
            CreatedAt = DateTime.UtcNow
        };

        _context.PatientMedications.Add(medication);
        await _context.SaveChangesAsync();

        // Generate doses for the next 7 days
        await GenerateDosesAsync(medication.Id, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));

        return MapToDto(medication);
    }

    public async Task<List<MedicationDto>> GetPatientMedicationsAsync(int patientId)
    {
        var medications = await _context.PatientMedications
            .Where(m => m.CareRecipientId == patientId && (m.EndDate == null || m.EndDate > DateTime.UtcNow))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return medications.Select(MapToDto).ToList();
    }

    public async Task<List<MedicationDoseDto>> GetDailyScheduleAsync(int patientId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = date.Date.AddDays(1).AddTicks(-1);

        // Ensure doses are generated for this day for all active medications
        var activeMedications = await _context.PatientMedications
            .Where(m => m.CareRecipientId == patientId && 
                        m.StartDate <= endOfDay && 
                        (m.EndDate == null || m.EndDate >= startOfDay) &&
                        !m.IsPRN) // PRN doses are created on demand, not scheduled
            .ToListAsync();

        foreach (var med in activeMedications)
        {
            // Simple check: if no doses for this med on this day, generate
            var hasDoses = await _context.MedicationDoses
                .AnyAsync(d => d.PatientMedicationId == med.Id && d.ScheduledTime >= startOfDay && d.ScheduledTime <= endOfDay);
            
            if (!hasDoses)
            {
                await GenerateDosesForMedicationAsync(med, startOfDay, startOfDay); // Generate just for this day
            }
        }

        var doses = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
            .Include(d => d.TakenByUser)
            .Where(d => d.PatientMedication.CareRecipientId == patientId && 
                        d.ScheduledTime >= startOfDay && 
                        d.ScheduledTime <= endOfDay)
            .OrderBy(d => d.ScheduledTime)
            .ToListAsync();

        return doses.Select(d => new MedicationDoseDto
        {
            Id = d.Id,
            MedicationId = d.PatientMedicationId,
            MedicationName = d.PatientMedication.Name,
            Dosage = d.PatientMedication.Dosage,
            Route = d.PatientMedication.Route,
            Instructions = d.PatientMedication.Instructions ?? "",
            ScheduledTime = d.ScheduledTime,
            Status = d.Status,
            TakenAt = d.TakenAt,
            TakenByName = d.TakenByUser != null ? $"{d.TakenByUser.FirstName} {d.TakenByUser.LastName}" : null,
            Notes = d.Notes,
            MissedReason = d.MissedReason,
            SideEffectSeverity = d.SideEffectSeverity,
            SideEffectDescription = d.SideEffectDescription
        }).ToList();
    }

    public async Task RecordDoseAsync(int doseId, RecordDoseDto dto, string userId)
    {
        var dose = await _context.MedicationDoses.FindAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        dose.Status = dto.Status;
        dose.TakenAt = dto.TakenAt;
        dose.TakenByUserId = userId;
        dose.Notes = dto.Notes;
        dose.MissedReason = dto.MissedReason;
        dose.SideEffectSeverity = dto.SideEffectSeverity;
        dose.SideEffectDescription = dto.SideEffectDescription;
        dose.UpdatedAt = DateTime.UtcNow;

        // Create Audit Log
        var auditLog = new Domain.Entities.AuditLog
        {
            UserId = userId,
            Action = $"Medication {dto.Status}",
            EntityName = "MedicationDose",
            EntityId = doseId.ToString(),
            CreatedAt = DateTime.UtcNow,
            Details = $"Status changed to {dto.Status}. Notes: {dto.Notes}"
        };
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();
    }

    public async Task GenerateDosesAsync(int medicationId, DateTime from, DateTime to)
    {
        var medication = await _context.PatientMedications.FindAsync(medicationId);
        if (medication == null) return;
        
        // Loop through days
        for (var day = from.Date; day <= to.Date; day = day.AddDays(1))
        {
             await GenerateDosesForMedicationAsync(medication, day, day);
        }
        
        await _context.SaveChangesAsync();
    }

    private async Task GenerateDosesForMedicationAsync(PatientMedication med, DateTime fromDate, DateTime toDate)
    {
        var times = new List<TimeSpan>();

        if (med.FrequencyType == MedicationFrequencyType.Daily)
        {
             if (!string.IsNullOrEmpty(med.FrequencyDetail))
             {
                 var parts = med.FrequencyDetail.Split(',');
                 foreach (var p in parts)
                 {
                     if (TimeSpan.TryParse(p, out var ts)) times.Add(ts);
                 }
             }
             else 
             {
                 times.Add(new TimeSpan(9, 0, 0));
             }
        }
        else if (med.FrequencyType == MedicationFrequencyType.Interval)
        {
             if (int.TryParse(med.FrequencyDetail, out int hours))
             {
                 for (int i = 0; i < 24; i += hours)
                 {
                     times.Add(new TimeSpan(i, 0, 0));
                 }
             }
        }

        foreach (var time in times)
        {
            var scheduledTime = fromDate.Date.Add(time);
            
            var exists = await _context.MedicationDoses
                .AnyAsync(d => d.PatientMedicationId == med.Id && d.ScheduledTime == scheduledTime);

            if (!exists)
            {
                _context.MedicationDoses.Add(new MedicationDose
                {
                    PatientMedicationId = med.Id,
                    ScheduledTime = scheduledTime,
                    Status = DoseStatus.Scheduled,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
    }

    private static MedicationDto MapToDto(PatientMedication m)
    {
        return new MedicationDto
        {
            Id = m.Id,
            Name = m.Name,
            Form = m.Form,
            Dosage = m.Dosage,
            Route = m.Route,
            FrequencyType = m.FrequencyType,
            FrequencyDetail = m.FrequencyDetail,
            StartDate = m.StartDate,
            EndDate = m.EndDate,
            IsPRN = m.IsPRN,
            HighAlert = m.HighAlert,
            Criticality = m.Criticality,
            Instructions = m.Instructions
        };
    }
}
