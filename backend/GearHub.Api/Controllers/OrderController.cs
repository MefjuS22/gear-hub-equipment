using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
public class OrderController(IOrderService orderService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RentalOrderListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<RentalOrderListDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await orderService.GetAllAsync(cancellationToken));

    [HttpPost("CreateOrder")]
    [ProducesResponseType(typeof(RentalOrder), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto request, CancellationToken cancellationToken)
    {
        var result = await orderService.CreateOrderAsync(request, cancellationToken);
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
