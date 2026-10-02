namespace Salmandyar.Domain.Entities.Contracts;

public class ContractFieldValue
{
    public int Id { get; set; }
    public int AssignmentId { get; set; }
    public virtual ContractAssignment Assignment { get; set; } = null!;
    public int? ContractFieldId { get; set; }
    public virtual ContractField? ContractField { get; set; }
    public string FieldKey { get; set; } = string.Empty;
    public string? StringValue { get; set; }
    public decimal? NumberValue { get; set; }
    public DateTime? DateValue { get; set; }
}
