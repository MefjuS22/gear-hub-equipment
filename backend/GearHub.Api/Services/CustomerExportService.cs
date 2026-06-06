using ClosedXML.Excel;
using GearHub.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class CustomerExportService(ApplicationDbContext dbContext) : ICustomerExportService
{
    public async Task<byte[]> ExportCustomersExcelAsync(CancellationToken cancellationToken = default)
    {
        var customers = await dbContext.Customers
            .AsNoTracking()
            .OrderBy(customer => customer.CompanyName)
            .ToListAsync(cancellationToken);

        var orders = await dbContext.RentalOrders
            .AsNoTracking()
            .Include(order => order.Items)
            .ToListAsync(cancellationToken);

        var statsByCustomer = orders
            .GroupBy(order => order.CustomerId)
            .ToDictionary(
                group => group.Key,
                group => new CustomerOrderStats(
                    group.Count(),
                    group.Max(order => order.OrderDate),
                    group.Sum(OrderStatsHelper.EstimatedTotal)));

        using var workbook = new XLWorkbook();

        var infoSheet = workbook.Worksheets.Add("Info");
        infoSheet.Cell(1, 1).Value = "Generated (UTC)";
        infoSheet.Cell(1, 2).Value = DateTime.UtcNow;
        infoSheet.Cell(2, 1).Value = "Customer count";
        infoSheet.Cell(2, 2).Value = customers.Count;
        infoSheet.Row(1).Style.Font.Bold = true;
        infoSheet.Row(2).Style.Font.Bold = true;
        ExcelExportHelper.FinishSheet(infoSheet);

        var sheet = workbook.Worksheets.Add("Customers");
        ExcelExportHelper.WriteTableHeader(
            sheet,
            "ID",
            "Company",
            "Contact person",
            "Order count",
            "Last order date",
            "Total revenue");

        var row = 2;
        foreach (var customer in customers)
        {
            statsByCustomer.TryGetValue(customer.Id, out var stats);

            sheet.Cell(row, 1).Value = customer.Id;
            sheet.Cell(row, 2).Value = customer.CompanyName;
            sheet.Cell(row, 3).Value = customer.ContactPerson;
            sheet.Cell(row, 4).Value = stats?.OrderCount ?? 0;

            if (stats?.LastOrderDate is DateTime lastOrderDate)
            {
                sheet.Cell(row, 5).Value = lastOrderDate;
                sheet.Cell(row, 5).Style.DateFormat.Format = "yyyy-mm-dd";
            }
            else
            {
                sheet.Cell(row, 5).Value = "—";
            }

            sheet.Cell(row, 6).Value = stats?.TotalEstimatedRevenue ?? 0m;
            sheet.Cell(row, 6).Style.NumberFormat.Format = "#,##0.00";
            row++;
        }

        ExcelExportHelper.FinishSheet(sheet);
        return ExcelExportHelper.SaveWorkbook(workbook);
    }

    private sealed record CustomerOrderStats(
        int OrderCount,
        DateTime LastOrderDate,
        decimal TotalEstimatedRevenue);
}
