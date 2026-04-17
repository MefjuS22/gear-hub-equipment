using GearHub.Api.DTOs;
using GearHub.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GearHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController(IOrderService orderService) : ControllerBase
{
    [HttpPost("CreateOrder")]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto request, CancellationToken cancellationToken)
    {
        var result = await orderService.CreateOrderAsync(request, cancellationToken);
        if (!result.Success)
        {
            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(CreateOrder), new { id = result.Order!.Id }, result.Order);
    }
}
