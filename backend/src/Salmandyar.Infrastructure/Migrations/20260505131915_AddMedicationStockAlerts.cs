using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicationStockAlerts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AlertLimit",
                table: "PatientMedications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "AlertLowStockFamily",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AlertLowStockNurse",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AlertLowStockPatient",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TotalQuantity",
                table: "PatientMedications",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AlertLimit",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockFamily",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockNurse",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockPatient",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "TotalQuantity",
                table: "PatientMedications");
        }
    }
}
