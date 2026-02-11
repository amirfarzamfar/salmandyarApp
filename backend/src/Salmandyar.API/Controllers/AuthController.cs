using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.Authentication;
using Salmandyar.Application.Services.Authentication.Dtos;
using System.Security.Claims;
using Salmandyar.Application.DTOs.Users;
using Salmandyar.Application.Services.Users;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly IUserManagementService _userService;

    public AuthController(IAuthenticationService authService, IUserManagementService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDetailDto>> GetMe()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null) return NotFound();

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            var response = await _authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            request.UserId = userId;
            await _authService.ChangePasswordAsync(request);
            return Ok(new { message = "رمز عبور با موفقیت تغییر کرد." });
        }
        catch (Exception ex)
        {
            // Log the error (optional)
            Console.WriteLine($"ChangePassword Error: {ex.Message}");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _userService.UpdateUserProfileAsync(userId, dto);
            if (!result) return BadRequest("Could not update profile");

            return Ok(new { message = "پروفایل با موفقیت بروزرسانی شد" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
