using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Salmandyar.Domain.Entities.Content;
using Salmandyar.Infrastructure.Persistence;

namespace Salmandyar.API.Controllers;

[ApiController]
[Route("api/public/content")]
[AllowAnonymous]
public class PublicContentController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PublicContentController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet("home")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHomePageData()
    {
        var featuredArticles = await _db.Articles
            .AsNoTracking()
            .Where(a => a.Status == ArticleStatus.Published && a.IsFeatured)
            .Include(a => a.Author)
            .Include(a => a.Category)
            .OrderByDescending(a => a.PublishedAt)
            .Take(3)
            .Select(a => new
            {
                a.Id, a.Title, a.Slug, Excerpt = a.Excerpt,
                a.FeaturedImageUrl, ReadingTime = a.EstimatedReadingTimeMinutes, a.PublishedAt,
                Category = new { a.Category.Id, a.Category.Name, a.Category.Slug },
                Author = new { a.Author.Id, a.Author.FirstName, a.Author.LastName, a.Author.Title, a.Author.ProfileImageUrl, a.Author.Slug }
            })
            .ToListAsync();

        var seoProfiles = await _db.ServiceSeoProfiles
            .AsNoTracking()
            .Include(sp => sp.ServiceDefinition)
            .Where(sp => sp.IsFeatured && sp.ShowInHomePage)
            .OrderBy(sp => sp.DisplayOrder)
            .Take(4)
            .Select(sp => new
            {
                Service = new { sp.ServiceDefinition.Id, sp.ServiceDefinition.Code, sp.ServiceDefinition.Title, sp.ServiceDefinition.Description, sp.ServiceDefinition.Category },
                Seo = new { sp.Slug, sp.MetaTitle, sp.MetaDescription, sp.StartingPrice, sp.PriceRangeText, HeroImage = sp.HeroImageUrl }
            })
            .ToListAsync();

        var featuredDiseases = await _db.Diseases
            .AsNoTracking()
            .Where(d => d.IsActive && d.PrevalenceRank.HasValue)
            .OrderBy(d => d.PrevalenceRank)
            .Take(5)
            .Select(d => new { d.Id, d.Name, d.Slug, d.SeverityLevel, d.PrevalenceRank, ShortDescription = d.ShortDescription })
            .ToListAsync();

        return Ok(new { FeaturedArticles = featuredArticles, FeaturedServices = seoProfiles, FeaturedDiseases = featuredDiseases });
    }

    [HttpGet("megamenu")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMegamenu()
    {
        var categories = await _db.ContentCategories
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.DisplayOrder,
                Articles = _db.Articles
                    .Where(a => a.Status == ArticleStatus.Published && a.CategoryId == c.Id)
                    .OrderByDescending(a => a.PublishedAt)
                    .Take(5)
                    .Select(a => new { a.Id, a.Title, a.Slug, a.PublishedAt })
                    .ToList()
            })
            .ToListAsync();

        var services = await _db.ServiceSeoProfiles
            .AsNoTracking()
            .Include(sp => sp.ServiceDefinition)
            .OrderBy(sp => sp.DisplayOrder)
            .Select(sp => new { sp.ServiceDefinition.Id, sp.ServiceDefinition.Code, sp.ServiceDefinition.Title, sp.Slug })
            .ToListAsync();

        var diseases = await _db.Diseases
            .AsNoTracking()
            .Where(d => d.IsActive && d.PrevalenceRank.HasValue)
            .OrderBy(d => d.PrevalenceRank)
            .Take(8)
            .Select(d => new { d.Id, d.Name, d.Slug })
            .ToListAsync();

        var cities = await _db.Cities
            .AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new { c.Id, c.Name, c.Slug })
            .ToListAsync();

        return Ok(new { Categories = categories, Services = services, Diseases = diseases, Cities = cities });
    }

    [HttpGet("articles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListArticles([FromQuery] int page = 1, [FromQuery] int pageSize = 9, [FromQuery] int? categoryId = null, [FromQuery] int? diseaseId = null, [FromQuery] string? search = null)
    {
        var query = _db.Articles
            .AsNoTracking()
            .Where(a => a.Status == ArticleStatus.Published)
            .Include(a => a.Author)
            .Include(a => a.Category)
            .AsQueryable();

        if (categoryId.HasValue) query = query.Where(a => a.CategoryId == categoryId.Value);
        if (diseaseId.HasValue) query = query.Where(a => a.DiseaseId == diseaseId.Value);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(a => a.Title.Contains(search) || (a.Excerpt != null && a.Excerpt.Contains(search)) || a.Content.Contains(search));

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                a.Id, a.Title, a.Slug, Excerpt = a.Excerpt,
                a.FeaturedImageUrl, ReadingTime = a.EstimatedReadingTimeMinutes, a.PublishedAt, a.LastUpdatedAt,
                a.ViewCount, a.IsMedicalContent, a.IsFactChecked,
                Category = new { a.Category.Id, a.Category.Name, a.Category.Slug },
                Author = new { a.Author.Id, a.Author.FirstName, a.Author.LastName, a.Author.Title, a.Author.ProfileImageUrl, a.Author.Slug }
            })
            .ToListAsync();

        return Ok(new { Total = total, Page = page, PageSize = pageSize, Items = items });
    }

    [HttpGet("articles/featured")]
    public async Task<IActionResult> GetFeaturedArticles([FromQuery] int count = 3)
    {
        var items = await _db.Articles
            .AsNoTracking()
            .Where(a => a.Status == ArticleStatus.Published && a.IsFeatured)
            .Include(a => a.Author)
            .Include(a => a.Category)
            .OrderByDescending(a => a.PublishedAt)
            .Take(count)
            .Select(a => new
            {
                a.Id, a.Title, a.Slug, Excerpt = a.Excerpt, a.FeaturedImageUrl, ReadingTime = a.EstimatedReadingTimeMinutes, a.PublishedAt,
                Category = new { a.Category.Id, a.Category.Name, a.Category.Slug },
                Author = new { a.Author.Id, a.Author.FirstName, a.Author.LastName, a.Author.Title, a.Author.Slug, a.Author.ProfileImageUrl }
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("articles/recent")]
    public async Task<IActionResult> GetRecentArticles([FromQuery] int count = 5, [FromQuery] int? excludeId = null)
    {
        var query = _db.Articles.AsNoTracking().Where(a => a.Status == ArticleStatus.Published);
        if (excludeId.HasValue) query = query.Where(a => a.Id != excludeId.Value);
        var items = await query
            .Include(a => a.Author)
            .OrderByDescending(a => a.PublishedAt)
            .Take(count)
            .Select(a => new { a.Id, a.Title, a.Slug, a.FeaturedImageUrl, a.PublishedAt, ReadingTime = a.EstimatedReadingTimeMinutes, AuthorSlug = a.Author.Slug })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("articles/{slug}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> GetArticleBySlug(string slug)
{
    var article = await _db.Articles
        .AsNoTracking()
        .AsSplitQuery()
        .Where(a => a.Status == ArticleStatus.Published && a.Slug == slug)
        .Include(a => a.Author)
        .Include(a => a.Category)
        .Include(a => a.RelatedDisease)
        .Include(a => a.RelatedService)
        .Include(a => a.ArticleTags).ThenInclude(t => t.ContentTag)
        .Include(a => a.MedicalReviews).ThenInclude(m => m.MedicalReviewer)
        .Include(a => a.Sources)
        .FirstOrDefaultAsync();


        if (article == null) return NotFound($"Article with slug '{slug}' not found.");

        var faqs = await _db.FAQs
            .AsNoTracking()
            .Where(f => f.EntityType == FAQEntityType.Article && f.EntityId == article.Id && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new { f.Id, f.Question, f.Answer, f.DisplayOrder })
            .ToListAsync();

        var internalLinks = await _db.InternalLinks
            .AsNoTracking()
            .Where(l => l.SourceArticleId == article.Id && l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .Select(l => new
            {
                l.Id, l.AnchorText, l.Title, l.Description, l.TargetType,
                l.TargetServiceId, l.TargetDiseaseId, l.TargetGuideId, l.TargetToolId, l.TargetCityId, l.TargetArticleId, l.TargetCustomUrl
            })
            .ToListAsync();

        return Ok(new
        {
            article.Id, article.Title, article.Slug, article.Content, Excerpt = article.Excerpt,
            article.ShortAnswer, article.FeaturedImageUrl, GalleryImages = article.ImageGalleryJson,
            ReadingTime = article.EstimatedReadingTimeMinutes, article.PublishedAt, article.LastUpdatedAt,
            Version = article.Version, article.ViewCount, article.IsMedicalContent, article.IsFactChecked,
            article.MetaTitle, article.MetaDescription, article.CanonicalUrl, article.PrimaryKeyword, article.SecondaryKeywordsJson,
            OgImage = article.OgImageUrl, TwitterImage = article.TwitterImageUrl,
            Category = article.Category == null ? null : new { article.Category.Id, article.Category.Name, article.Category.Slug },
            Author = new
            {
                article.Author.Id, article.Author.FirstName, article.Author.LastName, article.Author.Title,
                article.Author.Specialization, article.Author.ExperienceSummary, article.Author.YearsOfExperience,
                article.Author.ProfileImageUrl, article.Author.Slug, article.Author.MedicalLicenseNumber,
                article.Author.IsMedicalReviewer, article.Author.Email
            },
            RelatedDisease = article.RelatedDisease == null ? null : new { article.RelatedDisease.Id, article.RelatedDisease.Name, article.RelatedDisease.Slug },
            RelatedService = article.RelatedService == null ? null : new { article.RelatedService.Id, article.RelatedService.Code, article.RelatedService.Title },
            Tags = article.ArticleTags.Select(t => new { t.ContentTag.Id, t.ContentTag.Name, t.ContentTag.Slug }).ToList(),
            MedicalReviews = article.MedicalReviews.Select(r => new
            {
                r.Id, r.IsApproved, r.ReviewNotes, r.ReviewedAt, r.ExpiresAt,
                Reviewer = new
                {
                    r.MedicalReviewer.FirstName, r.MedicalReviewer.LastName, r.MedicalReviewer.Title,
                    r.MedicalReviewer.Slug, r.MedicalReviewer.MedicalLicenseNumber, r.MedicalReviewer.YearsOfExperience
                }
            }).ToList(),
            Sources = article.Sources.Select(s => new { s.Id, s.Title, s.Url, s.Publisher, s.PublicationYear, s.DisplayOrder }).ToList(),
            FAQs = faqs,
            InternalLinks = internalLinks
        });
    }

    [HttpGet("articles/{slug}/related")]
    public async Task<IActionResult> GetRelatedArticles(string slug, [FromQuery] int count = 4)
    {
        var article = await _db.Articles.AsNoTracking().FirstOrDefaultAsync(a => a.Slug == slug);
        if (article == null) return NotFound();

        var sameCat = article.CategoryId > 0
            ? _db.Articles.AsNoTracking().Where(a => a.Status == ArticleStatus.Published && a.Id != article.Id && a.CategoryId == article.CategoryId)
            : null;
        var sameDis = article.DiseaseId.HasValue
            ? _db.Articles.AsNoTracking().Where(a => a.Status == ArticleStatus.Published && a.Id != article.Id && a.DiseaseId == article.DiseaseId.Value)
            : null;
        var q = sameCat ?? (sameDis ?? _db.Articles.AsNoTracking().Where(a => a.Status == ArticleStatus.Published && a.Id != article.Id));

        var items = await q
            .Include(a => a.Author)
            .Include(a => a.Category)
            .OrderByDescending(a => a.PublishedAt)
            .Take(count)
            .Select(a => new
            {
                a.Id, a.Title, a.Slug, a.FeaturedImageUrl, ReadingTime = a.EstimatedReadingTimeMinutes,
                a.PublishedAt, Category = new { a.Category.Name, a.Category.Slug }, AuthorSlug = a.Author.Slug
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> ListCategories()
    {
        var items = await _db.ContentCategories.AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.Description, c.DisplayOrder, c.MetaTitle, c.MetaDescription,
                ArticleCount = _db.Articles.Count(a => a.Status == ArticleStatus.Published && a.CategoryId == c.Id)
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("categories/{slug}")]
    public async Task<IActionResult> GetCategoryBySlug(string slug)
    {
        var c = await _db.ContentCategories.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == slug);
        if (c == null) return NotFound();
        return Ok(new { c.Id, c.Name, c.Slug, c.Description, c.DisplayOrder, c.MetaTitle, c.MetaDescription });
    }

    [HttpGet("tags")]
    public async Task<IActionResult> ListTags()
    {
        var items = await _db.ContentTags.AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new { t.Id, t.Name, t.Slug, t.Description })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("diseases")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListDiseases([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        var query = _db.Diseases.AsNoTracking().Where(d => d.IsActive).AsQueryable();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(d => d.Name.Contains(search));
        var total = await query.CountAsync();
        var items = await query
            .OrderBy(d => d.PrevalenceRank)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                d.Id, d.Name, d.Slug, d.Icd10Code, d.SeverityLevel, d.PrevalenceRank,
                ShortDescription = d.ShortDescription, d.CoverImageUrl, IsActive = d.IsActive,
                RequiresImmediateMedicalAttention = d.RequiresImmediateMedicalAttention,
                d.MetaTitle, d.MetaDescription
            })
            .ToListAsync();
        return Ok(new { Total = total, Page = page, PageSize = pageSize, Items = items });
    }

    [HttpGet("diseases/featured")]
    public async Task<IActionResult> GetFeaturedDiseases([FromQuery] int count = 6)
    {
        var items = await _db.Diseases.AsNoTracking()
            .Where(d => d.IsActive && d.PrevalenceRank.HasValue)
            .OrderBy(d => d.PrevalenceRank)
            .Take(count)
            .Select(d => new { d.Id, d.Name, d.Slug, d.SeverityLevel, ShortDescription = d.ShortDescription, d.CoverImageUrl })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("diseases/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDiseaseBySlug(string slug)
    {
        var disease = await _db.Diseases.AsNoTracking()
            .Include(d => d.MedicalReviewer)
            .FirstOrDefaultAsync(d => d.Slug == slug);
        if (disease == null) return NotFound($"Disease '{slug}' not found.");

        var faqs = await _db.FAQs.AsNoTracking()
            .Where(f => f.EntityType == FAQEntityType.Disease && f.EntityId == disease.Id && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new { f.Id, f.Question, f.Answer, f.DisplayOrder })
            .ToListAsync();

        var relatedArticles = await _db.Articles.AsNoTracking()
            .Where(a => a.Status == ArticleStatus.Published && a.DiseaseId == disease.Id)
            .OrderByDescending(a => a.PublishedAt)
            .Take(4)
            .Select(a => new { a.Id, a.Title, a.Slug, a.FeaturedImageUrl, ReadingTime = a.EstimatedReadingTimeMinutes, a.PublishedAt })
            .ToListAsync();

        return Ok(new
        {
            disease.Id, disease.Name, disease.Slug, disease.Icd10Code, disease.SeverityLevel, disease.PrevalenceRank,
            IsActive = disease.IsActive, RequiresImmediateMedicalAttention = disease.RequiresImmediateMedicalAttention,
            ShortDescription = disease.ShortDescription, disease.Definition, disease.Causes, disease.Symptoms,
            Treatment = disease.Treatment, HomeCareInstructions = disease.HomeCareInstructions, disease.Prevention,
            disease.RiskFactors, disease.Complications, disease.Prognosis,
            Diagnosis = disease.Diagnosis, RelatedServicesJson = disease.RelatedServicesJson,
            disease.CoverImageUrl,
            disease.MetaTitle, disease.MetaDescription, disease.CanonicalUrl, disease.PrimaryKeyword, disease.SecondaryKeywordsJson,
            disease.OgImageUrl,
            disease.CreatedAt, disease.UpdatedAt, disease.ViewCount,
            disease.MedicalReviewerId,
            MedicalReviewer = disease.MedicalReviewer == null ? null : new
            {
                disease.MedicalReviewer.FirstName, disease.MedicalReviewer.LastName,
                disease.MedicalReviewer.Title, disease.MedicalReviewer.Slug, disease.MedicalReviewer.MedicalLicenseNumber
            },
            FAQs = faqs,
            RelatedArticles = relatedArticles
        });
    }

    [HttpGet("cities")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListCities()
    {
        var items = await _db.Cities.AsNoTracking()
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new
            {
                c.Id, c.Name, c.Slug, c.Province, c.DisplayOrder, c.Population,
                c.Latitude, c.Longitude, c.CoverImageUrl, IsActive = c.IsActive
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("cities/featured")]
    public async Task<IActionResult> GetFeaturedCities([FromQuery] int count = 5)
    {
        var items = await _db.Cities.AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .Take(count)
            .Select(c => new { c.Id, c.Name, c.Slug, c.Province, c.CoverImageUrl, Summary = c.AboutRegion })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("cities/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCityBySlug(string slug)
    {
        var city = await _db.Cities.AsNoTracking().FirstOrDefaultAsync(c => c.Slug == slug);
        if (city == null) return NotFound($"City '{slug}' not found.");

        var faqs = await _db.FAQs.AsNoTracking()
            .Where(f => f.EntityType == FAQEntityType.City && f.EntityId == city.Id && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new { f.Id, f.Question, f.Answer, f.DisplayOrder })
            .ToListAsync();

        var cityServices = await _db.CityServices.AsNoTracking()
            .Where(cs => cs.CityId == city.Id)
            .Include(cs => cs.ServiceDefinition)
            .Select(cs => new
            {
                cs.Id, cs.ServiceDefinitionId, cs.ServiceDefinition.Code, cs.ServiceDefinition.Title,
                cs.StartingPrice, cs.PricingNotes, cs.IsActive, cs.EstimatedResponseMinutes, cs.Has24HourService
            })
            .ToListAsync();

        return Ok(new
        {
            city.Id, city.Name, city.Slug, city.Province, ShortDescription = city.ShortDescription,
            Summary = city.AboutRegion, CoveredAreas = city.CoveredAreas, LocalFAQs = city.LocalFAQs,
            city.Latitude, city.Longitude, city.PhoneNumber,
            city.Population,
            city.CoverImageUrl,
            city.MetaTitle, city.MetaDescription, city.CanonicalUrl, city.PrimaryKeyword, city.SecondaryKeywordsJson,
            city.DisplayOrder, IsActive = city.IsActive, city.CreatedAt, city.UpdatedAt, city.ViewCount,
            FAQs = faqs,
            CityServices = cityServices
        });
    }

    [HttpGet("guides")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListGuides([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var total = await _db.Guides.AsNoTracking().Where(g => g.IsActive).CountAsync();
        var items = await _db.Guides.AsNoTracking()
            .Where(g => g.IsActive)
            .Include(g => g.Author)
            .Include(g => g.Category)
            .OrderByDescending(g => g.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => new
            {
                g.Id, g.Title, g.Slug, g.ShortDescription, g.DifficultyLevel,
                EstimatedDuration = g.EstimatedTimeMinutes,
                g.CoverImageUrl, g.CreatedAt, g.ViewCount,
                Category = g.Category != null ? new { g.Category.Id, g.Category.Name, g.Category.Slug } : null,
                Author = g.Author != null ? new { g.Author.FirstName, g.Author.LastName, g.Author.Title, g.Author.Slug, g.Author.ProfileImageUrl } : null
            })
            .ToListAsync();
        return Ok(new { Total = total, Page = page, PageSize = pageSize, Items = items });
    }

    [HttpGet("guides/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGuideBySlug(string slug)
    {
        var guide = await _db.Guides.AsNoTracking()
            .Include(g => g.Author)
            .Include(g => g.Category)
            .FirstOrDefaultAsync(g => g.Slug == slug && g.IsActive);
        if (guide == null) return NotFound($"Guide '{slug}' not found.");

        var faqs = await _db.FAQs.AsNoTracking()
            .Where(f => f.EntityType == FAQEntityType.Guide && f.EntityId == guide.Id && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new { f.Id, f.Question, f.Answer, f.DisplayOrder })
            .ToListAsync();

        return Ok(new
        {
            guide.Id, guide.Title, guide.Slug, guide.ShortDescription, guide.Content,
            Steps = guide.StepByStepInstructions, Tools = guide.ToolsRequired,
            guide.Precautions, guide.WhenToSeekMedicalHelp,
            guide.DifficultyLevel, EstimatedDuration = guide.EstimatedTimeMinutes,
            Video = guide.VideoTutorialUrl, guide.CoverImageUrl,
            guide.CreatedAt, Updated = guide.UpdatedAt, guide.ViewCount,
            guide.MetaTitle, guide.MetaDescription, guide.CanonicalUrl, guide.PrimaryKeyword, guide.SecondaryKeywordsJson,
            Category = guide.Category != null ? new { guide.Category.Id, guide.Category.Name, guide.Category.Slug } : null,
            Author = guide.Author != null ? new
            {
                guide.Author.FirstName, guide.Author.LastName, guide.Author.Title,
                guide.Author.Specialization, guide.Author.YearsOfExperience,
                guide.Author.ProfileImageUrl, guide.Author.Slug, guide.Author.MedicalLicenseNumber
            } : null,
            guide.RelatedDiseaseId, guide.RelatedServiceId,
            FAQs = faqs
        });
    }

    [HttpGet("tools")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListTools()
    {
        var items = await _db.HealthTools.AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new
            {
                t.Id, t.Name, t.Slug, t.ToolType, t.Description, t.ShortDescription,
                t.CoverImageUrl, t.DisplayOrder, t.IsActive, t.ViewCount,
                t.MetaTitle, t.MetaDescription
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("tools/featured")]
    public async Task<IActionResult> GetFeaturedTools([FromQuery] int count = 4)
    {
        var items = await _db.HealthTools.AsNoTracking()
            .Where(t => t.IsActive && t.UsageCount > 0)
            .OrderByDescending(t => t.UsageCount)
            .Take(count)
            .Select(t => new { t.Id, t.Name, t.Slug, t.ToolType, t.ShortDescription, t.CoverImageUrl })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("tools/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetToolBySlug(string slug)
    {
        var tool = await _db.HealthTools.AsNoTracking().FirstOrDefaultAsync(t => t.Slug == slug && t.IsActive);
        if (tool == null) return NotFound($"Tool '{slug}' not found.");

        var faqs = await _db.FAQs.AsNoTracking()
            .Where(f => f.EntityType == FAQEntityType.Tool && f.EntityId == tool.Id && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new { f.Id, f.Question, f.Answer, f.DisplayOrder })
            .ToListAsync();

        return Ok(new
        {
            tool.Id, tool.Name, tool.Slug, tool.ToolType, tool.Description, tool.ShortDescription,
            Config = tool.ToolConfigurationJson, tool.HowToUse, tool.Disclaimers,
            Interpretation = tool.InterpretationGuide,
            tool.CoverImageUrl, tool.OgImageUrl,
            tool.DisplayOrder, tool.IsActive,
            tool.MetaTitle, tool.MetaDescription, tool.CanonicalUrl, tool.PrimaryKeyword, tool.SecondaryKeywordsJson,
            tool.CreatedAt, tool.UpdatedAt, tool.ViewCount, tool.UsageCount,
            FAQs = faqs
        });
    }

    [HttpGet("authors")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListAuthors()
    {
        var items = await _db.Authors.AsNoTracking()
            .Where(a => a.IsActive)
            .OrderByDescending(a => a.YearsOfExperience)
            .Select(a => new
            {
                a.Id, a.FirstName, a.LastName, FullName = a.FirstName + " " + a.LastName,
                a.Title, a.Specialization, a.ExperienceSummary,
                a.YearsOfExperience, a.ProfileImageUrl, a.Slug, a.IsMedicalReviewer, a.MedicalLicenseNumber,
                a.MetaTitle, a.MetaDescription, a.Email,
                ArticleCount = _db.Articles.Count(art => art.Status == ArticleStatus.Published && art.AuthorId == a.Id)
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("authors/medical-reviewers")]
    public async Task<IActionResult> ListMedicalReviewers()
    {
        var items = await _db.Authors.AsNoTracking()
            .Where(a => a.IsActive && a.IsMedicalReviewer)
            .OrderByDescending(a => a.YearsOfExperience)
            .Select(a => new { a.Id, a.FirstName, a.LastName, a.Title, a.Specialization, a.YearsOfExperience, a.MedicalLicenseNumber, a.ProfileImageUrl, a.Slug })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("authors/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuthorBySlug(string slug)
    {
        var author = await _db.Authors.AsNoTracking().FirstOrDefaultAsync(a => a.Slug == slug && a.IsActive);
        if (author == null) return NotFound($"Author '{slug}' not found.");

        var articles = await _db.Articles.AsNoTracking()
            .Where(a => a.Status == ArticleStatus.Published && a.AuthorId == author.Id)
            .Include(a => a.Category)
            .OrderByDescending(a => a.PublishedAt)
            .Select(a => new { a.Id, a.Title, a.Slug, Excerpt = a.Excerpt, a.FeaturedImageUrl, ReadingTime = a.EstimatedReadingTimeMinutes, a.PublishedAt, CategorySlug = a.Category.Slug })
            .ToListAsync();

        var reviewedCount = await _db.ArticleMedicalReviews.AsNoTracking().CountAsync(r => r.MedicalReviewerId == author.Id);

        return Ok(new
        {
            author.Id, author.FirstName, author.LastName, FullName = author.FirstName + " " + author.LastName,
            author.Title, author.Specialization, author.Biography, author.ExperienceSummary,
            author.YearsOfExperience, author.MedicalLicenseNumber,
            author.ProfileImageUrl, author.Email, author.Slug, author.IsMedicalReviewer, author.IsActive,
            author.MetaTitle, author.MetaDescription,
            author.CreatedAt, Updated = author.UpdatedAt,
            ArticleCount = articles.Count,
            ReviewedArticlesCount = reviewedCount,
            Articles = articles
        });
    }

    [HttpGet("services")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListServicesWithSeo()
    {
        var items = await _db.ServiceSeoProfiles
            .AsNoTracking()
            .Include(sp => sp.ServiceDefinition)
            .OrderBy(sp => sp.DisplayOrder)
            .Select(sp => new
            {
                Service = new { sp.ServiceDefinition.Id, sp.ServiceDefinition.Code, sp.ServiceDefinition.Title, sp.ServiceDefinition.Description, sp.ServiceDefinition.Category, sp.ServiceDefinition.IsActive },
                Landing = new { sp.Slug, sp.MetaTitle, sp.MetaDescription, sp.StartingPrice, sp.PriceRangeText, sp.HeroImageUrl, sp.IsFeatured, sp.ShowInHomePage, sp.DisplayOrder, sp.ViewCount }
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("services/{slug}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetServiceLandingBySlug(string slug)
    {
        var sp = await _db.ServiceSeoProfiles
            .AsNoTracking()
            .Include(sp => sp.ServiceDefinition)
            .Include(sp => sp.Benefits)
            .Include(sp => sp.TargetPatients)
            .Include(sp => sp.CoverageAreas).ThenInclude(ca => ca.City)
            .Include(sp => sp.Testimonials)
            .FirstOrDefaultAsync(sp => sp.Slug == slug);

        if (sp == null) return NotFound($"Service landing with slug '{slug}' not found.");

        var faqs = await _db.FAQs.AsNoTracking()
            .Where(f => f.EntityType == FAQEntityType.Service && f.EntityId == sp.Id && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new { f.Id, f.Question, f.Answer, f.DisplayOrder })
            .ToListAsync();

        var relatedArticles = await _db.Articles.AsNoTracking()
            .Where(a => a.Status == ArticleStatus.Published && a.ServiceDefinitionId == sp.ServiceDefinitionId)
            .OrderByDescending(a => a.PublishedAt)
            .Take(4)
            .Select(a => new { a.Id, a.Title, a.Slug, a.FeaturedImageUrl, ReadingTime = a.EstimatedReadingTimeMinutes, a.PublishedAt })
            .ToListAsync();

        return Ok(new
        {
            Service = new { sp.ServiceDefinition.Id, sp.ServiceDefinition.Code, sp.ServiceDefinition.Title, sp.ServiceDefinition.Description, sp.ServiceDefinition.Category },
            Landing = new
            {
                sp.Id, sp.Slug, sp.LongDescription, sp.HeroImageUrl, sp.OgImageUrl, sp.TwitterImageUrl,
                sp.MetaTitle, sp.MetaDescription, sp.CanonicalUrl, sp.PrimaryKeyword, sp.SecondaryKeywordsJson,
                sp.StartingPrice, sp.PriceRangeText, sp.PrimaryCtaText, sp.PrimaryCtaLink,
                sp.VideoPresentationUrl,
                sp.IsFeatured, sp.ShowInHomePage, sp.DisplayOrder, sp.ViewCount
            },
            Benefits = sp.Benefits.OrderBy(b => b.DisplayOrder).Select(b => new { b.Id, b.Title, b.Description, Icon = b.IconName, b.ColorClass, b.DisplayOrder }).ToList(),
            TargetPatients = sp.TargetPatients.OrderBy(t => t.DisplayOrder).Select(t => new { t.Id, t.Title, t.Description, t.RelatedDiseaseId, t.DisplayOrder }).ToList(),
            CoverageAreas = sp.CoverageAreas.OrderBy(c => c.DisplayOrder).Select(c => new
            {
                c.Id,
                CityName = c.City != null ? c.City.Name : null,
                c.CityId,
                Area = c.AreaName,
                c.District,
                c.Notes,
                c.Has24HourService,
                c.AdditionalCost,
                c.DisplayOrder
            }).ToList(),
            Testimonials = sp.Testimonials.OrderByDescending(t => t.CreatedAt).Select(t => new
            {
                t.Id, t.ClientFullName, t.ClientRole, t.ProfileImageUrl, t.Rating,
                Comment = t.Content, t.Highlight, t.TestimonialDate, t.IsApproved, t.IsFeatured
            }).ToList(),
            FAQs = faqs,
            RelatedArticles = relatedArticles
        });
    }

    [HttpGet("faqs/{entityType}/{entityId:int}")]
    public async Task<IActionResult> GetFaqsForEntity(string entityType, int entityId)
    {
        var type = entityType.ToLowerInvariant() switch
        {
            "article" => FAQEntityType.Article,
            "service" => FAQEntityType.Service,
            "disease" => FAQEntityType.Disease,
            "city" => FAQEntityType.City,
            "guide" => FAQEntityType.Guide,
            "tool" => FAQEntityType.Tool,
            _ => (FAQEntityType?)null
        };

        if (!type.HasValue) return BadRequest("Invalid entityType. Use: article, service, disease, city, guide, tool.");

        var items = await _db.FAQs.AsNoTracking()
            .Where(f => f.EntityType == type.Value && f.EntityId == entityId && f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .Select(f => new { f.Id, f.Question, f.Answer, f.DisplayOrder })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("articles/{articleSlug}/links")]
    public async Task<IActionResult> GetArticleInternalLinks(string articleSlug)
    {
        var art = await _db.Articles.AsNoTracking().FirstOrDefaultAsync(a => a.Slug == articleSlug);
        if (art == null) return NotFound();

        var links = await _db.InternalLinks.AsNoTracking()
            .Where(l => l.SourceArticleId == art.Id && l.IsActive)
            .OrderBy(l => l.DisplayOrder)
            .Select(l => new { l.Id, l.AnchorText, l.Title, l.Description, l.TargetType, l.TargetArticleId, l.TargetServiceId, l.TargetDiseaseId, l.TargetGuideId, l.TargetToolId, l.TargetCityId, l.TargetCustomUrl, l.DisplayOrder })
            .ToListAsync();
        return Ok(links);
    }

    [HttpGet("sitemap/slugs")]
    public async Task<IActionResult> GetAllSlugsForSitemap()
    {
        var articles = await _db.Articles.AsNoTracking().Where(a => a.Status == ArticleStatus.Published).Select(a => new { Type = "article", a.Slug, Updated = a.LastUpdatedAt ?? a.UpdatedAt ?? a.CreatedAt }).ToListAsync();
        var diseases = await _db.Diseases.AsNoTracking().Select(d => new { Type = "disease", d.Slug, Updated = (DateTime?)(d.UpdatedAt ?? d.CreatedAt) }).ToListAsync();
        var services = await _db.ServiceSeoProfiles.AsNoTracking().Select(s => new { Type = "service", s.Slug, Updated = (DateTime?)(s.UpdatedAt ?? s.CreatedAt) }).ToListAsync();
        var cities = await _db.Cities.AsNoTracking().Select(c => new { Type = "city", c.Slug, Updated = (DateTime?)(c.UpdatedAt ?? c.CreatedAt) }).ToListAsync();
        var guides = await _db.Guides.AsNoTracking().Select(g => new { Type = "guide", g.Slug, Updated = (DateTime?)(g.UpdatedAt ?? g.CreatedAt) }).ToListAsync();
        var tools = await _db.HealthTools.AsNoTracking().Select(t => new { Type = "tool", t.Slug, Updated = (DateTime?)(t.UpdatedAt ?? t.CreatedAt) }).ToListAsync();
        var authors = await _db.Authors.AsNoTracking().Where(a => a.IsActive).Select(a => new { Type = "author", a.Slug, Updated = (DateTime?)(a.UpdatedAt ?? a.CreatedAt) }).ToListAsync();
        var categories = await _db.ContentCategories.AsNoTracking().Select(c => new { Type = "category", c.Slug, Updated = (DateTime?)DateTime.UtcNow }).ToListAsync();

        var all = articles.Cast<object>()
            .Concat(diseases)
            .Concat(services)
            .Concat(cities)
            .Concat(guides)
            .Concat(tools)
            .Concat(authors)
            .Concat(categories)
            .ToList();
        return Ok(all);
    }
}
