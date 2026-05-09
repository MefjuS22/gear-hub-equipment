using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Repositories;
using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public class OrderService(
    ApplicationDbContext dbContext,
    IOrderRepository orderRepository) : IOrderService
{
    public async Task<IReadOnlyList<RentalOrderListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetAllOrdersWithDetailsAsync(cancellationToken);
        return orders.Select(ToListDto).ToList();
    }

    public async Task<OrderCreationResult> CreateOrderAsync(
        OrderCreateDto request,
        CancellationToken cancellationToken = default)
    {
        if (!await orderRepository.CustomerExistsAsync(request.CustomerId, cancellationToken))
        {
            return OrderCreationResult.Failed(ApiErrorCode.OrderCustomerNotFound, "Customer not found.");
        }

        if (!await orderRepository.UserExistsAsync(request.UserId, cancellationToken))
        {
            return OrderCreationResult.Failed(ApiErrorCode.OrderUserNotFound, "User not found.");
        }

        var aggregatedItems = request.Items
            .GroupBy(item => item.EquipmentId)
            .Select(group => new OrderItemDto
            {
                EquipmentId = group.Key,
                Quantity = group.Sum(item => item.Quantity)
            })
            .ToList();

        var equipmentIds = aggregatedItems.Select(item => item.EquipmentId).ToList();
        var equipmentMap = await orderRepository.GetEquipmentMapAsync(equipmentIds, cancellationToken);

        if (equipmentMap.Count != equipmentIds.Distinct().Count())
        {
            return OrderCreationResult.Failed(
                ApiErrorCode.OrderEquipmentNotFound,
                "One or more equipment items were not found.");
        }

        var rentalStartUtc = NormalizeToUtc(request.RentalStartDate);
        var rentalEndUtc = NormalizeToUtc(request.RentalEndDate);

        var isAvailableForPeriod = await orderRepository.IsEquipmentAvailableForPeriodAsync(
            equipmentIds,
            rentalStartUtc,
            rentalEndUtc,
            cancellationToken);
        if (!isAvailableForPeriod)
        {
            return OrderCreationResult.Failed(
                ApiErrorCode.OrderEquipmentUnavailable,
                "One or more equipment items are unavailable for the selected rental period.");
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var order = new RentalOrder
        {
            CustomerId = request.CustomerId,
            UserId = request.UserId,
            OrderDate = DateTime.UtcNow,
            RentalStartDate = rentalStartUtc,
            RentalEndDate = rentalEndUtc
        };

        var items = aggregatedItems.Select(item => new RentalOrderItem
        {
            RentalOrder = order,
            EquipmentId = item.EquipmentId,
            Quantity = item.Quantity,
            UnitPrice = equipmentMap[item.EquipmentId].DailyRate
        }).ToList();

        var createdOrder = await orderRepository.CreateOrderWithItemsAsync(order, items, cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return OrderCreationResult.Created(createdOrder);
    }

    private static DateTime NormalizeToUtc(DateTime dateTime) =>
        dateTime.Kind switch
        {
            DateTimeKind.Utc => dateTime,
            DateTimeKind.Local => dateTime.ToUniversalTime(),
            _ => DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
        };

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
