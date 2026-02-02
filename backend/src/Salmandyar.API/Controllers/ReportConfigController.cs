using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.ReportConfig;
using Salmandyar.Application.Services.ReportConfig.Dtos;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Assuming admin role check should be here, but using basic auth for now
public class ReportConfigController : ControllerBase
{
    private readonly IReportConfigurationService _service;

    public ReportConfigController(IReportConfigurationService service)
    {
        _service = service;
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        try
        {
            var categories = await _service.GetAllCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetCategories: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                Console.WriteLine(ex.InnerException.StackTrace);
            }
            return StatusCode(500, new
            {
                message = "An error occurred while retrieving categories.",
                details = ex.Message,
                innerDetails = ex.InnerException?.Message
            });
        }
    }

    [HttpGet("categories/{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _service.GetCategoryByIdAsync(id);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory(CreateReportCategoryDto dto)
    {
        Console.WriteLine($"CreateCategory called with: Title={dto.Title}, Order={dto.Order}, IsActive={dto.IsActive}");
        try
        {
            var category = await _service.CreateCategoryAsync(dto);
            return Ok(category);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in CreateCategory: {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                Console.WriteLine(ex.InnerException.StackTrace);
            }
            
            return StatusCode(500, new 
            { 
                message = "An error occurred while creating the category.", 
                details = ex.Message,
                innerDetails = ex.InnerException?.Message 
            });
        }
    }

    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(int id, UpdateReportCategoryDto dto)
    {
        var category = await _service.UpdateCategoryAsync(id, dto);
        if (category == null) return NotFound();
        return Ok(category);
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var result = await _service.DeleteCategoryAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("items/{id}")]
    public async Task<IActionResult> GetItem(int id)
    {
        var item = await _service.GetItemByIdAsync(id);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPost("items")]
    public async Task<IActionResult> CreateItem(CreateReportItemDto dto)
    {
        var item = await _service.CreateItemAsync(dto);
        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
    }

    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(int id, UpdateReportItemDto dto)
    {
        var item = await _service.UpdateItemAsync(id, dto);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var result = await _service.DeleteItemAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}
