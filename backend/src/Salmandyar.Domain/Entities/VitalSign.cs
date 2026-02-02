namespace Salmandyar.Domain.Entities;

public class VitalSign
{
    public int Id { get; set; }
    
    public int CareRecipientId { get; set; }
    public virtual CareRecipient CareRecipient { get; set; } = null!;

    public string? RecorderId { get; set; }
    public virtual User? Recorder { get; set; }

    public DateTime RecordedAt { get; set; } // Server time
    public DateTime MeasuredAt { get; set; } // Actual measurement time
    
    public bool IsLateEntry { get; set; }
    public string? DelayReason { get; set; }
    public string? Note { get; set; }

    // Vitals
    public int SystolicBloodPressure { get; set; }
    public int DiastolicBloodPressure { get; set; }
    public double MeanArterialPressure { get; set; } // MAP
    
    public int PulseRate { get; set; }
    public int RespiratoryRate { get; set; }
    public double BodyTemperature { get; set; }
    public int OxygenSaturation { get; set; } // SpO2
    public int? GlasgowComaScale { get; set; } // GCS
}
