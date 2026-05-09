namespace GearHub.Api.Services;

public sealed record FileSaveResult(string RelativePath, string PublicPath);

public interface IFileStorageService
{
    /// <param name="folder">One of: general, equipment, cms.</param>
    Task<FileSaveResult> SaveAsync(
        IFormFile file,
        string folder,
        CancellationToken cancellationToken = default);
}
