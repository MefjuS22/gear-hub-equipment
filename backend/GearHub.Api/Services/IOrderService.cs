using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IOrderService
{
    Task<IReadOnlyList<RentalOrderListDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<OrderCreationResult> CreateOrderAsync(
        OrderCreateDto request,
        int userId,
        CancellationToken cancellationToken = default);
}
