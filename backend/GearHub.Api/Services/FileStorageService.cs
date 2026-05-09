using GearHub.Api.Options;
using Microsoft.Extensions.Options;

namespace GearHub.Api.Services;

public sealed class FileStorageService(
    IWebHostEnvironment environment,
    IOptions<FileStorageOptions> options) : IFileStorageService
{
    private static readonly HashSet<string> AllowedFolders =
        new(StringComparer.OrdinalIgnoreCase) { "general", "equipment", "cms" };

    private readonly FileStorageOptions _options = options.Value;

    public async Task<FileSaveResult> SaveAsync(
        IFormFile file,
        string folder,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(file);

        if (file.Length == 0)
        {
            throw new InvalidOperationException("The uploaded file is empty.");
        }

        if (file.Length > _options.MaxBytes)
        {
            throw new InvalidOperationException(
                $"File exceeds the maximum size of {_options.MaxBytes / (1024 * 1024)} MB.");
        }

        var segment = string.IsNullOrWhiteSpace(folder) ? "general" : folder.Trim();
        if (!AllowedFolders.Contains(segment))
        {
            throw new InvalidOperationException(
                "Invalid folder. Use general, equipment, or cms.");
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(ext))
        {
            ext = GuessExtensionFromContentType(file.ContentType);
        }

        ext = ext.ToLowerInvariant();
        if (!_options.AllowedExtensions.Contains(ext))
        {
            throw new InvalidOperationException(
                $"File type '{ext}' is not allowed. Allowed: {string.Join(", ", _options.AllowedExtensions)}.");
        }

        var root = FileStoragePathHelper.ResolveAbsoluteRoot(
            environment.ContentRootPath,
            _options.RootPath);

        var safeName = $"{Guid.NewGuid():N}{ext}";
        var relativePhysical = Path.Combine(segment, safeName);
        var absolutePath = Path.Combine(root, relativePhysical);

        Directory.CreateDirectory(Path.GetDirectoryName(absolutePath)!);

        await using (var stream = new FileStream(
                         absolutePath,
                         FileMode.CreateNew,
                         FileAccess.Write,
                         FileShare.None,
                         bufferSize: 65536,
                         useAsync: true))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        var webRelative = relativePhysical.Replace(Path.DirectorySeparatorChar, '/');
        var prefix = _options.PublicRequestPath.TrimEnd('/');
        var publicPath = $"{prefix}/{webRelative}";

        return new FileSaveResult(webRelative, publicPath);
    }

    private static string GuessExtensionFromContentType(string? contentType)
    {
        if (string.IsNullOrEmpty(contentType))
        {
            return string.Empty;
        }

        return contentType.ToLowerInvariant() switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            "image/svg+xml" => ".svg",
            _ => string.Empty,
        };
    }
}
