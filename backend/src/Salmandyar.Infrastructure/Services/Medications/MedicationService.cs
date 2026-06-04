using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Medications;
using Salmandyar.Application.Services.Medications;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities.Medications;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;
using System.Net.Http.Json;

namespace Salmandyar.Infrastructure.Services.Medications;

public class MedicationService : IMedicationService
{
    private static readonly HttpClient DebugHttpClient = new();
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IUserNotificationService _userNotificationService;
    private readonly IPatientSelfServiceAccessService _patientSelfServiceAccessService;

    public MedicationService(
        ApplicationDbContext context,
        INotificationService notificationService,
        IUserNotificationService userNotificationService,
        IPatientSelfServiceAccessService patientSelfServiceAccessService)
    {
        _context = context;
        _notificationService = notificationService;
        _userNotificationService = userNotificationService;
        _patientSelfServiceAccessService = patientSelfServiceAccessService;
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
            TotalQuantity = dto.TotalQuantity,
            AlertLimit = dto.AlertLimit,
            AlertLowStockPatient = dto.AlertLowStockPatient,
            AlertLowStockNurse = dto.AlertLowStockNurse,
            AlertLowStockFamily = dto.AlertLowStockFamily,
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
        medication.TotalQuantity = dto.TotalQuantity;
        medication.AlertLimit = dto.AlertLimit;
        medication.AlertLowStockPatient = dto.AlertLowStockPatient;
        medication.AlertLowStockNurse = dto.AlertLowStockNurse;
        medication.AlertLowStockFamily = dto.AlertLowStockFamily;
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
        var dose = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
            .ThenInclude(m => m.CareRecipient)
            .ThenInclude(cr => cr.User)
            .Include(d => d.PatientMedication)
            .ThenInclude(m => m.CareRecipient)
            .ThenInclude(cr => cr.ResponsibleNurse)
            .Include(d => d.PatientMedication)
            .ThenInclude(m => m.CareRecipient)
            .ThenInclude(cr => cr.FamilyMember)
            .FirstOrDefaultAsync(d => d.Id == doseId);
            
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
            userId,
            dose.PatientMedication.CareRecipientId,
            PatientSelfServiceFeatures.MedicationKardex);

        dose.Status = dto.Status;
        dose.TakenAt = dto.TakenAt;
        dose.TakenByUserId = userId;
        dose.Notes = dto.Notes;
        dose.MissedReason = dto.MissedReason;
        dose.SideEffectSeverity = dto.SideEffectSeverity;
        dose.SideEffectDescription = dto.SideEffectDescription;
        dose.AttachmentPath = dto.AttachmentPath;
        dose.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == DoseStatus.Taken)
        {
            var med = dose.PatientMedication;
            med.TotalQuantity = Math.Max(0, med.TotalQuantity - 1);

            if (med.AlertLimit > 0 && med.TotalQuantity == med.AlertLimit)
            {
                var cr = med.CareRecipient;
                var message = $"هشدار: موجودی داروی {med.Name} رو به اتمام است. موجودی فعلی: {med.TotalQuantity}";

                if (med.AlertLowStockPatient && cr.User != null)
                {
                    if (!string.IsNullOrEmpty(cr.User.PhoneNumber))
                        await _notificationService.SendSmsAsync(cr.User.PhoneNumber, message);
                    if (!string.IsNullOrEmpty(cr.User.Email))
                        await _notificationService.SendEmailAsync(cr.User.Email, "Low Medication Stock", message);
                    await _userNotificationService.CreateNotificationAsync(cr.UserId, "هشدار اتمام دارو", message, NotificationType.Alert, severity: "Warning");
                }

                if (med.AlertLowStockNurse && cr.ResponsibleNurse != null && cr.ResponsibleNurseId != null)
                {
                    if (!string.IsNullOrEmpty(cr.ResponsibleNurse.PhoneNumber))
                        await _notificationService.SendSmsAsync(cr.ResponsibleNurse.PhoneNumber, message);
                    if (!string.IsNullOrEmpty(cr.ResponsibleNurse.Email))
                        await _notificationService.SendEmailAsync(cr.ResponsibleNurse.Email, "Low Medication Stock", message);
                    await _userNotificationService.CreateNotificationAsync(cr.ResponsibleNurseId, "هشدار اتمام دارو", message, NotificationType.Alert, severity: "Warning");
                }

                if (med.AlertLowStockFamily && cr.FamilyMember != null && cr.FamilyMemberId != null)
                {
                    if (!string.IsNullOrEmpty(cr.FamilyMember.PhoneNumber))
                        await _notificationService.SendSmsAsync(cr.FamilyMember.PhoneNumber, message);
                    if (!string.IsNullOrEmpty(cr.FamilyMember.Email))
                        await _notificationService.SendEmailAsync(cr.FamilyMember.Email, "Low Medication Stock", message);
                    await _userNotificationService.CreateNotificationAsync(cr.FamilyMemberId, "هشدار اتمام دارو", message, NotificationType.Alert, severity: "Warning");
                }
            }
        }

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

            try
            {
                if (med.NotifyPatient && med.CareRecipient.User != null && !string.IsNullOrEmpty(med.CareRecipient.User.Email))
                {
                    await _notificationService.SendEmailAsync(med.CareRecipient.User.Email, "Medication Reminder", message);
                }
                
                if (med.NotifyNurse && med.CareRecipient.ResponsibleNurse != null && !string.IsNullOrEmpty(med.CareRecipient.ResponsibleNurse.Email))
                {
                    await _notificationService.SendEmailAsync(med.CareRecipient.ResponsibleNurse.Email, "Patient Medication Reminder", 
                        $"Reminder for patient {med.CareRecipient.FirstName} {med.CareRecipient.LastName}: {message}");
                }
            }
            catch
            {
                // Ignore email failure so the background task continues
            }

            dose.IsReminderSent = true;
        }

        if (upcomingDoses.Any()) await _context.SaveChangesAsync();
    }

    public async Task CheckMissedDosesAndEscalateAsync()
    {
        var now = DateTime.UtcNow;

        var staffUserIds = await _context.Users
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u.Id, ur.RoleId })
            .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.Id, r.Name })
            .Where(x => x.Name == Roles.Admin || x.Name == Roles.SuperAdmin || x.Name == Roles.Supervisor || x.Name == Roles.Manager)
            .Select(x => x.Id)
            .Distinct()
            .ToListAsync();
        
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
            .Where(d => d.Status == DoseStatus.Scheduled)
            .ToListAsync();

        // #region debug-point A:overdue-scan
        await DebugReportAsync("A", "CheckMissedDosesAndEscalateAsync:scan", new
        {
            overdueCount = overdueDoses.Count,
            staffUserCount = staffUserIds.Count,
            sampleDoseIds = overdueDoses.Take(10).Select(x => x.Id).ToList()
        });
        // #endregion

        foreach (var dose in overdueDoses)
        {
            var med = dose.PatientMedication;
            var careRecipient = med.CareRecipient;
            var graceTime = dose.ScheduledTime.AddMinutes(med.GracePeriodMinutes);
            List<string> recipientIds = [];
            string title = string.Empty;
            string message = string.Empty;
            string link = string.Empty;
            string severity = string.Empty;

            if (careRecipient != null)
            {
                var assignedPrimaryCaregiverIds = await _context.CareAssignments
                    .Where(a => a.PatientId == careRecipient.Id
                                && a.Status == AssignmentStatus.Active
                                && a.IsPrimaryCaregiver
                                && (!a.EndDate.HasValue || a.EndDate > DateTimeOffset.UtcNow))
                    .Select(a => a.CaregiverId)
                    .Distinct()
                    .ToListAsync();

                var patientName = $"{careRecipient.FirstName} {careRecipient.LastName}".Trim();
                title = "هشدار عدم ثبت مصرف دارو";
                message = $"{patientName}: مصرف {med.Name} ساعت {dose.ScheduledTime:HH:mm} ثبت نشده است.";
                link = $"/dashboard/patients/{careRecipient.Id}?tab=medications&doseId={dose.Id}";
                severity = med.Criticality >= MedicationCriticality.HighAlert ? "Critical" : "Warning";

                recipientIds = new List<string?>
                {
                    careRecipient.UserId,
                    careRecipient.ResponsibleNurseId
                }
                .Concat(assignedPrimaryCaregiverIds)
                .Concat(staffUserIds)
                .Concat(med.NotifyFamily ? [careRecipient.FamilyMemberId] : [])
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x!)
                .Distinct()
                .ToList();

                // #region debug-point E:recipient-resolution
                await DebugReportAsync("E", "CheckMissedDosesAndEscalateAsync:recipient-resolution", new
                {
                    doseId = dose.Id,
                    medicationId = med.Id,
                    medicationName = med.Name,
                    careRecipientId = careRecipient.Id,
                    careRecipientUserId = careRecipient.UserId,
                    responsibleNurseId = careRecipient.ResponsibleNurseId,
                    familyMemberId = careRecipient.FamilyMemberId,
                    med.NotifyNurse,
                    med.NotifySupervisor,
                    med.NotifyFamily,
                    med.EscalationEnabled,
                    recipientIds,
                    severity,
                    link
                });
                // #endregion
            }

            if (now > graceTime && recipientIds.Count > 0)
            {
                var existingRecipientIds = await _context.UserNotifications
                    .Where(n => n.ReferenceId == dose.Id.ToString() && n.Title == title && recipientIds.Contains(n.UserId))
                    .Select(n => n.UserId)
                    .Distinct()
                    .ToListAsync();

                foreach (var recipientId in recipientIds.Except(existingRecipientIds))
                {
                    await _userNotificationService.CreateNotificationAsync(
                        recipientId,
                        title,
                        message,
                        NotificationType.Alert,
                        referenceId: dose.Id.ToString(),
                        link: link,
                        severity: severity);

                    // #region debug-point A:create-dispatched
                    await DebugReportAsync("A", "CheckMissedDosesAndEscalateAsync:create-dispatched", new
                    {
                        doseId = dose.Id,
                        recipientId,
                        title,
                        severity,
                        reason = "missing-recipient-backfill"
                    });
                    // #endregion
                }
            }

            // Level 1: Nurse (Immediate after grace period)
            if (now > graceTime && dose.EscalationLevel == DoseEscalationLevel.None)
            {
                if (med.NotifyNurse && med.CareRecipient.ResponsibleNurse != null && !string.IsNullOrEmpty(med.CareRecipient.ResponsibleNurse.Email))
                {
                    try
                    {
                        var msg = $"MISSED DOSE ALERT: Patient {med.CareRecipient.FirstName} {med.CareRecipient.LastName} missed {med.Name} scheduled at {dose.ScheduledTime:HH:mm}.";
                        await _notificationService.SendEmailAsync(med.CareRecipient.ResponsibleNurse.Email, "URGENT: Missed Medication", msg);
                    }
                    catch { }
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
            else if (med.EscalationEnabled && now > graceTime.AddMinutes(30) && dose.EscalationLevel == DoseEscalationLevel.NurseNotified)
            {
                if (med.NotifySupervisor)
                {
                    try
                    {
                        // Placeholder for Supervisor Email
                        await _notificationService.SendEmailAsync("supervisor@hospital.com", "ESCALATION: Missed Medication", 
                            $"Supervisor Alert: Patient {med.CareRecipient.FirstName} missed {med.Name}. Nurse was notified 30 mins ago.");
                    }
                    catch { }
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
            else if (med.EscalationEnabled && now > graceTime.AddMinutes(60) && dose.EscalationLevel == DoseEscalationLevel.SupervisorNotified)
            {
                if (med.NotifyFamily && med.CareRecipient.FamilyMember != null && !string.IsNullOrEmpty(med.CareRecipient.FamilyMember.Email))
                {
                    try
                    {
                        await _notificationService.SendEmailAsync(med.CareRecipient.FamilyMember.Email, "Family Alert: Missed Medication", 
                            $"Alert: {med.CareRecipient.FirstName} has missed their medication {med.Name}. Staff has been alerted.");
                    }
                    catch { }
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

    // #region debug-point shared:reporter
    private static async Task DebugReportAsync(string hypothesisId, string msg, object data)
    {
        try
        {
            await DebugHttpClient.PostAsJsonAsync("http://127.0.0.1:7777/event", new
            {
                sessionId = "medication-alert-missing",
                runId = "pre-fix",
                hypothesisId,
                location = "MedicationService",
                msg = $"[DEBUG] {msg}",
                data,
                ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            });
        }
        catch
        {
            // Intentionally silent during debugging.
        }
    }
    // #endregion

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
        var tz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");

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
                 
                 // Get local day of week
                 var localFromDate = TimeZoneInfo.ConvertTimeFromUtc(fromDate, tz);
                 int currentDayOfWeek = (int)localFromDate.DayOfWeek;
                 
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
            var localDate = TimeZoneInfo.ConvertTimeFromUtc(fromDate, tz).Date;
            var localScheduledTime = localDate.Add(time);
            var scheduledTime = TimeZoneInfo.ConvertTimeToUtc(localScheduledTime, tz);
            
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
            EscalationEnabled = m.EscalationEnabled,
            TotalQuantity = m.TotalQuantity,
            AlertLimit = m.AlertLimit,
            AlertLowStockPatient = m.AlertLowStockPatient,
            AlertLowStockNurse = m.AlertLowStockNurse,
            AlertLowStockFamily = m.AlertLowStockFamily
        };
    }
}
