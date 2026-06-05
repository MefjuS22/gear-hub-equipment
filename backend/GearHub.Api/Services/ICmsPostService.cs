using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface ICmsPostService
{
    Task<PagedResultDto<CmsPostListDto>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostDetailDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResultDto<CmsPostPublicSummaryDto>> GetPublishedAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostPublicDetailDto>> GetPublishedBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostDetailDto>> CreateAsync(CmsPostUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult<CmsPostDetailDto>> UpdateAsync(Guid id, CmsPostUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
