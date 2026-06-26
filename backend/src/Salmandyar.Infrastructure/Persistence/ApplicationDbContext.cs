using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Entities.UserEvaluations;
using Salmandyar.Domain.Entities.Medications;
using Salmandyar.Domain.Entities.PatientProfile;

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
    public DbSet<NotificationDeliveryLog> NotificationDeliveryLogs { get; set; }
    public DbSet<OtpLoginSettings> OtpLoginSettings { get; set; }
    public DbSet<OtpLoginChallenge> OtpLoginChallenges { get; set; }
    public DbSet<MedicationAlertSettings> MedicationAlertSettings { get; set; }
    public DbSet<CareAssignment> CareAssignments { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<PatientSelfServiceAccessPolicy> PatientSelfServiceAccessPolicies { get; set; }
    public DbSet<PatientSelfServiceFeatureGrant> PatientSelfServiceFeatureGrants { get; set; }

    // Assessment Module
    public DbSet<AssessmentForm> AssessmentForms { get; set; }
    public DbSet<AssessmentQuestion> AssessmentQuestions { get; set; }
    public DbSet<AssessmentOption> AssessmentOptions { get; set; }
    public DbSet<AssessmentSubmission> AssessmentSubmissions { get; set; }
    public DbSet<QuestionAnswer> QuestionAnswers { get; set; }
    public DbSet<AssessmentAssignment> AssessmentAssignments { get; set; }
    public DbSet<UserNotification> UserNotifications { get; set; }

    // User Evaluation Module
    public DbSet<UserEvaluationForm> UserEvaluationForms { get; set; }
    public DbSet<UserEvaluationQuestion> UserEvaluationQuestions { get; set; }
    public DbSet<UserEvaluationOption> UserEvaluationOptions { get; set; }
    public DbSet<UserEvaluationSubmission> UserEvaluationSubmissions { get; set; }
    public DbSet<UserEvaluationAnswer> UserEvaluationAnswers { get; set; }
    public DbSet<UserEvaluationAssignment> UserEvaluationAssignments { get; set; }

    // Medication Module
    public DbSet<PatientMedication> PatientMedications { get; set; }
    public DbSet<MedicationDose> MedicationDoses { get; set; }
    public DbSet<MedicationInventoryTransaction> MedicationInventoryTransactions { get; set; }
    public DbSet<MedicationAlertHistory> MedicationAlertHistories { get; set; }

    // Patient Profile Module
    public DbSet<PatientProfile> PatientProfiles { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<EmergencyContact> EmergencyContacts { get; set; }
    public DbSet<MedicalHistory> MedicalHistories { get; set; }
    public DbSet<Allergy> Allergies { get; set; }
    public DbSet<ElderlyAssessment> ElderlyAssessments { get; set; }
    public DbSet<UploadedDocument> UploadedDocuments { get; set; }

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
        builder.Entity<PatientSelfServiceAccessPolicy>().ToTable("PatientSelfServiceAccessPolicies");
        builder.Entity<PatientSelfServiceFeatureGrant>().ToTable("PatientSelfServiceFeatureGrants");

        // VitalSign DateTime Conversion
        builder.Entity<VitalSign>()
            .Property(v => v.RecordedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<VitalSign>()
            .Property(v => v.MeasuredAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<VitalSign>()
            .Property(v => v.PatientAcknowledgedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .Property(v => v.AccessStartAtUtc)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .Property(v => v.AccessEndAtUtc)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .Property(v => v.CreatedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .Property(v => v.UpdatedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .Property(v => v.RevokedAtUtc)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<PatientSelfServiceFeatureGrant>()
            .Property(v => v.UpdatedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ServiceReminder>()
            .Property(r => r.ScheduledTime)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ServiceReminder>().ToTable("ServiceReminders");
        builder.Entity<NotificationSettings>().ToTable("NotificationSettings");
        builder.Entity<NotificationDeliveryLog>().ToTable("NotificationDeliveryLogs");
        builder.Entity<OtpLoginSettings>().ToTable("OtpLoginSettings");
        builder.Entity<OtpLoginChallenge>().ToTable("OtpLoginChallenges");
        builder.Entity<MedicationAlertSettings>().ToTable("MedicationAlertSettings");

        builder.Entity<OtpLoginChallenge>()
            .HasIndex(challenge => new { challenge.UserId, challenge.DeliveryChannel, challenge.CreatedAtUtc });
        
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

        builder.Entity<CareRecipient>()
            .HasOne(c => c.SelfServiceAccessPolicy)
            .WithOne(p => p.CareRecipient)
            .HasForeignKey<PatientSelfServiceAccessPolicy>(p => p.CareRecipientId)
            .OnDelete(DeleteBehavior.Cascade);

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

        builder.Entity<VitalSign>()
            .HasOne(v => v.PatientAcknowledgedBy)
            .WithMany()
            .HasForeignKey(v => v.PatientAcknowledgedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .HasOne(p => p.CreatedBy)
            .WithMany()
            .HasForeignKey(p => p.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .HasOne(p => p.UpdatedBy)
            .WithMany()
            .HasForeignKey(p => p.UpdatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .HasOne(p => p.RevokedBy)
            .WithMany()
            .HasForeignKey(p => p.RevokedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<PatientSelfServiceFeatureGrant>()
            .HasOne(p => p.Policy)
            .WithMany(p => p.FeatureGrants)
            .HasForeignKey(p => p.PolicyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PatientSelfServiceFeatureGrant>()
            .HasOne(p => p.UpdatedBy)
            .WithMany()
            .HasForeignKey(p => p.UpdatedById)
            .OnDelete(DeleteBehavior.Restrict);

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

        builder.Entity<ServiceReminder>()
            .HasOne(r => r.CareService)
            .WithMany()
            .HasForeignKey(r => r.CareServiceId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.Entity<ServiceReminder>()
            .HasOne(r => r.TargetUser)
            .WithMany()
            .HasForeignKey(r => r.TargetUserId)
            .OnDelete(DeleteBehavior.SetNull);

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

        builder.Entity<PatientSelfServiceAccessPolicy>()
            .HasIndex(x => x.CareRecipientId)
            .IsUnique();

        builder.Entity<PatientSelfServiceFeatureGrant>()
            .HasIndex(x => new { x.PolicyId, x.FeatureKey })
            .IsUnique();

        // Assessment Module Configurations
        builder.Entity<AssessmentForm>().ToTable("AssessmentForms");
        builder.Entity<AssessmentQuestion>().ToTable("AssessmentQuestions");
        builder.Entity<AssessmentOption>().ToTable("AssessmentOptions");
        builder.Entity<AssessmentSubmission>().ToTable("AssessmentSubmissions");
        builder.Entity<QuestionAnswer>().ToTable("QuestionAnswers");
        builder.Entity<AssessmentAssignment>().ToTable("AssessmentAssignments");
        builder.Entity<UserNotification>().ToTable("UserNotifications");

        builder.Entity<UserNotification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<NotificationDeliveryLog>()
            .Property(x => x.CreatedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<NotificationDeliveryLog>()
            .HasIndex(x => new { x.EventKey, x.CreatedAtUtc });

        builder.Entity<NotificationDeliveryLog>()
            .HasIndex(x => new { x.Channel, x.Status, x.CreatedAtUtc });

        builder.Entity<AssessmentAssignment>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<AssessmentAssignment>()
            .HasOne(a => a.Form)
            .WithMany()
            .HasForeignKey(a => a.FormId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<AssessmentAssignment>()
            .HasOne(a => a.Submission)
            .WithOne()
            .HasForeignKey<AssessmentAssignment>(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<AssessmentQuestion>()
            .Property(q => q.Tags)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );

        builder.Entity<AssessmentQuestion>()
            .HasOne(q => q.Form)
            .WithMany(f => f.Questions)
            .HasForeignKey(q => q.FormId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<AssessmentOption>()
            .HasOne(o => o.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<AssessmentSubmission>()
            .HasOne(s => s.Form)
            .WithMany()
            .HasForeignKey(s => s.FormId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<QuestionAnswer>()
            .HasOne(a => a.Submission)
            .WithMany(s => s.Answers)
            .HasForeignKey(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // User Evaluation Module Configurations
        builder.Entity<UserEvaluationForm>().ToTable("UserEvaluationForms");
        builder.Entity<UserEvaluationQuestion>().ToTable("UserEvaluationQuestions");
        builder.Entity<UserEvaluationOption>().ToTable("UserEvaluationOptions");
        builder.Entity<UserEvaluationSubmission>().ToTable("UserEvaluationSubmissions");
        builder.Entity<UserEvaluationAnswer>().ToTable("UserEvaluationAnswers");
        builder.Entity<UserEvaluationAssignment>().ToTable("UserEvaluationAssignments");

        builder.Entity<UserEvaluationAssignment>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserEvaluationAssignment>()
            .HasOne(a => a.Form)
            .WithMany()
            .HasForeignKey(a => a.FormId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<UserEvaluationAssignment>()
            .HasOne(a => a.Submission)
            .WithOne()
            .HasForeignKey<UserEvaluationAssignment>(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<UserEvaluationQuestion>()
            .Property(q => q.Tags)
            .HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );

        builder.Entity<UserEvaluationQuestion>()
            .HasOne(q => q.Form)
            .WithMany(f => f.Questions)
            .HasForeignKey(q => q.FormId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserEvaluationOption>()
            .HasOne(o => o.Question)
            .WithMany(q => q.Options)
            .HasForeignKey(o => o.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UserEvaluationSubmission>()
            .HasOne(s => s.Form)
            .WithMany()
            .HasForeignKey(s => s.FormId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<UserEvaluationAnswer>()
            .HasOne(a => a.Submission)
            .WithMany(s => s.Answers)
            .HasForeignKey(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Medication Module Configurations
        builder.Entity<PatientMedication>().ToTable("PatientMedications");
        builder.Entity<MedicationDose>().ToTable("MedicationDoses");

        builder.Entity<MedicationDose>()
            .Property(d => d.ScheduledTime)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<MedicationDose>()
            .Property(d => d.TakenAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<PatientMedication>()
            .HasOne(m => m.CareRecipient)
            .WithMany()
            .HasForeignKey(m => m.CareRecipientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MedicationDose>()
            .HasOne(d => d.PatientMedication)
            .WithMany(m => m.Doses)
            .HasForeignKey(d => d.PatientMedicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MedicationDose>()
            .HasOne(d => d.TakenByUser)
            .WithMany()
            .HasForeignKey(d => d.TakenByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<MedicationInventoryTransaction>().ToTable("MedicationInventoryTransactions");
        builder.Entity<MedicationInventoryTransaction>()
            .HasOne(t => t.PatientMedication)
            .WithMany(m => m.InventoryTransactions)
            .HasForeignKey(t => t.PatientMedicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MedicationInventoryTransaction>()
            .HasOne(t => t.PerformedByUser)
            .WithMany()
            .HasForeignKey(t => t.PerformedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<MedicationAlertHistory>().ToTable("MedicationAlertHistories");
        builder.Entity<MedicationAlertHistory>()
            .Property(h => h.CreatedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<MedicationAlertHistory>()
            .HasOne(h => h.PatientMedication)
            .WithMany(m => m.AlertHistories)
            .HasForeignKey(h => h.PatientMedicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MedicationAlertHistory>()
            .HasOne(h => h.CareRecipient)
            .WithMany()
            .HasForeignKey(h => h.CareRecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<MedicationAlertHistory>()
            .HasOne(h => h.RecipientUser)
            .WithMany()
            .HasForeignKey(h => h.RecipientUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // Patient Profile Configurations
        builder.Entity<PatientProfile>().ToTable("PatientProfiles");
        builder.Entity<Address>().ToTable("Addresses");
        builder.Entity<EmergencyContact>().ToTable("EmergencyContacts");
        builder.Entity<MedicalHistory>().ToTable("MedicalHistories");
        builder.Entity<Allergy>().ToTable("Allergies");
        builder.Entity<ElderlyAssessment>().ToTable("ElderlyAssessments");
        builder.Entity<UploadedDocument>().ToTable("UploadedDocuments");

        builder.Entity<PatientProfile>()
            .HasOne(p => p.User)
            .WithOne(u => u.PatientProfile)
            .HasForeignKey<PatientProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PatientProfile>()
            .HasOne(p => p.Address)
            .WithOne(a => a.PatientProfile)
            .HasForeignKey<Address>(a => a.PatientProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PatientProfile>()
            .HasOne(p => p.EmergencyContact)
            .WithOne(e => e.PatientProfile)
            .HasForeignKey<EmergencyContact>(e => e.PatientProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PatientProfile>()
            .HasOne(p => p.MedicalHistory)
            .WithOne(m => m.PatientProfile)
            .HasForeignKey<MedicalHistory>(m => m.PatientProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<PatientProfile>()
            .HasOne(p => p.ElderlyAssessment)
            .WithOne(e => e.PatientProfile)
            .HasForeignKey<ElderlyAssessment>(e => e.PatientProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Allergy>()
            .HasOne(a => a.PatientProfile)
            .WithMany(p => p.Allergies)
            .HasForeignKey(a => a.PatientProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UploadedDocument>()
            .HasOne(d => d.PatientProfile)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.PatientProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<UploadedDocument>()
            .Property(d => d.DocumentType)
            .HasMaxLength(100);

        builder.Entity<UploadedDocument>()
            .HasIndex(d => new { d.PatientProfileId, d.DocumentType })
            .IsUnique()
            .HasFilter("\"DocumentType\" IS NOT NULL");
    }
}
