using GearHub.Api.Authorization;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class CustomerController(
    ICustomerService customerService,
    ICustomerExportService customerExportService) : ControllerBase
{
    [HttpGet]
    [HasPermission(AppPermissions.CustomersRead)]
    [ProducesResponseType(typeof(PagedResultDto<Customer>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<Customer>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await customerService.GetAllAsync(pagination, cancellationToken));

    [HttpGet("mine")]
    [ProducesResponseType(typeof(IReadOnlyList<CustomerCheckoutOptionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CustomerCheckoutOptionDto>>> GetMine(
        CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        return Ok(await customerService.GetCheckoutOptionsForUserAsync(userId, cancellationToken));
    }

    [HttpGet("export/excel")]
    [HasPermission(AppPermissions.CustomersRead)]
    [Produces("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportExcel(CancellationToken cancellationToken)
    {
        var bytes = await customerExportService.ExportCustomersExcelAsync(cancellationToken);
        var fileName = $"gearhub-customers-{DateTime.UtcNow:yyyyMMdd-HHmm}.xlsx";
        return File(
            bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }
}
