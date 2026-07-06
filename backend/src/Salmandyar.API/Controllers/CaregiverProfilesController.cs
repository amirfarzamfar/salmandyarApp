using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.API.Services;
using Salmandyar.Application.DTOs.CaregiverProfiles;
using Salmandyar.Application.Services.CaregiverProfiles;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CaregiverProfilesController : ControllerBase
{
    private static readonly HashSet<string> AllowedDocumentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "NationalCardFront",
        "NationalCardBack",
        "BirthCertificate",
        "ProfilePhoto",
        "EducationDegree",
        "Resume",
        "WorkHistory",
        "CPR",
        "HealthCertificate",
        "NoCriminalRecord",
        "NoAddiction",
        "Insurance",
        "ReferralLetter",
        "DigitalSignature"
    };

    private readonly ICaregiverProfileService _caregiverProfileService;

    public CaregiverProfilesController(ICaregiverProfileService caregiverProfileService)
    {
        _caregiverProfileService = caregiverProfileService;
    }

    [HttpGet("me")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<ActionResult<CaregiverProfileDto>> GetMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var profile = await _caregiverProfileService.GetProfileByUserIdAsync(userId);
        if (profile == null)
        {
            return NotFound("پروفایل استخدامی یافت نشد.");
        }

        return Ok(profile);
    }

    [HttpGet("me/status")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<ActionResult<CaregiverProfileStatusDto>> GetMyProfileStatus()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        return Ok(await _caregiverProfileService.GetProfileStatusAsync(userId));
    }

    [HttpGet("me/dashboard")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<ActionResult<CaregiverDashboardDto>> GetMyDashboard()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        return Ok(await _caregiverProfileService.GetDashboardAsync(userId));
    }

    [HttpPut("me")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<ActionResult<CaregiverProfileDto>> UpdateMyProfile([FromBody] UpdateCaregiverProfileDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var editorName = GetActorName();
        var updated = await _caregiverProfileService.UpdateProfileAsync(userId, dto, userId, editorName, false);
        return Ok(updated);
    }

    [HttpPost("me/complete")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    public async Task<ActionResult<CaregiverProfileDto>> CompleteMyProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            return Ok(await _caregiverProfileService.CompleteProfileAsync(userId, userId, GetActorName(), false));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("me/documents")]
    [Authorize(Roles = Roles.CaregiverPanelRoles)]
    [RequestFormLimits(MultipartBodyLengthLimit = PatientProfileDocumentStorage.MaxUploadBytes)]
    [RequestSizeLimit(PatientProfileDocumentStorage.MaxUploadBytes)]
    public async Task<ActionResult<CaregiverProfileDocumentDto>> UploadMyDocument([FromForm] UploadCaregiverDocumentFormDto form)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        return await UploadDocumentForUserAsync(userId, form, false);
    }

    [HttpGet("user/{userId}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<CaregiverProfileDto>> GetUserProfile(string userId)
    {
        var profile = await _caregiverProfileService.GetProfileByUserIdAsync(userId);
        if (profile == null)
        {
            return NotFound("پروفایل استخدامی یافت نشد.");
        }

        return Ok(profile);
    }

    [HttpGet("user/{userId}/status")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<CaregiverProfileStatusDto>> GetUserProfileStatus(string userId)
    {
        return Ok(await _caregiverProfileService.GetProfileStatusAsync(userId));
    }

    [HttpPut("user/{userId}")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<CaregiverProfileDto>> UpdateUserProfile(string userId, [FromBody] UpdateCaregiverProfileDto dto)
    {
        var updated = await _caregiverProfileService.UpdateProfileAsync(userId, dto, User.FindFirstValue(ClaimTypes.NameIdentifier), GetActorName(), true);
        return Ok(updated);
    }

    [HttpPost("user/{userId}/complete")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<CaregiverProfileDto>> ForceCompleteUserProfile(string userId)
    {
        return Ok(await _caregiverProfileService.CompleteProfileAsync(userId, User.FindFirstValue(ClaimTypes.NameIdentifier), GetActorName(), true));
    }

    [HttpPost("user/{userId}/documents")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    [RequestFormLimits(MultipartBodyLengthLimit = PatientProfileDocumentStorage.MaxUploadBytes)]
    [RequestSizeLimit(PatientProfileDocumentStorage.MaxUploadBytes)]
    public async Task<ActionResult<CaregiverProfileDocumentDto>> UploadUserDocument(string userId, [FromForm] UploadCaregiverDocumentFormDto form)
    {
        return await UploadDocumentForUserAsync(userId, form, true);
    }

    [HttpPatch("user/{userId}/documents/{documentId}/status")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<CaregiverProfileDocumentDto>> UpdateDocumentStatus(string userId, int documentId, [FromBody] UpdateCaregiverDocumentStatusDto dto)
    {
        try
        {
            var document = await _caregiverProfileService.UpdateDocumentStatusAsync(
                userId,
                documentId,
                dto,
                User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty,
                GetActorName());
            return Ok(document);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    private async Task<ActionResult<CaregiverProfileDocumentDto>> UploadDocumentForUserAsync(string userId, UploadCaregiverDocumentFormDto form, bool isAdmin)
    {
        if (form.File == null || form.File.Length == 0)
        {
            return BadRequest(new { error = "فایلی برای بارگذاری انتخاب نشده است." });
        }

        if (string.IsNullOrWhiteSpace(form.DocumentType) || !AllowedDocumentTypes.Contains(form.DocumentType))
        {
            return BadRequest(new { error = "نوع مدرک معتبر نیست." });
        }

        var extension = Path.GetExtension(form.File.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !PatientProfileDocumentStorage.AllowedDocumentExtensions.Contains(extension))
        {
            return BadRequest(new { error = "فرمت فایل مجاز نیست." });
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "caregiver-profiles");
        var optimizedFile = await PatientProfileDocumentStorage.SaveOptimizedAsync(
            form.File,
            uploadsFolder,
            $"{PatientProfileDocumentStorage.SanitizeSegment(userId)}_{PatientProfileDocumentStorage.SanitizeSegment(form.DocumentType)}_{Guid.NewGuid():N}",
            HttpContext.RequestAborted);

        var fileUrl = $"/uploads/caregiver-profiles/{optimizedFile.FileName}";
        try
        {
            var document = await _caregiverProfileService.UploadDocumentAsync(
                userId,
                form.DocumentType,
                fileUrl,
                optimizedFile.FileName,
                form.File.ContentType,
                User.FindFirstValue(ClaimTypes.NameIdentifier),
                GetActorName(),
                isAdmin);
            return Ok(document);
        }
        catch
        {
            if (System.IO.File.Exists(optimizedFile.FilePath))
            {
                System.IO.File.Delete(optimizedFile.FilePath);
            }

            throw;
        }
    }

    private string GetActorName()
    {
        var fullName = $"{User.FindFirstValue(JwtRegisteredClaimNames.GivenName)} {User.FindFirstValue(JwtRegisteredClaimNames.FamilyName)}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? "کاربر سیستم" : fullName;
    }
}

public class UploadCaregiverDocumentFormDto
{
    public string DocumentType { get; set; } = string.Empty;
    public IFormFile? File { get; set; }
}
