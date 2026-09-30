using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.Services;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services;

public class LabService(ApplicationDbContext db, IPatientService patients) : ILabService
{
    private static bool IsAdmin(LabActor actor) => actor.Roles.Contains(Roles.Admin) || actor.Roles.Contains(Roles.SuperAdmin);
    private static bool IsPatient(LabActor actor) => actor.Roles.Contains(Roles.Patient) || actor.Roles.Contains(Roles.Elderly);
    private static void Admin(LabActor actor)
    {
        if (!IsAdmin(actor)) throw new LabException(403, "دسترسی مدیریت آزمایش‌ها مجاز نیست.");
    }
    private static void Validate(object input)
    {
        var errors = new List<ValidationResult>();
        if (!Validator.TryValidateObject(input, new ValidationContext(input), errors, true))
            throw new LabException(400, "اطلاعات واردشده معتبر نیست. طول و نوع فیلدها را بررسی کنید.");
    }
    private async Task Access(LabActor actor, int patientId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(actor.UserId)) throw new LabException(401, "ورود به حساب الزامی است.");
        if (IsAdmin(actor))
        {
            if (!await db.CareRecipients.AnyAsync(x => x.Id == patientId, ct)) throw Missing();
            return;
        }
        // Self-service is strictly ownership based, never a patient ID supplied by the client.
        if (IsPatient(actor))
        {
            if (await db.CareRecipients.AnyAsync(x => x.Id == patientId && x.UserId == actor.UserId, ct)) return;
            throw Missing();
        }
        if (actor.Roles.Contains(Roles.Nurse) &&
            await patients.GetPatientByIdAsync(patientId, actor.UserId) != null) return;
        throw Missing();
    }
    private static LabException Missing() => new(404, "اطلاعات یافت نشد یا دسترسی مجاز نیست.");
    private static void Editable(LabActor actor, PatientLabReport report)
    {
        if (!IsAdmin(actor) && report.CreatedByUserId != actor.UserId)
            throw new LabException(403, "فقط ثبت‌کننده یا مدیر می‌تواند این گزارش را ویرایش کند.");
    }
    private static void Version(PatientLabReport report, Guid? version)
    {
        if (version != report.Version) throw new LabException(409, "گزارش تغییر کرده است. اطلاعات را دوباره دریافت کنید.");
    }
    private void Audit(LabActor actor, string action, string entity, object id)
    {
        // Do not duplicate medical values or document contents into audit logs.
        db.AuditLogs.Add(new AuditLog { UserId = actor.UserId, Action = action, EntityName = entity, EntityId = id.ToString() });
    }
    private async Task Save(CancellationToken ct)
    {
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { throw new LabException(409, "اطلاعات هم‌زمان تغییر کرده است؛ صفحه را تازه‌سازی کنید."); }
        catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: "23505" })
        { throw new LabException(409, "نام یا کد تکراری است."); }
    }
    public async Task<int> GetMyPatientIdAsync(LabActor actor, CancellationToken ct)
    {
        if (!IsPatient(actor)) throw Missing();
        return await db.CareRecipients.Where(x => x.UserId == actor.UserId).Select(x => (int?)x.Id).FirstOrDefaultAsync(ct) ?? throw Missing();
    }
    public async Task<List<LabCategoryDto>> GetCategoriesAsync(LabActor actor, bool all, CancellationToken ct)
    {
        if (all) Admin(actor);
        return await db.LabTestCategories.AsNoTracking()
            .Where(x => !x.IsDeleted && (all || x.IsActive)).OrderBy(x => x.SortOrder).ThenBy(x => x.Id)
            .Select(x => new LabCategoryDto(x.Id, x.Name, x.Description, x.IsActive, x.SortOrder,
                db.LabTestDefinitions.Count(d => d.CategoryId == x.Id && !d.IsDeleted && (all || d.IsActive))))
            .ToListAsync(ct);
    }
    public async Task<List<LabTestDefinition>> GetDefinitionsAsync(LabActor actor, int? categoryId, string? search, bool? active, bool all, CancellationToken ct)
    {
        if (all) Admin(actor);
        var query = db.LabTestDefinitions.AsNoTracking().Where(x => !x.IsDeleted && !x.Category.IsDeleted);
        if (!all) query = query.Where(x => x.IsActive && x.Category.IsActive);
        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId);
        if (active.HasValue) query = query.Where(x => x.IsActive == active);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Name.ToLower().Contains(term) || x.Code.ToLower().Contains(term) ||
                (x.EnglishName != null && x.EnglishName.ToLower().Contains(term)));
        }
        return await query.OrderBy(x => x.SortOrder).ThenBy(x => x.Id).Take(1000).ToListAsync(ct);
    }
    public async Task<int> SaveCategoryAsync(LabActor actor, int? id, LabCategoryInput input, CancellationToken ct)
    {
        Admin(actor); Validate(input);
        var entity = id.HasValue ? await db.LabTestCategories.SingleOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct) ?? throw Missing() : new LabTestCategory();
        entity.Name = input.Name.Trim(); entity.Description = input.Description?.Trim();
        entity.IsActive = input.IsActive; entity.SortOrder = input.SortOrder;
        entity.UpdatedAt = DateTime.UtcNow;
        if (!id.HasValue) db.LabTestCategories.Add(entity);
        Audit(actor, id.HasValue ? "UpdateLabCategory" : "CreateLabCategory", nameof(LabTestCategory), id?.ToString() ?? entity.Name);
        await Save(ct);
        return entity.Id;
    }
    public async Task<int> SaveDefinitionAsync(LabActor actor, int? id, LabDefinitionInput input, CancellationToken ct)
    {
        Admin(actor); Validate(input);
        if (!await db.LabTestCategories.AnyAsync(x => x.Id == input.CategoryId && !x.IsDeleted, ct)) throw Missing();
        if (input.ReferenceMin > input.ReferenceMax || input.CriticalMin > input.CriticalMax ||
            input.CriticalMin > input.ReferenceMin || input.CriticalMax < input.ReferenceMax)
            throw new LabException(400, "ترتیب محدوده‌های مرجع و خطر معتبر نیست.");
        if (input.DataType != LabDataType.Number &&
            (input.ReferenceMin.HasValue || input.ReferenceMax.HasValue || input.CriticalMin.HasValue || input.CriticalMax.HasValue))
            throw new LabException(400, "محدوده مرجع فقط برای داده عددی قابل تعریف است.");
        var entity = id.HasValue ? await db.LabTestDefinitions.SingleOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct) ?? throw Missing() : new LabTestDefinition();
        entity.Name = input.Name.Trim(); entity.Code = input.Code.Trim().ToUpperInvariant();
        entity.EnglishName = input.EnglishName?.Trim(); entity.CategoryId = input.CategoryId;
        entity.Unit = input.Unit?.Trim(); entity.DataType = input.DataType;
        entity.ReferenceMin = input.ReferenceMin; entity.ReferenceMax = input.ReferenceMax;
        entity.CriticalMin = input.CriticalMin; entity.CriticalMax = input.CriticalMax;
        entity.Description = input.Description?.Trim(); entity.SortOrder = input.SortOrder;
        entity.IsActive = input.IsActive; entity.UpdatedAt = DateTime.UtcNow;
        if (!id.HasValue) db.LabTestDefinitions.Add(entity);
        Audit(actor, id.HasValue ? "UpdateLabDefinition" : "CreateLabDefinition", nameof(LabTestDefinition), id?.ToString() ?? entity.Code);
        await Save(ct);
        return entity.Id;
    }
    public async Task DeleteCatalogAsync(LabActor actor, int id, bool category, CancellationToken ct)
    {
        Admin(actor);
        if (category)
        {
            var entity = await db.LabTestCategories.SingleOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct) ?? throw Missing();
            entity.IsDeleted = true; entity.IsActive = false; entity.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var entity = await db.LabTestDefinitions.SingleOrDefaultAsync(x => x.Id == id && !x.IsDeleted, ct) ?? throw Missing();
            entity.IsDeleted = true; entity.IsActive = false; entity.UpdatedAt = DateTime.UtcNow;
        }
        Audit(actor, "DeleteLabCatalog", category ? nameof(LabTestCategory) : nameof(LabTestDefinition), id);
        await Save(ct);
    }
    private IQueryable<PatientLabReport> Reports(int patientId) => db.PatientLabReports
        .Where(x => x.PatientId == patientId && !x.IsDeleted).Include(x => x.Category).Include(x => x.Results);
    private static LabReportDto Map(LabActor actor, PatientLabReport r) => new(r.Id, r.PatientId, r.CategoryId,
        r.Category.Name, r.PerformedAt, r.ReportTitle, r.LaboratoryName, r.Notes,
        r.FileUrl == null ? null : $"/labs/patients/{r.PatientId}/reports/{r.Id}/file", r.FileType,
        r.Version, IsAdmin(actor) || r.CreatedByUserId == actor.UserId,
        r.Results.OrderBy(x => x.Name).Select(x => new LabResultDto(x.Id, x.LabTestDefinitionId, x.Name, x.DataType,
            x.NumericValue, x.TextValue, x.BooleanValue, x.Unit, x.ReferenceMin, x.ReferenceMax, x.IsAbnormal, x.Notes)).ToList());
    public async Task<LabPage<LabReportDto>> GetReportsAsync(LabActor actor, int patientId, int? categoryId, DateTime? from, DateTime? to, int page, CancellationToken ct)
    {
        await Access(actor, patientId, ct);
        if (from > to || page < 1 || page > 100000) throw new LabException(400, "بازه تاریخ یا صفحه معتبر نیست.");
        var query = Reports(patientId).AsNoTracking();
        if (categoryId.HasValue) query = query.Where(x => x.CategoryId == categoryId);
        if (from.HasValue) query = query.Where(x => x.PerformedAt >= from.Value.ToUniversalTime());
        if (to.HasValue) query = query.Where(x => x.PerformedAt <= to.Value.ToUniversalTime());
        var count = await query.CountAsync(ct);
        var items = await query.OrderByDescending(x => x.PerformedAt).ThenBy(x => x.Id).Skip((page - 1) * 20).Take(20).ToListAsync(ct);
        return new(items.Select(x => Map(actor, x)).ToList(), count, page, 20);
    }
    public async Task<LabReportDto> GetReportAsync(LabActor actor, int patientId, Guid id, CancellationToken ct)
    {
        await Access(actor, patientId, ct);
        return Map(actor, await Reports(patientId).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw Missing());
    }
    public async Task<LabReportDto> SaveReportAsync(LabActor actor, int patientId, Guid? id, LabReportInput input, CancellationToken ct)
    {
        await Access(actor, patientId, ct); Validate(input);
        if (input.PerformedAt == default || input.PerformedAt.ToUniversalTime() > DateTime.UtcNow.AddDays(1))
            throw new LabException(400, "تاریخ انجام آزمایش معتبر نیست.");
        if (input.Results == null || input.Results.Select(x => x.LabTestDefinitionId).Distinct().Count() != input.Results.Count)
            throw new LabException(400, "آیتم تکراری در نتایج وجود دارد.");
        var report = id.HasValue ? await Reports(patientId).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw Missing() :
            new PatientLabReport { PatientId = patientId, CreatedByUserId = actor.UserId };
        if (id.HasValue) { Editable(actor, report); Version(report, input.Version); }
        var category = await db.LabTestCategories.SingleOrDefaultAsync(x => x.Id == input.CategoryId, ct) ?? throw Missing();
        if ((category.IsDeleted || !category.IsActive) && (!id.HasValue || report.CategoryId != category.Id))
            throw new LabException(400, "دسته آزمایش غیرفعال است.");
        if (id.HasValue && report.Results.Count > 0 && report.CategoryId != input.CategoryId)
            throw new LabException(400, "دسته گزارش دارای نتیجه قابل تغییر نیست.");
        var definitionIds = input.Results.Select(x => x.LabTestDefinitionId).ToList();
        var definitions = await db.LabTestDefinitions.Where(x => definitionIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, ct);
        foreach (var value in input.Results)
        {
            Validate(value);
            var existing = report.Results.SingleOrDefault(x => x.LabTestDefinitionId == value.LabTestDefinitionId);
            if (!definitions.TryGetValue(value.LabTestDefinitionId, out var definition) ||
                (existing == null && (definition.IsDeleted || !definition.IsActive || definition.CategoryId != category.Id)))
                throw new LabException(400, "آیتم آزمایش معتبر یا فعال نیست.");
            var result = existing ?? new PatientLabResult
            {
                LabTestDefinitionId = definition.Id, Name = definition.Name, DataType = definition.DataType,
                Unit = definition.Unit, ReferenceMin = definition.ReferenceMin, ReferenceMax = definition.ReferenceMax,
                CriticalMin = definition.CriticalMin, CriticalMax = definition.CriticalMax
            };
            var valid = result.DataType switch
            {
                LabDataType.Number => value.NumericValue.HasValue && value.TextValue == null && value.BooleanValue == null,
                LabDataType.Text => !string.IsNullOrWhiteSpace(value.TextValue) && value.NumericValue == null && value.BooleanValue == null,
                LabDataType.Boolean => value.BooleanValue.HasValue && value.NumericValue == null && value.TextValue == null,
                _ => false
            };
            if (!valid) throw new LabException(400, $"نوع مقدار برای {result.Name} معتبر نیست.");
            result.NumericValue = value.NumericValue; result.TextValue = value.TextValue?.Trim();
            result.BooleanValue = value.BooleanValue; result.Notes = value.Notes?.Trim();
            result.IsAbnormal = value.NumericValue.HasValue &&
                (value.NumericValue < result.ReferenceMin || value.NumericValue > result.ReferenceMax);
            if (existing == null) report.Results.Add(result);
        }
        db.PatientLabResults.RemoveRange(report.Results.Where(x => !definitionIds.Contains(x.LabTestDefinitionId)).ToList());
        report.Results.RemoveAll(x => !definitionIds.Contains(x.LabTestDefinitionId));
        report.Category = category; report.CategoryId = category.Id;
        report.ReportTitle = input.ReportTitle.Trim(); report.LaboratoryName = input.LaboratoryName.Trim();
        report.PerformedAt = input.PerformedAt.ToUniversalTime(); report.Notes = input.Notes?.Trim();
        report.UpdatedAt = DateTime.UtcNow; report.Version = Guid.NewGuid();
        if (!id.HasValue) db.PatientLabReports.Add(report);
        Audit(actor, id.HasValue ? "UpdateLabReportAndResults" : "CreateLabReport", nameof(PatientLabReport), report.Id);
        await Save(ct);
        return Map(actor, report);
    }
    public async Task DeleteReportAsync(LabActor actor, int patientId, Guid id, Guid version, CancellationToken ct)
    {
        await Access(actor, patientId, ct);
        var report = await Reports(patientId).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw Missing();
        Editable(actor, report); Version(report, version);
        report.IsDeleted = true; report.UpdatedAt = DateTime.UtcNow; report.Version = Guid.NewGuid();
        Audit(actor, "DeleteLabReport", nameof(PatientLabReport), id);
        await Save(ct);
    }
    public async Task<List<LabTrendPoint>> GetTrendAsync(LabActor actor, int patientId, int definitionId, CancellationToken ct)
    {
        await Access(actor, patientId, ct);
        return await db.PatientLabResults.AsNoTracking()
            .Where(x => x.Report.PatientId == patientId && !x.Report.IsDeleted &&
                x.LabTestDefinitionId == definitionId && x.NumericValue != null)
            .OrderByDescending(x => x.Report.PerformedAt).ThenBy(x => x.Id).Take(500)
            .Select(x => new LabTrendPoint(x.PatientLabReportId, x.Report.PerformedAt, x.NumericValue!.Value, x.Unit,
                x.ReferenceMin, x.ReferenceMax)).ToListAsync(ct);
    }
    public async Task EnsureFileWriteAsync(LabActor actor, int patientId, Guid id, Guid version, CancellationToken ct)
    {
        await Access(actor, patientId, ct);
        var report = await Reports(patientId).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw Missing();
        Editable(actor, report); Version(report, version);
    }
    public async Task<LabFile?> SetFileAsync(LabActor actor, int patientId, Guid id, Guid version, LabFile? file, CancellationToken ct)
    {
        await EnsureFileWriteAsync(actor, patientId, id, version, ct);
        var report = await Reports(patientId).SingleAsync(x => x.Id == id, ct);
        var previous = report.FileUrl == null ? null : new LabFile(report.FileUrl, report.FileType!);
        report.FileUrl = file?.Key; report.FileType = file?.ContentType;
        report.UpdatedAt = DateTime.UtcNow; report.Version = Guid.NewGuid();
        Audit(actor, file == null ? "RemoveLabFile" : "UploadLabFile", nameof(PatientLabReport), id);
        await Save(ct);
        return previous;
    }
    public async Task<LabFile> GetFileAsync(LabActor actor, int patientId, Guid id, CancellationToken ct)
    {
        await Access(actor, patientId, ct);
        var report = await Reports(patientId).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw Missing();
        return report.FileUrl == null ? throw Missing() : new LabFile(report.FileUrl, report.FileType!);
    }
}
