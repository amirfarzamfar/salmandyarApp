using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Assessments;
using Salmandyar.Application.DTOs.Common;
using Salmandyar.Application.DTOs.GuestRequests;
using Salmandyar.Application.Services.GuestRequests;
using Salmandyar.Application.Services.Notifications;
using Salmandyar.Application.Services.Patients;
using Salmandyar.Application.Services.Patients.Dtos;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities;
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

        var normalizedMobile = NormalizeIranMobile(contactMobile);
        var trackingCode = await GenerateTrackingCodeAsync();

        var request = new GuestServiceRequest
        {
            TrackingCode = trackingCode,
            FormId = form.Id,
            FormVersion = form.Version,
            SubmissionId = submission.Id,
            ServiceDefinitionId = service?.Id,
            Status = GuestServiceRequestStatus.New,
            Priority = ResolvePriorityFromUrgency(urgency),
            Source = GuestServiceRequestSource.LandingForm,
            ServiceType = serviceType,
            Urgency = urgency,
            City = city,
            ContactName = contactName,
            ContactMobile = normalizedMobile,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
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

        await SafeSendSmsAsync(request, $"درخواست شما با کد پیگیری {request.TrackingCode} ثبت شد. تیم پشتیبانی سالمندیار به‌زودی با شما تماس می‌گیرد.");

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestRequestDashboardStatsDto> GetDashboardStatsAsync()
    {
        var utcNow = DateTime.UtcNow;
        var todayStart = utcNow.Date;
        var tomorrowStart = todayStart.AddDays(1);
        var weekStart = todayStart.AddDays(-7);
        var threeDaysAgo = utcNow.AddDays(-3);

        var all = _context.GuestServiceRequests.AsNoTracking();

        return new GuestRequestDashboardStatsDto
        {
            TotalCount = await all.CountAsync(),
            NewCount = await all.CountAsync(r => r.Status == GuestServiceRequestStatus.New),
            UnderReviewCount = await all.CountAsync(r => r.Status == GuestServiceRequestStatus.UnderReview),
            NeedContactCount = await all.CountAsync(r => r.Status == GuestServiceRequestStatus.NeedContact),
            FollowUpTodayCount = await all.CountAsync(r => r.NextFollowUpAt >= todayStart && r.NextFollowUpAt < tomorrowStart),
            FollowUpOverdueCount = await all.CountAsync(r => r.NextFollowUpAt.HasValue && r.NextFollowUpAt.Value < utcNow
                && r.Status != GuestServiceRequestStatus.Completed
                && r.Status != GuestServiceRequestStatus.ConvertedToPatient
                && r.Status != GuestServiceRequestStatus.Cancelled
                && r.Status != GuestServiceRequestStatus.Rejected),
            UnassignedCount = await all.CountAsync(r => r.AssignedSupervisorId == null && r.Status != GuestServiceRequestStatus.Completed
                && r.Status != GuestServiceRequestStatus.ConvertedToPatient
                && r.Status != GuestServiceRequestStatus.Cancelled
                && r.Status != GuestServiceRequestStatus.Rejected),
            HighPriorityCount = await all.CountAsync(r => (r.Priority == GuestServiceRequestPriority.High || r.Priority == GuestServiceRequestPriority.Urgent)
                && r.Status != GuestServiceRequestStatus.Completed
                && r.Status != GuestServiceRequestStatus.ConvertedToPatient
                && r.Status != GuestServiceRequestStatus.Cancelled
                && r.Status != GuestServiceRequestStatus.Rejected),
            EligibleCount = await all.CountAsync(r => r.Status == GuestServiceRequestStatus.Eligible),
            AwaitingConversionCount = await all.CountAsync(r => r.Status == GuestServiceRequestStatus.AwaitingConversion),
            ConvertedCount = await all.CountAsync(r => r.Status == GuestServiceRequestStatus.ConvertedToPatient),
            RejectedCount = await all.CountAsync(r => r.Status == GuestServiceRequestStatus.Rejected),
            CreatedTodayCount = await all.CountAsync(r => r.CreatedAt >= todayStart && r.CreatedAt < tomorrowStart),
            CreatedThisWeekCount = await all.CountAsync(r => r.CreatedAt >= weekStart),
            ConvertedTodayCount = await all.CountAsync(r => r.ConvertedAt >= todayStart && r.ConvertedAt < tomorrowStart),
            NoContactIn3DaysCount = await all.CountAsync(r => r.Status != GuestServiceRequestStatus.New
                && r.Status != GuestServiceRequestStatus.Completed
                && r.Status != GuestServiceRequestStatus.ConvertedToPatient
                && r.Status != GuestServiceRequestStatus.Cancelled
                && r.Status != GuestServiceRequestStatus.Rejected
                && (!r.LastContactAt.HasValue || r.LastContactAt.Value < threeDaysAgo))
        };
    }

    public async Task<PagedResponse<GuestServiceRequestListItemDto>> GetPagedRequestsAsync(GuestRequestQueryDto query)
    {
        var q = _context.GuestServiceRequests.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.SearchQuery))
        {
            var s = query.SearchQuery.Trim();
            q = q.Where(r =>
                r.TrackingCode.Contains(s) ||
                r.ContactName.Contains(s) ||
                r.ContactMobile.Contains(s) ||
                (r.City != null && r.City.Contains(s)));
        }

        if (query.Status.HasValue) q = q.Where(r => r.Status == query.Status.Value);
        if (query.Priority.HasValue) q = q.Where(r => r.Priority == query.Priority.Value);
        if (!string.IsNullOrWhiteSpace(query.AssignedSupervisorId)) q = q.Where(r => r.AssignedSupervisorId == query.AssignedSupervisorId);
        if (!string.IsNullOrWhiteSpace(query.AssignedCaregiverId)) q = q.Where(r => r.AssignedCaregiverId == query.AssignedCaregiverId);
        if (query.FormId.HasValue) q = q.Where(r => r.FormId == query.FormId.Value);
        if (query.Source.HasValue) q = q.Where(r => r.Source == query.Source.Value);
        if (query.CreatedFrom.HasValue) q = q.Where(r => r.CreatedAt >= query.CreatedFrom.Value);
        if (query.CreatedTo.HasValue) q = q.Where(r => r.CreatedAt <= query.CreatedTo.Value);
        if (query.NextFollowUpFrom.HasValue) q = q.Where(r => r.NextFollowUpAt >= query.NextFollowUpFrom.Value);
        if (query.NextFollowUpTo.HasValue) q = q.Where(r => r.NextFollowUpAt <= query.NextFollowUpTo.Value);
        if (query.IsConverted.HasValue)
        {
            q = query.IsConverted.Value
                ? q.Where(r => r.ConvertedCareRecipientId.HasValue)
                : q.Where(r => !r.ConvertedCareRecipientId.HasValue);
        }

        var totalCount = await q.CountAsync();

        q = query.SortBy?.ToLowerInvariant() switch
        {
            "priority" => query.SortDescending ? q.OrderByDescending(r => r.Priority).ThenByDescending(r => r.CreatedAt) : q.OrderBy(r => r.Priority).ThenBy(r => r.CreatedAt),
            "status" => query.SortDescending ? q.OrderByDescending(r => r.Status).ThenByDescending(r => r.CreatedAt) : q.OrderBy(r => r.Status).ThenBy(r => r.CreatedAt),
            "trackingcode" or "tracking_code" => query.SortDescending ? q.OrderByDescending(r => r.TrackingCode) : q.OrderBy(r => r.TrackingCode),
            "contactname" or "contact_name" => query.SortDescending ? q.OrderByDescending(r => r.ContactName) : q.OrderBy(r => r.ContactName),
            "lastcontact" or "last_contact" => query.SortDescending ? q.OrderByDescending(r => r.LastContactAt) : q.OrderBy(r => r.LastContactAt),
            "nextfollowup" or "next_follow_up" or "nextfollowupat" => query.SortDescending ? q.OrderByDescending(r => r.NextFollowUpAt) : q.OrderBy(r => r.NextFollowUpAt),
            "updated" or "updatedat" => query.SortDescending ? q.OrderByDescending(r => r.UpdatedAt) : q.OrderBy(r => r.UpdatedAt),
            _ => query.SortDescending ? q.OrderByDescending(r => r.CreatedAt) : q.OrderBy(r => r.CreatedAt)
        };

        var skip = Math.Max(0, (query.PageNumber - 1) * query.PageSize);
        var take = Math.Clamp(query.PageSize, 1, 200);

        var items = await q
            .Skip(skip)
            .Take(take)
            .Select(r => new GuestServiceRequestListItemDto
            {
                Id = r.Id,
                TrackingCode = r.TrackingCode,
                Status = r.Status,
                Priority = r.Priority,
                ServiceType = r.ServiceType,
                ContactName = r.ContactName,
                ContactMobile = r.ContactMobile,
                City = r.City,
                Urgency = r.Urgency,
                AssignedSupervisorName = r.AssignedSupervisor != null ? (r.AssignedSupervisor.FirstName + " " + r.AssignedSupervisor.LastName).Trim() : null,
                AssignedCaregiverName = r.AssignedCaregiver != null ? (r.AssignedCaregiver.FirstName + " " + r.AssignedCaregiver.LastName).Trim() : null,
                ConvertedCareRecipientId = r.ConvertedCareRecipientId,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                LastContactAt = r.LastContactAt,
                NextFollowUpAt = r.NextFollowUpAt,
                FormId = r.FormId,
                FormTitle = r.Form != null ? r.Form.Title : null,
                Source = r.Source
            })
            .ToListAsync();

        return new PagedResponse<GuestServiceRequestListItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }

    public async Task<List<GuestServiceRequestListItemDto>> GetAllRequestsAsync()
    {
        return await _context.GuestServiceRequests
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new GuestServiceRequestListItemDto
            {
                Id = r.Id,
                TrackingCode = r.TrackingCode,
                Status = r.Status,
                Priority = r.Priority,
                ServiceType = r.ServiceType,
                ContactName = r.ContactName,
                ContactMobile = r.ContactMobile,
                City = r.City,
                Urgency = r.Urgency,
                AssignedSupervisorName = r.AssignedSupervisor != null ? (r.AssignedSupervisor.FirstName + " " + r.AssignedSupervisor.LastName).Trim() : null,
                AssignedCaregiverName = r.AssignedCaregiver != null ? (r.AssignedCaregiver.FirstName + " " + r.AssignedCaregiver.LastName).Trim() : null,
                ConvertedCareRecipientId = r.ConvertedCareRecipientId,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt,
                LastContactAt = r.LastContactAt,
                NextFollowUpAt = r.NextFollowUpAt,
                FormId = r.FormId,
                FormTitle = r.Form != null ? r.Form.Title : null,
                Source = r.Source
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
            .Include(r => r.ContactLogs)
                .ThenInclude(c => c.ActorUser)
            .Include(r => r.FollowUps)
                .ThenInclude(f => f.AssignedToUser)
            .Include(r => r.FollowUps)
                .ThenInclude(f => f.CreatedByUser)
            .AsSplitQuery()
            .AsNoTrackingWithIdentityResolution()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (request == null)
        {
            return null;
        }

        var renderedFormSections = RenderDynamicFormSections(request.Form, request.Submission.Answers);

        return new GuestServiceRequestDetailsDto
        {
            Id = request.Id,
            TrackingCode = request.TrackingCode,
            FormId = request.FormId,
            FormVersion = request.FormVersion,
            SubmissionId = request.SubmissionId,
            ServiceDefinitionId = request.ServiceDefinitionId,
            AssignedSupervisorId = request.AssignedSupervisorId,
            AssignedSupervisorName = BuildDisplayName(request.AssignedSupervisor),
            AssignedCaregiverId = request.AssignedCaregiverId,
            AssignedCaregiverName = BuildDisplayName(request.AssignedCaregiver),
            ConvertedCareRecipientId = request.ConvertedCareRecipientId,
            Status = request.Status,
            Priority = request.Priority,
            Source = request.Source,
            ServiceType = request.ServiceType,
            Urgency = request.Urgency,
            City = request.City,
            ContactName = request.ContactName,
            ContactMobile = request.ContactMobile,
            CreatedAt = request.CreatedAt,
            UpdatedAt = request.UpdatedAt,
            ClosedAt = request.ClosedAt,
            LastContactAt = request.LastContactAt,
            NextFollowUpAt = request.NextFollowUpAt,
            ConvertedAt = request.ConvertedAt,
            RejectionReason = request.RejectionReason,
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
            RenderedFormSections = renderedFormSections,
            ContactLogs = request.ContactLogs
                .OrderByDescending(c => c.ContactedAt)
                .Select(c => new GuestContactLogDto
                {
                    Id = c.Id,
                    RequestId = c.RequestId,
                    ContactedAt = c.ContactedAt,
                    Channel = c.Channel,
                    Result = c.Result,
                    DurationSeconds = c.DurationSeconds,
                    Notes = c.Notes,
                    NextAction = c.NextAction,
                    NextFollowUpSuggestedAt = c.NextFollowUpSuggestedAt,
                    ActorId = c.ActorUserId,
                    ActorName = BuildDisplayName(c.ActorUser),
                    CreatedAt = c.CreatedAt
                }).ToList(),
            FollowUps = request.FollowUps
                .OrderBy(f => f.Status == GuestFollowUpStatus.Pending ? 0 : 1)
                .ThenBy(f => f.ScheduledAt)
                .Select(f => new GuestFollowUpDto
                {
                    Id = f.Id,
                    RequestId = f.RequestId,
                    ScheduledAt = f.ScheduledAt,
                    Status = f.Status,
                    FollowUpType = f.FollowUpType,
                    Description = f.Description,
                    AssignedToUserId = f.AssignedToUserId,
                    AssignedToUserName = BuildDisplayName(f.AssignedToUser),
                    CompletedAt = f.CompletedAt,
                    ResolutionNotes = f.ResolutionNotes,
                    CreatedByUserId = f.CreatedByUserId,
                    CreatedByUserName = BuildDisplayName(f.CreatedByUser) ?? "—",
                    CreatedAt = f.CreatedAt,
                    UpdatedAt = f.UpdatedAt
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
                    ActorId = t.ActorUserId,
                    OccurredAt = t.OccurredAt,
                    MetadataJson = t.MetadataJson
                })
                .ToList()
        };
    }

    public async Task<GuestServiceRequestDetailsDto> UpdateStatusAsync(Guid id, UpdateGuestServiceRequestStatusDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var previousStatus = request.Status;
        request.Status = dto.Status;
        request.UpdatedAt = DateTime.UtcNow;

        if (dto.Status is GuestServiceRequestStatus.Completed or GuestServiceRequestStatus.Cancelled or GuestServiceRequestStatus.Rejected or GuestServiceRequestStatus.ConvertedToPatient)
        {
            request.ClosedAt = DateTime.UtcNow;
        }
        else if (previousStatus is GuestServiceRequestStatus.Completed or GuestServiceRequestStatus.Cancelled or GuestServiceRequestStatus.Rejected)
        {
            request.ClosedAt = null;
        }

        if (dto.Status == GuestServiceRequestStatus.Rejected)
        {
            request.RejectionReason = dto.Reason;
            _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
            {
                RequestId = request.Id,
                EventType = GuestServiceRequestTimelineEventType.RequestRejected,
                Title = "درخواست رد شد",
                Description = string.IsNullOrWhiteSpace(dto.Reason) ? "بدون ذکر دلیل." : dto.Reason,
                ActorUserId = actorUserId,
                OccurredAt = DateTime.UtcNow,
                MetadataJson = JsonSerializer.Serialize(new { status = dto.Status.ToString(), reason = dto.Reason })
            });
        }
        else
        {
            _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
            {
                RequestId = request.Id,
                EventType = GuestServiceRequestTimelineEventType.StatusChanged,
                Title = "تغییر وضعیت",
                Description = $"وضعیت از «{previousStatus}» به «{dto.Status}» تغییر کرد.",
                ActorUserId = actorUserId,
                OccurredAt = DateTime.UtcNow,
                MetadataJson = JsonSerializer.Serialize(new { from = previousStatus.ToString(), to = dto.Status.ToString() })
            });
        }

        await _context.SaveChangesAsync();
        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> UpdatePriorityAsync(Guid id, UpdateGuestServiceRequestPriorityDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var previous = request.Priority;
        request.Priority = dto.Priority;
        request.UpdatedAt = DateTime.UtcNow;

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.PriorityChanged,
            Title = "تغییر اولویت",
            Description = $"اولویت از «{previous}» به «{dto.Priority}» تغییر کرد.",
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { from = previous.ToString(), to = dto.Priority.ToString() })
        });

        await _context.SaveChangesAsync();
        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> AssignSupervisorAsync(Guid id, AssignGuestServiceRequestSupervisorDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var previous = request.AssignedSupervisorId;
        request.AssignedSupervisorId = string.IsNullOrWhiteSpace(dto.SupervisorId) ? null : dto.SupervisorId.Trim();
        request.UpdatedAt = DateTime.UtcNow;

        var desc = string.IsNullOrWhiteSpace(request.AssignedSupervisorId)
            ? "تخصیص کارشناس حذف شد."
            : previous == null
                ? "کارشناس به درخواست اختصاص داده شد."
                : "کارشناس درخواست تغییر کرد.";

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.SupervisorAssigned,
            Title = "تخصیص کارشناس",
            Description = desc,
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { supervisorId = request.AssignedSupervisorId, previousSupervisorId = previous })
        });

        await _context.SaveChangesAsync();
        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> AssignCaregiverAsync(Guid id, AssignGuestServiceRequestCaregiverDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        request.AssignedCaregiverId = string.IsNullOrWhiteSpace(dto.CaregiverId) ? null : dto.CaregiverId.Trim();
        request.UpdatedAt = DateTime.UtcNow;

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.CaregiverAssigned,
            Title = "اختصاص نیروی مراقبت",
            Description = string.IsNullOrWhiteSpace(request.AssignedCaregiverId) ? "اختصاص نیرو حذف شد." : "نیروی مراقبت اختصاص داده شد.",
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { caregiverId = request.AssignedCaregiverId })
        });

        await _context.SaveChangesAsync();
        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> AddNoteAsync(Guid id, AddGuestServiceRequestNoteDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var note = (dto.Note ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(note))
        {
            throw new InvalidOperationException("متن یادداشت الزامی است.");
        }

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
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

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.SmsSent,
            Title = "ارسال پیامک",
            Description = message,
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { templateKey = dto.TemplateKey })
        });

        request.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public List<SmsTemplateDto> GetSmsTemplates(GuestServiceRequestDetailsDto? request = null)
    {
        var tc = request?.TrackingCode ?? "{{کد پیگیری}}";
        var name = request?.ContactName ?? "{{نام درخواست‌دهنده}}";

        return new List<SmsTemplateDto>
        {
            new()
            {
                Key = "request_received",
                Name = "تایید ثبت درخواست",
                Body = $"درخواست شما با کد پیگیری {tc} در سامانه سالمندیار ثبت شد. کارشناسان ما به‌زودی با شما تماس می‌گیرند.",
                Description = "پس از ثبت درخواست ارسال می‌شود."
            },
            new()
            {
                Key = "under_review",
                Name = "اعلام شروع بررسی",
                Body = $"سالمندیار: درخواست شما با کد {tc} وارد مرحله بررسی کارشناسی شد. جهت هماهنگی تماس دریافت کنید.",
                Description = "هنگام تغییر وضعیت به در حال بررسی."
            },
            new()
            {
                Key = "contact_scheduled",
                Name = "هماهنگی تماس",
                Body = $"سالمندیار: {name} عزیز، کارشناس ما در ساعات کاری امروز با شماره شما تماس می‌گیرد. کد پیگیری: {tc}",
                Description = "قبل از تماس کارشناس."
            },
            new()
            {
                Key = "eligible",
                Name = "اعلام واجد شرایط بودن",
                Body = $"سالمندیار: درخواست شما با کد {tc} پس از بررسی تایید شد. همکاران ما برای برنامه‌ریزی خدمت با شما تماس می‌گیرند.",
                Description = "وقتی درخواست واجد شرایط شد."
            },
            new()
            {
                Key = "service_scheduled",
                Name = "برنامه‌ریزی خدمت",
                Body = $"سالمندیار: خدمت مراقبت در منزل شما برنامه‌ریزی شد. جهت مشاهده جزئیات با کارشناس خود در ارتباط باشید. کد پیگیری: {tc}",
                Description = "هنگام برنامه‌ریزی خدمت."
            },
            new()
            {
                Key = "follow_up_reminder",
                Name = "یادآوری پیگیری",
                Body = $"{name} عزیز، یادآوری پیگیری درخواست مراقبت شما با کد پیگیری {tc}. لطفاً در دسترس باشید.",
                Description = "برای یادآوری درخواست‌دهنده."
            },
            new()
            {
                Key = "converted_to_patient",
                Name = "تبدیل به بیمار",
                Body = $"تبریک! درخواست شما با کد {tc} به پرونده بیمار در سامانه سالمندیار تبدیل شد. مسئول پرونده شما به‌زودی اطلاعات کامل را ارسال می‌کند.",
                Description = "هنگام تبدیل درخواست به بیمار."
            },
            new()
            {
                Key = "custom",
                Name = "پیام سفارشی",
                Body = string.Empty,
                Description = "پیامک دلخواه توسط اپراتور."
            }
        };
    }

    public async Task<List<GuestContactLogDto>> GetContactLogsAsync(Guid requestId)
    {
        return await _context.GuestContactLogs
            .AsNoTracking()
            .Where(c => c.RequestId == requestId)
            .OrderByDescending(c => c.ContactedAt)
            .Select(c => new GuestContactLogDto
            {
                Id = c.Id,
                RequestId = c.RequestId,
                ContactedAt = c.ContactedAt,
                Channel = c.Channel,
                Result = c.Result,
                DurationSeconds = c.DurationSeconds,
                Notes = c.Notes,
                NextAction = c.NextAction,
                NextFollowUpSuggestedAt = c.NextFollowUpSuggestedAt,
                ActorId = c.ActorUserId,
                ActorName = c.ActorUser != null ? (c.ActorUser.FirstName + " " + c.ActorUser.LastName).Trim() : null,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<GuestServiceRequestDetailsDto> CreateContactLogAsync(Guid requestId, CreateGuestContactLogDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var contactedAt = dto.ContactedAt ?? DateTime.UtcNow;

        var contactLog = new GuestContactLog
        {
            RequestId = requestId,
            ContactedAt = contactedAt,
            Channel = dto.Channel,
            Result = dto.Result,
            DurationSeconds = dto.DurationSeconds,
            Notes = dto.Notes,
            NextAction = dto.NextAction,
            NextFollowUpSuggestedAt = dto.NextFollowUpSuggestedAt,
            ActorUserId = actorUserId,
            CreatedAt = DateTime.UtcNow
        };

        _context.GuestContactLogs.Add(contactLog);

        request.LastContactAt = contactedAt;
        if (dto.NextFollowUpSuggestedAt.HasValue)
        {
            request.NextFollowUpAt = dto.NextFollowUpSuggestedAt.Value;
        }
        if (request.Status == GuestServiceRequestStatus.New || request.Status == GuestServiceRequestStatus.NeedContact)
        {
            request.Status = GuestServiceRequestStatus.Contacted;
        }
        request.UpdatedAt = DateTime.UtcNow;

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.ContactLogged,
            Title = "ثبت تماس",
            Description = $"کانال: {dto.Channel} | نتیجه: {dto.Result}" + (string.IsNullOrWhiteSpace(dto.Notes) ? "" : $" | {dto.Notes}"),
            ActorUserId = actorUserId,
            OccurredAt = contactedAt,
            MetadataJson = JsonSerializer.Serialize(new
            {
                channel = dto.Channel.ToString(),
                result = dto.Result.ToString(),
                durationSeconds = dto.DurationSeconds,
                nextAction = dto.NextAction,
                nextFollowUpAt = dto.NextFollowUpSuggestedAt
            })
        });

        await _context.SaveChangesAsync();
        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<List<GuestFollowUpDto>> GetFollowUpsAsync(Guid requestId)
    {
        return await _context.GuestFollowUps
            .AsNoTracking()
            .Where(f => f.RequestId == requestId)
            .Select(f => new GuestFollowUpDto
            {
                Id = f.Id,
                RequestId = f.RequestId,
                ScheduledAt = f.ScheduledAt,
                Status = f.Status,
                FollowUpType = f.FollowUpType,
                Description = f.Description,
                AssignedToUserId = f.AssignedToUserId,
                AssignedToUserName = f.AssignedToUser != null ? (f.AssignedToUser.FirstName + " " + f.AssignedToUser.LastName).Trim() : null,
                CompletedAt = f.CompletedAt,
                ResolutionNotes = f.ResolutionNotes,
                CreatedByUserId = f.CreatedByUserId,
                CreatedByUserName = f.CreatedByUser != null ? (f.CreatedByUser.FirstName + " " + f.CreatedByUser.LastName).Trim() : "—",
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<GuestServiceRequestDetailsDto> CreateFollowUpAsync(Guid requestId, CreateGuestFollowUpDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var followUp = new GuestFollowUp
        {
            RequestId = requestId,
            ScheduledAt = dto.ScheduledAt,
            Status = GuestFollowUpStatus.Pending,
            FollowUpType = dto.FollowUpType,
            Description = dto.Description,
            AssignedToUserId = string.IsNullOrWhiteSpace(dto.AssignedToUserId) ? null : dto.AssignedToUserId.Trim(),
            CreatedByUserId = actorUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.GuestFollowUps.Add(followUp);

        var currentNext = request.NextFollowUpAt;
        if (!currentNext.HasValue || dto.ScheduledAt < currentNext.Value)
        {
            request.NextFollowUpAt = dto.ScheduledAt;
        }
        if (request.Status == GuestServiceRequestStatus.New || request.Status == GuestServiceRequestStatus.Contacted)
        {
            request.Status = GuestServiceRequestStatus.FollowUpScheduled;
        }
        request.UpdatedAt = DateTime.UtcNow;

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.FollowUpCreated,
            Title = "ایجاد پیگیری",
            Description = $"زمان: {dto.ScheduledAt:yyyy-MM-dd HH:mm}" + (string.IsNullOrWhiteSpace(dto.Description) ? "" : $" | {dto.Description}"),
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new
            {
                followUpId = followUp.Id,
                scheduledAt = dto.ScheduledAt,
                type = dto.FollowUpType,
                assignedToUserId = followUp.AssignedToUserId
            })
        });

        await _context.SaveChangesAsync();
        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestFollowUpDto> UpdateFollowUpAsync(Guid followUpId, UpdateGuestFollowUpDto dto, string actorUserId)
    {
        var followUp = await _context.GuestFollowUps
            .Include(f => f.Request)
            .FirstOrDefaultAsync(f => f.Id == followUpId)
            ?? throw new KeyNotFoundException("پیگیری یافت نشد.");

        var request = followUp.Request;

        if (dto.ScheduledAt.HasValue) followUp.ScheduledAt = dto.ScheduledAt.Value;
        if (dto.Status.HasValue)
        {
            followUp.Status = dto.Status.Value;
            if (dto.Status.Value == GuestFollowUpStatus.Done)
            {
                followUp.CompletedAt = DateTime.UtcNow;
            }
        }
        if (dto.FollowUpType != null) followUp.FollowUpType = dto.FollowUpType;
        if (dto.Description != null) followUp.Description = dto.Description;
        if (dto.AssignedToUserId != null) followUp.AssignedToUserId = string.IsNullOrWhiteSpace(dto.AssignedToUserId) ? null : dto.AssignedToUserId.Trim();
        if (dto.ResolutionNotes != null) followUp.ResolutionNotes = dto.ResolutionNotes;

        followUp.UpdatedAt = DateTime.UtcNow;

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.FollowUpUpdated,
            Title = "به‌روزرسانی پیگیری",
            Description = $"وضعیت: {followUp.Status}" + (string.IsNullOrWhiteSpace(dto.ResolutionNotes) ? "" : $" | {dto.ResolutionNotes}"),
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new
            {
                followUpId = followUp.Id,
                status = followUp.Status.ToString(),
                scheduledAt = followUp.ScheduledAt,
                completedAt = followUp.CompletedAt
            })
        });

        request.UpdatedAt = DateTime.UtcNow;

        if (dto.Status.HasValue && dto.Status.Value == GuestFollowUpStatus.Pending && dto.ScheduledAt.HasValue)
        {
            var minPending = await _context.GuestFollowUps
                .AsNoTracking()
                .Where(f => f.RequestId == request.Id && f.Status == GuestFollowUpStatus.Pending)
                .MinAsync(f => (DateTime?)f.ScheduledAt);

            request.NextFollowUpAt = minPending;
        }
        else if (dto.Status.HasValue && dto.Status.Value != GuestFollowUpStatus.Pending)
        {
            var minPending = await _context.GuestFollowUps
                .AsNoTracking()
                .Where(f => f.RequestId == request.Id && f.Status == GuestFollowUpStatus.Pending && f.Id != followUp.Id)
                .MinAsync(f => (DateTime?)f.ScheduledAt);

            request.NextFollowUpAt = minPending;
        }

        await _context.SaveChangesAsync();

        return new GuestFollowUpDto
        {
            Id = followUp.Id,
            RequestId = followUp.RequestId,
            ScheduledAt = followUp.ScheduledAt,
            Status = followUp.Status,
            FollowUpType = followUp.FollowUpType,
            Description = followUp.Description,
            AssignedToUserId = followUp.AssignedToUserId,
            CompletedAt = followUp.CompletedAt,
            ResolutionNotes = followUp.ResolutionNotes,
            CreatedByUserId = followUp.CreatedByUserId,
            CreatedAt = followUp.CreatedAt,
            UpdatedAt = followUp.UpdatedAt
        };
    }

    public async Task<List<DuplicatePatientCandidateDto>> SearchDuplicatePatientsAsync(Guid requestId)
    {
        var request = await _context.GuestServiceRequests
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == requestId)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var candidates = new List<DuplicatePatientCandidateDto>();
        var mobile = request.ContactMobile;
        var nameParts = (request.ContactName ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var firstName = nameParts.FirstOrDefault();
        var lastName = nameParts.Length > 1 ? string.Join(' ', nameParts.Skip(1)) : null;

        if (!string.IsNullOrWhiteSpace(mobile))
        {
            var byMobile = await _context.CareRecipients
                .AsNoTracking()
                .ToListAsync();

            foreach (var cr in byMobile)
            {
                double score = 0;
                var reasons = new List<string>();

                var crPhones = new[] { cr.User?.PhoneNumber, cr.FamilyMember?.PhoneNumber }
                    .Where(p => !string.IsNullOrWhiteSpace(p))
                    .Select(p => NormalizeIranMobile(p!))
                    .ToList();

                if (crPhones.Contains(mobile))
                {
                    score += 0.6;
                    reasons.Add("شماره موبایل یکسان");
                }

                if (!string.IsNullOrWhiteSpace(firstName) && cr.FirstName.Equals(firstName, StringComparison.OrdinalIgnoreCase))
                {
                    score += 0.2;
                    reasons.Add("نام مشابه");
                }
                if (!string.IsNullOrWhiteSpace(lastName) && cr.LastName.Equals(lastName, StringComparison.OrdinalIgnoreCase))
                {
                    score += 0.2;
                    reasons.Add("نام خانوادگی مشابه");
                }

                if (score > 0.1)
                {
                    candidates.Add(new DuplicatePatientCandidateDto
                    {
                        CareRecipientId = cr.Id,
                        FirstName = cr.FirstName,
                        LastName = cr.LastName,
                        DateOfBirth = cr.DateOfBirth,
                        MobileNumber = cr.User?.PhoneNumber ?? cr.FamilyMember?.PhoneNumber,
                        MatchReason = string.Join("، ", reasons),
                        MatchScore = Math.Round(score, 2)
                    });
                }
            }
        }

        return candidates
            .OrderByDescending(c => c.MatchScore)
            .Take(10)
            .ToList();
    }

    public async Task<GuestServiceRequestDetailsDto> ConvertToPatientAsync(Guid id, ConvertGuestServiceRequestToPatientDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        if (request.ConvertedCareRecipientId.HasValue)
        {
            return (await GetRequestByIdAsync(request.Id))!;
        }

        int careRecipientId;
        bool createdNew;

        if (dto.ExistingCareRecipientId.HasValue && dto.ExistingCareRecipientId.Value > 0)
        {
            careRecipientId = dto.ExistingCareRecipientId.Value;
            var existing = await _context.CareRecipients.FindAsync(careRecipientId)
                ?? throw new InvalidOperationException("بیمار انتخابی یافت نشد.");
            createdNew = false;

            _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
            {
                RequestId = request.Id,
                EventType = GuestServiceRequestTimelineEventType.PatientLinked,
                Title = "اتصال به بیمار موجود",
                Description = $"درخواست به بیمار با شناسه {careRecipientId} ({existing.FirstName} {existing.LastName}) متصل شد.",
                ActorUserId = actorUserId,
                OccurredAt = DateTime.UtcNow,
                MetadataJson = JsonSerializer.Serialize(new { careRecipientId, createdNew = false })
            });
        }
        else
        {
            if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
            {
                var nameParts = (request.ContactName ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                dto.FirstName ??= nameParts.FirstOrDefault() ?? "نامشخص";
                dto.LastName ??= nameParts.Length > 1 ? string.Join(' ', nameParts.Skip(1)) : "نامشخص";
            }

            if (!dto.DateOfBirth.HasValue)
            {
                dto.DateOfBirth = new DateTime(1950, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            }

            var created = await _patientService.CreatePatientAsync(new CreatePatientDto(
                dto.FirstName,
                dto.LastName,
                dto.DateOfBirth.Value,
                dto.PrimaryDiagnosis ?? "—",
                dto.CurrentStatus ?? "Stable",
                dto.CareLevel,
                dto.MedicalHistory,
                dto.Needs,
                dto.Address ?? request.City
            ));

            careRecipientId = created.Id;
            createdNew = true;

            _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
            {
                RequestId = request.Id,
                EventType = GuestServiceRequestTimelineEventType.ConvertedToPatient,
                Title = "تبدیل به بیمار",
                Description = $"بیمار جدید با شناسه {created.Id} ایجاد شد.",
                ActorUserId = actorUserId,
                OccurredAt = DateTime.UtcNow,
                MetadataJson = JsonSerializer.Serialize(new { careRecipientId = created.Id, createdNew = true })
            });
        }

        request.ConvertedCareRecipientId = careRecipientId;
        request.Status = GuestServiceRequestStatus.ConvertedToPatient;
        request.ConvertedAt = DateTime.UtcNow;
        request.ClosedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var message = createdNew
            ? $"تبریک! درخواست شما با کد پیگیری {request.TrackingCode} به پرونده بیمار در سامانه سالمندیار تبدیل شد. کارشناس مسئول به‌زودی با شما تماس می‌گیرد."
            : $"درخواست شما با کد پیگیری {request.TrackingCode} به پرونده بیمار شما در سامانه سالمندیار متصل شد.";
        await SafeSendSmsAsync(request, message);

        return (await GetRequestByIdAsync(request.Id))!;
    }

    public async Task<GuestServiceRequestDetailsDto> RejectRequestAsync(Guid id, RejectGuestRequestDto dto, string actorUserId)
    {
        var request = await _context.GuestServiceRequests
            .FirstOrDefaultAsync(r => r.Id == id)
            ?? throw new KeyNotFoundException("درخواست یافت نشد.");

        var reason = (dto.Reason ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new InvalidOperationException("علت رد درخواست الزامی است.");
        }

        request.Status = GuestServiceRequestStatus.Rejected;
        request.RejectionReason = reason;
        request.ClosedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
        {
            RequestId = request.Id,
            EventType = GuestServiceRequestTimelineEventType.RequestRejected,
            Title = "رد درخواست",
            Description = reason,
            ActorUserId = actorUserId,
            OccurredAt = DateTime.UtcNow,
            MetadataJson = JsonSerializer.Serialize(new { reason })
        });

        await _context.SaveChangesAsync();
        return (await GetRequestByIdAsync(request.Id))!;
    }

    #region Private Helpers

    private async Task<string> GenerateTrackingCodeAsync()
    {
        const int maxAttempts = 20;
        for (var attempt = 0; attempt < maxAttempts; attempt++)
        {
            var code = Random.Shared.Next(100000, 999999).ToString();
            var exists = await _context.GuestServiceRequests
                .AsNoTracking()
                .AnyAsync(r => r.TrackingCode == code);
            if (!exists) return code;
        }
        throw new InvalidOperationException("عدم توانایی در تولید کد پیگیری یکتا. لطفاً دوباره تلاش کنید.");
    }

    private static GuestServiceRequestPriority ResolvePriorityFromUrgency(string? urgency)
    {
        if (string.IsNullOrWhiteSpace(urgency)) return GuestServiceRequestPriority.Normal;
        return urgency.Trim().ToLowerInvariant() switch
        {
            "کم" or "پایین" or "low" => GuestServiceRequestPriority.Low,
            "بالا" or "مهم" or "high" => GuestServiceRequestPriority.High,
            "فوری" or "urgent" or "critical" => GuestServiceRequestPriority.Urgent,
            "عادی" or "متوسط" or "normal" or _ => GuestServiceRequestPriority.Normal
        };
    }

    private static List<QuestionAnswer> CreateAnswers(AssessmentForm form, IEnumerable<SubmitAnswerDto> answers)
    {
        var answerList = new List<QuestionAnswer>();
        foreach (var answerDto in answers)
        {
            var question = form.Questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
            if (question == null) continue;

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

    private static List<DynamicFormSectionDto> RenderDynamicFormSections(AssessmentForm form, ICollection<QuestionAnswer> answers)
    {
        var sections = new Dictionary<string, DynamicFormSectionDto>();
        var defaultSection = new DynamicFormSectionDto { Key = "__default__", Title = "سایر اطلاعات", Order = 9999 };
        var order = 0;

        foreach (var q in form.Questions.OrderBy(q => q.Order))
        {
            var answer = answers.FirstOrDefault(a => a.QuestionId == q.Id);
            var displayValue = GetAnswerDisplayValue(q, answer);
            var rawValue = GetAnswerRawValue(answer);

            var sectionKey = string.IsNullOrWhiteSpace(q.GroupKey) ? "__default__" : q.GroupKey!;
            var sectionTitle = string.IsNullOrWhiteSpace(q.GroupTitle) ? (string.IsNullOrWhiteSpace(q.PageTitle) ? null : q.PageTitle) : q.GroupTitle;

            if (!sections.TryGetValue(sectionKey, out var section))
            {
                section = new DynamicFormSectionDto
                {
                    Key = sectionKey == "__default__" ? null : sectionKey,
                    Title = sectionTitle,
                    Order = order++
                };
                sections[sectionKey] = section;
            }
            else if (string.IsNullOrWhiteSpace(section.Title) && !string.IsNullOrWhiteSpace(sectionTitle))
            {
                section.Title = sectionTitle;
            }

            section.Fields.Add(new DynamicFormFieldDto
            {
                QuestionId = q.Id,
                GroupKey = q.GroupKey,
                GroupTitle = q.GroupTitle,
                PageKey = q.PageKey,
                PageTitle = q.PageTitle,
                QuestionText = q.Text,
                QuestionType = q.Type,
                DisplayValue = displayValue,
                RawValue = rawValue,
                HasValue = !string.IsNullOrWhiteSpace(rawValue) || !string.IsNullOrWhiteSpace(displayValue),
                Order = q.Order,
                Tags = q.Tags?.ToList()
            });
        }

        var result = sections.Values
            .Where(s => s.Fields.Any())
            .OrderBy(s => s.Order)
            .ToList();

        if (defaultSection.Fields.Any())
        {
            defaultSection.Fields = defaultSection.Fields.OrderBy(f => f.Order).ToList();
            result.Add(defaultSection);
        }
        else
        {
            result.RemoveAll(s => s.Key == "__default__");
        }

        return result;
    }

    private static string? GetAnswerDisplayValue(AssessmentQuestion question, QuestionAnswer? answer)
    {
        if (answer == null) return null;

        if (answer.SelectedOptionId.HasValue)
        {
            var option = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId.Value);
            return option?.Text;
        }
        if (answer.BooleanResponse.HasValue) return answer.BooleanResponse.Value ? "بله" : "خیر";
        if (answer.NumberResponse.HasValue) return answer.NumberResponse.Value.ToString();
        if (answer.DateResponse.HasValue) return answer.DateResponse.Value.ToString("yyyy/MM/dd");
        if (!string.IsNullOrWhiteSpace(answer.TextResponse)) return answer.TextResponse.Trim();
        if (!string.IsNullOrWhiteSpace(answer.JsonResponse))
        {
            try
            {
                using var doc = JsonDocument.Parse(answer.JsonResponse);
                if (doc.RootElement.ValueKind == JsonValueKind.String)
                    return doc.RootElement.GetString();
            }
            catch { /* ignore */ }
            return answer.JsonResponse;
        }
        return null;
    }

    private static string? GetAnswerRawValue(QuestionAnswer? answer)
    {
        if (answer == null) return null;
        if (answer.SelectedOptionId.HasValue) return answer.SelectedOptionId.Value.ToString();
        if (answer.BooleanResponse.HasValue) return answer.BooleanResponse.Value.ToString();
        if (answer.NumberResponse.HasValue) return answer.NumberResponse.Value.ToString();
        if (answer.DateResponse.HasValue) return answer.DateResponse.Value.ToString("o");
        if (!string.IsNullOrWhiteSpace(answer.TextResponse)) return answer.TextResponse;
        return answer.JsonResponse;
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

    private async Task SafeSendSmsAsync(GuestServiceRequest request, string message)
    {
        try
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

                _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
                {
                    RequestId = request.Id,
                    EventType = GuestServiceRequestTimelineEventType.SmsSent,
                    Title = "ارسال پیامک",
                    Description = message,
                    ActorUserId = null,
                    OccurredAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _context.GuestServiceRequestTimelineEvents.Add(new GuestServiceRequestTimelineEvent
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
        catch (Microsoft.EntityFrameworkCore.DbUpdateConcurrencyException)
        {
            _context.ChangeTracker.Clear();
        }
        catch
        {
            _context.ChangeTracker.Clear();
        }
    }

    private static string BuildDisplayName(User? user)
    {
        if (user == null) return string.Empty;
        var fullName = $"{user.FirstName} {user.LastName}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? user.UserName ?? string.Empty : fullName;
    }

    private static string? ResolveTaggedAnswerValue(AssessmentForm form, IReadOnlyCollection<SubmitAnswerDto> answers, string tag)
    {
        var question = form.Questions.FirstOrDefault(q =>
            q.Tags != null && q.Tags.Any(t => string.Equals(t, tag, StringComparison.OrdinalIgnoreCase)));
        if (question == null) return null;

        var answer = answers.FirstOrDefault(a => a.QuestionId == question.Id);
        if (answer == null) return null;

        if (answer.SelectedOptionId.HasValue)
        {
            var option = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId.Value);
            return option?.Text;
        }
        if (answer.BooleanResponse.HasValue) return answer.BooleanResponse.Value ? "بله" : "خیر";
        if (answer.NumberResponse.HasValue) return answer.NumberResponse.Value.ToString();
        if (answer.DateResponse.HasValue) return answer.DateResponse.Value.ToString("yyyy-MM-dd");
        if (!string.IsNullOrWhiteSpace(answer.TextResponse)) return answer.TextResponse.Trim();
        if (!string.IsNullOrWhiteSpace(answer.JsonResponse)) return answer.JsonResponse.Trim();
        return null;
    }

    private static string? ResolveContactName(AssessmentForm form, IReadOnlyCollection<SubmitAnswerDto> answers)
    {
        var fullName = ResolveTaggedAnswerValue(form, answers, "contact_name");
        if (!string.IsNullOrWhiteSpace(fullName)) return fullName;

        var firstName = ResolveTaggedAnswerValue(form, answers, "contact_first_name");
        var lastName = ResolveTaggedAnswerValue(form, answers, "contact_last_name");
        var combined = $"{firstName} {lastName}".Trim();
        return string.IsNullOrWhiteSpace(combined) ? null : combined;
    }

    private static string NormalizeIranMobile(string value)
    {
        var raw = new string(value.Where(char.IsDigit).ToArray());
        if (raw.StartsWith("98") && raw.Length == 12) raw = "0" + raw[2..];
        if (!raw.StartsWith("0") && raw.Length == 10) raw = "0" + raw;
        return raw;
    }

    #endregion
}
