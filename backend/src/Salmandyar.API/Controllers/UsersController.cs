using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Users;
using Salmandyar.Application.Services.Users;
using Salmandyar.Domain.Constants;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[Route("api/admin/users")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userService;

    public UsersController(IUserManagementService userService)
    {
        _userService = userService;
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
    public async Task<ActionResult<UserDetailDto>> GetUser(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPatch("{id}/status")]
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
