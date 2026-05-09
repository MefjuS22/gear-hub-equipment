using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<BrandLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<BrandLookupDto>>> GetAll(CancellationToken cancellationToken)
    {
        var brands = await dbContext.Brands
            .AsNoTracking()
            .OrderBy(brand => brand.Name)
            .ToListAsync(cancellationToken);

        return Ok(brands.Select(ToLookupDto).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(BrandLookupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BrandLookupDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var brand = await dbContext.Brands
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (brand is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.BrandNotFound,
                $"Brand with id {id} was not found.");
        }

        return Ok(ToLookupDto(brand));
    }

    [HttpPost]
    [ProducesResponseType(typeof(BrandLookupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<BrandLookupDto>> Create(
        [FromBody] BrandUpsertDto request,
        CancellationToken cancellationToken)
    {
        var entity = new Models.Brand { Name = request.Name.Trim() };
        dbContext.Brands.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        var dto = new BrandLookupDto { Id = entity.Id, Name = entity.Name };
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] BrandUpsertDto request,
        CancellationToken cancellationToken)
    {
        var brand = await dbContext.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
        if (brand is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.BrandNotFound,
                $"Brand with id {id} was not found.");
        }

        brand.Name = request.Name.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var brand = await dbContext.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
        if (brand is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.BrandNotFound,
                $"Brand with id {id} was not found.");
        }

        var inUse = await dbContext.Equipment.AnyAsync(e => e.BrandId == id, cancellationToken);
        if (inUse)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.BrandInUse,
                "This brand is still assigned to one or more equipment items.");
        }

        dbContext.Brands.Remove(brand);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static BrandLookupDto ToLookupDto(Models.Brand brand) =>
        new() { Id = brand.Id, Name = brand.Name };
}
