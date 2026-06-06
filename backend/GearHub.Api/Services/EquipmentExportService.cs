using ClosedXML.Excel;
using GearHub.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GearHub.Api.Services;

public class EquipmentExportService(ApplicationDbContext dbContext) : IEquipmentExportService
{
    public async Task<byte[]> ExportCatalogExcelAsync(CancellationToken cancellationToken = default)
    {
        var equipment = await dbContext.Equipment
            .AsNoTracking()
            .Include(item => item.Category)
            .Include(item => item.Brand)
            .Include(item => item.Warehouse)
            .OrderBy(item => item.Name)
            .ToListAsync(cancellationToken);

        using var workbook = new XLWorkbook();

        var infoSheet = workbook.Worksheets.Add("Info");
        infoSheet.Cell(1, 1).Value = "Generated (UTC)";
        infoSheet.Cell(1, 2).Value = DateTime.UtcNow;
        infoSheet.Cell(2, 1).Value = "Equipment count";
        infoSheet.Cell(2, 2).Value = equipment.Count;
        infoSheet.Row(1).Style.Font.Bold = true;
        infoSheet.Row(2).Style.Font.Bold = true;
        ExcelExportHelper.FinishSheet(infoSheet);

        var sheet = workbook.Worksheets.Add("Equipment");
        ExcelExportHelper.WriteTableHeader(
            sheet,
            "ID",
            "Name",
            "Category",
            "Brand",
            "Warehouse",
            "Daily rate",
            "Available");

        var row = 2;
        foreach (var item in equipment)
        {
            sheet.Cell(row, 1).Value = item.Id;
            sheet.Cell(row, 2).Value = item.Name;
            sheet.Cell(row, 3).Value = item.Category?.Name ?? "—";
            sheet.Cell(row, 4).Value = item.Brand?.Name ?? "—";
            sheet.Cell(row, 5).Value = item.Warehouse?.Name ?? "—";
            sheet.Cell(row, 6).Value = item.DailyRate;
            sheet.Cell(row, 6).Style.NumberFormat.Format = "#,##0.00";
            sheet.Cell(row, 7).Value = item.IsAvailable ? "Yes" : "No";
            row++;
        }

        ExcelExportHelper.FinishSheet(sheet);
        return ExcelExportHelper.SaveWorkbook(workbook);
    }
}
