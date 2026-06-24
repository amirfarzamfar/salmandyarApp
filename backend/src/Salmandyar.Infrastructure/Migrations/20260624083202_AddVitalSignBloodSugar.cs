using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Salmandyar.Infrastructure.Persistence;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260624083202_AddVitalSignBloodSugar")]
    public partial class AddVitalSignBloodSugar : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BloodSugar",
                table: "VitalSigns",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BloodSugar",
                table: "VitalSigns");
        }
    }
}
