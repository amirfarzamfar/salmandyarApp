using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCareAssignmentModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CareAssignments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<int>(type: "int", nullable: false),
                    CaregiverId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AssignmentType = table.Column<int>(type: "int", nullable: false),
                    ShiftSlot = table.Column<int>(type: "int", nullable: true),
                    StartDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EndDate = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsPrimaryCaregiver = table.Column<bool>(type: "bit", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastModifiedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CareAssignments");
        }
    }
}
