using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMedicationEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EscalationEnabled",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "GracePeriodMinutes",
                table: "PatientMedications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyFamily",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyNurse",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NotifyPatient",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "NotifySupervisor",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AttachmentPath",
                table: "MedicationDoses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EscalationLevel",
                table: "MedicationDoses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsReminderSent",
                table: "MedicationDoses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastEscalationTime",
                table: "MedicationDoses",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EscalationEnabled",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "GracePeriodMinutes",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "NotifyFamily",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "NotifyNurse",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "NotifyPatient",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "NotifySupervisor",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AttachmentPath",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "EscalationLevel",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "IsReminderSent",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "LastEscalationTime",
                table: "MedicationDoses");
        }
    }
}
