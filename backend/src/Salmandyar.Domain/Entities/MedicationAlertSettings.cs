namespace Salmandyar.Domain.Entities;

public class MedicationAlertSettings
{
    public int Id { get; set; }
    public string SmsTemplate { get; set; } = "هشدار اتمام دارو: {MedicationName} برای {PatientName} به موجودی {CurrentStock} رسیده است. آستانه هشدار {AlertThreshold} است. زمان: {DateTime}.";
    public string EmailSubjectTemplate { get; set; } = "هشدار اتمام موجودی دارو - {MedicationName}";
    public string EmailBodyTemplate { get; set; } = "داروی {MedicationName} برای بیمار {PatientName} به موجودی {CurrentStock} رسیده است. آستانه هشدار {AlertThreshold} است. زمان: {DateTime}.";
    public string InAppTemplate { get; set; } = "هشدار: موجودی داروی {MedicationName} برای {PatientName} به {CurrentStock} رسیده و برابر یا کمتر از آستانه {AlertThreshold} است.";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? UpdatedByUserId { get; set; }
}
