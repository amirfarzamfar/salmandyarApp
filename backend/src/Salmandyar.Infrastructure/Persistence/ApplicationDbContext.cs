using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Entities.GuestRequests;
using Salmandyar.Domain.Entities.HomeCare;
using Salmandyar.Domain.Entities.UserEvaluations;
using Salmandyar.Domain.Entities.Medications;
using Salmandyar.Domain.Entities.PatientProfile;
using Salmandyar.Domain.Entities.Content;
using Salmandyar.Domain.Entities.Contracts;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<CareRecipient> CareRecipients { get; set; }
    public DbSet<LabTestCategory> LabTestCategories { get; set; }
    public DbSet<LabTestDefinition> LabTestDefinitions { get; set; }
    public DbSet<PatientLabReport> PatientLabReports { get; set; }
    public DbSet<PatientLabResult> PatientLabResults { get; set; }
    public DbSet<CaregiverProfile> CaregiverProfiles { get; set; }
    public DbSet<CaregiverProfileDocument> CaregiverProfileDocuments { get; set; }
    public DbSet<VitalSign> VitalSigns { get; set; }
    public DbSet<CareService> CareServices { get; set; }
    public DbSet<ServiceDefinition> ServiceDefinitions { get; set; }
    public DbSet<ServiceActivityLog> ServiceActivityLogs { get; set; }
    public DbSet<ServiceAssignmentHistory> ServiceAssignmentHistories { get; set; }
    public DbSet<ServiceNotificationRecord> ServiceNotificationRecords { get; set; }
    public DbSet<ServiceSchedule> ServiceSchedules { get; set; }
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

    // Collaboration Contracts Module
    public DbSet<ContractTemplate> ContractTemplates { get; set; }
    public DbSet<ContractField> ContractFields { get; set; }
    public DbSet<ContractAssignment> ContractAssignments { get; set; }
    public DbSet<ContractFieldValue> ContractFieldValues { get; set; }
    public DbSet<ContractSigningAuditLog> ContractSigningAuditLogs { get; set; }

    // Medication Module
    public DbSet<PatientMedication> PatientMedications { get; set; }
    public DbSet<MedicationDose> MedicationDoses { get; set; }
    public DbSet<MedicationDoseStatusHistory> MedicationDoseStatusHistories { get; set; }
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

    // Home Care Request Module
    public DbSet<HomeCareRequest> HomeCareRequests { get; set; }
    public DbSet<HomeCareRequestAttachment> HomeCareRequestAttachments { get; set; }
    public DbSet<HomeCareRequestTimelineEvent> HomeCareRequestTimelineEvents { get; set; }
    public DbSet<HomeCareConversation> HomeCareConversations { get; set; }
    public DbSet<HomeCareConversationParticipant> HomeCareConversationParticipants { get; set; }
    public DbSet<HomeCareMessage> HomeCareMessages { get; set; }
    public DbSet<HomeCareMessageAttachment> HomeCareMessageAttachments { get; set; }

    // Guest Service Request Module
    public DbSet<GuestServiceRequest> GuestServiceRequests { get; set; }
    public DbSet<GuestServiceRequestTimelineEvent> GuestServiceRequestTimelineEvents { get; set; }
    public DbSet<GuestContactLog> GuestContactLogs { get; set; }
    public DbSet<GuestFollowUp> GuestFollowUps { get; set; }

    // Content Platform Module (SEO / Article / Blog / Medical Content)
    public DbSet<Author> Authors { get; set; }
    public DbSet<ContentCategory> ContentCategories { get; set; }
    public DbSet<ContentTag> ContentTags { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<ArticleTag> ArticleTags { get; set; }
    public DbSet<ArticleMedicalReview> ArticleMedicalReviews { get; set; }
    public DbSet<ArticleSource> ArticleSources { get; set; }
    public DbSet<FAQ> FAQs { get; set; }
    public DbSet<InternalLink> InternalLinks { get; set; }
    public DbSet<Disease> Diseases { get; set; }
    public DbSet<Guide> Guides { get; set; }
    public DbSet<HealthTool> HealthTools { get; set; }
    public DbSet<City> Cities { get; set; }
    public DbSet<CityService> CityServices { get; set; }
    public DbSet<ServiceSeoProfile> ServiceSeoProfiles { get; set; }
    public DbSet<ServiceBenefit> ServiceBenefits { get; set; }
    public DbSet<ServiceTargetPatient> ServiceTargetPatients { get; set; }
    public DbSet<ServiceCoverageArea> ServiceCoverageAreas { get; set; }
    public DbSet<ServiceTestimonial> ServiceTestimonials { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        LabModelConfiguration.Configure(builder);
        
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
        builder.Entity<CaregiverProfileDocument>().ToTable("CaregiverProfileDocuments");
        builder.Entity<CareService>().ToTable("CareServices");
        builder.Entity<ServiceDefinition>().ToTable("ServiceDefinitions");
        builder.Entity<ServiceActivityLog>().ToTable("ServiceActivityLogs");
        builder.Entity<ServiceAssignmentHistory>().ToTable("ServiceAssignmentHistories");
        builder.Entity<ServiceNotificationRecord>().ToTable("ServiceNotificationRecords");
        builder.Entity<ServiceSchedule>().ToTable("ServiceSchedules");
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

        builder.Entity<VitalSign>()
            .Property(v => v.BloodSugarMeasurementType)
            .HasConversion<string>();

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

        builder.Entity<CaregiverProfile>()
            .HasIndex(c => c.UserId)
            .IsUnique();

        builder.Entity<CaregiverProfile>()
            .HasIndex(c => c.NationalCode)
            .IsUnique();

        builder.Entity<CaregiverProfile>()
            .Property(c => c.EmploymentStatus)
            .HasConversion<string>();

        builder.Entity<CaregiverProfile>()
            .Property(c => c.GPA)
            .HasPrecision(4, 2);

        builder.Entity<CaregiverProfileDocument>()
            .HasOne(d => d.CaregiverProfile)
            .WithMany(p => p.Documents)
            .HasForeignKey(d => d.CaregiverProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<CaregiverProfileDocument>()
            .HasIndex(d => new { d.CaregiverProfileId, d.DocumentType })
            .IsUnique();

        builder.Entity<CaregiverProfileDocument>()
            .Property(d => d.Status)
            .HasConversion<string>();

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

        builder.Entity<ServiceDefinition>()
            .HasIndex(s => s.Code)
            .IsUnique();

        builder.Entity<ServiceDefinition>()
            .HasOne(s => s.DefaultForm)
            .WithMany()
            .HasForeignKey(s => s.DefaultFormId)
            .OnDelete(DeleteBehavior.SetNull);

        // ===== Patient Service Management Configs =====
        builder.Entity<CareService>()
            .Property(s => s.Status)
            .HasConversion<int>();

        builder.Entity<CareService>()
            .Property(s => s.Priority)
            .HasConversion<int>();

        builder.Entity<CareService>()
            .Property(s => s.LocationType)
            .HasConversion<int>();

        builder.Entity<CareService>()
            .Property(s => s.AssignmentStatus)
            .HasConversion<int>();

        builder.Entity<CareService>()
            .Property(s => s.NotificationStatus)
            .HasConversion<int>();

        builder.Entity<CareService>()
            .Property(s => s.ScheduledDate)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<CareService>()
            .Property(s => s.ActualStartTime)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<CareService>()
            .Property(s => s.ActualEndTime)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<CareService>()
            .Property(s => s.AssignedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<CareService>()
            .Property(s => s.NotificationSentAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<CareService>()
            .Property(s => s.CreatedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<CareService>()
            .Property(s => s.UpdatedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<CareService>()
            .HasOne(s => s.ParentSchedule)
            .WithMany(sc => sc.GeneratedServices)
            .HasForeignKey(s => s.ParentScheduleId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<CareService>()
            .HasOne(s => s.CreatedBy)
            .WithMany()
            .HasForeignKey(s => s.CreatedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<CareService>()
            .HasOne(s => s.UpdatedBy)
            .WithMany()
            .HasForeignKey(s => s.UpdatedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<CareService>()
            .HasOne(s => s.AssignedBy)
            .WithMany()
            .HasForeignKey(s => s.AssignedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<CareService>()
            .HasIndex(s => s.CareRecipientId);
        builder.Entity<CareService>()
            .HasIndex(s => s.ScheduledDate);
        builder.Entity<CareService>()
            .HasIndex(s => s.Status);
        builder.Entity<CareService>()
            .HasIndex(s => s.PerformerId);
        builder.Entity<CareService>()
            .HasIndex(s => new { s.ScheduledDate, s.Status });

        // Service Activity Log
        builder.Entity<ServiceActivityLog>()
            .Property(a => a.ActivityType)
            .HasConversion<int>();

        builder.Entity<ServiceActivityLog>()
            .Property(a => a.CreatedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ServiceActivityLog>()
            .HasOne(a => a.CareService)
            .WithMany(s => s.ActivityLogs)
            .HasForeignKey(a => a.CareServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ServiceActivityLog>()
            .HasOne(a => a.ActorUser)
            .WithMany()
            .HasForeignKey(a => a.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ServiceActivityLog>()
            .HasIndex(a => new { a.CareServiceId, a.CreatedAtUtc });

        // Service Assignment History
        builder.Entity<ServiceAssignmentHistory>()
            .Property(h => h.ChangedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ServiceAssignmentHistory>()
            .HasOne(h => h.CareService)
            .WithMany(s => s.AssignmentHistories)
            .HasForeignKey(h => h.CareServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ServiceAssignmentHistory>()
            .HasOne(h => h.PreviousProvider)
            .WithMany()
            .HasForeignKey(h => h.PreviousProviderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ServiceAssignmentHistory>()
            .HasOne(h => h.NewProvider)
            .WithMany()
            .HasForeignKey(h => h.NewProviderId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ServiceAssignmentHistory>()
            .HasOne(h => h.ChangedBy)
            .WithMany()
            .HasForeignKey(h => h.ChangedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ServiceAssignmentHistory>()
            .HasIndex(h => new { h.CareServiceId, h.ChangedAtUtc });

        // Service Notification Record
        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.RecipientType)
            .HasConversion<int>();

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.Channel)
            .HasConversion<int>();

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.Status)
            .HasConversion<int>();

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.ScheduledSendAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.SentAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.DeliveredAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.ReadAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.FailedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ServiceNotificationRecord>()
            .Property(n => n.CreatedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ServiceNotificationRecord>()
            .HasOne(n => n.CareService)
            .WithMany(s => s.Notifications)
            .HasForeignKey(n => n.CareServiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ServiceNotificationRecord>()
            .HasOne(n => n.RecipientUser)
            .WithMany()
            .HasForeignKey(n => n.RecipientUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ServiceNotificationRecord>()
            .HasOne(n => n.CreatedBy)
            .WithMany()
            .HasForeignKey(n => n.CreatedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ServiceNotificationRecord>()
            .HasIndex(n => new { n.CareServiceId, n.Status });
        builder.Entity<ServiceNotificationRecord>()
            .HasIndex(n => n.RecipientUserId);

        // Service Schedule
        builder.Entity<ServiceSchedule>()
            .Property(s => s.StartDate)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ServiceSchedule>()
            .Property(s => s.EndDate)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ServiceSchedule>()
            .Property(s => s.RecurrenceType)
            .HasConversion<int>();

        builder.Entity<ServiceSchedule>()
            .Property(s => s.Priority)
            .HasConversion<int>();

        builder.Entity<ServiceSchedule>()
            .Property(s => s.LocationType)
            .HasConversion<int>();

        builder.Entity<ServiceSchedule>()
            .Property(s => s.CreatedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ServiceSchedule>()
            .Property(s => s.UpdatedAtUtc)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ServiceSchedule>()
            .Property(s => s.WeekDays)
            .HasConversion(
                v => v == null ? null : string.Join(',', v),
                v => string.IsNullOrWhiteSpace(v) ? null : v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

        builder.Entity<ServiceSchedule>()
            .HasOne(s => s.CareRecipient)
            .WithMany()
            .HasForeignKey(s => s.CareRecipientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ServiceSchedule>()
            .HasOne(s => s.ServiceDefinition)
            .WithMany()
            .HasForeignKey(s => s.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ServiceSchedule>()
            .HasOne(s => s.CreatedBy)
            .WithMany()
            .HasForeignKey(s => s.CreatedById)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ServiceSchedule>()
            .HasOne(s => s.UpdatedBy)
            .WithMany()
            .HasForeignKey(s => s.UpdatedById)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ServiceSchedule>()
            .HasIndex(s => s.CareRecipientId);
        builder.Entity<ServiceSchedule>()
            .HasIndex(s => new { s.StartDate, s.IsActive });

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

        builder.Entity<AssessmentForm>()
            .Property(f => f.Workflow)
            .HasConversion<string>();

        builder.Entity<AssessmentForm>()
            .HasIndex(f => f.Code)
            .IsUnique();

        builder.Entity<AssessmentForm>()
            .HasIndex(f => new { f.Workflow, f.Type, f.IsActive });

        builder.Entity<AssessmentForm>()
            .HasOne(f => f.ServiceDefinition)
            .WithMany()
            .HasForeignKey(f => f.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.SetNull);

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
            .WithMany(f => f.Submissions)
            .HasForeignKey(s => s.FormId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<AssessmentSubmission>()
            .Property(s => s.Status)
            .HasConversion<string>();

        builder.Entity<QuestionAnswer>()
            .HasOne(a => a.Submission)
            .WithMany(s => s.Answers)
            .HasForeignKey(a => a.SubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Home Care Request Module Configurations
        builder.Entity<HomeCareRequest>().ToTable("HomeCareRequests");
        builder.Entity<HomeCareRequestAttachment>().ToTable("HomeCareRequestAttachments");
        builder.Entity<HomeCareRequestTimelineEvent>().ToTable("HomeCareRequestTimelineEvents");
        builder.Entity<HomeCareConversation>().ToTable("HomeCareConversations");
        builder.Entity<HomeCareConversationParticipant>().ToTable("HomeCareConversationParticipants");
        builder.Entity<HomeCareMessage>().ToTable("HomeCareMessages");
        builder.Entity<HomeCareMessageAttachment>().ToTable("HomeCareMessageAttachments");

        builder.Entity<HomeCareRequest>()
            .Property(r => r.Status)
            .HasConversion<string>();

        builder.Entity<HomeCareRequest>()
            .Property(r => r.Priority)
            .HasConversion<string>();

        builder.Entity<HomeCareRequest>()
            .Property(r => r.PreferredContactMethod)
            .HasConversion<string>();

        builder.Entity<HomeCareRequest>()
            .HasIndex(r => r.TrackingCode)
            .IsUnique();

        builder.Entity<HomeCareRequest>()
            .HasOne(r => r.ServiceDefinition)
            .WithMany()
            .HasForeignKey(r => r.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HomeCareRequest>()
            .HasOne(r => r.Form)
            .WithMany()
            .HasForeignKey(r => r.FormId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HomeCareRequest>()
            .HasOne(r => r.Submission)
            .WithMany()
            .HasForeignKey(r => r.SubmissionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HomeCareRequest>()
            .HasOne(r => r.RequesterUser)
            .WithMany()
            .HasForeignKey(r => r.RequesterUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HomeCareRequest>()
            .HasOne(r => r.AssignedSupervisor)
            .WithMany()
            .HasForeignKey(r => r.AssignedSupervisorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<HomeCareRequest>()
            .HasOne(r => r.AssignedCaregiver)
            .WithMany()
            .HasForeignKey(r => r.AssignedCaregiverId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<HomeCareRequest>()
            .HasOne(r => r.CareRecipient)
            .WithMany()
            .HasForeignKey(r => r.CareRecipientId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<HomeCareRequestAttachment>()
            .HasOne(a => a.Request)
            .WithMany(r => r.Attachments)
            .HasForeignKey(a => a.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<HomeCareRequestAttachment>()
            .HasOne(a => a.UploadedByUser)
            .WithMany()
            .HasForeignKey(a => a.UploadedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HomeCareRequestTimelineEvent>()
            .Property(e => e.EventType)
            .HasConversion<string>();

        builder.Entity<HomeCareRequestTimelineEvent>()
            .HasOne(e => e.Request)
            .WithMany(r => r.TimelineEvents)
            .HasForeignKey(e => e.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<HomeCareRequestTimelineEvent>()
            .HasOne(e => e.ActorUser)
            .WithMany()
            .HasForeignKey(e => e.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<HomeCareConversation>()
            .HasOne(c => c.Request)
            .WithMany(r => r.Conversations)
            .HasForeignKey(c => c.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<HomeCareConversationParticipant>()
            .HasOne(p => p.Conversation)
            .WithMany(c => c.Participants)
            .HasForeignKey(p => p.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<HomeCareConversationParticipant>()
            .HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HomeCareConversationParticipant>()
            .HasIndex(p => new { p.ConversationId, p.UserId })
            .IsUnique();

        builder.Entity<HomeCareMessage>()
            .Property(m => m.MessageType)
            .HasConversion<string>();

        builder.Entity<HomeCareMessage>()
            .HasOne(m => m.Conversation)
            .WithMany(c => c.Messages)
            .HasForeignKey(m => m.ConversationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<HomeCareMessage>()
            .HasOne(m => m.SenderUser)
            .WithMany()
            .HasForeignKey(m => m.SenderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<HomeCareMessageAttachment>()
            .HasOne(a => a.Message)
            .WithMany(m => m.Attachments)
            .HasForeignKey(a => a.MessageId)
            .OnDelete(DeleteBehavior.Cascade);

        // Guest Service Request Module Configurations
        builder.Entity<GuestServiceRequest>().ToTable("GuestServiceRequests");
        builder.Entity<GuestServiceRequestTimelineEvent>().ToTable("GuestServiceRequestTimelineEvents");
        builder.Entity<GuestContactLog>().ToTable("GuestContactLogs");
        builder.Entity<GuestFollowUp>().ToTable("GuestFollowUps");

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.Status)
            .HasConversion<string>();

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.Priority)
            .HasConversion<int>();

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.Source)
            .HasConversion<int>();

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.CreatedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.UpdatedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.ClosedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.LastContactAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.NextFollowUpAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<GuestServiceRequest>()
            .Property(r => r.ConvertedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.TrackingCode)
            .IsUnique();

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.Status);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.Priority);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.CreatedAt);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.AssignedSupervisorId);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.AssignedCaregiverId);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.NextFollowUpAt);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => r.ContactMobile);

        builder.Entity<GuestServiceRequest>()
            .HasIndex(r => new { r.Status, r.Priority, r.CreatedAt });

        builder.Entity<GuestServiceRequest>()
            .HasOne(r => r.Form)
            .WithMany()
            .HasForeignKey(r => r.FormId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<GuestServiceRequest>()
            .HasOne(r => r.Submission)
            .WithMany()
            .HasForeignKey(r => r.SubmissionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<GuestServiceRequest>()
            .HasOne(r => r.ServiceDefinition)
            .WithMany()
            .HasForeignKey(r => r.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<GuestServiceRequest>()
            .HasOne(r => r.AssignedSupervisor)
            .WithMany()
            .HasForeignKey(r => r.AssignedSupervisorId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<GuestServiceRequest>()
            .HasOne(r => r.AssignedCaregiver)
            .WithMany()
            .HasForeignKey(r => r.AssignedCaregiverId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<GuestServiceRequest>()
            .HasOne(r => r.ConvertedCareRecipient)
            .WithMany()
            .HasForeignKey(r => r.ConvertedCareRecipientId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<GuestServiceRequestTimelineEvent>()
            .Property(e => e.EventType)
            .HasConversion<string>();

        builder.Entity<GuestServiceRequestTimelineEvent>()
            .Property(e => e.OccurredAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<GuestServiceRequestTimelineEvent>()
            .HasOne(e => e.Request)
            .WithMany(r => r.TimelineEvents)
            .HasForeignKey(e => e.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<GuestServiceRequestTimelineEvent>()
            .HasOne(e => e.ActorUser)
            .WithMany()
            .HasForeignKey(e => e.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<GuestServiceRequestTimelineEvent>()
            .HasIndex(e => new { e.RequestId, e.OccurredAt });

        // ===== GuestContactLog Configs =====
        builder.Entity<GuestContactLog>()
            .Property(c => c.ContactedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<GuestContactLog>()
            .Property(c => c.CreatedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<GuestContactLog>()
            .Property(c => c.NextFollowUpSuggestedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<GuestContactLog>()
            .Property(c => c.Channel)
            .HasConversion<int>();

        builder.Entity<GuestContactLog>()
            .Property(c => c.Result)
            .HasConversion<int>();

        builder.Entity<GuestContactLog>()
            .HasOne(c => c.Request)
            .WithMany(r => r.ContactLogs)
            .HasForeignKey(c => c.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<GuestContactLog>()
            .HasOne(c => c.ActorUser)
            .WithMany()
            .HasForeignKey(c => c.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<GuestContactLog>()
            .HasIndex(c => new { c.RequestId, c.ContactedAt });

        // ===== GuestFollowUp Configs =====
        builder.Entity<GuestFollowUp>()
            .Property(f => f.ScheduledAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<GuestFollowUp>()
            .Property(f => f.Status)
            .HasConversion<int>();

        builder.Entity<GuestFollowUp>()
            .Property(f => f.CompletedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<GuestFollowUp>()
            .Property(f => f.CreatedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<GuestFollowUp>()
            .Property(f => f.UpdatedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<GuestFollowUp>()
            .HasOne(f => f.Request)
            .WithMany(r => r.FollowUps)
            .HasForeignKey(f => f.RequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<GuestFollowUp>()
            .HasOne(f => f.AssignedToUser)
            .WithMany()
            .HasForeignKey(f => f.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<GuestFollowUp>()
            .HasOne(f => f.CreatedByUser)
            .WithMany()
            .HasForeignKey(f => f.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<GuestFollowUp>()
            .HasIndex(f => new { f.RequestId, f.ScheduledAt });

        builder.Entity<GuestFollowUp>()
            .HasIndex(f => new { f.Status, f.ScheduledAt });

        builder.Entity<GuestFollowUp>()
            .HasIndex(f => f.AssignedToUserId);

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

        builder.Entity<MedicationDose>()
            .Property(d => d.AllowedConfirmationUntil)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<MedicationDose>()
            .Property(d => d.ActualAdministrationAt)
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

        builder.Entity<MedicationDose>()
            .HasOne(d => d.RecordedByUser)
            .WithMany()
            .HasForeignKey(d => d.RecordedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<MedicationDose>()
            .HasOne(d => d.VerifiedByUser)
            .WithMany()
            .HasForeignKey(d => d.VerifiedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<MedicationDose>()
            .HasOne(d => d.CorrectedByUser)
            .WithMany()
            .HasForeignKey(d => d.CorrectedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<MedicationDose>()
            .HasIndex(d => new { d.PatientMedicationId, d.ScheduledTime })
            .IsUnique();

        builder.Entity<MedicationDoseStatusHistory>().ToTable("MedicationDoseStatusHistories");

        builder.Entity<MedicationDoseStatusHistory>()
            .Property(h => h.ChangedAtUtc)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<MedicationDoseStatusHistory>()
            .HasOne(h => h.MedicationDose)
            .WithMany(d => d.StatusHistories)
            .HasForeignKey(h => h.MedicationDoseId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MedicationDoseStatusHistory>()
            .HasOne(h => h.ChangedByUser)
            .WithMany()
            .HasForeignKey(h => h.ChangedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<MedicationDoseStatusHistory>()
            .HasIndex(h => new { h.MedicationDoseId, h.ChangedAtUtc });

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

        // ============================================================
        // Content Platform Module (SEO / Medical Content) Configurations
        // ============================================================

        // Authors Table
        builder.Entity<Author>().ToTable("Authors");
        builder.Entity<Author>()
            .HasIndex(a => a.Slug)
            .IsUnique()
            .HasFilter("\"Slug\" IS NOT NULL");
        builder.Entity<Author>()
            .HasIndex(a => a.UserId)
            .IsUnique()
            .HasFilter("\"UserId\" IS NOT NULL");

        // Content Categories (Hierarchical)
        builder.Entity<ContentCategory>().ToTable("ContentCategories");
        builder.Entity<ContentCategory>()
            .HasIndex(c => c.Slug)
            .IsUnique();
        builder.Entity<ContentCategory>()
            .HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Content Tags
        builder.Entity<ContentTag>().ToTable("ContentTags");
        builder.Entity<ContentTag>()
            .HasIndex(t => t.Slug)
            .IsUnique();

        // Articles
        builder.Entity<Article>().ToTable("Articles");
        builder.Entity<Article>()
            .Property(a => a.Status)
            .HasConversion<string>();
        builder.Entity<Article>()
            .HasIndex(a => a.Slug)
            .IsUnique();
        builder.Entity<Article>()
            .HasIndex(a => new { a.Status, a.PublishedAt });
        builder.Entity<Article>()
            .HasIndex(a => a.CategoryId);
        builder.Entity<Article>()
            .HasOne(a => a.Author)
            .WithMany(a => a.AuthoredArticles)
            .HasForeignKey(a => a.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Article>()
            .HasOne(a => a.Category)
            .WithMany(c => c.Articles)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Article>()
            .HasOne(a => a.RelatedService)
            .WithMany()
            .HasForeignKey(a => a.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.SetNull);
        builder.Entity<Article>()
            .HasOne(a => a.RelatedDisease)
            .WithMany(d => d.RelatedArticles)
            .HasForeignKey(a => a.DiseaseId)
            .OnDelete(DeleteBehavior.SetNull);

        // ArticleTags (Many-to-Many join)
        builder.Entity<ArticleTag>().ToTable("ArticleTags");
        builder.Entity<ArticleTag>()
            .HasKey(at => new { at.ArticleId, at.ContentTagId });
        builder.Entity<ArticleTag>()
            .HasOne(at => at.Article)
            .WithMany(a => a.ArticleTags)
            .HasForeignKey(at => at.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<ArticleTag>()
            .HasOne(at => at.ContentTag)
            .WithMany(t => t.ArticleTags)
            .HasForeignKey(at => at.ContentTagId)
            .OnDelete(DeleteBehavior.Cascade);

        // Article Medical Reviews (E-E-A-T)
        builder.Entity<ArticleMedicalReview>().ToTable("ArticleMedicalReviews");
        builder.Entity<ArticleMedicalReview>()
            .HasOne(r => r.Article)
            .WithMany(a => a.MedicalReviews)
            .HasForeignKey(r => r.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<ArticleMedicalReview>()
            .HasOne(r => r.MedicalReviewer)
            .WithMany(a => a.MedicalReviews)
            .HasForeignKey(r => r.MedicalReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        // Article Sources (Citations)
        builder.Entity<ArticleSource>().ToTable("ArticleSources");
        builder.Entity<ArticleSource>()
            .HasOne(s => s.Article)
            .WithMany(a => a.Sources)
            .HasForeignKey(s => s.ArticleId)
            .OnDelete(DeleteBehavior.Cascade);

        // FAQ
        builder.Entity<FAQ>().ToTable("FAQs");
        builder.Entity<FAQ>()
            .Property(f => f.EntityType)
            .HasConversion<string>();
        builder.Entity<FAQ>()
            .HasIndex(f => new { f.EntityType, f.EntityId });

        // Internal Links
        builder.Entity<InternalLink>().ToTable("InternalLinks");
        builder.Entity<InternalLink>()
            .Property(l => l.SourceType)
            .HasConversion<string>();
        builder.Entity<InternalLink>()
            .Property(l => l.TargetType)
            .HasConversion<string>();
        builder.Entity<InternalLink>()
            .HasOne(l => l.SourceArticle)
            .WithMany(a => a.InternalLinksFrom)
            .HasForeignKey(l => l.SourceArticleId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<InternalLink>()
            .HasOne(l => l.TargetArticle)
            .WithMany(a => a.InternalLinksTo)
            .HasForeignKey(l => l.TargetArticleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Diseases / Medical Conditions
        builder.Entity<Disease>().ToTable("Diseases");
        builder.Entity<Disease>()
            .HasIndex(d => d.Slug)
            .IsUnique();
        builder.Entity<Disease>()
            .HasIndex(d => d.Icd10Code)
            .HasFilter("\"Icd10Code\" IS NOT NULL");
        builder.Entity<Disease>()
            .HasOne(d => d.MedicalReviewer)
            .WithMany()
            .HasForeignKey(d => d.MedicalReviewerId)
            .OnDelete(DeleteBehavior.SetNull);

        // Guides (How-to / Care Guides)
        builder.Entity<Guide>().ToTable("Guides");
        builder.Entity<Guide>()
            .HasIndex(g => g.Slug)
            .IsUnique();
        builder.Entity<Guide>()
            .HasOne(g => g.Category)
            .WithMany()
            .HasForeignKey(g => g.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.Entity<Guide>()
            .HasOne(g => g.Author)
            .WithMany()
            .HasForeignKey(g => g.AuthorId)
            .OnDelete(DeleteBehavior.SetNull);

        // Health Tools
        builder.Entity<HealthTool>().ToTable("HealthTools");
        builder.Entity<HealthTool>()
            .Property(t => t.ToolType)
            .HasConversion<string>();
        builder.Entity<HealthTool>()
            .HasIndex(t => t.Slug)
            .IsUnique();

        // Cities (Local SEO Pages)
        builder.Entity<City>().ToTable("Cities");
        builder.Entity<City>()
            .HasIndex(c => c.Slug)
            .IsUnique();
        builder.Entity<City>()
            .HasIndex(c => new { c.Province, c.Name });

        // City Services (Which services are available in each city)
        builder.Entity<CityService>().ToTable("CityServices");
        builder.Entity<CityService>()
            .HasIndex(cs => new { cs.CityId, cs.ServiceDefinitionId })
            .IsUnique();
        builder.Entity<CityService>()
            .HasOne(cs => cs.City)
            .WithMany(c => c.CityServices)
            .HasForeignKey(cs => cs.CityId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<CityService>()
            .HasOne(cs => cs.ServiceDefinition)
            .WithMany()
            .HasForeignKey(cs => cs.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Service SEO Profiles (Landing Page data for services)
        builder.Entity<ServiceSeoProfile>().ToTable("ServiceSeoProfiles");
        builder.Entity<ServiceSeoProfile>()
            .HasIndex(s => s.Slug)
            .IsUnique();
        builder.Entity<ServiceSeoProfile>()
            .HasIndex(s => s.ServiceDefinitionId)
            .IsUnique();
        builder.Entity<ServiceSeoProfile>()
            .HasOne(s => s.ServiceDefinition)
            .WithOne()
            .HasForeignKey<ServiceSeoProfile>(s => s.ServiceDefinitionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Service Benefits
        builder.Entity<ServiceBenefit>().ToTable("ServiceBenefits");
        builder.Entity<ServiceBenefit>()
            .HasOne(b => b.ServiceSeoProfile)
            .WithMany(s => s.Benefits)
            .HasForeignKey(b => b.ServiceSeoProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // Service Target Patients
        builder.Entity<ServiceTargetPatient>().ToTable("ServiceTargetPatients");
        builder.Entity<ServiceTargetPatient>()
            .HasOne(tp => tp.ServiceSeoProfile)
            .WithMany(s => s.TargetPatients)
            .HasForeignKey(tp => tp.ServiceSeoProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // Service Coverage Areas
        builder.Entity<ServiceCoverageArea>().ToTable("ServiceCoverageAreas");
        builder.Entity<ServiceCoverageArea>()
            .HasOne(ca => ca.ServiceSeoProfile)
            .WithMany(s => s.CoverageAreas)
            .HasForeignKey(ca => ca.ServiceSeoProfileId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.Entity<ServiceCoverageArea>()
            .HasOne(ca => ca.City)
            .WithMany()
            .HasForeignKey(ca => ca.CityId)
            .OnDelete(DeleteBehavior.SetNull);

        // Service Testimonials
        builder.Entity<ServiceTestimonial>().ToTable("ServiceTestimonials");
        builder.Entity<ServiceTestimonial>()
            .HasOne(t => t.ServiceSeoProfile)
            .WithMany(s => s.Testimonials)
            .HasForeignKey(t => t.ServiceSeoProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        // ============================================================
        // Collaboration Contracts Module Configurations
        // ============================================================

        builder.Entity<ContractTemplate>().ToTable("ContractTemplates");

        builder.Entity<ContractTemplate>()
            .Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(400);

        builder.Entity<ContractTemplate>()
            .Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(128);

        builder.Entity<ContractTemplate>()
            .Property(t => t.CooperationType)
            .HasMaxLength(128);

        builder.Entity<ContractTemplate>()
            .Property(t => t.ContractText)
            .IsRequired();

        builder.Entity<ContractTemplate>()
            .HasIndex(t => new { t.Code, t.Version })
            .IsUnique();

        builder.Entity<ContractTemplate>()
            .HasIndex(t => new { t.IsActive, t.EffectiveStartDate });

        builder.Entity<ContractTemplate>()
            .Property(t => t.EffectiveStartDate)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractTemplate>()
            .Property(t => t.EffectiveEndDate)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractTemplate>()
            .Property(t => t.CreatedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ContractTemplate>()
            .Property(t => t.UpdatedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractTemplate>()
            .Property(t => t.PublishedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractTemplate>()
            .HasOne(t => t.CreatedByUser)
            .WithMany()
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ContractTemplate>()
            .HasOne(t => t.UpdatedByUser)
            .WithMany()
            .HasForeignKey(t => t.UpdatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Entity<ContractTemplate>()
            .Navigation(t => t.Fields)
            .UsePropertyAccessMode(PropertyAccessMode.PreferFieldDuringConstruction);

        builder.Entity<ContractTemplate>()
            .Navigation(t => t.Assignments)
            .UsePropertyAccessMode(PropertyAccessMode.PreferFieldDuringConstruction);

        // ContractField
        builder.Entity<ContractField>().ToTable("ContractFields");

        builder.Entity<ContractField>()
            .Property(f => f.FieldKey)
            .IsRequired()
            .HasMaxLength(128);

        builder.Entity<ContractField>()
            .Property(f => f.Label)
            .IsRequired()
            .HasMaxLength(256);

        builder.Entity<ContractField>()
            .Property(f => f.Placeholder)
            .HasMaxLength(256);

        builder.Entity<ContractField>()
            .Property(f => f.DefaultValueFromProfile)
            .HasMaxLength(256);

        builder.Entity<ContractField>()
            .Property(f => f.FieldType)
            .HasConversion<int>();

        builder.Entity<ContractField>()
            .HasIndex(f => new { f.ContractTemplateId, f.FieldKey })
            .IsUnique();

        builder.Entity<ContractField>()
            .HasOne(f => f.ContractTemplate)
            .WithMany(t => t.Fields)
            .HasForeignKey(f => f.ContractTemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        // ContractAssignment
        builder.Entity<ContractAssignment>().ToTable("ContractAssignments");

        builder.Entity<ContractAssignment>()
            .Property(a => a.UserId)
            .IsRequired();

        builder.Entity<ContractAssignment>()
            .Property(a => a.ContractNumber)
            .HasMaxLength(64);

        builder.Entity<ContractAssignment>()
            .HasIndex(a => a.ContractNumber)
            .IsUnique()
            .HasFilter("\"ContractNumber\" IS NOT NULL");

        builder.Entity<ContractAssignment>()
            .Property(a => a.Status)
            .HasConversion<int>();

        builder.Entity<ContractAssignment>()
            .HasIndex(a => new { a.UserId, a.Status });

        builder.Entity<ContractAssignment>()
            .HasIndex(a => new { a.ContractTemplateId, a.Status });

        builder.Entity<ContractAssignment>()
            .Property(a => a.AssignedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ContractAssignment>()
            .Property(a => a.SubmittedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractAssignment>()
            .Property(a => a.SignedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractAssignment>()
            .Property(a => a.EmployerSignedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractAssignment>()
            .Property(a => a.StartDate)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractAssignment>()
            .Property(a => a.EndDate)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractAssignment>()
            .Property(a => a.CancellationRequestedAt)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractAssignment>()
            .HasOne(a => a.ContractTemplate)
            .WithMany(t => t.Assignments)
            .HasForeignKey(a => a.ContractTemplateId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ContractAssignment>()
            .HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ContractAssignment>()
            .HasOne(a => a.EmployerUser)
            .WithMany()
            .HasForeignKey(a => a.EmployerUserId)
            .OnDelete(DeleteBehavior.SetNull);

        // ContractFieldValue
        builder.Entity<ContractFieldValue>().ToTable("ContractFieldValues");

        builder.Entity<ContractFieldValue>()
            .Property(v => v.FieldKey)
            .IsRequired()
            .HasMaxLength(128);

        builder.Entity<ContractFieldValue>()
            .HasIndex(v => new { v.AssignmentId, v.FieldKey })
            .IsUnique();

        builder.Entity<ContractFieldValue>()
            .Property(v => v.DateValue)
            .HasConversion(
                v => v.HasValue ? v.Value.ToUniversalTime() : (DateTime?)null,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : (DateTime?)null);

        builder.Entity<ContractFieldValue>()
            .Property(v => v.NumberValue)
            .HasPrecision(18, 4);

        builder.Entity<ContractFieldValue>()
            .HasOne(v => v.Assignment)
            .WithMany(a => a.FieldValues)
            .HasForeignKey(v => v.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ContractFieldValue>()
            .HasOne(v => v.ContractField)
            .WithMany()
            .HasForeignKey(v => v.ContractFieldId)
            .OnDelete(DeleteBehavior.SetNull);

        // ContractSigningAuditLog
        builder.Entity<ContractSigningAuditLog>().ToTable("ContractSigningAuditLogs");

        builder.Entity<ContractSigningAuditLog>()
            .Property(l => l.UserId)
            .IsRequired();

        builder.Entity<ContractSigningAuditLog>()
            .Property(l => l.ActionType)
            .HasConversion<int>();

        builder.Entity<ContractSigningAuditLog>()
            .Property(l => l.PerformedAt)
            .HasConversion(v => v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        builder.Entity<ContractSigningAuditLog>()
            .Property(l => l.TransactionId)
            .IsRequired();

        builder.Entity<ContractSigningAuditLog>()
            .HasIndex(l => l.TransactionId)
            .IsUnique();

        builder.Entity<ContractSigningAuditLog>()
            .HasIndex(l => new { l.AssignmentId, l.PerformedAt });

        builder.Entity<ContractSigningAuditLog>()
            .HasOne(l => l.Assignment)
            .WithMany(a => a.AuditLogs)
            .HasForeignKey(l => l.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ContractSigningAuditLog>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed default contract template (elderly care cooperation contract)
        SeedDefaultContract(builder);
    }

    private static void SeedDefaultContract(ModelBuilder builder)
    {
        var now = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var templateId = 1;

        builder.Entity<ContractTemplate>().HasData(new ContractTemplate
        {
            Id = templateId,
            Title = "قرارداد الکترونیکی ارائه خدمات مراقبت از سالمند",
            Code = "ELDERLY_CARE_CONTRACT",
            CooperationType = "مراقبت از سالمند",
            Version = 1,
            IsActive = true,
            EffectiveStartDate = now,
            CreatedAt = now,
            PublishedAt = now,
            ContractText = DefaultContractText
        });

        var fields = new List<ContractField>
        {
            new() { Id = 1, ContractTemplateId = templateId, Order = 1, FieldKey = "fullName", Label = "نام و نام خانوادگی", FieldType = ContractFieldType.Text, IsRequired = true, DefaultValueFromProfile = "User.FirstName+LastName" },
            new() { Id = 2, ContractTemplateId = templateId, Order = 2, FieldKey = "nationalCode", Label = "کد ملی", FieldType = ContractFieldType.Text, IsRequired = true, DefaultValueFromProfile = "CaregiverProfile.NationalCode" },
            new() { Id = 3, ContractTemplateId = templateId, Order = 3, FieldKey = "phoneNumber", Label = "شماره تماس", FieldType = ContractFieldType.Text, IsRequired = true, DefaultValueFromProfile = "User.PhoneNumber" },
            new() { Id = 4, ContractTemplateId = templateId, Order = 4, FieldKey = "address", Label = "آدرس سکونت", FieldType = ContractFieldType.TextArea, IsRequired = false, DefaultValueFromProfile = "CaregiverProfile.Address" },
            new() { Id = 5, ContractTemplateId = templateId, Order = 5, FieldKey = "iban", Label = "شماره شبا (IR)", FieldType = ContractFieldType.Text, IsRequired = false, DefaultValueFromProfile = "CaregiverProfile.Iban" },
            new() { Id = 6, ContractTemplateId = templateId, Order = 6, FieldKey = "cooperationType", Label = "نوع همکاری", FieldType = ContractFieldType.Select, IsRequired = true, DefaultValueFromProfile = "CaregiverProfile.CooperationType",
                OptionsJson = "[\"تمام‌وقت\",\"نیمه‌وقت\",\"شیفتی\",\"فوق‌العاده\",\"حضوری ماهانه\"]" },
            new() { Id = 7, ContractTemplateId = templateId, Order = 7, FieldKey = "startDate", Label = "تاریخ شروع همکاری", FieldType = ContractFieldType.Date, IsRequired = true, DefaultValueFromProfile = "CaregiverProfile.EmploymentStartDate" },
            new() { Id = 8, ContractTemplateId = templateId, Order = 8, FieldKey = "endDate", Label = "تاریخ پایان همکاری (اختیاری)", FieldType = ContractFieldType.Date, IsRequired = false },
            new() { Id = 9, ContractTemplateId = templateId, Order = 9, FieldKey = "monthlySalary", Label = "حقوق ماهانه (تومان)", FieldType = ContractFieldType.Number, IsRequired = false },
            new() { Id = 10, ContractTemplateId = templateId, Order = 10, FieldKey = "workShift", Label = "شیفت کاری", FieldType = ContractFieldType.Select, IsRequired = false,
                OptionsJson = "[\"صبح\",\"عصر\",\"شب\",\"24 ساعته\",\"طبق برنامه هفتگی\"]" },
            new() { Id = 11, ContractTemplateId = templateId, Order = 11, FieldKey = "elderlyFullName", Label = "نام و نام خانوادگی سالمند تحت پوشش", FieldType = ContractFieldType.Text, IsRequired = false },
            new() { Id = 12, ContractTemplateId = templateId, Order = 12, FieldKey = "serviceCity", Label = "شهر محل خدمت", FieldType = ContractFieldType.Text, IsRequired = false },
            new() { Id = 13, ContractTemplateId = templateId, Order = 13, FieldKey = "emergencyContact", Label = "شماره تماس اضطراری", FieldType = ContractFieldType.Text, IsRequired = false, DefaultValueFromProfile = "CaregiverProfile.EmergencyPhone" },
            new() { Id = 14, ContractTemplateId = templateId, Order = 14, FieldKey = "bankAccountOwner", Label = "نام صاحب حساب", FieldType = ContractFieldType.Text, IsRequired = false, DefaultValueFromProfile = "User.FirstName+LastName" },
        };

        builder.Entity<ContractField>().HasData(fields);
    }

    private const string DefaultContractText = @"
<h2 class=""contract-title"">قرارداد الکترونیکی ارائه خدمات مراقبت از سالمند</h2>
<p class=""contract-meta""><strong>شماره قرارداد:</strong> {{contractNumber}} &nbsp;|&nbsp; <strong>نسخه قرارداد:</strong> {{templateVersion}} &nbsp;|&nbsp; <strong>تاریخ انعقاد:</strong> {{signDate}}</p>

<h3 class=""contract-clause-title"">ماده ۱ – طرفین قرارداد</h3>
<p>این قرارداد در تاریخ {{startDate}} بین دو طرف زیر منعقد گردیده است:</p>
<p><strong>۱-۱ کارفرما (طرف اول):</strong> سازمان یا مجموعه ارائه‌دهنده خدمات در منزل سالمندیار، که در ادامه با عنوان «کارفرما» نامیده خواهد شد.</p>
<p><strong>۱-۲ پرستار / مراقب سالمند (طرف دوم):</strong> آقای/خانم <strong>{{fullName}}</strong> دارای کد ملی <strong>{{nationalCode}}</strong> و شماره تماس <strong>{{phoneNumber}}</strong> که در ادامه با عنوان «مراقب» نامیده خواهد شد و ساکن {{address}} می‌باشد.</p>

<h3 class=""contract-clause-title"">ماده ۲ – موضوع قرارداد</h3>
<p>طرف اول به موجب این قرارداد، انجام خدمات مراقبت و نگهداری از سالمند «{{elderlyFullName}}» در شهر «{{serviceCity}}» را به طرف دوم محول می‌نماید و طرف دوم نیز تعهد می‌نماید مطابق با مهارت‌ها و مدارک ارائه شده از سوی خود، به نحو احسن خدمات مقرر در این قرارداد را از تاریخ {{startDate}} ارائه نماید. نوع همکاری طرفین به شکل <strong>{{cooperationType}}</strong> و در شیفت کاری «{{workShift}}» می‌باشد.</p>

<h3 class=""contract-clause-title"">ماده ۳ – مدت قرارداد</h3>
<p>۳-۱ مدت این قرارداد از تاریخ {{startDate}} شروع شده و در تاریخ {{endDate}} به پایان می‌رسد؛ در صورتی که تاریخ پایان قرارداد ذکر نشده باشد، مدت قرارداد نامحدود در نظر گرفته شده و هر یک از طرفین می‌توانند با رعایت ماده ۱۳ قرارداد، آن را فسخ نمایند.</p>
<p>۳-۲ تمدید قرارداد به صورت ضمنی در صورتی که هیچ‌یک از طرفین تا ۱۵ روز قبل از تاریخ پایان، إلغای قرارداد را کتباً به طرف دیگر اعلام ننماید، به مدت مشابه تمدید خواهد شد.</p>

<h3 class=""contract-clause-title"">ماده ۴ – ساعات کاری و تعطیلات</h3>
<p>۴-۱ ساعت کاری روزانه مراقب طبق شیفت «{{workShift}}» و بر اساس برنامه ارائه شده از سوی کارفرما به طول انجامید خواهد شد.</p>
<p>۴-۲ مراقب دارای یک روز مرخصی هفتگی در طول هفته خواهد بود و تعیین روز مرخصی با تنبیع به نیاز سالمند و هماهنگی با کارفرما انجام خواهد شد.</p>
<p>۴-۳ ساعات اضافه و کار در روزهای تعطیل رسمی طبق قانون کار مصوب جمهوری اسلامی ایران محاسبه و تسویه خواهد شد.</p>

<h3 class=""contract-clause-title"">ماده ۵ – مبلغ و نحوه پرداخت حق‌الزحمه</h3>
<p>۵-۱ حق‌الزحمه ماهانه طرف دوم به مبلغ <strong>{{monthlySalary}}</strong> تومان به توافق طرفین می‌رسد و کارفرما متعهد می‌گردد مبلغ مقرر را حداکثر تا پایان روز پنجم هر ماه شمسی به شماره شبا «{{iban}}» به نام «{{bankAccountOwner}}» واریز نماید.</p>
<p>۵-۲ در صورت همکاری شیفتی یا ساعت‌ای، مبلغ مورد توافق طبق شیفت‌ها و در پایان هر هفته با طرف دوم تسویه خواهد شد.</p>
<p>۵-۳ حق مسکن، حق خواروبار، سهم بیمه، و مزایای جانبی طبق ضمائم قرارداد و قوانین کشور الزامی خواهد بود.</p>

<h3 class=""contract-clause-title"">ماده ۶ – وظایف و تعهدات مراقب سالمند</h3>
<p>مراقب متعهد است طی مدت اعتبار قرارداد:</p>
<p>۶-۱ به نحوه‌ای صادقانه و مطابق با قوانین اخلاقی حرفه‌ای و استانداردهای روز جهانی مراقبت از سالمند، کلیه امور مراقبتی سالمند را از خوراک، دارو، بهداشت شخصی، پیاده‌روی، پزشکی و تماس‌های پزشکی، همراهی در مراجعه و… به نحو احسن انجام دهد.</p>
<p>۶-۲ ساعات حضور خود را مطابق برنامه‌ریزی اعلامی رعایت کرده و در موارد غیبت یا تأخیر، حداقل ۲۴ ساعت زودتر آن را به کارفرما و جانشین تعیین‌شده اطلاع دهد.</p>
<p>۶-۳ در تمامی ساعات کاری از وسایل ارتباطی (تلفن همراه) فقط برای موارد ضروری مرتبط با وظیفه استفاده نموده و موبایل را در زمان‌های استراحت استفاده کند.</p>
<p>۶-۴ هرگونه مشکل جسمی، روانی یا رفتاری سالمند را بلافاصله به خانواده و در موارد حاد به مرکز درمانی و اورژانس اطلاع دهد.</p>
<p>۶-۵ هیچگونه مواد مخدر، نوشیدنی الکلی، دخانیات را در محوطه خانه مصرف ننماید و از افرادی که تأییدیه کارفرما را ندارند در محیط حضور ندهد.</p>
<p>۶-۶ اموال سالمند و خانواده را به دقت حفظ نماید و از ورود به قسمت‌های خصوصی خانه که مرتبط با وظیفه خود نمی‌باشد، خودداری نماید.</p>
<p>۶-۷ از ارائه هرگونه توصیه دارویی، تشخیص پزشکی و یا اقدام درمانی فراتر از توان و مدرک رسمی خود، خودداری نماید.</p>

<h3 class=""contract-clause-title"">ماده ۷ – وظایف و تعهدات کارفرما</h3>
<p>کارفرما متعهد است:</p>
<p>۷-۱ مبلغ قراردادی را در زمان مقرر و به‌موقع به حساب مراقب واریز نماید.</p>
<p>۷-۲ محیط کار سالم، امن و بهداشتی را برای مراقب فراهم نماید و در صورت اقامت در محل، تسهیلات مورد نیاز شامل اتاق مناسب و غذا را تأمین کند.</p>
<p>۷-۳ وسایل و ملزومات مراقبت شامل پوشاک یکبارمصرف، دستکش، ماسک، ملزومات بهداشت فردی سالمند و داروهای روزانه را به‌موقع تأمین نماید.</p>
<p>۷-۴ در مواقع اضطراری و بحرانی شامل تشدید بیماری، تصادف و… همکاری لازم با مراقب را نموده و شماره تماس‌های اضطراری و نزدیکان سالمند را در دسترس همیشه قرار دهد.</p>
<p>۷-۵ حقوق کارگری، بیمه خدمات درمانی، بیمه اجتماعی و سایر مزایای قانونی طبق قوانین مصوب کشور برای مراقب را رعایت نماید.</p>

<h3 class=""contract-clause-title"">ماده ۸ – تعهد محرمانگی اطلاعات</h3>
<p>مراقب با قبول این قرارداد متعهد می‌گردد کلیه اطلاعات فردی، پزشکی، مالی و خانوادگی سالمند و خانواده که در حین انجام وظیفه به دست می‌آورد را کاملاً محرمانه تلقی کند و بدون تأیید کتبی کارفرما در اختیار هیچ شخص ثالثی قرار ندهد. این تعهد پس از پایان قرارداد نیز دارای اعتبار کامل خواهد بود.</p>

<h3 class=""contract-clause-title"">ماده ۹ – بیمه و مسئولیت‌ها</h3>
<p>۹-۱ در صورت بروز هرگونه حادثه یا آسیب جسمی یا مالی برای سالمند ناشی از قصور و غفلت اثبات‌شده مراقب، مراقب مسئول جبران خسارت می‌باشد.</p>
<p>۹-۲ کارفرما می‌تواند به اختیار خود بیمه مسئولیت مدنی حرفه‌ای برای مراقب تهیه نماید و در صورت بروز هرگونه خسارت، شرکت بیمه واسطه خواهد بود.</p>

<h3 class=""contract-clause-title"">ماده ۱۰ – شرایط اضطراری و تماس‌های فوری</h3>
<p>۱۰-۱ شماره تماس اضطراری مراقب: «{{emergencyContact}}» و سایر شماره‌های نزدیکان در پرونده سالمند ثبت خواهد شد.</p>
<p>۱۰-۲ در موارد سکته، ایست قلبی، سقوط از پله، خونریزی شدید و… مراقب موظف است بلافاصله با شماره ۱۱۵ تماس گرفته و در همان زمان خانواده سالمند را در جریان قرار دهد و اقدامات احیای اولیه را طبق استاندارد انجام دهد.</p>

<h3 class=""contract-clause-title"">ماده ۱۱ – عدم واگذاری خدمات</h3>
<p>مراقب متعهد است که خدمات موضوع این قرارداد را به شخص ثالثی واگذار نکند و در موارد غیبت یا بیماری فرد جانشین تأییدشده از سوی کارفرما را معرفی نماید. واگذاری غیرمجاز خدمات موجب فسخ فوری قرارداد از سوی کارفرما خواهد بود.</p>

<h3 class=""contract-clause-title"">ماده ۱۲ – حل اختلاف‌ها</h3>
<p>۱۲-۱ هرگونه اختلاف و یا مغایرت در مورد تفسیر مواد قرارداد، در مرحله اول با توافق و مذاکره دو طرف حل خواهد شد.</p>
<p>۱۲-۲ در صورت عدم توافق، موضوع به داور دبیرخانه داوران صلح قضائیه شهرستان ارجاع داده خواهد شد و در صورت ناموفق بودن، مراجع قضایی صلاحیت‌دار صالح رسیدگی خواهند بود.</p>

<h3 class=""contract-clause-title"">ماده ۱۳ – شرایط فسخ قرارداد</h3>
<p>۱۳-۱ هر یک از طرفین می‌توانند با ارسال پیامک رسمی یا ایمیل تاییدشده، حداقل ۱۵ روز قبل از تاریخ مطلوب، فسخ قرارداد را اعلام نمایند.</p>
<p>۱۳-۲ در موارد نقض فاحش تعهدات شامل نقض مواد ۶، ۸، ۱۱ قرارداد، کارفرما حق فسخ فوری قرارداد را بدون پرداخت خسارت خواهد داشت.</p>
<p>۱۳-۳ در صورت فسخ قرارداد از سوی کارفرما بدون دلیل مشروع، حقوق یک ماه کامل به عنوان خسارت تاخیر به مراقب پرداخت می‌شود.</p>

<h3 class=""contract-clause-title"">ماده ۱۴ – توافق و ضمائم</h3>
<p>۱۴-۱ کلیه ضمائم قرارداد اعم از برنامه‌ریزی روزانه، فهرست داروها، مشخصات کامل سالمند، لیست تماس‌ها و … جزء لاینفک این قرارداد محسوب می‌گردند.</p>
<p>۱۴-۲ هرگونه تغییر و اصلاح در مواد قرارداد تنها به صورت کتبی و با امضای الکترونیکی یا کتبی طرفین معتبر خواهد بود.</p>
<p>۱۴-۳ طرفین اعلام می‌دارند که صلاحیت کامل جهت انعقاد این قرارداد را دارند و کلیه موارد فوق را مطالعه نموده و مورد تأیید قرار داده‌اند.</p>

<h3 class=""contract-clause-title"">ماده ۱۵ – امضا</h3>
<p>با توجه به اینکه طرفین کلیه مواد ۱ تا ۱۴ را مطالعه و تأیید نموده‌اند، لذا این قرارداد با حفظ تمام مصادیق در نسخه الکترونیکی در پرونده طرفین و سامانه سالمندیار ذخیره شده و دارای اعتبار قانونی برابر با نسخه کتبی می‌باشد.</p>
<div class=""contract-signatures"">
    <div class=""sig-block"">
        <p><strong>امضای الکترونیکی کارفرما:</strong></p>
        <p>در صورت امضای الکترونیکی در آینده در این قسمت ثبت خواهد شد.</p>
        <p>تاریخ: {{employerSignDate}}</p>
    </div>
    <div class=""sig-block"">
        <p><strong>امضای الکترونیکی مراقب:</strong> {{fullName}}</p>
        <p>کد ملی: {{nationalCode}}</p>
        <p>شماره تماس: {{phoneNumber}}</p>
        <p>تاریخ امضا: {{signDate}}</p>
        <p>شناسه تراکنش: {{transactionId}}</p>
        <p>امضای دیجیتال (هش): {{contentHash}}</p>
    </div>
</div>
";
}
