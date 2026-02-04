using Salmandyar.Application.DTOs.Assessments;

namespace Salmandyar.Application.Services.Assessments;

public interface IMatchingService
{
    Task<MatchingResultDto> FindMatchesAsync(string seniorUserId);
}
