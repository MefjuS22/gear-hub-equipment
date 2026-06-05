using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IPortalTextService
{
    Task<IReadOnlyList<PortalTextDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ServiceResult<PortalTextDto>> GetByKeyAsync(string key, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PortalTextPublicDto>> GetPublicAsync(CancellationToken cancellationToken = default);
    Task<ServiceResult<PortalTextDto>> UpdateAsync(string key, PortalTextUpsertDto request, CancellationToken cancellationToken = default);
}
