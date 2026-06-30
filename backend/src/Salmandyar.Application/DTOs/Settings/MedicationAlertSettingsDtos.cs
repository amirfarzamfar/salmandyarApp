namespace Salmandyar.Application.DTOs.Settings
{
    public class MedicationAlertSettingsDto
    {
        public int AllowEarlyConfirmationMinutes { get; set; }
        public int AllowLateConfirmationMinutes { get; set; }
        public string SmsTemplate { get; set; } = string.Empty;
        public string EmailSubjectTemplate { get; set; } = string.Empty;
        public string EmailBodyTemplate { get; set; } = string.Empty;
        public string InAppTemplate { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateMedicationAlertSettingsDto
    {
        public int AllowEarlyConfirmationMinutes { get; set; } = 30;
        public int AllowLateConfirmationMinutes { get; set; } = 120;
        public string SmsTemplate { get; set; } = string.Empty;
        public string EmailSubjectTemplate { get; set; } = string.Empty;
        public string EmailBodyTemplate { get; set; } = string.Empty;
        public string InAppTemplate { get; set; } = string.Empty;
    }
}
