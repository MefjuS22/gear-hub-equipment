using System.Collections.Concurrent;
using System.Net.Http;
using System.Windows;
using System.Windows.Media.Imaging;
using GearHubDesktop.Helpers;

namespace GearHubDesktop.Services;

public sealed class RemoteImageService : IRemoteImageService
{
    private readonly HttpClient _http;
    private readonly ApiSettings _settings;
    private readonly ConcurrentDictionary<string, BitmapImage> _cache = new(StringComparer.OrdinalIgnoreCase);

    public RemoteImageService(HttpClient http, ApiSettings settings)
    {
        _http = http;
        _settings = settings;
    }

    public async Task<BitmapImage?> LoadAsync(string? publicPathOrUrl, CancellationToken cancellationToken = default)
    {
        var resolved = FileUrls.ResolvePublicFileUrl(_settings.BaseUrl, publicPathOrUrl ?? string.Empty);
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
            var bytes = await _http.GetByteArrayAsync(resolved, cancellationToken);
            var bitmap = await Application.Current.Dispatcher.InvokeAsync(() => CreateBitmap(bytes));
            if (bitmap is not null)
            {
                _cache[resolved] = bitmap;
            }

            return bitmap;
        }
        catch
        {
            return null;
        }
    }

    private static BitmapImage? CreateBitmap(byte[] bytes)
    {
        if (bytes.Length == 0)
        {
            return null;
        }

        using var stream = new MemoryStream(bytes);
        var bitmap = new BitmapImage();
        bitmap.BeginInit();
        bitmap.StreamSource = stream;
        bitmap.CacheOption = BitmapCacheOption.OnLoad;
        bitmap.CreateOptions = BitmapCreateOptions.IgnoreImageCache;
        bitmap.EndInit();
        bitmap.Freeze();
        return bitmap;
    }
}
