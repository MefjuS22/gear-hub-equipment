using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandController(IBrandService brandService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<BrandLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BrandLookupDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await brandService.GetAllAsync(cancellationToken));

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(BrandLookupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BrandLookupDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await brandService.GetByIdAsync(id, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(StatusCodes.Status404NotFound, result.Error!.Code, result.Error.Message);
        }

        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(BrandLookupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BrandLookupDto>> Create(
        [FromBody] BrandUpsertDto request,
        CancellationToken cancellationToken)
    {
        var created = await brandService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] BrandUpsertDto request,
        CancellationToken cancellationToken)
    {
        var result = await brandService.UpdateAsync(id, request, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(StatusCodes.Status404NotFound, result.Error!.Code, result.Error.Message);
        }

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await brandService.DeleteAsync(id, cancellationToken);
        if (!result.Success)
        {
            var statusCode = result.Error!.Code == ApiErrorCode.BrandInUse
                ? StatusCodes.Status400BadRequest
                : StatusCodes.Status404NotFound;
            return ApiResponses.Error(statusCode, result.Error.Code, result.Error.Message);
        }

        return NoContent();
    }
}
