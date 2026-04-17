using GearHub.Api.Data;
using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Repositories;

public class OrderRepository(ApplicationDbContext dbContext) : IOrderRepository
{
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

    public async Task<bool> TryReserveEquipmentAsync(
        IEnumerable<int> equipmentIds,
        CancellationToken cancellationToken = default)
    {
        foreach (var equipmentId in equipmentIds.Distinct())
        {
            var affectedRows = await dbContext.Equipment
                .Where(item => item.Id == equipmentId && item.IsAvailable)
                .ExecuteUpdateAsync(
                    setters => setters.SetProperty(item => item.IsAvailable, false),
                    cancellationToken);

            if (affectedRows == 0)
            {
                return false;
            }
        }

        return true;
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
