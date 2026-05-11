using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Salmandyar.API.Hubs;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Domain.Enums;
using Salmandyar.Domain.Constants;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly IHubContext<ServiceHub> _hubContext;
    private readonly IHubContext<NotificationHub> _notificationHub;
    private readonly IUserNotificationService _userNotifications;

    public PatientsController(
        IPatientService patientService,
        IHubContext<ServiceHub> hubContext,
        IHubContext<NotificationHub> notificationHub,
        IUserNotificationService userNotifications)
    {
        _patientService = patientService;
        _hubContext = hubContext;
        _notificationHub = notificationHub;
        _userNotifications = userNotifications;
    }

    private string? GetCaregiverIdIfRestricted()
    {
        if (User.IsInRole(Roles.SuperAdmin) || User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Manager) || User.IsInRole(Roles.Supervisor))
        {
            return null;
        }
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
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

    [HttpPost]
    [Authorize(Roles = $"{Roles.SuperAdmin},{Roles.Admin},{Roles.Manager},{Roles.Supervisor}")]
    public async Task<ActionResult<PatientDto>> CreatePatient([FromBody] CreatePatientDto dto)
    {
        var patient = await _patientService.CreatePatientAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = patient.Id }, patient);
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

        var result = await _patientService.AddVitalSignAsync(userId, dto);

        await _hubContext.Clients.Group($"Patient_{dto.CareRecipientId}").SendAsync("ReceiveVitalUpdate");

        if (result.Alerts.Count > 0)
        {
            var severity = result.Alerts.Max(a => a.Severity);
            var title = severity == VitalAlertSeverity.Critical ? "هشدار فوری علائم حیاتی" : "هشدار علائم حیاتی";
            var alertTitles = string.Join("، ", result.Alerts.Select(a => a.Title).Take(3));
            var message = $"{result.PatientName}: {alertTitles}";
            var link = $"/dashboard/patients/{dto.CareRecipientId}?tab=vitals";

            foreach (var recipientId in result.RecipientUserIds)
            {
                await _userNotifications.CreateNotificationAsync(
                    recipientId,
                    title,
                    message,
                    NotificationType.Alert,
                    referenceId: result.VitalSignId.ToString(),
                    link: link
                );

                await _notificationHub.Clients.Group($"User_{recipientId}").SendAsync("ReceiveNotification", new
                {
                    title,
                    message,
                    link,
                    severity = severity.ToString(),
                    patientId = result.CareRecipientId,
                    vitalSignId = result.VitalSignId
                });
            }
        }
        return Ok(result);
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

        await _patientService.AddNursingReportAsync(userId, dto);
        return Ok();
    }
}
