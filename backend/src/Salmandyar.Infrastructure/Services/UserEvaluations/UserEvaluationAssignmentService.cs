using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.UserEvaluations;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.UserEvaluations;
using Salmandyar.Domain.Entities.UserEvaluations;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.UserEvaluations;

public class UserEvaluationAssignmentService : IUserEvaluationAssignmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserNotificationService _notificationService;

    public UserEvaluationAssignmentService(ApplicationDbContext context, IUserNotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<UserEvaluationAssignmentDto> AssignEvaluationAsync(CreateUserEvaluationAssignmentDto dto)
    {
        // Check if already assigned and pending/in-progress
        var existing = await _context.UserEvaluationAssignments
            .FirstOrDefaultAsync(a => a.UserId == dto.UserId && 
                                      a.FormId == dto.FormId && 
                                      !a.IsDeleted &&
                                      (a.Status == AssessmentAssignmentStatus.Pending || a.Status == AssessmentAssignmentStatus.InProgress));

        if (existing != null)
        {
            throw new InvalidOperationException("This user already has an active assignment for this evaluation.");
        }

        var assignment = new UserEvaluationAssignment
        {
            UserId = dto.UserId,
            FormId = dto.FormId,
            Deadline = dto.Deadline,
            StartDate = dto.StartDate,
            IsMandatory = dto.IsMandatory,
            AssignedDate = DateTime.UtcNow,
            Status = AssessmentAssignmentStatus.Pending
        };

        _context.UserEvaluationAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        // Load relations for DTO
        var created = await _context.UserEvaluationAssignments
            .Include(a => a.User)
            .Include(a => a.Form)
            .FirstAsync(a => a.Id == assignment.Id);
            
        // Trigger Notification
        string title = "ارزیابی جدید";
        string message = $"فرم ارزیابی «{created.Form.Title}» برای شما فعال شد.";
        string link = "/dashboard/my-evaluations";

        if (created.Form.Type == AssessmentType.NurseAssessment || created.Form.Type == AssessmentType.SpecializedAssessment)
        {
            title = "ارزیابی شغلی";
            message = $"فرم ارزیابی «{created.Form.Title}» جهت تکمیل پرونده پرسنلی شما فعال شد.";
            link = "/nurse-portal/evaluations";
        }
        else if (created.Form.Type == AssessmentType.SeniorAssessment)
        {
            title = "ارزیابی سلامت";
            message = $"فرم ارزیابی «{created.Form.Title}» جهت تکمیل پرونده سلامت شما فعال شد.";
            link = "/portal/evaluations";
        }

        await _notificationService.CreateNotificationAsync(
            dto.UserId,
            title,
            message,
            NotificationType.Assessment, // Assuming we reuse this type or should add Evaluation type
            referenceId: assignment.Id.ToString(),
            link: link
        );

        return MapToDto(created);
    }

    public async Task<List<UserEvaluationAssignmentDto>> GetUserAssignmentsAsync(string userId)
    {
        var assignments = await _context.UserEvaluationAssignments
            .Include(a => a.User)
            .Include(a => a.Form)
            .Include(a => a.Submission)
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .OrderByDescending(a => a.AssignedDate)
            .ToListAsync();

        return assignments.Select(a => MapToDto(a)).ToList();
    }

    public async Task<List<UserEvaluationSummaryDto>> GetUserEvaluationSummariesAsync(string? role = null, bool? isActive = null, AssessmentType? formType = null)
    {
        var query = _context.Users.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        var users = await query.ToListAsync();
        var userIds = users.Select(u => u.Id).ToList();
        
        var assignmentsQuery = _context.UserEvaluationAssignments
            .Include(a => a.Form)
            .Where(a => userIds.Contains(a.UserId));

        if (formType.HasValue)
        {
            assignmentsQuery = assignmentsQuery.Where(a => a.Form.Type == formType.Value);
        }
        
        var assignments = await assignmentsQuery.ToListAsync();

        var summaries = new List<UserEvaluationSummaryDto>();

        foreach (var user in users)
        {
            var userAssignments = assignments.Where(a => a.UserId == user.Id).ToList();
            
            summaries.Add(new UserEvaluationSummaryDto
            {
                UserId = user.Id,
                FullName = $"{user.FirstName} {user.LastName}",
                IsActive = user.IsActive,
                Role = "User", // Placeholder
                TotalAssigned = userAssignments.Count,
                Completed = userAssignments.Count(a => a.Status == AssessmentAssignmentStatus.Completed),
                Pending = userAssignments.Count(a => a.Status == AssessmentAssignmentStatus.Pending || a.Status == AssessmentAssignmentStatus.InProgress),
                Overdue = userAssignments.Count(a => a.Status == AssessmentAssignmentStatus.Expired || (a.Deadline.HasValue && a.Deadline < DateTime.UtcNow && a.Status != AssessmentAssignmentStatus.Completed))
            });
        }

        return summaries;
    }

    public async Task<UserEvaluationAssignmentDto?> GetAssignmentByIdAsync(int id)
    {
        var assignment = await _context.UserEvaluationAssignments
            .Include(a => a.User)
            .Include(a => a.Form)
            .Include(a => a.Submission)
                .ThenInclude(s => s.Answers)
                    .ThenInclude(qa => qa.Question)
                        .ThenInclude(q => q.Options)
            .Include(a => a.Submission)
                .ThenInclude(s => s.Answers)
                    .ThenInclude(qa => qa.SelectedOption)
            .FirstOrDefaultAsync(a => a.Id == id);

        return assignment == null ? null : MapToDto(assignment, includeDetails: true);
    }

    public async Task MarkAsExpiredAsync()
    {
        var overdue = await _context.UserEvaluationAssignments
            .Where(a => a.Status == AssessmentAssignmentStatus.Pending && 
                        a.Deadline.HasValue && 
                        a.Deadline < DateTime.UtcNow)
            .ToListAsync();

        foreach (var assignment in overdue)
        {
            assignment.Status = AssessmentAssignmentStatus.Expired;
        }

        if (overdue.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    private UserEvaluationAssignmentDto MapToDto(UserEvaluationAssignment entity, bool includeDetails = false)
    {
        var dto = new UserEvaluationAssignmentDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            UserFullName = $"{entity.User.FirstName} {entity.User.LastName}",
            FormId = entity.FormId,
            FormTitle = entity.Form.Title,
            FormType = entity.Form.Type,
            AssignedDate = entity.AssignedDate,
            Deadline = entity.Deadline,
            IsMandatory = entity.IsMandatory,
            Status = entity.Status,
            SubmissionId = entity.SubmissionId,
            Score = entity.Submission?.TotalScore,
            CompletedDate = entity.CompletedDate
        };

        if (includeDetails && entity.Submission != null)
        {
            dto.SubmissionDetails = new UserEvaluationSubmissionDetailDto
            {
                Id = entity.Submission.Id,
                TotalScore = entity.Submission.TotalScore,
                SubmittedAt = entity.Submission.SubmittedAt,
                Answers = entity.Submission.Answers.Select(a => new UserEvaluationAnswerDetailDto
                {
                    QuestionId = a.QuestionId,
                    QuestionText = a.Question.Text,
                    Weight = a.Question.Weight,
                    Tags = a.Question.Tags ?? new List<string>(),
                    SelectedOptionText = a.SelectedOption?.Text,
                    SelectedOptionScore = a.SelectedOption?.ScoreValue,
                    TextResponse = a.TextResponse,
                    BooleanResponse = a.BooleanResponse
                }).ToList()
            };
        }

        return dto;
    }
}
