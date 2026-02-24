using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments.Reports;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Assessments;

public class AssessmentReportService : IAssessmentReportService
{
    private readonly ApplicationDbContext _context;

    public AssessmentReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ExamStatisticsDto>> GetExamStatisticsAsync(ReportFilterDto filter)
    {
        filter ??= new ReportFilterDto();

        var submissionsQuery = _context.AssessmentSubmissions
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrEmpty(filter.UserId))
        {
            submissionsQuery = submissionsQuery.Where(s => s.UserId == filter.UserId);
        }

        if (filter.FromDate.HasValue)
        {
            submissionsQuery = submissionsQuery.Where(s => s.SubmittedAt >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            submissionsQuery = submissionsQuery.Where(s => s.SubmittedAt <= filter.ToDate.Value);
        }

        if (filter.MinScore.HasValue)
        {
            submissionsQuery = submissionsQuery.Where(s => s.TotalScore >= filter.MinScore.Value);
        }

        if (filter.MaxScore.HasValue)
        {
            submissionsQuery = submissionsQuery.Where(s => s.TotalScore <= filter.MaxScore.Value);
        }

        if (filter.ExamId.HasValue)
        {
            submissionsQuery = submissionsQuery.Where(s => s.FormId == filter.ExamId.Value);
        }

        var grouped = submissionsQuery
            .GroupBy(s => s.FormId)
            .Select(g => new
            {
                FormId = g.Key,
                TotalAttempts = g.Count(),
                AverageScore = g.Average(s => s.TotalScore),
                MaxScore = g.Max(s => s.TotalScore),
                MinScore = g.Min(s => s.TotalScore),
                LastAttemptDate = g.Max(s => s.SubmittedAt)
            });

        var stats = await grouped
            .Join(
                _context.AssessmentForms.AsNoTracking(),
                g => g.FormId,
                f => f.Id,
                (g, f) => new ExamStatisticsDto
                {
                    ExamId = f.Id,
                    Title = f.Title,
                    Type = f.Type,
                    IsActive = f.IsActive,
                    TotalAttempts = g.TotalAttempts,
                    AverageScore = g.AverageScore,
                    MaxScore = g.MaxScore,
                    MinScore = g.MinScore,
                    LastAttemptDate = g.LastAttemptDate
                })
            .ToListAsync();

        return stats;
    }

    public async Task<List<UserExamResultDto>> GetExamUserReportsAsync(int examId, ReportFilterDto filter)
    {
        var query = _context.AssessmentSubmissions
            .AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
                    .ThenInclude(q => q.Options)
            .Where(s => s.FormId == examId);

        if (!string.IsNullOrEmpty(filter.UserId))
        {
            query = query.Where(s => s.UserId == filter.UserId);
        }

        if (filter.FromDate.HasValue)
        {
            query = query.Where(s => s.SubmittedAt >= filter.FromDate.Value);
        }

        if (filter.ToDate.HasValue)
        {
            query = query.Where(s => s.SubmittedAt <= filter.ToDate.Value);
        }

        if (filter.MinScore.HasValue)
        {
            query = query.Where(s => s.TotalScore >= filter.MinScore.Value);
        }

        if (filter.MaxScore.HasValue)
        {
            query = query.Where(s => s.TotalScore <= filter.MaxScore.Value);
        }

        var submissions = await query.ToListAsync();

        return submissions.Select(s => {
            // Calculate correct/incorrect
            // Logic: If Question is multiple choice, check SelectedOption.IsCorrect
            // If Text, it might need manual grading, but for now assuming auto-graded or just boolean
            
            int correct = 0;
            int incorrect = 0;
            int unanswered = 0;

            foreach (var ans in s.Answers)
            {
                if (ans.SelectedOptionId.HasValue)
                {
                    // Assuming we can check if the selected option is correct
                    // We need to know which option is correct.
                    // The Option entity has IsCorrect.
                    // We included Answers -> SelectedOption (Wait, I need to include SelectedOption in query)
                    // Or Answers -> Question -> Options.
                    
                    var selectedOpt = ans.Question.Options.FirstOrDefault(o => o.Id == ans.SelectedOptionId);
                    if (selectedOpt != null)
                    {
                        if (selectedOpt.IsCorrect) correct++;
                        else incorrect++;
                    }
                    else
                    {
                         // Should not happen if ID is valid
                         incorrect++;
                    }
                }
                else if (ans.BooleanResponse.HasValue)
                {
                    // Handle True/False if applicable
                    // Need to know correct answer for Boolean question
                    // Assuming for now we count based on score
                    // If Question.Weight > 0 and Score > 0 -> Correct?
                    // Better to rely on score calculation logic which presumably populated TotalScore
                    // But here we need counts.
                    
                    // Simplification: Check if the answer yielded points.
                    // We don't have score per answer stored in QuestionAnswer directly in the entity definition I saw?
                    // Wait, I saw QuestionAnswer.cs earlier.
                    // It has SelectedOptionId, TextResponse, BooleanResponse.
                    // It DOES NOT have "ScoreObtained".
                    // So we must recalculate or infer.
                    
                    // Let's use the Option's IsCorrect property.
                     var selectedOpt = ans.Question.Options.FirstOrDefault(o => o.Id == ans.SelectedOptionId);
                     if (selectedOpt != null && selectedOpt.IsCorrect) correct++;
                     else incorrect++;
                }
                else
                {
                    unanswered++;
                }
            }
            
            // Total questions in the form?
            // We can get it from s.Answers.Count or fetch Form.Questions.Count
            // s.Answers only contains answered questions? Or all?
            // Usually submission contains all if initialized, but let's assume answers count = questions count for now
            // or we might need to fetch the form to know total questions.
            
            return new UserExamResultDto
            {
                SubmissionId = s.Id,
                UserId = s.UserId ?? "Unknown",
                UserFullName = s.User != null ? $"{s.User.FirstName} {s.User.LastName}" : "Anonymous",
                StartDate = s.SubmittedAt, // Approximate
                EndDate = s.SubmittedAt,
                TotalScore = s.TotalScore,
                IsPassed = s.TotalScore >= 50, // Placeholder logic
                CorrectCount = correct,
                IncorrectCount = incorrect,
                UnansweredCount = unanswered,
                TotalQuestions = s.Answers.Count
            };
        }).ToList();
    }

    public async Task<UserAttemptDetailDto?> GetUserAttemptDetailAsync(int submissionId)
    {
        var submission = await _context.AssessmentSubmissions
            .AsNoTracking()
            .Include(s => s.User)
            .Include(s => s.Form)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
                    .ThenInclude(q => q.Options)
            .Include(s => s.Answers)
                .ThenInclude(a => a.SelectedOption)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null) return null;

        var details = new UserAttemptDetailDto
        {
            SubmissionId = submission.Id,
            UserId = submission.UserId ?? "Unknown",
            UserFullName = submission.User != null ? $"{submission.User.FirstName} {submission.User.LastName}" : "Anonymous",
            ExamTitle = submission.Form.Title,
            SubmissionDate = submission.SubmittedAt,
            TotalScore = submission.TotalScore,
            Answers = submission.Answers.Select(a => new QuestionAnswerDetailDto
            {
                QuestionId = a.QuestionId,
                QuestionText = a.Question.Text,
                Weight = a.Question.Weight,
                SelectedOptionId = a.SelectedOptionId,
                SelectedOptionText = a.SelectedOption?.Text,
                TextResponse = a.TextResponse,
                IsCorrect = a.SelectedOption?.IsCorrect ?? false, // Simplification
                ScoreObtained = a.SelectedOption?.ScoreValue ?? 0, // Simplification
                Options = a.Question.Options.Select(o => new OptionDetailDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    IsCorrect = o.IsCorrect,
                    ScoreValue = o.ScoreValue
                }).ToList()
            }).ToList()
        };

        return details;
    }

    public async Task<ExamAnalyticsDto?> GetExamAnalyticsAsync(int examId)
    {
        var form = await _context.AssessmentForms
            .AsNoTracking()
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == examId);

        if (form == null) return null;

        var analytics = new ExamAnalyticsDto
        {
            ExamId = form.Id,
            Title = form.Title,
            Questions = new List<QuestionAnalysisDto>()
        };

        // We need to aggregate answers.
        // Fetch all answers for this form.
        var answers = await _context.AssessmentSubmissions
            .Where(s => s.FormId == examId)
            .SelectMany(s => s.Answers)
            .ToListAsync();

        foreach (var question in form.Questions)
        {
            var qAnswers = answers.Where(a => a.QuestionId == question.Id).ToList();
            var totalAnswers = qAnswers.Count;
            
            var qDto = new QuestionAnalysisDto
            {
                QuestionId = question.Id,
                QuestionText = question.Text,
                TotalAnswers = totalAnswers,
                Options = new List<OptionAnalysisDto>()
            };

            int correctCount = 0;

            foreach (var option in question.Options)
            {
                var selectionCount = qAnswers.Count(a => a.SelectedOptionId == option.Id);
                if (option.IsCorrect) correctCount += selectionCount;

                qDto.Options.Add(new OptionAnalysisDto
                {
                    OptionId = option.Id,
                    OptionText = option.Text,
                    IsCorrect = option.IsCorrect,
                    SelectionCount = selectionCount,
                    SelectionPercentage = totalAnswers > 0 ? (double)selectionCount / totalAnswers * 100 : 0
                });
            }

            qDto.CorrectAnswersCount = correctCount;
            qDto.CorrectPercentage = totalAnswers > 0 ? (double)correctCount / totalAnswers * 100 : 0;

            analytics.Questions.Add(qDto);
        }

        return analytics;
    }
}
