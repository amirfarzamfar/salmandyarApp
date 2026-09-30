using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientLaboratoryModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LabTestCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabTestCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LabTestDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    EnglishName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    DataType = table.Column<int>(type: "integer", nullable: false),
                    ReferenceMin = table.Column<decimal>(type: "numeric", nullable: true),
                    ReferenceMax = table.Column<decimal>(type: "numeric", nullable: true),
                    CriticalMin = table.Column<decimal>(type: "numeric", nullable: true),
                    CriticalMax = table.Column<decimal>(type: "numeric", nullable: true),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabTestDefinitions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LabTestDefinitions_LabTestCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "LabTestCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PatientLabReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LaboratoryName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ReportTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Notes = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    FileUrl = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FileType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CreatedByUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Version = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientLabReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientLabReports_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientLabReports_CareRecipients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientLabReports_LabTestCategories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "LabTestCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PatientLabResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientLabReportId = table.Column<Guid>(type: "uuid", nullable: false),
                    LabTestDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    DataType = table.Column<int>(type: "integer", nullable: false),
                    NumericValue = table.Column<decimal>(type: "numeric", nullable: true),
                    TextValue = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    BooleanValue = table.Column<bool>(type: "boolean", nullable: true),
                    Unit = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ReferenceMin = table.Column<decimal>(type: "numeric", nullable: true),
                    ReferenceMax = table.Column<decimal>(type: "numeric", nullable: true),
                    CriticalMin = table.Column<decimal>(type: "numeric", nullable: true),
                    CriticalMax = table.Column<decimal>(type: "numeric", nullable: true),
                    IsAbnormal = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientLabResults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientLabResults_LabTestDefinitions_LabTestDefinitionId",
                        column: x => x.LabTestDefinitionId,
                        principalTable: "LabTestDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientLabResults_PatientLabReports_PatientLabReportId",
                        column: x => x.PatientLabReportId,
                        principalTable: "PatientLabReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "LabTestCategories",
                columns: new[] { "Id", "CreatedAt", "Description", "IsActive", "IsDeleted", "Name", "SortOrder", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "CBC و هماتولوژی", 0, null },
                    { 2, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "قند خون", 1, null },
                    { 3, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "عملکرد کلیه", 2, null },
                    { 4, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "عملکرد کبد", 3, null },
                    { 5, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "چربی خون", 4, null },
                    { 6, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "تیروئید و هورمون‌ها", 5, null },
                    { 7, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "انعقادی", 6, null },
                    { 8, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "ادرار", 7, null },
                    { 9, new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, true, false, "کشت‌ها", 8, null }
                });

            migrationBuilder.InsertData(
                table: "LabTestDefinitions",
                columns: new[] { "Id", "CategoryId", "Code", "CreatedAt", "CriticalMax", "CriticalMin", "DataType", "Description", "EnglishName", "IsActive", "IsDeleted", "Name", "ReferenceMax", "ReferenceMin", "SortOrder", "Unit", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, 1, "WBC", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "WBC", true, false, "WBC", null, null, 0, null, null },
                    { 2, 1, "RBC", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "RBC", true, false, "RBC", null, null, 1, null, null },
                    { 3, 1, "HB", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Hb", true, false, "Hb", null, null, 2, null, null },
                    { 4, 1, "HCT", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Hct", true, false, "Hct", null, null, 3, null, null },
                    { 5, 1, "MCV", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "MCV", true, false, "MCV", null, null, 4, null, null },
                    { 6, 1, "MCH", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "MCH", true, false, "MCH", null, null, 5, null, null },
                    { 7, 1, "MCHC", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "MCHC", true, false, "MCHC", null, null, 6, null, null },
                    { 8, 1, "PLT", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "PLT", true, false, "PLT", null, null, 7, null, null },
                    { 9, 1, "NEUTROPHIL", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Neutrophil", true, false, "Neutrophil", null, null, 8, null, null },
                    { 10, 1, "LYMPHOCYTE", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Lymphocyte", true, false, "Lymphocyte", null, null, 9, null, null },
                    { 11, 2, "FBS", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "FBS", true, false, "FBS", null, null, 0, null, null },
                    { 12, 2, "BS", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "BS", true, false, "BS", null, null, 1, null, null },
                    { 13, 2, "HBA1C", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "HbA1c", true, false, "HbA1c", null, null, 2, null, null },
                    { 14, 3, "BUN", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "BUN", true, false, "BUN", null, null, 0, null, null },
                    { 15, 3, "CREATININE", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Creatinine", true, false, "Creatinine", null, null, 1, null, null },
                    { 16, 3, "URIC-ACID", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Uric Acid", true, false, "Uric Acid", null, null, 2, null, null },
                    { 17, 4, "AST", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "AST", true, false, "AST", null, null, 0, null, null },
                    { 18, 4, "ALT", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "ALT", true, false, "ALT", null, null, 1, null, null },
                    { 19, 4, "ALP", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "ALP", true, false, "ALP", null, null, 2, null, null },
                    { 20, 4, "BILIRUBIN-TOTAL", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Bilirubin Total", true, false, "Bilirubin Total", null, null, 3, null, null },
                    { 21, 4, "BILIRUBIN-DIRECT", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Bilirubin Direct", true, false, "Bilirubin Direct", null, null, 4, null, null },
                    { 22, 5, "CHOLESTEROL", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Cholesterol", true, false, "Cholesterol", null, null, 0, null, null },
                    { 23, 5, "TRIGLYCERIDE", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Triglyceride", true, false, "Triglyceride", null, null, 1, null, null },
                    { 24, 5, "HDL", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "HDL", true, false, "HDL", null, null, 2, null, null },
                    { 25, 5, "LDL", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "LDL", true, false, "LDL", null, null, 3, null, null },
                    { 26, 6, "TSH", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "TSH", true, false, "TSH", null, null, 0, null, null },
                    { 27, 6, "FREE-T4", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "Free T4", true, false, "Free T4", null, null, 1, null, null },
                    { 28, 7, "PT", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "PT", true, false, "PT", null, null, 0, null, null },
                    { 29, 7, "INR", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "INR", true, false, "INR", null, null, 1, null, null },
                    { 30, 7, "PTT", new DateTime(2026, 9, 26, 0, 0, 0, 0, DateTimeKind.Utc), null, null, 0, null, "PTT", true, false, "PTT", null, null, 2, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_LabTestCategories_Name",
                table: "LabTestCategories",
                column: "Name",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_LabTestDefinitions_CategoryId_IsActive_SortOrder",
                table: "LabTestDefinitions",
                columns: new[] { "CategoryId", "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_LabTestDefinitions_Code",
                table: "LabTestDefinitions",
                column: "Code",
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_PatientLabReports_CategoryId",
                table: "PatientLabReports",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientLabReports_CreatedByUserId",
                table: "PatientLabReports",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientLabReports_PatientId_IsDeleted_PerformedAt",
                table: "PatientLabReports",
                columns: new[] { "PatientId", "IsDeleted", "PerformedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PatientLabResults_LabTestDefinitionId",
                table: "PatientLabResults",
                column: "LabTestDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientLabResults_PatientLabReportId_LabTestDefinitionId",
                table: "PatientLabResults",
                columns: new[] { "PatientLabReportId", "LabTestDefinitionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientLabResults");

            migrationBuilder.DropTable(
                name: "LabTestDefinitions");

            migrationBuilder.DropTable(
                name: "PatientLabReports");

            migrationBuilder.DropTable(
                name: "LabTestCategories");
        }
    }
}
