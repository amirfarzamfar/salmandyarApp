using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Assessments.Reports;

public class ExamStatisticsDto
{
    public int ExamId { get; set; }
    public string Title { get; set; } = string.Empty;
    public AssessmentType Type { get; set; }
    public bool IsActive { get; set; }
    public int TotalAttempts { get; set; }
    public double AverageScore { get; set; }
    public double MaxScore { get; set; }
    public double MinScore { get; set; }
    public DateTime LastAttemptDate { get; set; }
}

public class UserExamResultDto
{
    public int SubmissionId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; } // Assuming SubmissionDate for now, as StartDate might not be tracked
    public DateTime EndDate { get; set; } // SubmissionDate
    public double TotalScore { get; set; }
    public bool IsPassed { get; set; } // Logic to be determined (e.g. > 50% or defined pass mark)
    public int CorrectCount { get; set; }
    public int IncorrectCount { get; set; }
    public int UnansweredCount { get; set; }
    public int TotalQuestions { get; set; }
}

public class ExamAnalyticsDto
{
    public int ExamId { get; set; }
    public string Title { get; set; } = string.Empty;
    public List<QuestionAnalysisDto> Questions { get; set; } = new();
}

public class QuestionAnalysisDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int TotalAnswers { get; set; }
    public int CorrectAnswersCount { get; set; }
    public double CorrectPercentage { get; set; }
    public List<OptionAnalysisDto> Options { get; set; } = new();
}

public class OptionAnalysisDto
{
    public int OptionId { get; set; }
    public string OptionText { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int SelectionCount { get; set; }
    public double SelectionPercentage { get; set; }
}

public class UserAttemptDetailDto
{
    public int SubmissionId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string ExamTitle { get; set; } = string.Empty;
    public DateTime SubmissionDate { get; set; }
    public double TotalScore { get; set; }
    public List<QuestionAnswerDetailDto> Answers { get; set; } = new();
}

public class QuestionAnswerDetailDto
{
    public int QuestionId { get; set; }
    public string QuestionText { get; set; } = string.Empty;
    public int Weight { get; set; }
    public int? SelectedOptionId { get; set; }
    public string? SelectedOptionText { get; set; }
    public string? TextResponse { get; set; }
    public bool IsCorrect { get; set; }
    public int ScoreObtained { get; set; }
    public List<OptionDetailDto> Options { get; set; } = new();
}

public class OptionDetailDto
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int ScoreValue { get; set; }
}

public class ReportFilterDto
{
    public int? ExamId { get; set; }
    public string? UserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public double? MinScore { get; set; }
    public double? MaxScore { get; set; }
}
