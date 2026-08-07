namespace Salmandyar.Domain.Entities.Content;

public class ArticleTag
{
    public int ArticleId { get; set; }

    public virtual Article Article { get; set; } = null!;

    public int ContentTagId { get; set; }

    public virtual ContentTag ContentTag { get; set; } = null!;
}
