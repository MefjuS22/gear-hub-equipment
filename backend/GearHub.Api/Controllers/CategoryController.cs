using GearHub.Api.Data;
using GearHub.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryLookupDto>>> GetAll(CancellationToken cancellationToken)
    {
        var categories = await dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .ToListAsync(cancellationToken);

        return Ok(categories.Select(category => new CategoryLookupDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description
        }));
    }
}
