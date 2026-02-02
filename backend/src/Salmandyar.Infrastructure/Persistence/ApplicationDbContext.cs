using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Entities;

namespace Salmandyar.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<CareRecipient> CareRecipients { get; set; }
    public DbSet<CaregiverProfile> CaregiverProfiles { get; set; }
    public DbSet<VitalSign> VitalSigns { get; set; }
    public DbSet<CareService> CareServices { get; set; }
    public DbSet<ServiceDefinition> ServiceDefinitions { get; set; }
    public DbSet<NursingReport> NursingReports { get; set; }
    public DbSet<ReportCategory> ReportCategories { get; set; }
    public DbSet<ReportItem> ReportItems { get; set; }
    public DbSet<NursingReportDetail> NursingReportDetails { get; set; }
    public DbSet<ServiceReminder> ServiceReminders { get; set; }
    public DbSet<NotificationSettings> NotificationSettings { get; set; }
    public DbSet<CareAssignment> CareAssignments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Explicit table names to avoid naming mismatches
        builder.Entity<CareAssignment>().ToTable("CareAssignments");
        builder.Entity<AuditLog>().ToTable("AuditLogs");

        
        // Explicit Value Conversions for DateTimeOffset to ensure compatibility
        // This is crucial because SQL Server's datetimeoffset type handling in EF Core 8 might have strict validation
        // especially when mixing local/unspecified kinds.
        
        builder.Entity<CareAssignment>()
            .Property(c => c.StartDate)
            .HasConversion(
                v => v.ToUniversalTime(), // Always save as UTC
                v => v.ToUniversalTime()  // Always read as UTC
            );

        builder.Entity<CareAssignment>()
            .Property(c => c.EndDate)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTimeOffset?)null,
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTimeOffset?)null
            );

        builder.Entity<ReportCategory>().ToTable("ReportCategory");
        builder.Entity<ReportItem>().ToTable("ReportItem");
        builder.Entity<NursingReport>().ToTable("NursingReports");
        builder.Entity<NursingReportDetail>().ToTable("NursingReportDetail");
        builder.Entity<CareRecipient>().ToTable("CareRecipients");
        builder.Entity<CaregiverProfile>().ToTable("CaregiverProfiles");
        builder.Entity<CareService>().ToTable("CareServices");
        builder.Entity<ServiceDefinition>().ToTable("ServiceDefinitions");
        builder.Entity<VitalSign>().ToTable("VitalSigns");
        builder.Entity<ServiceReminder>().ToTable("ServiceReminders");
        builder.Entity<NotificationSettings>().ToTable("NotificationSettings");
        
        // Configurations
        builder.Entity<CaregiverProfile>()
            .HasOne(c => c.User)
            .WithOne(u => u.CaregiverProfile)
            .HasForeignKey<CaregiverProfile>(c => c.UserId);

        builder.Entity<CareRecipient>()
            .HasOne(c => c.FamilyMember)
            .WithMany(u => u.CareRecipients)
            .HasForeignKey(c => c.FamilyMemberId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.Entity<CareRecipient>()
            .HasOne(c => c.User)
            .WithOne()
            .HasForeignKey<CareRecipient>(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // New Configurations
        builder.Entity<CareRecipient>()
            .HasOne(c => c.ResponsibleNurse)
            .WithMany()
            .HasForeignKey(c => c.ResponsibleNurseId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<VitalSign>()
            .HasOne(v => v.Recorder)
            .WithMany()
            .HasForeignKey(v => v.RecorderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<CareService>()
            .HasOne(s => s.Performer)
            .WithMany()
            .HasForeignKey(s => s.PerformerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<CareService>()
            .HasOne(s => s.ServiceDefinition)
            .WithMany()
            .HasForeignKey(s => s.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<NursingReport>()
            .HasOne(r => r.Author)
            .WithMany()
            .HasForeignKey(r => r.AuthorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Report Module Configurations
        builder.Entity<ReportItem>()
            .HasOne(i => i.Category)
            .WithMany(c => c.Items)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ReportItem>()
            .HasOne(i => i.Parent)
            .WithMany(p => p.SubItems)
            .HasForeignKey(i => i.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<NursingReportDetail>()
            .HasOne(d => d.Report)
            .WithMany(r => r.Details)
            .HasForeignKey(d => d.ReportId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<NursingReportDetail>()
            .HasOne(d => d.Item)
            .WithMany()
            .HasForeignKey(d => d.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        // Service Reminder Configurations
        builder.Entity<ServiceReminder>()
            .HasOne(r => r.CareRecipient)
            .WithMany()
            .HasForeignKey(r => r.CareRecipientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ServiceReminder>()
            .HasOne(r => r.ServiceDefinition)
            .WithMany()
            .HasForeignKey(r => r.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        // CareAssignment Configurations
        builder.Entity<CareAssignment>()
            .HasOne(a => a.Patient)
            .WithMany()
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CareAssignment>()
            .HasOne(a => a.Caregiver)
            .WithMany()
            .HasForeignKey(a => a.CaregiverId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CareAssignment>()
            .HasIndex(a => a.PatientId);

        builder.Entity<CareAssignment>()
            .HasIndex(a => a.CaregiverId);

        builder.Entity<CareAssignment>()
            .HasIndex(a => a.StartDate);
    }
}
