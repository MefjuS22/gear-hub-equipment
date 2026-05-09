using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController(
    IFileStorageService fileStorage,
    IHttpContextAccessor httpContextAccessor) : ControllerBase
{
    private const long UploadSizeLimitBytes = 20 * 1024 * 1024;

    [HttpPost("upload")]
    [RequestSizeLimit(UploadSizeLimitBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadSizeLimitBytes)]
    [ProducesResponseType(typeof(FileUploadResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FileUploadResponseDto>> Upload(
        IFormFile? file,
        [FromForm] string folder = "general",
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.FileUploadInvalid,
                "No file was uploaded.");
        }

        try
        {
            var result = await fileStorage.SaveAsync(file, folder, cancellationToken);
            var http = httpContextAccessor.HttpContext?.Request;
            var absolute = http is null
                ? result.PublicPath
                : $"{http.Scheme}://{http.Host.Value}{result.PublicPath}";

            return Ok(new FileUploadResponseDto
            {
                RelativePath = result.RelativePath,
                PublicPath = result.PublicPath,
                AbsoluteUrl = absolute,
            });
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.FileUploadInvalid,
                ex.Message);
        }
    }
}
