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
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthenticationService authService,
        IUserManagementService userService,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _userService = userService;
        _logger = logger;
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
            await _userService.RecordSuccessfulLoginAsync(response.Id, HttpContext.Connection.RemoteIpAddress?.ToString());
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            await _authService.LogoutAsync(userId);
            return Ok(new { message = "خروج از حساب با موفقیت انجام شد." });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Logout failed for current user.");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login-otp/request")]
    public async Task<IActionResult> RequestOtpLogin(RequestOtpLoginRequest request)
    {
        try
        {
            await _authService.RequestOtpLoginAsync(request);
            return Ok(new { message = "اگر حسابی با این شناسه و کانال انتخابی وجود داشته باشد، کد ورود ارسال شد." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login-otp/verify")]
    public async Task<IActionResult> VerifyOtpLogin(VerifyOtpLoginRequest request)
    {
        try
        {
            var response = await _authService.VerifyOtpLoginAsync(request);
            await _userService.RecordSuccessfulLoginAsync(response.Id, HttpContext.Connection.RemoteIpAddress?.ToString());
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
            _logger.LogWarning(ex, "Change password failed for current user.");
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        try
        {
            await _authService.ForgotPasswordAsync(request);
            return Ok(new { message = "در صورت وجود حساب کاربری، کد بازیابی ارسال شد." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request);
            return Ok(new { message = "رمز عبور با موفقیت بازیابی شد." });
        }
        catch (Exception ex)
        {
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
