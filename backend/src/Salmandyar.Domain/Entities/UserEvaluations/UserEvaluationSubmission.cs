namespace Salmandyar.Domain.Entities.UserEvaluations;

public class UserEvaluationSubmission
{
    public int Id { get; set; }
    public int FormId { get; set; }
    public virtual UserEvaluationForm Form { get; set; } = null!;

    public string? UserId { get; set; }
    public virtual User? User { get; set; }

    public int? CareRecipientId { get; set; }
    public virtual CareRecipient? CareRecipient { get; set; }

    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    
    public double TotalScore { get; set; }
    public string? AnalysisResultJson { get; set; }

    public virtual ICollection<UserEvaluationAnswer> Answers { get; set; } = new List<UserEvaluationAnswer>();
}
