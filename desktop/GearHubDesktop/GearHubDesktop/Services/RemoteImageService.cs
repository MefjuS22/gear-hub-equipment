using System.Collections.Concurrent;
using System.Net.Http;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using GearHubDesktop.Helpers;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace GearHubDesktop.Services;

public sealed class RemoteImageService : IRemoteImageService
{
    private readonly HttpClient _http;
    private readonly ApiSettings _settings;
    private readonly ConcurrentDictionary<string, ImageSource> _cache = new(StringComparer.OrdinalIgnoreCase);

    public RemoteImageService(HttpClient http, ApiSettings settings)
    {
        _http = http;
        _settings = settings;
    }

    public async Task<ImageSource?> LoadAsync(string? publicPathOrUrl, CancellationToken cancellationToken = default)
    {
        var normalized = FileUrls.NormalizePublicPath(publicPathOrUrl);
        var resolved = FileUrls.ResolvePublicFileUrl(_settings.BaseUrl, normalized);
        if (string.IsNullOrWhiteSpace(resolved))
        {
            return null;
        }

        if (_cache.TryGetValue(resolved, out var cached))
        {
            return cached;
        }

        try
        {
            var bytes = await FetchBytesAsync(resolved, cancellationToken);
            if (bytes is null || bytes.Length == 0)
            {
                return null;
            }

            var image = await Application.Current.Dispatcher.InvokeAsync(() => CreateImageSource(bytes));
            if (image is not null)
            {
                _cache[resolved] = image;
            }

            return image;
        }
        catch
        {
            return null;
        }
    }

    private async Task<byte[]?> FetchBytesAsync(string resolvedUrl, CancellationToken cancellationToken)
    {
        var requestPath = ToRequestPath(resolvedUrl);
        if (requestPath.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || requestPath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return await _http.GetByteArrayAsync(requestPath, cancellationToken);
        }

        return await _http.GetByteArrayAsync(requestPath.TrimStart('/'), cancellationToken);
    }

    private string ToRequestPath(string resolvedUrl)
    {
        var basePrefix = _settings.BaseUrl.TrimEnd('/') + "/";
        if (resolvedUrl.StartsWith(basePrefix, StringComparison.OrdinalIgnoreCase))
        {
            return resolvedUrl[basePrefix.Length..];
        }

        return resolvedUrl;
    }

    private static ImageSource? CreateImageSource(byte[] bytes)
    {
        var wpfImage = TryCreateWpfBitmap(bytes);
        if (wpfImage is not null)
        {
            return wpfImage;
        }

        return TryCreateWithImageSharp(bytes);
    }

    private static BitmapImage? TryCreateWpfBitmap(byte[] bytes)
    {
        try
        {
            using var stream = new MemoryStream(bytes);
            var bitmap = new BitmapImage();
            bitmap.BeginInit();
            bitmap.StreamSource = stream;
            bitmap.CacheOption = BitmapCacheOption.OnLoad;
            bitmap.CreateOptions = BitmapCreateOptions.IgnoreImageCache;
            bitmap.EndInit();
            if (bitmap.CanFreeze)
            {
                bitmap.Freeze();
            }

            return bitmap;
        }
        catch
        {
            return null;
        }
    }

    private static ImageSource? TryCreateWithImageSharp(byte[] bytes)
    {
        try
        {
            using var stream = new MemoryStream(bytes);
            using var image = Image.Load<Bgra32>(stream);
            var pixels = new byte[image.Width * image.Height * 4];
            image.CopyPixelDataTo(pixels);

            var bitmap = BitmapSource.Create(
                image.Width,
                image.Height,
                96,
                96,
                PixelFormats.Bgra32,
                null,
                pixels,
                image.Width * 4);

            if (bitmap.CanFreeze)
            {
                bitmap.Freeze();
            }

            return bitmap;
        }
        catch
        {
            return null;
        }
    }
}
