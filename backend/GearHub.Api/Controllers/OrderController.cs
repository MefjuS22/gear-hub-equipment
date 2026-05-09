using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Repositories;
using GearHub.Api.Responses;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
public class OrderController(IOrderService orderService, IOrderRepository orderRepository) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RentalOrderListDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<RentalOrderListDto>>> GetAll(CancellationToken cancellationToken)
    {
        var orders = await orderRepository.GetAllOrdersWithDetailsAsync(cancellationToken);
        var list = orders.Select(ToListDto).ToList();
        return Ok(list);
    }

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

    private static RentalOrderListDto ToListDto(RentalOrder order)
    {
        var items = order.Items
            .Select(
                item => new RentalOrderLineDto
                {
                    EquipmentId = item.EquipmentId,
                    EquipmentName = item.Equipment?.Name ?? $"#{item.EquipmentId}",
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                })
            .ToList();

        return new RentalOrderListDto
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerCompanyName = order.Customer?.CompanyName ?? string.Empty,
            UserId = order.UserId,
            UserName = order.User?.Name ?? string.Empty,
            UserEmail = order.User?.Email ?? string.Empty,
            OrderDate = order.OrderDate,
            RentalStartDate = order.RentalStartDate,
            RentalEndDate = order.RentalEndDate,
            Items = items,
        };
    }
}
