using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Salmandyar.API.Services;
using Salmandyar.Application.Services;
using Salmandyar.Domain.Constants;

namespace Salmandyar.API.Controllers;

public sealed class LabExceptionFilter : ExceptionFilterAttribute
{
    public override void OnException(ExceptionContext context)
    {
        if (context.Exception is not LabException error) return;
        context.Result = new ObjectResult(new { error = error.Message }) { StatusCode = error.Status };
        context.ExceptionHandled = true;
    }
}

[ApiController, Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin},{Roles.Nurse},{Roles.Patient},{Roles.Elderly}")]
[Route("api/labs"), LabExceptionFilter]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class LabsController(ILabService labs, IWebHostEnvironment environment, ILogger<LabsController> logger) : ControllerBase
{
    private LabActor Actor => new(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "",
        User.FindAll(ClaimTypes.Role).Select(x => x.Value).ToArray());
    private string StorageFolder => Path.Combine(environment.ContentRootPath, "App_Data", "patient-documents", "labs");

    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct) => Ok(new { patientId = await labs.GetMyPatientIdAsync(Actor, ct) });

    [HttpGet("categories")]
    public async Task<IActionResult> Categories(CancellationToken ct, bool all = false) =>
        Ok(await labs.GetCategoriesAsync(Actor, all, ct));

    [HttpGet("definitions")]
    public async Task<IActionResult> Definitions(CancellationToken ct, int? categoryId = null, string? search = null, bool? active = null, bool all = false) =>
        Ok(await labs.GetDefinitionsAsync(Actor, categoryId, search, active, all, ct));

    [HttpPost("categories"), Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> CreateCategory(LabCategoryInput input, CancellationToken ct) =>
        Ok(new { id = await labs.SaveCategoryAsync(Actor, null, input, ct) });

    [HttpPut("categories/{id:int}"), Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> UpdateCategory(int id, LabCategoryInput input, CancellationToken ct) =>
        Ok(new { id = await labs.SaveCategoryAsync(Actor, id, input, ct) });

    [HttpDelete("categories/{id:int}"), Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> DeleteCategory(int id, CancellationToken ct)
    {
        await labs.DeleteCatalogAsync(Actor, id, true, ct);
        return NoContent();
    }

    [HttpPost("definitions"), Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> CreateDefinition(LabDefinitionInput input, CancellationToken ct) =>
        Ok(new { id = await labs.SaveDefinitionAsync(Actor, null, input, ct) });

    [HttpPut("definitions/{id:int}"), Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> UpdateDefinition(int id, LabDefinitionInput input, CancellationToken ct) =>
        Ok(new { id = await labs.SaveDefinitionAsync(Actor, id, input, ct) });

    [HttpDelete("definitions/{id:int}"), Authorize(Roles = $"{Roles.Admin},{Roles.SuperAdmin}")]
    public async Task<IActionResult> DeleteDefinition(int id, CancellationToken ct)
    {
        await labs.DeleteCatalogAsync(Actor, id, false, ct);
        return NoContent();
    }

    [HttpGet("patients/{patientId:int}/reports")]
    public async Task<IActionResult> Reports(int patientId, CancellationToken ct, int? categoryId = null, DateTime? from = null, DateTime? to = null, int page = 1) =>
        Ok(await labs.GetReportsAsync(Actor, patientId, categoryId, from, to, page, ct));

    [HttpGet("patients/{patientId:int}/reports/{id:guid}")]
    public async Task<IActionResult> Report(int patientId, Guid id, CancellationToken ct) =>
        Ok(await labs.GetReportAsync(Actor, patientId, id, ct));

    [HttpPost("patients/{patientId:int}/reports")]
    public async Task<IActionResult> CreateReport(int patientId, LabReportInput input, CancellationToken ct) =>
        Ok(await labs.SaveReportAsync(Actor, patientId, null, input, ct));

    [HttpPut("patients/{patientId:int}/reports/{id:guid}")]
    public async Task<IActionResult> UpdateReport(int patientId, Guid id, LabReportInput input, CancellationToken ct) =>
        Ok(await labs.SaveReportAsync(Actor, patientId, id, input, ct));

    [HttpDelete("patients/{patientId:int}/reports/{id:guid}")]
    public async Task<IActionResult> DeleteReport(int patientId, Guid id, [FromQuery] Guid version, CancellationToken ct)
    {
        await labs.DeleteReportAsync(Actor, patientId, id, version, ct);
        return NoContent();
    }

    [HttpGet("patients/{patientId:int}/trend/{definitionId:int}")]
    public async Task<IActionResult> Trend(int patientId, int definitionId, CancellationToken ct) =>
        Ok(await labs.GetTrendAsync(Actor, patientId, definitionId, ct));

    [HttpPost("patients/{patientId:int}/reports/{id:guid}/file")]
    [RequestSizeLimit(PatientProfileDocumentStorage.MaxLabUploadBytes + 65536)]
    [RequestFormLimits(MultipartBodyLengthLimit = PatientProfileDocumentStorage.MaxLabUploadBytes + 65536)]
    public async Task<IActionResult> Upload(int patientId, Guid id, [FromForm] IFormFile file, [FromForm] Guid version, CancellationToken ct)
    {
        await labs.EnsureFileWriteAsync(Actor, patientId, id, version, ct);
        StoredPatientDocument stored;
        try { stored = await PatientProfileDocumentStorage.SaveLabOriginalAsync(file, StorageFolder, ct); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
        catch (SixLabors.ImageSharp.UnknownImageFormatException) { return BadRequest(new { error = "فایل تصویر معتبر نیست." }); }
        catch (SixLabors.ImageSharp.InvalidImageContentException) { return BadRequest(new { error = "فایل تصویر آسیب دیده است." }); }
        try
        {
            var old = await labs.SetFileAsync(Actor, patientId, id, version, new LabFile(stored.FileName, file.ContentType), ct);
            RemoveFile(old);
        }
        catch { RemoveFile(new LabFile(stored.FileName, file.ContentType)); throw; }
        return Ok(await labs.GetReportAsync(Actor, patientId, id, ct));
    }

    [HttpDelete("patients/{patientId:int}/reports/{id:guid}/file")]
    public async Task<IActionResult> DeleteFile(int patientId, Guid id, [FromQuery] Guid version, CancellationToken ct)
    {
        RemoveFile(await labs.SetFileAsync(Actor, patientId, id, version, null, ct));
        return Ok(await labs.GetReportAsync(Actor, patientId, id, ct));
    }

    [HttpGet("patients/{patientId:int}/reports/{id:guid}/file")]
    public async Task<IActionResult> Download(int patientId, Guid id, CancellationToken ct)
    {
        var file = await labs.GetFileAsync(Actor, patientId, id, ct);
        var path = Path.Combine(StorageFolder, Path.GetFileName(file.Key));
        if (!System.IO.File.Exists(path)) return NotFound();
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        Response.Headers["Content-Security-Policy"] = "sandbox; default-src 'none'";
        return PhysicalFile(path, file.ContentType, $"lab-{id}{Path.GetExtension(file.Key)}", enableRangeProcessing: true);
    }

    private void RemoveFile(LabFile? file)
    {
        if (file == null) return;
        try { System.IO.File.Delete(Path.Combine(StorageFolder, Path.GetFileName(file.Key))); }
        catch (IOException ex) { logger.LogWarning(ex, "Unable to remove superseded lab attachment"); }
        catch (UnauthorizedAccessException ex) { logger.LogWarning(ex, "Unable to remove superseded lab attachment"); }
    }
}
