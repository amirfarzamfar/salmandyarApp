using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.DTOs.PatientServices;
using Salmandyar.Application.Services.PatientServices;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/patient-services")]
public class PatientServicesController : ControllerBase
{
    private readonly IPatientServiceManagementService _service;

    public PatientServicesController(IPatientServiceManagementService service)
    {
        _service = service;
    }

    private string? CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    private string CurrentUserIdOrThrow => CurrentUserId ?? throw new UnauthorizedAccessException("کاربر احراز هویت نشده است.");

    private bool HasPermission(string permission)
    {
        return User.HasClaim(Permissions.ClaimType, permission) ||
               User.IsInRole(Roles.SuperAdmin) ||
               User.IsInRole(Roles.Admin);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResponse<PatientServiceListItemDto>), 200)]
    public async Task<ActionResult<PagedResponse<PatientServiceListItemDto>>> GetPaged(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchQuery = null,
        [FromQuery] int? careRecipientId = null,
        [FromQuery] int? serviceDefinitionId = null,
        [FromQuery] CareServiceStatus? status = null,
        [FromQuery] ServicePriority? priority = null,
        [FromQuery] string? performerId = null,
        [FromQuery] ServiceAssignmentStatus? assignmentStatus = null,
        [FromQuery] bool? onlyUnassigned = null,
        [FromQuery] ServiceNotificationStatus? notificationStatus = null,
        [FromQuery] bool? onlyWithNotification = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        if (!HasPermission(Permissions.Services.PatientServicesView) &&
            !User.IsInRole(Roles.Supervisor) &&
            !User.IsInRole(Roles.Manager))
            return Forbid();

        var filters = new PatientServiceQueryFilters
        {
            PageNumber = pageNumber,
            PageSize = Math.Clamp(pageSize, 1, 200),
            SearchQuery = searchQuery,
            CareRecipientId = careRecipientId,
            ServiceDefinitionId = serviceDefinitionId,
            Status = status,
            Priority = priority,
            PerformerId = performerId,
            AssignmentStatus = assignmentStatus,
            OnlyUnassigned = onlyUnassigned,
            NotificationStatus = notificationStatus,
            OnlyWithNotification = onlyWithNotification,
            FromDate = fromDate?.ToUniversalTime(),
            ToDate = toDate?.ToUniversalTime(),
            SortBy = sortBy,
            SortDescending = sortDescending
        };

        var result = await _service.GetPagedServicesAsync(filters);
        return Ok(result);
    }

    [HttpGet("statistics")]
    [ProducesResponseType(typeof(PatientServiceStatisticsDto), 200)]
    public async Task<ActionResult<PatientServiceStatisticsDto>> GetStatistics(
        [FromQuery] int? careRecipientId = null,
        [FromQuery] int? serviceDefinitionId = null,
        [FromQuery] CareServiceStatus? status = null,
        [FromQuery] string? performerId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        if (!HasPermission(Permissions.Services.PatientServicesView))
            return Forbid();

        var filters = new PatientServiceQueryFilters
        {
            CareRecipientId = careRecipientId,
            ServiceDefinitionId = serviceDefinitionId,
            Status = status,
            PerformerId = performerId,
            FromDate = fromDate?.ToUniversalTime(),
            ToDate = toDate?.ToUniversalTime()
        };

        return Ok(await _service.GetStatisticsAsync(filters));
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PatientServiceDetailDto), 200)]
    public async Task<ActionResult<PatientServiceDetailDto>> GetById(int id)
    {
        if (!HasPermission(Permissions.Services.PatientServicesView))
            return Forbid();

        var result = await _service.GetServiceByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PatientServiceDto), 201)]
    public async Task<IActionResult> Create([FromBody] CreatePatientServiceDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesCreate))
            return Forbid();

        try
        {
            var result = await _service.CreateServiceAsync(dto, CurrentUserIdOrThrow);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(PatientServiceDto), 200)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePatientServiceDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesEdit))
            return Forbid();

        var result = await _service.UpdateServiceAsync(id, dto, CurrentUserIdOrThrow);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!HasPermission(Permissions.Services.PatientServicesDelete))
            return Forbid();

        var result = await _service.DeleteServiceAsync(id, CurrentUserIdOrThrow);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromBody] CancelServiceRequest req)
    {
        if (!HasPermission(Permissions.Services.PatientServicesEdit) &&
            !HasPermission(Permissions.Services.PatientServicesStatus))
            return Forbid();

        var result = await _service.CancelServiceAsync(id, req.Reason ?? "لغو توسط ادمین", CurrentUserIdOrThrow);
        if (!result) return NotFound();
        return Ok(new { success = true });
    }

    [HttpPost("{id:int}/assign")]
    [ProducesResponseType(typeof(PatientServiceDto), 200)]
    public async Task<IActionResult> AssignProvider(int id, [FromBody] AssignServiceProviderDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesAssign))
            return Forbid();

        try
        {
            var result = await _service.AssignProviderAsync(id, dto, CurrentUserIdOrThrow);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/change-provider")]
    [ProducesResponseType(typeof(PatientServiceDto), 200)]
    public async Task<IActionResult> ChangeProvider(int id, [FromBody] AssignServiceProviderDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesAssign))
            return Forbid();

        try
        {
            var result = await _service.ChangeProviderAsync(id, dto, CurrentUserIdOrThrow);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/change-status")]
    [ProducesResponseType(typeof(PatientServiceDto), 200)]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] ChangeServiceStatusDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesStatus) &&
            !User.IsInRole(Roles.Nurse) &&
            !User.IsInRole(Roles.AssistantNurse))
            return Forbid();

        try
        {
            var result = await _service.ChangeStatusAsync(id, dto, CurrentUserIdOrThrow);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/start")]
    [ProducesResponseType(typeof(PatientServiceDto), 200)]
    public async Task<IActionResult> Start(int id)
    {
        if (!HasPermission(Permissions.Services.PatientServicesStatus) &&
            !User.IsInRole(Roles.Nurse))
            return Forbid();

        try
        {
            var result = await _service.StartServiceAsync(id, CurrentUserIdOrThrow);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id:int}/complete")]
    [ProducesResponseType(typeof(PatientServiceDto), 200)]
    public async Task<IActionResult> Complete(int id, [FromBody] CompleteServiceRequest req)
    {
        if (!HasPermission(Permissions.Services.PatientServicesStatus) &&
            !User.IsInRole(Roles.Nurse))
            return Forbid();

        try
        {
            var result = await _service.CompleteServiceAsync(id, req.Notes ?? string.Empty, CurrentUserIdOrThrow);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}/timeline")]
    [ProducesResponseType(typeof(List<ServiceActivityLogDto>), 200)]
    public async Task<ActionResult<List<ServiceActivityLogDto>>> GetTimeline(int id)
    {
        if (!HasPermission(Permissions.Services.PatientServicesView))
            return Forbid();

        return Ok(await _service.GetServiceTimelineAsync(id));
    }

    [HttpPost("{id:int}/notifications")]
    [ProducesResponseType(typeof(ServiceNotificationRecordDto), 200)]
    public async Task<IActionResult> CreateNotification(int id, [FromBody] CreateServiceNotificationDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesNotifications))
            return Forbid();

        try
        {
            dto.CareServiceId = id;
            var result = await _service.CreateNotificationAsync(dto, CurrentUserIdOrThrow);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:int}/notifications")]
    [ProducesResponseType(typeof(List<ServiceNotificationRecordDto>), 200)]
    public async Task<ActionResult<List<ServiceNotificationRecordDto>>> GetNotifications(int id)
    {
        if (!HasPermission(Permissions.Services.PatientServicesView) &&
            !HasPermission(Permissions.Services.PatientServicesNotifications))
            return Forbid();

        return Ok(await _service.GetServiceNotificationsAsync(id));
    }

    [HttpGet("available-providers")]
    [ProducesResponseType(typeof(List<ProviderAvailabilityDto>), 200)]
    public async Task<ActionResult<List<ProviderAvailabilityDto>>> GetAvailableProviders(
        [FromQuery] int serviceDefinitionId,
        [FromQuery] DateTime scheduledDate,
        [FromQuery] long? startTimeTicks = null,
        [FromQuery] int? durationMinutes = null,
        [FromQuery] int? currentServiceId = null)
    {
        if (!HasPermission(Permissions.Services.PatientServicesAssign) &&
            !HasPermission(Permissions.Services.PatientServicesCreate))
            return Forbid();

        TimeSpan? startTime = startTimeTicks.HasValue ? new TimeSpan(startTimeTicks.Value) : null;
        return Ok(await _service.GetAvailableProvidersAsync(
            serviceDefinitionId,
            scheduledDate.ToUniversalTime(),
            startTime,
            durationMinutes,
            currentServiceId));
    }

    [HttpPost("schedules")]
    [ProducesResponseType(typeof(ServiceScheduleDto), 200)]
    public async Task<IActionResult> CreateSchedule([FromBody] CreateServiceScheduleDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesSchedule))
            return Forbid();

        try
        {
            var result = await _service.CreateScheduleAsync(dto, CurrentUserIdOrThrow);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("schedules")]
    [ProducesResponseType(typeof(List<ServiceScheduleDto>), 200)]
    public async Task<ActionResult<List<ServiceScheduleDto>>> GetSchedules([FromQuery] int? careRecipientId = null)
    {
        if (!HasPermission(Permissions.Services.PatientServicesView) &&
            !HasPermission(Permissions.Services.PatientServicesSchedule))
            return Forbid();

        return Ok(await _service.GetActiveSchedulesAsync(careRecipientId));
    }

    [HttpPost("schedules/{scheduleId:int}/toggle")]
    public async Task<IActionResult> ToggleSchedule(int scheduleId, [FromBody] ToggleScheduleRequest req)
    {
        if (!HasPermission(Permissions.Services.PatientServicesSchedule))
            return Forbid();

        var result = await _service.ToggleScheduleActiveAsync(scheduleId, req.IsActive, CurrentUserIdOrThrow);
        if (!result) return NotFound();
        return Ok(new { success = true });
    }

    [HttpPost("schedules/{scheduleId:int}/generate")]
    [ProducesResponseType(typeof(List<PatientServiceDto>), 200)]
    public async Task<ActionResult<List<PatientServiceDto>>> GenerateFromSchedule(int scheduleId)
    {
        if (!HasPermission(Permissions.Services.PatientServicesSchedule) &&
            !HasPermission(Permissions.Services.PatientServicesCreate))
            return Forbid();

        return Ok(await _service.GenerateServicesFromScheduleAsync(scheduleId, CurrentUserIdOrThrow));
    }

    [HttpPost("bulk/assign")]
    [ProducesResponseType(typeof(BulkServiceActionResult), 200)]
    public async Task<ActionResult<BulkServiceActionResult>> BulkAssign([FromBody] BulkServiceActionDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesBulk) ||
            !HasPermission(Permissions.Services.PatientServicesAssign))
            return Forbid();

        return Ok(await _service.BulkAssignAsync(dto, CurrentUserIdOrThrow));
    }

    [HttpPost("bulk/change-status")]
    [ProducesResponseType(typeof(BulkServiceActionResult), 200)]
    public async Task<ActionResult<BulkServiceActionResult>> BulkChangeStatus([FromBody] BulkServiceActionDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesBulk) ||
            !HasPermission(Permissions.Services.PatientServicesStatus))
            return Forbid();

        return Ok(await _service.BulkChangeStatusAsync(dto, CurrentUserIdOrThrow));
    }

    [HttpPost("bulk/cancel")]
    [ProducesResponseType(typeof(BulkServiceActionResult), 200)]
    public async Task<ActionResult<BulkServiceActionResult>> BulkCancel([FromBody] BulkServiceActionDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesBulk) ||
            !HasPermission(Permissions.Services.PatientServicesEdit))
            return Forbid();

        return Ok(await _service.BulkCancelAsync(dto, CurrentUserIdOrThrow));
    }

    [HttpPost("bulk/notifications")]
    [ProducesResponseType(typeof(BulkServiceActionResult), 200)]
    public async Task<ActionResult<BulkServiceActionResult>> BulkNotifications([FromBody] BulkServiceActionDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesBulk) ||
            !HasPermission(Permissions.Services.PatientServicesNotifications))
            return Forbid();

        return Ok(await _service.BulkSendNotificationAsync(dto, CurrentUserIdOrThrow));
    }

    [HttpPost("bulk/reschedule")]
    [ProducesResponseType(typeof(BulkServiceActionResult), 200)]
    public async Task<ActionResult<BulkServiceActionResult>> BulkReschedule([FromBody] BulkServiceActionDto dto)
    {
        if (!HasPermission(Permissions.Services.PatientServicesBulk) ||
            !HasPermission(Permissions.Services.PatientServicesEdit))
            return Forbid();

        return Ok(await _service.BulkRescheduleAsync(dto, CurrentUserIdOrThrow));
    }

    [HttpGet("calendar")]
    [ProducesResponseType(typeof(List<CalendarEventDto>), 200)]
    public async Task<ActionResult<List<CalendarEventDto>>> GetCalendar(
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int? careRecipientId = null,
        [FromQuery] string? performerId = null,
        [FromQuery] CareServiceStatus? status = null)
    {
        if (!HasPermission(Permissions.Services.PatientServicesView))
            return Forbid();

        var fromDate = (from ?? DateTime.UtcNow.AddDays(-7)).ToUniversalTime();
        var toDate = (to ?? DateTime.UtcNow.AddDays(30)).ToUniversalTime();

        var filters = new PatientServiceQueryFilters
        {
            CareRecipientId = careRecipientId,
            PerformerId = performerId,
            Status = status
        };

        return Ok(await _service.GetCalendarEventsAsync(fromDate, toDate, filters));
    }

    public class CancelServiceRequest
    {
        public string? Reason { get; set; }
    }

    public class CompleteServiceRequest
    {
        public string? Notes { get; set; }
    }

    public class ToggleScheduleRequest
    {
        public bool IsActive { get; set; }
    }
}
