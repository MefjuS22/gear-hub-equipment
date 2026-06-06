using GearHub.Api.Models;

namespace GearHub.Api.Services;

internal static class OrderStatsHelper
{
    public static int RentalDays(RentalOrder order)
    {
        var days = (order.RentalEndDate.Date - order.RentalStartDate.Date).Days;
        return Math.Max(1, days);
    }

    public static decimal EstimatedTotal(RentalOrder order)
    {
        var days = RentalDays(order);
        return order.Items.Sum(item => item.Quantity * item.UnitPrice * days);
    }
}
