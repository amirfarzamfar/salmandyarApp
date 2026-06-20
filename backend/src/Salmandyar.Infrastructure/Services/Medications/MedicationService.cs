using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Medications;
using Salmandyar.Application.Services.Medications;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Entities.Medications;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Medications;

public class MedicationService : IMedicationService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IUserNotificationService _userNotificationService;
    private readonly IPatientSelfServiceAccessService _patientSelfServiceAccessService;
    private readonly IMedicationAlertSettingsService _medicationAlertSettingsService;

    public MedicationService(
        ApplicationDbContext context,
        INotificationService notificationService,
        IUserNotificationService userNotificationService,
        IPatientSelfServiceAccessService patientSelfServiceAccessService,
        IMedicationAlertSettingsService medicationAlertSettingsService)
    {
        _context = context;
        _notificationService = notificationService;
        _userNotificationService = userNotificationService;
        _patientSelfServiceAccessService = patientSelfServiceAccessService;
        _medicationAlertSettingsService = medicationAlertSettingsService;
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
            TotalQuantity = Math.Max(0, dto.TotalQuantity),
            AlertLimit = Math.Max(0, dto.AlertLimit),
            DoseQuantity = Math.Max(1, dto.DoseQuantity),
            AlertLowStockInAppEnabled = dto.AlertLowStockInAppEnabled,
            AlertLowStockSmsEnabled = dto.AlertLowStockSmsEnabled,
            AlertLowStockEmailEnabled = dto.AlertLowStockEmailEnabled,
            AlertLowStockPatient = dto.AlertLowStockPatient,
            AlertLowStockNurse = dto.AlertLowStockNurse,
            AlertLowStockFamily = dto.AlertLowStockFamily,
            AlertLowStockAdmin = dto.AlertLowStockAdmin,
            AlertLowStockCustomPhone = string.IsNullOrWhiteSpace(dto.AlertLowStockCustomPhone) ? null : dto.AlertLowStockCustomPhone.Trim(),
            AlertLowStockCustomEmail = string.IsNullOrWhiteSpace(dto.AlertLowStockCustomEmail) ? null : dto.AlertLowStockCustomEmail.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.PatientMedications.Add(medication);
        await _context.SaveChangesAsync();

        await CreateInventoryTransactionAsync(
            medication,
            MedicationInventoryTransactionType.InitialStock,
            medication.TotalQuantity,
            0,
            medication.TotalQuantity,
            "ثبت موجودی اولیه",
            medication.CreatedByUserId);

        await GenerateDosesAsync(medication.Id, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));

        await LoadMedicationRelationsAsync(medication.Id, medication);
        await EvaluateLowStockAlertAsync(medication);
        await _context.SaveChangesAsync();

        return MapToDto(medication);
    }

    public async Task<MedicationDto> UpdateMedicationAsync(int id, UpdateMedicationDto dto)
    {
        var medication = await _context.PatientMedications
            .Include(m => m.Doses)
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.User)
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.ResponsibleNurse)
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.FamilyMember)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (medication == null) throw new KeyNotFoundException("Medication not found");

        var scheduleChanged = medication.FrequencyType != dto.FrequencyType ||
                              medication.FrequencyDetail != dto.FrequencyDetail ||
                              medication.StartDate != dto.StartDate;

        var previousQuantity = medication.TotalQuantity;
        var normalizedQuantity = Math.Max(0, dto.TotalQuantity);

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
        medication.AlertLimit = Math.Max(0, dto.AlertLimit);
        medication.DoseQuantity = Math.Max(1, dto.DoseQuantity);
        medication.AlertLowStockInAppEnabled = dto.AlertLowStockInAppEnabled;
        medication.AlertLowStockSmsEnabled = dto.AlertLowStockSmsEnabled;
        medication.AlertLowStockEmailEnabled = dto.AlertLowStockEmailEnabled;
        medication.AlertLowStockPatient = dto.AlertLowStockPatient;
        medication.AlertLowStockNurse = dto.AlertLowStockNurse;
        medication.AlertLowStockFamily = dto.AlertLowStockFamily;
        medication.AlertLowStockAdmin = dto.AlertLowStockAdmin;
        medication.AlertLowStockCustomPhone = string.IsNullOrWhiteSpace(dto.AlertLowStockCustomPhone) ? null : dto.AlertLowStockCustomPhone.Trim();
        medication.AlertLowStockCustomEmail = string.IsNullOrWhiteSpace(dto.AlertLowStockCustomEmail) ? null : dto.AlertLowStockCustomEmail.Trim();
        medication.TotalQuantity = normalizedQuantity;
        medication.UpdatedAt = DateTime.UtcNow;

        if (previousQuantity != normalizedQuantity)
        {
            var transactionType = normalizedQuantity > previousQuantity
                ? MedicationInventoryTransactionType.ManualIncrease
                : MedicationInventoryTransactionType.Adjustment;

            await CreateInventoryTransactionAsync(
                medication,
                transactionType,
                normalizedQuantity - previousQuantity,
                previousQuantity,
                normalizedQuantity,
                "اصلاح موجودی از فرم ویرایش دارو",
                null);
        }

        if (scheduleChanged)
        {
            var futureDoses = _context.MedicationDoses
                .Where(d => d.PatientMedicationId == id &&
                            d.Status == DoseStatus.Scheduled &&
                            d.ScheduledTime > DateTime.UtcNow);

            _context.MedicationDoses.RemoveRange(futureDoses);
            await _context.SaveChangesAsync();
            await GenerateDosesAsync(medication.Id, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));
        }
        else
        {
            await _context.SaveChangesAsync();
        }

        await EvaluateLowStockAlertAsync(medication);
        await _context.SaveChangesAsync();

        return MapToDto(medication);
    }

    public async Task DeleteMedicationAsync(int id)
    {
        var medication = await _context.PatientMedications
            .Include(m => m.Doses)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (medication == null) throw new KeyNotFoundException("Medication not found");

        var hasHistory = medication.Doses.Any(d => d.Status != DoseStatus.Scheduled && d.Status != DoseStatus.Cancelled);
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

        var activeMedications = await _context.PatientMedications
            .Where(m => m.CareRecipientId == patientId &&
                        m.StartDate <= endOfDay &&
                        (m.EndDate == null || m.EndDate >= startOfDay) &&
                        !m.IsPRN)
            .ToListAsync();

        foreach (var med in activeMedications)
        {
            var hasDoses = await _context.MedicationDoses
                .AnyAsync(d => d.PatientMedicationId == med.Id && d.ScheduledTime >= startOfDay && d.ScheduledTime <= endOfDay);

            if (!hasDoses)
            {
                await GenerateDosesForMedicationAsync(med, startOfDay, startOfDay);
            }
        }

        await _context.SaveChangesAsync();

        var doses = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
            .Include(d => d.TakenByUser)
            .Where(d => d.PatientMedication.CareRecipientId == patientId &&
                        d.ScheduledTime >= startOfDay &&
                        d.ScheduledTime <= endOfDay)
            .OrderBy(d => d.ScheduledTime)
            .ToListAsync();

        return doses.Select(MapToDoseDto).ToList();
    }

    public async Task RecordDoseAsync(int doseId, RecordDoseDto dto, string userId)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
            userId,
            dose.PatientMedication.CareRecipientId,
            PatientSelfServiceFeatures.MedicationKardex);

        var previousStatus = dose.Status;
        var medication = dose.PatientMedication;

        dose.Status = dto.Status;
        dose.TakenAt = dto.Status == DoseStatus.Taken ? dto.TakenAt : null;
        dose.TakenByUserId = userId;
        dose.Notes = dto.Notes;
        dose.MissedReason = dto.MissedReason;
        dose.SideEffectSeverity = dto.SideEffectSeverity;
        dose.SideEffectDescription = dto.SideEffectDescription;
        dose.AttachmentPath = dto.AttachmentPath;
        dose.UpdatedAt = DateTime.UtcNow;

        await ApplyDoseInventoryImpactAsync(dose, medication, previousStatus, dto.Status, userId);

        _context.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = $"Medication {dto.Status}",
            EntityName = "MedicationDose",
            EntityId = doseId.ToString(),
            CreatedAt = DateTime.UtcNow,
            Details = $"Status changed from {previousStatus} to {dto.Status}. Notes: {dto.Notes}. Attachment: {dto.AttachmentPath}"
        });

        await EvaluateLowStockAlertAsync(medication);
        await _context.SaveChangesAsync();
    }

    public async Task ResetDoseAsync(int doseId, string userId)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
            userId,
            dose.PatientMedication.CareRecipientId,
            PatientSelfServiceFeatures.MedicationKardex);

        var previousStatus = dose.Status;
        await ApplyDoseInventoryImpactAsync(dose, dose.PatientMedication, previousStatus, DoseStatus.Scheduled, userId);

        dose.Status = DoseStatus.Scheduled;
        dose.TakenAt = null;
        dose.TakenByUserId = null;
        dose.Notes = null;
        dose.MissedReason = null;
        dose.SideEffectSeverity = SideEffectSeverity.None;
        dose.SideEffectDescription = null;
        dose.AttachmentPath = null;
        dose.UpdatedAt = DateTime.UtcNow;
        dose.EscalationLevel = DoseEscalationLevel.None;
        dose.LastEscalationTime = null;

        _context.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = "MedicationReset",
            EntityName = "MedicationDose",
            EntityId = doseId.ToString(),
            CreatedAt = DateTime.UtcNow,
            Details = $"Dose log reset from {previousStatus} to Scheduled."
        });

        await EvaluateLowStockAlertAsync(dose.PatientMedication);
        await _context.SaveChangesAsync();
    }

    public async Task<List<MedicationInventoryTransactionDto>> GetInventoryTransactionsAsync(int medicationId)
    {
        var transactions = await _context.MedicationInventoryTransactions
            .Include(t => t.PerformedByUser)
            .Where(t => t.PatientMedicationId == medicationId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return transactions.Select(t => new MedicationInventoryTransactionDto
        {
            Id = t.Id,
            CreatedAt = t.CreatedAt,
            PerformedByName = t.PerformedByUser != null ? $"{t.PerformedByUser.FirstName} {t.PerformedByUser.LastName}".Trim() : null,
            TransactionType = t.TransactionType,
            TransactionTypeLabel = GetInventoryTransactionTypeLabel(t.TransactionType),
            QuantityChanged = t.QuantityChanged,
            QuantityBefore = t.QuantityBefore,
            QuantityAfter = t.QuantityAfter,
            Notes = t.Notes
        }).ToList();
    }

    public async Task<List<MedicationAlertHistoryDto>> GetAlertHistoriesAsync(int medicationId)
    {
        var histories = await _context.MedicationAlertHistories
            .Include(h => h.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
            .Where(h => h.PatientMedicationId == medicationId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return histories.Select(h => new MedicationAlertHistoryDto
        {
            Id = h.Id,
            MedicationName = h.PatientMedication.Name,
            PatientName = $"{h.PatientMedication.CareRecipient.FirstName} {h.PatientMedication.CareRecipient.LastName}".Trim(),
            CreatedAt = h.CreatedAt,
            AlertType = h.AlertType,
            AlertTypeLabel = GetAlertTypeLabel(h.AlertType),
            Recipient = h.RecipientDisplay,
            Channel = h.Channel,
            ChannelLabel = GetAlertChannelLabel(h.Channel),
            Message = h.Message,
            DeliveryStatus = h.DeliveryStatus,
            DeliveryStatusLabel = GetAlertHistoryStatusLabel(h.DeliveryStatus),
            ErrorMessage = h.ErrorMessage
        }).ToList();
    }

    public async Task<MedicationDto> UpdateInventoryAsync(int medicationId, UpdateMedicationInventoryDto dto, string userId)
    {
        var medication = await _context.PatientMedications
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.User)
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.ResponsibleNurse)
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.FamilyMember)
            .FirstOrDefaultAsync(m => m.Id == medicationId);

        if (medication == null) throw new KeyNotFoundException("Medication not found");

        var before = medication.TotalQuantity;
        var amount = dto.Quantity;

        if (dto.TransactionType != MedicationInventoryTransactionType.Adjustment && amount < 0)
        {
            throw new InvalidOperationException("Quantity must be non-negative.");
        }

        int after;
        switch (dto.TransactionType)
        {
            case MedicationInventoryTransactionType.ManualIncrease:
                after = before + amount;
                break;
            case MedicationInventoryTransactionType.ManualDecrease:
                after = Math.Max(0, before - amount);
                break;
            case MedicationInventoryTransactionType.Adjustment:
                after = Math.Max(0, amount);
                amount = after - before;
                break;
            default:
                throw new InvalidOperationException("Unsupported inventory transaction type.");
        }

        medication.TotalQuantity = after;
        medication.UpdatedAt = DateTime.UtcNow;

        await CreateInventoryTransactionAsync(
            medication,
            dto.TransactionType,
            amount,
            before,
            after,
            dto.Notes,
            userId);

        _context.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = $"MedicationInventory:{dto.TransactionType}",
            EntityName = "PatientMedication",
            EntityId = medicationId.ToString(),
            CreatedAt = DateTime.UtcNow,
            Details = $"Inventory changed from {before} to {after}. Notes: {dto.Notes}"
        });

        await EvaluateLowStockAlertAsync(medication);
        await _context.SaveChangesAsync();

        return MapToDto(medication);
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
            .Where(d => d.Status == DoseStatus.Scheduled &&
                        !d.IsReminderSent &&
                        d.ScheduledTime > now &&
                        d.ScheduledTime <= now.AddMinutes(15))
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
                    await _notificationService.SendEmailAsync(
                        med.CareRecipient.ResponsibleNurse.Email,
                        "Patient Medication Reminder",
                        $"Reminder for patient {med.CareRecipient.FirstName} {med.CareRecipient.LastName}: {message}");
                }
            }
            catch
            {
            }

            dose.IsReminderSent = true;
        }

        if (upcomingDoses.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    public async Task CheckMissedDosesAndEscalateAsync()
    {
        var now = DateTime.UtcNow;
        var staffUserIds = await GetAdminUserIdsAsync();

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

        foreach (var dose in overdueDoses)
        {
            var med = dose.PatientMedication;
            var careRecipient = med.CareRecipient;
            var graceTime = dose.ScheduledTime.AddMinutes(med.GracePeriodMinutes);
            var recipientIds = new List<string>();

            var assignedPrimaryCaregiverIds = await _context.CareAssignments
                .Where(a => a.PatientId == careRecipient.Id
                            && a.Status == AssignmentStatus.Active
                            && a.IsPrimaryCaregiver
                            && (!a.EndDate.HasValue || a.EndDate > DateTimeOffset.UtcNow))
                .Select(a => a.CaregiverId)
                .Distinct()
                .ToListAsync();

            var patientName = $"{careRecipient.FirstName} {careRecipient.LastName}".Trim();
            var title = "هشدار عدم ثبت مصرف دارو";
            var message = $"{patientName}: مصرف {med.Name} ساعت {dose.ScheduledTime:HH:mm} ثبت نشده است.";
            var link = $"/dashboard/patients/{careRecipient.Id}?tab=medications&doseId={dose.Id}";
            var severity = med.Criticality >= MedicationCriticality.HighAlert ? "Critical" : "Warning";

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
                }
            }

            if (now > graceTime && dose.EscalationLevel == DoseEscalationLevel.None)
            {
                if (med.NotifyNurse && med.CareRecipient.ResponsibleNurse != null && !string.IsNullOrEmpty(med.CareRecipient.ResponsibleNurse.Email))
                {
                    try
                    {
                        var escalationMessage = $"MISSED DOSE ALERT: Patient {med.CareRecipient.FirstName} {med.CareRecipient.LastName} missed {med.Name} scheduled at {dose.ScheduledTime:HH:mm}.";
                        await _notificationService.SendEmailAsync(med.CareRecipient.ResponsibleNurse.Email, "URGENT: Missed Medication", escalationMessage);
                    }
                    catch
                    {
                    }
                }

                dose.EscalationLevel = DoseEscalationLevel.NurseNotified;
                dose.LastEscalationTime = now;
                _context.AuditLogs.Add(new AuditLog
                {
                    Action = "Escalation:Nurse",
                    EntityName = "MedicationDose",
                    EntityId = dose.Id.ToString(),
                    UserId = "System",
                    CreatedAt = now,
                    Details = "Escalated to Nurse due to missed dose."
                });
            }
            else if (med.EscalationEnabled && now > graceTime.AddMinutes(30) && dose.EscalationLevel == DoseEscalationLevel.NurseNotified)
            {
                if (med.NotifySupervisor)
                {
                    try
                    {
                        await _notificationService.SendEmailAsync(
                            "supervisor@hospital.com",
                            "ESCALATION: Missed Medication",
                            $"Supervisor Alert: Patient {med.CareRecipient.FirstName} missed {med.Name}. Nurse was notified 30 mins ago.");
                    }
                    catch
                    {
                    }
                }

                dose.EscalationLevel = DoseEscalationLevel.SupervisorNotified;
                dose.LastEscalationTime = now;
                _context.AuditLogs.Add(new AuditLog
                {
                    Action = "Escalation:Supervisor",
                    EntityName = "MedicationDose",
                    EntityId = dose.Id.ToString(),
                    UserId = "System",
                    CreatedAt = now,
                    Details = "Escalated to Supervisor."
                });
            }
            else if (med.EscalationEnabled && now > graceTime.AddMinutes(60) && dose.EscalationLevel == DoseEscalationLevel.SupervisorNotified)
            {
                if (med.NotifyFamily && med.CareRecipient.FamilyMember != null && !string.IsNullOrEmpty(med.CareRecipient.FamilyMember.Email))
                {
                    try
                    {
                        await _notificationService.SendEmailAsync(
                            med.CareRecipient.FamilyMember.Email,
                            "Family Alert: Missed Medication",
                            $"Alert: {med.CareRecipient.FirstName} has missed their medication {med.Name}. Staff has been alerted.");
                    }
                    catch
                    {
                    }
                }

                dose.EscalationLevel = DoseEscalationLevel.FamilyNotified;
                dose.LastEscalationTime = now;
                _context.AuditLogs.Add(new AuditLog
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

        if (overdueDoses.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    public async Task GenerateDosesAsync(int medicationId, DateTime from, DateTime to)
    {
        var medication = await _context.PatientMedications.FindAsync(medicationId);
        if (medication == null) return;

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
                foreach (var part in parts)
                {
                    if (TimeSpan.TryParse(part, out var ts))
                    {
                        times.Add(ts);
                    }
                }
            }
            else
            {
                times.Add(new TimeSpan(9, 0, 0));
            }
        }
        else if (med.FrequencyType == MedicationFrequencyType.Interval)
        {
            if (int.TryParse(med.FrequencyDetail, out var hours) && hours > 0)
            {
                for (var i = 0; i < 24; i += hours)
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
                var days = parts[0].Split(',').Select(d => int.TryParse(d, out var day) ? day : -1).ToList();
                var timesPart = parts.Length > 1 ? parts[1] : string.Empty;

                var localFromDate = TimeZoneInfo.ConvertTimeFromUtc(fromDate, tz);
                var currentDayOfWeek = (int)localFromDate.DayOfWeek;
                if (days.Contains(currentDayOfWeek) && !string.IsNullOrEmpty(timesPart))
                {
                    foreach (var part in timesPart.Split(','))
                    {
                        if (TimeSpan.TryParse(part, out var ts))
                        {
                            times.Add(ts);
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

    private async Task<MedicationDose?> GetDoseForRecordingAsync(int doseId)
    {
        return await _context.MedicationDoses
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
    }

    private async Task ApplyDoseInventoryImpactAsync(
        MedicationDose dose,
        PatientMedication medication,
        DoseStatus previousStatus,
        DoseStatus newStatus,
        string userId)
    {
        if (previousStatus != DoseStatus.Taken && newStatus == DoseStatus.Taken)
        {
            var quantityToDeduct = Math.Max(1, medication.DoseQuantity);
            var before = medication.TotalQuantity;
            medication.TotalQuantity = Math.Max(0, medication.TotalQuantity - quantityToDeduct);
            dose.AppliedInventoryQuantity = quantityToDeduct;

            await CreateInventoryTransactionAsync(
                medication,
                MedicationInventoryTransactionType.DoseConsumption,
                -quantityToDeduct,
                before,
                medication.TotalQuantity,
                $"مصرف دوز ساعت {dose.ScheduledTime:yyyy-MM-dd HH:mm}",
                userId);
        }
        else if (previousStatus == DoseStatus.Taken && newStatus != DoseStatus.Taken && dose.AppliedInventoryQuantity > 0)
        {
            var before = medication.TotalQuantity;
            medication.TotalQuantity += dose.AppliedInventoryQuantity;

            await CreateInventoryTransactionAsync(
                medication,
                MedicationInventoryTransactionType.StockReturn,
                dose.AppliedInventoryQuantity,
                before,
                medication.TotalQuantity,
                $"برگشت موجودی دوز ساعت {dose.ScheduledTime:yyyy-MM-dd HH:mm}",
                userId);

            dose.AppliedInventoryQuantity = 0;
        }
    }

    private async Task CreateInventoryTransactionAsync(
        PatientMedication medication,
        MedicationInventoryTransactionType transactionType,
        int quantityChanged,
        int quantityBefore,
        int quantityAfter,
        string? notes,
        string? userId)
    {
        _context.MedicationInventoryTransactions.Add(new MedicationInventoryTransaction
        {
            PatientMedicationId = medication.Id,
            TransactionType = transactionType,
            QuantityChanged = quantityChanged,
            QuantityBefore = quantityBefore,
            QuantityAfter = quantityAfter,
            Notes = notes,
            PerformedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        });

        await Task.CompletedTask;
    }

    private async Task EvaluateLowStockAlertAsync(PatientMedication medication)
    {
        var stockStatus = GetStockStatus(medication.TotalQuantity, medication.AlertLimit);
        if (stockStatus == MedicationStockStatus.InStock)
        {
            if (medication.IsLowStockAlertActive)
            {
                medication.IsLowStockAlertActive = false;
                medication.LowStockAlertActivatedAt = null;
                await ClearLowStockNotificationsAsync(medication);
            }

            return;
        }

        if (medication.IsLowStockAlertActive)
        {
            return;
        }

        await LoadMedicationRelationsAsync(medication.Id, medication);

        var settings = await _medicationAlertSettingsService.GetSettingsEntityAsync();
        var patientName = $"{medication.CareRecipient.FirstName} {medication.CareRecipient.LastName}".Trim();
        var templateValues = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["PatientName"] = patientName,
            ["MedicationName"] = medication.Name,
            ["CurrentStock"] = medication.TotalQuantity.ToString(),
            ["AlertThreshold"] = medication.AlertLimit.ToString(),
            ["DateTime"] = DateTime.Now.ToString("yyyy/MM/dd HH:mm")
        };

        var inAppMessage = RenderTemplate(settings.InAppTemplate, templateValues);
        var smsMessage = RenderTemplate(settings.SmsTemplate, templateValues);
        var emailSubject = RenderTemplate(settings.EmailSubjectTemplate, templateValues);
        var emailBody = RenderTemplate(settings.EmailBodyTemplate, templateValues);
        var alertTitle = stockStatus == MedicationStockStatus.OutOfStock ? "هشدار اتمام موجودی دارو" : "هشدار کمبود موجودی دارو";
        var link = $"/dashboard/patients/{medication.CareRecipientId}?tab=medications";

        var recipients = await BuildAlertRecipientsAsync(medication);

        foreach (var recipient in recipients)
        {
            if (medication.AlertLowStockInAppEnabled && !string.IsNullOrWhiteSpace(recipient.UserId))
            {
                await SendInAppAlertAsync(medication, recipient, alertTitle, inAppMessage, link);
            }

            if (medication.AlertLowStockSmsEnabled && !string.IsNullOrWhiteSpace(recipient.PhoneNumber))
            {
                await SendSmsAlertAsync(medication, recipient, smsMessage);
            }

            if (medication.AlertLowStockEmailEnabled && !string.IsNullOrWhiteSpace(recipient.Email))
            {
                await SendEmailAlertAsync(medication, recipient, emailSubject, emailBody);
            }
        }

        medication.IsLowStockAlertActive = true;
        medication.LowStockAlertActivatedAt = DateTime.UtcNow;
    }

    private async Task SendInAppAlertAsync(
        PatientMedication medication,
        AlertRecipient recipient,
        string title,
        string message,
        string link)
    {
        try
        {
            var hasUnreadDuplicate = await _context.UserNotifications.AnyAsync(n =>
                n.UserId == recipient.UserId &&
                !n.IsRead &&
                n.ReferenceId == medication.Id.ToString() &&
                n.Title == title);

            if (hasUnreadDuplicate)
            {
                return;
            }

            await _userNotificationService.CreateNotificationAsync(
                recipient.UserId!,
                title,
                message,
                NotificationType.Alert,
                referenceId: medication.Id.ToString(),
                link: link,
                severity: "Warning");

            AddAlertHistory(medication, recipient, MedicationAlertChannel.InApp, message, MedicationAlertHistoryStatus.Success, null);
        }
        catch (Exception ex)
        {
            AddAlertHistory(medication, recipient, MedicationAlertChannel.InApp, message, MedicationAlertHistoryStatus.Failed, ex.Message);
        }
    }

    private async Task ClearLowStockNotificationsAsync(PatientMedication medication)
    {
        var notifications = await _context.UserNotifications
            .Where(n =>
                n.ReferenceId == medication.Id.ToString() &&
                !n.IsRead &&
                (n.Title == "هشدار کمبود موجودی دارو" || n.Title == "هشدار اتمام موجودی دارو"))
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
        }
    }

    private async Task SendSmsAlertAsync(PatientMedication medication, AlertRecipient recipient, string message)
    {
        try
        {
            await _notificationService.SendSmsAsync(recipient.PhoneNumber!, message);
            AddAlertHistory(medication, recipient, MedicationAlertChannel.Sms, message, MedicationAlertHistoryStatus.Success, null);
        }
        catch (Exception ex)
        {
            AddAlertHistory(medication, recipient, MedicationAlertChannel.Sms, message, MedicationAlertHistoryStatus.Failed, ex.Message);
        }
    }

    private async Task SendEmailAlertAsync(PatientMedication medication, AlertRecipient recipient, string subject, string body)
    {
        try
        {
            await _notificationService.SendEmailAsync(recipient.Email!, subject, body);
            AddAlertHistory(medication, recipient, MedicationAlertChannel.Email, body, MedicationAlertHistoryStatus.Success, null);
        }
        catch (Exception ex)
        {
            AddAlertHistory(medication, recipient, MedicationAlertChannel.Email, body, MedicationAlertHistoryStatus.Failed, ex.Message);
        }
    }

    private void AddAlertHistory(
        PatientMedication medication,
        AlertRecipient recipient,
        MedicationAlertChannel channel,
        string message,
        MedicationAlertHistoryStatus status,
        string? error)
    {
        _context.MedicationAlertHistories.Add(new MedicationAlertHistory
        {
            PatientMedicationId = medication.Id,
            CareRecipientId = medication.CareRecipientId,
            AlertType = MedicationAlertType.LowStock,
            RecipientType = recipient.RecipientType,
            RecipientDisplay = recipient.Display,
            RecipientUserId = recipient.UserId,
            Channel = channel,
            Message = message,
            DeliveryStatus = status,
            ErrorMessage = error,
            CreatedAt = DateTime.UtcNow
        });
    }

    private async Task<List<AlertRecipient>> BuildAlertRecipientsAsync(PatientMedication medication)
    {
        var recipients = new List<AlertRecipient>();
        var careRecipient = medication.CareRecipient;

        if (medication.AlertLowStockPatient && careRecipient.User != null)
        {
            recipients.Add(new AlertRecipient(
                MedicationAlertRecipientType.Patient,
                $"{careRecipient.FirstName} {careRecipient.LastName}".Trim(),
                careRecipient.UserId,
                careRecipient.User.PhoneNumber,
                careRecipient.User.Email));
        }

        if (medication.AlertLowStockNurse && careRecipient.ResponsibleNurse != null)
        {
            recipients.Add(new AlertRecipient(
                MedicationAlertRecipientType.Nurse,
                $"{careRecipient.ResponsibleNurse.FirstName} {careRecipient.ResponsibleNurse.LastName}".Trim(),
                careRecipient.ResponsibleNurseId,
                careRecipient.ResponsibleNurse.PhoneNumber,
                careRecipient.ResponsibleNurse.Email));
        }

        if (medication.AlertLowStockFamily && careRecipient.FamilyMember != null)
        {
            recipients.Add(new AlertRecipient(
                MedicationAlertRecipientType.Family,
                $"{careRecipient.FamilyMember.FirstName} {careRecipient.FamilyMember.LastName}".Trim(),
                careRecipient.FamilyMemberId,
                careRecipient.FamilyMember.PhoneNumber,
                careRecipient.FamilyMember.Email));
        }

        if (medication.AlertLowStockAdmin)
        {
            var admins = await _context.Users
                .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { User = u, ur.RoleId })
                .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.User, r.Name })
                .Where(x => x.Name == Roles.Admin || x.Name == Roles.SuperAdmin || x.Name == Roles.Manager || x.Name == Roles.Supervisor)
                .Select(x => x.User)
                .Distinct()
                .ToListAsync();

            recipients.AddRange(admins.Select(admin => new AlertRecipient(
                MedicationAlertRecipientType.Admin,
                $"{admin.FirstName} {admin.LastName}".Trim(),
                admin.Id,
                admin.PhoneNumber,
                admin.Email)));
        }

        if (!string.IsNullOrWhiteSpace(medication.AlertLowStockCustomPhone))
        {
            recipients.Add(new AlertRecipient(
                MedicationAlertRecipientType.CustomPhone,
                medication.AlertLowStockCustomPhone,
                null,
                medication.AlertLowStockCustomPhone,
                null));
        }

        if (!string.IsNullOrWhiteSpace(medication.AlertLowStockCustomEmail))
        {
            recipients.Add(new AlertRecipient(
                MedicationAlertRecipientType.CustomEmail,
                medication.AlertLowStockCustomEmail,
                null,
                null,
                medication.AlertLowStockCustomEmail));
        }

        return recipients
            .GroupBy(r => $"{r.RecipientType}|{r.UserId}|{r.PhoneNumber}|{r.Email}")
            .Select(g => g.First())
            .ToList();
    }

    private async Task<List<string>> GetAdminUserIdsAsync()
    {
        return await _context.Users
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u.Id, ur.RoleId })
            .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.Id, r.Name })
            .Where(x => x.Name == Roles.Admin || x.Name == Roles.SuperAdmin || x.Name == Roles.Supervisor || x.Name == Roles.Manager)
            .Select(x => x.Id)
            .Distinct()
            .ToListAsync();
    }

    private async Task LoadMedicationRelationsAsync(int medicationId, PatientMedication medication)
    {
        if (medication.CareRecipient != null &&
            (medication.CareRecipient.User != null || medication.CareRecipient.UserId == null) &&
            (medication.CareRecipient.ResponsibleNurse != null || medication.CareRecipient.ResponsibleNurseId == null) &&
            (medication.CareRecipient.FamilyMember != null || medication.CareRecipient.FamilyMemberId == null))
        {
            return;
        }

        var loaded = await _context.PatientMedications
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.User)
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.ResponsibleNurse)
            .Include(m => m.CareRecipient)
                .ThenInclude(cr => cr.FamilyMember)
            .FirstAsync(m => m.Id == medicationId);

        medication.CareRecipient = loaded.CareRecipient;
    }

    private static MedicationDoseDto MapToDoseDto(MedicationDose dose)
    {
        var status = GetStockStatus(dose.PatientMedication.TotalQuantity, dose.PatientMedication.AlertLimit);
        return new MedicationDoseDto
        {
            Id = dose.Id,
            MedicationId = dose.PatientMedicationId,
            MedicationName = dose.PatientMedication.Name,
            Dosage = dose.PatientMedication.Dosage,
            Route = dose.PatientMedication.Route,
            Instructions = dose.PatientMedication.Instructions ?? string.Empty,
            ScheduledTime = dose.ScheduledTime,
            Status = dose.Status,
            TakenAt = dose.TakenAt,
            TakenByName = dose.TakenByUser != null ? $"{dose.TakenByUser.FirstName} {dose.TakenByUser.LastName}".Trim() : null,
            Notes = dose.Notes,
            MissedReason = dose.MissedReason,
            SideEffectSeverity = dose.SideEffectSeverity,
            SideEffectDescription = dose.SideEffectDescription,
            CurrentQuantity = dose.PatientMedication.TotalQuantity,
            AlertLimit = dose.PatientMedication.AlertLimit,
            DoseQuantity = dose.PatientMedication.DoseQuantity,
            StockStatus = status,
            StockStatusLabel = GetStockStatusLabel(status),
            IsLowStockAlertActive = dose.PatientMedication.IsLowStockAlertActive,
            AttachmentPath = dose.AttachmentPath,
            IsReminderSent = dose.IsReminderSent,
            EscalationLevel = dose.EscalationLevel
        };
    }

    private static MedicationDto MapToDto(PatientMedication medication)
    {
        var stockStatus = GetStockStatus(medication.TotalQuantity, medication.AlertLimit);
        return new MedicationDto
        {
            Id = medication.Id,
            Name = medication.Name,
            Form = medication.Form,
            Dosage = medication.Dosage,
            Route = medication.Route,
            FrequencyType = medication.FrequencyType,
            FrequencyDetail = medication.FrequencyDetail,
            StartDate = medication.StartDate,
            EndDate = medication.EndDate,
            IsPRN = medication.IsPRN,
            HighAlert = medication.HighAlert,
            Criticality = medication.Criticality,
            Instructions = medication.Instructions,
            GracePeriodMinutes = medication.GracePeriodMinutes,
            NotifyPatient = medication.NotifyPatient,
            NotifyNurse = medication.NotifyNurse,
            NotifySupervisor = medication.NotifySupervisor,
            NotifyFamily = medication.NotifyFamily,
            EscalationEnabled = medication.EscalationEnabled,
            TotalQuantity = medication.TotalQuantity,
            AlertLimit = medication.AlertLimit,
            DoseQuantity = medication.DoseQuantity,
            StockStatus = stockStatus,
            StockStatusLabel = GetStockStatusLabel(stockStatus),
            IsLowStockAlertActive = medication.IsLowStockAlertActive,
            LowStockAlertActivatedAt = medication.LowStockAlertActivatedAt,
            AlertLowStockInAppEnabled = medication.AlertLowStockInAppEnabled,
            AlertLowStockSmsEnabled = medication.AlertLowStockSmsEnabled,
            AlertLowStockEmailEnabled = medication.AlertLowStockEmailEnabled,
            AlertLowStockPatient = medication.AlertLowStockPatient,
            AlertLowStockNurse = medication.AlertLowStockNurse,
            AlertLowStockFamily = medication.AlertLowStockFamily,
            AlertLowStockAdmin = medication.AlertLowStockAdmin,
            AlertLowStockCustomPhone = medication.AlertLowStockCustomPhone,
            AlertLowStockCustomEmail = medication.AlertLowStockCustomEmail
        };
    }

    private static MedicationStockStatus GetStockStatus(int totalQuantity, int alertLimit)
    {
        if (totalQuantity <= 0)
        {
            return MedicationStockStatus.OutOfStock;
        }

        if (alertLimit > 0 && totalQuantity <= alertLimit)
        {
            return MedicationStockStatus.LowStock;
        }

        return MedicationStockStatus.InStock;
    }

    private static string GetStockStatusLabel(MedicationStockStatus status)
    {
        return status switch
        {
            MedicationStockStatus.InStock => "کافی",
            MedicationStockStatus.LowStock => "نزدیک به اتمام",
            MedicationStockStatus.OutOfStock => "اتمام موجودی",
            _ => "نامشخص"
        };
    }

    private static string GetInventoryTransactionTypeLabel(MedicationInventoryTransactionType type)
    {
        return type switch
        {
            MedicationInventoryTransactionType.InitialStock => "موجودی اولیه",
            MedicationInventoryTransactionType.DoseConsumption => "مصرف دارو",
            MedicationInventoryTransactionType.ManualIncrease => "افزایش موجودی",
            MedicationInventoryTransactionType.ManualDecrease => "کاهش دستی",
            MedicationInventoryTransactionType.Adjustment => "اصلاح موجودی",
            MedicationInventoryTransactionType.StockReturn => "برگشت موجودی",
            _ => "نامشخص"
        };
    }

    private static string GetAlertChannelLabel(MedicationAlertChannel channel)
    {
        return channel switch
        {
            MedicationAlertChannel.InApp => "داخل سیستم",
            MedicationAlertChannel.Sms => "SMS",
            MedicationAlertChannel.Email => "Email",
            _ => "نامشخص"
        };
    }

    private static string GetAlertHistoryStatusLabel(MedicationAlertHistoryStatus status)
    {
        return status switch
        {
            MedicationAlertHistoryStatus.Success => "Success",
            MedicationAlertHistoryStatus.Failed => "Failed",
            _ => "Unknown"
        };
    }

    private static string GetAlertTypeLabel(MedicationAlertType type)
    {
        return type switch
        {
            MedicationAlertType.LowStock => "هشدار اتمام موجودی",
            _ => "نامشخص"
        };
    }

    private static string RenderTemplate(string template, IReadOnlyDictionary<string, string> values)
    {
        var output = template;
        foreach (var item in values)
        {
            output = output.Replace($"{{{item.Key}}}", item.Value, StringComparison.OrdinalIgnoreCase);
        }

        return output;
    }

    private sealed record AlertRecipient(
        MedicationAlertRecipientType RecipientType,
        string Display,
        string? UserId,
        string? PhoneNumber,
        string? Email);
}
