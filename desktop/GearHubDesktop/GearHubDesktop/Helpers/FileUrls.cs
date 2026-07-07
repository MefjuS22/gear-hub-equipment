namespace GearHubDesktop.Helpers;

public static class FileUrls
{
    public static string NormalizePublicPath(string? publicPathOrUrl)
    {
        if (string.IsNullOrWhiteSpace(publicPathOrUrl))
        {
            return string.Empty;
        }

        var value = publicPathOrUrl.Trim();
        if (value.StartsWith('/'))
        {
            return value;
        }

        if (!value.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            && !value.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return value.StartsWith('/') ? value : $"/{value}";
        }

        var filesIndex = value.IndexOf("/files/", StringComparison.OrdinalIgnoreCase);
        return filesIndex >= 0 ? value[filesIndex..] : value;
    }

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
