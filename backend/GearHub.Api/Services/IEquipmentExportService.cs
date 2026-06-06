namespace GearHub.Api.Services;

public interface IEquipmentExportService
{
    Task<byte[]> ExportCatalogExcelAsync(CancellationToken cancellationToken = default);
}
