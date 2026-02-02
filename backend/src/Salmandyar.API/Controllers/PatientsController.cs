using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
using System.Security.Claims;

namespace Salmandyar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet]
    public async Task<ActionResult<List<PatientListDto>>> GetAll()
    {
        return Ok(await _patientService.GetAllPatientsAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PatientDto>> GetById(int id)
    {
        var patient = await _patientService.GetPatientByIdAsync(id);
        if (patient == null) return NotFound();
        return Ok(patient);
    }

    // Vital Signs
    [HttpGet("{id}/vitals")]
    public async Task<ActionResult<List<VitalSignDto>>> GetVitals(int id)
    {
        return Ok(await _patientService.GetVitalSignsAsync(id));
    }

    [HttpPost("{id}/vitals")]
    public async Task<IActionResult> AddVitalSign(int id, [FromBody] CreateVitalSignDto dto)
    {
        if (id != dto.CareRecipientId) return BadRequest();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();
        
        await _patientService.AddVitalSignAsync(userId, dto);
        return Ok();
    }

    // Services
    [HttpGet("{id}/services")]
    public async Task<ActionResult<List<CareServiceDto>>> GetServices(int id)
    {
        return Ok(await _patientService.GetCareServicesAsync(id));
    }

    [HttpPost("{id}/services")]
    public async Task<IActionResult> AddService(int id, [FromBody] CreateCareServiceDto dto)
    {
        if (id != dto.CareRecipientId) return BadRequest();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        await _patientService.AddCareServiceAsync(userId, dto);
        return Ok();
    }

    // Reports
    [HttpGet("{id}/reports")]
    public async Task<ActionResult<List<NursingReportDto>>> GetReports(int id)
    {
        return Ok(await _patientService.GetNursingReportsAsync(id));
    }

    [HttpPost("{id}/reports")]
    public async Task<IActionResult> AddReport(int id, [FromBody] CreateNursingReportDto dto)
    {
        if (id != dto.CareRecipientId) return BadRequest();
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        await _patientService.AddNursingReportAsync(userId, dto);
        return Ok();
    }
}
