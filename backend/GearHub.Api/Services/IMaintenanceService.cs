using GearHub.Api.DTOs;
using GearHub.Api.Responses;

namespace GearHub.Api.Services;

public interface IMaintenanceService
{
    Task<PagedResultDto<MaintenanceDto>> GetAllAsync(PaginationQuery pagination, CancellationToken cancellationToken = default);
    Task<MaintenanceDto> CreateAsync(MaintenanceUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
