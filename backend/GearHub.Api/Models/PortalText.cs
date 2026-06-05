namespace GearHub.Api.Models;

/// <summary>Keyed copy blocks shown on the customer portal (catalog hero, cart empty state, etc.).</summary>
public class PortalText
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    /// <summary>Staff-facing label in the intranet editor.</summary>
    public string Title { get; set; } = string.Empty;
    /// <summary>Where this text appears on the portal (read-only hint for staff).</summary>
    public string PlacementHint { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
