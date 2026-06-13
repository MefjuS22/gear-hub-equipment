using System.Text.RegularExpressions;

namespace GearHubDesktop.Helpers;

public static partial class PortalTextHelper
{
    public static string ToPlainText(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return string.Empty;
        }

        return WhitespaceRegex().Replace(HtmlTagRegex().Replace(html, " "), " ").Trim();
    }

    public static string PlainToBodyHtml(string plain)
    {
        var trimmed = plain.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            return string.Empty;
        }

        if (HtmlTagRegex().IsMatch(trimmed))
        {
            return trimmed;
        }

        return $"<p>{trimmed}</p>";
    }

    [GeneratedRegex("<[^>]*>", RegexOptions.IgnoreCase)]
    private static partial Regex HtmlTagRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();
}
