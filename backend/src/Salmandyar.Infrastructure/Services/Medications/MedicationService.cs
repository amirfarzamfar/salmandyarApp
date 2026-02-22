using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Medications;
using Salmandyar.Application.Services.Medications;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Domain.Entities.Medications;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Medications;

public class MedicationService : IMedicationService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public MedicationService(ApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
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
            GracePeriodMinutes = dto.GracePeriodMinutes,
            NotifyPatient = dto.NotifyPatient,
            NotifyNurse = dto.NotifyNurse,
            NotifySupervisor = dto.NotifySupervisor,
            NotifyFamily = dto.NotifyFamily,
            EscalationEnabled = dto.EscalationEnabled,
            CreatedAt = DateTime.UtcNow
        };

        _context.PatientMedications.Add(medication);
        await _context.SaveChangesAsync();

        // Generate doses for the next 7 days
        await GenerateDosesAsync(medication.Id, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));

        return MapToDto(medication);
    }

    public async Task<MedicationDto> UpdateMedicationAsync(int id, UpdateMedicationDto dto)
    {
        var medication = await _context.PatientMedications
            .Include(m => m.Doses)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (medication == null) throw new KeyNotFoundException("Medication not found");

        // Check if schedule changed
        bool scheduleChanged = medication.FrequencyType != dto.FrequencyType ||
                               medication.FrequencyDetail != dto.FrequencyDetail ||
                               medication.StartDate != dto.StartDate;

        // Update fields
        medication.Name = dto.Name;
        medication.Form = dto.Form;
        medication.Dosage = dto.Dosage;
        medication.Route = dto.Route;
        medication.FrequencyType = dto.FrequencyType;
        medication.FrequencyDetail = dto.FrequencyDetail;
        medication.StartDate = dto.StartDate;
        medication.EndDate = dto.EndDate;
        medication.IsPRN = dto.IsPRN;
        medication.HighAlert = dto.HighAlert;
        medication.Criticality = dto.Criticality;
        medication.Instructions = dto.Instructions;
        medication.GracePeriodMinutes = dto.GracePeriodMinutes;
        medication.NotifyPatient = dto.NotifyPatient;
        medication.NotifyNurse = dto.NotifyNurse;
        medication.NotifySupervisor = dto.NotifySupervisor;
        medication.NotifyFamily = dto.NotifyFamily;
        medication.EscalationEnabled = dto.EscalationEnabled;
        medication.UpdatedAt = DateTime.UtcNow;

        if (scheduleChanged)
        {
            // Remove future scheduled doses
            var futureDoses = _context.MedicationDoses
                .Where(d => d.PatientMedicationId == id && 
                            d.Status == DoseStatus.Scheduled && 
                            d.ScheduledTime > DateTime.UtcNow);
            
            _context.MedicationDoses.RemoveRange(futureDoses);
            
            // Regenerate
            await _context.SaveChangesAsync(); // Save updates first
            await GenerateDosesAsync(medication.Id, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));
        }
        else
        {
            await _context.SaveChangesAsync();
        }

        return MapToDto(medication);
    }

    public async Task DeleteMedicationAsync(int id)
    {
        var medication = await _context.PatientMedications
            .Include(m => m.Doses)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (medication == null) throw new KeyNotFoundException("Medication not found");

        // Safety check: Cannot delete if there are taken doses
        bool hasHistory = medication.Doses.Any(d => d.Status != DoseStatus.Scheduled && d.Status != DoseStatus.Cancelled);
        
        if (hasHistory)
        {
            throw new InvalidOperationException("Cannot delete medication with administration history. Please set an End Date instead.");
        }

        _context.PatientMedications.Remove(medication);
        await _context.SaveChangesAsync();
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
        dose.AttachmentPath = dto.AttachmentPath;
        dose.UpdatedAt = DateTime.UtcNow;

        // Create Audit Log
        var auditLog = new Domain.Entities.AuditLog
        {
            UserId = userId,
            Action = $"Medication {dto.Status}",
            EntityName = "MedicationDose",
            EntityId = doseId.ToString(),
            CreatedAt = DateTime.UtcNow,
            Details = $"Status changed to {dto.Status}. Notes: {dto.Notes}. Attachment: {dto.AttachmentPath}"
        };
        _context.AuditLogs.Add(auditLog);

        await _context.SaveChangesAsync();
    }

    public async Task SendRemindersAsync()
    {
        var now = DateTime.UtcNow;
        var upcomingDoses = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
                    .ThenInclude(cr => cr.User)
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
                    .ThenInclude(cr => cr.ResponsibleNurse)
            .Where(d => d.Status == DoseStatus.Scheduled 
                        && !d.IsReminderSent 
                        && d.ScheduledTime > now 
                        && d.ScheduledTime <= now.AddMinutes(15))
            .ToListAsync();

        foreach (var dose in upcomingDoses)
        {
            var med = dose.PatientMedication;
            var message = $"Reminder: Time to take {med.Name} {med.Dosage} ({med.Route}) at {dose.ScheduledTime:HH:mm}.";

            if (med.NotifyPatient && med.CareRecipient.User != null && !string.IsNullOrEmpty(med.CareRecipient.User.Email))
            {
                await _notificationService.SendEmailAsync(med.CareRecipient.User.Email, "Medication Reminder", message);
            }
            
            if (med.NotifyNurse && med.CareRecipient.ResponsibleNurse != null && !string.IsNullOrEmpty(med.CareRecipient.ResponsibleNurse.Email))
            {
                await _notificationService.SendEmailAsync(med.CareRecipient.ResponsibleNurse.Email, "Patient Medication Reminder", 
                    $"Reminder for patient {med.CareRecipient.FirstName} {med.CareRecipient.LastName}: {message}");
            }

            dose.IsReminderSent = true;
        }

        if (upcomingDoses.Any()) await _context.SaveChangesAsync();
    }

    public async Task CheckMissedDosesAndEscalateAsync()
    {
        var now = DateTime.UtcNow;
        
        // Find overdue doses that are still 'Scheduled'
        var overdueDoses = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
                    .ThenInclude(cr => cr.User)
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
                    .ThenInclude(cr => cr.ResponsibleNurse)
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
                    .ThenInclude(cr => cr.FamilyMember)
            .Where(d => d.Status == DoseStatus.Scheduled && d.PatientMedication.EscalationEnabled)
            .ToListAsync();

        foreach (var dose in overdueDoses)
        {
            var med = dose.PatientMedication;
            var graceTime = dose.ScheduledTime.AddMinutes(med.GracePeriodMinutes);

            // Level 1: Nurse (Immediate after grace period)
            if (now > graceTime && dose.EscalationLevel == DoseEscalationLevel.None)
            {
                if (med.NotifyNurse && med.CareRecipient.ResponsibleNurse != null && !string.IsNullOrEmpty(med.CareRecipient.ResponsibleNurse.Email))
                {
                    var msg = $"MISSED DOSE ALERT: Patient {med.CareRecipient.FirstName} {med.CareRecipient.LastName} missed {med.Name} scheduled at {dose.ScheduledTime:HH:mm}.";
                    await _notificationService.SendEmailAsync(med.CareRecipient.ResponsibleNurse.Email, "URGENT: Missed Medication", msg);
                }
                
                dose.EscalationLevel = DoseEscalationLevel.NurseNotified;
                dose.LastEscalationTime = now;
                
                // Log
                _context.AuditLogs.Add(new Domain.Entities.AuditLog 
                { 
                    Action = "Escalation:Nurse", 
                    EntityName = "MedicationDose", 
                    EntityId = dose.Id.ToString(), 
                    UserId = "System", 
                    CreatedAt = now, 
                    Details = "Escalated to Nurse due to missed dose." 
                });
            }
            // Level 2: Supervisor (30 mins after grace)
            else if (now > graceTime.AddMinutes(30) && dose.EscalationLevel == DoseEscalationLevel.NurseNotified)
            {
                if (med.NotifySupervisor)
                {
                    // Placeholder for Supervisor Email
                    await _notificationService.SendEmailAsync("supervisor@hospital.com", "ESCALATION: Missed Medication", 
                        $"Supervisor Alert: Patient {med.CareRecipient.FirstName} missed {med.Name}. Nurse was notified 30 mins ago.");
                }

                dose.EscalationLevel = DoseEscalationLevel.SupervisorNotified;
                dose.LastEscalationTime = now;
                
                _context.AuditLogs.Add(new Domain.Entities.AuditLog 
                { 
                    Action = "Escalation:Supervisor", 
                    EntityName = "MedicationDose", 
                    EntityId = dose.Id.ToString(), 
                    UserId = "System", 
                    CreatedAt = now, 
                    Details = "Escalated to Supervisor." 
                });
            }
            // Level 3: Family (60 mins after grace)
            else if (now > graceTime.AddMinutes(60) && dose.EscalationLevel == DoseEscalationLevel.SupervisorNotified)
            {
                if (med.NotifyFamily && med.CareRecipient.FamilyMember != null && !string.IsNullOrEmpty(med.CareRecipient.FamilyMember.Email))
                {
                     await _notificationService.SendEmailAsync(med.CareRecipient.FamilyMember.Email, "Family Alert: Missed Medication", 
                        $"Alert: {med.CareRecipient.FirstName} has missed their medication {med.Name}. Staff has been alerted.");
                }

                dose.EscalationLevel = DoseEscalationLevel.FamilyNotified;
                dose.LastEscalationTime = now;
                
                _context.AuditLogs.Add(new Domain.Entities.AuditLog 
                { 
                    Action = "Escalation:Family", 
                    EntityName = "MedicationDose", 
                    EntityId = dose.Id.ToString(), 
                    UserId = "System", 
                    CreatedAt = now, 
                    Details = "Escalated to Family." 
                });
            }
        }

        if (overdueDoses.Any()) await _context.SaveChangesAsync();
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
        else if (med.FrequencyType == MedicationFrequencyType.Weekly)
        {
             if (!string.IsNullOrEmpty(med.FrequencyDetail) && med.FrequencyDetail.Contains('|'))
             {
                 var parts = med.FrequencyDetail.Split('|');
                 var daysPart = parts[0];
                 var timesPart = parts.Length > 1 ? parts[1] : "";

                 var days = daysPart.Split(',').Select(d => int.TryParse(d, out int day) ? day : -1).ToList();
                 
                 // Check if current day (fromDate) is in the selected days
                 // DayOfWeek.Sunday is 0, which matches our frontend convention
                 int currentDayOfWeek = (int)fromDate.DayOfWeek;
                 
                 if (days.Contains(currentDayOfWeek))
                 {
                     if (!string.IsNullOrEmpty(timesPart))
                     {
                         var timeParts = timesPart.Split(',');
                         foreach (var p in timeParts)
                         {
                             if (TimeSpan.TryParse(p, out var ts)) times.Add(ts);
                         }
                     }
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
            Instructions = m.Instructions,
            GracePeriodMinutes = m.GracePeriodMinutes,
            NotifyPatient = m.NotifyPatient,
            NotifyNurse = m.NotifyNurse,
            NotifySupervisor = m.NotifySupervisor,
            NotifyFamily = m.NotifyFamily,
            EscalationEnabled = m.EscalationEnabled
        };
    }
}
