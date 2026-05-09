using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquipmentController(IEquipmentService equipmentService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<EquipmentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<EquipmentDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await equipmentService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
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
