using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities.Contracts;

public class ContractField
{
    public int Id { get; set; }
    public int ContractTemplateId { get; set; }
    public virtual ContractTemplate ContractTemplate { get; set; } = null!;
    public string FieldKey { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public ContractFieldType FieldType { get; set; } = ContractFieldType.Text;
    public bool IsRequired { get; set; } = true;
    public string? Placeholder { get; set; }
    public string? ValidationJson { get; set; }
    public string? DefaultValueFromProfile { get; set; }
    public string? OptionsJson { get; set; }
    public int Order { get; set; }
}
