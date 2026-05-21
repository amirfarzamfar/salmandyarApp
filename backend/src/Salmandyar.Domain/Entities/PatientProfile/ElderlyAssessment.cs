namespace Salmandyar.Domain.Entities.PatientProfile;

public class ElderlyAssessment
{
    public int Id { get; set; }
    public int PatientProfileId { get; set; }
    public virtual PatientProfile PatientProfile { get; set; } = null!;

    public string? ConsciousnessLevel { get; set; }
    public string? DailyActivityAbility { get; set; }
    public string? FallRisk { get; set; }
    public string? SwallowingDisorder { get; set; }
    public string? NutritionStatus { get; set; }
    public bool HasUrinaryIncontinence { get; set; }
    public bool HasFecalIncontinence { get; set; }
}
