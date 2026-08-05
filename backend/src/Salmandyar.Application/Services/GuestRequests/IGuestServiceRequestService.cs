using Salmandyar.Application.DTOs.GuestRequests;

namespace Salmandyar.Application.Services.GuestRequests;

public interface IGuestServiceRequestService
{
    Task<GuestServiceRequestDetailsDto> SubmitRequestAsync(CreateGuestServiceRequestDto dto);
    Task<List<GuestServiceRequestListItemDto>> GetAllRequestsAsync();
    Task<GuestServiceRequestDetailsDto?> GetRequestByIdAsync(Guid id);
    Task<GuestServiceRequestDetailsDto> UpdateStatusAsync(Guid id, UpdateGuestServiceRequestStatusDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> AddNoteAsync(Guid id, AddGuestServiceRequestNoteDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> SendSmsAsync(Guid id, SendGuestServiceRequestSmsDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> ConvertToPatientAsync(Guid id, ConvertGuestServiceRequestToPatientDto dto, string actorUserId);
    Task<GuestServiceRequestDetailsDto> AssignCaregiverAsync(Guid id, AssignGuestServiceRequestCaregiverDto dto, string actorUserId);
}
