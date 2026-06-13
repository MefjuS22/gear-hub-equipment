namespace GearHubDesktop.Helpers;

public static class PortalTextDefaults
{
    private static readonly Dictionary<string, string> Defaults = new(StringComparer.Ordinal)
    {
        ["catalog.hero.title"] = "Equipment catalog",
        ["catalog.hero.subtitle"] =
            "Browse rental equipment. Filter by category or search by name or brand.",
        ["catalog.featured.fallback"] =
            "<p>Available for rent at a daily rate. Add to your cart to reserve dates.</p>",
        ["cart.empty.title"] = "Your cart is empty",
        ["cart.empty.body"] =
            "Browse the catalog and add equipment to start a rental order.",
        ["news.list.title"] = "News",
        ["news.list.subtitle"] = "Updates, tips, and announcements from our team.",
    };

    public static string ResolveBodyHtml(string key, string? apiHtml = null)
    {
        var trimmed = apiHtml?.Trim();
        if (!string.IsNullOrEmpty(trimmed))
        {
            return trimmed;
        }

        return Defaults.TryGetValue(key, out var fallback) ? fallback : string.Empty;
    }
}
