using GearHub.Api.DTOs;
using GearHub.Api.Models;

namespace GearHub.Api.Repositories;

public interface IOrderRepository
{
    Task<(List<RentalOrder> Items, int TotalCount)> GetOrdersPageWithDetailsAsync(
        OrderListQuery query,
        int skip,
        int take,
        CancellationToken cancellationToken = default);

    Task<List<RentalOrder>> GetFilteredOrdersWithDetailsAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default);

    Task<RentalOrder?> GetOrderByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);

    Task<bool> CustomerExistsAsync(int customerId, CancellationToken cancellationToken = default);
    Task<Customer?> FindCustomerByCompanyNameAsync(
        string companyName,
        CancellationToken cancellationToken = default);
    Task<bool> UserExistsAsync(int userId, CancellationToken cancellationToken = default);
    Task<Dictionary<int, Equipment>> GetEquipmentMapAsync(IEnumerable<int> equipmentIds, CancellationToken cancellationToken = default);
    Task<bool> IsEquipmentAvailableForPeriodAsync(
        IEnumerable<int> equipmentIds,
        DateTime rentalStartUtc,
        DateTime rentalEndUtc,
        CancellationToken cancellationToken = default);
    Task<RentalOrder> CreateOrderWithItemsAsync(
        RentalOrder order,
        IReadOnlyCollection<RentalOrderItem> items,
        CancellationToken cancellationToken = default);
}
