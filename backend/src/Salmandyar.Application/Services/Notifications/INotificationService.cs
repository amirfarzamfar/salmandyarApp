using System.Threading.Tasks;

namespace Salmandyar.Application.Services.Notifications
{
    public interface INotificationService
    {
        Task SendSmsAsync(string phoneNumber, string message);
        Task SendEmailAsync(string email, string subject, string body);
    }
}