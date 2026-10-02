using Salmandyar.Application.DTOs.Contracts;
using Salmandyar.Application.DTOs.Common;

namespace Salmandyar.Application.Services.Contracts;

public interface IContractService
{
    #region Template Management (Admin)

    Task<PagedResponse<ContractTemplateDto>> GetTemplatesAsync(
        int page, int pageSize, string? search, CancellationToken ct = default);

    Task<ContractTemplateDto?> GetTemplateAsync(int id, bool includeFields = true, CancellationToken ct = default);

    Task<ContractTemplateDto> CreateTemplateAsync(
        CreateContractTemplateDto dto, string adminUserId, CancellationToken ct = default);

    Task<ContractTemplateDto> UpdateTemplateAsync(
        int id, UpdateContractTemplateDto dto, string adminUserId, CancellationToken ct = default);

    Task ToggleTemplateActiveAsync(int id, bool isActive, string adminUserId, CancellationToken ct = default);

    Task<string> PreviewTemplateAsync(int templateId, int? assignmentId = null, string? userId = null, CancellationToken ct = default);

    #endregion

    #region Assignments

    Task<ContractAssignmentDto> AssignContractAsync(AssignContractDto dto, string adminUserId, CancellationToken ct = default);

    Task<PagedResponse<ContractAssignmentDto>> GetAssignmentsAsync(
        int page, int pageSize, string? search, int? templateId = null, string? userId = null,
        Salmandyar.Domain.Enums.ContractStatus? status = null, CancellationToken ct = default);

    Task<ContractAssignmentDto?> GetAssignmentAsync(int id, CancellationToken ct = default);

    Task<List<UserContractAssignmentSummaryDto>> GetUserAssignmentsAsync(string userId, CancellationToken ct = default);

    #endregion

    #region My Contract (Caregiver/Nurse)

    Task<MyContractStatusDto> GetMyActiveContractAsync(string userId, bool autoAssignDefault = true, CancellationToken ct = default);

    Task<ContractAssignmentDto> SaveMyFieldValuesAsync(
        SaveContractFieldValuesDto dto, string caregiverUserId, CancellationToken ct = default);

    Task<ContractAssignmentDto> SignMyContractAsync(
        SignContractDto dto,
        string caregiverUserId,
        string? clientIp = null,
        string? userAgent = null,
        string authMethod = "Jwt",
        CancellationToken ct = default);

    Task<ContractDocumentDto> GetMyContractDocumentAsync(string userId, int? assignmentId = null, CancellationToken ct = default);

    #endregion

    #region Document & Audit

    Task<ContractDocumentDto> GetAssignmentDocumentAsync(int assignmentId, CancellationToken ct = default);

    Task<List<ContractAuditLogDto>> GetAssignmentAuditLogAsync(int assignmentId, CancellationToken ct = default);

    #endregion
}
