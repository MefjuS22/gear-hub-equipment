using System.Text.RegularExpressions;

namespace GearHubDesktop.Helpers;

public static partial class CmsHtmlHelper
{
    /// <summary>
    /// Rewrites img[src] values so /files/… paths resolve against the API host.
    /// </summary>
    public static string ResolveMediaInHtml(string html, string baseUrl)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return html;
        }

        return ImgSrcRegex().Replace(html, match =>
        {
            var prefix = match.Groups[1].Value;
            var src = match.Groups[2].Value;
            var suffix = match.Groups[3].Value;
            var resolved = FileUrls.ResolvePublicFileUrl(baseUrl, src);
            return $"{prefix}{resolved}{suffix}";
        });
    }

    /// <summary>
    /// Wraps CMS HTML for WPF WebBrowser (NavigateToString). Includes Mark-of-the-Web so IE loads remote images.
    /// </summary>
    public static string BuildWebBrowserDocument(string bodyHtml, string baseUrl)
    {
        var resolvedHtml = ResolveMediaInHtml(bodyHtml, baseUrl);
        var baseHref = baseUrl.TrimEnd('/') + "/";
        return
            "<!-- saved from url=(0014)about:internet -->" +
            "<html><head><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />" +
            $"<base href=\"{baseHref}\" />" +
            "<style>body { font-family: Segoe UI, sans-serif; font-size: 14px; color: #333; line-height: 1.5; } " +
            "img { max-width: 100%; height: auto; }</style>" +
            "</head><body>" + resolvedHtml + "</body></html>";
    }

    [GeneratedRegex(@"(<img\b[^>]*\ssrc\s*=\s*[""'])([^""']+)([""'])", RegexOptions.IgnoreCase)]
    private static partial Regex ImgSrcRegex();
}
