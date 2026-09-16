using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGuestRequestAttributionFields_v1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LandingPage",
                table: "GuestServiceRequests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SourceMetadataJson",
                table: "GuestServiceRequests",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LandingPage",
                table: "GuestServiceRequests");

            migrationBuilder.DropColumn(
                name: "SourceMetadataJson",
                table: "GuestServiceRequests");
        }
    }
}
