using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgreSql : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    NationalCode = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    BanReason = table.Column<string>(type: "text", nullable: true),
                    AdminNotes = table.Column<string>(type: "text", nullable: true),
                    LastLoginDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastLoginIp = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AssessmentForms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentForms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    Action = table.Column<string>(type: "text", nullable: false),
                    EntityName = table.Column<string>(type: "text", nullable: false),
                    EntityId = table.Column<string>(type: "text", nullable: true),
                    Details = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MedicationAlertSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SmsTemplate = table.Column<string>(type: "text", nullable: false),
                    EmailSubjectTemplate = table.Column<string>(type: "text", nullable: false),
                    EmailBodyTemplate = table.Column<string>(type: "text", nullable: false),
                    InAppTemplate = table.Column<string>(type: "text", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationAlertSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NotificationSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    EmailEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SmtpHost = table.Column<string>(type: "text", nullable: false),
                    SmtpPort = table.Column<int>(type: "integer", nullable: false),
                    SmtpUser = table.Column<string>(type: "text", nullable: false),
                    SmtpPassword = table.Column<string>(type: "text", nullable: false),
                    SmtpUseSsl = table.Column<bool>(type: "boolean", nullable: false),
                    SmsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SmsProvider = table.Column<string>(type: "text", nullable: false),
                    SmsApiKey = table.Column<string>(type: "text", nullable: false),
                    SmsSenderNumber = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReportCategory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceDefinitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceDefinitions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationForms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEvaluationForms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CaregiverProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Specialization = table.Column<string>(type: "text", nullable: false),
                    LicenseNumber = table.Column<string>(type: "text", nullable: false),
                    ExperienceYears = table.Column<int>(type: "integer", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaregiverProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CaregiverProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CareRecipients",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    FamilyMemberId = table.Column<string>(type: "text", nullable: true),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MedicalHistory = table.Column<string>(type: "text", nullable: false),
                    Needs = table.Column<string>(type: "text", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    PrimaryDiagnosis = table.Column<string>(type: "text", nullable: false),
                    CurrentStatus = table.Column<string>(type: "text", nullable: false),
                    CareLevel = table.Column<int>(type: "integer", nullable: false),
                    ResponsibleNurseId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareRecipients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareRecipients_AspNetUsers_FamilyMemberId",
                        column: x => x.FamilyMemberId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CareRecipients_AspNetUsers_ResponsibleNurseId",
                        column: x => x.ResponsibleNurseId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CareRecipients_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PatientProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    NationalCode = table.Column<string>(type: "text", nullable: true),
                    Gender = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FatherName = table.Column<string>(type: "text", nullable: true),
                    MaritalStatus = table.Column<string>(type: "text", nullable: true),
                    Nationality = table.Column<string>(type: "text", nullable: true),
                    ProfileImageUrl = table.Column<string>(type: "text", nullable: true),
                    MobileNumber = table.Column<string>(type: "text", nullable: true),
                    Height = table.Column<double>(type: "double precision", nullable: true),
                    Weight = table.Column<double>(type: "double precision", nullable: true),
                    BloodGroup = table.Column<string>(type: "text", nullable: true),
                    MobilityStatus = table.Column<string>(type: "text", nullable: true),
                    UsesWheelchair = table.Column<bool>(type: "boolean", nullable: false),
                    UsesWalker = table.Column<bool>(type: "boolean", nullable: false),
                    WalkingAbility = table.Column<string>(type: "text", nullable: true),
                    AttendingPhysician = table.Column<string>(type: "text", nullable: true),
                    PhysicianPhone = table.Column<string>(type: "text", nullable: true),
                    PreviousHospital = table.Column<string>(type: "text", nullable: true),
                    HospitalizationHistory = table.Column<string>(type: "text", nullable: true),
                    SurgeryHistory = table.Column<string>(type: "text", nullable: true),
                    HasHomeOxygen = table.Column<bool>(type: "boolean", nullable: false),
                    HasVentilator = table.Column<bool>(type: "boolean", nullable: false),
                    HasTracheostomy = table.Column<bool>(type: "boolean", nullable: false),
                    HasPEG = table.Column<bool>(type: "boolean", nullable: false),
                    HasUrinaryCatheter = table.Column<bool>(type: "boolean", nullable: false),
                    HasBedsore = table.Column<bool>(type: "boolean", nullable: false),
                    NeededHomeMedicalEquipmentJson = table.Column<string>(type: "text", nullable: true),
                    AvailableHomeMedicalEquipmentJson = table.Column<string>(type: "text", nullable: true),
                    OtherNeededHomeMedicalEquipment = table.Column<string>(type: "text", nullable: true),
                    OtherAvailableHomeMedicalEquipment = table.Column<string>(type: "text", nullable: true),
                    DynamicAnswersJson = table.Column<string>(type: "text", nullable: true),
                    CompletionPercentage = table.Column<int>(type: "integer", nullable: false),
                    CurrentStep = table.Column<int>(type: "integer", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUpdatedByUserId = table.Column<string>(type: "text", nullable: true),
                    LastUpdatedByName = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientProfiles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserNotifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    ReferenceId = table.Column<string>(type: "text", nullable: true),
                    Link = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserNotifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserNotifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssessmentQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<int>(type: "integer", nullable: false),
                    Tags = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    QuestionKey = table.Column<string>(type: "text", nullable: true),
                    NextQuestionKey = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssessmentQuestions_AssessmentForms_FormId",
                        column: x => x.FormId,
                        principalTable: "AssessmentForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    DefaultValue = table.Column<string>(type: "text", nullable: false),
                    ParentId = table.Column<int>(type: "integer", nullable: true),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportItem_ReportCategory_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "ReportCategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReportItem_ReportItem_ParentId",
                        column: x => x.ParentId,
                        principalTable: "ReportItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<int>(type: "integer", nullable: false),
                    Tags = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
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
                name: "AssessmentSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalScore = table.Column<double>(type: "double precision", nullable: false),
                    AnalysisResultJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssessmentSubmissions_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AssessmentSubmissions_AssessmentForms_FormId",
                        column: x => x.FormId,
                        principalTable: "AssessmentForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssessmentSubmissions_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CareAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<int>(type: "integer", nullable: false),
                    CaregiverId = table.Column<string>(type: "text", nullable: false),
                    AssignmentType = table.Column<int>(type: "integer", nullable: false),
                    ShiftSlot = table.Column<int>(type: "integer", nullable: true),
                    StartDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    IsPrimaryCaregiver = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: false),
                    LastModifiedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareAssignments_AspNetUsers_CaregiverId",
                        column: x => x.CaregiverId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CareAssignments_CareRecipients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CareServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    PerformerId = table.Column<string>(type: "text", nullable: true),
                    PerformedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ServiceType = table.Column<string>(type: "text", nullable: true),
                    ServiceDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CareServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CareServices_AspNetUsers_PerformerId",
                        column: x => x.PerformerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_CareServices_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CareServices_ServiceDefinitions_ServiceDefinitionId",
                        column: x => x.ServiceDefinitionId,
                        principalTable: "ServiceDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NursingReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    AuthorId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Shift = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NursingReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NursingReports_AspNetUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NursingReports_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientMedications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Form = table.Column<string>(type: "text", nullable: false),
                    Dosage = table.Column<string>(type: "text", nullable: false),
                    Route = table.Column<string>(type: "text", nullable: false),
                    FrequencyType = table.Column<int>(type: "integer", nullable: false),
                    FrequencyDetail = table.Column<string>(type: "text", nullable: true),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsPRN = table.Column<bool>(type: "boolean", nullable: false),
                    HighAlert = table.Column<bool>(type: "boolean", nullable: false),
                    Criticality = table.Column<int>(type: "integer", nullable: false),
                    Instructions = table.Column<string>(type: "text", nullable: true),
                    GracePeriodMinutes = table.Column<int>(type: "integer", nullable: false),
                    NotifyPatient = table.Column<bool>(type: "boolean", nullable: false),
                    NotifyNurse = table.Column<bool>(type: "boolean", nullable: false),
                    NotifySupervisor = table.Column<bool>(type: "boolean", nullable: false),
                    NotifyFamily = table.Column<bool>(type: "boolean", nullable: false),
                    EscalationEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    TotalQuantity = table.Column<int>(type: "integer", nullable: false),
                    AlertLimit = table.Column<int>(type: "integer", nullable: false),
                    DoseQuantity = table.Column<int>(type: "integer", nullable: false),
                    AlertLowStockInAppEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AlertLowStockSmsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AlertLowStockEmailEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AlertLowStockPatient = table.Column<bool>(type: "boolean", nullable: false),
                    AlertLowStockNurse = table.Column<bool>(type: "boolean", nullable: false),
                    AlertLowStockFamily = table.Column<bool>(type: "boolean", nullable: false),
                    AlertLowStockAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    AlertLowStockCustomPhone = table.Column<string>(type: "text", nullable: true),
                    AlertLowStockCustomEmail = table.Column<string>(type: "text", nullable: true),
                    IsLowStockAlertActive = table.Column<bool>(type: "boolean", nullable: false),
                    LowStockAlertActivatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedByUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientMedications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientMedications_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientSelfServiceAccessPolicies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessStartAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AccessEndAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DailyAccessStartMinutes = table.Column<int>(type: "integer", nullable: true),
                    DailyAccessEndMinutes = table.Column<int>(type: "integer", nullable: true),
                    CreatedById = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedById = table.Column<string>(type: "text", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevokedById = table.Column<string>(type: "text", nullable: true),
                    RevokedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientSelfServiceAccessPolicies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_AspNetUsers_RevokedById",
                        column: x => x.RevokedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_CareRecipients_CareRecipie~",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationSubmissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: true),
                    SubmittedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalScore = table.Column<double>(type: "double precision", nullable: false),
                    AnalysisResultJson = table.Column<string>(type: "text", nullable: true)
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
                name: "VitalSigns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    RecorderId = table.Column<string>(type: "text", nullable: true),
                    PatientAcknowledgedById = table.Column<string>(type: "text", nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MeasuredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PatientAcknowledgedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsLateEntry = table.Column<bool>(type: "boolean", nullable: false),
                    DelayReason = table.Column<string>(type: "text", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    PatientAcknowledgementNote = table.Column<string>(type: "text", nullable: true),
                    SystolicBloodPressure = table.Column<int>(type: "integer", nullable: false),
                    DiastolicBloodPressure = table.Column<int>(type: "integer", nullable: false),
                    MeanArterialPressure = table.Column<double>(type: "double precision", nullable: false),
                    PulseRate = table.Column<int>(type: "integer", nullable: false),
                    RespiratoryRate = table.Column<int>(type: "integer", nullable: false),
                    BodyTemperature = table.Column<double>(type: "double precision", nullable: false),
                    OxygenSaturation = table.Column<int>(type: "integer", nullable: false),
                    BloodSugar = table.Column<int>(type: "integer", nullable: true),
                    GlasgowComaScale = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VitalSigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VitalSigns_AspNetUsers_PatientAcknowledgedById",
                        column: x => x.PatientAcknowledgedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VitalSigns_AspNetUsers_RecorderId",
                        column: x => x.RecorderId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_VitalSigns_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientProfileId = table.Column<int>(type: "integer", nullable: false),
                    State = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    FullAddress = table.Column<string>(type: "text", nullable: true),
                    PostalCode = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Addresses_PatientProfiles_PatientProfileId",
                        column: x => x.PatientProfileId,
                        principalTable: "PatientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Allergies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientProfileId = table.Column<int>(type: "integer", nullable: false),
                    AllergyType = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Allergies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Allergies_PatientProfiles_PatientProfileId",
                        column: x => x.PatientProfileId,
                        principalTable: "PatientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ElderlyAssessments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientProfileId = table.Column<int>(type: "integer", nullable: false),
                    ConsciousnessLevel = table.Column<string>(type: "text", nullable: true),
                    DailyActivityAbility = table.Column<string>(type: "text", nullable: true),
                    FallRisk = table.Column<string>(type: "text", nullable: true),
                    SwallowingDisorder = table.Column<string>(type: "text", nullable: true),
                    NutritionStatus = table.Column<string>(type: "text", nullable: true),
                    HasUrinaryIncontinence = table.Column<bool>(type: "boolean", nullable: false),
                    HasFecalIncontinence = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ElderlyAssessments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ElderlyAssessments_PatientProfiles_PatientProfileId",
                        column: x => x.PatientProfileId,
                        principalTable: "PatientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EmergencyContacts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientProfileId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    Relationship = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmergencyContacts_PatientProfiles_PatientProfileId",
                        column: x => x.PatientProfileId,
                        principalTable: "PatientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientProfileId = table.Column<int>(type: "integer", nullable: false),
                    HasDiabetes = table.Column<bool>(type: "boolean", nullable: false),
                    HasHypertension = table.Column<bool>(type: "boolean", nullable: false),
                    HasHeartDisease = table.Column<bool>(type: "boolean", nullable: false),
                    HasCOPD = table.Column<bool>(type: "boolean", nullable: false),
                    HasAsthma = table.Column<bool>(type: "boolean", nullable: false),
                    HasKidneyFailure = table.Column<bool>(type: "boolean", nullable: false),
                    HasStroke = table.Column<bool>(type: "boolean", nullable: false),
                    HasAlzheimers = table.Column<bool>(type: "boolean", nullable: false),
                    HasParkinsons = table.Column<bool>(type: "boolean", nullable: false),
                    HasCancer = table.Column<bool>(type: "boolean", nullable: false),
                    HasPsychiatricDisorders = table.Column<bool>(type: "boolean", nullable: false),
                    OtherDiseases = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicalHistories_PatientProfiles_PatientProfileId",
                        column: x => x.PatientProfileId,
                        principalTable: "PatientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UploadedDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientProfileId = table.Column<int>(type: "integer", nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    FileUrl = table.Column<string>(type: "text", nullable: true),
                    UploadDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UploadedDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UploadedDocuments_PatientProfiles_PatientProfileId",
                        column: x => x.PatientProfileId,
                        principalTable: "PatientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AssessmentOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    ScoreValue = table.Column<int>(type: "integer", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    NextQuestionKey = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentOptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssessmentOptions_AssessmentQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "AssessmentQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationOptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    ScoreValue = table.Column<int>(type: "integer", nullable: false),
                    IsCorrect = table.Column<bool>(type: "boolean", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false)
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
                name: "AssessmentAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SubmissionId = table.Column<int>(type: "integer", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AssessmentAssignments_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssessmentAssignments_AssessmentForms_FormId",
                        column: x => x.FormId,
                        principalTable: "AssessmentForms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssessmentAssignments_AssessmentSubmissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "AssessmentSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ServiceReminders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    ServiceDefinitionId = table.Column<int>(type: "integer", nullable: false),
                    CareServiceId = table.Column<int>(type: "integer", nullable: true),
                    TargetUserId = table.Column<string>(type: "text", nullable: true),
                    ScheduledTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: false),
                    NotifyPatient = table.Column<bool>(type: "boolean", nullable: false),
                    NotifyAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    NotifySupervisor = table.Column<bool>(type: "boolean", nullable: false),
                    SendSms = table.Column<bool>(type: "boolean", nullable: false),
                    SendEmail = table.Column<bool>(type: "boolean", nullable: false),
                    SendInApp = table.Column<bool>(type: "boolean", nullable: false),
                    IsSent = table.Column<bool>(type: "boolean", nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FailureReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceReminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceReminders_AspNetUsers_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceReminders_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceReminders_CareServices_CareServiceId",
                        column: x => x.CareServiceId,
                        principalTable: "CareServices",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ServiceReminders_ServiceDefinitions_ServiceDefinitionId",
                        column: x => x.ServiceDefinitionId,
                        principalTable: "ServiceDefinitions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NursingReportDetail",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReportId = table.Column<int>(type: "integer", nullable: false),
                    ItemId = table.Column<int>(type: "integer", nullable: false),
                    IsChecked = table.Column<bool>(type: "boolean", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NursingReportDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NursingReportDetail_NursingReports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "NursingReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_NursingReportDetail_ReportItem_ItemId",
                        column: x => x.ItemId,
                        principalTable: "ReportItem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicationAlertHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientMedicationId = table.Column<int>(type: "integer", nullable: false),
                    CareRecipientId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AlertType = table.Column<int>(type: "integer", nullable: false),
                    RecipientType = table.Column<int>(type: "integer", nullable: false),
                    RecipientDisplay = table.Column<string>(type: "text", nullable: false),
                    RecipientUserId = table.Column<string>(type: "text", nullable: true),
                    Channel = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    DeliveryStatus = table.Column<int>(type: "integer", nullable: false),
                    ErrorMessage = table.Column<string>(type: "text", nullable: true)
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
                        name: "FK_MedicationAlertHistories_PatientMedications_PatientMedicati~",
                        column: x => x.PatientMedicationId,
                        principalTable: "PatientMedications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicationDoses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientMedicationId = table.Column<int>(type: "integer", nullable: false),
                    ScheduledTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    TakenAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TakenByUserId = table.Column<string>(type: "text", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    MissedReason = table.Column<string>(type: "text", nullable: true),
                    SideEffectSeverity = table.Column<int>(type: "integer", nullable: false),
                    SideEffectDescription = table.Column<string>(type: "text", nullable: true),
                    AttachmentPath = table.Column<string>(type: "text", nullable: true),
                    IsReminderSent = table.Column<bool>(type: "boolean", nullable: false),
                    EscalationLevel = table.Column<int>(type: "integer", nullable: false),
                    LastEscalationTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AppliedInventoryQuantity = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationDoses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicationDoses_AspNetUsers_TakenByUserId",
                        column: x => x.TakenByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MedicationDoses_PatientMedications_PatientMedicationId",
                        column: x => x.PatientMedicationId,
                        principalTable: "PatientMedications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicationInventoryTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PatientMedicationId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PerformedByUserId = table.Column<string>(type: "text", nullable: true),
                    TransactionType = table.Column<int>(type: "integer", nullable: false),
                    QuantityChanged = table.Column<int>(type: "integer", nullable: false),
                    QuantityBefore = table.Column<int>(type: "integer", nullable: false),
                    QuantityAfter = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicationInventoryTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicationInventoryTransactions_AspNetUsers_PerformedByUser~",
                        column: x => x.PerformedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MedicationInventoryTransactions_PatientMedications_PatientM~",
                        column: x => x.PatientMedicationId,
                        principalTable: "PatientMedications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientSelfServiceFeatureGrants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PolicyId = table.Column<int>(type: "integer", nullable: false),
                    FeatureKey = table.Column<string>(type: "text", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedById = table.Column<string>(type: "text", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientSelfServiceFeatureGrants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceFeatureGrants_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceFeatureGrants_PatientSelfServiceAccessPol~",
                        column: x => x.PolicyId,
                        principalTable: "PatientSelfServiceAccessPolicies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    FormId = table.Column<int>(type: "integer", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Deadline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsMandatory = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    SubmissionId = table.Column<int>(type: "integer", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
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
                        name: "FK_UserEvaluationAssignments_UserEvaluationSubmissions_Submiss~",
                        column: x => x.SubmissionId,
                        principalTable: "UserEvaluationSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "QuestionAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubmissionId = table.Column<int>(type: "integer", nullable: false),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    SelectedOptionId = table.Column<int>(type: "integer", nullable: true),
                    TextResponse = table.Column<string>(type: "text", nullable: true),
                    BooleanResponse = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuestionAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuestionAnswers_AssessmentOptions_SelectedOptionId",
                        column: x => x.SelectedOptionId,
                        principalTable: "AssessmentOptions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_QuestionAnswers_AssessmentQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "AssessmentQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuestionAnswers_AssessmentSubmissions_SubmissionId",
                        column: x => x.SubmissionId,
                        principalTable: "AssessmentSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserEvaluationAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SubmissionId = table.Column<int>(type: "integer", nullable: false),
                    QuestionId = table.Column<int>(type: "integer", nullable: false),
                    SelectedOptionId = table.Column<int>(type: "integer", nullable: true),
                    TextResponse = table.Column<string>(type: "text", nullable: true),
                    BooleanResponse = table.Column<bool>(type: "boolean", nullable: true)
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
                name: "IX_Addresses_PatientProfileId",
                table: "Addresses",
                column: "PatientProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Allergies_PatientProfileId",
                table: "Allergies",
                column: "PatientProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentAssignments_FormId",
                table: "AssessmentAssignments",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentAssignments_SubmissionId",
                table: "AssessmentAssignments",
                column: "SubmissionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentAssignments_UserId",
                table: "AssessmentAssignments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentOptions_QuestionId",
                table: "AssessmentOptions",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentQuestions_FormId",
                table: "AssessmentQuestions",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentSubmissions_CareRecipientId",
                table: "AssessmentSubmissions",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentSubmissions_FormId",
                table: "AssessmentSubmissions",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentSubmissions_UserId",
                table: "AssessmentSubmissions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CareAssignments_CaregiverId",
                table: "CareAssignments",
                column: "CaregiverId");

            migrationBuilder.CreateIndex(
                name: "IX_CareAssignments_PatientId",
                table: "CareAssignments",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_CareAssignments_StartDate",
                table: "CareAssignments",
                column: "StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_CaregiverProfiles_UserId",
                table: "CaregiverProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CareRecipients_FamilyMemberId",
                table: "CareRecipients",
                column: "FamilyMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_CareRecipients_ResponsibleNurseId",
                table: "CareRecipients",
                column: "ResponsibleNurseId");

            migrationBuilder.CreateIndex(
                name: "IX_CareRecipients_UserId",
                table: "CareRecipients",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_CareRecipientId",
                table: "CareServices",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_PerformerId",
                table: "CareServices",
                column: "PerformerId");

            migrationBuilder.CreateIndex(
                name: "IX_CareServices_ServiceDefinitionId",
                table: "CareServices",
                column: "ServiceDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ElderlyAssessments_PatientProfileId",
                table: "ElderlyAssessments",
                column: "PatientProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyContacts_PatientProfileId",
                table: "EmergencyContacts",
                column: "PatientProfileId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicalHistories_PatientProfileId",
                table: "MedicalHistories",
                column: "PatientProfileId",
                unique: true);

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
                name: "IX_MedicationDoses_PatientMedicationId",
                table: "MedicationDoses",
                column: "PatientMedicationId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationDoses_TakenByUserId",
                table: "MedicationDoses",
                column: "TakenByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationInventoryTransactions_PatientMedicationId",
                table: "MedicationInventoryTransactions",
                column: "PatientMedicationId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicationInventoryTransactions_PerformedByUserId",
                table: "MedicationInventoryTransactions",
                column: "PerformedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_NursingReportDetail_ItemId",
                table: "NursingReportDetail",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_NursingReportDetail_ReportId",
                table: "NursingReportDetail",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_NursingReports_AuthorId",
                table: "NursingReports",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_NursingReports_CareRecipientId",
                table: "NursingReports",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientMedications_CareRecipientId",
                table: "PatientMedications",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_PatientProfiles_UserId",
                table: "PatientProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PatientSelfServiceAccessPolicies_CareRecipientId",
                table: "PatientSelfServiceAccessPolicies",
                column: "CareRecipientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PatientSelfServiceAccessPolicies_CreatedById",
                table: "PatientSelfServiceAccessPolicies",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_PatientSelfServiceAccessPolicies_RevokedById",
                table: "PatientSelfServiceAccessPolicies",
                column: "RevokedById");

            migrationBuilder.CreateIndex(
                name: "IX_PatientSelfServiceAccessPolicies_UpdatedById",
                table: "PatientSelfServiceAccessPolicies",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_PatientSelfServiceFeatureGrants_PolicyId_FeatureKey",
                table: "PatientSelfServiceFeatureGrants",
                columns: new[] { "PolicyId", "FeatureKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PatientSelfServiceFeatureGrants_UpdatedById",
                table: "PatientSelfServiceFeatureGrants",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionAnswers_QuestionId",
                table: "QuestionAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionAnswers_SelectedOptionId",
                table: "QuestionAnswers",
                column: "SelectedOptionId");

            migrationBuilder.CreateIndex(
                name: "IX_QuestionAnswers_SubmissionId",
                table: "QuestionAnswers",
                column: "SubmissionId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportItem_CategoryId",
                table: "ReportItem",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportItem_ParentId",
                table: "ReportItem",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_CareRecipientId",
                table: "ServiceReminders",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_CareServiceId",
                table: "ServiceReminders",
                column: "CareServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_ServiceDefinitionId",
                table: "ServiceReminders",
                column: "ServiceDefinitionId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceReminders_TargetUserId",
                table: "ServiceReminders",
                column: "TargetUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadedDocuments_PatientProfileId_DocumentType",
                table: "UploadedDocuments",
                columns: new[] { "PatientProfileId", "DocumentType" },
                unique: true,
                filter: "\"DocumentType\" IS NOT NULL");

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
                unique: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_UserNotifications_UserId",
                table: "UserNotifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_CareRecipientId",
                table: "VitalSigns",
                column: "CareRecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_PatientAcknowledgedById",
                table: "VitalSigns",
                column: "PatientAcknowledgedById");

            migrationBuilder.CreateIndex(
                name: "IX_VitalSigns_RecorderId",
                table: "VitalSigns",
                column: "RecorderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "Allergies");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "AssessmentAssignments");

            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CareAssignments");

            migrationBuilder.DropTable(
                name: "CaregiverProfiles");

            migrationBuilder.DropTable(
                name: "ElderlyAssessments");

            migrationBuilder.DropTable(
                name: "EmergencyContacts");

            migrationBuilder.DropTable(
                name: "MedicalHistories");

            migrationBuilder.DropTable(
                name: "MedicationAlertHistories");

            migrationBuilder.DropTable(
                name: "MedicationAlertSettings");

            migrationBuilder.DropTable(
                name: "MedicationDoses");

            migrationBuilder.DropTable(
                name: "MedicationInventoryTransactions");

            migrationBuilder.DropTable(
                name: "NotificationSettings");

            migrationBuilder.DropTable(
                name: "NursingReportDetail");

            migrationBuilder.DropTable(
                name: "PatientSelfServiceFeatureGrants");

            migrationBuilder.DropTable(
                name: "QuestionAnswers");

            migrationBuilder.DropTable(
                name: "ServiceReminders");

            migrationBuilder.DropTable(
                name: "UploadedDocuments");

            migrationBuilder.DropTable(
                name: "UserEvaluationAnswers");

            migrationBuilder.DropTable(
                name: "UserEvaluationAssignments");

            migrationBuilder.DropTable(
                name: "UserNotifications");

            migrationBuilder.DropTable(
                name: "VitalSigns");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "PatientMedications");

            migrationBuilder.DropTable(
                name: "NursingReports");

            migrationBuilder.DropTable(
                name: "ReportItem");

            migrationBuilder.DropTable(
                name: "PatientSelfServiceAccessPolicies");

            migrationBuilder.DropTable(
                name: "AssessmentOptions");

            migrationBuilder.DropTable(
                name: "AssessmentSubmissions");

            migrationBuilder.DropTable(
                name: "CareServices");

            migrationBuilder.DropTable(
                name: "PatientProfiles");

            migrationBuilder.DropTable(
                name: "UserEvaluationOptions");

            migrationBuilder.DropTable(
                name: "UserEvaluationSubmissions");

            migrationBuilder.DropTable(
                name: "ReportCategory");

            migrationBuilder.DropTable(
                name: "AssessmentQuestions");

            migrationBuilder.DropTable(
                name: "ServiceDefinitions");

            migrationBuilder.DropTable(
                name: "UserEvaluationQuestions");

            migrationBuilder.DropTable(
                name: "CareRecipients");

            migrationBuilder.DropTable(
                name: "AssessmentForms");

            migrationBuilder.DropTable(
                name: "UserEvaluationForms");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
