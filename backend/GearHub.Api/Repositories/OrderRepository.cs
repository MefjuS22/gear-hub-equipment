using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Repositories;

public class OrderRepository(ApplicationDbContext dbContext) : IOrderRepository
{
    public async Task<(List<RentalOrder> Items, int TotalCount)> GetOrdersPageWithDetailsAsync(
        OrderListQuery query,
        int skip,
        int take,
        CancellationToken cancellationToken = default)
    {
        var orderQuery = BuildFilteredQuery(query).OrderByDescending(order => order.OrderDate);
        var totalCount = await orderQuery.CountAsync(cancellationToken);
        var items = await orderQuery.Skip(skip).Take(take).ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    public async Task<List<RentalOrder>> GetFilteredOrdersWithDetailsAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default)
    {
        return await BuildFilteredQuery(query)
            .OrderByDescending(order => order.OrderDate)
            .ToListAsync(cancellationToken);
    }

    private IQueryable<RentalOrder> BuildFilteredQuery(OrderListQuery query)
    {
        var orderQuery = dbContext.RentalOrders
            .AsNoTracking()
            .Include(order => order.Customer)
            .Include(order => order.User)
            .Include(order => order.Items)
            .ThenInclude(item => item.Equipment)
            .AsQueryable();

        if (query.CustomerId is int customerId and > 0)
        {
            orderQuery = orderQuery.Where(order => order.CustomerId == customerId);
        }

        if (query.OrderDateFrom is DateTime from)
        {
            var start = DateTime.SpecifyKind(from.Date, DateTimeKind.Utc);
            orderQuery = orderQuery.Where(order => order.OrderDate >= start);
        }

        if (query.OrderDateTo is DateTime to)
        {
            var endExclusive = DateTime.SpecifyKind(to.Date.AddDays(1), DateTimeKind.Utc);
            orderQuery = orderQuery.Where(order => order.OrderDate < endExclusive);
        }

        var search = query.Search?.Trim();
        if (!string.IsNullOrEmpty(search))
        {
            var pattern = $"%{search}%";
            if (int.TryParse(search, out var orderId))
            {
                orderQuery = orderQuery.Where(order =>
                    order.Id == orderId ||
                    (order.Customer != null && EF.Functions.ILike(order.Customer.CompanyName, pattern)) ||
                    (order.User != null && EF.Functions.ILike(order.User.DisplayName, pattern)) ||
                    (order.User != null && order.User.Email != null &&
                     EF.Functions.ILike(order.User.Email, pattern)));
            }
            else
            {
                orderQuery = orderQuery.Where(order =>
                    (order.Customer != null && EF.Functions.ILike(order.Customer.CompanyName, pattern)) ||
                    (order.User != null && EF.Functions.ILike(order.User.DisplayName, pattern)) ||
                    (order.User != null && order.User.Email != null &&
                     EF.Functions.ILike(order.User.Email, pattern)));
            }
        }

        return orderQuery;
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

    public async Task<Customer?> FindCustomerByCompanyNameAsync(
        string companyName,
        CancellationToken cancellationToken = default)
    {
        var trimmed = companyName.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            return null;
        }

        return await dbContext.Customers
            .FirstOrDefaultAsync(
                customer => EF.Functions.ILike(customer.CompanyName, trimmed),
                cancellationToken);
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
