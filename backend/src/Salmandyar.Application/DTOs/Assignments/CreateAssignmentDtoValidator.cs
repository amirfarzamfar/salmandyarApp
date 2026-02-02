using FluentValidation;
using Salmandyar.Domain.Enums;

namespace Salmandyar.Application.DTOs.Assignments;

public class CreateAssignmentDtoValidator : AbstractValidator<CreateAssignmentDto>
{
    public CreateAssignmentDtoValidator()
    {
        RuleFor(x => x.PatientId).GreaterThan(0).WithMessage("شناسه بیمار نامعتبر است");
        RuleFor(x => x.CaregiverId).NotEmpty().WithMessage("شناسه پرستار الزامی است");
        
        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("تاریخ شروع الزامی است");
            // .GreaterThan(DateTimeOffset.UtcNow).WithMessage("تاریخ شروع باید در آینده باشد"); // Commented out for easier seeding/testing if needed, but usually strictly future.

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate).WithMessage("تاریخ پایان باید بعد از تاریخ شروع باشد")
            .When(x => x.EndDate.HasValue);
        
        RuleFor(x => x.ShiftSlot)
            .NotEqual(ShiftSlot.None).WithMessage("نوبت شیفت برای نوع شیفتی الزامی است")
            .When(x => x.AssignmentType == AssignmentType.ShiftBased);
    }
}
