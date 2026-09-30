using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Infrastructure.Persistence;

internal static class LabModelConfiguration
{
    public static void Configure(ModelBuilder builder)
    {
        var categories = builder.Entity<LabTestCategory>();
        categories.HasIndex(x => x.Name).IsUnique().HasFilter("\"IsDeleted\" = false");
        var definitions = builder.Entity<LabTestDefinition>();
        definitions.HasIndex(x => x.Code).IsUnique().HasFilter("\"IsDeleted\" = false");
        definitions.HasIndex(x => new { x.CategoryId, x.IsActive, x.SortOrder });
        definitions.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        var reports = builder.Entity<PatientLabReport>();
        reports.HasIndex(x => new { x.PatientId, x.IsDeleted, x.PerformedAt });
        reports.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        reports.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        reports.HasOne<User>().WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
        var results = builder.Entity<PatientLabResult>();
        results.HasIndex(x => new { x.PatientLabReportId, x.LabTestDefinitionId }).IsUnique();
        results.HasIndex(x => x.LabTestDefinitionId);
        results.HasOne(x => x.Report).WithMany(x => x.Results).HasForeignKey(x => x.PatientLabReportId).OnDelete(DeleteBehavior.Cascade);
        results.HasOne(x => x.Definition).WithMany().HasForeignKey(x => x.LabTestDefinitionId).OnDelete(DeleteBehavior.Restrict);

        var created = new DateTime(2026, 9, 26, 0, 0, 0, DateTimeKind.Utc);
        string[] names = ["CBC و هماتولوژی", "قند خون", "عملکرد کلیه", "عملکرد کبد", "چربی خون",
            "تیروئید و هورمون‌ها", "انعقادی", "ادرار", "کشت‌ها"];
        string[][] codes =
        [
            ["WBC", "RBC", "Hb", "Hct", "MCV", "MCH", "MCHC", "PLT", "Neutrophil", "Lymphocyte"],
            ["FBS", "BS", "HbA1c"], ["BUN", "Creatinine", "Uric-Acid"],
            ["AST", "ALT", "ALP", "Bilirubin-Total", "Bilirubin-Direct"],
            ["Cholesterol", "Triglyceride", "HDL", "LDL"], ["TSH", "Free-T4"], ["PT", "INR", "PTT"], [], []
        ];
        var testId = 1;
        for (var i = 0; i < names.Length; i++)
        {
            categories.HasData(new LabTestCategory { Id = i + 1, Name = names[i], SortOrder = i, CreatedAt = created });
            for (var j = 0; j < codes[i].Length; j++)
            {
                definitions.HasData(new LabTestDefinition
                {
                    Id = testId++, CategoryId = i + 1, Code = codes[i][j].ToUpperInvariant(),
                    Name = codes[i][j].Replace('-', ' '), EnglishName = codes[i][j].Replace('-', ' '),
                    DataType = LabDataType.Number, SortOrder = j, CreatedAt = created
                });
            }
        }
    }
}
