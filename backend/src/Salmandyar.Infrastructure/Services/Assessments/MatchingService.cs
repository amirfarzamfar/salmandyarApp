using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Assessments;

public class MatchingService : IMatchingService
{
    private readonly ApplicationDbContext _context;

    public MatchingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MatchingResultDto> FindMatchesAsync(string seniorUserId)
    {
        // 1. Get Senior Profile
        var seniorSubmission = await _context.AssessmentSubmissions
            .Where(s => s.UserId == seniorUserId || s.CareRecipient.UserId == seniorUserId) // Handle both direct user or managed patient
            .OrderByDescending(s => s.SubmittedAt)
            .FirstOrDefaultAsync();

        if (seniorSubmission == null || string.IsNullOrEmpty(seniorSubmission.AnalysisResultJson))
        {
            return new MatchingResultDto { SeniorId = seniorUserId, TopMatches = new List<MatchCandidateDto>() };
        }

        var seniorProfile = JsonSerializer.Deserialize<UserProfileDto>(seniorSubmission.AnalysisResultJson);
        if (seniorProfile == null) return new MatchingResultDto();

        // 2. Get All Nurse Profiles
        // Efficient way: query only latest submissions of Nurses
        // In real world, we would cache profiles or store in a dedicated table.
        // For now, we query submissions.
        var nurseSubmissions = await _context.AssessmentSubmissions
            .Include(s => s.User)
            .Where(s => s.Form.Type == AssessmentType.NurseAssessment && !string.IsNullOrEmpty(s.AnalysisResultJson))
            .GroupBy(s => s.UserId)
            .Select(g => g.OrderByDescending(x => x.SubmittedAt).FirstOrDefault())
            .ToListAsync();

        var matches = new List<MatchCandidateDto>();

        foreach (var nurseSub in nurseSubmissions)
        {
            if (nurseSub == null || nurseSub.User == null) continue;

            var nurseProfile = JsonSerializer.Deserialize<UserProfileDto>(nurseSub.AnalysisResultJson);
            if (nurseProfile == null) continue;

            var matchScore = CalculateMatchScore(seniorProfile, nurseProfile, out string reason);

            matches.Add(new MatchCandidateDto
            {
                CaregiverId = nurseSub.UserId!,
                CaregiverName = $"{nurseSub.User.FirstName} {nurseSub.User.LastName}",
                MatchingScore = matchScore,
                Reason = reason
            });
        }

        return new MatchingResultDto
        {
            SeniorId = seniorUserId,
            TopMatches = matches.OrderByDescending(m => m.MatchingScore).Take(5).ToList()
        };
    }

    private double CalculateMatchScore(UserProfileDto senior, UserProfileDto nurse, out string reason)
    {
        double score = 0;
        var reasons = new List<string>();

        // 1. Skills vs Needs
        // Assumption: senior.Needs contains required skills (Key) and importance (Value)
        // nurse.Skills contains capability (Key) and proficiency (Value)
        double skillsScore = 0;
        foreach (var need in senior.Needs)
        {
            // Try to find matching skill (Case insensitive)
            var skillMatch = nurse.Skills.FirstOrDefault(s => s.Key.Equals(need.Key, StringComparison.OrdinalIgnoreCase));
            
            if (!string.IsNullOrEmpty(skillMatch.Key))
            {
                // Score = Need Importance * Skill Proficiency
                // Normalized: (Need/5) * (Skill/5) * 100? 
                // Let's stick to simple addition for now.
                double matchVal = (double)Math.Min(need.Value, skillMatch.Value); // Bottle-necked by need or skill
                skillsScore += matchVal * 10; 
                reasons.Add($"Matched Need: {need.Key}");
            }
        }
        score += skillsScore;

        // 2. Personality
        // Simple compatibility: If both have same dominant traits
        double personalityScore = 0;
        foreach (var trait in senior.Personality)
        {
             var nurseTrait = nurse.Personality.FirstOrDefault(p => p.Key.Equals(trait.Key, StringComparison.OrdinalIgnoreCase));
             if (!string.IsNullOrEmpty(nurseTrait.Key))
             {
                 // Similarity
                 double diff = Math.Abs(trait.Value - nurseTrait.Value);
                 double similarity = Math.Max(0, 10 - diff); // Max 10 points per trait
                 personalityScore += similarity;
             }
        }
        score += personalityScore;

        // 3. Preferences (Boolean)
        // e.g., Gender, Pet Friendly
        double prefScore = 0;
        foreach (var pref in senior.Preferences)
        {
            if (nurse.Preferences.TryGetValue(pref.Key, out bool nurseVal))
            {
                if (pref.Value == nurseVal)
                {
                    prefScore += 20; // High bonus for hard constraints
                    reasons.Add($"Matched Preference: {pref.Key}");
                }
            }
        }
        score += prefScore;

        reason = reasons.Any() ? string.Join(", ", reasons.Take(3)) : "General Compatibility";
        
        // Normalize to 0-100 if possible, but for now raw score is fine for sorting.
        // Or cap at 100.
        return Math.Min(100, score);
    }
}
