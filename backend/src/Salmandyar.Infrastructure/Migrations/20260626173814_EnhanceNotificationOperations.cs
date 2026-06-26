using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnhanceNotificationOperations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EmailFromAddress",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EmailFromName",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EmailReplyTo",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "EmailTimeoutSeconds",
                table: "NotificationSettings",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EventConfigurationsJson",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SmsApiSecret",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SmsBaseUrl",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SmsPassword",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "SmsSandboxMode",
                table: "NotificationSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SmsUsername",
                table: "NotificationSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "NotificationSettings",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "UpdatedByUserId",
                table: "NotificationSettings",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "NotificationDeliveryLogs",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EventKey = table.Column<string>(type: "text", nullable: false),
                    EventDisplayName = table.Column<string>(type: "text", nullable: false),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Provider = table.Column<string>(type: "text", nullable: false),
                    Recipient = table.Column<string>(type: "text", nullable: false),
                    RecipientUserId = table.Column<string>(type: "text", nullable: true),
                    Subject = table.Column<string>(type: "text", nullable: true),
                    Message = table.Column<string>(type: "text", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true),
                    PatientId = table.Column<int>(type: "integer", nullable: true),
                    ReferenceId = table.Column<string>(type: "text", nullable: true),
                    Severity = table.Column<string>(type: "text", nullable: true),
                    Link = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationDeliveryLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationDeliveryLogs_Channel_Status_CreatedAtUtc",
                table: "NotificationDeliveryLogs",
                columns: new[] { "Channel", "Status", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_NotificationDeliveryLogs_EventKey_CreatedAtUtc",
                table: "NotificationDeliveryLogs",
                columns: new[] { "EventKey", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationDeliveryLogs");

            migrationBuilder.DropColumn(
                name: "EmailFromAddress",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "EmailFromName",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "EmailReplyTo",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "EmailTimeoutSeconds",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "EventConfigurationsJson",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "SmsApiSecret",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "SmsBaseUrl",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "SmsPassword",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "SmsSandboxMode",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "SmsUsername",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "NotificationSettings");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                table: "NotificationSettings");
        }
    }
}
