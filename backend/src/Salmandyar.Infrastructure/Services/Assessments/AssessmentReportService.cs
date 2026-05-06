using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        var totalQuestionsInExam = await _context.AssessmentQuestions
            .AsNoTracking()
            .CountAsync(q => q.FormId == examId);

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
            int correct = 0;
            int incorrect = 0;

            foreach (var ans in s.Answers)
            {
                if (ans.SelectedOptionId.HasValue)
                {
                    var selectedOpt = ans.Question.Options.FirstOrDefault(o => o.Id == ans.SelectedOptionId.Value);
                    if (selectedOpt != null)
                    {
                        if (selectedOpt.ScoreValue > 0) correct++;
                        else incorrect++;
                    }
                    else
                    {
                         incorrect++;
                    }
                }
                else if (ans.BooleanResponse.HasValue)
                {
                    if (ans.BooleanResponse.Value) correct++;
                    else incorrect++;
                }
            }

            var attempted = correct + incorrect;
            var unanswered = Math.Max(0, totalQuestionsInExam - attempted);
            
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
                TotalQuestions = totalQuestionsInExam
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
                SelectedOptionText = a.SelectedOption?.Text ?? (a.BooleanResponse.HasValue ? (a.BooleanResponse.Value ? "بله" : "خیر") : null),
                TextResponse = a.TextResponse,
                IsCorrect = a.SelectedOption != null
                    ? a.SelectedOption.ScoreValue > 0 && a.SelectedOption.ScoreValue == a.Question.Options.Max(o => o.ScoreValue)
                    : (a.BooleanResponse.HasValue && a.BooleanResponse.Value),
                ScoreObtained = (a.SelectedOption?.ScoreValue ?? (a.BooleanResponse.HasValue ? (a.BooleanResponse.Value ? 1 : 0) : 0)) * a.Question.Weight,
                Options = a.Question.Options.Select(o => new OptionDetailDto
                {
                    Id = o.Id,
                    Text = o.Text,
                    IsCorrect = o.ScoreValue > 0 && o.ScoreValue == a.Question.Options.Max(x => x.ScoreValue),
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
            var maxScoreValue = question.Options.Any() ? question.Options.Max(o => o.ScoreValue) : 0;
            
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
                if (maxScoreValue > 0 && option.ScoreValue == maxScoreValue) correctCount += selectionCount;

                qDto.Options.Add(new OptionAnalysisDto
                {
                    OptionId = option.Id,
                    OptionText = option.Text,
                    IsCorrect = maxScoreValue > 0 && option.ScoreValue == maxScoreValue,
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
