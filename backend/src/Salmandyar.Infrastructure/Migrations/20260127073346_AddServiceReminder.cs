using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceReminder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ServiceReminders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CareRecipientId = table.Column<int>(type: "int", nullable: false),
                    ServiceDefinitionId = table.Column<int>(type: "int", nullable: false),
                    ScheduledTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NotifyPatient = table.Column<bool>(type: "bit", nullable: false),
                    NotifyAdmin = table.Column<bool>(type: "bit", nullable: false),
                    NotifySupervisor = table.Column<bool>(type: "bit", nullable: false),
                    IsSent = table.Column<bool>(type: "bit", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FailureReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceReminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceReminders_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceReminders_ServiceDefinitions_ServiceDefinitionId",
                        column: x => x.ServiceDefinitionId,
                        principalTable: "ServiceDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_CareRecipientId",
                table: "ServiceReminders",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_ServiceDefinitionId",
                table: "ServiceReminders",
                column: "ServiceDefinitionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceReminders");
        }
    }
}
