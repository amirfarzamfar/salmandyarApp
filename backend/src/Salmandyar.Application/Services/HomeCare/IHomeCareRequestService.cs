using Salmandyar.Application.DTOs.HomeCare;

namespace Salmandyar.Application.Services.HomeCare;

public interface IHomeCareRequestService
{
    Task<HomeCareDraftDto> SaveDraftAsync(string userId, SaveHomeCareDraftDto dto);
    Task<HomeCareRequestDetailsDto> SubmitRequestAsync(string userId, CreateHomeCareRequestDto dto);
    Task<List<HomeCareRequestListItemDto>> GetMyRequestsAsync(string userId);
    Task<List<HomeCareRequestListItemDto>> GetAllRequestsAsync();
    Task<HomeCareRequestDetailsDto?> GetRequestByIdAsync(Guid requestId, string userId, bool elevatedAccess);
    Task<HomeCareMessageDto> SendMessageAsync(string userId, SendHomeCareMessageDto dto, IReadOnlyCollection<HomeCareUploadedFilePayload>? files);
    Task<HomeCareRequestDetailsDto?> UpdateStatusAsync(Guid requestId, UpdateHomeCareRequestStatusDto dto, string actorUserId);
    Task<HomeCareRequestDetailsDto?> AddRequestAttachmentsAsync(Guid requestId, string userId, string category, IReadOnlyCollection<HomeCareUploadedFilePayload> files);
}
