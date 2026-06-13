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
public class MaintenanceController(IMaintenanceService maintenanceService) : ControllerBase
{
    [HttpGet]
    [HasPermission(AppPermissions.EquipmentRead)]
    [ProducesResponseType(typeof(PagedResultDto<MaintenanceDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<MaintenanceDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await maintenanceService.GetAllAsync(pagination, cancellationToken));

    [HttpPost]
    [HasPermission(AppPermissions.EquipmentManage)]
    [ProducesResponseType(typeof(MaintenanceDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MaintenanceDto>> Create(
        [FromBody] MaintenanceUpsertDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var created = await maintenanceService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return ApiResponses.Error(StatusCodes.Status400BadRequest, ApiErrorCode.EquipmentNotFound, ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [HasPermission(AppPermissions.EquipmentManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await maintenanceService.DeleteAsync(id, cancellationToken);
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
