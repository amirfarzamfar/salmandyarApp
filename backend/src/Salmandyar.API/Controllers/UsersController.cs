using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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
    }

    [HttpGet]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
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

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<ActionResult<UserDetailDto>> CreateUser([FromBody] CreateAdminUserDto dto)
    {
        try
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var created = await _userService.CreateUserAsync(dto, adminId);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<ActionResult<UserDetailDto>> UpdateUser(string id, [FromBody] UpdateAdminUserDto dto)
    {
        try
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var updated = await _userService.UpdateUserAsync(id, dto, adminId);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        try
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            if (string.Equals(adminId, id, StringComparison.Ordinal))
            {
                return BadRequest(new { error = "حذف حساب کاربری فعلی مجاز نیست." });
            }

            await _userService.DeleteUserAsync(id, adminId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
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
        if (string.Equals(adminId, id, StringComparison.Ordinal) && !dto.IsActive)
        {
            return BadRequest(new { error = "غیرفعال‌کردن حساب کاربری فعلی مجاز نیست." });
        }

        var result = await _userService.ChangeUserStatusAsync(id, dto, adminId);
        
        if (!result) return NotFound(new { error = "کاربر یافت نشد." });
        return NoContent();
    }

    [HttpPatch("{id}/role")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<IActionResult> ChangeRole(string id, [FromBody] UpdateUserRoleDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.ChangeUserRoleAsync(id, dto, adminId);
        
        if (!result) return NotFound(new { error = "کاربر یافت نشد." });
        return NoContent();
    }

    [HttpPatch("{id}/roles")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<IActionResult> ChangeRoles(string id, [FromBody] UpdateUserRolesDto dto)
    {
        try
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _userService.ChangeUserRolesAsync(id, dto, adminId);
            if (!result) return NotFound(new { error = "کاربر یافت نشد." });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("{id}/lock")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> SetLock(string id, [FromBody] SetUserLockDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        if (string.Equals(adminId, id, StringComparison.Ordinal) && dto.IsLocked)
        {
            return BadRequest(new { error = "قفل‌کردن حساب کاربری فعلی مجاز نیست." });
        }

        var result = await _userService.SetUserLockAsync(id, dto, adminId);
        if (!result) return NotFound(new { error = "کاربر یافت نشد." });
        return NoContent();
    }

    [HttpPatch("{id}/contact-verification")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<IActionResult> UpdateContactVerification(string id, [FromBody] UpdateUserContactVerificationDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.UpdateUserContactVerificationAsync(id, dto, adminId);
        if (!result) return NotFound(new { error = "کاربر یافت نشد." });
        return NoContent();
    }

    [HttpPost("{id}/reset-password")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<IActionResult> ResetPassword(string id, [FromBody] AdminResetPasswordDto payload)
    {
        if (string.IsNullOrWhiteSpace(payload.NewPassword))
        {
            return BadRequest(new { error = "رمز عبور جدید الزامی است." });
        }

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.ResetPasswordAsync(id, payload.NewPassword, adminId);
        
        if (!result) return NotFound(new { error = "کاربر یافت نشد." });
        return NoContent();
    }

    [HttpPost("{id}/force-logout")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<IActionResult> ForceLogout(string id)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.ForceLogoutAsync(id, adminId);
        
        if (!result) return NotFound(new { error = "کاربر یافت نشد." });
        return NoContent();
    }

    [HttpPost("bulk-action")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<IActionResult> BulkAction([FromBody] BulkActionDto dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await _userService.PerformBulkActionAsync(dto, adminId);
        
        if (!result) return BadRequest(new { error = "اجرای عملیات گروهی انجام نشد." });
        return NoContent();
    }

    [HttpGet("roles")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<ActionResult<RoleCatalogDto>> GetRoles()
    {
        return Ok(await _userService.GetRoleCatalogAsync());
    }

    [HttpPost("roles")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<ActionResult<RoleManagementDto>> CreateRole([FromBody] UpsertRoleDto dto)
    {
        try
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var role = await _userService.UpsertRoleAsync(null, dto, adminId);
            return StatusCode(StatusCodes.Status201Created, role);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("roles/{roleName}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<ActionResult<RoleManagementDto>> UpdateRole(string roleName, [FromBody] UpsertRoleDto dto)
    {
        try
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var role = await _userService.UpsertRoleAsync(roleName, dto, adminId);
            return Ok(role);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("roles/{roleName}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin}")]
    public async Task<IActionResult> DeleteRole(string roleName)
    {
        try
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _userService.DeleteRoleAsync(roleName, adminId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
