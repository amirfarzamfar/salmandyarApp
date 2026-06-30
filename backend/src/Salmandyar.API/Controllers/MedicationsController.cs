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

    private bool IsPatientSelfServiceActor()
    {
        return User.IsInRole(Roles.Patient) || User.IsInRole(Roles.Elderly) || User.IsInRole(Roles.PatientFamily);
    }

    private bool IsAdminLikeActor()
    {
        return User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor);
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

            return Ok(await _medicationService.AddMedicationAsync(dto));
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
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
        var patient = await _patientService.GetPatientByIdAsync(patientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        return Ok(await _medicationService.GetDailyScheduleAsync(patientId, date));
    }

    [HttpGet("patient/{patientId}/history")]
    public async Task<ActionResult<List<MedicationDoseDto>>> GetPatientMedicationHistory(
        int patientId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] MedicationAdministrationOutcome? administrationOutcome,
        [FromQuery] MedicationTimingStatus? timingStatus,
        [FromQuery] bool onlyIssues = false,
        [FromQuery] string? search = null)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(patientId, restrictedCaregiverId);
        if (patient == null) return Forbid();

        return Ok(await _medicationService.GetPatientMedicationHistoryAsync(
            patientId,
            from,
            to,
            administrationOutcome,
            timingStatus,
            onlyIssues,
            search));
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

    [HttpGet("shift-board")]
    public async Task<ActionResult<List<MedicationDoseDto>>> GetShiftBoard([FromQuery] DateTime date, [FromQuery] ShiftSlot? shiftSlot, [FromQuery] bool pendingOnly = true)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var isShiftRestrictedStaff =
            User.IsInRole(Roles.Nurse) ||
            User.IsInRole(Roles.AssistantNurse) ||
            User.IsInRole(Roles.Physiotherapist) ||
            User.IsInRole(Roles.ElderlyCareAssistant);

        if (!isShiftRestrictedStaff && !IsAdminLikeActor())
        {
            return Forbid();
        }

        if (isShiftRestrictedStaff)
        {
            return Ok(await _medicationService.GetShiftMedicationAdministrationAsync(userId, shiftSlot, date, pendingOnly));
        }

        return Ok(await _medicationService.GetShiftMedicationAdministrationAsync("*", shiftSlot, date, pendingOnly));
    }

    [HttpGet("doses/{doseId}/history")]
    public async Task<ActionResult<List<MedicationDoseStatusHistoryDto>>> GetDoseHistory(int doseId)
    {
        var careRecipientId = await _medicationService.GetDoseCareRecipientIdAsync(doseId);
        if (!careRecipientId.HasValue) return NotFound(new { error = "Dose not found" });

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        if (!string.IsNullOrEmpty(restrictedCaregiverId))
        {
            var patient = await _patientService.GetPatientByIdAsync(careRecipientId.Value, restrictedCaregiverId);
            if (patient == null) return Forbid();
        }

        return Ok(await _medicationService.GetDoseHistoryAsync(doseId));
    }

    [HttpGet("reports/overview")]
    public async Task<ActionResult<MedicationAdministrationOverviewReportDto>> GetAdministrationOverviewReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int? patientId,
        [FromQuery] int? medicationId,
        [FromQuery] ShiftSlot? shiftSlot,
        [FromQuery] string? recordedByUserId)
    {
        if (!IsAdminLikeActor())
        {
            return Forbid();
        }

        return Ok(await _medicationService.GetAdministrationOverviewReportAsync(from, to, patientId, medicationId, shiftSlot, recordedByUserId));
    }

    [HttpGet("reports/missed-trends")]
    public async Task<ActionResult<List<MedicationAdministrationTrendPointDto>>> GetAdministrationTrendReport(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to,
        [FromQuery] int? patientId,
        [FromQuery] int? medicationId,
        [FromQuery] ShiftSlot? shiftSlot,
        [FromQuery] string? recordedByUserId)
    {
        if (!IsAdminLikeActor())
        {
            return Forbid();
        }

        return Ok(await _medicationService.GetAdministrationTrendReportAsync(from, to, patientId, medicationId, shiftSlot, recordedByUserId));
    }

    [HttpPost("doses/{doseId}/confirm-by-patient")]
    public async Task<ActionResult<MedicationDoseDto>> ConfirmByPatient(int doseId, [FromBody] PatientConfirmMedicationDoseDto dto)
    {
        if (!IsPatientSelfServiceActor())
        {
            return Forbid();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            return Ok(await _medicationService.ConfirmDoseByPatientAsync(doseId, dto, userId));
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

    [HttpPost("doses/{doseId}/skip-by-patient")]
    public async Task<ActionResult<MedicationDoseDto>> SkipByPatient(int doseId, [FromBody] PatientSkipMedicationDoseDto dto)
    {
        if (!IsPatientSelfServiceActor())
        {
            return Forbid();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            return Ok(await _medicationService.SkipDoseByPatientAsync(doseId, dto, userId));
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

    [HttpPost("doses/{doseId}/record-by-nurse")]
    public async Task<ActionResult<MedicationDoseDto>> RecordByNurse(int doseId, [FromBody] NurseRecordMedicationDoseDto dto)
    {
        if (IsPatientSelfServiceActor())
        {
            return Forbid();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            var restrictedCaregiverId = GetCaregiverIdIfRestricted();
            if (!string.IsNullOrEmpty(restrictedCaregiverId))
            {
                var careRecipientId = await _medicationService.GetDoseCareRecipientIdAsync(doseId);
                if (!careRecipientId.HasValue) return NotFound(new { error = "Dose not found" });

                var patient = await _patientService.GetPatientByIdAsync(careRecipientId.Value, restrictedCaregiverId);
                if (patient == null) return Forbid();
            }

            return Ok(await _medicationService.RecordDoseByNurseAsync(doseId, dto, userId, IsAdminLikeActor()));
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

    [HttpPost("doses/{doseId}/review")]
    public async Task<ActionResult<MedicationDoseDto>> ReviewDose(int doseId, [FromBody] ReviewMedicationDoseDto dto)
    {
        if (IsPatientSelfServiceActor())
        {
            return Forbid();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            var restrictedCaregiverId = GetCaregiverIdIfRestricted();
            if (!string.IsNullOrEmpty(restrictedCaregiverId))
            {
                var careRecipientId = await _medicationService.GetDoseCareRecipientIdAsync(doseId);
                if (!careRecipientId.HasValue) return NotFound(new { error = "Dose not found" });

                var patient = await _patientService.GetPatientByIdAsync(careRecipientId.Value, restrictedCaregiverId);
                if (patient == null) return Forbid();
            }

            return Ok(await _medicationService.ReviewDoseAsync(doseId, dto, userId, IsAdminLikeActor()));
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

    [HttpPost("doses/{doseId}/correct")]
    public async Task<ActionResult<MedicationDoseDto>> CorrectDose(int doseId, [FromBody] CorrectMedicationDoseDto dto)
    {
        if (!IsAdminLikeActor())
        {
            return Forbid();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        try
        {
            return Ok(await _medicationService.CorrectDoseAsync(doseId, dto, userId));
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
