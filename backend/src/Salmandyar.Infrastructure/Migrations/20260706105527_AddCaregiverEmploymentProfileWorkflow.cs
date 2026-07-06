using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCaregiverEmploymentProfileWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bio",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "CaregiverProfiles");

            migrationBuilder.RenameColumn(
                name: "Specialization",
                table: "CaregiverProfiles",
                newName: "EmploymentStatus");

            migrationBuilder.RenameColumn(
                name: "IsVerified",
                table: "CaregiverProfiles",
                newName: "IsCompleted");

            migrationBuilder.AlterColumn<int>(
                name: "ExperienceYears",
                table: "CaregiverProfiles",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<bool>(
                name: "AcceptCollaborationTerms",
                table: "CaregiverProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AcceptDocumentReviewConsent",
                table: "CaregiverProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AcceptPatientConfidentiality",
                table: "CaregiverProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AcceptProfessionalEthics",
                table: "CaregiverProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AccountNumber",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthCertificateNumber",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirthPlace",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CanStayAtPatientHome",
                table: "CaregiverProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CardNumber",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CertificatesJson",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ChildrenCount",
                table: "CaregiverProfiles",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompletionPercentage",
                table: "CaregiverProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CooperationType",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "CaregiverProfiles",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CurrentEmploymentStatus",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CurrentStep",
                table: "CaregiverProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CustomSkillsJson",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "CaregiverProfiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactAddress",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactMobile",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactName",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactPhone",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContactRelationship",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FatherName",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ForceCompletedByAdmin",
                table: "CaregiverProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "FullAddress",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GPA",
                table: "CaregiverProfiles",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "GraduationYear",
                table: "CaregiverProfiles",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasDrivingLicense",
                table: "CaregiverProfiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Iban",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LandlinePhone",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedAt",
                table: "CaregiverProfiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastUpdatedByName",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastUpdatedByUserId",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastWorkplace",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LatestDegree",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "CaregiverProfiles",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "CaregiverProfiles",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Major",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaritalStatus",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MobileNumber",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NationalCode",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NursingSystemNumber",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PersonalPhotoUrl",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegisteredRole",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewNote",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReviewedAt",
                table: "CaregiverProfiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewedByName",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewedByUserId",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ServiceAreasJson",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ServiceRadiusKm",
                table: "CaregiverProfiles",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShiftPreferencesJson",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SkillsJson",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubmittedAt",
                table: "CaregiverProfiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "University",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VehicleType",
                table: "CaregiverProfiles",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CaregiverProfileDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CaregiverProfileId = table.Column<int>(type: "integer", nullable: false),
                    DocumentType = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    MimeType = table.Column<string>(type: "text", nullable: true),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ReviewNote = table.Column<string>(type: "text", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedByUserId = table.Column<string>(type: "text", nullable: true),
                    ReviewedByName = table.Column<string>(type: "text", nullable: true),
                    ExpireAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaregiverProfileDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaregiverProfileDocuments_CaregiverProfiles_CaregiverProfil~",
                        column: x => x.CaregiverProfileId,
                        principalTable: "CaregiverProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CaregiverProfiles_NationalCode",
                table: "CaregiverProfiles",
                column: "NationalCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CaregiverProfileDocuments_CaregiverProfileId_DocumentType",
                table: "CaregiverProfileDocuments",
                columns: new[] { "CaregiverProfileId", "DocumentType" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CaregiverProfileDocuments");

            migrationBuilder.DropIndex(
                name: "IX_CaregiverProfiles_NationalCode",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "AcceptCollaborationTerms",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "AcceptDocumentReviewConsent",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "AcceptPatientConfidentiality",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "AcceptProfessionalEthics",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "AccountNumber",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "BirthCertificateNumber",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "BirthPlace",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CanStayAtPatientHome",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CardNumber",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CertificatesJson",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ChildrenCount",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "City",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CompletionPercentage",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CooperationType",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CurrentEmploymentStatus",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CurrentStep",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "CustomSkillsJson",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactAddress",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactMobile",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactName",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactPhone",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "EmergencyContactRelationship",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "FatherName",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ForceCompletedByAdmin",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "FullAddress",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "GPA",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "GraduationYear",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "HasDrivingLicense",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Iban",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LandlinePhone",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LastUpdatedAt",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LastUpdatedByName",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LastUpdatedByUserId",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LastWorkplace",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "LatestDegree",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Major",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "MaritalStatus",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "MobileNumber",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "NationalCode",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "NursingSystemNumber",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "PersonalPhotoUrl",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "RegisteredRole",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ReviewNote",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ReviewedByName",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ReviewedByUserId",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ServiceAreasJson",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ServiceRadiusKm",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "ShiftPreferencesJson",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "SkillsJson",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "SubmittedAt",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "University",
                table: "CaregiverProfiles");

            migrationBuilder.DropColumn(
                name: "VehicleType",
                table: "CaregiverProfiles");

            migrationBuilder.RenameColumn(
                name: "IsCompleted",
                table: "CaregiverProfiles",
                newName: "IsVerified");

            migrationBuilder.RenameColumn(
                name: "EmploymentStatus",
                table: "CaregiverProfiles",
                newName: "Specialization");

            migrationBuilder.AlterColumn<int>(
                name: "ExperienceYears",
                table: "CaregiverProfiles",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "CaregiverProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "CaregiverProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
