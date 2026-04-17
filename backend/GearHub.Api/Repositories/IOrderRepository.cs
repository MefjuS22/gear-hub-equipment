using GearHub.Api.Models;

namespace GearHub.Api.Repositories;

public interface IOrderRepository
{
    Task<bool> CustomerExistsAsync(int customerId, CancellationToken cancellationToken = default);
    Task<bool> UserExistsAsync(int userId, CancellationToken cancellationToken = default);
    Task<Dictionary<int, Equipment>> GetEquipmentMapAsync(IEnumerable<int> equipmentIds, CancellationToken cancellationToken = default);
    Task<bool> TryReserveEquipmentAsync(IEnumerable<int> equipmentIds, CancellationToken cancellationToken = default);
    Task<RentalOrder> CreateOrderWithItemsAsync(
        RentalOrder order,
        IReadOnlyCollection<RentalOrderItem> items,
        CancellationToken cancellationToken = default);
}
