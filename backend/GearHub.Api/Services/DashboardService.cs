using ClosedXML.Excel;
using GearHub.Api.Data;
using GearHub.Api.DTOs;
using GearHub.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class DashboardService(ApplicationDbContext dbContext) : IDashboardService
{
    public async Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var last24Hours = now.AddHours(-24);
        var last30Days = now.Date.AddDays(-29);

        var equipmentNames = await dbContext.Equipment
            .AsNoTracking()
            .ToDictionaryAsync(item => item.Id, item => item.Name, cancellationToken);

        var orders = await dbContext.RentalOrders
            .AsNoTracking()
            .Include(order => order.Items)
            .ThenInclude(item => item.Equipment)
            .ToListAsync(cancellationToken);

        var ordersLast30 = orders.Where(order => order.OrderDate >= last30Days).ToList();

        var summary = new DashboardSummaryDto
        {
            TotalOrders = orders.Count,
            OrdersLast30Days = ordersLast30.Count,
            TotalCustomers = await dbContext.Customers.CountAsync(cancellationToken),
            TotalEquipment = await dbContext.Equipment.CountAsync(cancellationToken),
            AvailableEquipment = await dbContext.Equipment.CountAsync(
                item => item.IsAvailable,
                cancellationToken),
            LoginsLast24Hours = await dbContext.LoginEvents.CountAsync(
                login => login.Success && login.LoggedInAtUtc >= last24Hours,
                cancellationToken),
            UniqueUsersLoggedInLast24Hours = await dbContext.LoginEvents
                .Where(login => login.Success && login.LoggedInAtUtc >= last24Hours && login.UserId != null)
                .Select(login => login.UserId)
                .Distinct()
                .CountAsync(cancellationToken),
            EstimatedRevenueLast30Days = ordersLast30.Sum(OrderStatsHelper.EstimatedTotal),
        };

        var ordersByDay = Enumerable.Range(0, 30)
            .Select(offset =>
            {
                var day = last30Days.AddDays(offset);
                var count = ordersLast30.Count(order => order.OrderDate.Date == day);
                return new DashboardChartPointDto
                {
                    Label = day.ToString("MM-dd"),
                    Value = count,
                };
            })
            .ToList();

        var revenueByDay = Enumerable.Range(0, 30)
            .Select(offset =>
            {
                var day = last30Days.AddDays(offset);
                var revenue = ordersLast30
                    .Where(order => order.OrderDate.Date == day)
                    .Sum(OrderStatsHelper.EstimatedTotal);
                return new DashboardChartPointDto
                {
                    Label = day.ToString("MM-dd"),
                    Value = revenue,
                };
            })
            .ToList();

        var topEquipment = ordersLast30
            .SelectMany(order => order.Items)
            .GroupBy(item => item.EquipmentId)
            .Select(group => new DashboardChartPointDto
            {
                Label = group.First().Equipment?.Name
                    ?? equipmentNames.GetValueOrDefault(group.Key)
                    ?? $"Equipment #{group.Key}",
                Value = group.Sum(item => item.Quantity),
            })
            .OrderByDescending(point => point.Value)
            .Take(8)
            .ToList();

        var loginsLast7Days = now.Date.AddDays(-6);
        var loginEvents = await dbContext.LoginEvents
            .AsNoTracking()
            .Where(login => login.Success && login.LoggedInAtUtc >= loginsLast7Days)
            .ToListAsync(cancellationToken);

        var loginsByDay = Enumerable.Range(0, 7)
            .Select(offset =>
            {
                var day = loginsLast7Days.AddDays(offset);
                var count = loginEvents.Count(login => login.LoggedInAtUtc.Date == day);
                return new DashboardChartPointDto
                {
                    Label = day.ToString("MM-dd"),
                    Value = count,
                };
            })
            .ToList();

        return new DashboardStatsDto
        {
            Summary = summary,
            OrdersByDay = ordersByDay,
            RevenueByDay = revenueByDay,
            TopEquipment = topEquipment,
            LoginsByDay = loginsByDay,
        };
    }

    public async Task<byte[]> ExportStatsExcelAsync(CancellationToken cancellationToken = default)
    {
        var stats = await GetStatsAsync(cancellationToken);

        using var workbook = new XLWorkbook();

        var summarySheet = workbook.Worksheets.Add("Summary");
        summarySheet.Cell(1, 1).Value = "Metric";
        summarySheet.Cell(1, 2).Value = "Value";
        summarySheet.Row(1).Style.Font.Bold = true;

        var summaryRows = new (string Label, object Value)[]
        {
            ("Total orders", stats.Summary.TotalOrders),
            ("Orders (last 30 days)", stats.Summary.OrdersLast30Days),
            ("Estimated revenue (last 30 days)", stats.Summary.EstimatedRevenueLast30Days),
            ("Customers", stats.Summary.TotalCustomers),
            ("Equipment items", stats.Summary.TotalEquipment),
            ("Available equipment", stats.Summary.AvailableEquipment),
            ("Successful logins (last 24h)", stats.Summary.LoginsLast24Hours),
            ("Unique users logged in (last 24h)", stats.Summary.UniqueUsersLoggedInLast24Hours),
        };

        for (var i = 0; i < summaryRows.Length; i++)
        {
            summarySheet.Cell(i + 2, 1).Value = summaryRows[i].Label;
            summarySheet.Cell(i + 2, 2).Value = XLCellValue.FromObject(summaryRows[i].Value);
        }

        summarySheet.Columns().AdjustToContents();

        WriteChartSheet(workbook, "Orders by day", stats.OrdersByDay);
        WriteChartSheet(workbook, "Revenue by day", stats.RevenueByDay);
        WriteChartSheet(workbook, "Top equipment", stats.TopEquipment);
        WriteChartSheet(workbook, "Logins by day", stats.LoginsByDay);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void WriteChartSheet(
        XLWorkbook workbook,
        string sheetName,
        IReadOnlyList<DashboardChartPointDto> points)
    {
        var sheet = workbook.Worksheets.Add(sheetName);
        sheet.Cell(1, 1).Value = "Label";
        sheet.Cell(1, 2).Value = "Value";
        sheet.Row(1).Style.Font.Bold = true;

        for (var i = 0; i < points.Count; i++)
        {
            sheet.Cell(i + 2, 1).Value = points[i].Label;
            sheet.Cell(i + 2, 2).Value = points[i].Value;
        }

        sheet.Columns().AdjustToContents();
    }
}
