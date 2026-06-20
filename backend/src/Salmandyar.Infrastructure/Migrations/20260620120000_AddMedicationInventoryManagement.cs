using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    public partial class AddMedicationInventoryManagement : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AppliedInventoryQuantity",
                table: "MedicationDoses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "AlertLowStockAdmin",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "AlertLowStockCustomEmail",
                table: "PatientMedications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AlertLowStockCustomPhone",
                table: "PatientMedications",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AlertLowStockEmailEnabled",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AlertLowStockInAppEnabled",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "AlertLowStockSmsEnabled",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DoseQuantity",
                table: "PatientMedications",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<bool>(
                name: "IsLowStockAlertActive",
                table: "PatientMedications",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LowStockAlertActivatedAt",
                table: "PatientMedications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MedicationAlertSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SmsTemplate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailSubjectTemplate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailBodyTemplate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InAppTemplate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationAlertSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicationInventoryTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientMedicationId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PerformedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    TransactionType = table.Column<int>(type: "int", nullable: false),
                    QuantityChanged = table.Column<int>(type: "int", nullable: false),
                    QuantityBefore = table.Column<int>(type: "int", nullable: false),
                    QuantityAfter = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationInventoryTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicationInventoryTransactions_AspNetUsers_PerformedByUserId",
                        column: x => x.PerformedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MedicationInventoryTransactions_PatientMedications_PatientMedicationId",
                        column: x => x.PatientMedicationId,
                        principalTable: "PatientMedications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicationAlertHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PatientMedicationId = table.Column<int>(type: "int", nullable: false),
                    CareRecipientId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AlertType = table.Column<int>(type: "int", nullable: false),
                    RecipientType = table.Column<int>(type: "int", nullable: false),
                    RecipientDisplay = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RecipientUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeliveryStatus = table.Column<int>(type: "int", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationAlertHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicationAlertHistories_AspNetUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MedicationAlertHistories_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicationAlertHistories_PatientMedications_PatientMedicationId",
                        column: x => x.PatientMedicationId,
                        principalTable: "PatientMedications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicationAlertHistories_CareRecipientId",
                table: "MedicationAlertHistories",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationAlertHistories_PatientMedicationId",
                table: "MedicationAlertHistories",
                column: "PatientMedicationId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationAlertHistories_RecipientUserId",
                table: "MedicationAlertHistories",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationInventoryTransactions_PatientMedicationId",
                table: "MedicationInventoryTransactions",
                column: "PatientMedicationId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationInventoryTransactions_PerformedByUserId",
                table: "MedicationInventoryTransactions",
                column: "PerformedByUserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicationAlertHistories");

            migrationBuilder.DropTable(
                name: "MedicationAlertSettings");

            migrationBuilder.DropTable(
                name: "MedicationInventoryTransactions");

            migrationBuilder.DropColumn(
                name: "AppliedInventoryQuantity",
                table: "MedicationDoses");

            migrationBuilder.DropColumn(
                name: "AlertLowStockAdmin",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockCustomEmail",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockCustomPhone",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockEmailEnabled",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockInAppEnabled",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "AlertLowStockSmsEnabled",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "DoseQuantity",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "IsLowStockAlertActive",
                table: "PatientMedications");

            migrationBuilder.DropColumn(
                name: "LowStockAlertActivatedAt",
                table: "PatientMedications");
        }
    }
}
