using Salmandyar.Domain.Enums;

namespace Salmandyar.Domain.Entities;

public class UserNotification
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;
    public virtual User User { get; set; } = null!;

    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    
    public NotificationType Type { get; set; } = NotificationType.System;
    public string? ReferenceId { get; set; } // e.g., AssignmentId
    public string? Link { get; set; } // URL to navigate to

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
