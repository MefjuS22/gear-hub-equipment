using GearHub.Api.Data;
using GearHub.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BrandLookupDto>>> GetAll(CancellationToken cancellationToken)
    {
        var brands = await dbContext.Brands
            .AsNoTracking()
            .OrderBy(brand => brand.Name)
            .ToListAsync(cancellationToken);

        return Ok(brands.Select(brand => new BrandLookupDto
        {
            Id = brand.Id,
            Name = brand.Name
        }));
    }
}
