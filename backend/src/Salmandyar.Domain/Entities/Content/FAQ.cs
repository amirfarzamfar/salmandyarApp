using System.ComponentModel.DataAnnotations;

namespace Salmandyar.Domain.Entities.Content;

public enum FAQEntityType
{
    Article = 0,
    Service = 1,
    Disease = 2,
    City = 3,
    Guide = 4,
    Tool = 5
}

public class FAQ
{
    public int Id { get; set; }

    public FAQEntityType EntityType { get; set; }

    public int EntityId { get; set; }

    [MaxLength(500)]
    public string Question { get; set; } = string.Empty;

    public string Answer { get; set; } = string.Empty;

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
