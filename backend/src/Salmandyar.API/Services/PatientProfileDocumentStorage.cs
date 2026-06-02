using Microsoft.AspNetCore.Http;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace Salmandyar.API.Services;

public static class PatientProfileDocumentStorage
{
    public const long MaxUploadBytes = 50L * 1024 * 1024;

    private const int MaxImageWidth = 2200;
    private const int MaxImageHeight = 2200;
    private const int PreferredMinImageBytes = 200 * 1024;
    private const int PreferredMaxImageBytes = 1024 * 1024;
    private const int HardMaxImageBytes = 1536 * 1024;

    private static readonly int[] QualitySteps = [92, 90, 88, 86, 84, 82, 80, 78, 76];
    private static readonly double[] ResizeFactors = [1d, 0.96d, 0.92d, 0.88d, 0.84d, 0.8d, 0.76d];

    private static readonly HashSet<string> CompressibleImageExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".gif",
        ".webp",
        ".tif",
        ".tiff"
    };

    public static readonly HashSet<string> AllowedDocumentExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".gif",
        ".webp",
        ".tif",
        ".tiff",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".csv",
        ".txt",
        ".rtf",
        ".zip",
        ".rar",
        ".7z"
    };

    public static async Task<StoredPatientDocument> SaveOptimizedAsync(
        IFormFile file,
        string uploadsFolder,
        string baseFileName,
        CancellationToken cancellationToken = default)
    {
        Directory.CreateDirectory(uploadsFolder);

        var originalExtension = Path.GetExtension(file.FileName);
        if (CompressibleImageExtensions.Contains(originalExtension))
        {
            await using var inputStream = file.OpenReadStream();
            using var image = await Image.LoadAsync<Rgba32>(inputStream, cancellationToken);
            using var normalizedImage = NormalizeDocumentImage(image);
            var optimizedBytes = await EncodeDocumentImageAsync(normalizedImage, cancellationToken);

            var optimizedFileName = $"{baseFileName}.jpg";
            var optimizedFilePath = Path.Combine(uploadsFolder, optimizedFileName);
            await File.WriteAllBytesAsync(optimizedFilePath, optimizedBytes, cancellationToken);

            return new StoredPatientDocument(optimizedFileName, optimizedFilePath, ".jpg");
        }

        var safeExtension = string.IsNullOrWhiteSpace(originalExtension)
            ? ".bin"
            : originalExtension.ToLowerInvariant();
        var storedFileName = $"{baseFileName}{safeExtension}";
        var storedFilePath = Path.Combine(uploadsFolder, storedFileName);

        await using (var outputStream = new FileStream(storedFilePath, FileMode.Create, FileAccess.Write, FileShare.None))
        await using (var inputStream = file.OpenReadStream())
        {
            await inputStream.CopyToAsync(outputStream, cancellationToken);
        }

        return new StoredPatientDocument(storedFileName, storedFilePath, safeExtension);
    }

    public static string SanitizeSegment(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return "document";
        }

        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitizedChars = value
            .Trim()
            .Select(ch => invalidChars.Contains(ch) || char.IsWhiteSpace(ch) ? '_' : ch)
            .ToArray();

        return new string(sanitizedChars);
    }

    private static Image<Rgba32> NormalizeDocumentImage(Image<Rgba32> sourceImage)
    {
        var normalizedImage = sourceImage.Clone(context =>
        {
            context.AutoOrient();

            if (sourceImage.Width > MaxImageWidth || sourceImage.Height > MaxImageHeight)
            {
                context.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(MaxImageWidth, MaxImageHeight),
                    Sampler = KnownResamplers.Lanczos3
                });
            }
        });

        var flattenedImage = new Image<Rgba32>(normalizedImage.Width, normalizedImage.Height, Color.White);
        flattenedImage.Mutate(context => context.DrawImage(normalizedImage, 1f));
        normalizedImage.Dispose();

        return flattenedImage;
    }

    private static async Task<byte[]> EncodeDocumentImageAsync(Image<Rgba32> image, CancellationToken cancellationToken)
    {
        byte[]? preferredCandidate = null;
        byte[]? fallbackCandidate = null;
        byte[]? smallestCandidate = null;

        foreach (var resizeFactor in ResizeFactors)
        {
            using var workingImage = resizeFactor >= 0.999d
                ? image.Clone()
                : image.Clone(context => context.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(
                        Math.Max(1, (int)Math.Round(image.Width * resizeFactor)),
                        Math.Max(1, (int)Math.Round(image.Height * resizeFactor))),
                    Sampler = KnownResamplers.Lanczos3
                }));

            foreach (var quality in QualitySteps)
            {
                var encodedBytes = await EncodeJpegAsync(workingImage, quality, cancellationToken);

                if (smallestCandidate == null || encodedBytes.Length < smallestCandidate.Length)
                {
                    smallestCandidate = encodedBytes;
                }

                if (encodedBytes.Length <= HardMaxImageBytes && fallbackCandidate == null)
                {
                    fallbackCandidate = encodedBytes;
                }

                if (encodedBytes.Length is >= PreferredMinImageBytes and <= PreferredMaxImageBytes)
                {
                    return encodedBytes;
                }

                if (encodedBytes.Length <= HardMaxImageBytes && preferredCandidate == null)
                {
                    preferredCandidate = encodedBytes;
                }
            }
        }

        return preferredCandidate ?? fallbackCandidate ?? smallestCandidate ?? await EncodeJpegAsync(image, 76, cancellationToken);
    }

    private static async Task<byte[]> EncodeJpegAsync(Image<Rgba32> image, int quality, CancellationToken cancellationToken)
    {
        await using var memoryStream = new MemoryStream();
        await image.SaveAsJpegAsync(
            memoryStream,
            new JpegEncoder
            {
                Quality = quality,
                Interleaved = true
            },
            cancellationToken);

        return memoryStream.ToArray();
    }
}

public sealed record StoredPatientDocument(string FileName, string FilePath, string StoredExtension);
