using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientSelfServiceAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PatientSelfServiceAccessPolicies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CareRecipientId = table.Column<int>(type: "int", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessStartAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccessEndAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DailyAccessStartMinutes = table.Column<int>(type: "int", nullable: true),
                    DailyAccessEndMinutes = table.Column<int>(type: "int", nullable: true),
                    CreatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    RevokedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientSelfServiceAccessPolicies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_AspNetUsers_RevokedById",
                        column: x => x.RevokedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceAccessPolicies_CareRecipients_CareRecipientId",
                        column: x => x.CareRecipientId,
                        principalTable: "CareRecipients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PatientSelfServiceFeatureGrants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PolicyId = table.Column<int>(type: "int", nullable: false),
                    FeatureKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PatientSelfServiceFeatureGrants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceFeatureGrants_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PatientSelfServiceFeatureGrants_PatientSelfServiceAccessPolicies_PolicyId",
                        column: x => x.PolicyId,
                        principalTable: "PatientSelfServiceAccessPolicies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PatientSelfServiceFeatureGrants");

            migrationBuilder.DropTable(
                name: "PatientSelfServiceAccessPolicies");
        }
    }
}
