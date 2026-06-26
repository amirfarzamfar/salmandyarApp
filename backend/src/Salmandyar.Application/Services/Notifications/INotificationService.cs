using System.Threading.Tasks;

namespace Salmandyar.Application.Services.Notifications;

public interface INotificationService
{
    Task SendSmsAsync(string phoneNumber, string message, NotificationSendContext? context = null);
    Task SendEmailAsync(string email, string subject, string body, NotificationSendContext? context = null);
}
