using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificationSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NotificationSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmailEnabled = table.Column<bool>(type: "bit", nullable: false),
                    SmtpHost = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SmtpPort = table.Column<int>(type: "int", nullable: false),
                    SmtpUser = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SmtpPassword = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SmtpUseSsl = table.Column<bool>(type: "bit", nullable: false),
                    SmsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    SmsProvider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SmsApiKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SmsSenderNumber = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotificationSettings", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NotificationSettings");
        }
    }
}
