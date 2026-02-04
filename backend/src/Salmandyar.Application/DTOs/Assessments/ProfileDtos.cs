namespace Salmandyar.Application.DTOs.Assessments;

public class UserProfileDto
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // Nurse, Caregiver, Senior
    
    public Dictionary<string, int> Skills { get; set; } = new Dictionary<string, int>();
    public Dictionary<string, int> Personality { get; set; } = new Dictionary<string, int>();
    public Dictionary<string, int> Needs { get; set; } = new Dictionary<string, int>();
    public Dictionary<string, bool> Preferences { get; set; } = new Dictionary<string, bool>();
}

public class MatchingResultDto
{
    public string SeniorId { get; set; } = string.Empty;
    public List<MatchCandidateDto> TopMatches { get; set; } = new List<MatchCandidateDto>();
}

public class MatchCandidateDto
{
    public string CaregiverId { get; set; } = string.Empty;
    public string CaregiverName { get; set; } = string.Empty;
    public double MatchingScore { get; set; } // 0-100
    public string Reason { get; set; } = string.Empty;
}
