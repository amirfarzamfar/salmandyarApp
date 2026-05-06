using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CareServiceLinkedReminders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CareServiceId",
                table: "ServiceReminders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SendEmail",
                table: "ServiceReminders",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "SendInApp",
                table: "ServiceReminders",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "SendSms",
                table: "ServiceReminders",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "TargetUserId",
                table: "ServiceReminders",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_CareServiceId",
                table: "ServiceReminders",
                column: "CareServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_TargetUserId",
                table: "ServiceReminders",
                column: "TargetUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceReminders_AspNetUsers_TargetUserId",
                table: "ServiceReminders",
                column: "TargetUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceReminders_CareServices_CareServiceId",
                table: "ServiceReminders",
                column: "CareServiceId",
                principalTable: "CareServices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceReminders_AspNetUsers_TargetUserId",
                table: "ServiceReminders");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceReminders_CareServices_CareServiceId",
                table: "ServiceReminders");

            migrationBuilder.DropIndex(
                name: "IX_ServiceReminders_CareServiceId",
                table: "ServiceReminders");

            migrationBuilder.DropIndex(
                name: "IX_ServiceReminders_TargetUserId",
                table: "ServiceReminders");

            migrationBuilder.DropColumn(
                name: "CareServiceId",
                table: "ServiceReminders");

            migrationBuilder.DropColumn(
                name: "SendEmail",
                table: "ServiceReminders");

            migrationBuilder.DropColumn(
                name: "SendInApp",
                table: "ServiceReminders");

            migrationBuilder.DropColumn(
                name: "SendSms",
                table: "ServiceReminders");

            migrationBuilder.DropColumn(
                name: "TargetUserId",
                table: "ServiceReminders");
        }
    }
}
