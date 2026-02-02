using System;

namespace Salmandyar.Domain.Entities
{
    public class ServiceReminder
    {
        public int Id { get; set; }

        public int CareRecipientId { get; set; }
        public CareRecipient CareRecipient { get; set; }

        public int ServiceDefinitionId { get; set; }
        public ServiceDefinition ServiceDefinition { get; set; }

        public DateTime ScheduledTime { get; set; }
        public string Note { get; set; }

        // Notification Settings
        public bool NotifyPatient { get; set; }
        public bool NotifyAdmin { get; set; }
        public bool NotifySupervisor { get; set; }

        // Status
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
        public string? FailureReason { get; set; }
        
        // Audit
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}