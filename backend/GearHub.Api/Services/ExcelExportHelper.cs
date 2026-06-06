using ClosedXML.Excel;

namespace GearHub.Api.Services;

internal static class ExcelExportHelper
{
    public static void WriteTableHeader(IXLWorksheet sheet, params string[] headers)
    {
        for (var column = 1; column <= headers.Length; column++)
        {
            sheet.Cell(1, column).Value = headers[column - 1];
        }

        sheet.Row(1).Style.Font.Bold = true;
    }

    public static void FinishSheet(IXLWorksheet sheet) => sheet.Columns().AdjustToContents();

    public static byte[] SaveWorkbook(XLWorkbook workbook)
    {
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
