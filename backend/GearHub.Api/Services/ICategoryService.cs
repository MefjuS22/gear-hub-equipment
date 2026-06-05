using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface ICategoryService
{
    Task<PagedResultDto<CategoryLookupDto>> GetAllAsync(
        PaginationQuery pagination,
        CancellationToken cancellationToken = default);
    Task<ServiceResult<CategoryLookupDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<CategoryLookupDto> CreateAsync(CategoryUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> UpdateAsync(int id, CategoryUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
