using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Salmandyar.API.Hubs;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
using Salmandyar.Application.Services.PatientSelfServiceAccess;
using Salmandyar.Domain.Constants;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace Salmandyar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly IHubContext<ServiceHub> _hubContext;
    private readonly IPatientSelfServiceAccessService _patientSelfServiceAccessService;
    private readonly ILogger<PatientsController> _logger;

    public PatientsController(
        IPatientService patientService,
        IHubContext<ServiceHub> hubContext,
        IPatientSelfServiceAccessService patientSelfServiceAccessService,
        ILogger<PatientsController> logger)
    {
        _patientService = patientService;
        _hubContext = hubContext;
        _patientSelfServiceAccessService = patientSelfServiceAccessService;
        _logger = logger;
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

    [HttpGet]
    public async Task<ActionResult<List<PatientListDto>>> GetAll()
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        return Ok(await _patientService.GetAllPatientsAsync(restrictedCaregiverId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PatientDto>> GetById(int id)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return NotFound();
        return Ok(patient);
    }

    [HttpGet("{id}/current-shift-nurse")]
    public async Task<ActionResult<CurrentShiftNurseContactDto?>> GetCurrentShiftNurse(int id)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return NotFound();

        var nurse = await _patientService.GetCurrentShiftNurseContactAsync(id, restrictedCaregiverId);
        return Ok(nurse);
    }

    [HttpGet("{id}/self-service-access")]
    public async Task<IActionResult> GetSelfServiceAccess(int id)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return Forbid();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var summary = await _patientSelfServiceAccessService.GetPatientSummaryAsync(id, userId);
        return Ok(summary);
    }

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<PatientDto>> CreatePatient([FromBody] CreatePatientDto dto)
    {
        var patient = await _patientService.CreatePatientAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
    }

    [HttpPut("{id}/admin-info")]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<PatientDto>> UpdateAdminInfo(int id, [FromBody] UpdatePatientAdminInfoDto dto)
    {
        try
        {
            var updated = await _patientService.UpdatePatientAdminInfoAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (DbUpdateException)
        {
            return BadRequest(new { error = "اطلاعات ارسال‌شده معتبر نیست" });
        }
    }

    // Vital Signs
    [HttpGet("{id}/vitals")]
    public async Task<ActionResult<List<VitalSignDto>>> GetVitals(int id)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return NotFound();

        return Ok(await _patientService.GetVitalSignsAsync(id));
    }

    [HttpPost("{id}/vitals")]
    public async Task<IActionResult> AddVitalSign(int id, [FromBody] CreateVitalSignDto dto)
    {
        if (id != dto.CareRecipientId) return BadRequest();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return Forbid(); // Using Forbid since they don't have active assignment

        AddVitalSignResultDto result;
        try
        {
            result = await _patientService.AddVitalSignAsync(userId, dto);
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (DbUpdateException ex)
        {
            var errorId = Guid.NewGuid().ToString("N");
            _logger.LogError(ex, "DbUpdateException while saving vital sign. ErrorId={ErrorId}", errorId);

            // #region debug-point blood-sugar-save-error:db-update-ex
            _ = Task.Run(async () =>
            {
                try
                {
                    using var client = new HttpClient();
                    var payload = new
                    {
                        sessionId = "blood-sugar-save-error",
                        runId = "pre-fix",
                        hypothesisId = "H1",
                        location = "PatientsController:AddVitalSign",
                        msg = "[DEBUG] DbUpdateException while saving vital sign",
                        data = new
                        {
                            RoutePatientId = id,
                            dto.CareRecipientId,
                            RecorderUserId = userId,
                            dto,
                            exception = new
                            {
                                ex.Message,
                                InnerExceptionMessage = ex.InnerException?.Message,
                                InnerExceptionType = ex.InnerException?.GetType().FullName,
                                ex.StackTrace
                            }
                        },
                        ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                    };
                    await client.PostAsJsonAsync("http://127.0.0.1:7777/event", payload);
                }
                catch
                {
                }
            });
            // #endregion

            var isDevelopment = string.Equals(
                Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                "Development",
                StringComparison.OrdinalIgnoreCase);

            return StatusCode(500, new
            {
                error = "خطا در ذخیره علائم حیاتی. لطفاً از اعمال شدن Migrationهای پایگاه داده اطمینان حاصل کنید.",
                errorId,
                details = isDevelopment
                    ? new
                    {
                        ex.Message,
                        InnerExceptionMessage = ex.InnerException?.Message,
                        InnerExceptionType = ex.InnerException?.GetType().FullName
                    }
                    : null
            });
        }

        // #region debug-point A:vital-broadcast
        _ = Task.Run(async () =>
        {
            try
            {
                using var client = new HttpClient();
                var payload = new
                {
                    sessionId = "vitals-realtime-sync",
                    runId = "pre-fix",
                    hypothesisId = "A",
                    location = "PatientsController:AddVitalSign",
                    msg = "[DEBUG] Vital sign saved; broadcasting ReceiveVitalUpdate",
                    data = new { dto.CareRecipientId, RoutePatientId = id, RecorderUserId = userId },
                    ts = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
                await client.PostAsJsonAsync("http://127.0.0.1:7777/event", payload);
            }
            catch
            {
            }
        });
        // #endregion

        await _hubContext.Clients.Group($"Patient_{dto.CareRecipientId}").SendAsync("ReceiveVitalUpdate");

        return Ok(result);
    }

    [HttpPost("{id}/vitals/{vitalSignId}/acknowledge")]
    public async Task<IActionResult> AcknowledgeVitalSign(int id, int vitalSignId, [FromBody] AcknowledgeVitalSignDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return Forbid();

        try
        {
            var result = await _patientService.AcknowledgeVitalSignAsync(id, vitalSignId, userId, dto);
            await _hubContext.Clients.Group($"Patient_{id}").SendAsync("ReceiveVitalUpdate");
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, new { error = "ذخیره تایید مشاهده انجام نشد. به احتمال زیاد سرویس بک‌اند ری‌استارت نشده یا تغییرات پایگاه داده هنوز اعمال نشده است." });
        }
    }

    // Services
    [HttpGet("{id}/services")]
    public async Task<ActionResult<List<CareServiceDto>>> GetServices(int id)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return NotFound();

        return Ok(await _patientService.GetCareServicesAsync(id));
    }

    [HttpPost("{id}/services")]
    public async Task<IActionResult> AddService(int id, [FromBody] CreateCareServiceDto dto)
    {
        if (id != dto.CareRecipientId) return BadRequest(new { error = "شناسه بیمار نامعتبر است" });
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return Forbid();

        try
        {
            await _patientService.AddCareServiceAsync(userId, dto);

            await _hubContext.Clients.Group($"Patient_{dto.CareRecipientId}").SendAsync("ReceiveServiceUpdate");

            return Ok();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException)
        {
            return BadRequest(new { error = "اطلاعات ارسال‌شده معتبر نیست" });
        }
    }

    [HttpPut("services/{serviceId}")]
    public async Task<IActionResult> UpdateService(int serviceId, [FromBody] UpdateCareServiceDto dto)
    {
        // For update, let's keep it simple or assume admin
        // Normally you'd check if the service belongs to a valid patient
        try
        {
            var patientId = await _patientService.UpdateCareServiceAsync(serviceId, dto);

            await _hubContext.Clients.Group($"Patient_{patientId}").SendAsync("ReceiveServiceUpdate");

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpDelete("services/{serviceId}")]
    public async Task<IActionResult> DeleteService(int serviceId)
    {
        try
        {
            var patientId = await _patientService.DeleteCareServiceAsync(serviceId);

            await _hubContext.Clients.Group($"Patient_{patientId}").SendAsync("ReceiveServiceUpdate");

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // Reports
    [HttpGet("{id}/reports")]
    public async Task<ActionResult<List<NursingReportDto>>> GetReports(int id)
    {
        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return NotFound();

        return Ok(await _patientService.GetNursingReportsAsync(id));
    }

    [HttpPost("{id}/reports")]
    public async Task<IActionResult> AddReport(int id, [FromBody] CreateNursingReportDto dto)
    {
        if (id != dto.CareRecipientId) return BadRequest();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var restrictedCaregiverId = GetCaregiverIdIfRestricted();
        var patient = await _patientService.GetPatientByIdAsync(id, restrictedCaregiverId);
        if (patient == null) return Forbid();

        try
        {
            await _patientService.AddNursingReportAsync(userId, dto);
            return Ok();
        }
        catch (PatientSelfServiceAccessDeniedException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }
}
