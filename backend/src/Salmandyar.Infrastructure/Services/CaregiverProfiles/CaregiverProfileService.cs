using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.CaregiverProfiles;
using Salmandyar.Application.DTOs.Users;
using Salmandyar.Application.Services.CaregiverProfiles;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Users;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.CaregiverProfiles;

public class CaregiverProfileService : ICaregiverProfileService
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private static readonly HashSet<string> CaregiverRoles = new(StringComparer.OrdinalIgnoreCase)
    {
        Roles.Nurse,
        Roles.AssistantNurse,
        Roles.ElderlyCareAssistant,
        Roles.Physiotherapist
    };

    private static readonly string[] RequiredDocumentTypes =
    {
        "NationalCardFront",
        "NationalCardBack",
        "BirthCertificate",
        "ProfilePhoto",
        "EducationDegree",
        "Resume",
        "WorkHistory",
        "CPR",
        "HealthCertificate",
        "NoCriminalRecord",
        "NoAddiction",
        "DigitalSignature"
    };

    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly IAuditLogService _auditLogService;
    private readonly IUserNotificationService _userNotificationService;

    public CaregiverProfileService(
        ApplicationDbContext context,
        UserManager<User> userManager,
        IAuditLogService auditLogService,
        IUserNotificationService userNotificationService)
    {
        _context = context;
        _userManager = userManager;
        _auditLogService = auditLogService;
        _userNotificationService = userNotificationService;
    }

    public async Task<CaregiverProfileDto?> GetProfileByUserIdAsync(string userId)
    {
        var profile = await _context.CaregiverProfiles
            .Include(x => x.User)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return null;
            }

            var registeredRole = await ResolveCaregiverRoleAsync(user);
            if (registeredRole == null)
            {
                return null;
            }

            return CreateDraftDto(user, registeredRole);
        }

        var auditLogs = await GetCaregiverAuditLogsAsync(userId);
        return MapToDto(profile, auditLogs);
    }

    public async Task<CaregiverProfileStatusDto> GetProfileStatusAsync(string userId)
    {
        var profile = await _context.CaregiverProfiles
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile == null)
        {
            return new CaregiverProfileStatusDto
            {
                HasProfile = false,
                EmploymentStatus = CaregiverEmploymentApprovalStatus.Draft,
                EmploymentStatusLabel = ToEmploymentStatusLabel(CaregiverEmploymentApprovalStatus.Draft)
            };
        }

        var stats = BuildDocumentStats(profile.Documents);
        return new CaregiverProfileStatusDto
        {
            HasProfile = true,
            IsCompleted = profile.IsCompleted,
            CompletionPercentage = profile.CompletionPercentage,
            CurrentStep = profile.CurrentStep,
            EmploymentStatus = profile.EmploymentStatus,
            EmploymentStatusLabel = ToEmploymentStatusLabel(profile.EmploymentStatus),
            PendingDocuments = stats.Pending,
            ApprovedDocuments = stats.Approved,
            NeedsCorrectionDocuments = stats.NeedsCorrection,
            RejectedDocuments = stats.Rejected,
            UploadedDocuments = profile.Documents.Count,
            ReviewNote = profile.ReviewNote
        };
    }

    public async Task<CaregiverDashboardDto> GetDashboardAsync(string userId)
    {
        var profile = await _context.CaregiverProfiles
            .AsNoTracking()
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        var shiftCount = await _context.CareAssignments.CountAsync(x => x.CaregiverId == userId);
        var completedServices = await _context.CareServices.CountAsync(x => x.PerformerId == userId && x.Status == CareServiceStatus.Completed);
        var reportCount = await _context.NursingReports.CountAsync(x => x.AuthorId == userId);

        var lastReportAt = await _context.NursingReports
            .Where(x => x.AuthorId == userId)
            .Select(x => (DateTime?)x.CreatedAt)
            .OrderByDescending(x => x)
            .FirstOrDefaultAsync();

        var lastServiceAt = await _context.CareServices
            .Where(x => x.PerformerId == userId)
            .Select(x => (DateTime?)x.PerformedAt)
            .OrderByDescending(x => x)
            .FirstOrDefaultAsync();

        var lastActivityAt = new[] { lastReportAt, lastServiceAt, profile?.LastUpdatedAt }
            .Where(x => x.HasValue)
            .Select(x => x!.Value)
            .DefaultIfEmpty()
            .Max();

        var approvedDocuments = profile?.Documents.Count(x => x.Status == CaregiverProfileDocumentStatus.Approved) ?? 0;
        var performanceScore = Math.Min(100, (completedServices * 5) + (reportCount * 3) + (approvedDocuments * 4));

        return new CaregiverDashboardDto
        {
            ProfileCompletionPercentage = profile?.CompletionPercentage ?? 0,
            DocumentVerificationStatus = ToDocumentStatusSummary(profile?.Documents),
            EmploymentStatus = ToEmploymentStatusLabel(profile?.EmploymentStatus ?? CaregiverEmploymentApprovalStatus.Draft),
            PerformanceScore = performanceScore,
            ShiftCount = shiftCount,
            LastActivityAt = lastActivityAt == default ? null : lastActivityAt
        };
    }

    public async Task<CaregiverProfileDto> UpdateProfileAsync(string userId, UpdateCaregiverProfileDto dto, string? actorUserId = null, string? actorName = null, bool isAdmin = false)
    {
        var profile = await GetOrCreateProfileAsync(userId);
        var user = profile.User;

        if (!string.IsNullOrWhiteSpace(dto.NationalCode))
        {
            await EnsureNationalCodeIsUniqueAsync(dto.NationalCode, userId);
        }

        if (dto.CurrentStep.HasValue)
        {
            profile.CurrentStep = Math.Max(profile.CurrentStep, Math.Clamp(dto.CurrentStep.Value, 1, 10));
        }

        profile.FirstName = NormalizeOptional(dto.FirstName) ?? profile.FirstName ?? user.FirstName;
        profile.LastName = NormalizeOptional(dto.LastName) ?? profile.LastName ?? user.LastName;
        profile.FatherName = NormalizeOptional(dto.FatherName) ?? profile.FatherName;
        profile.NationalCode = NormalizeOptional(dto.NationalCode) ?? profile.NationalCode;
        profile.BirthCertificateNumber = NormalizeOptional(dto.BirthCertificateNumber) ?? profile.BirthCertificateNumber;
        profile.DateOfBirth = dto.DateOfBirth ?? profile.DateOfBirth;
        profile.BirthPlace = NormalizeOptional(dto.BirthPlace) ?? profile.BirthPlace;
        profile.Gender = NormalizeOptional(dto.Gender) ?? profile.Gender;
        profile.MaritalStatus = NormalizeOptional(dto.MaritalStatus) ?? profile.MaritalStatus;
        profile.ChildrenCount = dto.ChildrenCount ?? profile.ChildrenCount;
        profile.Nationality = NormalizeOptional(dto.Nationality) ?? profile.Nationality;
        profile.PersonalPhotoUrl = NormalizeOptional(dto.PersonalPhotoUrl) ?? profile.PersonalPhotoUrl;
        profile.LandlinePhone = NormalizeOptional(dto.LandlinePhone) ?? profile.LandlinePhone;
        profile.Email = NormalizeOptional(dto.Email) ?? profile.Email ?? user.Email;
        profile.FullAddress = NormalizeOptional(dto.FullAddress) ?? profile.FullAddress;
        profile.Province = NormalizeOptional(dto.Province) ?? profile.Province;
        profile.City = NormalizeOptional(dto.City) ?? profile.City;
        profile.PostalCode = NormalizeOptional(dto.PostalCode) ?? profile.PostalCode;
        profile.Latitude = dto.Latitude ?? profile.Latitude;
        profile.Longitude = dto.Longitude ?? profile.Longitude;
        profile.CooperationType = NormalizeOptional(dto.CooperationType) ?? profile.CooperationType ?? profile.RegisteredRole;
        profile.NursingSystemNumber = NormalizeOptional(dto.NursingSystemNumber) ?? profile.NursingSystemNumber;
        profile.ExperienceYears = dto.ExperienceYears ?? profile.ExperienceYears;
        profile.LastWorkplace = NormalizeOptional(dto.LastWorkplace) ?? profile.LastWorkplace;
        profile.CurrentEmploymentStatus = NormalizeOptional(dto.CurrentEmploymentStatus) ?? profile.CurrentEmploymentStatus;
        profile.VehicleType = NormalizeOptional(dto.VehicleType) ?? profile.VehicleType;
        profile.ServiceRadiusKm = dto.ServiceRadiusKm ?? profile.ServiceRadiusKm;
        profile.LatestDegree = NormalizeOptional(dto.LatestDegree) ?? profile.LatestDegree;
        profile.Major = NormalizeOptional(dto.Major) ?? profile.Major;
        profile.University = NormalizeOptional(dto.University) ?? profile.University;
        profile.GraduationYear = dto.GraduationYear ?? profile.GraduationYear;
        profile.GPA = dto.GPA ?? profile.GPA;
        profile.BankName = NormalizeOptional(dto.BankName) ?? profile.BankName;
        profile.AccountNumber = NormalizeOptional(dto.AccountNumber) ?? profile.AccountNumber;
        profile.CardNumber = NormalizeOptional(dto.CardNumber) ?? profile.CardNumber;
        profile.Iban = NormalizeOptional(dto.Iban) ?? profile.Iban;
        profile.EmergencyContactName = NormalizeOptional(dto.EmergencyContactName) ?? profile.EmergencyContactName;
        profile.EmergencyContactRelationship = NormalizeOptional(dto.EmergencyContactRelationship) ?? profile.EmergencyContactRelationship;
        profile.EmergencyContactMobile = NormalizeOptional(dto.EmergencyContactMobile) ?? profile.EmergencyContactMobile;
        profile.EmergencyContactPhone = NormalizeOptional(dto.EmergencyContactPhone) ?? profile.EmergencyContactPhone;
        profile.EmergencyContactAddress = NormalizeOptional(dto.EmergencyContactAddress) ?? profile.EmergencyContactAddress;

        if (dto.CanStayAtPatientHome.HasValue)
        {
            profile.CanStayAtPatientHome = dto.CanStayAtPatientHome.Value;
        }

        if (dto.HasDrivingLicense.HasValue)
        {
            profile.HasDrivingLicense = dto.HasDrivingLicense.Value;
        }

        if (dto.AcceptCollaborationTerms.HasValue)
        {
            profile.AcceptCollaborationTerms = dto.AcceptCollaborationTerms.Value;
        }

        if (dto.AcceptPatientConfidentiality.HasValue)
        {
            profile.AcceptPatientConfidentiality = dto.AcceptPatientConfidentiality.Value;
        }

        if (dto.AcceptProfessionalEthics.HasValue)
        {
            profile.AcceptProfessionalEthics = dto.AcceptProfessionalEthics.Value;
        }

        if (dto.AcceptDocumentReviewConsent.HasValue)
        {
            profile.AcceptDocumentReviewConsent = dto.AcceptDocumentReviewConsent.Value;
        }

        if (dto.ShiftPreferences != null)
        {
            profile.ShiftPreferencesJson = Serialize(dto.ShiftPreferences);
        }

        if (dto.ServiceAreas != null)
        {
            profile.ServiceAreasJson = Serialize(dto.ServiceAreas);
        }

        if (dto.Skills != null)
        {
            profile.SkillsJson = Serialize(dto.Skills);
        }

        if (dto.CustomSkills != null)
        {
            profile.CustomSkillsJson = Serialize(dto.CustomSkills);
        }

        if (dto.Certificates != null)
        {
            profile.CertificatesJson = Serialize(dto.Certificates);
        }

        profile.MobileNumber = user.PhoneNumber;
        profile.RegisteredRole ??= await ResolveCaregiverRoleAsync(user);
        profile.CooperationType ??= profile.RegisteredRole;
        profile.LastUpdatedAt = DateTime.UtcNow;
        profile.LastUpdatedByUserId = actorUserId ?? userId;
        profile.LastUpdatedByName = !string.IsNullOrWhiteSpace(actorName) ? actorName : $"{user.FirstName} {user.LastName}".Trim();

        user.FirstName = profile.FirstName ?? user.FirstName;
        user.LastName = profile.LastName ?? user.LastName;
        user.NationalCode = profile.NationalCode;
        if (!string.IsNullOrWhiteSpace(profile.Email))
        {
            user.Email = profile.Email;
        }

        profile.CompletionPercentage = CalculateCompletionPercentage(profile);
        profile.IsCompleted = profile.IsCompleted || profile.CompletionPercentage == 100;
        RefreshEmploymentStatus(profile);

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync(
            actorUserId,
            isAdmin ? "AdminUpdateCaregiverProfile" : "UpdateCaregiverProfile",
            "CaregiverProfile",
            userId,
            $"مرحله جاری: {profile.CurrentStep}, درصد تکمیل: {profile.CompletionPercentage}",
            null);

        return MapToDto(profile, await GetCaregiverAuditLogsAsync(userId));
    }

    public async Task<CaregiverProfileDto> CompleteProfileAsync(string userId, string? actorUserId = null, string? actorName = null, bool force = false)
    {
        var profile = await GetOrCreateProfileAsync(userId);
        profile.CompletionPercentage = CalculateCompletionPercentage(profile);

        if (!force && profile.CompletionPercentage < 100)
        {
            throw new InvalidOperationException("برای تکمیل نهایی، تمام مراحل الزامی را تکمیل کنید.");
        }

        profile.IsCompleted = true;
        profile.ForceCompletedByAdmin = force;
        profile.CurrentStep = 10;
        profile.SubmittedAt ??= DateTime.UtcNow;
        profile.LastUpdatedAt = DateTime.UtcNow;
        profile.LastUpdatedByUserId = actorUserId ?? userId;
        profile.LastUpdatedByName = actorName;
        RefreshEmploymentStatus(profile);

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync(
            actorUserId,
            force ? "ForceCompleteCaregiverProfile" : "CompleteCaregiverProfile",
            "CaregiverProfile",
            userId,
            force ? "پروفایل توسط مدیریت تکمیل نهایی شد." : "پروفایل توسط کاربر ثبت نهایی شد.",
            null);

        if (!force)
        {
            await NotifyAdminsAsync(
                "پروفایل استخدامی جدید",
                $"پروفایل استخدامی {profile.FirstName} {profile.LastName} برای بررسی نهایی ثبت شد.",
                NotificationType.System,
                userId);
        }

        return MapToDto(profile, await GetCaregiverAuditLogsAsync(userId));
    }

    public async Task<CaregiverProfileDocumentDto> UploadDocumentAsync(string userId, string documentType, string fileUrl, string fileName, string? mimeType = null, string? actorUserId = null, string? actorName = null, bool isAdmin = false)
    {
        var profile = await GetOrCreateProfileAsync(userId);
        var normalizedType = NormalizeRequired(documentType);
        var normalizedUrl = NormalizeRequired(fileUrl);
        var normalizedFileName = NormalizeRequired(fileName);

        var existingDocument = profile.Documents.FirstOrDefault(x => x.DocumentType.Equals(normalizedType, StringComparison.OrdinalIgnoreCase));
        if (existingDocument == null)
        {
            existingDocument = new CaregiverProfileDocument
            {
                DocumentType = normalizedType
            };
            profile.Documents.Add(existingDocument);
        }

        existingDocument.FileUrl = normalizedUrl;
        existingDocument.FileName = normalizedFileName;
        existingDocument.MimeType = NormalizeOptional(mimeType);
        existingDocument.UploadedAt = DateTime.UtcNow;
        existingDocument.Status = CaregiverProfileDocumentStatus.PendingReview;
        existingDocument.ReviewNote = null;
        existingDocument.ReviewedAt = null;
        existingDocument.ReviewedByUserId = null;
        existingDocument.ReviewedByName = null;

        profile.LastUpdatedAt = DateTime.UtcNow;
        profile.LastUpdatedByUserId = actorUserId ?? userId;
        profile.LastUpdatedByName = actorName;
        profile.CompletionPercentage = CalculateCompletionPercentage(profile);
        RefreshEmploymentStatus(profile);

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync(
            actorUserId,
            isAdmin ? "AdminUploadCaregiverDocument" : "UploadCaregiverDocument",
            "CaregiverProfileDocument",
            userId,
            $"مدرک {normalizedType} بارگذاری شد.",
            null);

        if (!isAdmin)
        {
            await NotifyAdminsAsync(
                "مدرک استخدامی جدید",
                $"مدرک {normalizedType} برای {profile.FirstName} {profile.LastName} بارگذاری شد.",
                NotificationType.System,
                userId);
        }

        return MapDocument(existingDocument);
    }

    public async Task<CaregiverProfileDocumentDto> UpdateDocumentStatusAsync(string userId, int documentId, UpdateCaregiverDocumentStatusDto dto, string actorUserId, string actorName)
    {
        var profile = await _context.CaregiverProfiles
            .Include(x => x.User)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.UserId == userId)
            ?? throw new KeyNotFoundException("پروفایل استخدامی یافت نشد.");

        var document = profile.Documents.FirstOrDefault(x => x.Id == documentId)
            ?? throw new KeyNotFoundException("مدرک موردنظر یافت نشد.");

        document.Status = dto.Status;
        document.ReviewNote = NormalizeOptional(dto.ReviewNote);
        document.ExpireAt = dto.ExpireAt;
        document.ReviewedAt = DateTime.UtcNow;
        document.ReviewedByUserId = actorUserId;
        document.ReviewedByName = actorName;

        profile.ReviewedAt = DateTime.UtcNow;
        profile.ReviewedByUserId = actorUserId;
        profile.ReviewedByName = actorName;
        profile.ReviewNote = NormalizeOptional(dto.ReviewNote) ?? profile.ReviewNote;
        profile.LastUpdatedAt = DateTime.UtcNow;
        profile.LastUpdatedByUserId = actorUserId;
        profile.LastUpdatedByName = actorName;
        profile.CompletionPercentage = CalculateCompletionPercentage(profile);
        RefreshEmploymentStatus(profile);

        await _context.SaveChangesAsync();
        await _auditLogService.LogAsync(
            actorUserId,
            "ReviewCaregiverDocument",
            "CaregiverProfileDocument",
            userId,
            $"وضعیت مدرک {document.DocumentType} به {ToDocumentStatusLabel(dto.Status)} تغییر کرد.",
            null);

        await _userNotificationService.CreateNotificationAsync(
            userId,
            $"به‌روزرسانی مدرک {document.DocumentType}",
            BuildDocumentReviewMessage(document),
            NotificationType.System,
            documentId.ToString(),
            "/nurse-portal/employment-profile");

        return MapDocument(document);
    }

    private async Task<CaregiverProfile> GetOrCreateProfileAsync(string userId)
    {
        var profile = await _context.CaregiverProfiles
            .Include(x => x.User)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile != null)
        {
            profile.MobileNumber = profile.User.PhoneNumber;
            profile.RegisteredRole ??= await ResolveCaregiverRoleAsync(profile.User);
            return profile;
        }

        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("کاربر یافت نشد.");
        var registeredRole = await ResolveCaregiverRoleAsync(user)
            ?? throw new InvalidOperationException("این کاربر جزو پرسنل درمانی پشتیبانی‌شده نیست.");

        profile = new CaregiverProfile
        {
            UserId = userId,
            User = user,
            RegisteredRole = registeredRole,
            CooperationType = registeredRole,
            FirstName = user.FirstName,
            LastName = user.LastName,
            NationalCode = user.NationalCode,
            MobileNumber = user.PhoneNumber,
            Email = user.Email,
            CurrentStep = 1,
            EmploymentStatus = CaregiverEmploymentApprovalStatus.Draft
        };

        _context.CaregiverProfiles.Add(profile);
        return profile;
    }

    private async Task EnsureNationalCodeIsUniqueAsync(string nationalCode, string currentUserId)
    {
        var normalized = NormalizeRequired(nationalCode);
        var exists = await _context.Users.AnyAsync(x => x.Id != currentUserId && x.NationalCode == normalized);
        if (exists)
        {
            throw new InvalidOperationException("کد ملی واردشده قبلاً ثبت شده است.");
        }
    }

    private async Task<string?> ResolveCaregiverRoleAsync(User user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        return roles.FirstOrDefault(role => CaregiverRoles.Contains(role));
    }

    private static string NormalizeRequired(string value)
    {
        var normalized = NormalizeOptional(value);
        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new InvalidOperationException("مقدار ارسالی معتبر نیست.");
        }

        return normalized;
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static string Serialize<T>(T value)
    {
        return JsonSerializer.Serialize(value, JsonOptions);
    }

    private static List<T> DeserializeList<T>(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<T>();
        }

        try
        {
            return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? new List<T>();
        }
        catch
        {
            return new List<T>();
        }
    }

    private static string ToEmploymentStatusLabel(CaregiverEmploymentApprovalStatus status)
    {
        return status switch
        {
            CaregiverEmploymentApprovalStatus.Draft => "پیش‌نویس",
            CaregiverEmploymentApprovalStatus.PendingReview => "در انتظار بررسی",
            CaregiverEmploymentApprovalStatus.UnderReview => "در حال بررسی",
            CaregiverEmploymentApprovalStatus.Approved => "تایید شده",
            CaregiverEmploymentApprovalStatus.NeedsCorrection => "نیاز به اصلاح",
            CaregiverEmploymentApprovalStatus.Rejected => "رد شده",
            _ => "نامشخص"
        };
    }

    private static string ToDocumentStatusLabel(CaregiverProfileDocumentStatus status)
    {
        return status switch
        {
            CaregiverProfileDocumentStatus.PendingReview => "در انتظار بررسی",
            CaregiverProfileDocumentStatus.Approved => "تایید شد",
            CaregiverProfileDocumentStatus.NeedsCorrection => "نیاز به اصلاح",
            CaregiverProfileDocumentStatus.Rejected => "رد شد",
            _ => "نامشخص"
        };
    }

    private static int CalculateCompletionPercentage(CaregiverProfile profile)
    {
        var completedSteps = 0;

        if (!string.IsNullOrWhiteSpace(profile.FirstName) &&
            !string.IsNullOrWhiteSpace(profile.LastName) &&
            !string.IsNullOrWhiteSpace(profile.FatherName) &&
            !string.IsNullOrWhiteSpace(profile.NationalCode) &&
            !string.IsNullOrWhiteSpace(profile.BirthCertificateNumber) &&
            profile.DateOfBirth.HasValue &&
            !string.IsNullOrWhiteSpace(profile.BirthPlace) &&
            !string.IsNullOrWhiteSpace(profile.Gender) &&
            !string.IsNullOrWhiteSpace(profile.MaritalStatus) &&
            !string.IsNullOrWhiteSpace(profile.Nationality) &&
            !string.IsNullOrWhiteSpace(profile.PersonalPhotoUrl))
        {
            completedSteps++;
        }

        if (!string.IsNullOrWhiteSpace(profile.MobileNumber) &&
            !string.IsNullOrWhiteSpace(profile.FullAddress) &&
            !string.IsNullOrWhiteSpace(profile.Province) &&
            !string.IsNullOrWhiteSpace(profile.City) &&
            !string.IsNullOrWhiteSpace(profile.PostalCode))
        {
            completedSteps++;
        }

        if (!string.IsNullOrWhiteSpace(profile.CooperationType) &&
            profile.ExperienceYears.HasValue &&
            !string.IsNullOrWhiteSpace(profile.CurrentEmploymentStatus) &&
            DeserializeList<string>(profile.ShiftPreferencesJson).Count > 0 &&
            profile.ServiceRadiusKm.HasValue &&
            DeserializeList<CoverageAreaDto>(profile.ServiceAreasJson).Count > 0)
        {
            completedSteps++;
        }

        if (DeserializeList<string>(profile.SkillsJson).Count + DeserializeList<string>(profile.CustomSkillsJson).Count > 0)
        {
            completedSteps++;
        }

        if (!string.IsNullOrWhiteSpace(profile.LatestDegree) &&
            !string.IsNullOrWhiteSpace(profile.Major) &&
            !string.IsNullOrWhiteSpace(profile.University) &&
            profile.GraduationYear.HasValue)
        {
            completedSteps++;
        }

        if (DeserializeList<CourseCertificateDto>(profile.CertificatesJson).Count > 0)
        {
            completedSteps++;
        }

        var uploadedTypes = profile.Documents
            .Select(x => x.DocumentType)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        if (RequiredDocumentTypes.All(uploadedTypes.Contains))
        {
            completedSteps++;
        }

        completedSteps++;

        if (!string.IsNullOrWhiteSpace(profile.EmergencyContactName) &&
            !string.IsNullOrWhiteSpace(profile.EmergencyContactRelationship) &&
            !string.IsNullOrWhiteSpace(profile.EmergencyContactMobile) &&
            !string.IsNullOrWhiteSpace(profile.EmergencyContactAddress))
        {
            completedSteps++;
        }

        if (profile.AcceptCollaborationTerms &&
            profile.AcceptPatientConfidentiality &&
            profile.AcceptProfessionalEthics &&
            profile.AcceptDocumentReviewConsent)
        {
            completedSteps++;
        }

        return completedSteps * 10;
    }

    private static (int Pending, int Approved, int NeedsCorrection, int Rejected) BuildDocumentStats(IEnumerable<CaregiverProfileDocument> documents)
    {
        return (
            documents.Count(x => x.Status == CaregiverProfileDocumentStatus.PendingReview),
            documents.Count(x => x.Status == CaregiverProfileDocumentStatus.Approved),
            documents.Count(x => x.Status == CaregiverProfileDocumentStatus.NeedsCorrection),
            documents.Count(x => x.Status == CaregiverProfileDocumentStatus.Rejected)
        );
    }

    private static string ToDocumentStatusSummary(IEnumerable<CaregiverProfileDocument>? documents)
    {
        if (documents == null)
        {
            return "ارسال نشده";
        }

        var stats = BuildDocumentStats(documents);
        if (stats.Rejected > 0)
        {
            return "رد شده";
        }

        if (stats.NeedsCorrection > 0)
        {
            return "نیاز به اصلاح";
        }

        if (stats.Pending > 0)
        {
            return "در انتظار بررسی";
        }

        if (stats.Approved > 0)
        {
            return "تایید شده";
        }

        return "ارسال نشده";
    }

    private static void RefreshEmploymentStatus(CaregiverProfile profile)
    {
        var stats = BuildDocumentStats(profile.Documents);
        if (!profile.IsCompleted)
        {
            profile.EmploymentStatus = CaregiverEmploymentApprovalStatus.Draft;
            return;
        }

        if (stats.Rejected > 0)
        {
            profile.EmploymentStatus = CaregiverEmploymentApprovalStatus.Rejected;
            return;
        }

        if (stats.NeedsCorrection > 0)
        {
            profile.EmploymentStatus = CaregiverEmploymentApprovalStatus.NeedsCorrection;
            return;
        }

        if (stats.Pending > 0)
        {
            profile.EmploymentStatus = profile.Documents.Count == 0
                ? CaregiverEmploymentApprovalStatus.PendingReview
                : CaregiverEmploymentApprovalStatus.UnderReview;
            return;
        }

        var uploadedTypes = profile.Documents.Select(x => x.DocumentType).ToHashSet(StringComparer.OrdinalIgnoreCase);
        profile.EmploymentStatus = RequiredDocumentTypes.All(uploadedTypes.Contains) && profile.Documents.Any()
            ? CaregiverEmploymentApprovalStatus.Approved
            : CaregiverEmploymentApprovalStatus.PendingReview;
    }

    private static string BuildDocumentReviewMessage(CaregiverProfileDocument document)
    {
        var note = string.IsNullOrWhiteSpace(document.ReviewNote)
            ? string.Empty
            : $" دلیل/توضیح: {document.ReviewNote}";
        return $"وضعیت مدرک {document.DocumentType} به {ToDocumentStatusLabel(document.Status)} تغییر کرد.{note}";
    }

    private async Task<List<AuditLogDto>> GetCaregiverAuditLogsAsync(string userId)
    {
        var actorNames = await _context.Users
            .AsNoTracking()
            .Select(x => new
            {
                x.Id,
                FullName = $"{x.FirstName} {x.LastName}".Trim()
            })
            .ToDictionaryAsync(x => x.Id, x => string.IsNullOrWhiteSpace(x.FullName) ? x.Id : x.FullName);

        var logs = await _context.AuditLogs
            .AsNoTracking()
            .Where(x => x.EntityId == userId && (x.EntityName == "CaregiverProfile" || x.EntityName == "CaregiverProfileDocument"))
            .OrderByDescending(x => x.CreatedAt)
            .Take(100)
            .ToListAsync();

        return logs.Select(x => new AuditLogDto
        {
            Id = x.Id,
            Action = x.Action,
            Details = x.Details,
            IpAddress = x.IpAddress,
            CreatedAt = x.CreatedAt,
            PerformedBy = x.UserId != null && actorNames.TryGetValue(x.UserId, out var name) ? name : "نامشخص"
        }).ToList();
    }

    private CaregiverProfileDto MapToDto(CaregiverProfile profile, List<AuditLogDto> auditLogs)
    {
        return new CaregiverProfileDto
        {
            Id = profile.Id,
            UserId = profile.UserId,
            RegisteredRole = profile.RegisteredRole,
            FirstName = profile.FirstName ?? profile.User.FirstName,
            LastName = profile.LastName ?? profile.User.LastName,
            FatherName = profile.FatherName,
            NationalCode = profile.NationalCode,
            BirthCertificateNumber = profile.BirthCertificateNumber,
            DateOfBirth = profile.DateOfBirth,
            BirthPlace = profile.BirthPlace,
            Gender = profile.Gender,
            MaritalStatus = profile.MaritalStatus,
            ChildrenCount = profile.ChildrenCount,
            Nationality = profile.Nationality,
            PersonalPhotoUrl = profile.PersonalPhotoUrl,
            MobileNumber = profile.User.PhoneNumber,
            LandlinePhone = profile.LandlinePhone,
            Email = profile.Email ?? profile.User.Email,
            FullAddress = profile.FullAddress,
            Province = profile.Province,
            City = profile.City,
            PostalCode = profile.PostalCode,
            Latitude = profile.Latitude,
            Longitude = profile.Longitude,
            CooperationType = profile.CooperationType ?? profile.RegisteredRole,
            NursingSystemNumber = profile.NursingSystemNumber,
            ExperienceYears = profile.ExperienceYears,
            LastWorkplace = profile.LastWorkplace,
            CurrentEmploymentStatus = profile.CurrentEmploymentStatus,
            ShiftPreferences = DeserializeList<string>(profile.ShiftPreferencesJson),
            CanStayAtPatientHome = profile.CanStayAtPatientHome,
            VehicleType = profile.VehicleType,
            HasDrivingLicense = profile.HasDrivingLicense,
            ServiceRadiusKm = profile.ServiceRadiusKm,
            ServiceAreas = DeserializeList<CoverageAreaDto>(profile.ServiceAreasJson),
            Skills = DeserializeList<string>(profile.SkillsJson),
            CustomSkills = DeserializeList<string>(profile.CustomSkillsJson),
            LatestDegree = profile.LatestDegree,
            Major = profile.Major,
            University = profile.University,
            GraduationYear = profile.GraduationYear,
            GPA = profile.GPA,
            Certificates = DeserializeList<CourseCertificateDto>(profile.CertificatesJson),
            BankName = profile.BankName,
            AccountNumber = profile.AccountNumber,
            CardNumber = profile.CardNumber,
            Iban = profile.Iban,
            EmergencyContactName = profile.EmergencyContactName,
            EmergencyContactRelationship = profile.EmergencyContactRelationship,
            EmergencyContactMobile = profile.EmergencyContactMobile,
            EmergencyContactPhone = profile.EmergencyContactPhone,
            EmergencyContactAddress = profile.EmergencyContactAddress,
            AcceptCollaborationTerms = profile.AcceptCollaborationTerms,
            AcceptPatientConfidentiality = profile.AcceptPatientConfidentiality,
            AcceptProfessionalEthics = profile.AcceptProfessionalEthics,
            AcceptDocumentReviewConsent = profile.AcceptDocumentReviewConsent,
            CompletionPercentage = profile.CompletionPercentage,
            CurrentStep = profile.CurrentStep,
            IsCompleted = profile.IsCompleted,
            EmploymentStatus = profile.EmploymentStatus,
            EmploymentStatusLabel = ToEmploymentStatusLabel(profile.EmploymentStatus),
            ReviewNote = profile.ReviewNote,
            ForceCompletedByAdmin = profile.ForceCompletedByAdmin,
            CreatedAt = profile.CreatedAt,
            SubmittedAt = profile.SubmittedAt,
            LastUpdatedAt = profile.LastUpdatedAt,
            LastUpdatedByName = profile.LastUpdatedByName,
            ReviewedAt = profile.ReviewedAt,
            ReviewedByName = profile.ReviewedByName,
            Documents = profile.Documents
                .OrderBy(x => x.DocumentType)
                .Select(MapDocument)
                .ToList(),
            AuditLogs = auditLogs
        };
    }

    private static CaregiverProfileDocumentDto MapDocument(CaregiverProfileDocument document)
    {
        return new CaregiverProfileDocumentDto
        {
            Id = document.Id,
            DocumentType = document.DocumentType,
            FileUrl = document.FileUrl,
            FileName = document.FileName,
            MimeType = document.MimeType,
            UploadedAt = document.UploadedAt,
            Status = document.Status,
            StatusLabel = ToDocumentStatusLabel(document.Status),
            ReviewNote = document.ReviewNote,
            ReviewedAt = document.ReviewedAt,
            ReviewedByName = document.ReviewedByName,
            ExpireAt = document.ExpireAt
        };
    }

    private static CaregiverProfileDto CreateDraftDto(User user, string registeredRole)
    {
        return new CaregiverProfileDto
        {
            UserId = user.Id,
            RegisteredRole = registeredRole,
            CooperationType = registeredRole,
            FirstName = user.FirstName,
            LastName = user.LastName,
            NationalCode = user.NationalCode,
            MobileNumber = user.PhoneNumber,
            Email = user.Email,
            EmploymentStatus = CaregiverEmploymentApprovalStatus.Draft,
            EmploymentStatusLabel = ToEmploymentStatusLabel(CaregiverEmploymentApprovalStatus.Draft),
            CurrentStep = 1,
            CreatedAt = user.CreatedAt
        };
    }

    private async Task NotifyAdminsAsync(string title, string message, NotificationType type, string referenceId)
    {
        var recipients = new Dictionary<string, User>(StringComparer.Ordinal);
        foreach (var role in new[] { Roles.SuperAdmin, Roles.Admin, Roles.Manager, Roles.Supervisor })
        {
            var usersInRole = await _userManager.GetUsersInRoleAsync(role);
            foreach (var user in usersInRole)
            {
                recipients[user.Id] = user;
            }
        }

        foreach (var recipientId in recipients.Keys)
        {
            await _userNotificationService.CreateNotificationAsync(
                recipientId,
                title,
                message,
                type,
                referenceId,
                "/dashboard/admin/users");
        }
    }
}
