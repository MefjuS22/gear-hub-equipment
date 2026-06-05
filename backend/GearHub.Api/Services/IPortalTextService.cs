using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IPortalTextService
{
    Task<PagedResultDto<PortalTextDto>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<PortalTextDto>> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<PagedResultDto<PortalTextPublicDto>> GetPublicAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<PortalTextDto>> UpdateAsync(string key, PortalTextUpsertDto request, CancellationToken cancellationToken = default);
}
