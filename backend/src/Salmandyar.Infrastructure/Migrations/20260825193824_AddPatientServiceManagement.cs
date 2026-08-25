using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientServiceManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ServiceType",
                table: "CareServices",
                newName: "UpdatedById");

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualEndTime",
                table: "CareServices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ActualStartTime",
                table: "CareServices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "CareServices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AssignedById",
                table: "CareServices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignmentStatus",
                table: "CareServices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "CreatedById",
                table: "CareServices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomServiceName",
                table: "CareServices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "CareServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LocationAddress",
                table: "CareServices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LocationType",
                table: "CareServices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "NotificationSentAt",
                table: "CareServices",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NotificationStatus",
                table: "CareServices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ParentScheduleId",
                table: "CareServices",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Priority",
                table: "CareServices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "ScheduledDate",
                table: "CareServices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "ScheduledEndTime",
                table: "CareServices",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "ScheduledStartTime",
                table: "CareServices",
                type: "interval",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServiceActivityLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareServiceId = table.Column<int>(type: "integer", nullable: false),
                    ActivityType = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    OldValue = table.Column<string>(type: "text", nullable: true),
                    NewValue = table.Column<string>(type: "text", nullable: true),
                    ActorUserId = table.Column<string>(type: "text", nullable: true),
                    ActorName = table.Column<string>(type: "text", nullable: false),
                    ActorRole = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceActivityLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceActivityLogs_AspNetUsers_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceActivityLogs_CareServices_CareServiceId",
                        column: x => x.CareServiceId,
                        principalTable: "CareServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceAssignmentHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareServiceId = table.Column<int>(type: "integer", nullable: false),
                    PreviousProviderId = table.Column<string>(type: "text", nullable: true),
                    PreviousProviderName = table.Column<string>(type: "text", nullable: true),
                    NewProviderId = table.Column<string>(type: "text", nullable: true),
                    NewProviderName = table.Column<string>(type: "text", nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    ChangedById = table.Column<string>(type: "text", nullable: true),
                    ChangedByName = table.Column<string>(type: "text", nullable: false),
                    ChangedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceAssignmentHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceAssignmentHistories_AspNetUsers_ChangedById",
                        column: x => x.ChangedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceAssignmentHistories_AspNetUsers_NewProviderId",
                        column: x => x.NewProviderId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceAssignmentHistories_AspNetUsers_PreviousProviderId",
                        column: x => x.PreviousProviderId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceAssignmentHistories_CareServices_CareServiceId",
                        column: x => x.CareServiceId,
                        principalTable: "CareServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceNotificationRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareServiceId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    RecipientType = table.Column<int>(type: "integer", nullable: false),
                    RecipientUserId = table.Column<string>(type: "text", nullable: true),
                    RecipientDisplayName = table.Column<string>(type: "text", nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ScheduledSendAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FailedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    CreatedById = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceNotificationRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceNotificationRecords_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceNotificationRecords_AspNetUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceNotificationRecords_CareServices_CareServiceId",
                        column: x => x.CareServiceId,
                        principalTable: "CareServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    ServiceDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    CustomServiceName = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    DurationMinutes = table.Column<int>(type: "integer", nullable: false),
                    RecurrenceType = table.Column<int>(type: "integer", nullable: false),
                    RecurrenceInterval = table.Column<int>(type: "integer", nullable: true),
                    OccurrencesCount = table.Column<int>(type: "integer", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    WeekDays = table.Column<string>(type: "text", nullable: true),
                    DayOfMonth = table.Column<int>(type: "integer", nullable: true),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    LocationType = table.Column<int>(type: "integer", nullable: false),
                    LocationAddress = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedById = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedById = table.Column<string>(type: "text", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceSchedules_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceSchedules_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceSchedules_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceSchedules_ServiceDefinitions_ServiceDefinitionId",
                        column: x => x.ServiceDefinitionId,
                        principalTable: "ServiceDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_AssignedById",
                table: "CareServices",
                column: "AssignedById");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_CreatedById",
                table: "CareServices",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_ParentScheduleId",
                table: "CareServices",
                column: "ParentScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_ScheduledDate",
                table: "CareServices",
                column: "ScheduledDate");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_ScheduledDate_Status",
                table: "CareServices",
                columns: new[] { "ScheduledDate", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_Status",
                table: "CareServices",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_UpdatedById",
                table: "CareServices",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceActivityLogs_ActorUserId",
                table: "ServiceActivityLogs",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceActivityLogs_CareServiceId_CreatedAtUtc",
                table: "ServiceActivityLogs",
                columns: new[] { "CareServiceId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAssignmentHistories_CareServiceId_ChangedAtUtc",
                table: "ServiceAssignmentHistories",
                columns: new[] { "CareServiceId", "ChangedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAssignmentHistories_ChangedById",
                table: "ServiceAssignmentHistories",
                column: "ChangedById");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAssignmentHistories_NewProviderId",
                table: "ServiceAssignmentHistories",
                column: "NewProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAssignmentHistories_PreviousProviderId",
                table: "ServiceAssignmentHistories",
                column: "PreviousProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceNotificationRecords_CareServiceId_Status",
                table: "ServiceNotificationRecords",
                columns: new[] { "CareServiceId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceNotificationRecords_CreatedById",
                table: "ServiceNotificationRecords",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceNotificationRecords_RecipientUserId",
                table: "ServiceNotificationRecords",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_CareRecipientId",
                table: "ServiceSchedules",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_CreatedById",
                table: "ServiceSchedules",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_ServiceDefinitionId",
                table: "ServiceSchedules",
                column: "ServiceDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_StartDate_IsActive",
                table: "ServiceSchedules",
                columns: new[] { "StartDate", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_UpdatedById",
                table: "ServiceSchedules",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_CareServices_AspNetUsers_AssignedById",
                table: "CareServices",
                column: "AssignedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CareServices_AspNetUsers_CreatedById",
                table: "CareServices",
                column: "CreatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CareServices_AspNetUsers_UpdatedById",
                table: "CareServices",
                column: "UpdatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_CareServices_ServiceSchedules_ParentScheduleId",
                table: "CareServices",
                column: "ParentScheduleId",
                principalTable: "ServiceSchedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CareServices_AspNetUsers_AssignedById",
                table: "CareServices");

            migrationBuilder.DropForeignKey(
                name: "FK_CareServices_AspNetUsers_CreatedById",
                table: "CareServices");

            migrationBuilder.DropForeignKey(
                name: "FK_CareServices_AspNetUsers_UpdatedById",
                table: "CareServices");

            migrationBuilder.DropForeignKey(
                name: "FK_CareServices_ServiceSchedules_ParentScheduleId",
                table: "CareServices");

            migrationBuilder.DropTable(
                name: "ServiceActivityLogs");

            migrationBuilder.DropTable(
                name: "ServiceAssignmentHistories");

            migrationBuilder.DropTable(
                name: "ServiceNotificationRecords");

            migrationBuilder.DropTable(
                name: "ServiceSchedules");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_AssignedById",
                table: "CareServices");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_CreatedById",
                table: "CareServices");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_ParentScheduleId",
                table: "CareServices");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_ScheduledDate",
                table: "CareServices");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_ScheduledDate_Status",
                table: "CareServices");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_Status",
                table: "CareServices");

            migrationBuilder.DropIndex(
                name: "IX_CareServices_UpdatedById",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "ActualEndTime",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "ActualStartTime",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "AssignedAt",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "AssignedById",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "AssignmentStatus",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "CustomServiceName",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "LocationAddress",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "LocationType",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "NotificationSentAt",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "NotificationStatus",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "ParentScheduleId",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "ScheduledDate",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "ScheduledEndTime",
                table: "CareServices");

            migrationBuilder.DropColumn(
                name: "ScheduledStartTime",
                table: "CareServices");

            migrationBuilder.RenameColumn(
                name: "UpdatedById",
                table: "CareServices",
                newName: "ServiceType");
        }
    }
}
