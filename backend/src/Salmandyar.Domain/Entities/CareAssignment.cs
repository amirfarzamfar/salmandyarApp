using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities;

public class CareAssignment
{
    public Guid Id { get; set; }

    public int PatientId { get; set; }
    public virtual CareRecipient Patient { get; set; } = null!;

    public string CaregiverId { get; set; } = string.Empty;
    public virtual User Caregiver { get; set; } = null!;

    public AssignmentType AssignmentType { get; set; }
    public ShiftSlot? ShiftSlot { get; set; }

    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }

    public AssignmentStatus Status { get; set; }
    public bool IsPrimaryCaregiver { get; set; }
    public string Notes { get; set; } = string.Empty;

    // Audit Fields
    public DateTimeOffset CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? LastModifiedAt { get; set; }
}
