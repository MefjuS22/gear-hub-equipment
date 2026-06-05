using GearHub.Api.Authorization;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class OrderController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    [HasPermission(AppPermissions.OrdersRead)]
    [ProducesResponseType(typeof(PagedResultDto<RentalOrderListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResultDto<RentalOrderListDto>>> GetAll(
        [FromQuery] PaginationQuery pagination,
        CancellationToken cancellationToken) =>
        Ok(await orderService.GetAllAsync(pagination, cancellationToken));

    /// <summary>
    /// Order detail for the placing user or a user with the Admin role (resolved from the database).
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(RentalOrderListDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var result = await orderService.GetByIdForViewerAsync(id, userId, cancellationToken);
        if (!result.Success)
        {
            var err = result.Error!;
            return err.Code switch
            {
                ApiErrorCode.OrderNotFound => ApiResponses.Error(
                    StatusCodes.Status404NotFound,
                    err.Code,
                    err.Message),
                ApiErrorCode.AuthForbidden => ApiResponses.Error(
                    StatusCodes.Status403Forbidden,
                    err.Code,
                    err.Message),
                ApiErrorCode.OrderUserNotFound => ApiResponses.Error(
                    StatusCodes.Status401Unauthorized,
                    err.Code,
                    err.Message),
                _ => ApiResponses.Error(StatusCodes.Status400BadRequest, err.Code, err.Message),
            };
        }

        return Ok(result.Value);
    }

    [HttpPost("CreateOrder")]
    [HasPermission(AppPermissions.OrdersCreate)]
    [ProducesResponseType(typeof(RentalOrder), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto request, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var result = await orderService.CreateOrderAsync(request, userId, cancellationToken);
        if (!result.Success)
        {
            return ApiResponses.Error(
                StatusCodes.Status400BadRequest,
                result.ErrorCode ?? ApiErrorCode.Unknown,
                result.ErrorMessage ?? "Request failed.");
        }

        return CreatedAtAction(nameof(CreateOrder), new { id = result.Order!.Id }, result.Order);
    }
}
