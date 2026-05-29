using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Common.Interfaces;
using Salmandyar.Application.DTOs.PatientProfile;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PatientProfileController : ControllerBase
{
    private static readonly HashSet<string> AllowedDocumentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "NationalId",
        "Insurance",
        "LabTest",
        "CT_MRI",
        "Prescription"
    };

    private static readonly HashSet<string> AllowedDocumentExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    };

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

        var editorName = $"{User.FindFirstValue(JwtRegisteredClaimNames.GivenName)} {User.FindFirstValue(JwtRegisteredClaimNames.FamilyName)}".Trim();
        var updatedProfile = await _profileService.UpdateProfileAsync(userId, dto, userId, editorName);
        return Ok(updatedProfile);
    }

    [HttpPost("me/documents")]
    public async Task<ActionResult<UploadedDocumentDto>> UploadMyDocument([FromForm] UploadPatientDocumentFormDto form)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        return await UploadDocumentForUserAsync(userId, form);
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
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PatientProfileDto>> GetUserProfile(string userId)
    {
        var profile = await _profileService.GetProfileByUserIdAsync(userId);
        if (profile == null) return NotFound("Profile not found.");

        return Ok(profile);
    }

    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    [HttpPut("user/{userId}")]
    public async Task<ActionResult<PatientProfileDto>> UpdateUserProfile(string userId, [FromBody] UpdatePatientProfileDto dto)
    {
        var editorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var editorName = $"{User.FindFirstValue(JwtRegisteredClaimNames.GivenName)} {User.FindFirstValue(JwtRegisteredClaimNames.FamilyName)}".Trim();
        if (string.IsNullOrWhiteSpace(editorName))
        {
            editorName = "Admin";
        }

        var updatedProfile = await _profileService.UpdateProfileAsync(userId, dto, editorUserId, editorName);
        return Ok(updatedProfile);
    }

    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    [HttpPost("user/{userId}/documents")]
    public async Task<ActionResult<UploadedDocumentDto>> UploadUserDocument(string userId, [FromForm] UploadPatientDocumentFormDto form)
    {
        return await UploadDocumentForUserAsync(userId, form);
    }

    private async Task<ActionResult<UploadedDocumentDto>> UploadDocumentForUserAsync(string userId, UploadPatientDocumentFormDto form)
    {
        if (form.File == null || form.File.Length == 0)
            return BadRequest("فایلی برای بارگذاری انتخاب نشده است.");

        if (string.IsNullOrWhiteSpace(form.DocumentType) || !AllowedDocumentTypes.Contains(form.DocumentType))
            return BadRequest("نوع مدرک معتبر نیست.");

        if (form.File.Length > 5 * 1024 * 1024)
            return BadRequest("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");

        var extension = Path.GetExtension(form.File.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedDocumentExtensions.Contains(extension))
            return BadRequest("فرمت فایل مجاز نیست.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "patient-profiles");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var safeDocumentType = form.DocumentType.Replace(" ", "_");
        var fileName = $"{userId}_{safeDocumentType}_{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await form.File.CopyToAsync(stream);
        }

        var fileUrl = $"/uploads/patient-profiles/{fileName}";
        var updatedProfile = await _profileService.UpdateProfileAsync(userId, new UpdatePatientProfileDto
        {
            Documents = new List<UploadedDocumentDto>
            {
                new UploadedDocumentDto
                {
                    DocumentType = form.DocumentType,
                    FileUrl = fileUrl
                }
            }
        });

        var uploadedDocument = updatedProfile.Documents.LastOrDefault(d =>
            string.Equals(d.FileUrl, fileUrl, StringComparison.OrdinalIgnoreCase));

        return Ok(uploadedDocument ?? new UploadedDocumentDto
        {
            DocumentType = form.DocumentType,
            FileUrl = fileUrl,
            UploadDate = DateTime.UtcNow
        });
    }
}

public class UploadPatientDocumentFormDto
{
    public string? DocumentType { get; set; }
    public IFormFile? File { get; set; }
}
