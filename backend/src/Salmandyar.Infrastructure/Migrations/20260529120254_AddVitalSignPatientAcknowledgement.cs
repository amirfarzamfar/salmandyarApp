using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddVitalSignPatientAcknowledgement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PatientAcknowledgedAt",
                table: "VitalSigns",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientAcknowledgedById",
                table: "VitalSigns",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientAcknowledgementNote",
                table: "VitalSigns",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_PatientAcknowledgedById",
                table: "VitalSigns",
                column: "PatientAcknowledgedById");

            migrationBuilder.AddForeignKey(
                name: "FK_VitalSigns_AspNetUsers_PatientAcknowledgedById",
                table: "VitalSigns",
                column: "PatientAcknowledgedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VitalSigns_AspNetUsers_PatientAcknowledgedById",
                table: "VitalSigns");

            migrationBuilder.DropIndex(
                name: "IX_VitalSigns_PatientAcknowledgedById",
                table: "VitalSigns");

            migrationBuilder.DropColumn(
                name: "PatientAcknowledgedAt",
                table: "VitalSigns");

            migrationBuilder.DropColumn(
                name: "PatientAcknowledgedById",
                table: "VitalSigns");

            migrationBuilder.DropColumn(
                name: "PatientAcknowledgementNote",
                table: "VitalSigns");
        }
    }
}
