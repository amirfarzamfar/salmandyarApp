using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.HomeCare;
using Salmandyar.Application.Services.HomeCare;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/home-care")]
[Authorize]
public class HomeCareRequestsController : ControllerBase
{
    private readonly IHomeCareRequestService _service;

    public HomeCareRequestsController(IHomeCareRequestService service)
    {
        _service = service;
    }

    [HttpPost("drafts")]
    public async Task<ActionResult<HomeCareDraftDto>> SaveDraft([FromBody] SaveHomeCareDraftDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        return Ok(await _service.SaveDraftAsync(userId, dto));
    }

    [HttpPost("requests")]
    public async Task<ActionResult<HomeCareRequestDetailsDto>> SubmitRequest([FromBody] CreateHomeCareRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        return Ok(await _service.SubmitRequestAsync(userId, dto));
    }

    [HttpGet("requests/mine")]
    public async Task<ActionResult<List<HomeCareRequestListItemDto>>> GetMyRequests()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        return Ok(await _service.GetMyRequestsAsync(userId));
    }

    [HttpGet("requests")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<List<HomeCareRequestListItemDto>>> GetAllRequests()
    {
        return Ok(await _service.GetAllRequestsAsync());
    }

    [HttpGet("requests/{requestId:guid}")]
    public async Task<ActionResult<HomeCareRequestDetailsDto>> GetRequestById(Guid requestId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var elevatedAccess = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor);
        var request = await _service.GetRequestByIdAsync(requestId, userId, elevatedAccess);
        if (request == null)
        {
            return NotFound();
        }

        return Ok(request);
    }

    [HttpPatch("requests/{requestId:guid}/status")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<HomeCareRequestDetailsDto>> UpdateStatus(Guid requestId, [FromBody] UpdateHomeCareRequestStatusDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var request = await _service.UpdateStatusAsync(requestId, dto, userId);
        if (request == null)
        {
            return NotFound();
        }

        return Ok(request);
    }

    [HttpPost("requests/{requestId:guid}/attachments")]
    [RequestFormLimits(MultipartBodyLengthLimit = 50 * 1024 * 1024)]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<ActionResult<HomeCareRequestDetailsDto>> UploadRequestAttachments(
        Guid requestId,
        [FromForm] string category,
        [FromForm] List<IFormFile> files)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var request = await _service.AddRequestAttachmentsAsync(requestId, userId, category, await ToPayloadsAsync(files));
        if (request == null)
        {
            return NotFound();
        }

        return Ok(request);
    }

    [HttpPost("messages")]
    [RequestFormLimits(MultipartBodyLengthLimit = 50 * 1024 * 1024)]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<ActionResult<HomeCareMessageDto>> SendMessage(
        [FromForm] Guid conversationId,
        [FromForm] int messageType,
        [FromForm] string content,
        [FromForm] List<IFormFile>? files)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var message = await _service.SendMessageAsync(userId, new SendHomeCareMessageDto
        {
            ConversationId = conversationId,
            MessageType = (Domain.Enums.HomeCareMessageType)messageType,
            Content = content
        }, await ToPayloadsAsync(files));

        return Ok(message);
    }

    private static async Task<List<HomeCareUploadedFilePayload>> ToPayloadsAsync(IReadOnlyCollection<IFormFile>? files)
    {
        var result = new List<HomeCareUploadedFilePayload>();
        if (files == null || files.Count == 0)
        {
            return result;
        }

        foreach (var file in files)
        {
            await using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            result.Add(new HomeCareUploadedFilePayload
            {
                FileName = file.FileName,
                ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                Length = file.Length,
                Content = stream.ToArray()
            });
        }

        return result;
    }
}
