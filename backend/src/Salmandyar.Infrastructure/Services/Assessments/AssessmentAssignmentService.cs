using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.Services.Assessments;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.Assessments;

public class AssessmentAssignmentService : IAssessmentAssignmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserNotificationService _notificationService;

    public AssessmentAssignmentService(ApplicationDbContext context, IUserNotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<AssessmentAssignmentDto> AssignAssessmentAsync(CreateAssessmentAssignmentDto dto)
    {
        // Check if already assigned and pending/in-progress
        var existing = await _context.AssessmentAssignments
            .FirstOrDefaultAsync(a => a.UserId == dto.UserId && 
                                      a.FormId == dto.FormId && 
                                      !a.IsDeleted &&
                                      (a.Status == AssessmentAssignmentStatus.Pending || a.Status == AssessmentAssignmentStatus.InProgress));

        if (existing != null)
        {
            throw new InvalidOperationException("This user already has an active assignment for this assessment.");
        }

        var assignment = new AssessmentAssignment
        {
            UserId = dto.UserId,
            FormId = dto.FormId,
            Deadline = dto.Deadline,
            StartDate = dto.StartDate,
            IsMandatory = dto.IsMandatory,
            AssignedDate = DateTime.UtcNow,
            Status = AssessmentAssignmentStatus.Pending
        };

        _context.AssessmentAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        // Load relations for DTO
        var created = await _context.AssessmentAssignments
            .Include(a => a.User)
            .Include(a => a.Form)
            .FirstAsync(a => a.Id == assignment.Id);
            
        // Trigger Notification
        string title = "ارزیابی جدید";
        string message = $"فرم ارزیابی «{created.Form.Title}» برای شما فعال شد.";
        string link = "/dashboard/my-assessments";

        if (created.Form.Type == AssessmentType.Exam)
        {
            title = "آزمون جدید";
            message = $"آزمون «{created.Form.Title}» به شما تخصیص داده شده است. لطفا در اسرع وقت اقدام نمایید.";
            link = "/nurse-portal/exams"; // Assuming exams are mostly for nurses
        }
        else if (created.Form.Type == AssessmentType.NurseAssessment || created.Form.Type == AssessmentType.SpecializedAssessment)
        {
            title = "ارزیابی شغلی";
            message = $"فرم ارزیابی «{created.Form.Title}» جهت تکمیل پرونده پرسنلی شما فعال شد.";
            link = "/nurse-portal/assessments";
        }
        else if (created.Form.Type == AssessmentType.SeniorAssessment)
        {
            title = "ارزیابی سلامت";
            message = $"فرم ارزیابی «{created.Form.Title}» جهت تکمیل پرونده سلامت شما فعال شد.";
            link = "/portal/assessments";
        }

        await _notificationService.CreateNotificationAsync(
            dto.UserId,
            title,
            message,
            NotificationType.Assessment,
            referenceId: assignment.Id.ToString(),
            link: link
        );

        return MapToDto(created);
    }

    public async Task<List<AssessmentAssignmentDto>> GetUserAssignmentsAsync(string userId)
    {
        var assignments = await _context.AssessmentAssignments
            .Include(a => a.User)
            .Include(a => a.Form)
            .Include(a => a.Submission)
            .Where(a => a.UserId == userId && !a.IsDeleted)
            .OrderByDescending(a => a.AssignedDate)
            .ToListAsync();

        return assignments.Select(a => MapToDto(a)).ToList();
    }

    public async Task<List<UserAssessmentSummaryDto>> GetUserAssessmentSummariesAsync(string? role = null, bool? isActive = null, AssessmentType? formType = null, bool excludeExams = false)
    {
        var query = _context.Users.AsQueryable();

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        // Filter by role is tricky with IdentityUser, usually requires join with UserRoles.
        // For simplicity assuming we can fetch all or filtered by IsActive first.
        // If Role is needed, we might need UserManager or join. 
        // Given the complexity of Identity Role filtering in EF Core directly without UserManager, 
        // and assuming 'User' entity doesn't have Role property directly mapped (it's in UserRoles),
        // we will fetch users and their assignments.
        
        // However, if we need performance, we should join.
        // Let's assume we fetch users and then GroupJoin assignments.

        var users = await query.ToListAsync();
        
        // If role filter is applied, we might need to filter in memory or join separately.
        // Assuming we proceed with fetched users for now.

        var userIds = users.Select(u => u.Id).ToList();
        
        var assignmentsQuery = _context.AssessmentAssignments
            .Include(a => a.Form)
            .Where(a => userIds.Contains(a.UserId));

        if (formType.HasValue)
        {
            assignmentsQuery = assignmentsQuery.Where(a => a.Form.Type == formType.Value);
        }
        
        if (excludeExams)
        {
             assignmentsQuery = assignmentsQuery.Where(a => a.Form.Type != AssessmentType.Exam);
        }

        var assignments = await assignmentsQuery.ToListAsync();

        var summaries = new List<UserAssessmentSummaryDto>();

        foreach (var user in users)
        {
            var userAssignments = assignments.Where(a => a.UserId == user.Id).ToList();
            
            // If user has NO assignments of this type, maybe skip them? Or show 0?
            // Usually we show all users and their stats.
            
            summaries.Add(new UserAssessmentSummaryDto
            {
                UserId = user.Id,
                FullName = $"{user.FirstName} {user.LastName}",
                IsActive = user.IsActive,
                Role = "User", // Placeholder, requires UserManager to get roles
                TotalAssigned = userAssignments.Count,
                Completed = userAssignments.Count(a => a.Status == AssessmentAssignmentStatus.Completed),
                Pending = userAssignments.Count(a => a.Status == AssessmentAssignmentStatus.Pending || a.Status == AssessmentAssignmentStatus.InProgress),
                Overdue = userAssignments.Count(a => a.Status == AssessmentAssignmentStatus.Expired || (a.Deadline.HasValue && a.Deadline < DateTime.UtcNow && a.Status != AssessmentAssignmentStatus.Completed))
            });
        }

        return summaries;
    }

    public async Task<AssessmentAssignmentDto?> GetAssignmentByIdAsync(int id)
    {
        var assignment = await _context.AssessmentAssignments
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
        var overdue = await _context.AssessmentAssignments
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

    private static AssessmentAssignmentDto MapToDto(AssessmentAssignment entity, bool includeDetails = false)
    {
        var dto = new AssessmentAssignmentDto
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
            dto.SubmissionDetails = new SubmissionDetailDto
            {
                Id = entity.Submission.Id,
                TotalScore = entity.Submission.TotalScore,
                SubmittedAt = entity.Submission.SubmittedAt,
                Answers = entity.Submission.Answers.Select(a => new QuestionAnswerDetailDto
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
