using Microsoft.EntityFrameworkCore;
using System.Text.Json;
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
    private readonly INotificationSettingsService _notificationSettingsService;

    public MedicationService(
        ApplicationDbContext context,
        INotificationService notificationService,
        IUserNotificationService userNotificationService,
        IPatientSelfServiceAccessService patientSelfServiceAccessService,
        IMedicationAlertSettingsService medicationAlertSettingsService,
        INotificationSettingsService notificationSettingsService)
    {
        _context = context;
        _notificationService = notificationService;
        _userNotificationService = userNotificationService;
        _patientSelfServiceAccessService = patientSelfServiceAccessService;
        _medicationAlertSettingsService = medicationAlertSettingsService;
        _notificationSettingsService = notificationSettingsService;
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

    public async Task<MedicationDto?> GetMedicationByIdAsync(int id)
    {
        var medication = await _context.PatientMedications
            .FirstOrDefaultAsync(m => m.Id == id);

        return medication == null ? null : MapToDto(medication);
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
        var tz = GetIranTimeZone();
        var todayLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz).Date;
        var startOfTodayLocal = new DateTime(todayLocal.Year, todayLocal.Month, todayLocal.Day, 0, 0, 0, DateTimeKind.Unspecified);
        var startOfTodayUtc = TimeZoneInfo.ConvertTimeToUtc(startOfTodayLocal, tz);

        var medications = await _context.PatientMedications
            .Where(m => m.CareRecipientId == patientId && (m.EndDate == null || m.EndDate >= startOfTodayUtc))
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync();

        return medications.Select(MapToDto).ToList();
    }

    public async Task<List<MedicationDoseDto>> GetDailyScheduleAsync(int patientId, DateTime date)
    {
        var tz = GetIranTimeZone();
        var iranDate = GetIranLocalDate(date, tz);

        var startOfDayLocal = new DateTime(iranDate.Year, iranDate.Month, iranDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
        var endOfDayLocal = new DateTime(iranDate.Year, iranDate.Month, iranDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);
        var startOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(startOfDayLocal, tz);
        var endOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(endOfDayLocal, tz);

        var activeMedications = await _context.PatientMedications
            .Where(m => m.CareRecipientId == patientId &&
                        m.StartDate <= endOfDayUtc &&
                        (m.EndDate == null || m.EndDate >= startOfDayUtc) &&
                        !m.IsPRN)
            .ToListAsync();

        var activeMedicationIds = activeMedications.Select(m => m.Id).ToList();
        var medicationsWithExistingDoses = activeMedicationIds.Count == 0
            ? new HashSet<int>()
            : (await _context.MedicationDoses
                .Where(d =>
                    activeMedicationIds.Contains(d.PatientMedicationId) &&
                    d.ScheduledTime >= startOfDayUtc &&
                    d.ScheduledTime <= endOfDayUtc)
                .Select(d => d.PatientMedicationId)
                .Distinct()
                .ToListAsync())
            .ToHashSet();

        foreach (var med in activeMedications.Where(m => !medicationsWithExistingDoses.Contains(m.Id)))
        {
            await GenerateDosesForMedicationAsync(med, startOfDayUtc, startOfDayUtc);
        }

        await _context.SaveChangesAsync();

        var doses = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
            .Include(d => d.TakenByUser)
            .Include(d => d.RecordedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.CorrectedByUser)
            .Where(d => d.PatientMedication.CareRecipientId == patientId &&
                        d.ScheduledTime >= startOfDayUtc &&
                        d.ScheduledTime <= endOfDayUtc)
            .OrderBy(d => d.ScheduledTime)
            .ToListAsync();

        return doses.Select(MapToDoseDto).ToList();
    }

    public async Task<List<MedicationDoseDto>> GetPatientMedicationHistoryAsync(
        int patientId,
        DateTime? from,
        DateTime? to,
        MedicationAdministrationOutcome? administrationOutcome,
        MedicationTimingStatus? timingStatus,
        bool onlyIssues,
        string? search)
    {
        var tz = GetIranTimeZone();
        var todayLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz).Date;
        var defaultFromLocal = todayLocal.AddDays(-30);
        var defaultToLocal = todayLocal;

        var fromLocalDate = GetIranLocalDate(from ?? defaultFromLocal, tz);
        var toLocalDate = GetIranLocalDate(to ?? defaultToLocal, tz);

        var startOfDayLocal = new DateTime(fromLocalDate.Year, fromLocalDate.Month, fromLocalDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
        var endOfDayLocal = new DateTime(toLocalDate.Year, toLocalDate.Month, toLocalDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);
        var startOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(startOfDayLocal, tz);
        var endOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(endOfDayLocal, tz);

        var query = _context.MedicationDoses
            .Include(d => d.PatientMedication)
            .Include(d => d.TakenByUser)
            .Include(d => d.RecordedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.CorrectedByUser)
            .Where(d => d.PatientMedication.CareRecipientId == patientId &&
                        d.ScheduledTime >= startOfDayUtc &&
                        d.ScheduledTime <= endOfDayUtc);

        if (administrationOutcome.HasValue)
        {
            query = query.Where(d => d.AdministrationOutcome == administrationOutcome.Value);
        }

        if (timingStatus.HasValue)
        {
            query = query.Where(d => d.TimingStatus == timingStatus.Value);
        }

        if (onlyIssues)
        {
            query = query.Where(d =>
                d.AdministrationOutcome == MedicationAdministrationOutcome.Missed ||
                d.AdministrationOutcome == MedicationAdministrationOutcome.SkippedByPatient ||
                d.TimingStatus == MedicationTimingStatus.Late ||
                d.TimingStatus == MedicationTimingStatus.Missed);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmedSearch = search.Trim();
            query = query.Where(d =>
                d.PatientMedication.Name.Contains(trimmedSearch) ||
                (d.Notes != null && d.Notes.Contains(trimmedSearch)) ||
                (d.MissedReason != null && d.MissedReason.Contains(trimmedSearch)) ||
                (d.PatientComment != null && d.PatientComment.Contains(trimmedSearch)));
        }

        var doses = await query
            .OrderByDescending(d => d.ScheduledTime)
            .Take(250)
            .ToListAsync();

        return doses.Select(MapToDoseDto).ToList();
    }

    public async Task<MedicationDoseDto?> GetDoseForPatientAsync(int patientId, int doseId)
    {
        var dose = await _context.MedicationDoses
            .Include(d => d.PatientMedication)
            .Include(d => d.TakenByUser)
            .Include(d => d.RecordedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.CorrectedByUser)
            .Where(d => d.Id == doseId && d.PatientMedication.CareRecipientId == patientId)
            .FirstOrDefaultAsync();

        return dose == null ? null : MapToDoseDto(dose);
    }

    public async Task<List<MedicationDoseDto>> GetShiftMedicationAdministrationAsync(string caregiverId, ShiftSlot? shiftSlot, DateTime date, bool pendingOnly)
    {
        var tz = GetIranTimeZone();
        var iranDate = GetIranLocalDate(date, tz);
        var startOfDayLocal = new DateTime(iranDate.Year, iranDate.Month, iranDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
        var endOfDayLocal = new DateTime(iranDate.Year, iranDate.Month, iranDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);
        var startOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(startOfDayLocal, tz);
        var endOfDayUtc = TimeZoneInfo.ConvertTimeToUtc(endOfDayLocal, tz);

        var query = _context.MedicationDoses
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
            .Include(d => d.TakenByUser)
            .Include(d => d.RecordedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.CorrectedByUser)
            .Where(d => d.ScheduledTime >= startOfDayUtc &&
                        d.ScheduledTime <= endOfDayUtc);

        if (!string.Equals(caregiverId, "*", StringComparison.Ordinal))
        {
            var assignedPatientIds = await _context.CareAssignments
                .Where(x => x.CaregiverId == caregiverId &&
                            x.Status == AssignmentStatus.Active &&
                            (!x.EndDate.HasValue || x.EndDate > DateTimeOffset.UtcNow) &&
                            (!shiftSlot.HasValue || x.ShiftSlot == null || x.ShiftSlot == shiftSlot))
                .Select(x => x.PatientId)
                .Distinct()
                .ToListAsync();

            if (assignedPatientIds.Count == 0)
            {
                return [];
            }

            query = query.Where(d => assignedPatientIds.Contains(d.PatientMedication.CareRecipientId));
        }

        if (shiftSlot.HasValue)
        {
            query = query.Where(d => d.ScheduledShiftSlot == shiftSlot.Value);
        }

        if (pendingOnly)
        {
            query = query.Where(d => d.VerificationStatus == MedicationVerificationStatus.Pending ||
                                     d.Status == DoseStatus.Scheduled ||
                                     d.Status == DoseStatus.Due ||
                                     d.Status == DoseStatus.Missed);
        }

        var doses = await query
            .OrderBy(d => d.ScheduledTime)
            .ThenBy(d => d.PatientMedication.Name)
            .ToListAsync();

        return doses.Select(MapToDoseDto).ToList();
    }

    public async Task<List<MedicationDoseStatusHistoryDto>> GetDoseHistoryAsync(int doseId)
    {
        var histories = await _context.MedicationDoseStatusHistories
            .Include(x => x.ChangedByUser)
            .Where(x => x.MedicationDoseId == doseId)
            .OrderByDescending(x => x.ChangedAtUtc)
            .ToListAsync();

        return histories.Select(x => new MedicationDoseStatusHistoryDto
        {
            Id = x.Id,
            ChangedAtUtc = x.ChangedAtUtc,
            Action = x.Action,
            ChangedByName = x.ChangedByUser != null ? $"{x.ChangedByUser.FirstName} {x.ChangedByUser.LastName}".Trim() : x.ChangedByUserId,
            Reason = x.Reason,
            Notes = x.Notes,
            FromStatus = x.FromStatus,
            ToStatus = x.ToStatus,
            FromAdministrationOutcome = x.FromAdministrationOutcome,
            ToAdministrationOutcome = x.ToAdministrationOutcome,
            FromTimingStatus = x.FromTimingStatus,
            ToTimingStatus = x.ToTimingStatus,
            FromVerificationStatus = x.FromVerificationStatus,
            ToVerificationStatus = x.ToVerificationStatus,
            SourceType = x.SourceType,
            MetadataJson = x.MetadataJson
        }).ToList();
    }

    public async Task<MedicationAdministrationOverviewReportDto> GetAdministrationOverviewReportAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search)
    {
        var (normalizedFromUtc, normalizedToUtc) = NormalizeIranDateRangeUtc(from, to);

        var doses = await BuildAdministrationReportQuery(normalizedFromUtc, normalizedToUtc, patientId, medicationId, shiftSlot, recordedByUserId, search)
            .OrderByDescending(d => d.ScheduledTime)
            .ToListAsync();

        var total = doses.Count;
        var taken = doses.Count(d => d.AdministrationOutcome == MedicationAdministrationOutcome.Taken);
        var onTime = doses.Count(d => d.TimingStatus == MedicationTimingStatus.OnTime);
        var late = doses.Count(d => d.TimingStatus == MedicationTimingStatus.Late);
        var missed = doses.Count(d => d.AdministrationOutcome == MedicationAdministrationOutcome.Missed);
        var skipped = doses.Count(d => d.AdministrationOutcome == MedicationAdministrationOutcome.SkippedByPatient);
        var pending = doses.Count(d => d.VerificationStatus == MedicationVerificationStatus.Pending && d.Status == DoseStatus.Scheduled);

        return new MedicationAdministrationOverviewReportDto
        {
            TotalDoses = total,
            TakenCount = taken,
            OnTimeCount = onTime,
            LateCount = late,
            MissedCount = missed,
            SkippedCount = skipped,
            PendingCount = pending,
            AdherenceRate = total == 0 ? 0 : Math.Round((decimal)taken / total * 100, 2),
            OnTimeRate = total == 0 ? 0 : Math.Round((decimal)onTime / total * 100, 2),
            Patients = doses
                .GroupBy(d => new { d.PatientMedication.CareRecipientId, PatientName = GetPatientDisplayName(d) })
                .Select(g => new MedicationAdministrationPatientSummaryDto
                {
                    CareRecipientId = g.Key.CareRecipientId,
                    PatientName = g.Key.PatientName,
                    TotalDoses = g.Count(),
                    TakenCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Taken),
                    MissedCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Missed),
                    LateCount = g.Count(x => x.TimingStatus == MedicationTimingStatus.Late),
                    AdherenceRate = g.Any() ? Math.Round((decimal)g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Taken) / g.Count() * 100, 2) : 0
                })
                .OrderByDescending(x => x.MissedCount)
                .ThenBy(x => x.PatientName)
                .Take(12)
                .ToList(),
            MostMissedMedications = doses
                .Where(d => d.AdministrationOutcome == MedicationAdministrationOutcome.Missed)
                .GroupBy(d => new { d.PatientMedicationId, d.PatientMedication.Name })
                .Select(g => new MedicationAdministrationMissedMedicationDto
                {
                    MedicationId = g.Key.PatientMedicationId,
                    MedicationName = g.Key.Name,
                    MissedCount = g.Count()
                })
                .OrderByDescending(x => x.MissedCount)
                .ThenBy(x => x.MedicationName)
                .Take(10)
                .ToList(),
            Rows = doses
                .Take(200)
                .Select(MapToAdministrationReportRowDto)
                .ToList()
        };
    }

    public async Task<List<MedicationAdministrationTrendPointDto>> GetAdministrationTrendReportAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search)
    {
        var (normalizedFromUtc, normalizedToUtc) = NormalizeIranDateRangeUtc(from, to);

        var tz = GetIranTimeZone();
        var doses = await BuildAdministrationReportQuery(normalizedFromUtc, normalizedToUtc, patientId, medicationId, shiftSlot, recordedByUserId, search)
            .Select(d => new
            {
                d.ScheduledTime,
                d.AdministrationOutcome,
                d.TimingStatus
            })
            .ToListAsync();

        return doses
            .GroupBy(d => TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(d.ScheduledTime, DateTimeKind.Utc), tz).Date)
            .OrderBy(g => g.Key)
            .Select(g => new MedicationAdministrationTrendPointDto
            {
                Date = DateTime.SpecifyKind(g.Key, DateTimeKind.Unspecified),
                TakenCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Taken),
                LateCount = g.Count(x => x.TimingStatus == MedicationTimingStatus.Late),
                MissedCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Missed),
                SkippedCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.SkippedByPatient)
            })
            .ToList();
    }

    public async Task<List<MedicationAdministrationPatientMedicationAdherenceDto>> GetAdministrationAdherenceBreakdownAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search)
    {
        var (normalizedFromUtc, normalizedToUtc) = NormalizeIranDateRangeUtc(from, to);

        var grouped = await BuildAdministrationReportQuery(normalizedFromUtc, normalizedToUtc, patientId, medicationId, shiftSlot, recordedByUserId, search)
            .Select(d => new
            {
                d.PatientMedication.CareRecipientId,
                PatientFirstName = d.PatientMedication.CareRecipient.FirstName,
                PatientLastName = d.PatientMedication.CareRecipient.LastName,
                MedicationId = d.PatientMedicationId,
                MedicationName = d.PatientMedication.Name,
                d.AdministrationOutcome,
                d.TimingStatus
            })
            .GroupBy(d => new
            {
                d.CareRecipientId,
                d.PatientFirstName,
                d.PatientLastName,
                d.MedicationId,
                d.MedicationName
            })
            .Select(g => new
            {
                g.Key.CareRecipientId,
                g.Key.PatientFirstName,
                g.Key.PatientLastName,
                g.Key.MedicationId,
                g.Key.MedicationName,
                TotalDoses = g.Count(),
                TakenCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Taken),
                OnTimeCount = g.Count(x => x.TimingStatus == MedicationTimingStatus.OnTime),
                LateCount = g.Count(x => x.TimingStatus == MedicationTimingStatus.Late),
                MissedCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Missed),
                SkippedCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.SkippedByPatient)
            })
            .OrderByDescending(x => x.MissedCount)
            .ThenByDescending(x => x.LateCount)
            .ThenBy(x => x.PatientFirstName)
            .ThenBy(x => x.MedicationName)
            .Take(500)
            .ToListAsync();

        return grouped.Select(x =>
        {
            var total = x.TotalDoses;
            var adherenceRate = total == 0 ? 0 : Math.Round((decimal)x.TakenCount / total * 100, 2);
            var onTimeRate = total == 0 ? 0 : Math.Round((decimal)x.OnTimeCount / total * 100, 2);

            return new MedicationAdministrationPatientMedicationAdherenceDto
            {
                CareRecipientId = x.CareRecipientId,
                PatientName = $"{x.PatientFirstName} {x.PatientLastName}".Trim(),
                MedicationId = x.MedicationId,
                MedicationName = x.MedicationName,
                TotalDoses = total,
                TakenCount = x.TakenCount,
                OnTimeCount = x.OnTimeCount,
                LateCount = x.LateCount,
                MissedCount = x.MissedCount,
                SkippedCount = x.SkippedCount,
                AdherenceRate = adherenceRate,
                OnTimeRate = onTimeRate
            };
        }).ToList();
    }

    public async Task<List<MedicationAdministrationStaffPerformanceDto>> GetAdministrationStaffPerformanceReportAsync(DateTime from, DateTime to, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search)
    {
        var (normalizedFromUtc, normalizedToUtc) = NormalizeIranDateRangeUtc(from, to);

        var baseQuery = BuildAdministrationReportQuery(normalizedFromUtc, normalizedToUtc, patientId, medicationId, shiftSlot, recordedByUserId, search)
            .Select(d => new
            {
                d.RecordedByUserId,
                RecordedFirstName = d.RecordedByUser != null ? d.RecordedByUser.FirstName : null,
                RecordedLastName = d.RecordedByUser != null ? d.RecordedByUser.LastName : null,
                d.VerifiedByUserId,
                VerifiedFirstName = d.VerifiedByUser != null ? d.VerifiedByUser.FirstName : null,
                VerifiedLastName = d.VerifiedByUser != null ? d.VerifiedByUser.LastName : null,
                d.CorrectedByUserId,
                CorrectedFirstName = d.CorrectedByUser != null ? d.CorrectedByUser.FirstName : null,
                CorrectedLastName = d.CorrectedByUser != null ? d.CorrectedByUser.LastName : null,
                d.TimingStatus,
                d.AdministrationOutcome
            });

        var recorded = await baseQuery
            .Where(x => x.RecordedByUserId != null)
            .GroupBy(x => new { x.RecordedByUserId, x.RecordedFirstName, x.RecordedLastName })
            .Select(g => new
            {
                UserId = g.Key.RecordedByUserId!,
                FirstName = g.Key.RecordedFirstName,
                LastName = g.Key.RecordedLastName,
                RecordedCount = g.Count(),
                LateCount = g.Count(x => x.TimingStatus == MedicationTimingStatus.Late),
                MissedCount = g.Count(x => x.AdministrationOutcome == MedicationAdministrationOutcome.Missed)
            })
            .ToListAsync();

        var verified = await baseQuery
            .Where(x => x.VerifiedByUserId != null)
            .GroupBy(x => new { x.VerifiedByUserId, x.VerifiedFirstName, x.VerifiedLastName })
            .Select(g => new
            {
                UserId = g.Key.VerifiedByUserId!,
                FirstName = g.Key.VerifiedFirstName,
                LastName = g.Key.VerifiedLastName,
                VerifiedCount = g.Count()
            })
            .ToListAsync();

        var corrected = await baseQuery
            .Where(x => x.CorrectedByUserId != null)
            .GroupBy(x => new { x.CorrectedByUserId, x.CorrectedFirstName, x.CorrectedLastName })
            .Select(g => new
            {
                UserId = g.Key.CorrectedByUserId!,
                FirstName = g.Key.CorrectedFirstName,
                LastName = g.Key.CorrectedLastName,
                CorrectedCount = g.Count()
            })
            .ToListAsync();

        var map = new Dictionary<string, MedicationAdministrationStaffPerformanceDto>(StringComparer.OrdinalIgnoreCase);

        void EnsureUser(string userId, string? firstName, string? lastName)
        {
            if (map.ContainsKey(userId))
            {
                return;
            }

            map[userId] = new MedicationAdministrationStaffPerformanceDto
            {
                UserId = userId,
                UserName = $"{firstName} {lastName}".Trim(),
                RecordedCount = 0,
                VerifiedCount = 0,
                CorrectedCount = 0,
                LateCount = 0,
                MissedCount = 0,
                TotalTouchedCount = 0
            };
        }

        foreach (var item in recorded)
        {
            EnsureUser(item.UserId, item.FirstName, item.LastName);
            map[item.UserId].RecordedCount = item.RecordedCount;
            map[item.UserId].LateCount = item.LateCount;
            map[item.UserId].MissedCount = item.MissedCount;
        }

        foreach (var item in verified)
        {
            EnsureUser(item.UserId, item.FirstName, item.LastName);
            map[item.UserId].VerifiedCount = item.VerifiedCount;
        }

        foreach (var item in corrected)
        {
            EnsureUser(item.UserId, item.FirstName, item.LastName);
            map[item.UserId].CorrectedCount = item.CorrectedCount;
        }

        foreach (var kv in map)
        {
            kv.Value.TotalTouchedCount = kv.Value.RecordedCount + kv.Value.VerifiedCount + kv.Value.CorrectedCount;
        }

        return map.Values
            .OrderByDescending(x => x.MissedCount)
            .ThenByDescending(x => x.LateCount)
            .ThenByDescending(x => x.TotalTouchedCount)
            .ThenBy(x => x.UserName)
            .Take(200)
            .ToList();
    }

    public async Task<int?> GetDoseCareRecipientIdAsync(int doseId)
    {
        return await _context.MedicationDoses
            .Where(d => d.Id == doseId)
            .Select(d => (int?)d.PatientMedication.CareRecipientId)
            .FirstOrDefaultAsync();
    }

    public async Task RecordDoseAsync(int doseId, RecordDoseDto dto, string userId, bool preventBeforeScheduledTime)
    {
        if (preventBeforeScheduledTime)
        {
            if (dto.Status == DoseStatus.Taken)
            {
                await ConfirmDoseByPatientAsync(doseId, new PatientConfirmMedicationDoseDto
                {
                    ActualAdministrationAt = dto.TakenAt,
                    Notes = dto.Notes,
                    PatientComment = dto.Notes
                }, userId);
            }
            else
            {
                await SkipDoseByPatientAsync(doseId, new PatientSkipMedicationDoseDto
                {
                    Reason = string.IsNullOrWhiteSpace(dto.MissedReason) ? "توسط بیمار ثبت نشد" : dto.MissedReason,
                    Notes = dto.Notes,
                    PatientComment = dto.Notes
                }, userId);
            }

            return;
        }

        var outcome = dto.Status switch
        {
            DoseStatus.Taken => MedicationAdministrationOutcome.Taken,
            DoseStatus.Missed => MedicationAdministrationOutcome.Missed,
            DoseStatus.Skipped => MedicationAdministrationOutcome.SkippedByPatient,
            _ => MedicationAdministrationOutcome.Unknown
        };

        await RecordDoseByNurseAsync(doseId, new NurseRecordMedicationDoseDto
        {
            Outcome = outcome,
            ActualAdministrationAt = dto.Status == DoseStatus.Taken ? dto.TakenAt : null,
            Notes = dto.Notes,
            ClinicalNotes = dto.Notes,
            MissedReason = dto.MissedReason,
            SideEffectSeverity = dto.SideEffectSeverity,
            SideEffectDescription = dto.SideEffectDescription,
            AttachmentPath = dto.AttachmentPath
        }, userId, isAdminLike: false);
    }

    public async Task<MedicationDoseDto> ConfirmDoseByPatientAsync(int doseId, PatientConfirmMedicationDoseDto dto, string userId)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        await _patientSelfServiceAccessService.EnsureMedicationDoseConfirmationAllowedAsync(
            userId,
            dose.PatientMedication.CareRecipientId);

        EnsureDoseCanBeSelfConfirmed(dose);
        EnsureDoseSnapshots(dose);

        var actualAdministrationAt = NormalizeUtc(dto.ActualAdministrationAt ?? DateTime.UtcNow);
        var patientConfirmationSettings = await _medicationAlertSettingsService.GetSettingsEntityAsync();
        EnsureWithinPatientConfirmationWindow(dose, actualAdministrationAt, patientConfirmationSettings.AllowEarlyConfirmationMinutes, patientConfirmationSettings.AllowLateConfirmationMinutes);

        var previousStatus = CaptureSnapshot(dose);
        var timingStatus = CalculateTimingStatus(dose.ScheduledTime, actualAdministrationAt, MedicationAdministrationOutcome.Taken);
        var nextStatus = MapLegacyDoseStatus(MedicationAdministrationOutcome.Taken, timingStatus);

        ApplyAdministrationState(
            dose,
            MedicationAdministrationOutcome.Taken,
            timingStatus,
            MedicationVerificationStatus.Pending,
            MedicationAdministrationSourceType.Patient,
            actualAdministrationAt,
            userId,
            notes: dto.Notes,
            clinicalNotes: null,
            patientComment: dto.PatientComment,
            missedReason: null,
            correctionReason: null,
            attachmentPath: null,
            sideEffectSeverity: dose.SideEffectSeverity,
            sideEffectDescription: dose.SideEffectDescription,
            nextStatus: nextStatus,
            updatedByUserId: userId);

        await ApplyDoseInventoryImpactAsync(dose, dose.PatientMedication, previousStatus.Status, nextStatus, userId);
        await AddDoseHistoryAsync(dose, previousStatus, "PatientConfirmed", userId, MedicationAdministrationSourceType.Patient, dto.PatientComment, dto.Notes);
        AddDoseAuditLog(dose.Id, userId, "MedicationDose:PatientConfirmed", new
        {
            actualAdministrationAt,
            timingStatus,
            verificationStatus = MedicationVerificationStatus.Pending
        });

        await EvaluateLowStockAlertAsync(dose.PatientMedication);
        await _context.SaveChangesAsync();
        return MapToDoseDto(dose);
    }

    public async Task<MedicationDoseDto> SkipDoseByPatientAsync(int doseId, PatientSkipMedicationDoseDto dto, string userId)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
            userId,
            dose.PatientMedication.CareRecipientId,
            PatientSelfServiceFeatures.MedicationKardex);

        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            throw new InvalidOperationException("علت عدم مصرف باید ثبت شود.");
        }

        EnsureDoseCanBeSelfConfirmed(dose);
        EnsureDoseSnapshots(dose);
        var patientConfirmationSettings = await _medicationAlertSettingsService.GetSettingsEntityAsync();
        EnsureWithinPatientConfirmationWindow(dose, DateTime.UtcNow, patientConfirmationSettings.AllowEarlyConfirmationMinutes, patientConfirmationSettings.AllowLateConfirmationMinutes);

        var previousStatus = CaptureSnapshot(dose);
        var nextStatus = MapLegacyDoseStatus(MedicationAdministrationOutcome.SkippedByPatient, MedicationTimingStatus.Unknown);

        ApplyAdministrationState(
            dose,
            MedicationAdministrationOutcome.SkippedByPatient,
            MedicationTimingStatus.Unknown,
            MedicationVerificationStatus.Pending,
            MedicationAdministrationSourceType.Patient,
            actualAdministrationAt: null,
            recordedByUserId: userId,
            notes: dto.Notes,
            clinicalNotes: null,
            patientComment: dto.PatientComment,
            missedReason: dto.Reason,
            correctionReason: null,
            attachmentPath: null,
            sideEffectSeverity: dose.SideEffectSeverity,
            sideEffectDescription: dose.SideEffectDescription,
            nextStatus: nextStatus,
            updatedByUserId: userId);

        await ApplyDoseInventoryImpactAsync(dose, dose.PatientMedication, previousStatus.Status, nextStatus, userId);
        await AddDoseHistoryAsync(dose, previousStatus, "PatientSkipped", userId, MedicationAdministrationSourceType.Patient, dto.Reason, dto.Notes);
        AddDoseAuditLog(dose.Id, userId, "MedicationDose:PatientSkipped", new
        {
            reason = dto.Reason
        });

        await EvaluateLowStockAlertAsync(dose.PatientMedication);
        await _context.SaveChangesAsync();
        return MapToDoseDto(dose);
    }

    public async Task<MedicationDoseDto> RecordDoseByNurseAsync(int doseId, NurseRecordMedicationDoseDto dto, string userId, bool isAdminLike)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        EnsureDoseSnapshots(dose);

        var actualAdministrationAt = dto.Outcome == MedicationAdministrationOutcome.Taken
            ? NormalizeUtc(dto.ActualAdministrationAt ?? DateTime.UtcNow)
            : (DateTime?)null;
        var timingStatus = dto.Outcome switch
        {
            MedicationAdministrationOutcome.Taken => CalculateTimingStatus(dose.ScheduledTime, actualAdministrationAt!.Value, dto.Outcome),
            MedicationAdministrationOutcome.Missed => MedicationTimingStatus.Missed,
            _ => MedicationTimingStatus.Unknown
        };
        var verificationStatus = isAdminLike
            ? MedicationVerificationStatus.CorrectedByAdmin
            : MedicationVerificationStatus.ConfirmedByNurse;
        var sourceType = isAdminLike
            ? MedicationAdministrationSourceType.Admin
            : MedicationAdministrationSourceType.Nurse;
        var nextStatus = MapLegacyDoseStatus(dto.Outcome, timingStatus);
        var previousStatus = CaptureSnapshot(dose);

        ApplyAdministrationState(
            dose,
            dto.Outcome,
            timingStatus,
            verificationStatus,
            sourceType,
            actualAdministrationAt,
            userId,
            notes: dto.Notes,
            clinicalNotes: dto.ClinicalNotes,
            patientComment: dto.PatientComment,
            missedReason: dto.MissedReason,
            correctionReason: isAdminLike ? "ثبت مستقیم توسط مدیر/ادمین" : null,
            attachmentPath: dto.AttachmentPath,
            sideEffectSeverity: dto.SideEffectSeverity,
            sideEffectDescription: dto.SideEffectDescription,
            nextStatus: nextStatus,
            updatedByUserId: userId);

        await ApplyDoseInventoryImpactAsync(dose, dose.PatientMedication, previousStatus.Status, nextStatus, userId);
        await AddDoseHistoryAsync(dose, previousStatus, isAdminLike ? "AdminRecorded" : "NurseRecorded", userId, sourceType, dto.MissedReason, dto.ClinicalNotes ?? dto.Notes);
        AddDoseAuditLog(dose.Id, userId, isAdminLike ? "MedicationDose:AdminRecorded" : "MedicationDose:NurseRecorded", new
        {
            dto.Outcome,
            timingStatus,
            verificationStatus
        });

        await EvaluateLowStockAlertAsync(dose.PatientMedication);
        await _context.SaveChangesAsync();
        return MapToDoseDto(dose);
    }

    public async Task<MedicationDoseDto> ReviewDoseAsync(int doseId, ReviewMedicationDoseDto dto, string userId, bool isAdminLike)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        EnsureDoseSnapshots(dose);

        var previousStatus = CaptureSnapshot(dose);

        if (dto.Approve)
        {
            dose.VerificationStatus = isAdminLike
                ? MedicationVerificationStatus.CorrectedByAdmin
                : MedicationVerificationStatus.ConfirmedByNurse;
            dose.VerifiedByUserId = userId;
            if (isAdminLike)
            {
                dose.CorrectedByUserId = userId;
            }

            dose.ClinicalNotes = string.IsNullOrWhiteSpace(dto.ClinicalNotes) ? dose.ClinicalNotes : dto.ClinicalNotes.Trim();
            dose.UpdatedAt = DateTime.UtcNow;

            await AddDoseHistoryAsync(dose, previousStatus, isAdminLike ? "AdminApproved" : "NurseApproved", userId, isAdminLike ? MedicationAdministrationSourceType.Admin : MedicationAdministrationSourceType.Nurse, dto.Reason, dto.ClinicalNotes);
            AddDoseAuditLog(dose.Id, userId, "MedicationDose:Approved", new
            {
                approved = true,
                verificationStatus = dose.VerificationStatus
            });
        }
        else
        {
            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                throw new InvalidOperationException("برای رد تایید بیمار، ثبت دلیل الزامی است.");
            }

            await ApplyDoseInventoryImpactAsync(dose, dose.PatientMedication, previousStatus.Status, DoseStatus.Scheduled, userId);
            ResetDoseState(dose, preserveSnapshots: true);
            dose.VerificationStatus = MedicationVerificationStatus.RejectedByNurse;
            dose.VerifiedByUserId = userId;
            dose.ClinicalNotes = string.IsNullOrWhiteSpace(dto.ClinicalNotes) ? dose.ClinicalNotes : dto.ClinicalNotes.Trim();
            dose.MissedReason = dto.Reason.Trim();
            dose.UpdatedAt = DateTime.UtcNow;

            await AddDoseHistoryAsync(dose, previousStatus, "PatientReportRejected", userId, isAdminLike ? MedicationAdministrationSourceType.Admin : MedicationAdministrationSourceType.Nurse, dto.Reason, dto.ClinicalNotes);
            AddDoseAuditLog(dose.Id, userId, "MedicationDose:Rejected", new
            {
                approved = false,
                reason = dto.Reason
            });
        }

        await EvaluateLowStockAlertAsync(dose.PatientMedication);
        await _context.SaveChangesAsync();
        return MapToDoseDto(dose);
    }

    public async Task<MedicationDoseDto> CorrectDoseAsync(int doseId, CorrectMedicationDoseDto dto, string userId)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        if (string.IsNullOrWhiteSpace(dto.CorrectionReason))
        {
            throw new InvalidOperationException("دلیل اصلاح توسط ادمین الزامی است.");
        }

        EnsureDoseSnapshots(dose);

        var previousStatus = CaptureSnapshot(dose);
        var actualAdministrationAt = dto.Outcome == MedicationAdministrationOutcome.Taken
            ? NormalizeUtc(dto.ActualAdministrationAt ?? DateTime.UtcNow)
            : (DateTime?)null;
        var timingStatus = dto.Outcome switch
        {
            MedicationAdministrationOutcome.Taken => CalculateTimingStatus(dose.ScheduledTime, actualAdministrationAt!.Value, dto.Outcome),
            MedicationAdministrationOutcome.Missed => MedicationTimingStatus.Missed,
            _ => MedicationTimingStatus.Unknown
        };
        var nextStatus = MapLegacyDoseStatus(dto.Outcome, timingStatus);

        ApplyAdministrationState(
            dose,
            dto.Outcome,
            timingStatus,
            MedicationVerificationStatus.CorrectedByAdmin,
            MedicationAdministrationSourceType.Admin,
            actualAdministrationAt,
            userId,
            notes: dto.Notes,
            clinicalNotes: dto.ClinicalNotes,
            patientComment: dto.PatientComment,
            missedReason: dto.MissedReason,
            correctionReason: dto.CorrectionReason,
            attachmentPath: dto.AttachmentPath,
            sideEffectSeverity: dto.SideEffectSeverity,
            sideEffectDescription: dto.SideEffectDescription,
            nextStatus: nextStatus,
            updatedByUserId: userId);

        await ApplyDoseInventoryImpactAsync(dose, dose.PatientMedication, previousStatus.Status, nextStatus, userId);
        await AddDoseHistoryAsync(dose, previousStatus, "AdminCorrected", userId, MedicationAdministrationSourceType.Admin, dto.CorrectionReason, dto.ClinicalNotes ?? dto.Notes);
        AddDoseAuditLog(dose.Id, userId, "MedicationDose:Corrected", new
        {
            dto.Outcome,
            timingStatus,
            dto.CorrectionReason
        });

        await EvaluateLowStockAlertAsync(dose.PatientMedication);
        await _context.SaveChangesAsync();
        return MapToDoseDto(dose);
    }

    public async Task ResetDoseAsync(int doseId, string userId)
    {
        var dose = await GetDoseForRecordingAsync(doseId);
        if (dose == null) throw new KeyNotFoundException("Dose not found");

        await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
            userId,
            dose.PatientMedication.CareRecipientId,
            PatientSelfServiceFeatures.MedicationKardex);

        var previousStatus = CaptureSnapshot(dose);
        await ApplyDoseInventoryImpactAsync(dose, dose.PatientMedication, previousStatus.Status, DoseStatus.Scheduled, userId);

        ResetDoseState(dose, preserveSnapshots: true);
        dose.UpdatedAt = DateTime.UtcNow;

        await AddDoseHistoryAsync(dose, previousStatus, "MedicationReset", userId, MedicationAdministrationSourceType.Admin, "بازگردانی ثبت دوز", null);
        AddDoseAuditLog(doseId, userId, "MedicationDose:Reset", new
        {
            fromStatus = previousStatus.Status,
            toStatus = DoseStatus.Scheduled
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
        var tz = GetIranTimeZone();
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
            var scheduledUtc = DateTime.SpecifyKind(dose.ScheduledTime, DateTimeKind.Utc);
            var scheduledLocal = TimeZoneInfo.ConvertTimeFromUtc(scheduledUtc, tz);
            var message = $"Reminder: Time to take {med.Name} {med.Dosage} ({med.Route}) at {scheduledLocal:HH:mm}.";

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
        var tz = GetIranTimeZone();
        var staffUserIds = await GetAdminUserIdsAsync();
        var missedDoseConfig = await _notificationSettingsService.GetEventConfigurationAsync(NotificationEventKeys.MedicationMissedDose);
        var missedDoseRoleRecipients = await _notificationSettingsService.GetRoleRecipientsAsync(NotificationEventKeys.MedicationMissedDose);

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
            var scheduledUtc = DateTime.SpecifyKind(dose.ScheduledTime, DateTimeKind.Utc);
            EnsureDoseSnapshots(dose);
            var graceTime = dose.AllowedConfirmationUntil ?? scheduledUtc.AddMinutes(dose.AdministrationWindowMinutesSnapshot);
            var recipientIds = new List<string>();

            if (now > graceTime && dose.Status == DoseStatus.Scheduled)
            {
                var previousStatus = CaptureSnapshot(dose);
                ApplyAdministrationState(
                    dose,
                    MedicationAdministrationOutcome.Missed,
                    MedicationTimingStatus.Missed,
                    MedicationVerificationStatus.Pending,
                    MedicationAdministrationSourceType.System,
                    actualAdministrationAt: null,
                    recordedByUserId: null,
                    notes: "به‌صورت خودکار به‌عنوان مصرف‌نشده ثبت شد.",
                    clinicalNotes: null,
                    patientComment: null,
                    missedReason: "عدم ثبت در بازه مجاز",
                    correctionReason: null,
                    attachmentPath: null,
                    sideEffectSeverity: dose.SideEffectSeverity,
                    sideEffectDescription: dose.SideEffectDescription,
                    nextStatus: DoseStatus.Missed,
                    updatedByUserId: null);

                await AddDoseHistoryAsync(dose, previousStatus, "AutoMarkedMissed", null, MedicationAdministrationSourceType.System, "عدم ثبت در بازه مجاز", null);
                AddDoseAuditLog(dose.Id, null, "MedicationDose:AutoMarkedMissed", new
                {
                    allowedUntil = graceTime
                });
            }

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
            var scheduledLocal = TimeZoneInfo.ConvertTimeFromUtc(scheduledUtc, tz);
            var message = $"{patientName}: مصرف {med.Name} ساعت {scheduledLocal:HH:mm} ثبت نشده است.";
            var link = $"/dashboard/patients/{careRecipient.Id}?tab=medications&doseId={dose.Id}";
            var severity = med.Criticality >= MedicationCriticality.HighAlert ? "Critical" : "Warning";

            recipientIds = new List<string?>
            {
                careRecipient.UserId,
                careRecipient.ResponsibleNurseId
            }
            .Concat(assignedPrimaryCaregiverIds)
            .Concat(staffUserIds)
            .Concat(missedDoseRoleRecipients.Select(x => x.UserId))
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
                        severity: severity,
                        context: new NotificationSendContext
                        {
                            EventKey = NotificationEventKeys.MedicationMissedDose,
                            EventDisplayName = missedDoseConfig.DisplayName,
                            RecipientUserId = recipientId,
                            PatientId = careRecipient.Id,
                            ReferenceId = dose.Id.ToString(),
                            Severity = severity,
                            Link = link
                        });
                }
            }

            if (now > graceTime && dose.EscalationLevel == DoseEscalationLevel.None)
            {
                if (med.NotifyNurse && med.CareRecipient.ResponsibleNurse != null && !string.IsNullOrEmpty(med.CareRecipient.ResponsibleNurse.Email))
                {
                    try
                    {
                        var escalationMessage = $"MISSED DOSE ALERT: Patient {med.CareRecipient.FirstName} {med.CareRecipient.LastName} missed {med.Name} scheduled at {scheduledLocal:HH:mm}.";
                        await _notificationService.SendEmailAsync(med.CareRecipient.ResponsibleNurse.Email, "URGENT: Missed Medication", escalationMessage, new NotificationSendContext
                        {
                            EventKey = NotificationEventKeys.MedicationMissedDose,
                            EventDisplayName = missedDoseConfig.DisplayName,
                            RecipientUserId = med.CareRecipient.ResponsibleNurseId,
                            PatientId = careRecipient.Id,
                            ReferenceId = dose.Id.ToString(),
                            Severity = severity,
                            Link = link
                        });
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
                            $"Supervisor Alert: Patient {med.CareRecipient.FirstName} missed {med.Name}. Nurse was notified 30 mins ago.",
                            new NotificationSendContext
                            {
                                EventKey = NotificationEventKeys.MedicationMissedDose,
                                EventDisplayName = missedDoseConfig.DisplayName,
                                PatientId = careRecipient.Id,
                                ReferenceId = dose.Id.ToString(),
                                Severity = severity,
                                Link = link
                            });
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
                            $"Alert: {med.CareRecipient.FirstName} has missed their medication {med.Name}. Staff has been alerted.",
                            new NotificationSendContext
                            {
                                EventKey = NotificationEventKeys.MedicationMissedDose,
                                EventDisplayName = missedDoseConfig.DisplayName,
                                RecipientUserId = careRecipient.FamilyMemberId,
                                PatientId = careRecipient.Id,
                                ReferenceId = dose.Id.ToString(),
                                Severity = severity,
                                Link = link
                            });
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

        var tz = GetIranTimeZone();
        var fromUtc = DateTime.SpecifyKind(from, DateTimeKind.Utc);
        var toUtc = DateTime.SpecifyKind(to, DateTimeKind.Utc);
        var fromLocalDate = TimeZoneInfo.ConvertTimeFromUtc(fromUtc, tz).Date;
        var toLocalDate = TimeZoneInfo.ConvertTimeFromUtc(toUtc, tz).Date;

        for (var day = fromLocalDate; day <= toLocalDate; day = day.AddDays(1))
        {
            var startLocal = new DateTime(day.Year, day.Month, day.Day, 0, 0, 0, DateTimeKind.Unspecified);
            var startUtc = TimeZoneInfo.ConvertTimeToUtc(startLocal, tz);
            await GenerateDosesForMedicationAsync(medication, startUtc, startUtc);
        }

        await _context.SaveChangesAsync();
    }

    private async Task GenerateDosesForMedicationAsync(PatientMedication med, DateTime fromDate, DateTime toDate)
    {
        var times = new List<TimeSpan>();
        var tz = GetIranTimeZone();

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
            var fromUtc = DateTime.SpecifyKind(fromDate, DateTimeKind.Utc);
            var localDate = TimeZoneInfo.ConvertTimeFromUtc(fromUtc, tz).Date;
            var startLocalDate = med.StartDate.Date;
            var endLocalDate = med.EndDate?.Date;
            if (localDate < startLocalDate)
            {
                continue;
            }
            if (endLocalDate.HasValue && localDate > endLocalDate.Value)
            {
                continue;
            }

            var localScheduledTime = localDate.Add(time);
            var scheduledTime = TimeZoneInfo.ConvertTimeToUtc(localScheduledTime, tz);

            var exists = await _context.MedicationDoses
                .AnyAsync(d => d.PatientMedicationId == med.Id && d.ScheduledTime == scheduledTime);

            if (!exists)
            {
                var windowMinutes = GetAdministrationWindowMinutes(med);
                _context.MedicationDoses.Add(new MedicationDose
                {
                    PatientMedicationId = med.Id,
                    ScheduledTime = scheduledTime,
                    AllowedConfirmationUntil = scheduledTime.AddMinutes(windowMinutes),
                    AdministrationWindowMinutesSnapshot = windowMinutes,
                    ScheduledShiftSlot = ResolveShiftSlot(scheduledTime),
                    Status = DoseStatus.Scheduled,
                    AdministrationOutcome = MedicationAdministrationOutcome.Unknown,
                    TimingStatus = MedicationTimingStatus.Unknown,
                    VerificationStatus = MedicationVerificationStatus.Pending,
                    SourceType = MedicationAdministrationSourceType.System,
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
            .Include(d => d.TakenByUser)
            .Include(d => d.RecordedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.CorrectedByUser)
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
            var tz = GetIranTimeZone();
            var scheduledUtc = DateTime.SpecifyKind(dose.ScheduledTime, DateTimeKind.Utc);
            var scheduledLocal = TimeZoneInfo.ConvertTimeFromUtc(scheduledUtc, tz);

            await CreateInventoryTransactionAsync(
                medication,
                MedicationInventoryTransactionType.DoseConsumption,
                -quantityToDeduct,
                before,
                medication.TotalQuantity,
                $"مصرف دوز ساعت {scheduledLocal:yyyy-MM-dd HH:mm}",
                userId);
        }
        else if (previousStatus == DoseStatus.Taken && newStatus != DoseStatus.Taken && dose.AppliedInventoryQuantity > 0)
        {
            var before = medication.TotalQuantity;
            medication.TotalQuantity += dose.AppliedInventoryQuantity;
            var tz = GetIranTimeZone();
            var scheduledUtc = DateTime.SpecifyKind(dose.ScheduledTime, DateTimeKind.Utc);
            var scheduledLocal = TimeZoneInfo.ConvertTimeFromUtc(scheduledUtc, tz);

            await CreateInventoryTransactionAsync(
                medication,
                MedicationInventoryTransactionType.StockReturn,
                dose.AppliedInventoryQuantity,
                before,
                medication.TotalQuantity,
                $"برگشت موجودی دوز ساعت {scheduledLocal:yyyy-MM-dd HH:mm}",
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

    private static int GetAdministrationWindowMinutes(PatientMedication medication)
    {
        return Math.Max(1, medication.GracePeriodMinutes);
    }

    private static ShiftSlot ResolveShiftSlot(DateTime scheduledTimeUtc)
    {
        var tz = GetIranTimeZone();
        var localHour = TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(scheduledTimeUtc, DateTimeKind.Utc), tz).Hour;

        if (localHour >= 6 && localHour < 14)
        {
            return ShiftSlot.Morning;
        }

        if (localHour >= 14 && localHour < 22)
        {
            return ShiftSlot.Evening;
        }

        return ShiftSlot.Night;
    }

    private static DateTime NormalizeUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }

    private static MedicationTimingStatus CalculateTimingStatus(DateTime scheduledTime, DateTime actualAdministrationAt, MedicationAdministrationOutcome outcome)
    {
        if (outcome == MedicationAdministrationOutcome.Missed)
        {
            return MedicationTimingStatus.Missed;
        }

        if (outcome != MedicationAdministrationOutcome.Taken)
        {
            return MedicationTimingStatus.Unknown;
        }

        return NormalizeUtc(actualAdministrationAt) <= NormalizeUtc(scheduledTime)
            ? MedicationTimingStatus.OnTime
            : MedicationTimingStatus.Late;
    }

    private static DoseStatus MapLegacyDoseStatus(MedicationAdministrationOutcome outcome, MedicationTimingStatus timingStatus)
    {
        return outcome switch
        {
            MedicationAdministrationOutcome.Taken when timingStatus == MedicationTimingStatus.Late => DoseStatus.Late,
            MedicationAdministrationOutcome.Taken => DoseStatus.Taken,
            MedicationAdministrationOutcome.Missed => DoseStatus.Missed,
            MedicationAdministrationOutcome.SkippedByPatient => DoseStatus.Skipped,
            _ => DoseStatus.Scheduled
        };
    }

    private static void EnsureWithinPatientConfirmationWindow(
        MedicationDose dose,
        DateTime actualAdministrationAt,
        int allowEarlyConfirmationMinutes,
        int allowLateConfirmationMinutes)
    {
        var scheduledUtc = NormalizeUtc(dose.ScheduledTime);
        var actualUtc = NormalizeUtc(actualAdministrationAt);
        var effectiveEarlyMinutes = Math.Max(0, allowEarlyConfirmationMinutes);
        var effectiveLateMinutes = Math.Max(1, allowLateConfirmationMinutes);
        var earliestAllowedUtc = scheduledUtc.AddMinutes(-effectiveEarlyMinutes);
        var latestAllowedUtc = scheduledUtc.AddMinutes(effectiveLateMinutes);
        var tz = GetIranTimeZone();
        var scheduledLocal = TimeZoneInfo.ConvertTimeFromUtc(scheduledUtc, tz);

        if (actualUtc < earliestAllowedUtc)
        {
            var earliestAllowedLocal = TimeZoneInfo.ConvertTimeFromUtc(earliestAllowedUtc, tz);
            throw new InvalidOperationException(
                $"ثبت مصرف این دارو فقط از {earliestAllowedLocal:HH:mm} مجاز است. زمان برنامه‌ریزی‌شده: {scheduledLocal:HH:mm}");
        }

        if (actualUtc > latestAllowedUtc)
        {
            var latestAllowedLocal = TimeZoneInfo.ConvertTimeFromUtc(latestAllowedUtc, tz);
            throw new InvalidOperationException(
                $"مهلت ثبت مصرف این دارو تا {latestAllowedLocal:HH:mm} بوده و به پایان رسیده است.");
        }
    }

    private static void EnsureDoseCanBeSelfConfirmed(MedicationDose dose)
    {
        if (dose.Status != DoseStatus.Scheduled && dose.VerificationStatus != MedicationVerificationStatus.RejectedByNurse)
        {
            throw new InvalidOperationException("برای این نوبت قبلاً ثبت مصرف انجام شده است.");
        }
    }

    private static void EnsureDoseSnapshots(MedicationDose dose)
    {
        if (dose.AdministrationWindowMinutesSnapshot <= 0)
        {
            dose.AdministrationWindowMinutesSnapshot = GetAdministrationWindowMinutes(dose.PatientMedication);
        }

        if (!dose.AllowedConfirmationUntil.HasValue)
        {
            dose.AllowedConfirmationUntil = NormalizeUtc(dose.ScheduledTime).AddMinutes(dose.AdministrationWindowMinutesSnapshot);
        }

        if (dose.ScheduledShiftSlot == ShiftSlot.None)
        {
            dose.ScheduledShiftSlot = ResolveShiftSlot(dose.ScheduledTime);
        }
    }

    private static DoseStateSnapshot CaptureSnapshot(MedicationDose dose)
    {
        return new DoseStateSnapshot(
            dose.Status,
            dose.AdministrationOutcome,
            dose.TimingStatus,
            dose.VerificationStatus);
    }

    private static void ApplyAdministrationState(
        MedicationDose dose,
        MedicationAdministrationOutcome outcome,
        MedicationTimingStatus timingStatus,
        MedicationVerificationStatus verificationStatus,
        MedicationAdministrationSourceType sourceType,
        DateTime? actualAdministrationAt,
        string? recordedByUserId,
        string? notes,
        string? clinicalNotes,
        string? patientComment,
        string? missedReason,
        string? correctionReason,
        string? attachmentPath,
        SideEffectSeverity sideEffectSeverity,
        string? sideEffectDescription,
        DoseStatus nextStatus,
        string? updatedByUserId)
    {
        var normalizedActualAdministrationAt = actualAdministrationAt.HasValue ? NormalizeUtc(actualAdministrationAt.Value) : (DateTime?)null;

        dose.Status = nextStatus;
        dose.AdministrationOutcome = outcome;
        dose.TimingStatus = timingStatus;
        dose.VerificationStatus = verificationStatus;
        dose.SourceType = sourceType;
        dose.ActualAdministrationAt = normalizedActualAdministrationAt;
        dose.TakenAt = normalizedActualAdministrationAt;
        dose.DelayMinutes = normalizedActualAdministrationAt.HasValue
            ? (int)Math.Max(0, Math.Round((normalizedActualAdministrationAt.Value - NormalizeUtc(dose.ScheduledTime)).TotalMinutes))
            : null;
        dose.RecordedByUserId = recordedByUserId;
        dose.TakenByUserId = outcome == MedicationAdministrationOutcome.Taken ? recordedByUserId : null;
        dose.VerifiedByUserId = verificationStatus is MedicationVerificationStatus.ConfirmedByNurse or MedicationVerificationStatus.RejectedByNurse
            ? updatedByUserId
            : dose.VerifiedByUserId;
        dose.CorrectedByUserId = verificationStatus == MedicationVerificationStatus.CorrectedByAdmin
            ? updatedByUserId
            : dose.CorrectedByUserId;
        dose.Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        dose.ClinicalNotes = string.IsNullOrWhiteSpace(clinicalNotes) ? null : clinicalNotes.Trim();
        dose.PatientComment = string.IsNullOrWhiteSpace(patientComment) ? null : patientComment.Trim();
        dose.MissedReason = string.IsNullOrWhiteSpace(missedReason) ? null : missedReason.Trim();
        dose.CorrectionReason = string.IsNullOrWhiteSpace(correctionReason) ? null : correctionReason.Trim();
        dose.AttachmentPath = string.IsNullOrWhiteSpace(attachmentPath) ? null : attachmentPath.Trim();
        dose.SideEffectSeverity = sideEffectSeverity;
        dose.SideEffectDescription = string.IsNullOrWhiteSpace(sideEffectDescription) ? null : sideEffectDescription.Trim();
        dose.RecordedShiftSlot = normalizedActualAdministrationAt.HasValue ? ResolveShiftSlot(normalizedActualAdministrationAt.Value) : ShiftSlot.None;
        dose.UpdatedAt = DateTime.UtcNow;
        dose.EscalationLevel = outcome == MedicationAdministrationOutcome.Missed ? dose.EscalationLevel : DoseEscalationLevel.None;
        dose.LastEscalationTime = outcome == MedicationAdministrationOutcome.Missed ? dose.LastEscalationTime : null;
    }

    private static void ResetDoseState(MedicationDose dose, bool preserveSnapshots)
    {
        dose.Status = DoseStatus.Scheduled;
        dose.AdministrationOutcome = MedicationAdministrationOutcome.Unknown;
        dose.TimingStatus = MedicationTimingStatus.Unknown;
        dose.VerificationStatus = MedicationVerificationStatus.Pending;
        dose.SourceType = MedicationAdministrationSourceType.Unknown;
        dose.ActualAdministrationAt = null;
        dose.TakenAt = null;
        dose.DelayMinutes = null;
        dose.TakenByUserId = null;
        dose.RecordedByUserId = null;
        dose.VerifiedByUserId = null;
        dose.CorrectedByUserId = null;
        dose.Notes = null;
        dose.ClinicalNotes = null;
        dose.PatientComment = null;
        dose.MissedReason = null;
        dose.CorrectionReason = null;
        dose.SideEffectSeverity = SideEffectSeverity.None;
        dose.SideEffectDescription = null;
        dose.AttachmentPath = null;
        dose.EscalationLevel = DoseEscalationLevel.None;
        dose.LastEscalationTime = null;
        dose.RecordedShiftSlot = ShiftSlot.None;

        if (!preserveSnapshots)
        {
            dose.AllowedConfirmationUntil = null;
            dose.AdministrationWindowMinutesSnapshot = 0;
            dose.ScheduledShiftSlot = ShiftSlot.None;
        }
    }

    private async Task AddDoseHistoryAsync(
        MedicationDose dose,
        DoseStateSnapshot previousState,
        string action,
        string? changedByUserId,
        MedicationAdministrationSourceType sourceType,
        string? reason,
        string? notes)
    {
        _context.MedicationDoseStatusHistories.Add(new MedicationDoseStatusHistory
        {
            MedicationDoseId = dose.Id,
            FromStatus = previousState.Status,
            ToStatus = dose.Status,
            FromAdministrationOutcome = previousState.AdministrationOutcome,
            ToAdministrationOutcome = dose.AdministrationOutcome,
            FromTimingStatus = previousState.TimingStatus,
            ToTimingStatus = dose.TimingStatus,
            FromVerificationStatus = previousState.VerificationStatus,
            ToVerificationStatus = dose.VerificationStatus,
            SourceType = sourceType,
            Action = action,
            Reason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim(),
            Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim(),
            MetadataJson = JsonSerializer.Serialize(new
            {
                dose.DelayMinutes,
                dose.RecordedShiftSlot,
                dose.ScheduledShiftSlot,
                dose.SourceType
            }),
            ChangedByUserId = changedByUserId,
            ChangedAtUtc = DateTime.UtcNow
        });

        await Task.CompletedTask;
    }

    private void AddDoseAuditLog(int doseId, string? userId, string action, object payload)
    {
        _context.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = "MedicationDose",
            EntityId = doseId.ToString(),
            CreatedAt = DateTime.UtcNow,
            Details = JsonSerializer.Serialize(payload)
        });
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
                severity: "Warning",
                context: new NotificationSendContext
                {
                    EventKey = NotificationEventKeys.MedicationLowStock,
                    EventDisplayName = "هشدار موجودی دارو",
                    RecipientUserId = recipient.UserId,
                    PatientId = medication.CareRecipientId,
                    ReferenceId = medication.Id.ToString(),
                    Severity = "Warning",
                    Link = link
                });

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
            await _notificationService.SendSmsAsync(recipient.PhoneNumber!, message, new NotificationSendContext
            {
                EventKey = NotificationEventKeys.MedicationLowStock,
                EventDisplayName = "هشدار موجودی دارو",
                RecipientUserId = recipient.UserId,
                PatientId = medication.CareRecipientId,
                ReferenceId = medication.Id.ToString(),
                Severity = "Warning"
            });
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
            await _notificationService.SendEmailAsync(recipient.Email!, subject, body, new NotificationSendContext
            {
                EventKey = NotificationEventKeys.MedicationLowStock,
                EventDisplayName = "هشدار موجودی دارو",
                RecipientUserId = recipient.UserId,
                PatientId = medication.CareRecipientId,
                ReferenceId = medication.Id.ToString(),
                Severity = "Warning"
            });
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
        var eventConfig = await _notificationSettingsService.GetEventConfigurationAsync(NotificationEventKeys.MedicationLowStock);
        var roleRecipients = await _notificationSettingsService.GetRoleRecipientsAsync(NotificationEventKeys.MedicationLowStock);

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

        recipients.AddRange(roleRecipients.Select(extra => new AlertRecipient(
            MedicationAlertRecipientType.Admin,
            string.IsNullOrWhiteSpace(extra.DisplayName) ? extra.UserId : extra.DisplayName,
            extra.UserId,
            extra.PhoneNumber,
            extra.Email)));

        recipients.AddRange(eventConfig.AdditionalPhones
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => new AlertRecipient(
                MedicationAlertRecipientType.CustomPhone,
                x,
                null,
                x,
                null)));

        recipients.AddRange(eventConfig.AdditionalEmails
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => new AlertRecipient(
                MedicationAlertRecipientType.CustomEmail,
                x,
                null,
                null,
                x)));

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
            CareRecipientId = dose.PatientMedication.CareRecipientId,
            PatientName = GetPatientDisplayName(dose),
            MedicationName = dose.PatientMedication.Name,
            Dosage = dose.PatientMedication.Dosage,
            Route = dose.PatientMedication.Route,
            Instructions = dose.PatientMedication.Instructions ?? string.Empty,
            ScheduledTime = DateTime.SpecifyKind(dose.ScheduledTime, DateTimeKind.Utc),
            AllowedConfirmationUntil = dose.AllowedConfirmationUntil.HasValue ? DateTime.SpecifyKind(dose.AllowedConfirmationUntil.Value, DateTimeKind.Utc) : null,
            Status = dose.Status,
            AdministrationOutcome = dose.AdministrationOutcome,
            TimingStatus = dose.TimingStatus,
            VerificationStatus = dose.VerificationStatus,
            SourceType = dose.SourceType,
            TakenAt = dose.TakenAt.HasValue ? DateTime.SpecifyKind(dose.TakenAt.Value, DateTimeKind.Utc) : null,
            ActualAdministrationAt = dose.ActualAdministrationAt.HasValue ? DateTime.SpecifyKind(dose.ActualAdministrationAt.Value, DateTimeKind.Utc) : null,
            DelayMinutes = dose.DelayMinutes,
            AdministrationWindowMinutesSnapshot = dose.AdministrationWindowMinutesSnapshot,
            TakenByName = dose.TakenByUser != null ? $"{dose.TakenByUser.FirstName} {dose.TakenByUser.LastName}".Trim() : null,
            RecordedByName = dose.RecordedByUser != null ? $"{dose.RecordedByUser.FirstName} {dose.RecordedByUser.LastName}".Trim() : null,
            VerifiedByName = dose.VerifiedByUser != null ? $"{dose.VerifiedByUser.FirstName} {dose.VerifiedByUser.LastName}".Trim() : null,
            CorrectedByName = dose.CorrectedByUser != null ? $"{dose.CorrectedByUser.FirstName} {dose.CorrectedByUser.LastName}".Trim() : null,
            Notes = dose.Notes,
            ClinicalNotes = dose.ClinicalNotes,
            PatientComment = dose.PatientComment,
            CorrectionReason = dose.CorrectionReason,
            MissedReason = dose.MissedReason,
            SideEffectSeverity = dose.SideEffectSeverity,
            SideEffectDescription = dose.SideEffectDescription,
            ScheduledShiftSlot = dose.ScheduledShiftSlot,
            RecordedShiftSlot = dose.RecordedShiftSlot,
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

    private static MedicationAdministrationReportRowDto MapToAdministrationReportRowDto(MedicationDose dose)
    {
        return new MedicationAdministrationReportRowDto
        {
            DoseId = dose.Id,
            CareRecipientId = dose.PatientMedication.CareRecipientId,
            PatientName = GetPatientDisplayName(dose),
            MedicationId = dose.PatientMedicationId,
            MedicationName = dose.PatientMedication.Name,
            ScheduledTime = DateTime.SpecifyKind(dose.ScheduledTime, DateTimeKind.Utc),
            ActualAdministrationAt = dose.ActualAdministrationAt.HasValue ? DateTime.SpecifyKind(dose.ActualAdministrationAt.Value, DateTimeKind.Utc) : null,
            Status = dose.Status,
            AdministrationOutcome = dose.AdministrationOutcome,
            TimingStatus = dose.TimingStatus,
            VerificationStatus = dose.VerificationStatus,
            RecordedByName = dose.RecordedByUser != null ? $"{dose.RecordedByUser.FirstName} {dose.RecordedByUser.LastName}".Trim() : null,
            VerifiedByName = dose.VerifiedByUser != null ? $"{dose.VerifiedByUser.FirstName} {dose.VerifiedByUser.LastName}".Trim() : null,
            ScheduledShiftSlot = dose.ScheduledShiftSlot,
            DelayMinutes = dose.DelayMinutes,
            Notes = dose.Notes
        };
    }

    private IQueryable<MedicationDose> BuildAdministrationReportQuery(DateTime fromUtc, DateTime toUtc, int? patientId, int? medicationId, ShiftSlot? shiftSlot, string? recordedByUserId, string? search)
    {
        var query = _context.MedicationDoses
            .Include(d => d.PatientMedication)
                .ThenInclude(m => m.CareRecipient)
            .Include(d => d.RecordedByUser)
            .Include(d => d.VerifiedByUser)
            .Include(d => d.CorrectedByUser)
            .Where(d => d.ScheduledTime >= fromUtc && d.ScheduledTime <= toUtc);

        if (patientId.HasValue)
        {
            query = query.Where(d => d.PatientMedication.CareRecipientId == patientId.Value);
        }

        if (medicationId.HasValue)
        {
            query = query.Where(d => d.PatientMedicationId == medicationId.Value);
        }

        if (shiftSlot.HasValue)
        {
            query = query.Where(d => d.ScheduledShiftSlot == shiftSlot.Value);
        }

        if (!string.IsNullOrWhiteSpace(recordedByUserId))
        {
            query = query.Where(d => d.RecordedByUserId == recordedByUserId || d.VerifiedByUserId == recordedByUserId || d.CorrectedByUserId == recordedByUserId);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(d =>
                d.PatientMedication.Name.Contains(term) ||
                d.PatientMedication.CareRecipient.FirstName.Contains(term) ||
                d.PatientMedication.CareRecipient.LastName.Contains(term) ||
                (d.RecordedByUser != null && (d.RecordedByUser.FirstName.Contains(term) || d.RecordedByUser.LastName.Contains(term))) ||
                (d.VerifiedByUser != null && (d.VerifiedByUser.FirstName.Contains(term) || d.VerifiedByUser.LastName.Contains(term))) ||
                (d.CorrectedByUser != null && (d.CorrectedByUser.FirstName.Contains(term) || d.CorrectedByUser.LastName.Contains(term))) ||
                (d.MissedReason != null && d.MissedReason.Contains(term)) ||
                (d.Notes != null && d.Notes.Contains(term)) ||
                (d.ClinicalNotes != null && d.ClinicalNotes.Contains(term)));
        }

        return query;
    }

    private static (DateTime FromUtc, DateTime ToUtc) NormalizeIranDateRangeUtc(DateTime from, DateTime to)
    {
        var tz = GetIranTimeZone();
        var fromLocalDate = GetIranLocalDate(from, tz);
        var toLocalDate = GetIranLocalDate(to, tz);

        var startLocal = new DateTime(fromLocalDate.Year, fromLocalDate.Month, fromLocalDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
        var endLocal = new DateTime(toLocalDate.Year, toLocalDate.Month, toLocalDate.Day, 23, 59, 59, 999, DateTimeKind.Unspecified);

        var startUtc = TimeZoneInfo.ConvertTimeToUtc(startLocal, tz);
        var endUtc = TimeZoneInfo.ConvertTimeToUtc(endLocal, tz);

        return (startUtc, endUtc);
    }

    private static string GetPatientDisplayName(MedicationDose dose)
    {
        var patient = dose.PatientMedication.CareRecipient;
        var fullName = $"{patient.FirstName} {patient.LastName}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? $"بیمار #{patient.Id}" : fullName;
    }

    private static TimeZoneInfo GetIranTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Iran Standard Time");
        }
        catch
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Asia/Tehran");
        }
    }

    private static DateTime GetIranLocalDate(DateTime input, TimeZoneInfo tz)
    {
        return input.Kind switch
        {
            DateTimeKind.Utc => TimeZoneInfo.ConvertTimeFromUtc(input, tz).Date,
            DateTimeKind.Local => TimeZoneInfo.ConvertTime(input, tz).Date,
            _ => input.Date
        };
    }

    private static MedicationDto MapToDto(PatientMedication medication)
    {
        var stockStatus = GetStockStatus(medication.TotalQuantity, medication.AlertLimit);
        return new MedicationDto
        {
            Id = medication.Id,
            CareRecipientId = medication.CareRecipientId,
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

    private sealed record DoseStateSnapshot(
        DoseStatus Status,
        MedicationAdministrationOutcome AdministrationOutcome,
        MedicationTimingStatus TimingStatus,
        MedicationVerificationStatus VerificationStatus);

    private sealed record AlertRecipient(
        MedicationAlertRecipientType RecipientType,
        string Display,
        string? UserId,
        string? PhoneNumber,
        string? Email);
}
