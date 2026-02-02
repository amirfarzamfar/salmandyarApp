using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReportModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReportCategory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportCategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReportItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DefaultValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
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
                name: "NursingReportDetail",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReportId = table.Column<int>(type: "int", nullable: false),
                    ItemId = table.Column<int>(type: "int", nullable: false),
                    IsChecked = table.Column<bool>(type: "bit", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_NursingReportDetail_ItemId",
                table: "NursingReportDetail",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_NursingReportDetail_ReportId",
                table: "NursingReportDetail",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportItem_CategoryId",
                table: "ReportItem",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportItem_ParentId",
                table: "ReportItem",
                column: "ParentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NursingReportDetail");

            migrationBuilder.DropTable(
                name: "ReportItem");

            migrationBuilder.DropTable(
                name: "ReportCategory");
        }
    }
}
