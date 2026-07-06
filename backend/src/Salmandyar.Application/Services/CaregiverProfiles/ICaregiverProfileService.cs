using Salmandyar.Application.DTOs.CaregiverProfiles;

namespace Salmandyar.Application.Services.CaregiverProfiles;

public interface ICaregiverProfileService
{
    Task<CaregiverProfileDto?> GetProfileByUserIdAsync(string userId);
    Task<CaregiverProfileStatusDto> GetProfileStatusAsync(string userId);
    Task<CaregiverDashboardDto> GetDashboardAsync(string userId);
    Task<CaregiverProfileDto> UpdateProfileAsync(string userId, UpdateCaregiverProfileDto dto, string? actorUserId = null, string? actorName = null, bool isAdmin = false);
    Task<CaregiverProfileDto> CompleteProfileAsync(string userId, string? actorUserId = null, string? actorName = null, bool force = false);
    Task<CaregiverProfileDocumentDto> UploadDocumentAsync(string userId, string documentType, string fileUrl, string fileName, string? mimeType = null, string? actorUserId = null, string? actorName = null, bool isAdmin = false);
    Task<CaregiverProfileDocumentDto> UpdateDocumentStatusAsync(string userId, int documentId, UpdateCaregiverDocumentStatusDto dto, string actorUserId, string actorName);
}
