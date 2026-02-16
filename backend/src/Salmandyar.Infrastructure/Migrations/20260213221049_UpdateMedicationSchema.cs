using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMedicationSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Frequency",
                table: "PatientMedications",
                newName: "FrequencyType");

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "PatientMedications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Criticality",
                table: "PatientMedications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Form",
                table: "PatientMedications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "HighAlert",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "MissedReason",
                table: "MedicationDoses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SideEffectDescription",
                table: "MedicationDoses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SideEffectSeverity",
                table: "MedicationDoses",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "Criticality",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "Form",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "HighAlert",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "MissedReason",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "SideEffectDescription",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "SideEffectSeverity",
                table: "MedicationDoses");

            migrationBuilder.RenameColumn(
                name: "FrequencyType",
                table: "PatientMedications",
                newName: "Frequency");
        }
    }
}
