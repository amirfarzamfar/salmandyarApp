using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestServiceRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GuestServiceRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrackingCode = table.Column<string>(type: "text", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    SubmissionId = table.Column<int>(type: "integer", nullable: false),
                    ServiceDefinitionId = table.Column<int>(type: "integer", nullable: true),
                    AssignedSupervisorId = table.Column<string>(type: "text", nullable: true),
                    AssignedCaregiverId = table.Column<string>(type: "text", nullable: true),
                    ConvertedCareRecipientId = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    ServiceType = table.Column<string>(type: "text", nullable: true),
                    Urgency = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    ContactName = table.Column<string>(type: "text", nullable: false),
                    ContactMobile = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuestServiceRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequests_AspNetUsers_AssignedCaregiverId",
                        column: x => x.AssignedCaregiverId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequests_AspNetUsers_AssignedSupervisorId",
                        column: x => x.AssignedSupervisorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequests_AssessmentForms_FormId",
                        column: x => x.FormId,
                        principalTable: "AssessmentForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequests_AssessmentSubmissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "AssessmentSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequests_CareRecipients_ConvertedCareRecipientId",
                        column: x => x.ConvertedCareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequests_ServiceDefinitions_ServiceDefinitionId",
                        column: x => x.ServiceDefinitionId,
                        principalTable: "ServiceDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "GuestServiceRequestTimelineEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    EventType = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ActorUserId = table.Column<string>(type: "text", nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MetadataJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuestServiceRequestTimelineEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequestTimelineEvents_AspNetUsers_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_GuestServiceRequestTimelineEvents_GuestServiceRequests_Requ~",
                        column: x => x.RequestId,
                        principalTable: "GuestServiceRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_AssignedCaregiverId",
                table: "GuestServiceRequests",
                column: "AssignedCaregiverId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_AssignedSupervisorId",
                table: "GuestServiceRequests",
                column: "AssignedSupervisorId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_ConvertedCareRecipientId",
                table: "GuestServiceRequests",
                column: "ConvertedCareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_FormId",
                table: "GuestServiceRequests",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_ServiceDefinitionId",
                table: "GuestServiceRequests",
                column: "ServiceDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_SubmissionId",
                table: "GuestServiceRequests",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequests_TrackingCode",
                table: "GuestServiceRequests",
                column: "TrackingCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequestTimelineEvents_ActorUserId",
                table: "GuestServiceRequestTimelineEvents",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_GuestServiceRequestTimelineEvents_RequestId",
                table: "GuestServiceRequestTimelineEvents",
                column: "RequestId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GuestServiceRequestTimelineEvents");

            migrationBuilder.DropTable(
                name: "GuestServiceRequests");
        }
    }
}
