using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Salmandyar.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserManagementFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'AdminNotes' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [AdminNotes] nvarchar(max) NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'BanReason' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [BanReason] nvarchar(max) NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'CreatedAt' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'IsActive' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [IsActive] bit NOT NULL DEFAULT 0;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'LastLoginDate' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [LastLoginDate] datetime2 NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'LastLoginIp' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [LastLoginIp] nvarchar(max) NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = N'NationalCode' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [NationalCode] nvarchar(max) NULL;
                END
            ");

            /*
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Action = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EntityId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Details = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });
            */
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "AdminNotes",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "BanReason",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastLoginDate",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastLoginIp",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "NationalCode",
                table: "AspNetUsers");
        }
    }
}
