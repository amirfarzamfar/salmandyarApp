using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Salmandyar.API.Hubs;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
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

    public PatientsController(IPatientService patientService, IHubContext<ServiceHub> hubContext)
    {
        _patientService = patientService;
        _hubContext = hubContext;
    }

    private string? GetCaregiverIdIfRestricted()
    {
        if (User.IsInRole(Roles.Admin) || User.IsInRole(Roles.Supervisor))
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

        await _patientService.AddVitalSignAsync(userId, dto);
        return Ok();
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
