namespace GearHubDesktop.DTOs;

public class PortalTextDto
{
    public string Key { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string PlacementHint { get; set; } = string.Empty;
    public string BodyHtml { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
