using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Medications;
using Salmandyar.Application.Services.Medications;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Enums;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

public class RecordDoseFormDto
{
    public DateTime TakenAt { get; set; }
    public string? Notes { get; set; }
    public string? MissedReason { get; set; }
    public DoseStatus Status { get; set; } = DoseStatus.Taken;
    public SideEffectSeverity SideEffectSeverity { get; set; }
    public string? SideEffectDescription { get; set; }
    public IFormFile? Attachment { get; set; }
}

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MedicationsController : ControllerBase
{
    private readonly IMedicationService _medicationService;
    private readonly IPatientService _patientService;

    public MedicationsController(IMedicationService medicationService, IPatientService patientService)
    {
        _medicationService = medicationService;
        _patientService = patientService;
    }

    private string? GetCaregiverIdIfRestricted()
    {
        if (User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor))
        {
            return null;
        }
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<List<MedicationDto>>> GetPatientMedications(int patientId)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(patientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        return Ok(await _medicationService.GetPatientMedicationsAsync(patientId));
    }

    [HttpPost]
    public async Task<ActionResult<MedicationDto>> AddMedication([FromBody] CreateMedicationDto dto)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(dto.CareRecipientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        var result = await _medicationService.AddMedicationAsync(dto);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MedicationDto>> UpdateMedication(int id, [FromBody] UpdateMedicationDto dto)
    {
        var result = await _medicationService.UpdateMedicationAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedication(int id)
    {
        try
        {
            await _medicationService.DeleteMedicationAsync(id);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("patient/{patientId}/schedule")]
    public async Task<ActionResult<List<MedicationDoseDto>>> GetDailySchedule(int patientId, [FromQuery] DateTime date)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(patientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        return Ok(await _medicationService.GetDailyScheduleAsync(patientId, date));
    }

    [HttpPost("doses/{doseId}/log")]
    public async Task<IActionResult> LogDose(int doseId, [FromBody] RecordDoseDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            await _medicationService.RecordDoseAsync(doseId, dto, userId);
            return Ok();
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("doses/{doseId}/log-with-evidence")]
    public async Task<IActionResult> LogDoseWithEvidence(int doseId, [FromForm] RecordDoseFormDto form)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        string? attachmentPath = null;
        if (form.Attachment != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "medications");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}_{form.Attachment.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await form.Attachment.CopyToAsync(stream);
            }
            attachmentPath = $"/uploads/medications/{fileName}";
        }

        var dto = new RecordDoseDto
        {
            TakenAt = form.TakenAt,
            Notes = form.Notes,
            MissedReason = form.MissedReason,
            Status = form.Status,
            SideEffectSeverity = form.SideEffectSeverity,
            SideEffectDescription = form.SideEffectDescription,
            AttachmentPath = attachmentPath
        };

        try
        {
            await _medicationService.RecordDoseAsync(doseId, dto, userId);
            return Ok();
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
