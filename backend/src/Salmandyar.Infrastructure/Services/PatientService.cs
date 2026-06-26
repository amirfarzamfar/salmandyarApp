using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Application.Services.Settings;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class PatientService : IPatientService
{
    private readonly ApplicationDbContext _context;
    private readonly IPatientSelfServiceAccessService _patientSelfServiceAccessService;
    private readonly IUserNotificationService _userNotificationService;
    private readonly INotificationService _notificationService;
    private readonly INotificationSettingsService _notificationSettingsService;

    public PatientService(
        ApplicationDbContext context,
        IPatientSelfServiceAccessService patientSelfServiceAccessService,
        IUserNotificationService userNotificationService,
        INotificationService notificationService,
        INotificationSettingsService notificationSettingsService)
    {
        _context = context;
        _patientSelfServiceAccessService = patientSelfServiceAccessService;
        _userNotificationService = userNotificationService;
        _notificationService = notificationService;
        _notificationSettingsService = notificationSettingsService;
    }

    public async Task<List<PatientListDto>> GetAllPatientsAsync(string? caregiverId = null)
    {
        // Auto-sync users who have Patient or Elderly roles but no CareRecipient record
        // This ensures previously registered patients show up in the admin panel
        var validUserIds = await _context.Users
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u, ur })
            .Join(_context.Roles, x => x.ur.RoleId, r => r.Id, (x, r) => new { x.u, r.Name })
            .Where(x => x.Name == Roles.Patient || x.Name == Roles.Elderly)
            .Select(x => x.u.Id)
            .Distinct()
            .ToListAsync();

        var existingCareRecipientUserIds = await _context.CareRecipients
            .Where(cr => cr.UserId != null && validUserIds.Contains(cr.UserId))
            .Select(cr => cr.UserId)
            .ToListAsync();

        var missingUserIds = validUserIds.Except(existingCareRecipientUserIds).ToList();

        if (missingUserIds.Any())
        {
            var missingUsers = await _context.Users.Where(u => missingUserIds.Contains(u.Id)).ToListAsync();
            var newCareRecipients = missingUsers.Select(u => new CareRecipient
            {
                UserId = u.Id,
                FirstName = u.FirstName ?? "نامشخص",
                LastName = u.LastName ?? "نامشخص",
                DateOfBirth = DateTime.UtcNow.AddYears(-60),
                PrimaryDiagnosis = "نامشخص",
                CareLevel = CareLevel.Level1
            }).ToList();

            _context.CareRecipients.AddRange(newCareRecipients);
            await _context.SaveChangesAsync();
        }

        // Get existing care recipients that are linked to valid Patient/Elderly users
        var query = _context.CareRecipients
            .Include(p => p.ResponsibleNurse)
            .Where(cr => cr.UserId != null && validUserIds.Contains(cr.UserId))
            .AsQueryable();

        if (!string.IsNullOrEmpty(caregiverId))
        {
            var validPatientIds = await GetValidPatientIdsForCaregiverAsync(caregiverId);
            query = query.Where(p => validPatientIds.Contains(p.Id) || p.UserId == caregiverId || p.FamilyMemberId == caregiverId);
        }

        var patientEntities = await query.ToListAsync();

        var activeCaregiversByPatientId = await GetActiveCaregiversByPatientIdsAsync(patientEntities.Select(p => p.Id).ToList());

        var userIds = patientEntities.Where(p => p.UserId != null).Select(p => p.UserId).ToList();
        var profileCompletionDict = await _context.PatientProfiles
            .Where(p => userIds.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId, p => p.IsCompleted);

        var patients = patientEntities
            .Select(p => new PatientListDto(
                p.Id,
                p.UserId,
                p.FirstName,
                p.LastName,
                CalculateAge(p.DateOfBirth),
                p.PrimaryDiagnosis,
                p.CurrentStatus,
                (int)p.CareLevel,
                activeCaregiversByPatientId.TryGetValue(p.Id, out var caregiver) ? caregiver.CaregiverName : null,
                p.UserId != null && profileCompletionDict.TryGetValue(p.UserId, out var isCompleted) && isCompleted
            ))
            .ToList();

        return patients;
    }

    public async Task<PatientDto?> GetPatientByIdAsync(int id, string? caregiverId = null)
    {
        var p = await _context.CareRecipients
            .Include(p => p.ResponsibleNurse)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p == null) return null;

        if (!string.IsNullOrEmpty(caregiverId))
        {
            if (p.UserId != caregiverId && p.FamilyMemberId != caregiverId)
            {
                var validPatientIds = await GetValidPatientIdsForCaregiverAsync(caregiverId);
                if (!validPatientIds.Contains(id))
                {
                    return null;
                }
            }
        }

        var activeCaregiverByPatientId = await GetActiveCaregiversByPatientIdsAsync(new List<int> { p.Id });
        var activeCaregiver = activeCaregiverByPatientId.TryGetValue(p.Id, out var cg) ? cg : ((string CaregiverId, string CaregiverName)?)null;

        return new PatientDto(
            p.Id,
            p.UserId,
            p.FirstName,
            p.LastName,
            p.DateOfBirth,
            CalculateAge(p.DateOfBirth),
            p.PrimaryDiagnosis,
            p.CurrentStatus,
            (int)p.CareLevel,
            activeCaregiver?.CaregiverId,
            activeCaregiver?.CaregiverName,
            p.MedicalHistory,
            p.Needs,
            p.Address
        );
    }

    public async Task CreatePatientForUserAsync(string userId, string firstName, string lastName)
    {
        var existing = await _context.CareRecipients.AnyAsync(c => c.UserId == userId);
        if (!existing)
        {
            var entity = new CareRecipient
            {
                UserId = userId,
                FirstName = firstName,
                LastName = lastName,
                DateOfBirth = DateTime.UtcNow.AddYears(-60), // Default date, can be updated later
                PrimaryDiagnosis = "نامشخص",
                CareLevel = CareLevel.Level1
            };
            _context.CareRecipients.Add(entity);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<PatientDto> CreatePatientAsync(CreatePatientDto dto)
    {
        var entity = new CareRecipient
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            PrimaryDiagnosis = dto.PrimaryDiagnosis,
            CurrentStatus = dto.CurrentStatus,
            CareLevel = (CareLevel)dto.CareLevel,
            MedicalHistory = dto.MedicalHistory ?? string.Empty,
            Needs = dto.Needs ?? string.Empty,
            Address = dto.Address ?? string.Empty
        };

        _context.CareRecipients.Add(entity);
        await _context.SaveChangesAsync();

        return new PatientDto(
            entity.Id,
            entity.UserId,
            entity.FirstName,
            entity.LastName,
            entity.DateOfBirth,
            CalculateAge(entity.DateOfBirth),
            entity.PrimaryDiagnosis,
            entity.CurrentStatus,
            (int)entity.CareLevel,
            entity.ResponsibleNurseId,
            null,
            entity.MedicalHistory,
            entity.Needs,
            entity.Address
        );
    }

    public async Task<PatientDto> UpdatePatientAdminInfoAsync(int id, UpdatePatientAdminInfoDto dto)
    {
        var entity = await _context.CareRecipients
            .Include(p => p.ResponsibleNurse)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (entity == null)
        {
            throw new KeyNotFoundException("Patient not found");
        }

        entity.PrimaryDiagnosis = dto.PrimaryDiagnosis;
        entity.CareLevel = (CareLevel)dto.CareLevel;
        entity.Needs = dto.SpecialNeeds ?? string.Empty;

        await _context.SaveChangesAsync();

        return new PatientDto(
            entity.Id,
            entity.UserId,
            entity.FirstName,
            entity.LastName,
            entity.DateOfBirth,
            CalculateAge(entity.DateOfBirth),
            entity.PrimaryDiagnosis,
            entity.CurrentStatus,
            (int)entity.CareLevel,
            entity.ResponsibleNurseId,
            entity.ResponsibleNurse != null ? $"{entity.ResponsibleNurse.FirstName} {entity.ResponsibleNurse.LastName}" : null,
            entity.MedicalHistory,
            entity.Needs,
            entity.Address
        );
    }

    public async Task<List<VitalSignDto>> GetVitalSignsAsync(int patientId)
    {
        return await _context.VitalSigns
            .Where(v => v.CareRecipientId == patientId)
            .Include(v => v.Recorder)
            .Include(v => v.PatientAcknowledgedBy)
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
                v.BloodSugar,
                v.GlasgowComaScale,
                v.PatientAcknowledgedAt,
                v.PatientAcknowledgedBy != null ? $"{v.PatientAcknowledgedBy.FirstName} {v.PatientAcknowledgedBy.LastName}" : null,
                v.PatientAcknowledgementNote
            ))
            .ToListAsync();
    }

    public async Task<AddVitalSignResultDto> AddVitalSignAsync(string recorderId, CreateVitalSignDto dto)
    {
        await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
            recorderId,
            dto.CareRecipientId,
            PatientSelfServiceFeatures.VitalSigns);

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
            BloodSugar = dto.BloodSugar,
            GlasgowComaScale = dto.GlasgowComaScale
        };

        _context.VitalSigns.Add(entity);
        await _context.SaveChangesAsync();

        var patient = await _context.CareRecipients
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == dto.CareRecipientId);

        var patientName = patient == null
            ? dto.CareRecipientId.ToString()
            : $"{patient.FirstName} {patient.LastName}";

        var recentVitals = await _context.VitalSigns
            .AsNoTracking()
            .Where(v => v.CareRecipientId == dto.CareRecipientId)
            .OrderByDescending(v => v.MeasuredAt)
            .Take(3)
            .ToListAsync();

        var alerts = VitalSignAlertEvaluator.Evaluate(recentVitals);

        var recipients = new List<string> { recorderId };

        if (!string.IsNullOrWhiteSpace(patient?.ResponsibleNurseId))
        {
            recipients.Add(patient.ResponsibleNurseId);
        }

        if (!string.IsNullOrWhiteSpace(patient?.UserId))
        {
            recipients.Add(patient.UserId);
        }

        if (!string.IsNullOrWhiteSpace(patient?.FamilyMemberId))
        {
            recipients.Add(patient.FamilyMemberId);
        }

        if (alerts.Count == 0)
        {
            recipients = recipients
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct()
                .ToList();

            return new AddVitalSignResultDto(
                entity.Id,
                dto.CareRecipientId,
                entity.MeasuredAt,
                patientName,
                recipients,
                alerts
            );
        }

        var adminUserIds = await _context.Users
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u.Id, ur.RoleId })
            .Join(_context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.Id, r.Name })
            .Where(x => x.Name == Roles.Admin || x.Name == Roles.SuperAdmin || x.Name == Roles.Supervisor)
            .Select(x => x.Id)
            .Distinct()
            .ToListAsync();

        recipients.AddRange(adminUserIds);

        recipients = recipients
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

        var severity = alerts.Max(a => a.Severity);
        var alertTitles = string.Join("، ", alerts.Select(a => a.Title).Take(3));
        var defaultTitle = severity == VitalAlertSeverity.Critical ? "هشدار فوری علائم حیاتی" : "هشدار علائم حیاتی";
        var link = $"/dashboard/patients/{dto.CareRecipientId}?tab=vitals";
        var eventConfig = await _notificationSettingsService.GetEventConfigurationAsync(NotificationEventKeys.VitalSignDanger);
        var configuredRoleRecipients = await _notificationSettingsService.GetRoleRecipientsAsync(NotificationEventKeys.VitalSignDanger);

        recipients.AddRange(configuredRoleRecipients.Select(x => x.UserId));
        recipients = recipients
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct()
            .ToList();

        var templateValues = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["PatientName"] = patientName,
            ["AlertTitles"] = alertTitles,
            ["AlertCount"] = alerts.Count.ToString(),
            ["MeasuredAt"] = entity.MeasuredAt.ToString("yyyy/MM/dd HH:mm")
        };

        var inAppTitle = RenderTemplate(eventConfig.InAppTitleTemplate, templateValues, defaultTitle);
        var inAppBody = RenderTemplate(eventConfig.InAppBodyTemplate, templateValues, $"{patientName}: {alertTitles}");
        var smsMessage = RenderTemplate(eventConfig.SmsTemplate, templateValues, $"{patientName}: {alertTitles}");
        var emailSubject = RenderTemplate(eventConfig.EmailSubjectTemplate, templateValues, defaultTitle);
        var emailBody = RenderTemplate(eventConfig.EmailBodyTemplate, templateValues, $"{patientName}: {alertTitles}");

        var users = await _context.Users
            .Where(u => recipients.Contains(u.Id))
            .Select(u => new { u.Id, u.Email, u.PhoneNumber })
            .ToListAsync();

        if (eventConfig.IsEnabled)
        {
            if (eventConfig.SendInApp)
            {
                foreach (var recipientId in recipients)
                {
                    await _userNotificationService.CreateNotificationAsync(
                        recipientId,
                        inAppTitle,
                        inAppBody,
                        NotificationType.Alert,
                        referenceId: entity.Id.ToString(),
                        link: link,
                        severity: severity.ToString(),
                        context: new NotificationSendContext
                        {
                            EventKey = NotificationEventKeys.VitalSignDanger,
                            EventDisplayName = eventConfig.DisplayName,
                            RecipientUserId = recipientId,
                            PatientId = dto.CareRecipientId,
                            ReferenceId = entity.Id.ToString(),
                            Severity = severity.ToString(),
                            Link = link
                        });
                }
            }

            if (eventConfig.SendSms)
            {
                var phones = users.Select(x => x.PhoneNumber)
                    .Concat(eventConfig.AdditionalPhones)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Distinct()
                    .ToList();

                foreach (var phone in phones)
                {
                    await _notificationService.SendSmsAsync(
                        phone!,
                        smsMessage,
                        new NotificationSendContext
                        {
                            EventKey = NotificationEventKeys.VitalSignDanger,
                            EventDisplayName = eventConfig.DisplayName,
                            PatientId = dto.CareRecipientId,
                            ReferenceId = entity.Id.ToString(),
                            Severity = severity.ToString(),
                            Link = link
                        });
                }
            }

            if (eventConfig.SendEmail)
            {
                var emails = users.Select(x => x.Email)
                    .Concat(eventConfig.AdditionalEmails)
                    .Where(x => !string.IsNullOrWhiteSpace(x))
                    .Distinct()
                    .ToList();

                foreach (var email in emails)
                {
                    await _notificationService.SendEmailAsync(
                        email!,
                        emailSubject,
                        emailBody,
                        new NotificationSendContext
                        {
                            EventKey = NotificationEventKeys.VitalSignDanger,
                            EventDisplayName = eventConfig.DisplayName,
                            PatientId = dto.CareRecipientId,
                            ReferenceId = entity.Id.ToString(),
                            Severity = severity.ToString(),
                            Link = link
                        });
                }
            }
        }

        return new AddVitalSignResultDto(
            entity.Id,
            dto.CareRecipientId,
            entity.MeasuredAt,
            patientName,
            recipients,
            alerts
        );
    }

    public async Task<VitalSignAcknowledgementResultDto> AcknowledgeVitalSignAsync(int patientId, int vitalSignId, string userId, AcknowledgeVitalSignDto dto)
    {
        var note = (dto.Note ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(note))
        {
            throw new ArgumentException("توضیح اقدام انجام‌شده الزامی است.");
        }

        var vital = await _context.VitalSigns
            .Include(v => v.PatientAcknowledgedBy)
            .FirstOrDefaultAsync(v => v.Id == vitalSignId && v.CareRecipientId == patientId);

        if (vital == null)
        {
            throw new KeyNotFoundException("رکورد علائم حیاتی یافت نشد.");
        }

        var vitalsDescending = await _context.VitalSigns
            .AsNoTracking()
            .Where(v => v.CareRecipientId == patientId)
            .OrderByDescending(v => v.MeasuredAt)
            .Take(10)
            .ToListAsync();

        var vitalIndex = vitalsDescending.FindIndex(v => v.Id == vitalSignId);
        if (vitalIndex < 0)
        {
            throw new KeyNotFoundException("رکورد علائم حیاتی یافت نشد.");
        }

        var relevantVitals = vitalsDescending
            .Skip(vitalIndex)
            .Take(3)
            .ToList();

        var alerts = VitalSignAlertEvaluator.Evaluate(relevantVitals);
        if (alerts.Count == 0)
        {
            throw new InvalidOperationException("برای این رکورد هشدار فعالی وجود ندارد.");
        }

        vital.PatientAcknowledgedById = userId;
        vital.PatientAcknowledgedAt = DateTime.UtcNow;
        vital.PatientAcknowledgementNote = note;

        await _context.SaveChangesAsync();

        var ackUser = vital.PatientAcknowledgedBy;
        var ackUserName = ackUser != null ? $"{ackUser.FirstName} {ackUser.LastName}" : null;

        return new VitalSignAcknowledgementResultDto(
            vital.Id,
            vital.PatientAcknowledgedAt.Value,
            ackUserName,
            vital.PatientAcknowledgementNote
        );
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

        var careRecipientExists = await _context.CareRecipients.AnyAsync(c => c.Id == dto.CareRecipientId);
        if (!careRecipientExists)
        {
            throw new ArgumentException("بیمار یافت نشد");
        }

        var serviceDefinitionExists = await _context.ServiceDefinitions.AnyAsync(d => d.Id == dto.ServiceDefinitionId && d.IsActive);
        if (!serviceDefinitionExists)
        {
            throw new ArgumentException("خدمت نامعتبر است");
        }

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

        await UpsertCareServiceRemindersAsync(entity, dto.ReminderOptions);
    }

    public async Task<int> UpdateCareServiceAsync(int serviceId, UpdateCareServiceDto dto)
    {
        var service = await _context.CareServices.FindAsync(serviceId);
        if (service == null) throw new KeyNotFoundException($"Service with ID {serviceId} not found.");

        // Determine the effective PerformerId (new one if provided, else existing)
        var effectivePerformerId = !string.IsNullOrEmpty(dto.PerformerId) ? dto.PerformerId : service.PerformerId;

        var serviceDefinitionExists = await _context.ServiceDefinitions.AnyAsync(d => d.Id == dto.ServiceDefinitionId && d.IsActive);
        if (!serviceDefinitionExists)
        {
            throw new ArgumentException("خدمت نامعتبر است");
        }

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

        if (dto.Status != CareServiceStatus.Planned)
        {
            await DeleteCareServiceRemindersAsync(service.Id);
        }
        else
        {
            if (dto.ReminderOptions != null)
            {
                await UpsertCareServiceRemindersAsync(service, dto.ReminderOptions);
            }
        }
        
        return service.CareRecipientId;
    }

    public async Task<int> DeleteCareServiceAsync(int serviceId)
    {
        var service = await _context.CareServices.FindAsync(serviceId);
        if (service == null) throw new KeyNotFoundException($"Service with ID {serviceId} not found.");

        await DeleteCareServiceRemindersAsync(service.Id);

        var careRecipientId = service.CareRecipientId;
        _context.CareServices.Remove(service);
        await _context.SaveChangesAsync();
        
        return careRecipientId;
    }

    private async Task UpsertCareServiceRemindersAsync(CareService service, CareServiceReminderOptionsDto? options)
    {
        await DeleteCareServiceRemindersAsync(service.Id);

        if (options == null || !options.Enabled)
        {
            return;
        }

        var serviceTime = service.StartTime ?? service.PerformedAt;
        var now = DateTime.UtcNow;

        var recipient = await _context.CareRecipients
            .AsNoTracking()
            .Where(c => c.Id == service.CareRecipientId)
            .Select(c => new
            {
                c.UserId,
                c.FamilyMemberId,
                c.ResponsibleNurseId,
                c.FirstName,
                c.LastName
            })
            .FirstAsync();

        var scheduledTimes = new List<DateTime>();

        if (options.DayBefore)
        {
            scheduledTimes.Add(serviceTime.AddDays(-1));
        }

        if (options.HoursBefore.HasValue && options.HoursBefore.Value > 0)
        {
            scheduledTimes.Add(serviceTime.AddHours(-options.HoursBefore.Value));
        }

        scheduledTimes = scheduledTimes
            .Select(t => t.Kind == DateTimeKind.Utc ? t : t.ToUniversalTime())
            .Distinct()
            .Where(t => t > now)
            .OrderBy(t => t)
            .ToList();

        if (!scheduledTimes.Any())
        {
            return;
        }

        var reminderTemplates = new List<(string? TargetUserId, bool NotifyAdmin, bool SendSms, bool SendInApp)>();

        if (options.SmsToPatient || options.InAppToPatient)
        {
            var targetUserId = recipient.UserId ?? recipient.FamilyMemberId;
            reminderTemplates.Add((targetUserId, false, options.SmsToPatient, options.InAppToPatient));
        }

        if (options.SmsToSupervisor || options.InAppToSupervisor)
        {
            reminderTemplates.Add((recipient.ResponsibleNurseId, false, options.SmsToSupervisor, options.InAppToSupervisor));
        }

        if (options.SmsToPerformer || options.InAppToPerformer)
        {
            reminderTemplates.Add((service.PerformerId, false, options.SmsToPerformer, options.InAppToPerformer));
        }

        if (options.SmsToAdmin || options.InAppToAdmin)
        {
            reminderTemplates.Add((null, true, options.SmsToAdmin, options.InAppToAdmin));
        }

        reminderTemplates = reminderTemplates
            .Where(t => (t.NotifyAdmin || !string.IsNullOrWhiteSpace(t.TargetUserId)) && (t.SendSms || t.SendInApp))
            .Distinct()
            .ToList();

        if (!reminderTemplates.Any())
        {
            return;
        }

        var note = options.Note ?? string.Empty;

        var reminders = new List<ServiceReminder>();
        foreach (var scheduledTime in scheduledTimes)
        {
            foreach (var template in reminderTemplates)
            {
                reminders.Add(new ServiceReminder
                {
                    CareRecipientId = service.CareRecipientId,
                    ServiceDefinitionId = service.ServiceDefinitionId,
                    CareServiceId = service.Id,
                    TargetUserId = template.TargetUserId,
                    ScheduledTime = scheduledTime,
                    Note = note,
                    NotifyPatient = false,
                    NotifyAdmin = template.NotifyAdmin,
                    NotifySupervisor = false,
                    SendSms = template.SendSms,
                    SendEmail = false,
                    SendInApp = template.SendInApp,
                    IsSent = false
                });
            }
        }

        var deduped = reminders
            .GroupBy(r => new { r.CareServiceId, r.ScheduledTime, r.TargetUserId, r.NotifyAdmin })
            .Select(g =>
            {
                var first = g.First();
                first.SendSms = g.Any(x => x.SendSms);
                first.SendInApp = g.Any(x => x.SendInApp);
                if (string.IsNullOrWhiteSpace(first.Note))
                {
                    first.Note = g.Select(x => x.Note).FirstOrDefault(x => !string.IsNullOrWhiteSpace(x)) ?? string.Empty;
                }
                return first;
            })
            .ToList();

        _context.ServiceReminders.AddRange(deduped);
        await _context.SaveChangesAsync();
    }

    private async Task DeleteCareServiceRemindersAsync(int careServiceId)
    {
        var existing = await _context.ServiceReminders
            .Where(r => r.CareServiceId == careServiceId)
            .ToListAsync();

        if (existing.Count == 0)
        {
            return;
        }

        _context.ServiceReminders.RemoveRange(existing);
        await _context.SaveChangesAsync();
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
        await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
            authorId,
            dto.CareRecipientId,
            PatientSelfServiceFeatures.MedicationKardex);

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

    private async Task<List<int>> GetValidPatientIdsForCaregiverAsync(string caregiverId)
    {
        var nowUtc = DateTimeOffset.UtcNow;
        var iranTz = ResolveIranTimeZone();

        var assignments = await _context.CareAssignments
            .Where(a => a.CaregiverId == caregiverId && a.Status == AssignmentStatus.Active)
            .ToListAsync();

        return assignments
            .Where(a => IsAssignmentActiveNow(a, nowUtc, iranTz))
            .Select(a => a.PatientId)
            .Distinct()
            .ToList();
    }

    private async Task<Dictionary<int, (string CaregiverId, string CaregiverName)>> GetActiveCaregiversByPatientIdsAsync(List<int> patientIds)
    {
        if (patientIds.Count == 0) return new Dictionary<int, (string CaregiverId, string CaregiverName)>();

        var nowUtc = DateTimeOffset.UtcNow;
        var iranTz = ResolveIranTimeZone();

        var assignments = await _context.CareAssignments
            .Where(a => patientIds.Contains(a.PatientId) && a.Status == AssignmentStatus.Active)
            .ToListAsync();

        var validAssignments = assignments
            .Where(a => IsAssignmentActiveNow(a, nowUtc, iranTz))
            .GroupBy(a => a.PatientId)
            .Select(g =>
            {
                var primary = g.Where(x => x.IsPrimaryCaregiver).OrderByDescending(x => x.StartDate).FirstOrDefault();
                var selected = primary ?? g.OrderByDescending(x => x.StartDate).First();
                return new { PatientId = g.Key, CaregiverId = selected.CaregiverId };
            })
            .ToList();

        var caregiverIds = validAssignments.Select(x => x.CaregiverId).Distinct().ToList();

        var caregivers = await _context.Users
            .Where(u => caregiverIds.Contains(u.Id))
            .Select(u => new { u.Id, u.FirstName, u.LastName })
            .ToListAsync();

        var caregiverNameById = caregivers.ToDictionary(
            x => x.Id,
            x => $"{x.FirstName} {x.LastName}"
        );

        return validAssignments
            .Where(x => caregiverNameById.ContainsKey(x.CaregiverId))
            .ToDictionary(
                x => x.PatientId,
                x => (x.CaregiverId, caregiverNameById[x.CaregiverId])
            );
    }

    private static TimeZoneInfo ResolveIranTimeZone()
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

    private static bool IsAssignmentActiveNow(CareAssignment assignment, DateTimeOffset nowUtc, TimeZoneInfo iranTz)
    {
        var nowIran = TimeZoneInfo.ConvertTime(nowUtc, iranTz);
        var startIran = TimeZoneInfo.ConvertTime(assignment.StartDate, iranTz);
        var endIran = assignment.EndDate.HasValue ? TimeZoneInfo.ConvertTime(assignment.EndDate.Value, iranTz) : (DateTimeOffset?)null;

        if (assignment.AssignmentType == AssignmentType.ShiftBased && assignment.ShiftSlot.HasValue)
        {
            if (assignment.ShiftSlot.Value == ShiftSlot.None)
            {
                if (nowIran < startIran) return false;
                if (endIran.HasValue && nowIran > endIran.Value.AddHours(1)) return false;
                return true;
            }

            var datesToCheck = new[] { nowIran.Date, nowIran.Date.AddDays(-1) };

            foreach (var date in datesToCheck)
            {
                if (date < startIran.Date) continue;
                if (endIran.HasValue && date > endIran.Value.Date) continue;

                var offset = iranTz.GetUtcOffset(new DateTime(date.Year, date.Month, date.Day));
                var shiftStart = new DateTimeOffset(date.Year, date.Month, date.Day, 0, 0, 0, offset);
                var shiftEnd = shiftStart;

                switch (assignment.ShiftSlot.Value)
                {
                    case ShiftSlot.Morning:
                        shiftStart = shiftStart.AddHours(7);
                        shiftEnd = shiftStart.AddHours(6);
                        break;
                    case ShiftSlot.Evening:
                        shiftStart = shiftStart.AddHours(13);
                        shiftEnd = shiftStart.AddHours(6);
                        break;
                    case ShiftSlot.Night:
                        shiftStart = shiftStart.AddHours(19);
                        shiftEnd = shiftStart.AddHours(12);
                        break;
                    case ShiftSlot.Long:
                        shiftStart = shiftStart.AddHours(7);
                        shiftEnd = shiftStart.AddHours(12);
                        break;
                    case ShiftSlot.TwentyFourHour:
                        shiftStart = shiftStart.AddHours(7);
                        shiftEnd = shiftStart.AddHours(24);
                        break;
                }

                if (nowIran >= shiftStart && nowIran <= shiftEnd.AddHours(1))
                {
                    return true;
                }
            }

            return false;
        }

        if (nowIran < startIran) return false;
        if (endIran.HasValue && nowIran > endIran.Value.AddHours(1)) return false;
        return true;
    }

    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }

    private static string RenderTemplate(string template, IReadOnlyDictionary<string, string> values, string fallback)
    {
        if (string.IsNullOrWhiteSpace(template))
        {
            return fallback;
        }

        var output = template;
        foreach (var item in values)
        {
            output = output.Replace($"{{{item.Key}}}", item.Value, StringComparison.OrdinalIgnoreCase);
        }

        return output;
    }
}
