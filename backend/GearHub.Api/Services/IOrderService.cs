using GearHub.Api.DTOs;
using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public interface IOrderService
{
    Task<IReadOnlyList<RentalOrderListDto>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<ServiceResult<RentalOrderListDto>> GetByIdForViewerAsync(
        int orderId,
        int viewerUserId,
        CancellationToken cancellationToken = default);

    Task<OrderCreationResult> CreateOrderAsync(
        OrderCreateDto request,
        int userId,
        CancellationToken cancellationToken = default);
}
