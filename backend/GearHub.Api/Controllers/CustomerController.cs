using GearHub.Api.Data;
using GearHub.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController(ApplicationDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetAll(CancellationToken cancellationToken)
    {
        var customers = await dbContext.Customers
            .OrderBy(customer => customer.CompanyName)
            .ToListAsync(cancellationToken);

        return Ok(customers);
    }
}
