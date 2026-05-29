using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Users;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Application.Services.Users;
using Salmandyar.Domain.Constants;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[Route("api/admin/users")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userService;
    private readonly IPatientSelfServiceAccessService _patientSelfServiceAccessService;

    public UsersController(IUserManagementService userService, IPatientSelfServiceAccessService patientSelfServiceAccessService)
    {
        _userService = userService;
        _patientSelfServiceAccessService = patientSelfServiceAccessService;
        Console.WriteLine("UsersController created!");
    }

    [HttpGet("test")]
    public async Task<IActionResult> Test()
    {
        var users = await _userService.GetUsersAsync(new UserFilterDto { PageNumber = 1, PageSize = 100 });
        return Ok(new { 
            message = "Connection successful", 
            count = users.TotalCount,
            items = users.Items 
        });
    }

    [HttpGet]
    [Authorize] // Just require login for now
    public async Task<ActionResult<PaginatedResult<UserListDto>>> GetUsers([FromQuery] UserFilterDto filter)
    {
        var result = await _userService.GetUsersAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<UserDetailDto>> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpGet("{id}/self-service-access")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetSelfServiceAccess(string id)
    {
        var summary = await _patientSelfServiceAccessService.GetAdminSummaryByUserIdAsync(id);
        if (summary == null)
        {
            return NotFound(new { error = "برای این کاربر پرونده بیمار یا سالمند متصل یافت نشد." });
        }

        return Ok(summary);
    }

    [HttpPut("{id}/self-service-access")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> UpdateSelfServiceAccess(string id, [FromBody] UpdatePatientSelfServiceAccessDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        try
        {
            var summary = await _patientSelfServiceAccessService.UpdateByUserIdAsync(id, dto, adminId);
            if (summary == null)
            {
                return NotFound(new { error = "برای این کاربر پرونده بیمار یا سالمند متصل یافت نشد." });
            }

            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}/self-service-access/audit")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> GetSelfServiceAccessAudit(string id)
    {
        var audit = await _patientSelfServiceAccessService.GetAuditTrailByUserIdAsync(id);
        return Ok(audit);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> ChangeStatus(string id, [FromBody] ChangeUserStatusDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.ChangeUserStatusAsync(id, dto, adminId);
        
        if (!result) return BadRequest("Could not change user status");
        return NoContent();
    }

    [HttpPatch("{id}/role")]
    [Authorize(Roles = "Admin,SuperAdmin")] // Allow both Admin and SuperAdmin
    public async Task<IActionResult> ChangeRole(string id, [FromBody] UpdateUserRoleDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.ChangeUserRoleAsync(id, dto, adminId);
        
        if (!result) return BadRequest("Could not change user role");
        return NoContent();
    }

    [HttpPost("{id}/reset-password")]
    [Authorize(Roles = "Admin,SuperAdmin")] // Allow both Admin and SuperAdmin
    public async Task<IActionResult> ResetPassword(string id, [FromBody] object payload)
    {
        // Simple payload with { "newPassword": "..." } or similar
        // For simplicity using dynamic or just string
        // Better to use a DTO
        var newPassword = ((System.Text.Json.JsonElement)payload).GetProperty("newPassword").GetString();
        
        if (string.IsNullOrEmpty(newPassword)) return BadRequest("Password required");

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.ResetPasswordAsync(id, newPassword, adminId);
        
        if (!result) return BadRequest("Could not reset password");
        return NoContent();
    }

    [HttpPost("{id}/force-logout")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> ForceLogout(string id)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.ForceLogoutAsync(id, adminId);
        
        if (!result) return BadRequest("Could not force logout");
        return NoContent();
    }

    [HttpPost("bulk-action")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> BulkAction([FromBody] BulkActionDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.PerformBulkActionAsync(dto, adminId);
        
        if (!result) return BadRequest("Bulk action failed");
        return NoContent();
    }
}
