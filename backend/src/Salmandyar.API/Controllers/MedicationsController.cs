using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.DTOs.Medications;
using Salmandyar.Application.Services.Medications;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Enums;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

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
    private readonly IPatientSelfServiceAccessService _patientSelfServiceAccessService;

    public MedicationsController(
        IMedicationService medicationService,
        IPatientService patientService,
        IPatientSelfServiceAccessService patientSelfServiceAccessService)
    {
        _medicationService = medicationService;
        _patientService = patientService;
        _patientSelfServiceAccessService = patientSelfServiceAccessService;
    }

    // #region debug-point A:medication-controller
    private static async Task ReportDebugAsync(string hypothesisId, string msg, object? data = null, string location = "MedicationsController.cs")
    {
        try
        {
            using var client = new HttpClient();
            using var content = new StringContent(
                JsonSerializer.Serialize(new
                {
                    sessionId = "medication-kardex-list",
                    runId = "pre-fix",
                    hypothesisId,
                    location,
                    msg = $"[DEBUG] {msg}",
                    data,
                    ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                }),
                Encoding.UTF8,
                "application/json");
            await client.PostAsync("http://127.0.0.1:7777/event", content);
        }
        catch
        {
        }
    }
    // #endregion

    private string? GetCaregiverIdIfRestricted()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return null;

        var isShiftRestrictedStaff =
            User.IsInRole(Roles.Nurse) ||
            User.IsInRole(Roles.AssistantNurse) ||
            User.IsInRole(Roles.Physiotherapist) ||
            User.IsInRole(Roles.ElderlyCareAssistant);

        if (isShiftRestrictedStaff)
        {
            return userId;
        }

        if (User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor))
        {
            return null;
        }

        return userId;
    }

    [HttpGet("patient/{patientId}")]
    public async Task<ActionResult<List<MedicationDto>>> GetPatientMedications(int patientId)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        await ReportDebugAsync("D", "GetPatientMedications called", new
        {
            patientId,
            restrictedCaregiverId,
            roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToArray()
        });
        var patient = await _patientService.GetPatientByIdAsync(patientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        return Ok(await _medicationService.GetPatientMedicationsAsync(patientId));
    }

    [HttpPost]
    public async Task<ActionResult<MedicationDto>> AddMedication([FromBody] CreateMedicationDto dto)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        await ReportDebugAsync("A", "AddMedication called", new
        {
            dto.CareRecipientId,
            dto.Name,
            dto.StartDate,
            dto.EndDate,
            restrictedCaregiverId
        });
        var patient = await _patientService.GetPatientByIdAsync(dto.CareRecipientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            if (User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily))
            {
                await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
                    userId,
                    dto.CareRecipientId,
                    PatientSelfServiceFeatures.MedicationKardex);
            }

            var result = await _medicationService.AddMedicationAsync(dto);
            await ReportDebugAsync("A", "AddMedication succeeded", new
            {
                result.Id,
                result.CareRecipientId,
                result.Name,
                result.StartDate,
                result.EndDate
            });
            return Ok(result);
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            await ReportDebugAsync("A", "AddMedication denied", new { ex.Message });
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<MedicationDto>> UpdateMedication(int id, [FromBody] UpdateMedicationDto dto)
    {
        var medication = await _medicationService.GetMedicationByIdAsync(id);
        if (medication == null)
        {
            return NotFound(new { error = "Medication not found" });
        }

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(medication.CareRecipientId, restrictedCaregiverId);
        if (patient == null && !(User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily)))
        {
            return Forbid();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            if (User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily))
            {
                await _patientSelfServiceAccessService.EnsureFeatureSubmissionAllowedAsync(
                    userId,
                    medication.CareRecipientId,
                    PatientSelfServiceFeatures.MedicationKardex);
            }

            var result = await _medicationService.UpdateMedicationAsync(id, dto);
            return Ok(result);
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedication(int id)
    {
        var medication = await _medicationService.GetMedicationByIdAsync(id);
        if (medication == null)
        {
            return NotFound(new { error = "Medication not found" });
        }

        if (User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily))
        {
            return Forbid();
        }

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(medication.CareRecipientId, restrictedCaregiverId);
        if (patient == null)
        {
            return Forbid();
        }

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
        await ReportDebugAsync("C", "GetDailySchedule called", new
        {
            patientId,
            date,
            restrictedCaregiverId,
            roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToArray()
        });
        var patient = await _patientService.GetPatientByIdAsync(patientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        return Ok(await _medicationService.GetDailyScheduleAsync(patientId, date));
    }

    [HttpGet("patient/{patientId}/doses/{doseId}")]
    public async Task<ActionResult<MedicationDoseDto>> GetDose(int patientId, int doseId)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(patientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        var dose = await _medicationService.GetDoseForPatientAsync(patientId, doseId);
        if (dose == null) return NotFound(new { error = "Dose not found" });

        return Ok(dose);
    }

    [HttpPost("doses/{doseId}/log")]
    public async Task<IActionResult> LogDose(int doseId, [FromBody] RecordDoseDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var restrictedCaregiverId = GetCaregiverIdIfRestricted();
            if (!string.IsNullOrEmpty(restrictedCaregiverId)
                && !(User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily)))
            {
                var careRecipientId = await _medicationService.GetDoseCareRecipientIdAsync(doseId);
                if (!careRecipientId.HasValue) return NotFound(new { error = "Dose not found" });

                var patient = await _patientService.GetPatientByIdAsync(careRecipientId.Value, restrictedCaregiverId);
                if (patient == null) return Forbid();
            }

            var preventBeforeScheduledTime =
                User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily);
            await _medicationService.RecordDoseAsync(doseId, dto, userId, preventBeforeScheduledTime);
            return Ok();
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpDelete("doses/{doseId}/log")]
    public async Task<IActionResult> ResetDose(int doseId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            var restrictedCaregiverId = GetCaregiverIdIfRestricted();
            if (!string.IsNullOrEmpty(restrictedCaregiverId)
                && !(User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily)))
            {
                var careRecipientId = await _medicationService.GetDoseCareRecipientIdAsync(doseId);
                if (!careRecipientId.HasValue) return NotFound(new { error = "Dose not found" });

                var patient = await _patientService.GetPatientByIdAsync(careRecipientId.Value, restrictedCaregiverId);
                if (patient == null) return Forbid();
            }

            await _medicationService.ResetDoseAsync(doseId, userId);
            return NoContent();
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

    [HttpGet("{id}/inventory-transactions")]
    public async Task<ActionResult<List<MedicationInventoryTransactionDto>>> GetInventoryTransactions(int id)
    {
        var medication = await _medicationService.GetMedicationByIdAsync(id);
        if (medication == null) return NotFound(new { error = "Medication not found" });

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        if (!string.IsNullOrEmpty(restrictedCaregiverId))
        {
            var patient = await _patientService.GetPatientByIdAsync(medication.CareRecipientId, restrictedCaregiverId);
            if (patient == null) return Forbid();
        }

        return Ok(await _medicationService.GetInventoryTransactionsAsync(id));
    }

    [HttpGet("{id}/alert-history")]
    public async Task<ActionResult<List<MedicationAlertHistoryDto>>> GetAlertHistory(int id)
    {
        var medication = await _medicationService.GetMedicationByIdAsync(id);
        if (medication == null) return NotFound(new { error = "Medication not found" });

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        if (!string.IsNullOrEmpty(restrictedCaregiverId))
        {
            var patient = await _patientService.GetPatientByIdAsync(medication.CareRecipientId, restrictedCaregiverId);
            if (patient == null) return Forbid();
        }

        return Ok(await _medicationService.GetAlertHistoriesAsync(id));
    }

    [HttpPost("{id}/inventory")]
    public async Task<ActionResult<MedicationDto>> UpdateInventory(int id, [FromBody] UpdateMedicationInventoryDto dto)
    {
        if (User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily))
        {
            return Forbid();
        }

        var medication = await _medicationService.GetMedicationByIdAsync(id);
        if (medication == null) return NotFound(new { error = "Medication not found" });

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        if (!string.IsNullOrEmpty(restrictedCaregiverId))
        {
            var patient = await _patientService.GetPatientByIdAsync(medication.CareRecipientId, restrictedCaregiverId);
            if (patient == null) return Forbid();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        try
        {
            return Ok(await _medicationService.UpdateInventoryAsync(id, dto, userId));
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

    [HttpPost("doses/{doseId}/log-with-evidence")]
    public async Task<IActionResult> LogDoseWithEvidence(int doseId, [FromForm] RecordDoseFormDto form)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        if (!string.IsNullOrEmpty(restrictedCaregiverId)
            && !(User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily)))
        {
            var careRecipientId = await _medicationService.GetDoseCareRecipientIdAsync(doseId);
            if (!careRecipientId.HasValue) return NotFound(new { error = "Dose not found" });

            var patient = await _patientService.GetPatientByIdAsync(careRecipientId.Value, restrictedCaregiverId);
            if (patient == null) return Forbid();
        }

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
            var preventBeforeScheduledTime =
                User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily);
            await _medicationService.RecordDoseAsync(doseId, dto, userId, preventBeforeScheduledTime);
            return Ok();
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
