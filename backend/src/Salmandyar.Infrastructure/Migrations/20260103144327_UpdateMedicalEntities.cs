using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMedicalEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "NationalId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<int>(
                name: "CareLevel",
                table: "CareRecipients",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CurrentStatus",
                table: "CareRecipients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PrimaryDiagnosis",
                table: "CareRecipients",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ResponsibleNurseId",
                table: "CareRecipients",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CareServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CareRecipientId = table.Column<int>(type: "int", nullable: false),
                    PerformerId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    PerformedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareServices_AspNetUsers_PerformerId",
                        column: x => x.PerformerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CareServices_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NursingReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CareRecipientId = table.Column<int>(type: "int", nullable: false),
                    AuthorId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Shift = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NursingReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NursingReports_AspNetUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NursingReports_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VitalSigns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CareRecipientId = table.Column<int>(type: "int", nullable: false),
                    RecorderId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MeasuredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsLateEntry = table.Column<bool>(type: "bit", nullable: false),
                    DelayReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SystolicBloodPressure = table.Column<int>(type: "int", nullable: false),
                    DiastolicBloodPressure = table.Column<int>(type: "int", nullable: false),
                    MeanArterialPressure = table.Column<double>(type: "float", nullable: false),
                    PulseRate = table.Column<int>(type: "int", nullable: false),
                    RespiratoryRate = table.Column<int>(type: "int", nullable: false),
                    BodyTemperature = table.Column<double>(type: "float", nullable: false),
                    OxygenSaturation = table.Column<int>(type: "int", nullable: false),
                    GlasgowComaScale = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VitalSigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VitalSigns_AspNetUsers_RecorderId",
                        column: x => x.RecorderId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VitalSigns_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CareRecipients_ResponsibleNurseId",
                table: "CareRecipients",
                column: "ResponsibleNurseId");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_CareRecipientId",
                table: "CareServices",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_PerformerId",
                table: "CareServices",
                column: "PerformerId");

            migrationBuilder.CreateIndex(
                name: "IX_NursingReports_AuthorId",
                table: "NursingReports",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_NursingReports_CareRecipientId",
                table: "NursingReports",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_CareRecipientId",
                table: "VitalSigns",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_RecorderId",
                table: "VitalSigns",
                column: "RecorderId");

            migrationBuilder.AddForeignKey(
                name: "FK_CareRecipients_AspNetUsers_ResponsibleNurseId",
                table: "CareRecipients",
                column: "ResponsibleNurseId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CareRecipients_AspNetUsers_ResponsibleNurseId",
                table: "CareRecipients");

            migrationBuilder.DropTable(
                name: "CareServices");

            migrationBuilder.DropTable(
                name: "NursingReports");

            migrationBuilder.DropTable(
                name: "VitalSigns");

            migrationBuilder.DropIndex(
                name: "IX_CareRecipients_ResponsibleNurseId",
                table: "CareRecipients");

            migrationBuilder.DropColumn(
                name: "CareLevel",
                table: "CareRecipients");

            migrationBuilder.DropColumn(
                name: "CurrentStatus",
                table: "CareRecipients");

            migrationBuilder.DropColumn(
                name: "PrimaryDiagnosis",
                table: "CareRecipients");

            migrationBuilder.DropColumn(
                name: "ResponsibleNurseId",
                table: "CareRecipients");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "NationalId",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
