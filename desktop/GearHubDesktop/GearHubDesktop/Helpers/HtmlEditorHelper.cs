using System.Text.RegularExpressions;

namespace GearHubDesktop.Helpers;

public static partial class HtmlEditorHelper
{
    private static readonly string[] EmptyBodies =
    [
        string.Empty,
        "<br>",
        "<br/>",
        "<br />",
        "<p></p>",
        "<p><br></p>",
        "<p><br/></p>",
        "<p><br /></p>",
        "<div><br></div>",
    ];

    public static string NormalizeOutput(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return string.Empty;
        }

        var trimmed = html.Trim();
        if (EmptyBodies.Contains(trimmed, StringComparer.OrdinalIgnoreCase))
        {
            return string.Empty;
        }

        return trimmed;
    }

    public static string ToEditorHtml(string? html)
    {
        var normalized = NormalizeOutput(html);
        return string.IsNullOrEmpty(normalized) ? "<p></p>" : normalized;
    }

    public static bool LooksLikeHtml(string text) =>
        !string.IsNullOrWhiteSpace(text) && HtmlTagRegex().IsMatch(text);

    [GeneratedRegex("<[^>]+>", RegexOptions.IgnoreCase)]
    private static partial Regex HtmlTagRegex();
}
