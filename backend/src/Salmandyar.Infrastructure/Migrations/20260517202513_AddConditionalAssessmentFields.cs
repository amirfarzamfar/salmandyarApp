using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddConditionalAssessmentFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceReminders_CareServices_CareServiceId",
                table: "ServiceReminders");

            migrationBuilder.AddColumn<string>(
                name: "NextQuestionKey",
                table: "AssessmentQuestions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "QuestionKey",
                table: "AssessmentQuestions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NextQuestionKey",
                table: "AssessmentOptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceReminders_CareServices_CareServiceId",
                table: "ServiceReminders",
                column: "CareServiceId",
                principalTable: "CareServices",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceReminders_CareServices_CareServiceId",
                table: "ServiceReminders");

            migrationBuilder.DropColumn(
                name: "NextQuestionKey",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "QuestionKey",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "NextQuestionKey",
                table: "AssessmentOptions");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceReminders_CareServices_CareServiceId",
                table: "ServiceReminders",
                column: "CareServiceId",
                principalTable: "CareServices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
