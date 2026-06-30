using Salmandyar.Application.DTOs.Assignments;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.Services.Assignments;

public interface ICareAssignmentService
{
    Task<AssignmentDto> CreateAssignmentAsync(CreateAssignmentDto dto, string? currentUserId = null);
    Task<AssignmentDto> UpdateAssignmentAsync(Guid id, UpdateAssignmentDto dto, string? currentUserId = null);
    Task UpdateAssignmentStatusAsync(Guid id, UpdateAssignmentStatusDto dto, string? currentUserId = null);
    Task<List<AssignmentDto>> GetCalendarAsync(DateTimeOffset start, DateTimeOffset end, int? patientId = null, string? caregiverId = null, AssignmentStatus? status = null);
    Task<PagedResponse<AssignmentDto>> GetAssignmentsPagedAsync(int pageNumber, int pageSize, DateTimeOffset? start, DateTimeOffset? end, string? search, int? patientId = null, string? caregiverId = null, AssignmentStatus? status = null);
}
