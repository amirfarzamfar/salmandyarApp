using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Reminders;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceRemindersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServiceRemindersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{patientId}")]
        public async Task<ActionResult<List<ServiceReminderDto>>> GetByPatient(int patientId)
        {
            var reminders = await _context.ServiceReminders
                .Include(r => r.ServiceDefinition)
                .Where(r => r.CareRecipientId == patientId)
                .OrderBy(r => r.ScheduledTime)
                .Select(r => new ServiceReminderDto
                {
                    Id = r.Id,
                    CareRecipientId = r.CareRecipientId,
                    ServiceDefinitionId = r.ServiceDefinitionId,
                    ServiceTitle = r.ServiceDefinition.Title,
                    ScheduledTime = r.ScheduledTime,
                    Note = r.Note,
                    IsSent = r.IsSent,
                    SentAt = r.SentAt,
                    NotifyPatient = r.NotifyPatient,
                    NotifyAdmin = r.NotifyAdmin,
                    NotifySupervisor = r.NotifySupervisor
                })
                .ToListAsync();

            return Ok(reminders);
        }

        [HttpPost]
        public async Task<ActionResult<ServiceReminderDto>> Create(CreateServiceReminderDto dto)
        {
            var reminder = new ServiceReminder
            {
                CareRecipientId = dto.CareRecipientId,
                ServiceDefinitionId = dto.ServiceDefinitionId,
                ScheduledTime = dto.ScheduledTime,
                Note = dto.Note,
                NotifyPatient = dto.NotifyPatient,
                NotifyAdmin = dto.NotifyAdmin,
                NotifySupervisor = dto.NotifySupervisor,
                IsSent = false
            };

            _context.ServiceReminders.Add(reminder);
            await _context.SaveChangesAsync();

            // Return DTO (reload to get service title if needed, or just return basic info)
            return Ok(dto); 
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var reminder = await _context.ServiceReminders.FindAsync(id);
            if (reminder == null) return NotFound();

            _context.ServiceReminders.Remove(reminder);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}