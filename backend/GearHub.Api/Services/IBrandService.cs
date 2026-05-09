using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IBrandService
{
    Task<IReadOnlyList<BrandLookupDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ServiceResult<BrandLookupDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<BrandLookupDto> CreateAsync(BrandUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> UpdateAsync(int id, BrandUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
