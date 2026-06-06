namespace GearHub.Api.Services;

public interface ICustomerExportService
{
    Task<byte[]> ExportCustomersExcelAsync(CancellationToken cancellationToken = default);
}
