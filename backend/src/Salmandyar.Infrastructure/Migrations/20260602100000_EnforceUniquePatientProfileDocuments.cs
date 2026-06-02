using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Salmandyar.Infrastructure.Persistence;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260602100000_EnforceUniquePatientProfileDocuments")]
public partial class EnforceUniquePatientProfileDocuments : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            WITH Dedup AS
            (
                SELECT
                    Id,
                    ROW_NUMBER() OVER (
                        PARTITION BY PatientProfileId, DocumentType
                        ORDER BY UploadDate DESC, Id DESC
                    ) AS rn
                FROM UploadedDocuments
                WHERE DocumentType IS NOT NULL
            )
            DELETE FROM UploadedDocuments
            WHERE Id IN (SELECT Id FROM Dedup WHERE rn > 1);
            """);

        migrationBuilder.CreateIndex(
            name: "IX_UploadedDocuments_PatientProfileId_DocumentType_Unique",
            table: "UploadedDocuments",
            columns: new[] { "PatientProfileId", "DocumentType" },
            unique: true,
            filter: "[DocumentType] IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_UploadedDocuments_PatientProfileId_DocumentType_Unique",
            table: "UploadedDocuments");
    }
}

