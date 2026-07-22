using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Salmandyar.Infrastructure.Persistence;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260718143000_AddBloodSugarMeasurementType")]
    public partial class AddBloodSugarMeasurementType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BloodSugarMeasurementType",
                table: "VitalSigns",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BloodSugarMeasurementType",
                table: "VitalSigns");
        }
    }
}
