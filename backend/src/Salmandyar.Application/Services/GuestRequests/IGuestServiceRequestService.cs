using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.DTOs.GuestRequests;

namespace Salmandyar.Application.Services.GuestRequests;

public interface IGuestServiceRequestService
{
    Task<GuestServiceRequestDetailsDto> SubmitRequestAsync(CreateGuestServiceRequestDto dto);
    Task<GuestRequestDashboardStatsDto> GetDashboardStatsAsync();
    Task<PagedResponse<GuestServiceRequestListItemDto>> GetPagedRequestsAsync(GuestRequestQueryDto query);
    Task<List<GuestServiceRequestListItemDto>> GetAllRequestsAsync();
    Task<GuestServiceRequestDetailsDto?> GetRequestByIdAsync(Guid id);
    Task<GuestServiceRequestDetailsDto> UpdateStatusAsync(Guid id, UpdateGuestServiceRequestStatusDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> UpdatePriorityAsync(Guid id, UpdateGuestServiceRequestPriorityDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> AssignSupervisorAsync(Guid id, AssignGuestServiceRequestSupervisorDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> AssignCaregiverAsync(Guid id, AssignGuestServiceRequestCaregiverDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> AddNoteAsync(Guid id, AddGuestServiceRequestNoteDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> SendSmsAsync(Guid id, SendGuestServiceRequestSmsDto dto, string actorUserId);
    List<SmsTemplateDto> GetSmsTemplates(GuestServiceRequestDetailsDto? request = null);
    Task<List<GuestContactLogDto>> GetContactLogsAsync(Guid requestId);
    Task<GuestServiceRequestDetailsDto> CreateContactLogAsync(Guid requestId, CreateGuestContactLogDto dto, string actorUserId);
    Task<List<GuestFollowUpDto>> GetFollowUpsAsync(Guid requestId);
    Task<GuestServiceRequestDetailsDto> CreateFollowUpAsync(Guid requestId, CreateGuestFollowUpDto dto, string actorUserId);
    Task<GuestFollowUpDto> UpdateFollowUpAsync(Guid followUpId, UpdateGuestFollowUpDto dto, string actorUserId);
    Task<List<DuplicatePatientCandidateDto>> SearchDuplicatePatientsAsync(Guid requestId);
    Task<GuestServiceRequestDetailsDto> ConvertToPatientAsync(Guid id, ConvertGuestServiceRequestToPatientDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> RejectRequestAsync(Guid id, RejectGuestRequestDto dto, string actorUserId);
}
