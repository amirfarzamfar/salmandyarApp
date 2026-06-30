using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicationAdministrationTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_MedicationDoses_PatientMedicationId",
                table: "MedicationDoses");

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualAdministrationAt",
                table: "MedicationDoses",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AdministrationOutcome",
                table: "MedicationDoses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AdministrationWindowMinutesSnapshot",
                table: "MedicationDoses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "AllowedConfirmationUntil",
                table: "MedicationDoses",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ClinicalNotes",
                table: "MedicationDoses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CorrectedByUserId",
                table: "MedicationDoses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CorrectionReason",
                table: "MedicationDoses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DelayMinutes",
                table: "MedicationDoses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientComment",
                table: "MedicationDoses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RecordedByUserId",
                table: "MedicationDoses",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecordedShiftSlot",
                table: "MedicationDoses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ScheduledShiftSlot",
                table: "MedicationDoses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SourceType",
                table: "MedicationDoses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TimingStatus",
                table: "MedicationDoses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "VerificationStatus",
                table: "MedicationDoses",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "VerifiedByUserId",
                table: "MedicationDoses",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MedicationDoseStatusHistories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MedicationDoseId = table.Column<int>(type: "integer", nullable: false),
                    FromStatus = table.Column<int>(type: "integer", nullable: false),
                    ToStatus = table.Column<int>(type: "integer", nullable: false),
                    FromAdministrationOutcome = table.Column<int>(type: "integer", nullable: false),
                    ToAdministrationOutcome = table.Column<int>(type: "integer", nullable: false),
                    FromTimingStatus = table.Column<int>(type: "integer", nullable: false),
                    ToTimingStatus = table.Column<int>(type: "integer", nullable: false),
                    FromVerificationStatus = table.Column<int>(type: "integer", nullable: false),
                    ToVerificationStatus = table.Column<int>(type: "integer", nullable: false),
                    SourceType = table.Column<int>(type: "integer", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    MetadataJson = table.Column<string>(type: "text", nullable: true),
                    ChangedByUserId = table.Column<string>(type: "text", nullable: true),
                    ChangedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationDoseStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicationDoseStatusHistories_AspNetUsers_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MedicationDoseStatusHistories_MedicationDoses_MedicationDos~",
                        column: x => x.MedicationDoseId,
                        principalTable: "MedicationDoses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoses_CorrectedByUserId",
                table: "MedicationDoses",
                column: "CorrectedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoses_PatientMedicationId_ScheduledTime",
                table: "MedicationDoses",
                columns: new[] { "PatientMedicationId", "ScheduledTime" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoses_RecordedByUserId",
                table: "MedicationDoses",
                column: "RecordedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoses_VerifiedByUserId",
                table: "MedicationDoses",
                column: "VerifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoseStatusHistories_ChangedByUserId",
                table: "MedicationDoseStatusHistories",
                column: "ChangedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoseStatusHistories_MedicationDoseId_ChangedAtUtc",
                table: "MedicationDoseStatusHistories",
                columns: new[] { "MedicationDoseId", "ChangedAtUtc" });

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationDoses_AspNetUsers_CorrectedByUserId",
                table: "MedicationDoses",
                column: "CorrectedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationDoses_AspNetUsers_RecordedByUserId",
                table: "MedicationDoses",
                column: "RecordedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MedicationDoses_AspNetUsers_VerifiedByUserId",
                table: "MedicationDoses",
                column: "VerifiedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MedicationDoses_AspNetUsers_CorrectedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicationDoses_AspNetUsers_RecordedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropForeignKey(
                name: "FK_MedicationDoses_AspNetUsers_VerifiedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropTable(
                name: "MedicationDoseStatusHistories");

            migrationBuilder.DropIndex(
                name: "IX_MedicationDoses_CorrectedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropIndex(
                name: "IX_MedicationDoses_PatientMedicationId_ScheduledTime",
                table: "MedicationDoses");

            migrationBuilder.DropIndex(
                name: "IX_MedicationDoses_RecordedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropIndex(
                name: "IX_MedicationDoses_VerifiedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "ActualAdministrationAt",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "AdministrationOutcome",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "AdministrationWindowMinutesSnapshot",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "AllowedConfirmationUntil",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "ClinicalNotes",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "CorrectedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "CorrectionReason",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "DelayMinutes",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "PatientComment",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "RecordedByUserId",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "RecordedShiftSlot",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "ScheduledShiftSlot",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "SourceType",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "TimingStatus",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "VerificationStatus",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "VerifiedByUserId",
                table: "MedicationDoses");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoses_PatientMedicationId",
                table: "MedicationDoses",
                column: "PatientMedicationId");
        }
    }
}
