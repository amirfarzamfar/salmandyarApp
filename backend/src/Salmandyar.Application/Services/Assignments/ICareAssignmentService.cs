using Salmandyar.Application.DTOs.Assignments;

namespace Salmandyar.Application.Services.Assignments;

public interface ICareAssignmentService
{
    Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto dto);
    Task<AssignmentDto> UpdateAssignmentAsync(Guid id, UpdateAssignmentDto dto);
    Task UpdateAssignmentStatusAsync(Guid id, UpdateAssignmentStatusDto dto);
    Task<List<AssignmentDto>> GetCalendarAsync(DateTimeOffset start, DateTimeOffset end, int? patientId = null, string? caregiverId = null);
}
