using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IWarehouseService
{
    Task<PagedResultDto<WarehouseLookupDto>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<WarehouseLookupDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<WarehouseLookupDto> CreateAsync(WarehouseUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> UpdateAsync(int id, WarehouseUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
