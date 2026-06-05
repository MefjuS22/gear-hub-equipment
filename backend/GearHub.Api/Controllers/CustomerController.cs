using GearHub.Api.Authorization;
using GearHub.Api.DTOs;
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
    [ProducesResponseType(typeof(PagedResultDto<Customer>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<Customer>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await customerService.GetAllAsync(pagination, cancellationToken));
}
