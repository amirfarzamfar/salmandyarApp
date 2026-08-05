using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.DTOs.GuestRequests;
using Salmandyar.Application.Services.GuestRequests;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities.Assessments;
using Salmandyar.Domain.Entities.GuestRequests;
using Salmandyar.Domain.Enums;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.Infrastructure.Services.GuestRequests;

public class GuestServiceRequestService : IGuestServiceRequestService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IPatientService _patientService;

    public GuestServiceRequestService(
        ApplicationDbContext context,
        INotificationService notificationService,
        IPatientService patientService)
    {
        _context = context;
        _notificationService = notificationService;
        _patientService = patientService;
    }

    public async Task<GuestServiceRequestDetailsDto> SubmitRequestAsync(CreateGuestServiceRequestDto dto)
    {
        var form = await _context.AssessmentForms
            .Include(f => f.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(f => f.Id == dto.FormId && f.Workflow == AssessmentFormWorkflow.GuestServiceRequest && f.IsActive)
            ?? throw new InvalidOperationException("فرم درخواست بدون ثبت‌نام یافت نشد.");

        var service = dto.ServiceDefinitionId.HasValue
            ? await _context.ServiceDefinitions.FirstOrDefaultAsync(s => s.Id == dto.ServiceDefinitionId.Value && s.IsActive)
            : null;

        var submission = new AssessmentSubmission
        {
            FormId = form.Id,
            UserId = null,
            CareRecipientId = null,
            Status = AssessmentSubmissionStatus.Submitted,
            SubmittedAt = DateTime.UtcNow,
            LastSavedAt = DateTime.UtcNow,
            SummaryJson = dto.SummaryJson,
            Answers = CreateAnswers(form, dto.Answers)
        };

        _context.AssessmentSubmissions.Add(submission);
        await _context.SaveChangesAsync();

        var serviceType = ResolveTaggedAnswerValue(form, dto.Answers, "service_type");
        var urgency = ResolveTaggedAnswerValue(form, dto.Answers, "urgency");
        var city = ResolveTaggedAnswerValue(form, dto.Answers, "city");
        var contactName = ResolveContactName(form, dto.Answers);
        var contactMobile = ResolveTaggedAnswerValue(form, dto.Answers, "contact_mobile") ?? ResolveTaggedAnswerValue(form, dto.Answers, "mobile");

        if (string.IsNullOrWhiteSpace(contactName))
        {
            contactName = "متقاضی";
        }

        if (string.IsNullOrWhiteSpace(contactMobile))
        {
            throw new InvalidOperationException("شماره موبایل الزامی است.");
        }

        var request = new GuestServiceRequest
        {
            TrackingCode = GenerateTrackingCode(service?.Code),
            FormId = form.Id,
            SubmissionId = submission.Id,
            ServiceDefinitionId = service?.Id,
            Status = GuestServiceRequestStatus.New,
            ServiceType = serviceType,
            Urgency = urgency,
            City = city,
            ContactName = contactName,
            ContactMobile = NormalizeIranMobile(contactMobile),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.RequestCreated,
            Title = "درخواست ثبت شد",
            Description = "درخواست بدون ثبت‌نام با موفقیت ثبت شد.",
            ActorUserId = null,
            OccurredAt = DateTime.UtcNow
        });

        _context.GuestServiceRequests.Add(request);
        await _context.SaveChangesAsync();

        await SafeSendSmsAsync(request, $"درخواست شما ثبت شد. کد پیگیری: {request.TrackingCode}. تیم پشتیبانی به‌زودی با شما تماس می‌گیرد.");

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<List<GuestServiceRequestListItemDto>> GetAllRequestsAsync()
    {
        return await _context.GuestServiceRequests
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new GuestServiceRequestListItemDto
            {
                Id = r.Id,
                TrackingCode = r.TrackingCode,
                Status = r.Status,
                ServiceType = r.ServiceType,
                ContactName = r.ContactName,
                ContactMobile = r.ContactMobile,
                City = r.City,
                Urgency = r.Urgency,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<GuestServiceRequestDetailsDto?> GetRequestByIdAsync(Guid id)
    {
        var request = await _context.GuestServiceRequests
            .Include(r => r.Form)
                .ThenInclude(f => f.Questions)
                    .ThenInclude(q => q.Options)
            .Include(r => r.Submission)
                .ThenInclude(s => s.Answers)
            .Include(r => r.AssignedSupervisor)
            .Include(r => r.AssignedCaregiver)
            .Include(r => r.TimelineEvents)
                .ThenInclude(e => e.ActorUser)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return null;
        }

        return new GuestServiceRequestDetailsDto
        {
            Id = request.Id,
            TrackingCode = request.TrackingCode,
            FormId = request.FormId,
            SubmissionId = request.SubmissionId,
            ServiceDefinitionId = request.ServiceDefinitionId,
            AssignedSupervisorName = BuildDisplayName(request.AssignedSupervisor),
            AssignedCaregiverName = BuildDisplayName(request.AssignedCaregiver),
            ConvertedCareRecipientId = request.ConvertedCareRecipientId,
            Status = request.Status,
            ServiceType = request.ServiceType,
            Urgency = request.Urgency,
            City = request.City,
            ContactName = request.ContactName,
            ContactMobile = request.ContactMobile,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt,
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
                .Select(t => new GuestServiceRequestTimelineEventDto
                {
                    Id = t.Id,
                    EventType = t.EventType,
                    Title = t.Title,
                    Description = t.Description,
                    ActorName = BuildDisplayName(t.ActorUser),
                    OccurredAt = t.OccurredAt
                })
                .ToList()
        };
    }

    public async Task<GuestServiceRequestDetailsDto> UpdateStatusAsync(Guid id, UpdateGuestServiceRequestStatusDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .Include(r => r.TimelineEvents)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        request.Status = dto.Status;
        request.UpdatedAt = DateTime.UtcNow;
        if (dto.Status is GuestServiceRequestStatus.Completed or GuestServiceRequestStatus.Cancelled)
        {
            request.ClosedAt = DateTime.UtcNow;
        }

        request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.StatusChanged,
            Title = "تغییر وضعیت",
            Description = $"وضعیت به «{dto.Status}» تغییر کرد.",
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { status = dto.Status.ToString() })
        });

        await _context.SaveChangesAsync();

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> AddNoteAsync(Guid id, AddGuestServiceRequestNoteDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .Include(r => r.TimelineEvents)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var note = (dto.Note ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(note))
        {
            throw new InvalidOperationException("متن یادداشت الزامی است.");
        }

        request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.NoteAdded,
            Title = "یادداشت داخلی",
            Description = note,
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow
        });

        request.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> SendSmsAsync(Guid id, SendGuestServiceRequestSmsDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .Include(r => r.TimelineEvents)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var message = (dto.Message ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(message))
        {
            throw new InvalidOperationException("متن پیامک الزامی است.");
        }

        await _notificationService.SendSmsAsync(
            request.ContactMobile,
            message,
            new NotificationSendContext
            {
                EventKey = NotificationEventKeys.Generic,
                ReferenceId = request.Id.ToString()
            });

        request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.SmsSent,
            Title = "ارسال پیامک",
            Description = message,
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow
        });

        request.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> ConvertToPatientAsync(Guid id, ConvertGuestServiceRequestToPatientDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .Include(r => r.TimelineEvents)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        if (request.ConvertedCareRecipientId.HasValue)
        {
            return (await GetRequestByIdAsync(request.Id))!;
        }

        var created = await _patientService.CreatePatientAsync(new CreatePatientDto(
            dto.FirstName,
            dto.LastName,
            dto.DateOfBirth,
            dto.PrimaryDiagnosis,
            dto.CurrentStatus,
            dto.CareLevel,
            dto.MedicalHistory,
            dto.Needs,
            dto.Address
        ));

        request.ConvertedCareRecipientId = created.Id;
        request.Status = GuestServiceRequestStatus.ConvertedToPatient;
        request.UpdatedAt = DateTime.UtcNow;

        request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.ConvertedToPatient,
            Title = "تبدیل به بیمار",
            Description = $"بیمار با شناسه {created.Id} ایجاد شد.",
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { careRecipientId = created.Id })
        });

        await _context.SaveChangesAsync();

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> AssignCaregiverAsync(Guid id, AssignGuestServiceRequestCaregiverDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .Include(r => r.TimelineEvents)
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        request.AssignedCaregiverId = string.IsNullOrWhiteSpace(dto.CaregiverId) ? null : dto.CaregiverId.Trim();
        request.UpdatedAt = DateTime.UtcNow;

        request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.CaregiverAssigned,
            Title = "اختصاص نیرو",
            Description = string.IsNullOrWhiteSpace(request.AssignedCaregiverId) ? "اختصاص نیرو حذف شد." : "نیرو اختصاص داده شد.",
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { caregiverId = request.AssignedCaregiverId })
        });

        await _context.SaveChangesAsync();

        return (await GetRequestByIdAsync(request.Id))!;
    }

    private async Task SafeSendSmsAsync(GuestServiceRequest request, string message)
    {
        try
        {
            await _notificationService.SendSmsAsync(
                request.ContactMobile,
                message,
                new NotificationSendContext
                {
                    EventKey = NotificationEventKeys.GuestServiceRequestCreated,
                    ReferenceId = request.Id.ToString()
                });

            request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
            {
                RequestId = request.Id,
                EventType = GuestServiceRequestTimelineEventType.SmsSent,
                Title = "ارسال پیامک تایید",
                Description = message,
                ActorUserId = null,
                OccurredAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            request.TimelineEvents.Add(new GuestServiceRequestTimelineEvent
            {
                RequestId = request.Id,
                EventType = GuestServiceRequestTimelineEventType.SmsSent,
                Title = "عدم موفقیت در ارسال پیامک",
                Description = ex.Message,
                ActorUserId = null,
                OccurredAt = DateTime.UtcNow
            });
        }

        request.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
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
        var prefix = string.IsNullOrWhiteSpace(serviceCode) ? "GSR" : serviceCode.ToUpperInvariant();
        return $"{prefix}-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(1000, 9999)}";
    }

    private static string BuildDisplayName(Salmandyar.Domain.Entities.User? user)
    {
        if (user == null)
        {
            return string.Empty;
        }

        var fullName = $"{user.FirstName} {user.LastName}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? user.UserName ?? string.Empty : fullName;
    }

    private static string? ResolveTaggedAnswerValue(AssessmentForm form, IReadOnlyCollection<SubmitAnswerDto> answers, string tag)
    {
        var question = form.Questions.FirstOrDefault(q =>
            q.Tags != null && q.Tags.Any(t => string.Equals(t, tag, StringComparison.OrdinalIgnoreCase)));
        if (question == null)
        {
            return null;
        }

        var answer = answers.FirstOrDefault(a => a.QuestionId == question.Id);
        if (answer == null)
        {
            return null;
        }

        if (answer.SelectedOptionId.HasValue)
        {
            var option = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId.Value);
            return option?.Text;
        }

        if (answer.BooleanResponse.HasValue)
        {
            return answer.BooleanResponse.Value ? "بله" : "خیر";
        }

        if (answer.NumberResponse.HasValue)
        {
            return answer.NumberResponse.Value.ToString();
        }

        if (answer.DateResponse.HasValue)
        {
            return answer.DateResponse.Value.ToString("yyyy-MM-dd");
        }

        if (!string.IsNullOrWhiteSpace(answer.TextResponse))
        {
            return answer.TextResponse.Trim();
        }

        if (!string.IsNullOrWhiteSpace(answer.JsonResponse))
        {
            return answer.JsonResponse.Trim();
        }

        return null;
    }

    private static string? ResolveContactName(AssessmentForm form, IReadOnlyCollection<SubmitAnswerDto> answers)
    {
        var fullName = ResolveTaggedAnswerValue(form, answers, "contact_name");
        if (!string.IsNullOrWhiteSpace(fullName))
        {
            return fullName;
        }

        var firstName = ResolveTaggedAnswerValue(form, answers, "contact_first_name");
        var lastName = ResolveTaggedAnswerValue(form, answers, "contact_last_name");
        var combined = $"{firstName} {lastName}".Trim();
        return string.IsNullOrWhiteSpace(combined) ? null : combined;
    }

    private static string NormalizeIranMobile(string value)
    {
        var raw = new string(value.Where(char.IsDigit).ToArray());
        if (raw.StartsWith("98") && raw.Length == 12)
        {
            raw = "0" + raw[2..];
        }
        if (!raw.StartsWith("0") && raw.Length == 10)
        {
            raw = "0" + raw;
        }
        return raw;
    }
}
