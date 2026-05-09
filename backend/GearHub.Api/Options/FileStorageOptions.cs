namespace GearHub.Api.Options;

public class FileStorageOptions
{
    public const string SectionName = "FileStorage";

    /// <summary>Path relative to content root, or absolute. Default: App_Data/uploads</summary>
    public string RootPath { get; set; } = "App_Data/uploads";

    /// <summary>URL prefix for served files (e.g. /files).</summary>
    public string PublicRequestPath { get; set; } = "/files";

    public long MaxBytes { get; set; } = 15 * 1024 * 1024;

    public string[] AllowedExtensions { get; set; } =
        [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
}
