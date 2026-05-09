namespace GearHub.Api.DTOs;

public class CmsPostUpsertDto
{
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public string? CoverImageUrl { get; set; }
    public string BodyHtml { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
}
