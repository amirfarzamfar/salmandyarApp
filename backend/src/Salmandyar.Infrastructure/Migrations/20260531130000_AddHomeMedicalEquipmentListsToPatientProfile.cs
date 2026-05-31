using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Salmandyar.Infrastructure.Persistence;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260531130000_AddHomeMedicalEquipmentListsToPatientProfile")]
    public partial class AddHomeMedicalEquipmentListsToPatientProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AvailableHomeMedicalEquipmentJson",
                table: "PatientProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NeededHomeMedicalEquipmentJson",
                table: "PatientProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherAvailableHomeMedicalEquipment",
                table: "PatientProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OtherNeededHomeMedicalEquipment",
                table: "PatientProfiles",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvailableHomeMedicalEquipmentJson",
                table: "PatientProfiles");

            migrationBuilder.DropColumn(
                name: "NeededHomeMedicalEquipmentJson",
                table: "PatientProfiles");

            migrationBuilder.DropColumn(
                name: "OtherAvailableHomeMedicalEquipment",
                table: "PatientProfiles");

            migrationBuilder.DropColumn(
                name: "OtherNeededHomeMedicalEquipment",
                table: "PatientProfiles");
        }
    }
}
