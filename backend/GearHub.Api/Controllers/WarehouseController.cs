using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarehouseController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<WarehouseLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<WarehouseLookupDto>>> GetAll(CancellationToken cancellationToken)
    {
        var warehouses = await dbContext.Warehouses
            .AsNoTracking()
            .OrderBy(w => w.Name)
            .ToListAsync(cancellationToken);

        return Ok(warehouses.Select(ToLookupDto).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(WarehouseLookupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WarehouseLookupDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var warehouse = await dbContext.Warehouses
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id, cancellationToken);

        if (warehouse is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.WarehouseNotFound,
                $"Warehouse with id {id} was not found.");
        }

        return Ok(ToLookupDto(warehouse));
    }

    [HttpPost]
    [ProducesResponseType(typeof(WarehouseLookupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<WarehouseLookupDto>> Create(
        [FromBody] WarehouseUpsertDto request,
        CancellationToken cancellationToken)
    {
        var entity = new Models.Warehouse
        {
            Name = request.Name.Trim(),
            Location = request.Location.Trim(),
        };
        dbContext.Warehouses.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        var dto = ToLookupDto(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] WarehouseUpsertDto request,
        CancellationToken cancellationToken)
    {
        var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        if (warehouse is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.WarehouseNotFound,
                $"Warehouse with id {id} was not found.");
        }

        warehouse.Name = request.Name.Trim();
        warehouse.Location = request.Location.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var warehouse = await dbContext.Warehouses.FirstOrDefaultAsync(w => w.Id == id, cancellationToken);
        if (warehouse is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.WarehouseNotFound,
                $"Warehouse with id {id} was not found.");
        }

        var inUse = await dbContext.Equipment.AnyAsync(e => e.WarehouseId == id, cancellationToken);
        if (inUse)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.WarehouseInUse,
                "This warehouse is still assigned to one or more equipment items.");
        }

        dbContext.Warehouses.Remove(warehouse);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static WarehouseLookupDto ToLookupDto(Models.Warehouse warehouse) =>
        new()
        {
            Id = warehouse.Id,
            Name = warehouse.Name,
            Location = warehouse.Location,
        };
}
