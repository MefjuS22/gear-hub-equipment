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
public class EquipmentController(IEquipmentService equipmentService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResultDto<EquipmentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<EquipmentDto>>> GetAll(
        [FromQuery] EquipmentListQuery query,
        CancellationToken cancellationToken) =>
        Ok(await equipmentService.GetAllAsync(query, cancellationToken));

    [HttpGet("Categories")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCatalogCategories(
        [FromQuery] string? search,
        CancellationToken cancellationToken) =>
        Ok(await equipmentService.GetCatalogCategoryNamesAsync(search, cancellationToken));

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(EquipmentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EquipmentDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await equipmentService.GetByIdAsync(id, cancellationToken);
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
    [HasPermission(AppPermissions.EquipmentManage)]
    [ProducesResponseType(typeof(EquipmentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EquipmentDto>> Create(
        [FromBody] EquipmentUpsertDto request,
        CancellationToken cancellationToken)
    {
        var result = await equipmentService.CreateAsync(request, cancellationToken);
        if (!result.Success)
        {
            if (result.Error!.Code == ApiErrorCode.EquipmentReferenceInvalid)
            {
                return ApiResponses.Error(
                    StatusCodes.Status400BadRequest,
                    result.Error.Code,
                    result.Error.Message,
                    new Dictionary<string, string[]>
                    {
                        ["references"] = [result.Error.Message],
                    });
            }

            return ApiResponses.Error(
                StatusCodes.Status500InternalServerError,
                result.Error.Code,
                result.Error.Message);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:int}")]
    [HasPermission(AppPermissions.EquipmentManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] EquipmentUpsertDto request,
        CancellationToken cancellationToken)
    {
        var result = await equipmentService.UpdateAsync(id, request, cancellationToken);
        if (!result.Success)
        {
            if (result.Error!.Code == ApiErrorCode.EquipmentReferenceInvalid)
            {
                return ApiResponses.Error(
                    StatusCodes.Status400BadRequest,
                    result.Error.Code,
                    result.Error.Message,
                    new Dictionary<string, string[]>
                    {
                        ["references"] = [result.Error.Message],
                    });
            }

            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                result.Error.Code,
                result.Error.Message);
        }
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [HasPermission(AppPermissions.EquipmentManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await equipmentService.DeleteAsync(id, cancellationToken);
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
