using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(CancellationToken cancellationToken = default);
    Task<byte[]> ExportStatsExcelAsync(CancellationToken cancellationToken = default);
}
