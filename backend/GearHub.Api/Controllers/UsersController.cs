using GearHub.Api.Authorization;
using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[HasPermission(AppPermissions.UsersManage)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
public class UsersController(IUserAdminService userAdminService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResultDto<UserAdminListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<UserAdminListDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await userAdminService.GetAllAsync(pagination, cancellationToken));

    [HttpPost]
    [ProducesResponseType(typeof(UserAdminListDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserAdminDto request,
        CancellationToken cancellationToken)
    {
        var result = await userAdminService.CreateAsync(request, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                MapUserAdminStatus(result.Error!.Code),
                result.Error.Code,
                result.Error.Message);
        }

        return StatusCode(StatusCodes.Status201Created, result.Value);
    }

    [HttpPut("{id:int}/roles")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetRoles(
        int id,
        [FromBody] SetUserRolesDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCallerId(out var callerId))
        {
            return Unauthorized();
        }

        var result = await userAdminService.SetRolesAsync(id, request, callerId, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                MapUserAdminStatus(result.Error!.Code),
                result.Error.Code,
                result.Error.Message);
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        if (!TryGetCallerId(out var callerId))
        {
            return Unauthorized();
        }

        var result = await userAdminService.DeleteAsync(id, callerId, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                MapUserAdminStatus(result.Error!.Code),
                result.Error.Code,
                result.Error.Message);
        }

        return NoContent();
    }

    private bool TryGetCallerId(out int userId)
    {
        userId = 0;
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(raw, out userId);
    }

    private static int MapUserAdminStatus(ApiErrorCode code) =>
        code switch
        {
            ApiErrorCode.UserNotFound => StatusCodes.Status404NotFound,
            ApiErrorCode.UserCannotDeleteSelf => StatusCodes.Status403Forbidden,
            ApiErrorCode.UserLastAdmin => StatusCodes.Status403Forbidden,
            ApiErrorCode.AuthForbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status400BadRequest,
        };
}
