using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Contracts;
using Salmandyar.Application.Services.Contracts;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Enums;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContractsController : ControllerBase
{
    private readonly IContractService _contractService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ContractsController(IContractService contractService, IHttpContextAccessor httpContextAccessor)
    {
        _contractService = contractService;
        _httpContextAccessor = httpContextAccessor;
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? string.Empty;
    }

    private string? GetClientIp()
    {
        return _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
        var ctx = _httpContextAccessor.HttpContext;
        if (ctx == null) return null;
        return ctx.Request.Headers.TryGetValue("User-Agent", out var ua) ? ua.ToString() : null;
    }

    #region Template Management (Admin)

    [HttpGet("templates")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetTemplates([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null, CancellationToken ct = default)
    {
        var result = await _contractService.GetTemplatesAsync(page, pageSize, search, ct);
        return Ok(result);
    }

    [HttpGet("templates/{id:int}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetTemplate(int id, [FromQuery] bool includeFields = true, CancellationToken ct = default)
    {
        var tpl = await _contractService.GetTemplateAsync(id, includeFields, ct);
        if (tpl == null) return NotFound();
        return Ok(tpl);
    }

    [HttpPost("templates")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateContractTemplateDto dto, CancellationToken ct = default)
    {
        var adminId = GetCurrentUserId();
        var result = await _contractService.CreateTemplateAsync(dto, adminId, ct);
        return CreatedAtAction(nameof(GetTemplate), new { id = result.Id }, result);
    }

    [HttpPut("templates/{id:int}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> UpdateTemplate(int id, [FromBody] UpdateContractTemplateDto dto, CancellationToken ct = default)
    {
        try
        {
            var adminId = GetCurrentUserId();
            var result = await _contractService.UpdateTemplateAsync(id, dto, adminId, ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("templates/{id:int}/toggle")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> ToggleTemplate(int id, [FromBody] ToggleContractTemplateDto dto, CancellationToken ct = default)
    {
        try
        {
            var adminId = GetCurrentUserId();
            await _contractService.ToggleTemplateActiveAsync(id, dto.IsActive, adminId, ct);
            return Ok();
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("templates/{id:int}/preview")]
    [Authorize]
    public async Task<IActionResult> PreviewTemplate(int id, [FromQuery] int? assignmentId = null, [FromQuery] string? userId = null, CancellationToken ct = default)
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) ||
                      User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor);
        if (!isAdmin && !string.IsNullOrEmpty(userId) && userId != currentUserId)
            return Forbid();

        var effectiveUserId = isAdmin ? userId : currentUserId;
        var html = await _contractService.PreviewTemplateAsync(id, assignmentId, effectiveUserId, ct);
        return Ok(new { html });
    }

    #endregion

    #region Assignments (Admin)

    [HttpGet("assignments")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetAssignments(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] int? templateId = null,
        [FromQuery] string? userId = null,
        [FromQuery] ContractStatus? status = null,
        CancellationToken ct = default)
    {
        var result = await _contractService.GetAssignmentsAsync(page, pageSize, search, templateId, userId, status, ct);
        return Ok(result);
    }

    [HttpGet("assignments/{id:int}")]
    [Authorize]
    public async Task<IActionResult> GetAssignment(int id, CancellationToken ct = default)
    {
        var a = await _contractService.GetAssignmentAsync(id, ct);
        if (a == null) return NotFound();

        var isAdmin = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) ||
                      User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor);
        var currentUserId = GetCurrentUserId();
        if (!isAdmin && a.UserId != currentUserId) return Forbid();

        return Ok(a);
    }

    [HttpGet("assignments/user/{userId}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetUserAssignments(string userId, CancellationToken ct = default)
    {
        var list = await _contractService.GetUserAssignmentsAsync(userId, ct);
        return Ok(list);
    }

    [HttpPost("assignments")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> AssignContract([FromBody] AssignContractDto dto, CancellationToken ct = default)
    {
        var adminId = GetCurrentUserId();
        var result = await _contractService.AssignContractAsync(dto, adminId, ct);
        return CreatedAtAction(nameof(GetAssignment), new { id = result.Id }, result);
    }

    [HttpGet("assignments/{id:int}/document")]
    [Authorize]
    public async Task<IActionResult> GetAssignmentDocument(int id, CancellationToken ct = default)
    {
        var a = await _contractService.GetAssignmentAsync(id, ct);
        if (a == null) return NotFound();

        var isAdmin = User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) ||
                      User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor);
        var currentUserId = GetCurrentUserId();
        if (!isAdmin && a.UserId != currentUserId) return Forbid();

        var doc = await _contractService.GetAssignmentDocumentAsync(id, ct);
        return Ok(doc);
    }

    [HttpGet("assignments/{id:int}/audit")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetAssignmentAudit(int id, CancellationToken ct = default)
    {
        var list = await _contractService.GetAssignmentAuditLogAsync(id, ct);
        return Ok(list);
    }

    #endregion

    #region My Contract (Caregiver/Nurse)

    [HttpGet("my/status")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<IActionResult> GetMyStatus([FromQuery] bool autoAssign = true, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var status = await _contractService.GetMyActiveContractAsync(userId, autoAssign, ct);
        return Ok(status);
    }

    [HttpPost("my/fields")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<IActionResult> SaveMyFieldValues([FromBody] SaveContractFieldValuesDto dto, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var result = await _contractService.SaveMyFieldValuesAsync(dto, userId, ct);
        return Ok(result);
    }

    [HttpPost("my/sign")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<IActionResult> SignMyContract([FromBody] SignContractDto dto, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var clientIp = GetClientIp();
        var userAgent = GetUserAgent();
        var result = await _contractService.SignMyContractAsync(dto, userId, clientIp, userAgent, authMethod: "Jwt", ct);
        return Ok(result);
    }

    [HttpGet("my/document")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<IActionResult> GetMyDocument([FromQuery] int? assignmentId = null, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        var doc = await _contractService.GetMyContractDocumentAsync(userId, assignmentId, ct);
        return Ok(doc);
    }

    #endregion
}
