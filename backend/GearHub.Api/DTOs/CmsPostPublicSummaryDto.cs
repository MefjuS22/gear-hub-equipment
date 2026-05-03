namespace GearHub.Api.DTOs;

public class CmsPostPublicSummaryDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public DateTime PublishedAtUtc { get; set; }
}
