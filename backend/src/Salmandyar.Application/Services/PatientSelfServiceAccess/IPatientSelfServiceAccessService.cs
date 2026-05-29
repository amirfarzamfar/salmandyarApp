namespace Salmandyar.Application.Services.PatientSelfServiceAccess;

public interface IPatientSelfServiceAccessService
{
    Task<PatientSelfServiceAccessSummaryDto> GetPatientSummaryAsync(int careRecipientId, string currentUserId);
    Task<PatientSelfServiceAccessSummaryDto?> GetAdminSummaryByUserIdAsync(string userId);
    Task<PatientSelfServiceAccessSummaryDto?> UpdateByUserIdAsync(string userId, UpdatePatientSelfServiceAccessDto dto, string adminUserId);
    Task<List<PatientSelfServiceAccessAuditDto>> GetAuditTrailByUserIdAsync(string userId);
    Task EnsureFeatureSubmissionAllowedAsync(string actorUserId, int careRecipientId, string featureKey);
}

public class UpdatePatientSelfServiceAccessDto
{
    public bool IsEnabled { get; set; }
    public string? AvailableFromDate { get; set; }
    public string? AvailableToDate { get; set; }
    public string? DailyAccessStartTime { get; set; }
    public string? DailyAccessEndTime { get; set; }
    public List<PatientSelfServiceFeatureUpdateDto> Features { get; set; } = new();
}

public class PatientSelfServiceFeatureUpdateDto
{
    public string FeatureKey { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
}

public class PatientSelfServiceAccessSummaryDto
{
    public int CareRecipientId { get; set; }
    public bool IsConfigured { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsCurrentlyWithinWindow { get; set; }
    public bool IsExpired { get; set; }
    public string? StatusMessage { get; set; }
    public DateTime? AccessStartAtUtc { get; set; }
    public DateTime? AccessEndAtUtc { get; set; }
    public string? DailyAccessStartTime { get; set; }
    public string? DailyAccessEndTime { get; set; }
    public List<PatientSelfServiceFeatureStatusDto> Features { get; set; } = new();
}

public class PatientSelfServiceFeatureStatusDto
{
    public string FeatureKey { get; set; } = string.Empty;
    public string FeatureTitle { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public bool CanSubmitNow { get; set; }
    public string? Message { get; set; }
}

public class PatientSelfServiceAccessAuditDto
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Details { get; set; }
    public DateTime CreatedAt { get; set; }
    public string PerformedBy { get; set; } = string.Empty;
}

public class PatientSelfServiceAccessDeniedException : InvalidOperationException
{
    public PatientSelfServiceAccessDeniedException(string message)
        : base(message)
    {
    }
}
