using GearHub.Api.Models;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController(ICustomerService customerService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await customerService.GetAllAsync(cancellationToken));
}
