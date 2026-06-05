using GearHub.Api.DTOs;
using GearHub.Api.Models;

namespace GearHub.Api.Repositories;

public interface IEquipmentRepository
{
    Task<(List<Equipment> Items, int TotalCount)> GetPageAsync(
        EquipmentListQuery query,
        int skip,
        int take,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetCatalogCategoryNamesAsync(
        CancellationToken cancellationToken = default);
    Task<Equipment?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Equipment> CreateAsync(Equipment equipment, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Equipment equipment, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> RelatedEntitiesExistAsync(
        int categoryId,
        int brandId,
        int warehouseId,
        CancellationToken cancellationToken = default);
}
