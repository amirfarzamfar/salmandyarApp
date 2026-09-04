using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceGuestRequestModule_v2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequestTimelineEvents_RequestId",
                table: "GuestServiceRequestTimelineEvents");

            migrationBuilder.AddColumn<DateTime>(
                name: "ConvertedAt",
                table: "GuestServiceRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FormVersion",
                table: "GuestServiceRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastContactAt",
                table: "GuestServiceRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextFollowUpAt",
                table: "GuestServiceRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "GuestServiceRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "GuestServiceRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Source",
                table: "GuestServiceRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "GuestContactLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    Result = table.Column<int>(type: "integer", nullable: false),
                    DurationSeconds = table.Column<int>(type: "integer", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    NextAction = table.Column<string>(type: "text", nullable: true),
                    NextFollowUpSuggestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActorUserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuestContactLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuestContactLogs_AspNetUsers_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuestContactLogs_GuestServiceRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "GuestServiceRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GuestFollowUps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    FollowUpType = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    AssignedToUserId = table.Column<string>(type: "text", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolutionNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuestFollowUps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuestFollowUps_AspNetUsers_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuestFollowUps_AspNetUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GuestFollowUps_GuestServiceRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "GuestServiceRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequestTimelineEvents_RequestId_OccurredAt",
                table: "GuestServiceRequestTimelineEvents",
                columns: new[] { "RequestId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_ContactMobile",
                table: "GuestServiceRequests",
                column: "ContactMobile");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_CreatedAt",
                table: "GuestServiceRequests",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_NextFollowUpAt",
                table: "GuestServiceRequests",
                column: "NextFollowUpAt");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_Priority",
                table: "GuestServiceRequests",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_Status",
                table: "GuestServiceRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_Status_Priority_CreatedAt",
                table: "GuestServiceRequests",
                columns: new[] { "Status", "Priority", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GuestContactLogs_ActorUserId",
                table: "GuestContactLogs",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestContactLogs_RequestId_ContactedAt",
                table: "GuestContactLogs",
                columns: new[] { "RequestId", "ContactedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GuestFollowUps_AssignedToUserId",
                table: "GuestFollowUps",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestFollowUps_CreatedByUserId",
                table: "GuestFollowUps",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestFollowUps_RequestId_ScheduledAt",
                table: "GuestFollowUps",
                columns: new[] { "RequestId", "ScheduledAt" });

            migrationBuilder.CreateIndex(
                name: "IX_GuestFollowUps_Status_ScheduledAt",
                table: "GuestFollowUps",
                columns: new[] { "Status", "ScheduledAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GuestContactLogs");

            migrationBuilder.DropTable(
                name: "GuestFollowUps");

            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequestTimelineEvents_RequestId_OccurredAt",
                table: "GuestServiceRequestTimelineEvents");

            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequests_ContactMobile",
                table: "GuestServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequests_CreatedAt",
                table: "GuestServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequests_NextFollowUpAt",
                table: "GuestServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequests_Priority",
                table: "GuestServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequests_Status",
                table: "GuestServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_GuestServiceRequests_Status_Priority_CreatedAt",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "ConvertedAt",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "FormVersion",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "LastContactAt",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "NextFollowUpAt",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "GuestServiceRequests");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequestTimelineEvents_RequestId",
                table: "GuestServiceRequestTimelineEvents",
                column: "RequestId");
        }
    }
}
