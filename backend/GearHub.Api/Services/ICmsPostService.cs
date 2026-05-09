using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface ICmsPostService
{
    Task<IReadOnlyList<CmsPostListDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CmsPostPublicSummaryDto>> GetPublishedAsync(CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostPublicDetailDto>> GetPublishedBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostDetailDto>> CreateAsync(CmsPostUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostDetailDto>> UpdateAsync(Guid id, CmsPostUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
