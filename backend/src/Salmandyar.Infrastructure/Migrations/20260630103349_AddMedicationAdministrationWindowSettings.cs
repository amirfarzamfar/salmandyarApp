using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicationAdministrationWindowSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AllowEarlyConfirmationMinutes",
                table: "MedicationAlertSettings",
                type: "integer",
                nullable: false,
                defaultValue: 30);

            migrationBuilder.AddColumn<int>(
                name: "AllowLateConfirmationMinutes",
                table: "MedicationAlertSettings",
                type: "integer",
                nullable: false,
                defaultValue: 120);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowEarlyConfirmationMinutes",
                table: "MedicationAlertSettings");

            migrationBuilder.DropColumn(
                name: "AllowLateConfirmationMinutes",
                table: "MedicationAlertSettings");
        }
    }
}
