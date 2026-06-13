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
    public static string BuildWebBrowserDocument(string bodyHtml, string baseUrl) =>
        BuildDisplayDocument(bodyHtml, baseUrl, includeMarkOfTheWeb: true);

    /// <summary>
    /// Wraps HTML for WebView2 (Chromium) read-only display.
    /// </summary>
    public static string BuildDisplayDocument(string bodyHtml, string baseUrl, bool includeMarkOfTheWeb = false)
    {
        var resolvedHtml = ResolveMediaInHtml(bodyHtml, baseUrl);
        var baseHref = baseUrl.TrimEnd('/') + "/";
        var mark = includeMarkOfTheWeb ? "<!-- saved from url=(0014)about:internet -->" : string.Empty;
        return
            mark +
            "<html><head><meta charset=\"utf-8\" />" +
            $"<base href=\"{baseHref}\" />" +
            "<style>" +
            "html { color-scheme: light only; background: #ffffff; } " +
            "body { font-family: Segoe UI, sans-serif; font-size: 14px; color: #0f172a; background: #ffffff; line-height: 1.5; margin: 12px; } " +
            "p { margin: 0 0 0.75em; color: #0f172a; } h2 { font-size: 1.25em; margin: 0.5em 0; color: #0f172a; } " +
            "ul, ol { margin: 0.5em 0 0.75em 1.4em; color: #0f172a; } " +
            "img { max-width: 100%; height: auto; } a { color: #4f46e5; }" +
            "</style>" +
            "</head><body>" + resolvedHtml + "</body></html>";
    }

    [GeneratedRegex(@"(<img\b[^>]*\ssrc\s*=\s*[""'])([^""']+)([""'])", RegexOptions.IgnoreCase)]
    private static partial Regex ImgSrcRegex();
}
