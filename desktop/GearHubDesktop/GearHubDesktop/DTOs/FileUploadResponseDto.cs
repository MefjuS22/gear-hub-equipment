namespace GearHubDesktop.DTOs;

public class FileUploadResponseDto
{
    /// <summary>Path relative to the public URL prefix</summary>
    public string RelativePath { get; set; } = string.Empty;

    /// <summary>Path to use in browsers</summary>
    public string PublicPath { get; set; } = string.Empty;

    /// <summary>Full URL including scheme and host</summary>
    public string AbsoluteUrl { get; set; } = string.Empty;
}
