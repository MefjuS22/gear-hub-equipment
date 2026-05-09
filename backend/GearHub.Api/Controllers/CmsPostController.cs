using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CmsPostController(ICmsPostService cmsPostService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CmsPostListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CmsPostListDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await cmsPostService.GetAllAsync(cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CmsPostDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CmsPostDetailDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await cmsPostService.GetByIdAsync(id, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                result.Error!.Code,
                result.Error.Message);
        }

        return Ok(result.Value);
    }

    [HttpGet("Published")]
    [ProducesResponseType(typeof(IReadOnlyList<CmsPostPublicSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CmsPostPublicSummaryDto>>> GetPublished(
        CancellationToken cancellationToken) =>
        Ok(await cmsPostService.GetPublishedAsync(cancellationToken));

    [HttpGet("Published/{slug}")]
    [ProducesResponseType(typeof(CmsPostPublicDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CmsPostPublicDetailDto>> GetPublishedBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var result = await cmsPostService.GetPublishedBySlugAsync(slug, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                result.Error!.Code,
                result.Error.Message);
        }

        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CmsPostDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CmsPostDetailDto>> Create(
        [FromBody] CmsPostUpsertDto request,
        CancellationToken cancellationToken)
    {
        var result = await cmsPostService.CreateAsync(request, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                result.Error!.Code,
                result.Error.Message);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CmsPostDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CmsPostDetailDto>> Update(
        Guid id,
        [FromBody] CmsPostUpsertDto request,
        CancellationToken cancellationToken)
    {
        var result = await cmsPostService.UpdateAsync(id, request, cancellationToken);
        if (!result.Success)
        {
            var statusCode = result.Error!.Code == ApiErrorCode.CmsPostNotFound
                ? StatusCodes.Status404NotFound
                : StatusCodes.Status400BadRequest;
            return ApiResponses.Error(statusCode, result.Error.Code, result.Error.Message);
        }

        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await cmsPostService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                result.Error!.Code,
                result.Error.Message);
        }
        return NoContent();
    }
}
