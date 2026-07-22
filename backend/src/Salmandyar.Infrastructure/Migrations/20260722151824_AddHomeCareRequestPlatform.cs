using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHomeCareRequestPlatform : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "ServiceDefinitions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "DefaultFormId",
                table: "ServiceDefinitions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateResponse",
                table: "QuestionAnswers",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JsonResponse",
                table: "QuestionAnswers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "NumberResponse",
                table: "QuestionAnswers",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DraftKey",
                table: "AssessmentSubmissions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSavedAt",
                table: "AssessmentSubmissions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "AssessmentSubmissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SummaryJson",
                table: "AssessmentSubmissions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "AllowMultipleFiles",
                table: "AssessmentQuestions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GroupKey",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GroupTitle",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRequired",
                table: "AssessmentQuestions",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxFiles",
                table: "AssessmentQuestions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxValue",
                table: "AssessmentQuestions",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinFiles",
                table: "AssessmentQuestions",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MinValue",
                table: "AssessmentQuestions",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PageKey",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PageTitle",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Placeholder",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RequiredConditionJson",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ValidationJson",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VisibilityConditionJson",
                table: "AssessmentQuestions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "AssessmentForms",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "EstimatedDurationMinutes",
                table: "AssessmentForms",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "IntroDescription",
                table: "AssessmentForms",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IntroTitle",
                table: "AssessmentForms",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "AssessmentForms",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LayoutJson",
                table: "AssessmentForms",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ServiceDefinitionId",
                table: "AssessmentForms",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "AssessmentForms",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Version",
                table: "AssessmentForms",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Workflow",
                table: "AssessmentForms",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "HomeCareRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TrackingCode = table.Column<string>(type: "text", nullable: false),
                    ServiceDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    SubmissionId = table.Column<int>(type: "integer", nullable: false),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: true),
                    RequesterUserId = table.Column<string>(type: "text", nullable: false),
                    AssignedSupervisorId = table.Column<string>(type: "text", nullable: true),
                    AssignedCaregiverId = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    PreferredContactMethod = table.Column<string>(type: "text", nullable: false),
                    ContactTimePreference = table.Column<string>(type: "text", nullable: true),
                    PreferredStartAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EstimatedContactAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Floor = table.Column<string>(type: "text", nullable: true),
                    HasElevator = table.Column<bool>(type: "boolean", nullable: false),
                    HomeConditionNotes = table.Column<string>(type: "text", nullable: true),
                    PatientRelationship = table.Column<string>(type: "text", nullable: true),
                    ContactFirstName = table.Column<string>(type: "text", nullable: false),
                    ContactLastName = table.Column<string>(type: "text", nullable: false),
                    ContactMobile = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ClosedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeCareRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeCareRequests_AspNetUsers_AssignedCaregiverId",
                        column: x => x.AssignedCaregiverId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_HomeCareRequests_AspNetUsers_AssignedSupervisorId",
                        column: x => x.AssignedSupervisorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_HomeCareRequests_AspNetUsers_RequesterUserId",
                        column: x => x.RequesterUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HomeCareRequests_AssessmentForms_FormId",
                        column: x => x.FormId,
                        principalTable: "AssessmentForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HomeCareRequests_AssessmentSubmissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "AssessmentSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HomeCareRequests_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_HomeCareRequests_ServiceDefinitions_ServiceDefinitionId",
                        column: x => x.ServiceDefinitionId,
                        principalTable: "ServiceDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HomeCareConversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    IsClosed = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeCareConversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeCareConversations_HomeCareRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "HomeCareRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeCareRequestAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    OriginalFileName = table.Column<string>(type: "text", nullable: false),
                    StoredFileName = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    UploadedByUserId = table.Column<string>(type: "text", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeCareRequestAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeCareRequestAttachments_AspNetUsers_UploadedByUserId",
                        column: x => x.UploadedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HomeCareRequestAttachments_HomeCareRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "HomeCareRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeCareRequestTimelineEvents",
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
                    table.PrimaryKey("PK_HomeCareRequestTimelineEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeCareRequestTimelineEvents_AspNetUsers_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_HomeCareRequestTimelineEvents_HomeCareRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "HomeCareRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeCareConversationParticipants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    RoleLabel = table.Column<string>(type: "text", nullable: false),
                    JoinedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeCareConversationParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeCareConversationParticipants_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HomeCareConversationParticipants_HomeCareConversations_Conv~",
                        column: x => x.ConversationId,
                        principalTable: "HomeCareConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeCareMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderUserId = table.Column<string>(type: "text", nullable: false),
                    MessageType = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeCareMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeCareMessages_AspNetUsers_SenderUserId",
                        column: x => x.SenderUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HomeCareMessages_HomeCareConversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "HomeCareConversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HomeCareMessageAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginalFileName = table.Column<string>(type: "text", nullable: false),
                    StoredFileName = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeCareMessageAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HomeCareMessageAttachments_HomeCareMessages_MessageId",
                        column: x => x.MessageId,
                        principalTable: "HomeCareMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql("""
                UPDATE "ServiceDefinitions"
                SET "Code" = 'SERVICE-' || "Id"
                WHERE COALESCE(BTRIM("Code"), '') = '';
                """);

            migrationBuilder.Sql("""
                WITH duplicate_codes AS (
                    SELECT "Id", "Code",
                           ROW_NUMBER() OVER (PARTITION BY "Code" ORDER BY "Id") AS rn
                    FROM "ServiceDefinitions"
                    WHERE COALESCE(BTRIM("Code"), '') <> ''
                )
                UPDATE "ServiceDefinitions" AS s
                SET "Code" = duplicate_codes."Code" || '-' || duplicate_codes."Id"
                FROM duplicate_codes
                WHERE s."Id" = duplicate_codes."Id" AND duplicate_codes.rn > 1;
                """);

            migrationBuilder.Sql("""
                UPDATE "AssessmentForms"
                SET "Workflow" = 'Assessment'
                WHERE COALESCE(BTRIM("Workflow"), '') = '';
                """);

            migrationBuilder.Sql("""
                UPDATE "AssessmentForms"
                SET "Version" = 1
                WHERE "Version" <= 0;
                """);

            migrationBuilder.Sql("""
                UPDATE "AssessmentForms"
                SET "EstimatedDurationMinutes" = 10
                WHERE "EstimatedDurationMinutes" <= 0;
                """);

            migrationBuilder.Sql("""
                UPDATE "AssessmentForms"
                SET "UpdatedAt" = "CreatedAt"
                WHERE "UpdatedAt" IS NULL;
                """);

            migrationBuilder.Sql("""
                UPDATE "AssessmentForms"
                SET "Code" = 'FORM-' || "Id"
                WHERE COALESCE(BTRIM("Code"), '') = '';
                """);

            migrationBuilder.Sql("""
                WITH duplicate_codes AS (
                    SELECT "Id", "Code",
                           ROW_NUMBER() OVER (PARTITION BY "Code" ORDER BY "Id") AS rn
                    FROM "AssessmentForms"
                    WHERE COALESCE(BTRIM("Code"), '') <> ''
                )
                UPDATE "AssessmentForms" AS f
                SET "Code" = duplicate_codes."Code" || '-' || duplicate_codes."Id"
                FROM duplicate_codes
                WHERE f."Id" = duplicate_codes."Id" AND duplicate_codes.rn > 1;
                """);

            migrationBuilder.Sql("""
                UPDATE "AssessmentSubmissions"
                SET "Status" = 'Submitted'
                WHERE COALESCE(BTRIM("Status"), '') = '';
                """);

            migrationBuilder.Sql("""
                UPDATE "AssessmentSubmissions"
                SET "LastSavedAt" = "SubmittedAt"
                WHERE "LastSavedAt" IS NULL;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceDefinitions_Code",
                table: "ServiceDefinitions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceDefinitions_DefaultFormId",
                table: "ServiceDefinitions",
                column: "DefaultFormId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentForms_Code",
                table: "AssessmentForms",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentForms_ServiceDefinitionId",
                table: "AssessmentForms",
                column: "ServiceDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentForms_Workflow_Type_IsActive",
                table: "AssessmentForms",
                columns: new[] { "Workflow", "Type", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareConversationParticipants_ConversationId_UserId",
                table: "HomeCareConversationParticipants",
                columns: new[] { "ConversationId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareConversationParticipants_UserId",
                table: "HomeCareConversationParticipants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareConversations_RequestId",
                table: "HomeCareConversations",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareMessageAttachments_MessageId",
                table: "HomeCareMessageAttachments",
                column: "MessageId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareMessages_ConversationId",
                table: "HomeCareMessages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareMessages_SenderUserId",
                table: "HomeCareMessages",
                column: "SenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequestAttachments_RequestId",
                table: "HomeCareRequestAttachments",
                column: "RequestId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequestAttachments_UploadedByUserId",
                table: "HomeCareRequestAttachments",
                column: "UploadedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_AssignedCaregiverId",
                table: "HomeCareRequests",
                column: "AssignedCaregiverId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_AssignedSupervisorId",
                table: "HomeCareRequests",
                column: "AssignedSupervisorId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_CareRecipientId",
                table: "HomeCareRequests",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_FormId",
                table: "HomeCareRequests",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_RequesterUserId",
                table: "HomeCareRequests",
                column: "RequesterUserId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_ServiceDefinitionId",
                table: "HomeCareRequests",
                column: "ServiceDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_SubmissionId",
                table: "HomeCareRequests",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequests_TrackingCode",
                table: "HomeCareRequests",
                column: "TrackingCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequestTimelineEvents_ActorUserId",
                table: "HomeCareRequestTimelineEvents",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_HomeCareRequestTimelineEvents_RequestId",
                table: "HomeCareRequestTimelineEvents",
                column: "RequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_AssessmentForms_ServiceDefinitions_ServiceDefinitionId",
                table: "AssessmentForms",
                column: "ServiceDefinitionId",
                principalTable: "ServiceDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceDefinitions_AssessmentForms_DefaultFormId",
                table: "ServiceDefinitions",
                column: "DefaultFormId",
                principalTable: "AssessmentForms",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AssessmentForms_ServiceDefinitions_ServiceDefinitionId",
                table: "AssessmentForms");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceDefinitions_AssessmentForms_DefaultFormId",
                table: "ServiceDefinitions");

            migrationBuilder.DropTable(
                name: "HomeCareConversationParticipants");

            migrationBuilder.DropTable(
                name: "HomeCareMessageAttachments");

            migrationBuilder.DropTable(
                name: "HomeCareRequestAttachments");

            migrationBuilder.DropTable(
                name: "HomeCareRequestTimelineEvents");

            migrationBuilder.DropTable(
                name: "HomeCareMessages");

            migrationBuilder.DropTable(
                name: "HomeCareConversations");

            migrationBuilder.DropTable(
                name: "HomeCareRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceDefinitions_Code",
                table: "ServiceDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_ServiceDefinitions_DefaultFormId",
                table: "ServiceDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_AssessmentForms_Code",
                table: "AssessmentForms");

            migrationBuilder.DropIndex(
                name: "IX_AssessmentForms_ServiceDefinitionId",
                table: "AssessmentForms");

            migrationBuilder.DropIndex(
                name: "IX_AssessmentForms_Workflow_Type_IsActive",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "ServiceDefinitions");

            migrationBuilder.DropColumn(
                name: "DefaultFormId",
                table: "ServiceDefinitions");

            migrationBuilder.DropColumn(
                name: "DateResponse",
                table: "QuestionAnswers");

            migrationBuilder.DropColumn(
                name: "JsonResponse",
                table: "QuestionAnswers");

            migrationBuilder.DropColumn(
                name: "NumberResponse",
                table: "QuestionAnswers");

            migrationBuilder.DropColumn(
                name: "DraftKey",
                table: "AssessmentSubmissions");

            migrationBuilder.DropColumn(
                name: "LastSavedAt",
                table: "AssessmentSubmissions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "AssessmentSubmissions");

            migrationBuilder.DropColumn(
                name: "SummaryJson",
                table: "AssessmentSubmissions");

            migrationBuilder.DropColumn(
                name: "AllowMultipleFiles",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "GroupKey",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "GroupTitle",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "IsRequired",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "MaxFiles",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "MaxValue",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "MinFiles",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "MinValue",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "PageKey",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "PageTitle",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "Placeholder",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "RequiredConditionJson",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "ValidationJson",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "VisibilityConditionJson",
                table: "AssessmentQuestions");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "EstimatedDurationMinutes",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "IntroDescription",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "IntroTitle",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "LayoutJson",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "ServiceDefinitionId",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "Version",
                table: "AssessmentForms");

            migrationBuilder.DropColumn(
                name: "Workflow",
                table: "AssessmentForms");
        }
    }
}
