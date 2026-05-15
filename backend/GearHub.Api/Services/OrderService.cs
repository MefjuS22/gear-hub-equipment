using GearHub.Api.Authorization;
using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using GearHub.Api.Repositories;
using GearHub.Api.Responses;
using Microsoft.AspNetCore.Identity;

namespace GearHub.Api.Services;

public class OrderService(
    ApplicationDbContext dbContext,
    IOrderRepository orderRepository,
    UserManager<ApplicationUser> userManager) : IOrderService
{
    public async Task<IReadOnlyList<RentalOrderListDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var orders = await orderRepository.GetAllOrdersWithDetailsAsync(cancellationToken);
        return orders.Select(ToListDto).ToList();
    }

    public async Task<ServiceResult<RentalOrderListDto>> GetByIdForViewerAsync(
        int orderId,
        int viewerUserId,
        CancellationToken cancellationToken = default)
    {
        var viewer = await userManager.FindByIdAsync(viewerUserId.ToString());
        if (viewer is null)
        {
            return ServiceResult<RentalOrderListDto>.Fail(
                ApiErrorCode.OrderUserNotFound,
                "User not found.");
        }

        var isAdmin = await userManager.IsInRoleAsync(viewer, AppRoles.Admin);

        var order = await orderRepository.GetOrderByIdWithDetailsAsync(orderId, cancellationToken);
        if (order is null)
        {
            return ServiceResult<RentalOrderListDto>.Fail(ApiErrorCode.OrderNotFound, "Order not found.");
        }

        if (!isAdmin && order.UserId != viewerUserId)
        {
            return ServiceResult<RentalOrderListDto>.Fail(
                ApiErrorCode.AuthForbidden,
                "You do not have access to this order.");
        }

        return ServiceResult<RentalOrderListDto>.Ok(ToListDto(order));
    }

    public async Task<OrderCreationResult> CreateOrderAsync(
        OrderCreateDto request,
        int userId,
        CancellationToken cancellationToken = default)
    {
        if (!await orderRepository.UserExistsAsync(userId, cancellationToken))
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

        int customerId;
        if (request.CustomerId is int existingId and > 0)
        {
            if (!await orderRepository.CustomerExistsAsync(existingId, cancellationToken))
            {
                await transaction.RollbackAsync(cancellationToken);
                return OrderCreationResult.Failed(ApiErrorCode.OrderCustomerNotFound, "Customer not found.");
            }

            customerId = existingId;
        }
        else
        {
            var company = request.CompanyName!.Trim();
            var contact = request.ContactPerson!.Trim();
            var customer = new Customer
            {
                CompanyName = company,
                ContactPerson = contact,
            };
            dbContext.Customers.Add(customer);
            await dbContext.SaveChangesAsync(cancellationToken);
            customerId = customer.Id;
        }

        var order = new RentalOrder
        {
            CustomerId = customerId,
            UserId = userId,
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
            UserName = order.User?.DisplayName ?? string.Empty,
            UserEmail = order.User?.Email ?? string.Empty,
            OrderDate = order.OrderDate,
            RentalStartDate = order.RentalStartDate,
            RentalEndDate = order.RentalEndDate,
            Items = items,
        };
    }
}
