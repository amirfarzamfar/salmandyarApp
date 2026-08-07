using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Constants;
using Salmandyar.Domain.Entities.Content;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.API.Controllers;

[Authorize(Roles = Roles.SuperAdmin + "," + Roles.Admin + "," + Roles.Manager)]
[ApiController]
[Route("api/admin/content")]
public class AdminContentController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminContentController(ApplicationDbContext db)
    {
        _db = db;
    }

    #region ContentCategory

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult<List<object>>> GetCategories()
    {
        var categories = await _db.ContentCategories
            .AsNoTracking()
            .OrderBy(c => c.ParentId.HasValue).ThenBy(c => c.DisplayOrder).ThenBy(c => c.Id)
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.Description,
                c.ParentId, c.DisplayOrder, c.IsActive, c.ShowInMenu,
                c.MetaTitle, c.MetaDescription, c.CanonicalUrl, c.CoverImageUrl,
                c.CreatedAt, c.UpdatedAt,
                ArticleCount = c.Articles.Count,
                ChildrenCount = c.Children.Count,
                ParentName = c.Parent != null ? c.Parent.Name : null
            })
            .ToListAsync();
        return Ok(categories);
    }

    [HttpGet("categories/{id:int}")]
    public async Task<ActionResult<object>> GetCategory(int id)
    {
        var cat = await _db.ContentCategories.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return NotFound(new { message = "دسته‌بندی یافت نشد" });
        return Ok(new { cat.Id, cat.Name, cat.Slug, cat.Description, cat.ParentId, cat.DisplayOrder,
                        cat.IsActive, cat.ShowInMenu, cat.MetaTitle, cat.MetaDescription,
                        cat.CanonicalUrl, cat.CoverImageUrl, cat.CreatedAt, cat.UpdatedAt });
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest(new { message = "نام و نامک الزامی است" });

        if (await _db.ContentCategories.AnyAsync(c => c.Slug == dto.Slug))
            return Conflict(new { message = "این نامک قبلاً ثبت شده است" });

        var cat = new ContentCategory
        {
            Name = dto.Name.Trim(),
            Slug = dto.Slug.Trim().ToLowerInvariant(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            ParentId = dto.ParentId > 0 ? dto.ParentId : null,
            DisplayOrder = dto.DisplayOrder,
            IsActive = dto.IsActive,
            ShowInMenu = dto.ShowInMenu,
            MetaTitle = string.IsNullOrWhiteSpace(dto.MetaTitle) ? null : dto.MetaTitle.Trim(),
            MetaDescription = string.IsNullOrWhiteSpace(dto.MetaDescription) ? null : dto.MetaDescription.Trim(),
            CoverImageUrl = string.IsNullOrWhiteSpace(dto.CoverImageUrl) ? null : dto.CoverImageUrl.Trim()
        };
        _db.ContentCategories.Add(cat);
        await _db.SaveChangesAsync();
        return Ok(new { message = "دسته‌بندی با موفقیت ایجاد شد", id = cat.Id, name = cat.Name, slug = cat.Slug });
    }

    [HttpPut("categories/{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
    {
        var cat = await _db.ContentCategories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return NotFound(new { message = "دسته‌بندی یافت نشد" });

        if (!string.IsNullOrWhiteSpace(dto.Slug) && dto.Slug.Trim().ToLowerInvariant() != cat.Slug)
        {
            if (await _db.ContentCategories.AnyAsync(c => c.Slug == dto.Slug.Trim().ToLowerInvariant() && c.Id != id))
                return Conflict(new { message = "این نامک قبلاً ثبت شده است" });
            cat.Slug = dto.Slug.Trim().ToLowerInvariant();
        }
        if (!string.IsNullOrWhiteSpace(dto.Name)) cat.Name = dto.Name.Trim();
        if (dto.Description != null) cat.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        if (dto.ParentId.HasValue) cat.ParentId = dto.ParentId > 0 ? dto.ParentId : null;
        if (dto.DisplayOrder.HasValue) cat.DisplayOrder = dto.DisplayOrder.Value;
        if (dto.IsActive.HasValue) cat.IsActive = dto.IsActive.Value;
        if (dto.ShowInMenu.HasValue) cat.ShowInMenu = dto.ShowInMenu.Value;
        if (dto.MetaTitle != null) cat.MetaTitle = string.IsNullOrWhiteSpace(dto.MetaTitle) ? null : dto.MetaTitle.Trim();
        if (dto.MetaDescription != null) cat.MetaDescription = string.IsNullOrWhiteSpace(dto.MetaDescription) ? null : dto.MetaDescription.Trim();
        if (dto.CoverImageUrl != null) cat.CoverImageUrl = string.IsNullOrWhiteSpace(dto.CoverImageUrl) ? null : dto.CoverImageUrl.Trim();
        cat.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "دسته‌بندی با موفقیت به‌روزرسانی شد", id = cat.Id });
    }

    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var cat = await _db.ContentCategories.Include(c => c.Children).Include(c => c.Articles).FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return NotFound(new { message = "دسته‌بندی یافت نشد" });
        if (cat.Children.Count > 0) return BadRequest(new { message = "ابتدا زیرمجموعه‌های این دسته‌بندی را حذف کنید" });
        if (cat.Articles.Count > 0) return BadRequest(new { message = "این دسته‌بندی دارای مقاله است و قابل حذف نیست" });
        _db.ContentCategories.Remove(cat);
        await _db.SaveChangesAsync();
        return Ok(new { message = "دسته‌بندی با موفقیت حذف شد", id });
    }

    public record CreateCategoryDto(string Name, string Slug, string? Description = null,
        int ParentId = 0, int DisplayOrder = 0, bool IsActive = true, bool ShowInMenu = true,
        string? MetaTitle = null, string? MetaDescription = null, string? CoverImageUrl = null);

    public record UpdateCategoryDto(string? Name = null, string? Slug = null, string? Description = null,
        int? ParentId = null, int? DisplayOrder = null, bool? IsActive = null, bool? ShowInMenu = null,
        string? MetaTitle = null, string? MetaDescription = null, string? CoverImageUrl = null);

    #endregion

    #region ContentTag

    [HttpGet("tags")]
    [AllowAnonymous]
    public async Task<ActionResult<List<object>>> GetTags()
    {
        var tags = await _db.ContentTags
            .AsNoTracking()
            .OrderByDescending(t => t.ArticleTags.Count).ThenBy(t => t.Name)
            .Select(t => new
            {
                t.Id, t.Name, t.Slug, t.Description, t.IsActive,
                t.MetaTitle, t.MetaDescription, t.CoverImageUrl,
                t.CreatedAt, t.UpdatedAt,
                ArticleCount = t.ArticleTags.Count
            })
            .ToListAsync();
        return Ok(tags);
    }

    [HttpGet("tags/{id:int}")]
    public async Task<ActionResult<object>> GetTag(int id)
    {
        var tag = await _db.ContentTags.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (tag == null) return NotFound(new { message = "برچسب یافت نشد" });
        return Ok(new { tag.Id, tag.Name, tag.Slug, tag.Description, tag.IsActive,
                        tag.MetaTitle, tag.MetaDescription, tag.CoverImageUrl, tag.CreatedAt, tag.UpdatedAt });
    }

    [HttpPost("tags")]
    public async Task<IActionResult> CreateTag([FromBody] CreateTagDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest(new { message = "نام و نامک الزامی است" });

        if (await _db.ContentTags.AnyAsync(t => t.Slug == dto.Slug.Trim().ToLowerInvariant()))
            return Conflict(new { message = "این نامک قبلاً ثبت شده است" });

        var tag = new ContentTag
        {
            Name = dto.Name.Trim(),
            Slug = dto.Slug.Trim().ToLowerInvariant(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            IsActive = dto.IsActive,
            MetaTitle = string.IsNullOrWhiteSpace(dto.MetaTitle) ? null : dto.MetaTitle.Trim(),
            MetaDescription = string.IsNullOrWhiteSpace(dto.MetaDescription) ? null : dto.MetaDescription.Trim(),
            CoverImageUrl = string.IsNullOrWhiteSpace(dto.CoverImageUrl) ? null : dto.CoverImageUrl.Trim()
        };
        _db.ContentTags.Add(tag);
        await _db.SaveChangesAsync();
        return Ok(new { message = "برچسب با موفقیت ایجاد شد", id = tag.Id, name = tag.Name, slug = tag.Slug });
    }

    [HttpPut("tags/{id:int}")]
    public async Task<IActionResult> UpdateTag(int id, [FromBody] UpdateTagDto dto)
    {
        var tag = await _db.ContentTags.FirstOrDefaultAsync(t => t.Id == id);
        if (tag == null) return NotFound(new { message = "برچسب یافت نشد" });

        if (!string.IsNullOrWhiteSpace(dto.Slug) && dto.Slug.Trim().ToLowerInvariant() != tag.Slug)
        {
            if (await _db.ContentTags.AnyAsync(t => t.Slug == dto.Slug.Trim().ToLowerInvariant() && t.Id != id))
                return Conflict(new { message = "این نامک قبلاً ثبت شده است" });
            tag.Slug = dto.Slug.Trim().ToLowerInvariant();
        }
        if (!string.IsNullOrWhiteSpace(dto.Name)) tag.Name = dto.Name.Trim();
        if (dto.Description != null) tag.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        if (dto.IsActive.HasValue) tag.IsActive = dto.IsActive.Value;
        if (dto.MetaTitle != null) tag.MetaTitle = string.IsNullOrWhiteSpace(dto.MetaTitle) ? null : dto.MetaTitle.Trim();
        if (dto.MetaDescription != null) tag.MetaDescription = string.IsNullOrWhiteSpace(dto.MetaDescription) ? null : dto.MetaDescription.Trim();
        if (dto.CoverImageUrl != null) tag.CoverImageUrl = string.IsNullOrWhiteSpace(dto.CoverImageUrl) ? null : dto.CoverImageUrl.Trim();
        tag.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new { message = "برچسب با موفقیت به‌روزرسانی شد", id = tag.Id });
    }

    [HttpDelete("tags/{id:int}")]
    public async Task<IActionResult> DeleteTag(int id)
    {
        var tag = await _db.ContentTags.Include(t => t.ArticleTags).FirstOrDefaultAsync(t => t.Id == id);
        if (tag == null) return NotFound(new { message = "برچسب یافت نشد" });
        if (tag.ArticleTags.Count > 0) _db.ArticleTags.RemoveRange(tag.ArticleTags);
        _db.ContentTags.Remove(tag);
        await _db.SaveChangesAsync();
        return Ok(new { message = "برچسب با موفقیت حذف شد", id });
    }

    public record CreateTagDto(string Name, string Slug, string? Description = null,
        bool IsActive = true, string? MetaTitle = null, string? MetaDescription = null, string? CoverImageUrl = null);

    public record UpdateTagDto(string? Name = null, string? Slug = null, string? Description = null,
        bool? IsActive = null, string? MetaTitle = null, string? MetaDescription = null, string? CoverImageUrl = null);

    #endregion

    #region Articles

    [HttpGet("articles")]
    public async Task<ActionResult<object>> GetArticles(int page = 1, int pageSize = 20, string? search = null,
        int? categoryId = null, string? status = null, bool? onlyMedical = null)
    {
        var q = _db.Articles.AsNoTracking()
            .Include(a => a.Author)
            .Include(a => a.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(a => a.Title.Contains(search) || (a.Excerpt != null && a.Excerpt.Contains(search)) ||
                             (a.Author != null && (a.Author.FirstName.Contains(search) || a.Author.LastName.Contains(search))) ||
                             a.Slug.Contains(search));
        if (categoryId.HasValue) q = q.Where(a => a.CategoryId == categoryId);
        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ArticleStatus>(status, true, out var s))
            q = q.Where(a => a.Status == s);
        if (onlyMedical.HasValue) q = q.Where(a => a.IsMedicalContent == onlyMedical);

        var total = await q.CountAsync();
        var items = await q
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(a => new
            {
                a.Id, a.Title, a.Slug, a.Status, a.Excerpt,
                a.FeaturedImageUrl, a.ViewCount, a.IsFeatured, a.IsMedicalContent, a.IsFactChecked,
                a.EstimatedReadingTimeMinutes, a.CreatedAt, a.PublishedAt, a.UpdatedAt,
                Author = a.Author == null ? null : new { a.Author.Id, a.Author.FirstName, a.Author.LastName, a.Author.Title },
                Category = a.Category == null ? null : new { a.Category.Id, a.Category.Name, a.Category.Slug },
                a.AuthorId, a.CategoryId,
                a.DiseaseId, a.ServiceDefinitionId,
            })
            .ToListAsync();
        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("articles/{id:int}")]
    public async Task<ActionResult<object>> GetArticle(int id)
    {
        var a = await _db.Articles.AsNoTracking()
            .Include(a => a.Author).Include(a => a.Category)
            .Include(a => a.ArticleTags).ThenInclude(at => at.ContentTag)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (a == null) return NotFound(new { message = "مقاله یافت نشد" });

        return Ok(new
        {
            a.Id, a.Title, a.Slug, a.Content, a.Excerpt, a.ShortAnswer,
            a.EstimatedReadingTimeMinutes, a.FeaturedImageUrl, a.OgImageUrl, a.TwitterImageUrl,
            a.MetaTitle, a.MetaDescription, a.PrimaryKeyword, a.SecondaryKeywordsJson, a.CanonicalUrl,
            a.Status, a.Version, a.PublishedAt, a.LastUpdatedAt,
            a.AuthorId, a.CategoryId, a.ServiceDefinitionId, a.DiseaseId,
            a.ViewCount, a.AllowComments, a.IsFeatured, a.IsMedicalContent, a.IsFactChecked,
            a.CreatedAt, a.UpdatedAt,
            a.Author, a.Category,
            Tags = a.ArticleTags.Select(at => at.ContentTag == null ? null : new { at.ContentTag.Id, at.ContentTag.Name, at.ContentTag.Slug }).ToList()
        });
    }

    [HttpPost("articles")]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title) || string.IsNullOrWhiteSpace(dto.Slug))
            return BadRequest(new { message = "عنوان و نامک مقاله الزامی است" });
        if (dto.AuthorId <= 0) return BadRequest(new { message = "نویسنده الزامی است" });
        if (dto.CategoryId <= 0) return BadRequest(new { message = "دسته‌بندی الزامی است" });

        if (await _db.Articles.AnyAsync(a => a.Slug == dto.Slug.Trim().ToLowerInvariant()))
            return Conflict(new { message = "این نامک مقاله قبلاً ثبت شده است" });
        if (!await _db.Authors.AnyAsync(au => au.Id == dto.AuthorId))
            return BadRequest(new { message = "نویسنده یافت نشد" });
        if (!await _db.ContentCategories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest(new { message = "دسته‌بندی یافت نشد" });

        var status = ArticleStatus.Draft;
        if (dto.Status.ToLower() == "published") status = ArticleStatus.Published;
        else if (dto.Status.ToLower() == "pending") status = ArticleStatus.PendingReview;
        else if (dto.Status.ToLower() == "archived") status = ArticleStatus.Archived;

        var article = new Article
        {
            Title = dto.Title.Trim(),
            Slug = dto.Slug.Trim().ToLowerInvariant(),
            Content = dto.Content ?? string.Empty,
            Excerpt = string.IsNullOrWhiteSpace(dto.Excerpt) ? null : dto.Excerpt.Trim(),
            ShortAnswer = string.IsNullOrWhiteSpace(dto.ShortAnswer) ? null : dto.ShortAnswer.Trim(),
            EstimatedReadingTimeMinutes = dto.EstimatedReadingTimeMinutes > 0 ? dto.EstimatedReadingTimeMinutes : null,
            FeaturedImageUrl = string.IsNullOrWhiteSpace(dto.FeaturedImageUrl) ? null : dto.FeaturedImageUrl.Trim(),
            OgImageUrl = string.IsNullOrWhiteSpace(dto.OgImageUrl) ? null : dto.OgImageUrl.Trim(),
            MetaTitle = string.IsNullOrWhiteSpace(dto.MetaTitle) ? null : dto.MetaTitle.Trim(),
            MetaDescription = string.IsNullOrWhiteSpace(dto.MetaDescription) ? null : dto.MetaDescription.Trim(),
            PrimaryKeyword = string.IsNullOrWhiteSpace(dto.PrimaryKeyword) ? null : dto.PrimaryKeyword.Trim(),
            SecondaryKeywordsJson = dto.SecondaryKeywordsJson,
            CanonicalUrl = string.IsNullOrWhiteSpace(dto.CanonicalUrl) ? null : dto.CanonicalUrl.Trim(),
            Status = status,
            PublishedAt = status == ArticleStatus.Published ? (DateTime.UtcNow) : null,
            LastUpdatedAt = DateTime.UtcNow,
            AuthorId = dto.AuthorId,
            CategoryId = dto.CategoryId,
            ServiceDefinitionId = dto.ServiceDefinitionId > 0 ? dto.ServiceDefinitionId : null,
            DiseaseId = dto.DiseaseId > 0 ? dto.DiseaseId : null,
            IsFeatured = dto.IsFeatured,
            IsMedicalContent = dto.IsMedicalContent,
            IsFactChecked = dto.IsFactChecked,
            AllowComments = dto.AllowComments
        };
        _db.Articles.Add(article);

        if (dto.TagIds != null && dto.TagIds.Count > 0)
        {
            foreach (var tid in dto.TagIds.Where(t => t > 0))
            {
                if (await _db.ContentTags.AnyAsync(ct => ct.Id == tid))
                    _db.ArticleTags.Add(new ArticleTag { Article = article, ContentTagId = tid });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "مقاله با موفقیت ایجاد شد", id = article.Id, title = article.Title, slug = article.Slug, status = article.Status.ToString() });
    }

    [HttpPut("articles/{id:int}")]
    public async Task<IActionResult> UpdateArticle(int id, [FromBody] UpdateArticleDto dto)
    {
        var article = await _db.Articles.Include(a => a.ArticleTags).FirstOrDefaultAsync(a => a.Id == id);
        if (article == null) return NotFound(new { message = "مقاله یافت نشد" });

        if (!string.IsNullOrWhiteSpace(dto.Slug) && dto.Slug.Trim().ToLowerInvariant() != article.Slug)
        {
            if (await _db.Articles.AnyAsync(a => a.Slug == dto.Slug.Trim().ToLowerInvariant() && a.Id != id))
                return Conflict(new { message = "این نامک مقاله قبلاً ثبت شده است" });
            article.Slug = dto.Slug.Trim().ToLowerInvariant();
        }
        if (!string.IsNullOrWhiteSpace(dto.Title)) article.Title = dto.Title.Trim();
        if (dto.Content != null) article.Content = dto.Content;
        if (dto.Excerpt != null) article.Excerpt = string.IsNullOrWhiteSpace(dto.Excerpt) ? null : dto.Excerpt.Trim();
        if (dto.ShortAnswer != null) article.ShortAnswer = string.IsNullOrWhiteSpace(dto.ShortAnswer) ? null : dto.ShortAnswer.Trim();
        if (dto.EstimatedReadingTimeMinutes.HasValue)
            article.EstimatedReadingTimeMinutes = dto.EstimatedReadingTimeMinutes > 0 ? dto.EstimatedReadingTimeMinutes : null;
        if (dto.FeaturedImageUrl != null) article.FeaturedImageUrl = string.IsNullOrWhiteSpace(dto.FeaturedImageUrl) ? null : dto.FeaturedImageUrl.Trim();
        if (dto.OgImageUrl != null) article.OgImageUrl = string.IsNullOrWhiteSpace(dto.OgImageUrl) ? null : dto.OgImageUrl.Trim();
        if (dto.MetaTitle != null) article.MetaTitle = string.IsNullOrWhiteSpace(dto.MetaTitle) ? null : dto.MetaTitle.Trim();
        if (dto.MetaDescription != null) article.MetaDescription = string.IsNullOrWhiteSpace(dto.MetaDescription) ? null : dto.MetaDescription.Trim();
        if (dto.PrimaryKeyword != null) article.PrimaryKeyword = string.IsNullOrWhiteSpace(dto.PrimaryKeyword) ? null : dto.PrimaryKeyword.Trim();
        if (dto.SecondaryKeywordsJson != null) article.SecondaryKeywordsJson = dto.SecondaryKeywordsJson;
        if (dto.CanonicalUrl != null) article.CanonicalUrl = string.IsNullOrWhiteSpace(dto.CanonicalUrl) ? null : dto.CanonicalUrl.Trim();
        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            var st = article.Status;
            if (dto.Status.ToLower() == "published") st = ArticleStatus.Published;
            else if (dto.Status.ToLower() == "pending") st = ArticleStatus.PendingReview;
            else if (dto.Status.ToLower() == "archived") st = ArticleStatus.Archived;
            else if (dto.Status.ToLower() == "draft") st = ArticleStatus.Draft;
            if (st != article.Status)
            {
                article.Status = st;
                if (st == ArticleStatus.Published && article.PublishedAt == null) article.PublishedAt = DateTime.UtcNow;
            }
        }
        if (dto.AuthorId.HasValue && dto.AuthorId > 0) article.AuthorId = dto.AuthorId.Value;
        if (dto.CategoryId.HasValue && dto.CategoryId > 0) article.CategoryId = dto.CategoryId.Value;
        if (dto.ServiceDefinitionId.HasValue) article.ServiceDefinitionId = dto.ServiceDefinitionId > 0 ? dto.ServiceDefinitionId : null;
        if (dto.DiseaseId.HasValue) article.DiseaseId = dto.DiseaseId > 0 ? dto.DiseaseId : null;
        if (dto.IsFeatured.HasValue) article.IsFeatured = dto.IsFeatured.Value;
        if (dto.IsMedicalContent.HasValue) article.IsMedicalContent = dto.IsMedicalContent.Value;
        if (dto.IsFactChecked.HasValue) article.IsFactChecked = dto.IsFactChecked.Value;
        if (dto.AllowComments.HasValue) article.AllowComments = dto.AllowComments.Value;
        article.UpdatedAt = DateTime.UtcNow;
        article.LastUpdatedAt = DateTime.UtcNow;

        if (dto.TagIds != null)
        {
            _db.ArticleTags.RemoveRange(article.ArticleTags);
            foreach (var tid in dto.TagIds.Where(t => t > 0))
            {
                if (await _db.ContentTags.AnyAsync(ct => ct.Id == tid))
                    _db.ArticleTags.Add(new ArticleTag { ArticleId = article.Id, ContentTagId = tid });
            }
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "مقاله با موفقیت به‌روزرسانی شد", id = article.Id, title = article.Title, status = article.Status.ToString() });
    }

    [HttpDelete("articles/{id:int}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _db.Articles.Include(a => a.ArticleTags).FirstOrDefaultAsync(a => a.Id == id);
        if (article == null) return NotFound(new { message = "مقاله یافت نشد" });
        if (article.ArticleTags.Count > 0) _db.ArticleTags.RemoveRange(article.ArticleTags);
        _db.Articles.Remove(article);
        await _db.SaveChangesAsync();
        return Ok(new { message = "مقاله با موفقیت حذف شد", id });
    }

    [HttpPost("articles/{id:int}/publish")]
    public async Task<IActionResult> PublishArticle(int id)
    {
        var a = await _db.Articles.FirstOrDefaultAsync(a => a.Id == id);
        if (a == null) return NotFound(new { message = "مقاله یافت نشد" });
        a.Status = ArticleStatus.Published;
        a.PublishedAt ??= DateTime.UtcNow;
        a.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "مقاله منتشر شد", id, publishedAt = a.PublishedAt });
    }

    [HttpPost("articles/{id:int}/unpublish")]
    public async Task<IActionResult> UnpublishArticle(int id)
    {
        var a = await _db.Articles.FirstOrDefaultAsync(a => a.Id == id);
        if (a == null) return NotFound(new { message = "مقاله یافت نشد" });
        a.Status = ArticleStatus.Draft;
        a.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(new { message = "مقاله از حالت انتشار خارج شد", id });
    }

    public record CreateArticleDto(
        string Title, string Slug, int AuthorId, int CategoryId,
        string? Content = null, string? Excerpt = null, string? ShortAnswer = null,
        int EstimatedReadingTimeMinutes = 0,
        string? FeaturedImageUrl = null, string? OgImageUrl = null,
        string? MetaTitle = null, string? MetaDescription = null,
        string? PrimaryKeyword = null, string? SecondaryKeywordsJson = null,
        string? CanonicalUrl = null, string Status = "Draft",
        int ServiceDefinitionId = 0, int DiseaseId = 0,
        bool IsFeatured = false, bool IsMedicalContent = true, bool IsFactChecked = false,
        bool AllowComments = true, List<int>? TagIds = null);

    public record UpdateArticleDto(
        string? Title = null, string? Slug = null, int? AuthorId = null, int? CategoryId = null,
        string? Content = null, string? Excerpt = null, string? ShortAnswer = null,
        int? EstimatedReadingTimeMinutes = null,
        string? FeaturedImageUrl = null, string? OgImageUrl = null,
        string? MetaTitle = null, string? MetaDescription = null,
        string? PrimaryKeyword = null, string? SecondaryKeywordsJson = null,
        string? CanonicalUrl = null, string? Status = null,
        int? ServiceDefinitionId = null, int? DiseaseId = null,
        bool? IsFeatured = null, bool? IsMedicalContent = null, bool? IsFactChecked = null,
        bool? AllowComments = null, List<int>? TagIds = null);

    #endregion
}
