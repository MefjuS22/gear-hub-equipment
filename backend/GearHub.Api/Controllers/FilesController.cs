using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController(
    IFileUploadService fileUploadService,
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
        var result = await fileUploadService.UploadAsync(
            file,
            folder,
            httpContextAccessor.HttpContext?.Request,
            cancellationToken);

        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                result.Error!.Code,
                result.Error.Message);
        }

        return Ok(result.Value);
    }
}
