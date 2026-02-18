using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Application.DTOs.Reminders;
using Salmandyar.Domain.Entities;
using Salmandyar.Infrastructure.Persistence;
using Microsoft.AspNetCore.SignalR;
using Salmandyar.API.Hubs;

namespace Salmandyar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceRemindersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<ServiceHub> _hubContext;

        public ServiceRemindersController(ApplicationDbContext context, IHubContext<ServiceHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
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

            await _hubContext.Clients.Group($"Patient_{dto.CareRecipientId}").SendAsync("ReceiveServiceUpdate");

            return Ok(dto); 
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateServiceReminderDto dto)
        {
            var reminder = await _context.ServiceReminders.FindAsync(id);
            if (reminder == null) return NotFound();

            reminder.ServiceDefinitionId = dto.ServiceDefinitionId;
            reminder.ScheduledTime = dto.ScheduledTime;
            reminder.Note = dto.Note;
            reminder.NotifyPatient = dto.NotifyPatient;
            reminder.NotifyAdmin = dto.NotifyAdmin;
            reminder.NotifySupervisor = dto.NotifySupervisor;
            
            if (Math.Abs((reminder.ScheduledTime - dto.ScheduledTime).TotalMinutes) > 1)
            {
                reminder.IsSent = false;
                reminder.SentAt = null;
            }

            await _context.SaveChangesAsync();
            
            await _hubContext.Clients.Group($"Patient_{reminder.CareRecipientId}").SendAsync("ReceiveServiceUpdate");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var reminder = await _context.ServiceReminders.FindAsync(id);
            if (reminder == null) return NotFound();

            var patientId = reminder.CareRecipientId;

            _context.ServiceReminders.Remove(reminder);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.Group($"Patient_{patientId}").SendAsync("ReceiveServiceUpdate");

            return NoContent();
        }
    }
}
