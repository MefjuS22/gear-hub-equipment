using GearHub.Api.Data;
using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Repositories;

public class OrderRepository(ApplicationDbContext dbContext) : IOrderRepository
{
    public async Task<(List<RentalOrder> Items, int TotalCount)> GetOrdersPageWithDetailsAsync(
        int skip,
        int take,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.RentalOrders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.User)
            .Include(order => order.Items)
            .ThenInclude(item => item.Equipment)
            .OrderByDescending(order => order.OrderDate);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip(skip).Take(take).ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    public async Task<RentalOrder?> GetOrderByIdWithDetailsAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.RentalOrders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.User)
            .Include(order => order.Items)
            .ThenInclude(item => item.Equipment)
            .FirstOrDefaultAsync(order => order.Id == id, cancellationToken);
    }

    public async Task<bool> CustomerExistsAsync(int customerId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Customers.AnyAsync(customer => customer.Id == customerId, cancellationToken);
    }

    public async Task<bool> UserExistsAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users.AnyAsync(user => user.Id == userId, cancellationToken);
    }

    public async Task<Dictionary<int, Equipment>> GetEquipmentMapAsync(
        IEnumerable<int> equipmentIds,
        CancellationToken cancellationToken = default)
    {
        var distinctIds = equipmentIds.Distinct().ToList();
        return await dbContext.Equipment
            .Where(item => distinctIds.Contains(item.Id))
            .ToDictionaryAsync(item => item.Id, cancellationToken);
    }

    public async Task<bool> IsEquipmentAvailableForPeriodAsync(
        IEnumerable<int> equipmentIds,
        DateTime rentalStartUtc,
        DateTime rentalEndUtc,
        CancellationToken cancellationToken = default)
    {
        var distinctIds = equipmentIds.Distinct().ToList();

        var hasDisabledEquipment = await dbContext.Equipment
            .AnyAsync(
                item => distinctIds.Contains(item.Id) && !item.IsAvailable,
                cancellationToken);
        if (hasDisabledEquipment)
        {
            return false;
        }

        var hasOverlappingReservation = await dbContext.RentalOrderItems
            .AnyAsync(
                item =>
                    distinctIds.Contains(item.EquipmentId)
                    && item.RentalOrder != null
                    && item.RentalOrder.RentalStartDate < rentalEndUtc
                    && rentalStartUtc < item.RentalOrder.RentalEndDate,
                cancellationToken);

        return !hasOverlappingReservation;
    }

    public async Task<RentalOrder> CreateOrderWithItemsAsync(
        RentalOrder order,
        IReadOnlyCollection<RentalOrderItem> items,
        CancellationToken cancellationToken = default)
    {
        dbContext.RentalOrders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);

        dbContext.RentalOrderItems.AddRange(items);
        await dbContext.SaveChangesAsync(cancellationToken);

        return order;
    }
}
