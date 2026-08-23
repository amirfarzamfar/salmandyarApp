using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace Salmandyar.API.Services;

public static class ContentImageStorage
{
    public const long MaxImageUploadBytes = 10L * 1024 * 1024;
    private const int FeaturedImageMaxWidth = 2400;
    private const int FeaturedImageMaxHeight = 1600;
    private const int InlineImageMaxWidth = 1800;
    private const int InlineImageMaxHeight = 1800;
    private const int PreferredMinBytes = 120 * 1024;
    private const int PreferredMaxBytes = 600 * 1024;
    private const int HardMaxBytes = 1200 * 1024;

    private static readonly int[] QualitySteps = [92, 88, 84, 80, 76, 72, 68];
    private static readonly double[] ResizeFactors = [1d, 0.94d, 0.88d, 0.82d, 0.76d, 0.70d];

    private static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"
    };

    public static bool IsAllowedImage(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return false;
        var ext = Path.GetExtension(fileName);
        return AllowedImageExtensions.Contains(ext);
    }

    public static async Task<StoredContentImage> SaveFeaturedImageAsync(
        IFormFile file,
        IHostEnvironment env,
        CancellationToken ct = default)
    {
        return await SaveOptimizedImageAsync(
            file,
            env,
            "featured",
            FeaturedImageMaxWidth,
            FeaturedImageMaxHeight,
            ct);
    }

    public static async Task<StoredContentImage> SaveInlineImageAsync(
        IFormFile file,
        IHostEnvironment env,
        CancellationToken ct = default)
    {
        return await SaveOptimizedImageAsync(
            file,
            env,
            "inline",
            InlineImageMaxWidth,
            InlineImageMaxHeight,
            ct);
    }

    public static bool TryDeleteImage(IHostEnvironment env, string? relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl)) return false;
        try
        {
            var cleanPath = relativeUrl.TrimStart('/');
            if (cleanPath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            {
                cleanPath = cleanPath["uploads/".Length..];
            }
            var webRootPath = Path.Combine(env.ContentRootPath, "wwwroot");
            var filePath = Path.Combine(webRootPath, "uploads", cleanPath);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    private static async Task<StoredContentImage> SaveOptimizedImageAsync(
        IFormFile file,
        IHostEnvironment env,
        string subFolder,
        int maxWidth,
        int maxHeight,
        CancellationToken ct)
    {
        var webRootPath = Path.Combine(env.ContentRootPath, "wwwroot");
        var uploadsRoot = Path.Combine(webRootPath, "uploads", "content", subFolder);
        Directory.CreateDirectory(uploadsRoot);

        var dateSegment = DateTime.UtcNow.ToString("yyyy/MM");
        var datePath = Path.Combine(uploadsRoot, dateSegment);
        Directory.CreateDirectory(datePath);

        var originalExt = Path.GetExtension(file.FileName);
        var baseName = $"{Guid.NewGuid():N}_{DateTime.UtcNow:HHmmss}";

        await using var inputStream = file.OpenReadStream();
        using var image = await Image.LoadAsync<Rgba32>(inputStream, ct);
        using var normalized = NormalizeImage(image, maxWidth, maxHeight);

        var webpBytes = await EncodeOptimizedAsync(normalized, ct);
        var finalName = $"{baseName}.webp";
        var finalPath = Path.Combine(datePath, finalName);
        await File.WriteAllBytesAsync(finalPath, webpBytes, ct);

        var relativeUrl = $"/uploads/content/{subFolder}/{dateSegment.Replace('\\', '/')}/{finalName}";
        return new StoredContentImage(finalName, finalPath, relativeUrl, webpBytes.Length);
    }

    private static Image<Rgba32> NormalizeImage(Image<Rgba32> source, int maxWidth, int maxHeight)
    {
        var normalized = source.Clone(ctx =>
        {
            ctx.AutoOrient();
            if (source.Width > maxWidth || source.Height > maxHeight)
            {
                ctx.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(maxWidth, maxHeight),
                    Sampler = KnownResamplers.Lanczos3
                });
            }
        });

        var flat = new Image<Rgba32>(normalized.Width, normalized.Height, Color.White);
        flat.Mutate(ctx => ctx.DrawImage(normalized, 1f));
        normalized.Dispose();
        return flat;
    }

    private static async Task<byte[]> EncodeOptimizedAsync(Image<Rgba32> image, CancellationToken ct)
    {
        byte[]? preferred = null;
        byte[]? fallback = null;
        byte[]? smallest = null;

        foreach (var resizeFactor in ResizeFactors)
        {
            using var working = resizeFactor >= 0.999d
                ? image.Clone()
                : image.Clone(ctx => ctx.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(
                        Math.Max(1, (int)Math.Round(image.Width * resizeFactor)),
                        Math.Max(1, (int)Math.Round(image.Height * resizeFactor))),
                    Sampler = KnownResamplers.Lanczos3
                }));

            foreach (var quality in QualitySteps)
            {
                var bytes = await EncodeWebpAsync(working, quality, ct);
                if (smallest == null || bytes.Length < smallest.Length)
                    smallest = bytes;
                if (bytes.Length <= HardMaxBytes && fallback == null)
                    fallback = bytes;
                if (bytes.Length is >= PreferredMinBytes and <= PreferredMaxBytes)
                    return bytes;
                if (bytes.Length <= HardMaxBytes && preferred == null)
                    preferred = bytes;
            }
        }

        return preferred ?? fallback ?? smallest ?? await EncodeWebpAsync(image, 76, ct);
    }

    private static async Task<byte[]> EncodeWebpAsync(Image<Rgba32> image, int quality, CancellationToken ct)
    {
        await using var ms = new MemoryStream();
        await image.SaveAsWebpAsync(ms, new WebpEncoder
        {
            Quality = quality,
            Method = WebpEncodingMethod.BestQuality
        }, ct);
        return ms.ToArray();
    }
}

public sealed record StoredContentImage(
    string FileName,
    string FilePath,
    string RelativeUrl,
    long SizeBytes);
