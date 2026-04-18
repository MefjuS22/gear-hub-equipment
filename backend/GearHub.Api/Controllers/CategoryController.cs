using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CategoryLookupDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<CategoryLookupDto>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return Ok(categories.Select(ToLookupDto).ToList());
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(CategoryLookupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryLookupDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

        if (category is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.CategoryNotFound,
                $"Category with id {id} was not found.");
        }

        return Ok(ToLookupDto(category));
    }

    [HttpPost]
    [ProducesResponseType(typeof(CategoryLookupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CategoryLookupDto>> Create(
        [FromBody] CategoryUpsertDto request,
        CancellationToken cancellationToken)
    {
        var entity = new Models.Category
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
        };
        dbContext.Categories.Add(entity);
        await dbContext.SaveChangesAsync(cancellationToken);

        var dto = ToLookupDto(entity);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] CategoryUpsertDto request,
        CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.CategoryNotFound,
                $"Category with id {id} was not found.");
        }

        category.Name = request.Name.Trim();
        category.Description = request.Description.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var category = await dbContext.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (category is null)
        {
            return ApiResponses.Error(
                StatusCodes.Status404NotFound,
                ApiErrorCode.CategoryNotFound,
                $"Category with id {id} was not found.");
        }

        var inUse = await dbContext.Equipment.AnyAsync(e => e.CategoryId == id, cancellationToken);
        if (inUse)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                ApiErrorCode.CategoryInUse,
                "This category is still assigned to one or more equipment items.");
        }

        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static CategoryLookupDto ToLookupDto(Models.Category category) =>
        new()
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
        };
}
