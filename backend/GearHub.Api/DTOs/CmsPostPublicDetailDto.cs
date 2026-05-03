namespace GearHub.Api.DTOs;

public class CmsPostPublicDetailDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string BodyHtml { get; set; } = string.Empty;
    public DateTime PublishedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
}
