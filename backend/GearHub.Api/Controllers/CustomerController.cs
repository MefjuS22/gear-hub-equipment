using GearHub.Api.Authorization;
using GearHub.Api.Models;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[HasPermission(AppPermissions.CustomersRead)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class CustomerController(ICustomerService customerService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Customer>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await customerService.GetAllAsync(cancellationToken));
}
