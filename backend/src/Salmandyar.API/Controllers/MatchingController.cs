using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.Assessments;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchingController : ControllerBase
{
    private readonly IMatchingService _matchingService;

    public MatchingController(IMatchingService matchingService)
    {
        _matchingService = matchingService;
    }

    [HttpGet("recommend/{seniorId}")]
    // [Authorize(Roles = "Admin,FamilyMember")] 
    public async Task<IActionResult> GetRecommendations(string seniorId)
    {
        var result = await _matchingService.FindMatchesAsync(seniorId);
        return Ok(result);
    }
}
