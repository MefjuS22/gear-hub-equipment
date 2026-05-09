using GearHub.Api.DTOs;
using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public class FileUploadService(IFileStorageService fileStorage) : IFileUploadService
{
    public async Task<ServiceResult<FileUploadResponseDto>> UploadAsync(
        IFormFile? file,
        string folder,
        HttpRequest? request,
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return ServiceResult<FileUploadResponseDto>.Fail(
                ApiErrorCode.FileUploadInvalid,
                "No file was uploaded.");
        }

        try
        {
            var result = await fileStorage.SaveAsync(file, folder, cancellationToken);
            var absolute = request is null
                ? result.PublicPath
                : $"{request.Scheme}://{request.Host.Value}{result.PublicPath}";

            return ServiceResult<FileUploadResponseDto>.Ok(new FileUploadResponseDto
            {
                RelativePath = result.RelativePath,
                PublicPath = result.PublicPath,
                AbsoluteUrl = absolute,
            });
        }
        catch (InvalidOperationException ex)
        {
            return ServiceResult<FileUploadResponseDto>.Fail(
                ApiErrorCode.FileUploadInvalid,
                ex.Message);
        }
    }
}
