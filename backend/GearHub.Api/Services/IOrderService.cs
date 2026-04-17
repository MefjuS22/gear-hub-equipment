using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IOrderService
{
    Task<OrderCreationResult> CreateOrderAsync(OrderCreateDto request, CancellationToken cancellationToken = default);
}
