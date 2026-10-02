using Salmandyar.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using Salmandyar.Domain.Entities.Contracts;

namespace Salmandyar.Application.DTOs.Contracts;

public class ContractTemplateDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string CooperationType { get; set; } = string.Empty;
    public string ContractText { get; set; } = string.Empty;
    public int Version { get; set; }
    public bool IsActive { get; set; }
    public DateTime? EffectiveStartDate { get; set; }
    public DateTime? EffectiveEndDate { get; set; }
    public DateTime? PublishedAt { get; set; }
    public List<ContractFieldDto> Fields { get; set; } = new();
    public int AssignmentCount { get; set; }
    public int SignedAssignmentCount { get; set; }
}

public class ContractFieldDto
{
    public int Id { get; set; }
    public int ContractTemplateId { get; set; }
    public string FieldKey { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public ContractFieldType FieldType { get; set; }
    public bool IsRequired { get; set; }
    public string? Placeholder { get; set; }
    public string? DefaultValueFromProfile { get; set; }
    public List<string>? Options { get; set; }
    public int Order { get; set; }
}

public class ContractAssignmentDto
{
    public int Id { get; set; }
    public int ContractTemplateId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? ContractNumber { get; set; }
    public ContractStatus Status { get; set; }
    public string StatusLabel { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? UserFullName { get; set; }
    public string? UserNationalCode { get; set; }
    public string? UserPhoneNumber { get; set; }
    public ContractTemplateSummaryDto Template { get; set; } = null!;
    public List<ContractFieldValueDto> FieldValues { get; set; } = new();
    public bool IsLocked => Status == ContractStatus.Signed || Status == ContractStatus.Terminated || Status == ContractStatus.Expired;
}

public class ContractTemplateSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int Version { get; set; }
    public string CooperationType { get; set; } = string.Empty;
}

public class ContractFieldValueDto
{
    public int? Id { get; set; }
    public int AssignmentId { get; set; }
    public int? ContractFieldId { get; set; }
    public string FieldKey { get; set; } = string.Empty;
    public string? StringValue { get; set; }
    public decimal? NumberValue { get; set; }
    public DateTime? DateValue { get; set; }
    public object? Value
    {
        get
        {
            if (StringValue != null) return StringValue;
            if (NumberValue.HasValue) return NumberValue.Value;
            if (DateValue.HasValue) return DateValue.Value;
            return null;
        }
    }
}

public class ContractDocumentDto
{
    public int AssignmentId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public string RenderedHtml { get; set; } = string.Empty;
    public ContractStatus Status { get; set; }
    public DateTime? SignedAt { get; set; }
    public string? ContentHash { get; set; }
    public Guid? TransactionId { get; set; }
    public bool IsSnapshot { get; set; }
}

public class ContractAuditLogDto
{
    public int Id { get; set; }
    public ContractAuditActionType ActionType { get; set; }
    public string ActionTypeLabel { get; set; } = string.Empty;
    public DateTime PerformedAt { get; set; }
    public string? UserFullName { get; set; }
    public string? ClientIp { get; set; }
    public Guid TransactionId { get; set; }
    public string? ContentHash { get; set; }
    public string? Details { get; set; }
}

public class CreateContractTemplateDto
{
    [Required]
    [MaxLength(400)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(128)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(128)]
    public string? CooperationType { get; set; }

    [Required]
    public string ContractText { get; set; } = string.Empty;

    public bool IsActive { get; set; }
    public DateTime? EffectiveStartDate { get; set; }
    public DateTime? EffectiveEndDate { get; set; }
    public bool Publish { get; set; }
    public List<UpsertContractFieldDto> Fields { get; set; } = new();
}

public class UpdateContractTemplateDto
{
    [Required]
    [MaxLength(400)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(128)]
    public string? CooperationType { get; set; }

    [Required]
    public string ContractText { get; set; } = string.Empty;

    public bool IsActive { get; set; }
    public DateTime? EffectiveStartDate { get; set; }
    public DateTime? EffectiveEndDate { get; set; }
    public List<UpsertContractFieldDto> Fields { get; set; } = new();
}

public class UpsertContractFieldDto
{
    public int? Id { get; set; }

    [Required]
    [MaxLength(128)]
    public string FieldKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(256)]
    public string Label { get; set; } = string.Empty;

    public ContractFieldType FieldType { get; set; }
    public bool IsRequired { get; set; }

    [MaxLength(256)]
    public string? Placeholder { get; set; }

    [MaxLength(256)]
    public string? DefaultValueFromProfile { get; set; }

    public List<string>? Options { get; set; }
    public int Order { get; set; }
}

public class AssignContractDto
{
    [Required]
    public int ContractTemplateId { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class SaveContractFieldValuesDto
{
    [Required]
    public int AssignmentId { get; set; }

    public List<ContractFieldValueInputDto> FieldValues { get; set; } = new();
}

public class ContractFieldValueInputDto
{
    [Required]
    [MaxLength(128)]
    public string FieldKey { get; set; } = string.Empty;
    public string? StringValue { get; set; }
    public decimal? NumberValue { get; set; }
    public DateTime? DateValue { get; set; }
}

public class SignContractDto
{
    [Required]
    public int AssignmentId { get; set; }

    [Required]
    public bool AgreedToTerms { get; set; }
}

public class MyContractStatusDto
{
    public bool HasActiveAssignment { get; set; }
    public ContractAssignmentDto? Assignment { get; set; }
    public List<ContractFieldDto> TemplateFields { get; set; } = new();
    public int ActiveTemplateVersion { get; set; }
    public string? ActiveTemplateTitle { get; set; }
    public bool IdentityVerified { get; set; }
    public bool ProfessionalEligibilityVerified { get; set; }
    public bool ContractSigned { get; set; }
}

public class UserContractAssignmentSummaryDto
{
    public int AssignmentId { get; set; }
    public int ContractTemplateId { get; set; }
    public string TemplateTitle { get; set; } = string.Empty;
    public int TemplateVersion { get; set; }
    public string? ContractNumber { get; set; }
    public ContractStatus Status { get; set; }
    public string StatusLabel { get; set; } = string.Empty;
    public DateTime AssignedAt { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class ToggleContractTemplateDto
{
    public bool IsActive { get; set; }
}
