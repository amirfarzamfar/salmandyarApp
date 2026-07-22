using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.DTOs.HomeCare;
using Salmandyar.Application.Services.HomeCare;
using Salmandyar.Domain.Entities;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Entities.HomeCare;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.HomeCare;

public class HomeCareRequestService : IHomeCareRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _environment;

    public HomeCareRequestService(ApplicationDbContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    public async Task<HomeCareDraftDto> SaveDraftAsync(string userId, SaveHomeCareDraftDto dto)
    {
        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == dto.FormId && f.Workflow == AssessmentFormWorkflow.HomeCareRequest)
            ?? throw new InvalidOperationException("فرم درخواست خدمت یافت نشد.");

        var submission = dto.SubmissionId.HasValue
            ? await _context.AssessmentSubmissions
                .Include(s => s.Answers)
                .FirstOrDefaultAsync(s => s.Id == dto.SubmissionId.Value && s.UserId == userId)
            : null;

        if (submission == null)
        {
            submission = new AssessmentSubmission
            {
                FormId = form.Id,
                UserId = userId,
                CareRecipientId = dto.CareRecipientId,
                DraftKey = string.IsNullOrWhiteSpace(dto.DraftKey) ? Guid.NewGuid().ToString("N") : dto.DraftKey,
                SummaryJson = dto.SummaryJson,
                Status = AssessmentSubmissionStatus.Draft,
                SubmittedAt = DateTime.UtcNow,
                LastSavedAt = DateTime.UtcNow,
                Answers = new List<QuestionAnswer>()
            };

            _context.AssessmentSubmissions.Add(submission);
        }
        else
        {
            submission.CareRecipientId = dto.CareRecipientId;
            submission.DraftKey = string.IsNullOrWhiteSpace(dto.DraftKey) ? submission.DraftKey : dto.DraftKey;
            submission.SummaryJson = dto.SummaryJson;
            submission.Status = AssessmentSubmissionStatus.Draft;
            submission.LastSavedAt = DateTime.UtcNow;
            _context.QuestionAnswers.RemoveRange(submission.Answers);
            submission.Answers.Clear();
        }

        submission.Answers = CreateAnswers(form, dto.Answers);
        await _context.SaveChangesAsync();

        return new HomeCareDraftDto
        {
            SubmissionId = submission.Id,
            DraftKey = submission.DraftKey ?? string.Empty,
            FormId = dto.FormId,
            ServiceDefinitionId = dto.ServiceDefinitionId,
            SummaryJson = submission.SummaryJson,
            LastSavedAt = submission.LastSavedAt,
            Answers = dto.Answers
        };
    }

    public async Task<HomeCareRequestDetailsDto> SubmitRequestAsync(string userId, CreateHomeCareRequestDto dto)
    {
        var service = await _context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Id == dto.ServiceDefinitionId && s.IsActive)
            ?? throw new InvalidOperationException("سرویس انتخاب‌شده معتبر نیست.");

        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == dto.FormId && f.Workflow == AssessmentFormWorkflow.HomeCareRequest)
            ?? throw new InvalidOperationException("فرم درخواست خدمت یافت نشد.");

        var submission = new AssessmentSubmission
        {
            FormId = dto.FormId,
            UserId = userId,
            CareRecipientId = dto.CareRecipientId,
            Status = AssessmentSubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow,
            LastSavedAt = DateTime.UtcNow,
            SummaryJson = dto.SummaryJson,
            Answers = CreateAnswers(form, dto.Answers)
        };

        _context.AssessmentSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        var request = new HomeCareRequest
        {
            TrackingCode = GenerateTrackingCode(service.Code),
            ServiceDefinitionId = service.Id,
            FormId = form.Id,
            SubmissionId = submission.Id,
            CareRecipientId = dto.CareRecipientId,
            RequesterUserId = userId,
            Status = HomeCareRequestStatus.Submitted,
            Priority = HomeCareRequestPriority.Normal,
            PreferredContactMethod = dto.PreferredContactMethod,
            ContactTimePreference = dto.ContactTimePreference,
            PreferredStartAt = dto.PreferredStartAt,
            City = dto.City,
            Address = dto.Address,
            Floor = dto.Floor,
            HasElevator = dto.HasElevator,
            HomeConditionNotes = dto.HomeConditionNotes,
            PatientRelationship = dto.PatientRelationship,
            ContactFirstName = dto.ContactFirstName,
            ContactLastName = dto.ContactLastName,
            ContactMobile = dto.ContactMobile,
            Notes = dto.Notes,
            EstimatedContactAt = DateTime.UtcNow.AddHours(2)
        };

        request.TimelineEvents.Add(CreateTimelineEvent(HomeCareTimelineEventType.RequestSubmitted, "درخواست ثبت شد", "درخواست شما با موفقیت ثبت و در صف بررسی قرار گرفت.", userId));
        request.TimelineEvents.Add(CreateTimelineEvent(HomeCareTimelineEventType.SupervisorReviewStarted, "بررسی سوپروایزر", "درخواست برای بررسی اولیه به کارشناس ارجاع شد.", userId));

        var conversation = new HomeCareConversation
        {
            Title = $"پرونده ارتباطی {request.TrackingCode}",
            UpdatedAt = DateTime.UtcNow,
            Participants =
            {
                new HomeCareConversationParticipant
                {
                    UserId = userId,
                    RoleLabel = "بیمار/همراه"
                }
            },
            Messages =
            {
                new HomeCareMessage
                {
                    SenderUserId = userId,
                    MessageType = HomeCareMessageType.System,
                    Content = "درخواست خدمت ثبت شد و تیم پشتیبانی به‌زودی با شما ارتباط می‌گیرد.",
                    IsRead = true,
                    ReadAt = DateTime.UtcNow
                }
            }
        };

        request.Conversations.Add(conversation);
        _context.HomeCareRequests.Add(request);
        await _context.SaveChangesAsync();

        return (await GetRequestByIdAsync(request.Id, userId, elevatedAccess: true))!;
    }

    public async Task<List<HomeCareRequestListItemDto>> GetMyRequestsAsync(string userId)
    {
        return await _context.HomeCareRequests
            .Where(r => r.RequesterUserId == userId)
            .Select(r => new HomeCareRequestListItemDto
            {
                Id = r.Id,
                TrackingCode = r.TrackingCode,
                ServiceTitle = r.ServiceDefinition.Title,
                Status = r.Status,
                ContactName = r.ContactFirstName + " " + r.ContactLastName,
                ContactMobile = r.ContactMobile,
                CreatedAt = r.CreatedAt,
                EstimatedContactAt = r.EstimatedContactAt,
                UnreadMessages = r.Conversations
                    .SelectMany(c => c.Messages)
                    .Count(m => !m.IsRead)
            })
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<HomeCareRequestListItemDto>> GetAllRequestsAsync()
    {
        return await BuildRequestListQuery()
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<HomeCareRequestDetailsDto?> GetRequestByIdAsync(Guid requestId, string userId, bool elevatedAccess)
    {
        var request = await _context.HomeCareRequests
            .Include(r => r.ServiceDefinition)
            .Include(r => r.Form)
                .ThenInclude(f => f.Questions)
                    .ThenInclude(q => q.Options)
            .Include(r => r.Submission)
                .ThenInclude(s => s.Answers)
            .Include(r => r.AssignedSupervisor)
            .Include(r => r.AssignedCaregiver)
            .Include(r => r.TimelineEvents)
                .ThenInclude(t => t.ActorUser)
            .Include(r => r.Conversations)
                .ThenInclude(c => c.Participants)
                    .ThenInclude(p => p.User)
            .Include(r => r.Conversations)
                .ThenInclude(c => c.Messages)
                    .ThenInclude(m => m.SenderUser)
            .Include(r => r.Conversations)
                .ThenInclude(c => c.Messages)
                    .ThenInclude(m => m.Attachments)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null)
        {
            return null;
        }

        if (!elevatedAccess && request.RequesterUserId != userId && !request.Conversations.SelectMany(c => c.Participants).Any(p => p.UserId == userId))
        {
            return null;
        }

        return MapRequestDetails(request, userId);
    }

    public async Task<HomeCareMessageDto> SendMessageAsync(string userId, SendHomeCareMessageDto dto, IReadOnlyCollection<HomeCareUploadedFilePayload>? files)
    {
        var conversation = await _context.HomeCareConversations
            .Include(c => c.Request)
            .Include(c => c.Participants)
            .FirstOrDefaultAsync(c => c.Id == dto.ConversationId)
            ?? throw new InvalidOperationException("گفت‌وگو یافت نشد.");

        if (!conversation.Participants.Any(p => p.UserId == userId))
        {
            conversation.Participants.Add(new HomeCareConversationParticipant
            {
                UserId = userId,
                RoleLabel = "کارشناس"
            });
        }

        var message = new HomeCareMessage
        {
            ConversationId = conversation.Id,
            SenderUserId = userId,
            MessageType = dto.MessageType,
            Content = dto.Content,
            SentAt = DateTime.UtcNow
        };

        if (files is { Count: > 0 })
        {
            foreach (var file in files)
            {
                var savedFile = await SaveFileAsync(file, "messages");
                message.Attachments.Add(new HomeCareMessageAttachment
                {
                    OriginalFileName = file.FileName,
                    StoredFileName = savedFile.StoredFileName,
                    ContentType = file.ContentType,
                    FileUrl = savedFile.FileUrl,
                    FileSizeBytes = file.Length
                });
            }
        }

        conversation.UpdatedAt = DateTime.UtcNow;
        _context.HomeCareMessages.Add(message);

        _context.HomeCareRequestTimelineEvents.Add(CreateTimelineEvent(
            HomeCareTimelineEventType.NoteAdded,
            "پیام جدید",
            "یک پیام جدید در پرونده ارتباطی درخواست ثبت شد.",
            userId,
            conversation.RequestId));

        await _context.SaveChangesAsync();

        var sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return new HomeCareMessageDto
        {
            Id = message.Id,
            SenderUserId = userId,
            SenderName = BuildDisplayName(sender),
            SenderRoleLabel = conversation.Participants.FirstOrDefault(p => p.UserId == userId)?.RoleLabel ?? "کاربر",
            MessageType = message.MessageType,
            Content = message.Content,
            IsRead = message.IsRead,
            SentAt = message.SentAt,
            ReadAt = message.ReadAt,
            Attachments = message.Attachments.Select(a => new HomeCareMessageAttachmentDto
            {
                Id = a.Id,
                OriginalFileName = a.OriginalFileName,
                ContentType = a.ContentType,
                FileUrl = a.FileUrl,
                FileSizeBytes = a.FileSizeBytes
            }).ToList()
        };
    }

    public async Task<HomeCareRequestDetailsDto?> UpdateStatusAsync(Guid requestId, UpdateHomeCareRequestStatusDto dto, string actorUserId)
    {
        var request = await _context.HomeCareRequests
            .Include(r => r.Conversations)
                .ThenInclude(c => c.Participants)
            .FirstOrDefaultAsync(r => r.Id == requestId);

        if (request == null)
        {
            return null;
        }

        request.Status = dto.Status;
        request.EstimatedContactAt = dto.EstimatedContactAt ?? request.EstimatedContactAt;
        request.AssignedSupervisorId = dto.AssignedSupervisorId ?? request.AssignedSupervisorId;
        request.AssignedCaregiverId = dto.AssignedCaregiverId ?? request.AssignedCaregiverId;
        request.UpdatedAt = DateTime.UtcNow;
        if (dto.Status is HomeCareRequestStatus.Completed or HomeCareRequestStatus.Cancelled)
        {
            request.ClosedAt = DateTime.UtcNow;
        }

        var primaryConversation = request.Conversations.FirstOrDefault();
        if (primaryConversation != null)
        {
            EnsureParticipant(primaryConversation, request.AssignedSupervisorId, "سوپروایزر");
            EnsureParticipant(primaryConversation, request.AssignedCaregiverId, "نیروی درمانی");
        }

        _context.HomeCareRequestTimelineEvents.Add(CreateTimelineEvent(
            HomeCareTimelineEventType.StatusChanged,
            GetStatusTitle(dto.Status),
            dto.Note ?? "وضعیت درخواست به‌روزرسانی شد.",
            actorUserId,
            request.Id));

        await _context.SaveChangesAsync();
        return await GetRequestByIdAsync(requestId, actorUserId, elevatedAccess: true);
    }

    public async Task<HomeCareRequestDetailsDto?> AddRequestAttachmentsAsync(Guid requestId, string userId, string category, IReadOnlyCollection<HomeCareUploadedFilePayload> files)
    {
        var request = await _context.HomeCareRequests.FirstOrDefaultAsync(r => r.Id == requestId);
        if (request == null)
        {
            return null;
        }

        foreach (var file in files)
        {
            var savedFile = await SaveFileAsync(file, "request-documents");
            _context.HomeCareRequestAttachments.Add(new HomeCareRequestAttachment
            {
                RequestId = requestId,
                Category = category,
                OriginalFileName = file.FileName,
                StoredFileName = savedFile.StoredFileName,
                ContentType = file.ContentType,
                FileUrl = savedFile.FileUrl,
                FileSizeBytes = file.Length,
                UploadedByUserId = userId
            });
        }

        _context.HomeCareRequestTimelineEvents.Add(CreateTimelineEvent(
            HomeCareTimelineEventType.DocumentsReceived,
            "مدارک جدید دریافت شد",
            "فایل‌ها و مدارک پزشکی جدید به پرونده درخواست اضافه شد.",
            userId,
            requestId));

        await _context.SaveChangesAsync();
        return await GetRequestByIdAsync(requestId, userId, elevatedAccess: true);
    }

    private IQueryable<HomeCareRequestListItemDto> BuildRequestListQuery()
    {
        return _context.HomeCareRequests
            .Select(r => new HomeCareRequestListItemDto
            {
                Id = r.Id,
                TrackingCode = r.TrackingCode,
                ServiceTitle = r.ServiceDefinition.Title,
                Status = r.Status,
                ContactName = r.ContactFirstName + " " + r.ContactLastName,
                ContactMobile = r.ContactMobile,
                CreatedAt = r.CreatedAt,
                EstimatedContactAt = r.EstimatedContactAt,
                UnreadMessages = r.Conversations
                    .SelectMany(c => c.Messages)
                    .Count(m => !m.IsRead)
            });
    }

    private static List<QuestionAnswer> CreateAnswers(AssessmentForm form, IEnumerable<SubmitAnswerDto> answers)
    {
        var answerList = new List<QuestionAnswer>();
        foreach (var answerDto in answers)
        {
            var question = form.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
            if (question == null)
            {
                continue;
            }

            answerList.Add(new QuestionAnswer
            {
                QuestionId = question.Id,
                SelectedOptionId = answerDto.SelectedOptionId,
                TextResponse = answerDto.TextResponse,
                BooleanResponse = answerDto.BooleanResponse,
                NumberResponse = answerDto.NumberResponse,
                DateResponse = answerDto.DateResponse,
                JsonResponse = answerDto.JsonResponse
            });
        }

        return answerList;
    }

    private HomeCareRequestDetailsDto MapRequestDetails(HomeCareRequest request, string currentUserId)
    {
        return new HomeCareRequestDetailsDto
        {
            Id = request.Id,
            TrackingCode = request.TrackingCode,
            ServiceDefinitionId = request.ServiceDefinitionId,
            ServiceTitle = request.ServiceDefinition.Title,
            FormId = request.FormId,
            SubmissionId = request.SubmissionId,
            Status = request.Status,
            Priority = request.Priority,
            PreferredContactMethod = request.PreferredContactMethod,
            ContactTimePreference = request.ContactTimePreference,
            ContactFirstName = request.ContactFirstName,
            ContactLastName = request.ContactLastName,
            ContactMobile = request.ContactMobile,
            PatientRelationship = request.PatientRelationship,
            City = request.City,
            Address = request.Address,
            Floor = request.Floor,
            HasElevator = request.HasElevator,
            HomeConditionNotes = request.HomeConditionNotes,
            Notes = request.Notes,
            CreatedAt = request.CreatedAt,
            PreferredStartAt = request.PreferredStartAt,
            EstimatedContactAt = request.EstimatedContactAt,
            AssignedSupervisorName = BuildDisplayName(request.AssignedSupervisor),
            AssignedCaregiverName = BuildDisplayName(request.AssignedCaregiver),
            SummaryJson = request.Submission.SummaryJson,
            Form = MapForm(request.Form),
            Answers = request.Submission.Answers.Select(a => new SubmitAnswerDto
            {
                QuestionId = a.QuestionId,
                SelectedOptionId = a.SelectedOptionId,
                TextResponse = a.TextResponse,
                BooleanResponse = a.BooleanResponse,
                NumberResponse = a.NumberResponse,
                DateResponse = a.DateResponse,
                JsonResponse = a.JsonResponse
            }).ToList(),
            Timeline = request.TimelineEvents
                .OrderBy(t => t.OccurredAt)
                .Select(t => new HomeCareTimelineEventDto
                {
                    Id = t.Id,
                    EventType = t.EventType,
                    Title = t.Title,
                    Description = t.Description,
                    ActorName = BuildDisplayName(t.ActorUser),
                    OccurredAt = t.OccurredAt
                })
                .ToList(),
            Conversations = request.Conversations
                .OrderByDescending(c => c.UpdatedAt)
                .Select(c => new HomeCareConversationDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    IsClosed = c.IsClosed,
                    UpdatedAt = c.UpdatedAt,
                    Participants = c.Participants.Select(p => new HomeCareConversationParticipantDto
                    {
                        UserId = p.UserId,
                        DisplayName = BuildDisplayName(p.User),
                        RoleLabel = p.RoleLabel,
                        LastReadAt = p.LastReadAt
                    }).ToList(),
                    Messages = c.Messages
                        .OrderBy(m => m.SentAt)
                        .Select(m => new HomeCareMessageDto
                        {
                            Id = m.Id,
                            SenderUserId = m.SenderUserId,
                            SenderName = BuildDisplayName(m.SenderUser),
                            SenderRoleLabel = c.Participants.FirstOrDefault(p => p.UserId == m.SenderUserId)?.RoleLabel ?? "کاربر",
                            MessageType = m.MessageType,
                            Content = m.Content,
                            IsRead = m.IsRead || m.SenderUserId == currentUserId,
                            SentAt = m.SentAt,
                            ReadAt = m.ReadAt,
                            Attachments = m.Attachments.Select(a => new HomeCareMessageAttachmentDto
                            {
                                Id = a.Id,
                                OriginalFileName = a.OriginalFileName,
                                ContentType = a.ContentType,
                                FileUrl = a.FileUrl,
                                FileSizeBytes = a.FileSizeBytes
                            }).ToList()
                        })
                        .ToList()
                })
                .ToList()
        };
    }

    private static AssessmentFormDto MapForm(AssessmentForm form)
    {
        var targetTypes = ParseTargetTypes(form);
        return new AssessmentFormDto
        {
            Id = form.Id,
            Code = form.Code,
            Title = form.Title,
            Description = form.Description,
            IsActive = form.IsActive,
            Type = form.Type,
            TargetTypes = targetTypes,
            Workflow = form.Workflow,
            Version = form.Version,
            IsDefault = form.IsDefault,
            ServiceDefinitionId = form.ServiceDefinitionId,
            IntroTitle = form.IntroTitle,
            IntroDescription = form.IntroDescription,
            EstimatedDurationMinutes = form.EstimatedDurationMinutes,
            LayoutJson = form.LayoutJson,
            Questions = form.Questions
                .OrderBy(q => q.Order)
                .Select(q => new QuestionDto
                {
                    QuestionId = q.Id,
                    Type = q.Type,
                    Question = q.Text,
                    Options = q.Options.OrderBy(o => o.Order).Select(o => new OptionDto
                    {
                        Id = o.Id,
                        Text = o.Text,
                        Value = o.ScoreValue,
                        Order = o.Order,
                        NextQuestionKey = o.NextQuestionKey
                    }).ToList(),
                    Weight = q.Weight,
                    Tags = q.Tags,
                    Order = q.Order,
                    QuestionKey = q.QuestionKey,
                    NextQuestionKey = q.NextQuestionKey,
                    PageKey = q.PageKey,
                    PageTitle = q.PageTitle,
                    GroupKey = q.GroupKey,
                    GroupTitle = q.GroupTitle,
                    IsRequired = q.IsRequired,
                    Placeholder = q.Placeholder,
                    Description = q.Description,
                    VisibilityConditionJson = q.VisibilityConditionJson,
                    RequiredConditionJson = q.RequiredConditionJson,
                    ValidationJson = q.ValidationJson,
                    MinValue = q.MinValue,
                    MaxValue = q.MaxValue,
                    MinFiles = q.MinFiles,
                    MaxFiles = q.MaxFiles,
                    AllowMultipleFiles = q.AllowMultipleFiles
                })
                .ToList()
        };
    }

    private static List<AssessmentType> ParseTargetTypes(AssessmentForm form)
    {
        if (string.IsNullOrWhiteSpace(form.TargetTypesJson))
        {
            return new List<AssessmentType> { form.Type };
        }

        try
        {
            var rawValues = JsonSerializer.Deserialize<List<int>>(form.TargetTypesJson) ?? new List<int>();
            var parsed = rawValues.Select(value => (AssessmentType)value).Distinct().ToList();
            return parsed.Count != 0 ? parsed : new List<AssessmentType> { form.Type };
        }
        catch
        {
            return new List<AssessmentType> { form.Type };
        }
    }

    private static string GenerateTrackingCode(string? serviceCode)
    {
        var prefix = string.IsNullOrWhiteSpace(serviceCode) ? "HCR" : serviceCode.ToUpperInvariant();
        return $"{prefix}-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(1000, 9999)}";
    }

    private HomeCareRequestTimelineEvent CreateTimelineEvent(
        HomeCareTimelineEventType eventType,
        string title,
        string description,
        string? actorUserId,
        Guid? requestId = null)
    {
        return new HomeCareRequestTimelineEvent
        {
            RequestId = requestId ?? Guid.Empty,
            EventType = eventType,
            Title = title,
            Description = description,
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow
        };
    }

    private void EnsureParticipant(HomeCareConversation conversation, string? userId, string roleLabel)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return;
        }

        if (conversation.Participants.All(p => p.UserId != userId))
        {
            conversation.Participants.Add(new HomeCareConversationParticipant
            {
                UserId = userId,
                RoleLabel = roleLabel
            });
        }
    }

    private async Task<(string StoredFileName, string FileUrl)> SaveFileAsync(HomeCareUploadedFilePayload file, string section)
    {
        var uploadsRoot = Path.Combine(_environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"), "uploads", "home-care", section);
        Directory.CreateDirectory(uploadsRoot);

        var extension = Path.GetExtension(file.FileName);
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadsRoot, storedFileName);

        await File.WriteAllBytesAsync(fullPath, file.Content);

        return (storedFileName, $"/uploads/home-care/{section}/{storedFileName}");
    }

    private static string BuildDisplayName(User? user)
    {
        if (user == null)
        {
            return string.Empty;
        }

        var fullName = $"{user.FirstName} {user.LastName}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? user.UserName ?? string.Empty : fullName;
    }

    private static string GetStatusTitle(HomeCareRequestStatus status)
    {
        return status switch
        {
            HomeCareRequestStatus.UnderSupervisorReview => "بررسی سوپروایزر",
            HomeCareRequestStatus.ContactScheduled => "تماس با بیمار",
            HomeCareRequestStatus.AwaitingDocuments => "انتظار برای مدارک",
            HomeCareRequestStatus.MatchingCaregiver => "جستجوی نیروی مناسب",
            HomeCareRequestStatus.AwaitingPatientConfirmation => "در انتظار تایید بیمار",
            HomeCareRequestStatus.InService => "شروع خدمت",
            HomeCareRequestStatus.Completed => "پایان خدمت",
            HomeCareRequestStatus.SatisfactionPending => "در انتظار ثبت رضایت",
            HomeCareRequestStatus.Cancelled => "لغو درخواست",
            _ => "به‌روزرسانی وضعیت"
        };
    }
}
