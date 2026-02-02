using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salmandyar.Application.Services.ServiceCatalog;
using Salmandyar.Application.Services.ServiceCatalog.Dtos;

namespace Salmandyar.API.Controllers;

[Authorize]
[ApiController]
[Route("api/service-definitions")]
public class ServiceDefinitionsController : ControllerBase
{
    private readonly IServiceCatalogService _service;

    public ServiceDefinitionsController(IServiceCatalogService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<ServiceDefinitionDto>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ServiceDefinitionDto>> GetById(int id)
    {
        var s = await _service.GetByIdAsync(id);
        if (s == null) return NotFound();
        return Ok(s);
    }

    [HttpPost]
    [Authorize(Roles = "Manager,Supervisor,Nurse")]
    public async Task<IActionResult> Create([FromBody] CreateServiceDefinitionDto dto)
    {
        await _service.CreateAsync(dto);
        return Ok();
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Manager,Supervisor,Nurse")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceDefinitionDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return Ok();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Manager,Supervisor,Nurse")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok();
    }
}
