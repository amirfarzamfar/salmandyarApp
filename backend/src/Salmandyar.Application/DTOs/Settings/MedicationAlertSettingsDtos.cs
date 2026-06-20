namespace Salmandyar.Application.DTOs.Settings
{
    public class MedicationAlertSettingsDto
    {
        public string SmsTemplate { get; set; } = string.Empty;
        public string EmailSubjectTemplate { get; set; } = string.Empty;
        public string EmailBodyTemplate { get; set; } = string.Empty;
        public string InAppTemplate { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateMedicationAlertSettingsDto
    {
        public string SmsTemplate { get; set; } = string.Empty;
        public string EmailSubjectTemplate { get; set; } = string.Empty;
        public string EmailBodyTemplate { get; set; } = string.Empty;
        public string InAppTemplate { get; set; } = string.Empty;
    }
}
