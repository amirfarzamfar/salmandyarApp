using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ServiceModuleSchemaUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ServiceType",
                table: "CareServices",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "CareServices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "CareServices",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "CareServices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ServiceDefinitionId",
                table: "CareServices",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "CareServices",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "CareServices",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "CareServices",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServiceDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceDefinitions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_ServiceDefinitionId",
                table: "CareServices",
                column: "ServiceDefinitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_CareServices_ServiceDefinitions_ServiceDefinitionId",
                table: "CareServices",
                column: "ServiceDefinitionId",
                principalTable: "ServiceDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CareServices_ServiceDefinitions_ServiceDefinitionId",
                table: "CareServices");

            migrationBuilder.DropTable(
                name: "ServiceDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_ServiceDefinitionId",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "ServiceDefinitionId",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "CareServices");

            migrationBuilder.AlterColumn<string>(
                name: "ServiceType",
                table: "CareServices",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }
    }
}
