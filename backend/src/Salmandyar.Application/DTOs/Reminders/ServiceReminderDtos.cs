namespace Salmandyar.Application.DTOs.Reminders
{
    public class ServiceReminderDto
    {
        public int Id { get; set; }
        public int CareRecipientId { get; set; }
        public int ServiceDefinitionId { get; set; }
        public string ServiceTitle { get; set; }
        public DateTime ScheduledTime { get; set; }
        public string Note { get; set; }
        public bool IsSent { get; set; }
        public DateTime? SentAt { get; set; }
        
        public bool NotifyPatient { get; set; }
        public bool NotifyAdmin { get; set; }
        public bool NotifySupervisor { get; set; }
    }

    public class CreateServiceReminderDto
    {
        public int CareRecipientId { get; set; }
        public int ServiceDefinitionId { get; set; }
        public DateTime ScheduledTime { get; set; }
        public string Note { get; set; }
        public bool NotifyPatient { get; set; }
        public bool NotifyAdmin { get; set; }
        public bool NotifySupervisor { get; set; }
    }

    public class UpdateServiceReminderDto
    {
        public int ServiceDefinitionId { get; set; }
        public DateTime ScheduledTime { get; set; }
        public string Note { get; set; }
        public bool NotifyPatient { get; set; }
        public bool NotifyAdmin { get; set; }
        public bool NotifySupervisor { get; set; }
    }
}