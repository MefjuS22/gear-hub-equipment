using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IFileUploadService
{
    Task<ServiceResult<FileUploadResponseDto>> UploadAsync(
        IFormFile? file,
        string folder,
        HttpRequest? request,
        CancellationToken cancellationToken = default);
}
