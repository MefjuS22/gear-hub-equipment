using GearHub.Api.DTOs;

namespace GearHub.Api.Services;

public interface IEquipmentService
{
    Task<IReadOnlyList<EquipmentDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ServiceResult<EquipmentDto>> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ServiceResult<EquipmentDto>> CreateAsync(EquipmentUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> UpdateAsync(int id, EquipmentUpsertDto request, CancellationToken cancellationToken = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
