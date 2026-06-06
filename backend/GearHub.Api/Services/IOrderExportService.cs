using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IOrderExportService
{
    Task<byte[]> ExportOrdersListPdfAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default);

    Task<byte[]> ExportOrdersListExcelAsync(
        OrderListQuery query,
        CancellationToken cancellationToken = default);

    Task<byte[]?> ExportOrderPdfAsync(int orderId, CancellationToken cancellationToken = default);
}
