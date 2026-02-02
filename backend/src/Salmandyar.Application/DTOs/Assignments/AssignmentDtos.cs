using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Assignments;

public class CreateAssignmentDto
{
    public int PatientId { get; set; }
    public string CaregiverId { get; set; } = string.Empty;
    public AssignmentType AssignmentType { get; set; }
    public ShiftSlot? ShiftSlot { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public bool IsPrimaryCaregiver { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class UpdateAssignmentStatusDto
{
    public AssignmentStatus Status { get; set; }
}

public class UpdateAssignmentDto
{
    public int PatientId { get; set; }
    public string CaregiverId { get; set; } = string.Empty;
    public AssignmentType AssignmentType { get; set; }
    public ShiftSlot? ShiftSlot { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public bool IsPrimaryCaregiver { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class AssignmentDto
{
    public Guid Id { get; set; }
    public int PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string CaregiverId { get; set; } = string.Empty;
    public string CaregiverName { get; set; } = string.Empty;
    public AssignmentType AssignmentType { get; set; }
    public ShiftSlot? ShiftSlot { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public AssignmentStatus Status { get; set; }
    public bool IsPrimaryCaregiver { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}
