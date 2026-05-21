using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Common.Interfaces;
using Salmandyar.Application.DTOs.PatientProfile;
using System.Security.Claims;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientProfileController : ControllerBase
{
    private readonly IPatientProfileService _profileService;

    public PatientProfileController(IPatientProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("me")]
    public async Task<ActionResult<PatientProfileDto>> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var profile = await _profileService.GetProfileByUserIdAsync(userId);
        if (profile == null) return NotFound("Profile not found.");

        return Ok(profile);
    }

    [HttpGet("me/status")]
    public async Task<ActionResult<object>> GetMyProfileStatus()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var profile = await _profileService.GetProfileByUserIdAsync(userId);
        
        return Ok(new 
        { 
            hasProfile = profile != null,
            isCompleted = profile?.IsCompleted ?? false,
            completionPercentage = profile?.CompletionPercentage ?? 0,
            currentStep = profile?.CurrentStep ?? 0
        });
    }

    [HttpPut("me")]
    public async Task<ActionResult<PatientProfileDto>> UpdateMyProfile([FromBody] UpdatePatientProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var updatedProfile = await _profileService.UpdateProfileAsync(userId, dto);
        return Ok(updatedProfile);
    }

    [HttpPost("me/complete")]
    public async Task<ActionResult<PatientProfileDto>> CompleteMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var profile = await _profileService.CompleteProfileAsync(userId);
            return Ok(profile);
        }
        catch (System.Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Admin Endpoints
    [Authorize(Roles = Roles.Admin)]
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PatientProfileDto>> GetUserProfile(string userId)
    {
        var profile = await _profileService.GetProfileByUserIdAsync(userId);
        if (profile == null) return NotFound("Profile not found.");

        return Ok(profile);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPut("user/{userId}")]
    public async Task<ActionResult<PatientProfileDto>> UpdateUserProfile(string userId, [FromBody] UpdatePatientProfileDto dto)
    {
        var updatedProfile = await _profileService.UpdateProfileAsync(userId, dto);
        return Ok(updatedProfile);
    }
}
