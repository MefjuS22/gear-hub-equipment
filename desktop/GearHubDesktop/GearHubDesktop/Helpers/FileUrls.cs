namespace GearHubDesktop.Helpers;

public static class FileUrls
{
    public static string ResolvePublicFileUrl(string baseUrl, string publicPath)
    {
        if (string.IsNullOrWhiteSpace(publicPath))
        {
            return string.Empty;
        }

        if (publicPath.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || publicPath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return publicPath;
        }

        var baseNormalized = baseUrl.TrimEnd('/');
        var path = publicPath.StartsWith('/') ? publicPath : $"/{publicPath}";
        return $"{baseNormalized}{path}";
    }
}
