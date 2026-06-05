using GearHub.Api.Authorization;
using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class PortalTextController(IPortalTextService portalTextService) : ControllerBase
{
    [HttpGet]
    [HasPermission(AppPermissions.CmsManage)]
    [ProducesResponseType(typeof(PagedResultDto<PortalTextDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<PortalTextDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await portalTextService.GetAllAsync(pagination, cancellationToken));

    [HttpGet("Public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResultDto<PortalTextPublicDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<PortalTextPublicDto>>> GetPublic(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await portalTextService.GetPublicAsync(pagination, cancellationToken));

    [HttpGet("{key}")]
    [HasPermission(AppPermissions.CmsManage)]
    [ProducesResponseType(typeof(PortalTextDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PortalTextDto>> GetByKey(string key, CancellationToken cancellationToken)
    {
        var result = await portalTextService.GetByKeyAsync(key, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                result.Error!.Code,
                result.Error.Message);
        }

        return Ok(result.Value);
    }

    [HttpPut("{key}")]
    [HasPermission(AppPermissions.CmsManage)]
    [ProducesResponseType(typeof(PortalTextDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PortalTextDto>> Update(
        string key,
        [FromBody] PortalTextUpsertDto request,
        CancellationToken cancellationToken)
    {
        var result = await portalTextService.UpdateAsync(key, request, cancellationToken);
        if (!result.Success)
        {
            var statusCode = result.Error!.Code == ApiErrorCode.PortalTextNotFound
                ? StatusCodes.Status404NotFound
                : StatusCodes.Status400BadRequest;
            return ApiResponses.Error(statusCode, result.Error.Code, result.Error.Message);
        }

        return Ok(result.Value);
    }
}
