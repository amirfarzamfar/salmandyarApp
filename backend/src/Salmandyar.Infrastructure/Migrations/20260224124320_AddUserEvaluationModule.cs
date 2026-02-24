using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEvaluationModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserEvaluationForms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluationForms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Weight = table.Column<int>(type: "int", nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluationQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEvaluationQuestions_UserEvaluationForms_FormId",
                        column: x => x.FormId,
                        principalTable: "UserEvaluationForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CareRecipientId = table.Column<int>(type: "int", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TotalScore = table.Column<double>(type: "float", nullable: false),
                    AnalysisResultJson = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluationSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEvaluationSubmissions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserEvaluationSubmissions_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserEvaluationSubmissions_UserEvaluationForms_FormId",
                        column: x => x.FormId,
                        principalTable: "UserEvaluationForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ScoreValue = table.Column<int>(type: "int", nullable: false),
                    IsCorrect = table.Column<bool>(type: "bit", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluationOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEvaluationOptions_UserEvaluationQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "UserEvaluationQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Deadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsMandatory = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmissionId = table.Column<int>(type: "int", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluationAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEvaluationAssignments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserEvaluationAssignments_UserEvaluationForms_FormId",
                        column: x => x.FormId,
                        principalTable: "UserEvaluationForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserEvaluationAssignments_UserEvaluationSubmissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "UserEvaluationSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubmissionId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    SelectedOptionId = table.Column<int>(type: "int", nullable: true),
                    TextResponse = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BooleanResponse = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluationAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserEvaluationAnswers_UserEvaluationOptions_SelectedOptionId",
                        column: x => x.SelectedOptionId,
                        principalTable: "UserEvaluationOptions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UserEvaluationAnswers_UserEvaluationQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "UserEvaluationQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserEvaluationAnswers_UserEvaluationSubmissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "UserEvaluationSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationAnswers_QuestionId",
                table: "UserEvaluationAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationAnswers_SelectedOptionId",
                table: "UserEvaluationAnswers",
                column: "SelectedOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationAnswers_SubmissionId",
                table: "UserEvaluationAnswers",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationAssignments_FormId",
                table: "UserEvaluationAssignments",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationAssignments_SubmissionId",
                table: "UserEvaluationAssignments",
                column: "SubmissionId",
                unique: true,
                filter: "[SubmissionId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationAssignments_UserId",
                table: "UserEvaluationAssignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationOptions_QuestionId",
                table: "UserEvaluationOptions",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationQuestions_FormId",
                table: "UserEvaluationQuestions",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationSubmissions_CareRecipientId",
                table: "UserEvaluationSubmissions",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationSubmissions_FormId",
                table: "UserEvaluationSubmissions",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_UserEvaluationSubmissions_UserId",
                table: "UserEvaluationSubmissions",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserEvaluationAnswers");

            migrationBuilder.DropTable(
                name: "UserEvaluationAssignments");

            migrationBuilder.DropTable(
                name: "UserEvaluationOptions");

            migrationBuilder.DropTable(
                name: "UserEvaluationSubmissions");

            migrationBuilder.DropTable(
                name: "UserEvaluationQuestions");

            migrationBuilder.DropTable(
                name: "UserEvaluationForms");
        }
    }
}
